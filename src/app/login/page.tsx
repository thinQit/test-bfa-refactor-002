'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardFooter, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { api } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';

interface LoginResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: { id: string; email: string; name?: string };
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: apiError } = await api.post<LoginResponse>('/api/auth/login', {
      email,
      password
    });

    if (apiError || !data) {
      setError(apiError || 'Unable to login.');
      setLoading(false);
      return;
    }

    localStorage.setItem('token', data.accessToken);
    login({
      id: data.user.id,
      email: data.user.email,
      name: data.user.name || data.user.email,
      role: 'customer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    toast('Welcome back!', 'success');
    router.push('/dashboard');
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6">
      <Card>
        <CardHeader>
          <div>
            <h1 className="text-2xl font-semibold">Log in</h1>
            <p className="text-sm text-secondary">Access your todo dashboard.</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              name="email"
              type="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              name="password"
              type="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              required
              autoComplete="current-password"
            />
            {error && <p className="text-sm text-error">{error}</p>}
            <Button type="submit" fullWidth loading={loading}>
              Log in
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-between">
          <p className="text-sm text-secondary">New here?</p>
          <Link href="/register" className="text-sm font-medium text-primary hover:underline">
            Create account
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
