'use client';
import { getHistory } from '@/utils/supabase/queries';
import { useWallet } from '@/contexts/WalletContext';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function History() {
  const { user, walletData } = useWallet();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!walletData) return;
    fetchHistory(walletData);
  }, [walletData]);

  const fetchHistory = async (walletData: any) => {
    try {
      setLoading(true);
      const response = await getHistory({ wallet: walletData });
      setHistory(response || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
        Please, connect your wallet first!
      </div>
    );

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
        Loading match history...
      </div>
    );

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <h1 className="text-2xl font-bold mb-4">Match History</h1>
      <div className="space-y-4">
        {history.length === 0 && (
          <p className="text-muted-foreground">No matches found.</p>
        )}
        {history.map((match) => {
          const winner =
            match.winner_id === match.white_player_id
              ? match.white_player
              : match.black_player;

          return (
            <div
              key={match.id}
              style={{
                background:
                  winner.id === user.id ? '#6bb9a8' : '#db6262'
              }}
              className="h-[116px] gap-0 group relative overflow-hidden transition-all duration-150  rounded cursor-pointer w-full flex flex-row items-center justify-between pearl bg-card shadow-md"
            >
              <span
                className="
                    absolute 
                    right-[15%] 
                    opacity-20 
                    transition-all 
                    duration-300 
                    text-8xl 
                    font-bold 
                    italic 
                  "
              >
                {/* @ts-ignore */}
                {winner.id === user.id ? "Victory" : "Defeat"}
              </span>
              <div className="flex justify-between items-center gap-4 w-1/3 p-2">
                {/* White player */}
                <div className="flex flex-row items-start gap-2 min-w-[120px]">
                  <img
                    src={match.white_player.avatar_url}
                    alt={match.white_player.username}
                    width={80}
                    height={80}
                    className={`rounded-lg border-2 ${
                      winner.id === match.white_player_id
                        ? 'border-green-500'
                        : 'border-transparent'
                    }`}
                  />
                  <span className="text-sm font-bold">{match.white_player.username}</span>
                </div>

                <span className="font-bold">vs</span>

                {/* Black player */}
                <div className="flex justify-between items-start gap-4 w-1/3 p-2">
                  <img
                    src={match.black_player.avatar_url}
                    alt={match.black_player.username}
                    width={80}
                    height={80}
                    className={`rounded-lg border-2 ${
                      winner.id === match.black_player_id
                        ? 'border-green-500'
                        : 'border-transparent'
                    }`}
                  />
                  <span className="text-sm font-bold">{match.black_player.username}</span>
                </div>
              </div>

              {/* Match details */}
              <div className=" text-sm gap-2 text-right w-1/2 p-2 h-full bg-gradient-to-r from-transparent to-black/70">
                <p className="font-normal text-xs">
                  <span className="font-bold text-lg">
                    {match.match_type.experience}
                  </span>{' '}
                  ({match.match_type.time / 60} min)
                </p>
                <p className="text-muted-foreground font-bold text-xs">
                  Tickets: <span className="text-muted-foreground font-bold text-lg">{match.match_type.ticket_amount}</span>
                </p>
                <a
                  href={`https://odin-explorer.netlify.app/users/${user?.odinData?.userPrincipal}?tab=transactions`}
                  className=" hover:underline font-bold"
                >
                  View transaction
                </a>
                <p className="text-xs font-normal italic mt-auto">
                  {new Date(match.completed_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
