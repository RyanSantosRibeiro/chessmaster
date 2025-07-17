import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

type Player = {
  userId: string;
  rank: number;
  ticket: number;
  timestamp: number;
};

type Match = {
  playerA: Player;
  playerB: Player;
};

// Fila em memória
const queue: Player[] = [];


// Função para pegar o rank do usuário
// async function fetchUserRank(userId: string): Promise<number | null> {
  
//   const { data, error } = await supabase
//     .from('profile') // ou 'user', dependendo de onde está o rank
//     .select('rank_points')
//     .eq('id', userId)
//     .single();

//   if (error || !data) return null;
//   return data.rank_points;
// }

function findCompatiblePlayer(newPlayer: Player): Player | null {
  const tolerance = 1; // diferença máxima de rank (ex: ouro vs ouro 2)
  const matchIndex = queue.findIndex(
    (p) =>
      Math.abs(p.rank - newPlayer.rank) <= tolerance &&
      p.ticket === newPlayer.ticket &&
      p.userId !== newPlayer.userId
  );
  if (matchIndex !== -1) {
    const match = queue[matchIndex];
    queue.splice(matchIndex, 1);
    return match;
  }
  return null;
}

export const POST = async (req: Request) => {
  const supabase = createClient();
  const {
    data: { user }, error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile, error: errorProfile } = await supabase
    .from('profile')
    .select('*')
    .maybeSingle();

    if (errorProfile || !profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = user.id;
  // agora You pode usar userId com segurança

  const body = await req.json();
  const { ticket } = body;

  if (!userId || typeof ticket !== 'number') {
    return NextResponse.json({ error: 'Missing or invalid parameters' }, { status: 400 });
  }

  const rank = profile.rank_points;

  if (rank === null) {
    return NextResponse.json({ error: 'User not found or rank missing' }, { status: 404 });
  }

  const newPlayer: Player = {
    userId,
    rank,
    ticket,
    timestamp: Date.now()
  };

  const opponent = findCompatiblePlayer(newPlayer);

  if (opponent) {
    const match: Match = {
      playerA: newPlayer,
      playerB: opponent
    };

    // Aqui You pode salvar a partida no Supabase ou emitir evento Realtime
    console.log('Match found:', match);
    return NextResponse.json({ matchFound: true, match });
  } else {
    queue.push(newPlayer);
    return NextResponse.json({ matchFound: false });
  }
};
