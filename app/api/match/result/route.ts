import { transferToken } from '@/utils/odin/transfer';
import { createClientAdmin } from '@/utils/supabase/client';
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export const POST = async (req: Request) => {
  const body = await req.json();
  const { winner_id, match, fen, status, completed_at } = body;
  console.log({ winner_id, match, fen, status, completed_at })

  if (!winner_id || !match || !fen || !completed_at || !status)
    return NextResponse.json({ error: 'Not enough data' }, { status: 402 });

  const supabase = createClientAdmin();

  const { data: verifyMatch, error: verifyMatchError } = await supabase
    .from('matches')
    .select(
      `
    *,
    white_player:users!matches_white_player_id_fkey (*),
    black_player:users!matches_black_player_id_fkey (*),
    match_type:matches_type!matches_match_type_fkey (*)
  `
    )
    .eq('id', match)
    .eq('status', 'in_progress')
    .single();

  console.log({ verifyMatch });

  if (verifyMatchError) {
    return new Response(
      JSON.stringify({
        success: false,
        message: verifyMatchError
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  const winner =
    winner_id == verifyMatch.white_player.id
      ? verifyMatch.white_player
      : verifyMatch.black_player;
  const loser =
    winner_id == verifyMatch.white_player.id
      ? verifyMatch.black_player
      : verifyMatch.white_player;

  const { data, error } = await supabase
    .from('matches')
    .update({
      winner_id: winner_id,
      fen,
      status,
      completed_at: new Date().toISOString()
    })
    .eq('id', match); 

  const { data: winnerPLayer, error: winnerPlayerError } = await supabase
    .from('users')
    .update({
      trophies: winner.trophies + verifyMatch.match_type.trophies_on_win
    })
    .eq('id', winner.id);

  const { data: loserPLayer, error: loserPlayerError } = await supabase
    .from('users')
    .update({
      trophies: loser.trophies - verifyMatch.match_type.trophies_on_win
    })
    .eq('id', loser.id);

  const odinPlataform = await JSON.parse(process.env.ODIN_PLATAFORM as string)
  // console.log({odinPlataform})
  const reward = (verifyMatch.match_type.ticket_amount * 2) * 0.8;

  console.log({reward, verifyTicket: verifyMatch.match_type.ticket_amount})

  const payment = await transferToken(
    odinPlataform,
    winner.odinData.userPrincipal,
    '2k6r',
    reward // 0,000085 -> 8500000
  );

  if (!payment.success) throw payment;

  if (winnerPlayerError || loserPlayerError) {
    return new Response(
      JSON.stringify({
        success: false,
        message: { winnerPlayerError, loserPlayerError }
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  if (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: error
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Match updated',
      data
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
};
