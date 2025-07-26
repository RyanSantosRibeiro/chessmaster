import { createClientAdmin } from '@/utils/supabase/client';
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';


export const POST = async (req: Request) => {
  const body = await req.json();
  const { 
    winner,
    match,
    fen,
    status,
    completed_at
   } = body;

  if(!winner ||
    !match ||
    !fen ||
    !completed_at ||
    !status) return NextResponse.json({ error: "Not enough data" }, { status: 402 }); 

  const supabase = createClientAdmin();

  const { data, error } = await supabase
  .from("matches")
  .update({
    winner_id: winner, 
    fen,
    status,
    completed_at: new Date().toISOString()
  })
  .eq("id", match);
      
      
  if(error) {
    return new Response(JSON.stringify({
      success: false,
      message: error
    }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({
    success: true,
    message: "Match updated",
    data
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
