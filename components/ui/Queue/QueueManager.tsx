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
  const [inQueue, setInQueue] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth(); // Certifique-se de que `profile` contém rank_points
  const supabase = createClient();

  const generateMatchId = () => Math.random().toString(36).substring(2, 4);

  const findMatch = async (amount: number): Promise<void> => {
    if (!user) return;

    const { data: potentialMatch } = await supabase
    // @ts-ignore
      .from('queue')
      .select('*')
      .eq('status', 'searching')
      .eq('ticket_amount_cents', amount)
      .neq('user_id', user.id)
      // @ts-ignore
      .gte('rank_points', user.rank_points - 200)
      // @ts-ignore
      .lte('rank_points', user.rank_points + 200)
      .maybeSingle();

    if (potentialMatch) {
      const matchId = generateMatchId();
      // @ts-ignore
      const white_player_id = user.rank_points <= potentialMatch.rank_points ? user.id : potentialMatch.user_id;
      // @ts-ignore
      const black_player_id = user.rank_points <= potentialMatch.rank_points ? potentialMatch.user_id : user.id;
      await supabase.from('matches').insert({
        // @ts-ignore
        url_hash: matchId,
        white_player_id: white_player_id,
        black_player_id: black_player_id,
        ticket_amount_cents: amount,
        status: 'in_progress',
      });
      console.log("Partida encontrada")
      // Remover jogadores da fila
      console.log("Removendo da fila")
      // @ts-ignore
      await supabase.from('queue').delete().eq('user_id', user.id);
      // @ts-ignore
      await supabase.from('queue').delete().eq('user_id', potentialMatch.user_id);

      return;
    }

    // Inserir jogador na fila
    console.log("Criando chamado na queue")
    // @ts-ignore
    const response = await supabase.from('queue').insert({
      user_id: user.id,
      ticket_amount_cents: amount,
      // @ts-ignore
      rank_points: user.rank_points,
      status: 'searching',
    });
    console.log({response})

    return;
  };

  const joinQueue = async (amount: number) => {
    if (!user) return;

    setInQueue(amount);
    await findMatch(amount);
  };

  const leaveQueue = async () => {
    if (!user) return;

    await supabase
    // @ts-ignore
      .from('queue')
      .update({ status: 'canceled' })
      .eq('user_id', user.id)
      .eq('status', 'searching');

    setInQueue(0);
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
        const newPlayer = payload.new;

        if (newPlayer.user_id !== user.id) {
          // @ts-ignore
          const rankDiff = Math.abs(newPlayer.rank_points - user.rank_points);
          const sameTicketAmount = newPlayer.ticket_amount_cents === inQueue;

          if (rankDiff <= 200 && sameTicketAmount) {
            const matchId = generateMatchId();

            try {
              // @ts-ignore
              const white_player_id = user.rank_points <= newPlayer.rank_points ? user.id : newPlayer.user_id;
              // @ts-ignore
              const black_player_id = user.rank_points <= newPlayer.rank_points ? newPlayer.user_id : user.id;

              await supabase.from('matches').insert({
                // @ts-ignore
                url_hash: matchId,
                white_player_id,
                black_player_id,
                ticket_amount_cents: newPlayer.ticket_amount_cents,
                status: 'in_progress'
              });
              // @ts-ignore
              await supabase.from('queue').delete().eq('user_id', user.id);
              // @ts-ignore
              await supabase.from('queue').delete().eq('user_id', newPlayer.user_id);
            } catch (error) {
              console.log("Failed to create match:", error);
            }
          }
        }
      })
      .subscribe();

    const matchChannel = supabase
      .channel('match_detected')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'matches',
        filter: `white_player_id=eq.${user.id}`,
      }, async (payload) => {
        console.log("Macth - White")
        // @ts-ignore
        await supabase.from('queue').delete().eq('user_id', user.id);
        window.location.href = `/match/${payload.new.url_hash}`;
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'matches',
        filter: `black_player_id=eq.${user.id}`,
      }, async (payload) => {
        console.log("Macth - Black")
        // @ts-ignore
        await supabase.from('queue').delete().eq('user_id', user.id);
        window.location.href = `/match/${payload.new.url_hash}`;
      })
      .subscribe();

    return () => {
      supabase.removeChannel(matchmakingChannel);
      supabase.removeChannel(matchChannel);
    };
  }, [user, inQueue]);

  return (
    <div className="space-y-4">
      {!inQueue ? (
        <div className="flex gap-2">
          <Button onClick={() => joinQueue(1*100)}>Play $1</Button>
          <Button onClick={() => joinQueue(5*100)}>Play $5</Button>
          <Button onClick={() => joinQueue(10*100)}>Play $10</Button>
        </div>
      ) : (
        <div className="text-center">
          <p className="mb-4">Searching for opponent <LoadingDots /></p>
          {/* @ts-ignore */}
          <Button onClick={leaveQueue} variant="outline">Cancel</Button>
        </div>
      )}
    </div>
  );
}
