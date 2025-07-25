import { createClientAdmin } from '@/utils/supabase/client';
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';


export const POST = async (req: Request) => {
  const body = await req.json();
  const { 
    url_hash,
    white_player_id,
    black_player_id,
    ticket_amount_cents
   } = body;

  if(!url_hash ||
    !white_player_id ||
    !black_player_id ||
    !ticket_amount_cents) return NextResponse.json({ error: "Wallet não encontrada" }, { status: 400 }); 

  const supabase = createClientAdmin();

  const { data: verifyUser, error: verifyUserError   } = await supabase
      .from("users")
      .select("*")
      .in("id", [white_player_id, black_player_id])
      
      
  if(verifyUserError) {
    return new Response(JSON.stringify({
      success: false,
      message: verifyUserError
    }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if(verifyUser == null || verifyUser.length < 2) {
    return new Response(JSON.stringify({
      success: false,
      message: "Unregistered players"
    }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: verifyMatch, error: verifyMatchError   } = await supabase
      .from("matches")
      .select("status")
      .in("white_player_id", [white_player_id,black_player_id])
      .in("black_player_id", [white_player_id,black_player_id])
      .eq("status", "in_progress")
      .single()
  
  if(verifyMatchError && verifyMatchError.code != "PGRST116") {
    return new Response(JSON.stringify({
      success: false,
      message: verifyMatchError
    }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if(verifyMatch && verifyMatch != null) {
    return new Response(JSON.stringify({
      success: true,
      data: verifyMatch,
      message: "Match already in progress"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: newMatchData , error: newMatchError } = await supabase
      .from("matches")
      .insert({
        url_hash,
        white_player_id,
        black_player_id,
        ticket_amount_cents
      })
      .select()

  if(newMatchError) {
    return new Response(JSON.stringify({
      success: false,
      message: newMatchError
    }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({
      success: true,
      data: newMatchData,
      message: "New match created"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  

};
