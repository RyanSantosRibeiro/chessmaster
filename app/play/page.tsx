'use client';

import ChessVsBot from '@/components/ui/ChessBot';
import ComunityColumn from '@/components/ui/ComunityColumn/ComunityColumn';
import DetailsColumn from '@/components/ui/DetailsColumn/Details';
import GameRoom from '@/components/ui/MatchRoom/Game';
import { useAuth } from '@/contexts/AuthContext';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const QueueManager = dynamic(
  () => import('@/components/ui/Queue/QueueManager'),
  {
    ssr: false
  }
);

export default function PlayPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex gap-4 p-4 max-h-full w-full xl:px-14 h-full">
      <div className="bg-[#121c22] rounded-lg p-4 max-h-full overflow-hidden w-auto h-full">
        <ChessVsBot />
      </div>
      <DetailsColumn />
      <ComunityColumn />
    </div>
  );
}
