'use client';

import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Link from 'next/link';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const LobbyList = dynamic(() => import('@/components/ui/Lobby/LobbyList'), {
  ssr: false
});

export default function PlayPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid grid-cols-12 gap-4 p-4 max-h-full w-full px-20">
      <div className="col-span-6 bg-zinc-900 rounded-lg p-4">
        {/* Chess board will go here */}
        <div className="aspect-square bg-zinc-800 rounded-lg"></div>
      </div>
      <div className="col-span-6 space-y-4">
        <div className="bg-nivel-2 rounded-lg p-4">
          {user ? <h2 className="text-xl font-bold mb-2">Welcome, {user.email}</h2> : <h2 className="text-xl font-bold mb-2">Play Chess</h2>}
          <p className="text-zinc-400 mb-4">Available games:</p>
          <Suspense fallback={<div>Loading lobbies...</div>}>
            <LobbyList />
          </Suspense>
        </div>
        <div className="bg-nivel-2 rounded-lg p-4">
          <h2 className="text-xl font-bold mb-2">🏆 Scoreboard</h2>
          <p className="text-zinc-400">Your current position on scoreboard</p>
        </div>
      </div>
    </div>
  );
}