import Link from 'next/link';
import Button from '@/components/ui/Button';

export function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-sm text-secondary">The page you are looking for does not exist.</p>
      <Button as-child={undefined}>
        <Link href="/" aria-label="Go home">Go home</Link>
      </Button>
    </div>
  );
}

export default NotFound;
