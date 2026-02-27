'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface NavLink {
  href: string;
  label: string;
}

const links: NavLink[] = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/todos/new', label: 'New Todo' },
  { href: '/settings/profile', label: 'Profile' }
];

export function Navigation() {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="border-b border-border bg-background">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold" aria-label="Go to homepage">
          TodoApp
        </Link>
        <button
          className="inline-flex items-center justify-center rounded-md p-2 text-foreground md:hidden"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen(prev => !prev)}
        >
          <span className="sr-only">Toggle navigation</span>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="hidden items-center gap-6 md:flex">
          {links.map(link => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-foreground hover:text-primary">
              {link.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-secondary">{user?.name || user?.email}</span>
              <Button variant="outline" size="sm" onClick={logout} aria-label="Log out">
                Log out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-medium text-foreground hover:text-primary">
                Log in
              </Link>
              <Button size="sm" aria-label="Sign up">
                <Link href="/register">Sign up</Link>
              </Button>
            </div>
          )}
        </div>
      </nav>
      <div className={cn('md:hidden', open ? 'block' : 'hidden')}>
        <div className="space-y-2 border-t border-border px-4 py-4">
          {links.map(link => (
            <Link key={link.href} href={link.href} className="block text-sm font-medium text-foreground hover:text-primary">
              {link.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <Button variant="outline" size="sm" onClick={logout} aria-label="Log out" fullWidth>
              Log out
            </Button>
          ) : (
            <div className="flex flex-col gap-2">
              <Link href="/login" className="text-sm font-medium text-foreground hover:text-primary">
                Log in
              </Link>
              <Button size="sm" fullWidth>
                <Link href="/register">Sign up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navigation;
