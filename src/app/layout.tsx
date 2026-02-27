import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/layout/Navigation';
import Toaster from '@/components/ui/Toaster';
import AuthProvider from '@/providers/AuthProvider';
import ToastProvider from '@/providers/ToastProvider';

export const metadata: Metadata = {
  title: 'Simple Todo App',
  description: 'A simple todo app with JWT-based authentication and CRUD operations.'
};

export function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <AuthProvider>
          <ToastProvider>
            <Navigation />
            <main className="mx-auto w-full max-w-6xl px-4 py-6">
              {children}
            </main>
            <Toaster />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

export default RootLayout;
