import Pricing from '@/components/ui/Pricing/Pricing';
import { createClient } from '@/utils/supabase/server';
import {
  getProducts,
  getSubscription,
  getUser
} from '@/utils/supabase/queries';
import { AuthProvider } from '@/contexts/AuthContext';
import Navbar from '@/components/ui/Navbar';
import bg from './bg.png';

export default async function PricingPage() {
  const supabase = createClient();
  const [user, products, subscription] = await Promise.all([
    getUser(supabase),
    getProducts(supabase),
    getSubscription(supabase)
  ]);

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300 w-full overflow-x-hidden">
        {/* Hero Section */}
        <div className="relative py-20 px-4">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10"></div>
          <div className="container mx-auto relative z-10">
            <div className="text-center mb-16">
              {/* Featured Image */}
              <div className="mb-12">
                <div className="relative group max-w-4xl mx-auto">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                  <img
                    src={bg.src}
                    alt="Fair and Secure Gaming"
                    className="relative rounded-3xl w-full max-h-[400px] object-cover shadow-2xl group-hover:scale-[1.02] transition-transform duration-500"
                    width={1500}
                    height={500}
                  />
                </div>
              </div>
              
              <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-6 animate-pulse">
                Aurion
              </h1>
              <p className="text-xl md:text-2xl text-base-content/80 mb-8 max-w-3xl mx-auto leading-relaxed">
                The ultimate platform for competitive gaming and betting. 
                <span className="text-primary font-semibold"> Strategy. Intelligence. Victory.</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button className="btn btn-primary btn-lg px-8 py-4 text-lg font-bold hover:scale-105 transition-transform duration-300 shadow-2xl">
                  Start Playing
                </button>
                <a 
                  href="https://odin.fun/token/2k6r" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-lg px-8 py-4 text-lg font-bold hover:scale-105 transition-transform duration-300 shadow-2xl"
                >
                  🥮 Buy Aurion
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="container mx-auto px-4 mb-20">
          <h2 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Why Choose Aurion?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card bg-base-200/50 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-base-300">
              <div className="card-body items-center text-center">
                <h3 className="card-title text-2xl text-primary">Fair and Secure Gaming</h3>
                <p className="text-base-content/80 leading-relaxed">
                  Our system ensures a transparent and protected gaming environment for your bets, with cutting-edge technology to prevent fraud across all games.
                </p>
              </div>
            </div>

            <div className="card bg-base-200/50 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-base-300">
              <div className="card-body items-center text-center">
                <h3 className="card-title text-2xl text-secondary">Multiple Game Formats</h3>
                <p className="text-base-content/80 leading-relaxed">
                  Choose from different games, betting values and game modes to maximize your enjoyment. From strategy games to fast-paced competitions.
                </p>
              </div>
            </div>

            <div className="card bg-base-200/50 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-base-300">
              <div className="card-body items-center text-center">
                <h3 className="card-title text-2xl text-accent">Active Community & Tournaments</h3>
                <p className="text-base-content/80 leading-relaxed">
                  Participate in exclusive tournaments and interact with a vibrant community of competitive gamers from around the world.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="hero py-20 bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="hero-content text-center">
            <div className="max-w-2xl">
              <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Ready for the Challenge?
              </h2>
              <p className="py-6 text-xl text-base-content/80 leading-relaxed">
                Join the Aurion community and start winning with your best gaming strategies. 
                <span className="text-primary font-semibold"> The future of competitive gaming is here.</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button className="btn btn-primary btn-lg px-8 py-4 text-lg font-bold hover:scale-105 transition-transform duration-300 shadow-2xl">
                  Create Free Account!
                </button>
                <a 
                  href="https://odin.fun/token/2k6r" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-secondary btn-lg px-8 py-4 text-lg font-bold hover:scale-105 transition-transform duration-300"
                >
                  🥮 Buy Aurion
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthProvider>
  );
}
