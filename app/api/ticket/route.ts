import { createClientAdmin } from '@/utils/supabase/client';
import { NextResponse } from 'next/server';


export const POST = async (req: Request) => {
  const body = await req.json();
    const { id, ticket } = body;
  
    if (!id || !ticket)
      return NextResponse.json({ error: 'Error' }, { status: 402 });

  const supabase = createClientAdmin();

  const { data, error } = await supabase
  .from("ticket")
  .insert({
      user_id: id, 
      ticket
    })
    .select();

      
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
      data,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

};
