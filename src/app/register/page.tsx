'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardFooter, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { api } from '@/lib/api';
import { useToast } from '@/providers/ToastProvider';

interface RegisterResponse {
  success: boolean;
  userId?: string;
  error?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: apiError } = await api.post<RegisterResponse>('/api/auth/register', {
      name: name || undefined,
      email,
      password
    });

    if (apiError || !data?.success) {
      setError(apiError || data?.error || 'Registration failed.');
      setLoading(false);
      return;
    }

    toast('Account created! Please log in.', 'success');
    router.push('/login');
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6">
      <Card>
        <CardHeader>
          <div>
            <h1 className="text-2xl font-semibold">Create your account</h1>
            <p className="text-sm text-secondary">Start tracking your todos today.</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Name"
              name="name"
              type="text"
              value={name}
              onChange={event => setName(event.target.value)}
              autoComplete="name"
            />
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
              autoComplete="new-password"
            />
            {error && <p className="text-sm text-error">{error}</p>}
            <Button type="submit" fullWidth loading={loading}>
              Create account
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-between">
          <p className="text-sm text-secondary">Already have an account?</p>
          <Link href="/login" className="text-sm font-medium text-primary hover:underline">
            Log in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
