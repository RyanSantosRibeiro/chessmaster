import { createClient } from '@/utils/supabase/client';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Button from '../Button';
import LoadingDots from '../LoadingDots';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';
import { createMatch } from '@/utils/supabase/queries';

const supabase = createClient();

const generateMatchId = () =>
  Math.random().toString(36).substring(2, 6) +
  Date.now().toString(36).substring(2, 6);

export function MatchmakingButtons() {
  const [inQueue, setInQueue] = useState(false);
  const [channel, setChannel] = useState<any>(null);
  const { user } = useWallet();
  const router = useRouter();

  const joinQueue = async (ticket: number) => {
    if (!user) return;
    setInQueue(true);
    let hasMatched = false;

    const matchmakingChannel = supabase.channel('matchmaking', {
      config: {
        presence: { key: user.id }
      }
    });

    const cleanup = async () => {
      try {
        await matchmakingChannel.unsubscribe();
        setInQueue(false);
        setChannel(null);
      } catch (err) {
        console.error('Erro ao sair da fila:', err);
      }
    };
    console.log('Joined in queue');
    matchmakingChannel
      .on('presence', { event: 'sync' }, async () => {
        const state = matchmakingChannel.presenceState();
        console.log('presence Trigger!');
        console.log({ state, hasMatched });
        if (hasMatched) return;
        const others = Object.entries(state)
          .filter(([id]) => id !== user.id)
          .map(([_, presences]) => presences[0]);
        console.log({ others });

        const match = others.find(
          (p) =>
            // @ts-ignore
            Math.abs(p.trophies - user.trophies) <= 200 &&
            // @ts-ignore
            p.ticket_amount_cents === ticket
        );

        if (match) {
          console.log('Match!!');
          hasMatched = true;
          // @ts-ignore
          const isUserWhite = user.trophies <= match.trophies;
          // @ts-ignore
          const white_player_id = isUserWhite ? user.id : match.user_id;
          // @ts-ignore
          const black_player_id = isUserWhite ? match.user_id : user.id;
          const isResponsible = isUserWhite;
          const matchId = generateMatchId();

          if (isResponsible) {
            try {

              // const payment = await transferToken() devtransfer Aqui transfere os tokens ou la no back com o createMatch em api/match/route.js

              const reponse = await createMatch({
                url_hash: matchId,
                white_player_id,
                black_player_id,
                ticket_amount_cents: ticket,
              })
              
              if(!reponse.sucess) return; // PM - Algum erro ao criar partida

              await matchmakingChannel.send({
                type: 'broadcast',
                // @ts-ignore
                event: `match-found-${match.code}`,
                payload: {
                  matchId,
                  // @ts-ignore
                  players: [user.id, match.user_id]
                }
              });

              await cleanup();
              console.log("🟢🟢 Partida encontrada 🟢🟢")
              // router.push(`/play/match/${matchId}`); Descomentar
            } catch (err) {
              console.error('Erro ao criar partida:', err);
              await cleanup();
            }
          }
        }
      })
      .on(
        'broadcast',
        { event: `match-found-${user.username}` },
        async ({ payload }) => {
          const { matchId, players } = payload;
          console.log('Recebeu broadcast de match:', matchId, players);

          if (!players.includes(user.id)) return; // Ignora se não for pra You
          await cleanup();
          console.log("🟢🟢 broadcast - Partida encontrada 🟢🟢")
          // router.push(`play/match/${matchId}`); Descomentar
        }
      )
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('🟢 JOIN:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('🔴 LEAVE:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await matchmakingChannel.track({
            code: user.username,
            user_id: user.id,
            trophies: user.trophies,
            ticket_amount_cents: ticket
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
  };

  return (
    <div className="space-y-4">
      {!inQueue ? (
        <div className="flex gap-2">
          <button onClick={() => joinQueue(1)} className='btn relative transition-all duration-150 py-2 font-semibold rounded px-2 cursor-pointer'>Play $1</button>
          <button onClick={() => joinQueue(5)} className='btn relative transition-all duration-150 py-2 font-semibold rounded px-2 cursor-pointer'>Play $5</button>
          <button onClick={() => joinQueue(10)} className='btn relative transition-all duration-150 py-2 font-semibold rounded px-2 cursor-pointer'>Play $10</button>
        </div>
      ) : (
        <div className="text-center">
          <p className="mb-4">
            Searching for opponent <LoadingDots />
          </p>
          <Button onClick={leaveQueue}>Cancel</Button>
        </div>
      )}
    </div>
  );
}
