'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
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

interface TodosResponse {
  items: Todo[];
  total: number;
  page: number;
  limit: number;
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

export default function DashboardPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [filter, setFilter] = useState<'all' | 'true' | 'false'>('all');

  const totalPages = useMemo(() => (todos.length === 0 ? 1 : Math.ceil(todos.length / limit)), [todos.length, limit]);

  const loadTodos = async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit)
    });
    if (filter !== 'all') {
      params.set('completed', filter);
    }

    const { data, error: apiError } = await fetchWithAuth<TodosResponse>(`/api/todos?${params.toString()}`);
    if (apiError || !data) {
      setError(apiError || 'Unable to load todos.');
      setTodos([]);
      setLoading(false);
      return;
    }

    setTodos(data.items || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading) {
      loadTodos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filter, authLoading]);

  const handleToggle = async (todo: Todo) => {
    const { data, error: apiError } = await fetchWithAuth<Todo>(`/api/todos/${todo.id}`, {
      method: 'PUT',
      body: JSON.stringify({ completed: !todo.completed })
    });

    if (apiError || !data) {
      toast(apiError || 'Unable to update todo.', 'error');
      return;
    }

    setTodos(prev => prev.map(item => (item.id === todo.id ? data : item)));
  };

  const handleDelete = async (todoId: string) => {
    const { error: apiError } = await fetchWithAuth<{ success: boolean }>(`/api/todos/${todoId}`, {
      method: 'DELETE'
    });

    if (apiError) {
      toast(apiError || 'Unable to delete todo.', 'error');
      return;
    }

    toast('Todo removed.', 'success');
    setTodos(prev => prev.filter(item => item.id !== todoId));
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
          <p className="text-sm text-secondary">Please log in to view your todos.</p>
          <Button>
            <Link href="/login">Go to login</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Todo Dashboard</h1>
          <p className="text-sm text-secondary">Manage your personal tasks.</p>
        </div>
        <Button>
          <Link href="/todos/new">New Todo</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="filter" className="text-sm font-medium text-foreground">
              Filter
            </label>
            <select
              id="filter"
              className="rounded-md border border-border px-3 py-2 text-sm"
              value={filter}
              onChange={event => {
                setPage(1);
                setFilter(event.target.value as 'all' | 'true' | 'false');
              }}
            >
              <option value="all">All</option>
              <option value="true">Completed</option>
              <option value="false">Active</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex min-h-[200px] items-center justify-center">
              <Spinner className="h-6 w-6" />
            </div>
          )}

          {!loading && error && <p className="text-sm text-error">{error}</p>}

          {!loading && !error && todos.length === 0 && (
            <div className="space-y-2 text-center">
              <p className="text-sm text-secondary">No todos yet.</p>
              <Button>
                <Link href="/todos/new">Create your first todo</Link>
              </Button>
            </div>
          )}

          {!loading && !error && todos.length > 0 && (
            <div className="space-y-4">
              {todos.map(todo => (
                <div key={todo.id} className="rounded-lg border border-border p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{todo.title}</h3>
                        <Badge variant={todo.completed ? 'success' : 'warning'}>
                          {todo.completed ? 'Completed' : 'Active'}
                        </Badge>
                      </div>
                      {todo.description && <p className="text-sm text-secondary">{todo.description}</p>}
                      <p className="text-xs text-secondary">
                        Created: {todo.created_at ? new Date(todo.created_at).toLocaleDateString() : 'N/A'}
                      </p>
                      <p className="text-xs text-secondary">
                        Due: {todo.due_date ? new Date(todo.due_date).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleToggle(todo)}>
                        {todo.completed ? 'Mark active' : 'Mark done'}
                      </Button>
                      <Button variant="secondary" size="sm">
                        <Link href={`/todos/${todo.id}`}>Edit</Link>
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(todo.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1}
          onClick={() => setPage(prev => Math.max(1, prev - 1))}
        >
          Previous
        </Button>
        <span className="text-sm text-secondary">
          Page {page} of {Math.max(1, totalPages)}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => setPage(prev => prev + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
