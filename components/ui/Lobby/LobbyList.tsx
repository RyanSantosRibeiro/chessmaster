
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Button from '../Button';

type Lobby = {
  id: string;
  ticket_amount_cents: number;
  created_by: string;
  status: 'waiting' | 'in_progress' | 'completed' | 'canceled';
};

export default function LobbyList() {
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    const fetchLobbies = async () => {
      const { data, error } = await supabase
        .from('lobbies')
        .select('*')
        .eq('status', 'waiting');
      
      if (data) setLobbies(data);
    };

    fetchLobbies();

    // Subscribe to lobby changes
    const channel = supabase
      .channel('lobby_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'lobbies' 
      }, () => {
        fetchLobbies();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const createLobby = async (amount: number) => {
    if (!user) return;

    await supabase.from('lobbies').insert({
      ticket_amount_cents: amount * 100,
      created_by: user.id,
      status: 'waiting'
    });
  };

  const joinLobby = async (lobbyId: string) => {
    if (!user) return;

    await supabase
      .from('lobbies')
      .update({ joined_by: user.id, status: 'in_progress' })
      .eq('id', lobbyId);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={() => createLobby(1)}>Create $1 Lobby</Button>
        <Button onClick={() => createLobby(5)}>Create $5 Lobby</Button>
        <Button onClick={() => createLobby(10)}>Create $10 Lobby</Button>
      </div>

      <div className="grid gap-4">
        {lobbies.map((lobby) => (
          <div key={lobby.id} className="bg-nivel-2 p-4 rounded-lg flex justify-between items-center">
            <div>
              <p>Stake: ${lobby.ticket_amount_cents / 100}</p>
              <p className="text-sm text-zinc-400">ID: {lobby.id}</p>
            </div>
            {lobby.created_by !== user?.id && (
              <Button onClick={() => joinLobby(lobby.id)}>Join Game</Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
