import { createClientAdmin } from '@/utils/supabase/client';
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';


export const POST = async (req: Request) => {
  const body = await req.json();
  const { wallet } = body;

  if(!wallet) return NextResponse.json({ error: "Wallet não encontrada" }, { status: 400 }); 

  const supabase = createClientAdmin();

  const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("address", wallet.address)
      .single();
  
  
  if(error) {
    return new Response(JSON.stringify({
      success: false,
      message: error
    }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if(data && data != null) {
    const { data: verifyMatch, error: verifyMatchError } = await supabase
  .from("matches")
  .select(`
    *,
    white_player:users!matches_white_player_id_fkey (*),
    black_player:users!matches_black_player_id_fkey (*),
    match_type:matches_type!matches_match_type_fkey (*)
  `)
  .or(`white_player_id.eq.${data.id},black_player_id.eq.${data.id}`)

  console.log({verifyMatch, verifyMatchError})

    return new Response(JSON.stringify({
      success: true,
      data: verifyMatch,
      message: "History"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } else {
    return new Response(JSON.stringify({
      success: false,
      message: error
    }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

};
