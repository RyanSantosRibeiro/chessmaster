
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
// import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default async function PlayPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
        <h1 className="text-4xl font-bold mb-8">Chess with Stakes</h1>
        <div className="space-y-4">
          <Link href="/signin/signup">
            {/* <Button className="w-full">Sign Up</Button> */}
          </Link>
          <Link href="/signin">
            {/* <Button variant="outline" className="w-full">Sign In</Button> */}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Left Sidebar */}
      <div className="w-64 bg-gray-800 p-4">
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Play Chess</h2>
          <nav className="space-y-2">
            {/* <Button className="w-full flex items-center gap-2">
              <span>⚡</span> Play Online
            </Button>
            <Button variant="outline" className="w-full flex items-center gap-2">
              <span>🤖</span> Play vs Bot
            </Button>
            <Button variant="outline" className="w-full flex items-center gap-2">
              <span>👥</span> Create Lobby
            </Button>
            <Button variant="outline" className="w-full flex items-center gap-2">
              <span>🏆</span> Tournaments
            </Button> */}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        <div className="bg-gray-800 rounded-lg h-full flex flex-col">
          <div className="p-4 text-center">
            <h2 className="text-2xl font-bold">Chess Board Here</h2>
            <p className="text-gray-400">We'll implement the P5.js chess board later</p>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-80 bg-gray-800 p-4">
        <div className="space-y-4">
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="font-bold mb-2">Your Stats</h3>
            <div className="space-y-2">
              <p>Balance: $0.00</p>
              <p>Games Played: 0</p>
              <p>Win Rate: 0%</p>
            </div>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="font-bold mb-2">Active Games</h3>
            <p className="text-gray-400">No active games</p>
          </div>
        </div>
      </div>
    </div>
  );
}
