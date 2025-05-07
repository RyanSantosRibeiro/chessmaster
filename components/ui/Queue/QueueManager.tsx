'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Button from '../Button';
import LoadingDots from '../LoadingDots';

type QueueEntry = {
  id: string;
  user_id: string;
  ticket_amount_cents: number;
  rank_points: number;
  status: 'searching' | 'matched' | 'canceled';
};

export default function QueueManager() {
  const [inQueue, setInQueue] = useState(false);
  const { user } = useAuth(); // Certifique-se de que `profile` contém rank_points
  const supabase = createClient();

  const generateMatchId = () => Math.random().toString(36).substring(2, 8);

  const findMatch = async (amount: number): Promise<void> => {
    if (!user) return;

    // const { data: potentialMatch } = await supabase
    //   .from('queue')
    //   .select('*')
    //   .eq('status', 'searching')
    //   .eq('ticket_amount_cents', amount * 100)
    //   .neq('user_id', user.id)
    //   .gte('rank_points', user.rank_points - 200)
    //   .lte('rank_points', user.rank_points + 200)
    //   .maybeSingle();

    // if (potentialMatch) {
    //   const matchId = generateMatchId();
    //   await supabase.from('matches').insert({
    //     url_hash: matchId,
    //     white_player_id: user.id,
    //     black_player_id: potentialMatch.user_id,
    //     ticket_amount_cents: amount * 100,
    //     status: 'in_progress',
    //   });

    //   await supabase.from('queue').delete().eq('user_id', user.id);
    //   await supabase.from('queue').delete().eq('user_id', potentialMatch.user_id);

    //   return;
    // }

    // Inserir jogador na fila
    console.log("Criando chamado na queue")
    const response = await supabase.from('queue').insert({
      user_id: user.id,
      ticket_amount_cents: amount * 100,
      rank_points: user.rank_points,
      status: 'searching',
    });
    console.log({response})

    return;
  };

  const joinQueue = async (amount: number) => {
    if (!user) return;

    setInQueue(true);
    await findMatch(amount);
  };

  const leaveQueue = async () => {
    if (!user) return;

    await supabase
      .from('queue')
      .update({ status: 'canceled' })
      .eq('user_id', user.id)
      .eq('status', 'searching');

    setInQueue(false);
  };

  // useEffect(() => {
  //   if (!user) return;

  //   const channelWhite = supabase
  //     .channel('match_white')
  //     .on('postgres_changes', {
  //       event: 'INSERT',
  //       schema: 'public',
  //       table: 'matches',
  //       filter: `white_player_id=eq.${user.id}`,
  //     }, (payload) => {
  //       setInQueue(false);
  //       console.log("Macth")
  //       console.log(payload.new.url_hash)
  //       // window.location.href = `/match/${payload.new.url_hash}`;
  //     })
  //     .subscribe();

  //   const channelBlack = supabase
  //     .channel('match_black')
  //     .on('postgres_changes', {
  //       event: 'INSERT',
  //       schema: 'public',
  //       table: 'matches',
  //       filter: `black_player_id=eq.${user.id}`,
  //     }, (payload) => {
  //       setInQueue(false);
  //       console.log("Macth")
  //       console.log(payload.new.url_hash)
  //       // window.location.href = `/match/${payload.new.url_hash}`;
  //     })
  //     .subscribe();

  //   return () => {
  //     supabase.removeChannel(channelWhite);
  //     supabase.removeChannel(channelBlack);
  //   };
  // }, [user]);

  useEffect(() => {
    if (!user || !inQueue) return;

    console.log("CANAL ABERTO");
    const matchmakingChannel = supabase
      .channel('matchmaking')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'queue',
        filter: 'status=eq.searching',
      }, async (payload) => {
        console.log("canal disparado INSERT");
        const newPlayer = payload.new;
        console.log({newPlayer});

        const { data: potentialOpponents } = await supabase
          .from('queue')
          .select('*')
          .eq('ticket_amount_cents', newPlayer.ticket_amount_cents)
          .eq('status', 'searching')
          .neq('user_id', user.id); // Certifique-se de que não é o mesmo jogador

        const opponent = potentialOpponents.find(
          (p) =>
            Math.abs(p.rank_points - newPlayer.rank_points) <= 200
        );
        console.log("opponent");
        console.log({opponent});
        if (opponent) {
          const matchId = generateMatchId();

          await supabase.from('matches').insert({
            url_hash: matchId,
            white_player_id: newPlayer.user_id,
            black_player_id: opponent.user_id,
            ticket_amount_cents: newPlayer.ticket_amount_cents,
            status: 'in_progress',
          });

          await supabase.from('queue').delete().eq('user_id', newPlayer.user_id);
          await supabase.from('queue').delete().eq('user_id', opponent.user_id);
        }
      })
      .subscribe();

    return () => supabase.removeChannel(matchmakingChannel);
  }, [user, inQueue]);

  return (
    <div className="space-y-4">
      {!inQueue ? (
        <div className="flex gap-2">
          <Button onClick={() => joinQueue(1)}>Play $1</Button>
          <Button onClick={() => joinQueue(5)}>Play $5</Button>
          <Button onClick={() => joinQueue(10)}>Play $10</Button>
        </div>
      ) : (
        <div className="text-center">
          <p className="mb-4">Searching for opponent <LoadingDots /></p>
          <Button onClick={leaveQueue} variant="outline">Cancel</Button>
        </div>
      )}
    </div>
  );
}
