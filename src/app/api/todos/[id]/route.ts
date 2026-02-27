import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';
import type { Todo } from '@prisma/client';

const updateTodoSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  completed: z.boolean().optional(),
  due_date: z.string().datetime().nullable().optional()
});

function getUserIdFromRequest(request: NextRequest): string | null {
  const token = getTokenFromHeader(request.headers.get('authorization'));
  if (!token) return null;
  try {
    const payload = verifyToken(token);
    return typeof payload.sub === 'string' ? payload.sub : null;
  } catch {
    return null;
  }
}

function formatTodo(todo: Todo) {
  return {
    id: todo.id,
    owner_id: todo.ownerId,
    title: todo.title,
    description: todo.description,
    completed: todo.completed,
    due_date: todo.dueDate ? todo.dueDate.toISOString() : null,
    created_at: todo.createdAt.toISOString(),
    updated_at: todo.updatedAt.toISOString()
  };
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const todo = await db.todo.findFirst({ where: { id: params.id, ownerId: userId } });

    if (!todo) {
      return NextResponse.json({ success: false, error: 'Todo not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: formatTodo(todo) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch todo';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateTodoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 });
    }

    const data: { title?: string; description?: string | null; completed?: boolean; dueDate?: Date | null } = {};

    if (parsed.data.title !== undefined) data.title = parsed.data.title;
    if (parsed.data.description !== undefined) data.description = parsed.data.description || null;
    if (parsed.data.completed !== undefined) data.completed = parsed.data.completed;
    if (parsed.data.due_date !== undefined) {
      data.dueDate = parsed.data.due_date ? new Date(parsed.data.due_date) : null;
    }

    const todo = await db.todo.update({
      where: { id: params.id },
      data
    });

    if (todo.ownerId !== userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: formatTodo(todo) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update todo';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const todo = await db.todo.findFirst({ where: { id: params.id, ownerId: userId } });
    if (!todo) {
      return NextResponse.json({ success: false, error: 'Todo not found' }, { status: 404 });
    }

    await db.todo.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete todo';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
