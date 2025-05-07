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
  const { user } = useAuth();
  const supabase = createClient();

  const generateMatchId = () => {
    return Math.random().toString(36).substring(2, 8);
  };

  const findMatch = async (amount: number): Promise<string | null> => {
    if (!user) return null;

    // Primeiro procura por um oponente compatível
    const { data: potentialMatch } = await supabase
      .from('queue')
      .select('*')
      .eq('status', 'searching')
      .eq('ticket_amount_cents', amount * 100)
      .neq('user_id', user.id)
      .filter('rank_points', 'gte', 800) // rank - 200
      .filter('rank_points', 'lte', 1200) // rank + 200
      .maybeSingle();

    if (potentialMatch) {
      const matchId = generateMatchId();
      // Cria a partida
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .insert({
          url_hash: matchId,
          white_player_id: user.id,
          black_player_id: potentialMatch.user_id,
          ticket_amount_cents: amount * 100,
          status: 'in_progress'
        })
        .select()
        .single();

      if (matchError) {
        console.error('Error creating match:', matchError);
        return null;
      }

      // Remove ambos os jogadores da fila
      await supabase
        .from('queue')
        .delete()
        .in('user_id', [user.id, potentialMatch.user_id]);

      return matchId;
    }

    // Se não encontrou oponente, cria uma nova entrada na fila
    const { data: newEntry, error: queueError } = await supabase
      .from('queue')
      .insert({
        user_id: user.id,
        ticket_amount_cents: amount * 100,
        status: 'searching'
      })
      .select()
      .single();

    if (queueError) {
      console.error('Error joining queue:', queueError);
      return null;
    }

    return null;
  };

  const joinQueue = async (amount: number) => {
    if (!user) return;

    setInQueue(true);
    const matchId = await findMatch(amount);

    if (matchId) {
      // Redirecionar para a partida
      window.location.href = `/match/${matchId}`;
    }
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

  const cleanupMatchmaking = () => {
    //Clean up any existing matchmaking subscriptions here if needed.  This is a placeholder.
  };

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('queue_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'matches',
        filter: `white_player_id=eq.${user.id},black_player_id=eq.${user.id}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setInQueue(false);
          window.location.href = `/match/${payload.new.id}`;
        }
      })
      .subscribe();

    return () => {
      cleanupMatchmaking();
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    if (!user || !inQueue) return;

    const matchmakingChannel = supabase
      .channel('matchmaking')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'queue',
        filter: 'status=eq.searching'
      }, async (payload) => {
        const newPlayer = payload.new;

        // Buscar outro jogador compatível
        const { data: potentialOpponents } = await supabase
          .from('queue')
          .select('*')
          .eq('ticket_amount_cents', newPlayer.ticket_amount_cents)
          .eq('status', 'searching')
          .neq('user_id', newPlayer.user_id);


        const opponent = potentialOpponents.find(p => {
          return Math.abs(p.rank_points - newPlayer.rank_points) <= 200;
        });

        if (opponent) {
          // Criar lobby (replace with your actual lobby creation logic)
          const matchId = generateMatchId();
          await supabase.from('matches').insert({
            url_hash: matchId,
            white_player_id: newPlayer.user_id,
            black_player_id: opponent.user_id,
            ticket_amount_cents: newPlayer.ticket_amount_cents,
            status: 'in_progress'
          });

          // Marcar jogadores como matched
          await supabase.from('queue').update({ status: 'matched' }).eq('id', newPlayer.id);
          await supabase.from('queue').update({ status: 'matched' }).eq('id', opponent.id);
          window.location.href = `/match/${matchId}`;
        }
      })
      .subscribe();

    return () => supabase.removeChannel(matchmakingChannel);
  }, [user, inQueue, supabase]);


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