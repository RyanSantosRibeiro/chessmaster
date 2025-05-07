
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

  const findMatch = async (newEntry: QueueEntry) => {
    const { data: potentialMatch } = await supabase
      .from('queue')
      .select('*')
      .eq('status', 'searching')
      .eq('ticket_amount_cents', newEntry.ticket_amount_cents)
      .neq('user_id', newEntry.user_id)
      .filter('rank_points', 'gte', newEntry.rank_points - 200)
      .filter('rank_points', 'lte', newEntry.rank_points + 200)
      .maybeSingle();

    if (potentialMatch) {
      // Create match
      const { data: match } = await supabase
        .from('matches')
        .insert({
          white_player_id: newEntry.user_id,
          black_player_id: potentialMatch.user_id,
          ticket_amount_cents: newEntry.ticket_amount_cents,
          status: 'in_progress'
        })
        .select()
        .single();

      // Update both queue entries
      await supabase
        .from('queue')
        .update({ status: 'matched' })
        .in('id', [newEntry.id, potentialMatch.id]);

      return match;
    }
    return null;
  };

  const joinQueue = async (amount: number) => {
    if (!user) return;

    const { data: newEntry } = await supabase
      .from('queue')
      .insert({
        user_id: user.id,
        ticket_amount_cents: amount * 100,
        status: 'searching'
      })
      .select()
      .single();

    if (newEntry) {
      setInQueue(true);
      const match = await findMatch(newEntry);
      if (match) {
        // Redirect to game or update UI
        setInQueue(false);
      }
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

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('queue_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'queue',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        if (payload.new.status === 'matched') {
          setInQueue(false);
          // Handle match found, redirect to game
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

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
