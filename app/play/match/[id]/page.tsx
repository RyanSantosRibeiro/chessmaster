// Server Component

import MatchRoomChat from "@/components/ui/MatchRoom/Chat";
import DetailsColumn from "@/components/ui/DetailsColumn/Details";
import GameRoom from "@/components/ui/MatchRoom/Game";
import { MatchProvider } from "@/contexts/MatchContext";
import ComunityColumn from "@/components/ui/ComunityColumn/ComunityColumn";
import ChessMultiplayer from "@/components/ui/ChessMultiplayer";
import { getMatch } from "@/utils/supabase/queries";
import { createClient } from "@/utils/supabase/server";

interface MatchPageProps {
  params: { id: string };
}

export default async function MatchPage({ params }: MatchPageProps) {
  const { id } = params;
  const supabase = createClient();
    const [match] = await Promise.all([
      getMatch(supabase)
    ]);

    

  return (
    <div className="flex gap-4 p-4 max-h-full w-full px-20 h-full">
      <div className="bg-zinc-900 rounded-lg p-4 max-h-full overflow-hidden w-auto h-full">
        <ChessMultiplayer match={match} />
      </div>
      <DetailsColumn />
      <ComunityColumn />
    </div>
  );
}
