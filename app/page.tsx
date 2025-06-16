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
      <div className='flex w-screen h-screen'>
              <main
                id="skip"
                className="min-h-screen w-full flex flex-col items-center justify-center overflow-hidden"
              >
                 <div className="py-16 bg-base-100">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-12">Why Choose ChessBet?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="card bg-base-200 shadow-xl">
                            <figure className="px-10 pt-10">
                                <img src="https://via.placeholder.com/150?text=Fair+&amp;+Secure" alt="Fair and Secure Matches" className="rounded-xl" />
                            </figure>
                            <div className="card-body items-center text-center">
                                <h3 className="card-title">Fair and Secure Matches</h3>
                                <p>Our system ensures a transparent and protected gaming environment for your bets.</p>
                            </div>
                        </div>

                        <div className="card bg-base-200 shadow-xl">
                            <figure className="px-10 pt-10">
                                <img src="https://via.placeholder.com/150?text=Diverse+Formats" alt="Diverse Formats" className="rounded-xl" />
                            </figure>
                            <div className="card-body items-center text-center">
                                <h3 className="card-title">Diverse Betting Formats</h3>
                                <p>Choose from different betting values and game modes to enjoy yourself.</p>
                            </div>
                        </div>

                        <div className="card bg-base-200 shadow-xl">
                            <figure className="px-10 pt-10">
                                <img src="https://via.placeholder.com/150?text=Active+Community" alt="Active Community" className="rounded-xl" />
                            </figure>
                            <div className="card-body items-center text-center">
                                <h3 className="card-title">Active Community & Tournaments</h3>
                                <p>Participate in exclusive tournaments and interact with a vibrant community of chess players.</p>
                            </div>
                        </div>
                    </div>
                </div>
              
              <div className="hero py-16">
                  <div className="hero-content text-center">
                      <div className="max-w-md">
                          <h2 className="text-4xl font-bold">Ready for the Challenge?</h2>
                          <p className="py-6">Join the ChessBet community and start winning with your best chess moves.</p>
                          <button className="btn btn-primary btn-lg">Create Your Free Account!</button>
                      </div>
                  </div>
              </div>

              <footer className="footer footer-center p-10 text-base-content">
                  <nav className="grid grid-flow-col gap-4">
                      <a className="link link-hover" href="#">About Us</a>
                      <a className="link link-hover" href="#">Terms of Service</a>
                      <a className="link link-hover" href="#">Privacy Policy</a>
                      <a className="link link-hover" href="#">Support</a>
                  </nav>
                  <div>
                      <div className="grid grid-flow-col gap-4">
                          <a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="fill-current"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.333 0-6.037 2.704-6.037 6.037 0 .47.052.923.138 1.354-5.021-.253-9.473-2.66-12.483-6.314-.523.896-.833 1.957-.833 3.109 0 2.09.28 3.843 1.332 4.908-.69-.023-1.334-.213-1.907-.529v.077c0 2.767 1.977 5.082 4.603 5.602-.423.111-.87.169-1.338.169-.327 0-.64-.031-.947-.09 1.453 4.544 5.086 7.855 9.106 7.855 10.994 0 16.99-9.131 16.99-17.008 0-.26-.006-.52-.014-.78 1.171-.849 2.158-1.916 2.954-3.124z"/></svg></a>
                          <a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="fill-current"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.812c-3.267 0-3.188 4-3.188 3.5zm-11 4v5h-2v-5h2z"/></svg></a>
                          <a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="fill-current"><path d="M12 2c-3.197 0-6.01 1.796-7.5 4.479v-2.479c0-.276-.224-.5-.5-.5s-.5.224-.5.5v5c0 .276.224.5.5.5h5c.276 0 .5-.224.5-.5s-.224-.5-.5-.5h-2.479c1.696-2.585 4.61-4.008 7.979-4.008 4.479 0 8 3.521 8 8s-3.521 8-8 8c-2.43 0-4.63-.97-6.261-2.535l-.707.707c1.92 1.92 4.55 3.09 7.042 3.09 5.514 0 10-4.486 10-10s-4.486-10-10-10zm-12 11c0 2.209 1.791 4 4 4s4-1.791 4-4-1.791-4-4-4-4 1.791-4 4z"/></svg></a>
                      </div>
                  </div>
                  <aside>
                      <p>Copyright © 2025 - All rights reserved by ChessBet</p>
                  </aside>
              </footer>
            </div>

            
              </main>
          </div>
    </AuthProvider>
  );
}
