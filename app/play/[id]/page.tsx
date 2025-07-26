// Server Component

import MatchRoomChat from '@/components/ui/MatchRoom/Chat';
import DetailsColumn from '@/components/ui/DetailsColumn/Details';
import GameRoom from '@/components/ui/MatchRoom/Game';
import { MatchProvider } from '@/contexts/MatchContext';
import ComunityColumn from '@/components/ui/ComunityColumn/ComunityColumn';
import ChessMultiplayer from '@/components/ui/ChessMultiplayer';
import { getMatch } from '@/utils/supabase/queries';
import { createClient } from '@/utils/supabase/server';
import { useWallet } from '@/contexts/WalletContext';

interface MatchPageProps {
  params: { id: string };
}

export default async function MatchPage({ params }: MatchPageProps) {

  return (
    <div className="flex justify-end gap-4 p-4 max-h-full w-full px-20 h-full">
      
      <ChessMultiplayer />
      <DetailsColumn defaultTab={"history"} />
      <ComunityColumn />
    </div>
  );
}
