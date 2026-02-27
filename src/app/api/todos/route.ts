import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';
import type { Todo } from '@prisma/client';

const createTodoSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  due_date: z.string().datetime().optional()
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

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') || 20)));
    const completedParam = searchParams.get('completed');

    const where: { ownerId: string; completed?: boolean } = { ownerId: userId };
    if (completedParam === 'true') where.completed = true;
    if (completedParam === 'false') where.completed = false;

    const [total, todos] = await Promise.all([
      db.todo.count({ where }),
      db.todo.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items: todos.map(formatTodo),
        total,
        page,
        limit
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch todos';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createTodoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 });
    }

    const { title, description, due_date } = parsed.data;

    const todo = await db.todo.create({
      data: {
        ownerId: userId,
        title,
        description: description || null,
        dueDate: due_date ? new Date(due_date) : null
      }
    });

    return NextResponse.json({ success: true, data: formatTodo(todo) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create todo';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
