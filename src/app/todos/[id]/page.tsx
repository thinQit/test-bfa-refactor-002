'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';

interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  due_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

const fetchWithAuth = async <T,>(url: string, options?: RequestInit) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return { data: null as T | null, error: 'You are not logged in.' };
  }
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options?.headers || {})
      }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      return { data: null as T | null, error: err.error || err.message || res.statusText };
    }
    const data = (await res.json()) as T;
    return { data, error: null as string | null };
  } catch (error) {
    return { data: null as T | null, error: error instanceof Error ? error.message : 'Network error' };
  }
};

export default function EditTodoPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const todoId = params?.id as string;

  const [todo, setTodo] = useState<Todo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const loadTodo = async () => {
      setLoading(true);
      setError(null);
      const { data, error: apiError } = await fetchWithAuth<Todo>(`/api/todos/${todoId}`);
      if (apiError || !data) {
        setError(apiError || 'Unable to load todo.');
        setTodo(null);
        setLoading(false);
        return;
      }
      setTodo(data);
      setTitle(data.title);
      setDescription(data.description || '');
      setDueDate(data.due_date ? new Date(data.due_date).toISOString().split('T')[0] : '');
      setCompleted(data.completed);
      setLoading(false);
    };

    if (!authLoading) {
      loadTodo();
    }
  }, [todoId, authLoading]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const { data, error: apiError } = await fetchWithAuth<Todo>(`/api/todos/${todoId}`, {
      method: 'PUT',
      body: JSON.stringify({
        title,
        description: description || undefined,
        due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
        completed
      })
    });

    if (apiError || !data) {
      setError(apiError || 'Unable to save changes.');
      setSaving(false);
      return;
    }

    toast('Todo updated.', 'success');
    router.push('/dashboard');
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <h1 className="text-xl font-semibold">Login required</h1>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-secondary">Please log in to edit todos.</p>
          <Button>
            <Link href="/login">Go to login</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <h1 className="text-xl font-semibold">Unable to load todo</h1>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-error">{error}</p>
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Back to dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!todo) {
    return (
      <Card>
        <CardHeader>
          <h1 className="text-xl font-semibold">Todo not found</h1>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-secondary">This todo may have been deleted.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <Card>
        <CardHeader>
          <div>
            <h1 className="text-2xl font-semibold">Edit todo</h1>
            <p className="text-sm text-secondary">Update your task details.</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Title"
              name="title"
              value={title}
              onChange={event => setTitle(event.target.value)}
              required
            />
            <div className="space-y-1">
              <label htmlFor="description" className="block text-sm font-medium text-foreground">
                Description
              </label>
              <textarea
                id="description"
                className="min-h-[120px] w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={description}
                onChange={event => setDescription(event.target.value)}
              />
            </div>
            <Input
              label="Due date"
              name="dueDate"
              type="date"
              value={dueDate}
              onChange={event => setDueDate(event.target.value)}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border"
                checked={completed}
                onChange={event => setCompleted(event.target.checked)}
              />
              Mark as completed
            </label>
            {error && <p className="text-sm text-error">{error}</p>}
            <div className="flex items-center justify-between">
              <Button variant="outline" type="button" onClick={() => router.push('/dashboard')}>
                Cancel
              </Button>
              <Button type="submit" loading={saving}>
                Save changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
