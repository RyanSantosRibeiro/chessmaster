'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function PlayPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="max-w-sm rounded-lg border border-zinc-700 p-8">
          <h2 className="mb-4 text-2xl font-bold">Welcome to Chess Platform</h2>
          <p className="mb-4 text-zinc-400">Sign in to start playing chess!</p>
          <div className="space-y-4">
            <Link href="/signin/signup">
              <Button className="w-full">Sign Up</Button>
            </Link>
            <Link href="/signin">
              <Button variant="outline" className="w-full">Sign In</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-4 p-4">
      <div className="col-span-9 bg-zinc-900 rounded-lg p-4">
        {/* Chess board will go here */}
        <div className="aspect-square bg-zinc-800 rounded-lg"></div>
      </div>
      <div className="col-span-3 space-y-4">
        <div className="bg-zinc-900 rounded-lg p-4">
          <h2 className="text-xl font-bold mb-2">Welcome, {user.email}</h2>
          <p className="text-zinc-400">Your game options:</p>
          <div className="mt-4 space-y-2">
            <Button className="w-full">Create Game</Button>
            <Button variant="outline" className="w-full">Join Game</Button>
          </div>
        </div>
      </div>
    </div>
  );
}