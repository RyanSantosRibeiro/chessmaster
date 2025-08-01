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
import Link from 'next/link';

export default async function PricingPage() {
  const supabase = createClient();
  const [user, products, subscription] = await Promise.all([
    getUser(supabase),
    getProducts(supabase),
    getSubscription(supabase)
  ]);

  return (
    <div className="bg-background text-foreground w-full">
      {/* <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-primary/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <svg
                className="w-8 h-8 text-primary"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M5 16L3 14l5.5-5.5L10 10l4-4L22 14l-2 2-6.5-6.5L12 8l-4 4-3-3z" />
              </svg>
              <span className="text-2xl font-bold gradient-text font-display">
                AURION
              </span>
              <span className="hidden sm:inline-flex bg-accent/20 text-accent text-xs px-2 py-1 rounded border border-accent/30">
                ARENA
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#arena"
                className="text-foreground hover:text-primary transition-colors"
              >
                Arena
              </a>
              <a
                href="#how-it-works"
                className="text-foreground hover:text-primary transition-colors"
              >
                How It Works
              </a>
              <a
                href="#rewards"
                className="text-foreground hover:text-primary transition-colors"
              >
                Rewards
              </a>
            </div>

            <button className="bg-accent text-white px-6 py-2 rounded-lg hover:bg-accent/90 transition-all duration-300 hover:glow-effect font-semibold">
              <svg
                className="w-4 h-4 inline mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              Connect Wallet
            </button>
          </div>
        </div>
      </nav> */}

      <section className="relative flex items-center justify-center overflow-hidden hero-bg w-full">
        <div className="relative group mx-auto w-full">
          <img
            src={bg.src}
            alt="Fair and Secure Gaming"
            className="relative w-full max-h-[400px] object-cover"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent to-[#0e171e] pointer-events-none"></div>
        </div>
      </section>
      <section className="relative flex items-center justify-center overflow-hidden hero-bg">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-pulse-slow"></div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-8 animate-float">
            <div className="space-y-4">
              <h1 className="text-6xl md:text-8xl font-bold gradient-text leading-tight font-display">
                AURION
              </h1>
              <h2 className="text-2xl md:text-4xl font-bold text-foreground font-display">
                CHESS ARENA
              </h2>
              <div className="flex items-center justify-center gap-2 text-warning">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 16L3 14l5.5-5.5L10 10l4-4L22 14l-2 2-6.5-6.5L12 8l-4 4-3-3z" />
                </svg>
                <span className="text-lg font-semibold">
                  WHERE LEGENDS ARE FORGED
                </span>
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 16L3 14l5.5-5.5L10 10l4-4L22 14l-2 2-6.5-6.5L12 8l-4 4-3-3z" />
                </svg>
              </div>
            </div>

            <p className="text-xl md:text-2xl text-muted max-w-3xl mx-auto leading-relaxed">
              Enter the battlefield of minds. Stake your{' '}
              <span className="text-warning font-semibold">Aurion tokens</span>{' '}
              in epic 5-minute chess duels. Only the worthy shall claim victory
              and riches.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <a href="https://odin.fun/token/2k6r" className="gradient-hero text-white font-bold px-12 py-4 rounded-lg text-lg hover:scale-105 transition-all duration-300 epic-shadow">
                <svg
                  className="w-5 h-5 inline mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Buy Aurion
              </a>
              <Link href="/play" className="bg-accent text-white px-12 py-4 rounded-lg text-lg hover:bg-accent/90 transition-all duration-300 hover:glow-effect">
                <svg
                  className="w-5 h-5 inline mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                Play Game
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
              <div className="bg-card/50 backdrop-blur-sm border border-primary/20 p-6 rounded-lg hover:glow-effect transition-all duration-300">
                <div className="text-3xl font-bold text-primary mb-2">
                  5 MIN
                </div>
                <div className="text-sm text-muted">Chess Battles</div>
              </div>
              <div className="bg-card/50 backdrop-blur-sm border border-accent/20 p-6 rounded-lg hover:glow-effect transition-all duration-300">
                <div className="text-3xl font-bold text-accent mb-2">
                  REAL BTC
                </div>
                <div className="text-sm text-muted">Aurion Token</div>
              </div>
              <div className="bg-card/50 backdrop-blur-sm border border-info/20 p-6 rounded-lg hover:glow-effect transition-all duration-300">
                <div className="text-3xl font-bold text-info mb-2">24/7</div>
                <div className="text-sm text-muted">Games On</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-card/30 to-background/50"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex bg-primary/20 text-primary text-sm px-4 py-2 rounded-full border border-primary/30 mb-4">
              HOW IT WORKS
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 gradient-text font-display">
              Path to Glory
            </h2>
            <p className="text-xl text-muted max-w-2xl mx-auto">
              Three steps separate you from legendary status. Are you ready to
              claim your destiny?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="relative p-8 bg-card/80 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all duration-500 hover:glow-effect rounded-lg group">
              <div className="absolute -top-4 left-8">
                <div className="gradient-hero text-white font-bold text-lg px-4 py-2 rounded-full">
                  01
                </div>
              </div>
              <div className="mb-6 text-primary group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-12 h-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Enter the Arena
              </h3>
              <p className="text-muted leading-relaxed">
                Stake your Aurion tokens (BTC runes from Odin.fun) to join the
                battlefield. Each game is a ticket to war.
              </p>
            </div>

            <div className="relative p-8 bg-card/80 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all duration-500 hover:glow-effect rounded-lg group">
              <div className="absolute -top-4 left-8">
                <div className="gradient-hero text-white font-bold text-lg px-4 py-2 rounded-full">
                  02
                </div>
              </div>
              <div className="mb-6 text-accent group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-12 h-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Outplay Your Opponent
              </h3>
              <p className="text-muted leading-relaxed">
                Engage in a battle of minds — 5-minute blitz chess against real
                players. Victory is your only path.
              </p>
            </div>

            <div className="relative p-8 bg-card/80 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all duration-500 hover:glow-effect rounded-lg group">
              <div className="absolute -top-4 left-8">
                <div className="gradient-hero text-white font-bold text-lg px-4 py-2 rounded-full">
                  03
                </div>
              </div>
              <div className="mb-6 text-warning group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-12 h-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Claim the Spoils
              </h3>
              <p className="text-muted leading-relaxed">
                The winner takes the pot — earn real Aurion and rise through the
                ranks. Wealth and honor are yours to claim.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="rewards" className="py-24 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex bg-accent/20 text-accent text-sm px-4 py-2 rounded-full border border-accent/30 mb-4">
              WHY CHOOSE AURION
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 gradient-text font-display">
              The Aurion Runer
            </h2>
            <p className="text-xl text-muted max-w-3xl mx-auto">
              Join the ranks of chess warriors who have chosen the path of
              honor, skill, and real rewards. This is not just a game — this is
              your destiny.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div className="relative p-8 bg-card/60 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all duration-500 hover:glow-effect rounded-lg group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-warning/10 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="mb-6 text-primary group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-12 h-12"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">
                  Powered by Bitcoin
                </h3>
                <p className="text-muted leading-relaxed">
                  Secure and decentralized through Odin.fun runes. Your rewards
                  are real BTC-based assets.
                </p>
              </div>
            </div>

            <div className="relative p-8 bg-card/60 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all duration-500 hover:glow-effect rounded-lg group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-info/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="mb-6 text-primary group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-12 h-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">
                  True Skill-Based Earnings
                </h3>
                <p className="text-muted leading-relaxed">
                  No luck, only mastery. Pure chess skill determines your
                  victory and rewards.
                </p>
              </div>
            </div>

            <div className="relative p-8 bg-card/60 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all duration-500 hover:glow-effect rounded-lg group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="mb-6 text-primary group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-12 h-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">
                  Design and Lore
                </h3>
                <p className="text-muted leading-relaxed">
                  Every match is legend. Immerse yourself in the epic saga of
                  chess warriors.
                </p>
              </div>
            </div>

            <div className="relative p-8 bg-card/60 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all duration-500 hover:glow-effect rounded-lg group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-info/10 to-warning/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="mb-6 text-primary group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-12 h-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">
                  Instant Rewards
                </h3>
                <p className="text-muted leading-relaxed">
                  Winners receive Aurion tokens immediately. No waiting, no
                  delays, pure glory.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-16">
            <div className="bg-gradient-to-br from-card/60 to-background/80 rounded-2xl p-8 max-w-2xl mx-auto border border-primary/20 backdrop-blur-sm">
              <h3 className="text-3xl font-bold mb-4 text-foreground font-display">
                Ready to Become a Legend?
              </h3>
              <p className="text-muted mb-6">
                The arena awaits. Your saga begins with a single move.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <div className="gradient-hero text-white font-bold px-6 py-3 text-lg rounded-lg">
                  🏆 Real BTC Rewards
                </div>
                <div className="bg-secondary text-foreground font-bold px-6 py-3 text-lg rounded-lg">
                  ⚡ 5-Minute Battles
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-card border-t border-primary/10 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <svg
                className="w-8 h-8 text-primary"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M5 16L3 14l5.5-5.5L10 10l4-4L22 14l-2 2-6.5-6.5L12 8l-4 4-3-3z" />
              </svg>
              <span className="text-2xl font-bold gradient-text font-display">
                AURION
              </span>
              <span className="text-accent text-sm">CHESS ARENA</span>
            </div>
            <div className="text-muted text-sm">
              © 2024 Aurion Chess Arena. Where legends are forged.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
