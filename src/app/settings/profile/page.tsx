'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import { useAuth } from '@/providers/AuthProvider';

interface Profile {
  id: string;
  email: string;
  name?: string;
  created_at?: string;
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

export default function ProfilePage() {
  const { isAuthenticated, loading: authLoading, logout } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError(null);
      const { data, error: apiError } = await fetchWithAuth<Profile>('/api/users/me');
      if (apiError || !data) {
        setError(apiError || 'Unable to load profile.');
        setProfile(null);
        setLoading(false);
        return;
      }
      setProfile(data);
      setLoading(false);
    };

    if (!authLoading) {
      loadProfile();
    }
  }, [authLoading]);

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
          <p className="text-sm text-secondary">Please log in to view your profile.</p>
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
          <h1 className="text-xl font-semibold">Unable to load profile</h1>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-error">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <h1 className="text-xl font-semibold">Profile not available</h1>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-secondary">We could not find your profile.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <Card>
        <CardHeader>
          <div>
            <h1 className="text-2xl font-semibold">Profile</h1>
            <p className="text-sm text-secondary">Your account details.</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-xs uppercase text-secondary">Name</p>
            <p className="text-sm font-medium">{profile.name || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-secondary">Email</p>
            <p className="text-sm font-medium">{profile.email}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-secondary">Member since</p>
            <p className="text-sm font-medium">
              {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <Button variant="outline" onClick={logout}>
            Log out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
