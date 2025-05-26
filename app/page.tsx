import Pricing from '@/components/ui/Pricing/Pricing';
import { createClient } from '@/utils/supabase/server';
import {
  getProducts,
  getSubscription,
  getUser
} from '@/utils/supabase/queries';
import { AuthProvider } from '@/contexts/AuthContext';
import Navbar from '@/components/ui/Navbar';

export default async function PricingPage() {
  const supabase = createClient();
  const [user, products, subscription] = await Promise.all([
    getUser(supabase),
    getProducts(supabase),
    getSubscription(supabase)
  ]);

  return (
    <AuthProvider>
      <div className='flex w-full h-screen'>
              <Navbar />
              <main
                id="skip"
                className="min-h-screen w-full flex flex-col items-center justify-center overflow-hidden"
              >
              </main>
          </div>
    </AuthProvider>
  );
}
