'use client';

import Button from '@cloudscape-design/components/button';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <Button>Hello!</Button>
      </div>
    </main>
  );
}
