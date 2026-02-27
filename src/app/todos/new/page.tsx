'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';

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

export default function NewTodoPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const { error: apiError } = await fetchWithAuth('/api/todos', {
      method: 'POST',
      body: JSON.stringify({
        title,
        description: description || undefined,
        due_date: dueDate ? new Date(dueDate).toISOString() : undefined
      })
    });

    if (apiError) {
      setError(apiError || 'Unable to create todo.');
      setLoading(false);
      return;
    }

    toast('Todo created!', 'success');
    router.push('/dashboard');
  };

  if (authLoading) {
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
          <p className="text-sm text-secondary">Please log in to create a todo.</p>
          <Button>
            <Link href="/login">Go to login</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <Card>
        <CardHeader>
          <div>
            <h1 className="text-2xl font-semibold">Create a new todo</h1>
            <p className="text-sm text-secondary">Add a task to your dashboard.</p>
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
            {error && <p className="text-sm text-error">{error}</p>}
            <div className="flex items-center justify-between">
              <Button variant="outline" type="button" onClick={() => router.push('/dashboard')}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Create todo
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
