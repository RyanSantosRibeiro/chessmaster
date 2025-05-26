import { createClient } from '@/utils/supabase/client';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Button from '../Button';
import LoadingDots from '../LoadingDots';
import { useRouter } from 'next/navigation';

const supabase = createClient();

const generateMatchId = () => Math.random().toString(36).substring(2, 6) + Date.now().toString(36).substring(2, 6);

export function MatchmakingButtons() {
  const [inQueue, setInQueue] = useState(false);
  const [ticketValue, setTicketValue] = useState<number | null>(null);
  const [channel, setChannel] = useState<any>(null);
  const { user, profile } = useAuth();
  const router = useRouter();

  const joinQueue = async (ticket: number) => {
  if (!user || !profile) return;
  setInQueue(true);
  setTicketValue(ticket);
  let hasMatched = false;

  const matchmakingChannel = supabase.channel('matchmaking', {
    config: {
      presence: { key: user.id },
    },
  });

  const cleanup = async () => {
    try {
      await matchmakingChannel.unsubscribe();
      setInQueue(false);
      setChannel(null);
    } catch (err) {
      console.error("Erro ao sair da fila:", err);
    }
  };
  console.log("Joined in queu")
  matchmakingChannel
    .on('presence', { event: 'sync' }, async () => {
      const state = matchmakingChannel.presenceState();
      console.log("presence Trigger!")
      console.log({state, hasMatched})
      if(hasMatched) return;
      const others = Object.entries(state)
        .filter(([id]) => id !== user.id)
        .map(([_, presences]) => presences[0]);
        console.log({others})

      const match = others.find(
        (p) =>
          Math.abs(p.rank_points - profile.rank_points) <= 200 &&
          p.ticket_amount_cents === ticket
      );

      if (match) {
        console.log("Match!!")
        hasMatched = true;
        const isUserWhite = profile.rank_points <= match.rank_points;
        const white_player_id = isUserWhite ? user.id : match.user_id;
        const black_player_id = isUserWhite ? match.user_id : user.id;
        const isResponsible = isUserWhite;
        const matchId = generateMatchId();
        
        if (isResponsible) {
          try {
            await supabase.from('matches').insert({
              url_hash: matchId,
              white_player_id,
              black_player_id,
              ticket_amount_cents: ticket,
              status: 'in_progress',
            });

            await matchmakingChannel.send({
              type: 'broadcast',
              event: `match-found-${match.code}`,
               payload: {
                matchId,
                players: [user.id, match.user_id],
              },
            });

            await cleanup();
            // alert("Partida encontrada")
            router.push(`/play/match/${matchId}`);
          } catch (err) {
            console.error('Erro ao criar partida:', err);
            await cleanup();
          }
        }
      }
    })
    .on('broadcast', { event: `match-found-${profile.username}` }, async ({ payload }) => {
      const { matchId, players } = payload;
      console.log("Recebeu broadcast de match:", matchId, players);

      if (!players.includes(user.id)) return; // Ignora se não for pra você
      await cleanup();
      // alert("Partida encontrada")
      router.push(`play/match/${matchId}`);
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
    console.log("🟢 JOIN:", key, newPresences);
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log("🔴 LEAVE:", key, leftPresences);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await matchmakingChannel.track({
          code: profile.username,
          user_id: user.id,
          rank_points: profile.rank_points,
          ticket_amount_cents: ticket,
        });
      }
    });

  setChannel(matchmakingChannel);
};



  const leaveQueue = async () => {
    if (channel) {
      await channel.untrack();
      await channel.unsubscribe();
    }
    setChannel(null);
    setInQueue(false);
    setTicketValue(null);
  };

  return (
    <div className="space-y-4">
      {!inQueue ? (
        <div className="flex gap-2">
          <Button onClick={() => joinQueue(1 * 100)}>Play $1</Button>
          <Button onClick={() => joinQueue(5 * 100)}>Play $5</Button>
          <Button onClick={() => joinQueue(10 * 100)}>Play $10</Button>
        </div>
      ) : (
        <div className="text-center">
          <p className="mb-4">
            Searching for opponent <LoadingDots />
          </p>
          <Button onClick={leaveQueue} >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
