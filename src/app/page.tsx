import { Button } from '@/components/ui/button';
import { getAppConfig } from '@/lib/app-config';

export default function HomePage() {
  const { name } = getAppConfig();

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 px-6">
      <div className="space-y-2 text-center">
        <p className="text-muted-foreground text-sm font-medium">Official docs first</p>
        <h1 className="text-4xl font-semibold tracking-tight">{name}</h1>
        <p className="text-muted-foreground">
          Next.js 16 + TypeScript + Tailwind CSS v4 + shadcn/ui
        </p>
      </div>
      <Button>Get Started</Button>
    </main>
  );
}
