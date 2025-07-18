'use client';

import { Suspense, useEffect, useState } from 'react';
import { useMatch } from '@/contexts/MatchContext';
import MatchRoomChat from '../MatchRoom/Chat';
import { useAuth } from '@/contexts/AuthContext';
import Controls from '../Controls/Controls';
import StatisticColumn from './Statistic';
import { MatchmakingButtons } from '../Queue/QueueManagerList';
import { useChessVsBot } from '@/contexts/GameBot';
import { createClient } from '@/utils/supabase/client';
import { BoardOrientation } from 'react-chessboard/dist/chessboard/types';

type Props = {
  matchCode?: string;
};

function getTimeUntilFriday() {
  const now = new Date();
  const target = new Date(now);

  // Set target to upcoming Friday at 00:00
  const dayOfWeek = now.getDay(); // Sunday = 0
  const daysUntilFriday = (5 - dayOfWeek + 8) % 7 || 7; // next Friday
  target.setDate(now.getDate() + daysUntilFriday);
  target.setHours(0, 0, 0, 0);

  const diff = target.getTime() - now.getTime();
  const totalSeconds = Math.max(Math.floor(diff / 1000), 0);

  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
}

export default function DetailsColumn({ matchCode }: Props) {
  let { game, playerColor } = useMatch();
  const [timeLeft, setTimeLeft] = useState(getTimeUntilFriday());
  const supabase = createClient()
  
  const [activeTab, setActiveTab] = useState('newMatch');
  const { user } = useAuth();

   useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeUntilFriday());
    }, 1000);
    return () => clearInterval(timer);
  }, []);


  return (
    <div className="card bg-base-100 w-full flex-1 h-full rounded-lg shadow-lg flex flex-col overflow-hidden">
      <div className="tabs tabs-boxed flex flex-nowrap">
        {/* <a className={`p-2 w-full tab ${activeTab === 'statistic' ? 'tab-active text-white bg-base-100' : '!text-gray-500 bg-base-300'}`}
          onClick={() => setActiveTab('match')}
        >
          Match
        </a> */}
        <a
          className={`p-2 w-full tab ${activeTab === 'history' ? 'tab-active text-white bg-base-100' : '!text-gray-500 bg-base-300'}`}
          onClick={() => setActiveTab('history')}
        >
          Statistic
        </a>
        {!game && (
          <a className={`p-2 w-full tab ${activeTab === 'newMatch' ? 'tab-active text-white bg-base-100' : '!text-gray-500 bg-base-300'}`}
          onClick={() => setActiveTab('newMatch')}
        >
          New Match
        </a>
        )}
      </div>

      <div className="card-body flex-1 overflow-y-auto p-4 rounded-[10px_10px_0_0] bg-base-100">
        {activeTab === 'summary' && game && (
          <div className="text-sm text-white space-y-2">
            <p><span className="font-semibold">Cor:</span> {playerColor === 'white' as BoardOrientation? 'Branco' : 'Preto'}</p>
            <p><span className="font-semibold">Turno Atual:</span> {game.turn() === 'w' ? 'Branco' : 'Preto'}</p>
            <p><span className="font-semibold">Status:</span> {game.isGameOver() ? 'Finalizado' : 'Em andamento'}</p>
            <p><span className="font-semibold">Chequemate:</span> {game.isCheckmate() ? 'Sim' : 'Não'}</p>
            <p><span className="font-semibold">Empate:</span> {game.isDraw() ? 'Sim' : 'Não'}</p>
          </div>
        )}

        {activeTab === 'history' && (
          <StatisticColumn />
        )}

        {activeTab === 'newMatch' && (
          <div className="col-span-6 space-y-4">
            <div className="rounded-lg p-4 overflow-hidden inset-0 bg-gradient-to-r from-primary/10 to-secondary/10">
              {user ? (
                <>
                  <h2 className="text-xl font-bold mb-2">Welcome, {user.email}</h2>
                  <p className="text-zinc-400 mb-4">Choose your game:</p>
                  <Suspense fallback={<div>Loading queue manager...</div>}>
                    {/* <QueueManager /> */}
                    <MatchmakingButtons />
                  </Suspense>
                </>
              ) : (
                
                <div className="flex flex-col items-center justify-center gap-4 p-4">
                  <h2 className="text-5xl font-bold mb-2 text-center">A new era of Chess begins</h2>
                  <p className="text-md font-bold mb-2">Connect your wallet. The warriors are coming.</p>
                  <div className="grid grid-flow-col gap-5 text-center auto-cols-max">
                    <div className="flex flex-col">
                      <span className="countdown font-mono text-4xl">
                        <span style={{ "--value": timeLeft.days } as React.CSSProperties}></span>
                      </span>
                      <span className="text-sm">days</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="countdown font-mono text-4xl">
                        <span style={{ "--value": timeLeft.hours } as React.CSSProperties}></span>
                      </span>
                      <span className="text-sm">hours</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="countdown font-mono text-4xl">
                        <span style={{ "--value": timeLeft.minutes } as React.CSSProperties}></span>
                      </span>
                      <span className="text-sm">min</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="countdown font-mono text-4xl">
                        <span style={{ "--value": timeLeft.seconds } as React.CSSProperties}></span>
                      </span>
                      <span className="text-sm">sec</span>
                    </div>
                  </div>
                  <div className="flex flex-row gap-2">
                    <p className="btn linkDisable relative transition-all duration-150 py-2 font-semibold rounded px-2 opacity-30 cursor-default">
                      🌎 0.00005 BTC
                    </p>
                    <p className="btn linkDisable relative transition-all duration-150 py-2 font-semibold rounded px-2 opacity-30 cursor-default">
                      🌎 0.0001 BTC
                    </p>
                    <p className="btn linkDisable relative transition-all duration-150 py-2 font-semibold rounded px-2 opacity-30 cursor-default">
                      🌎 0.0005 BTC
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="bg-nivel-2 rounded-lg p-4">
              <h2 className="text-xl font-bold mb-2">🏆 Scoreboard 2</h2>
              <p className="text-zinc-400">Your current position on scoreboard</p>
            </div>
          </div>
        )}
      </div>
      <div className="h-auto flex flex-col">
            <MatchRoomChat matchId={matchCode || "bot"} />
      </div>
    </div>
  );
}
