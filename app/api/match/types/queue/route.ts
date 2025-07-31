import { createClientAdmin } from '@/utils/supabase/client';


export const GET = async (req: Request) => {
  const supabase = createClientAdmin();

  const { data, error } = await supabase
  .from("matches_type")
  .select("id, ticket_amount, trophies_on_win, time, experience")
  // .eq("type", 'queue')

  console.log({data})
      
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
