// Server Component

import MatchRoomChat from "@/components/ui/MatchRoom/Chat";
import GameRoom from "@/components/ui/MatchRoom/Game";
import { MatchProvider } from "@/contexts/MatchContext";

interface MatchPageProps {
  params: { id: string };
}

export default function MatchPage({ params }: MatchPageProps) {
  const { id } = params;

  return (
    <MatchProvider matchCode={id}>
      <div className="grid grid-cols-6 md:grid-cols-9 gap-4 p-4 max-h-full w-full lg:px-20">
        <GameRoom matchCode={id} />
        <MatchRoomChat matchId={id} />
      </div>
    </MatchProvider>
  );
}
