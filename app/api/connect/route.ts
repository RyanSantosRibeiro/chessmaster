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
      
  if(error && error.code != "PGRST116") {
    return new Response(JSON.stringify({
      success: false,
      message: error
    }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if(data && data != null) {
    return new Response(JSON.stringify({
      success: true,
      user: data,
      message: "Wallet connected"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: newUserData , error: newUseError } = await supabase
      .from("users")
      .insert({
        username: wallet.address.slice(0,6),
        address: wallet.address
      })
      .select()

  return new Response(JSON.stringify({
      success: true,
      user: newUserData,
      message: "New Wallet connected"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  

};
