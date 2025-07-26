import { createClientAdmin } from '@/utils/supabase/client';


export const GET = async (req: Request) => {
  const supabase = createClientAdmin();

  const { data, error } = await supabase
  .from("users")
  .select("username, trophies")
  .order("trophies", { ascending: false }) // ordena do maior pro menor
  .limit(20); // limita a 20 resultados

      
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
