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
import { useWallet } from '@/contexts/WalletContext';
import LoadingDots from '../LoadingDots';

type Props = {
  defaultTab?: string;
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

export default function DetailsColumn({ defaultTab }: Props) {
  const { user } = useWallet();
  let { game, playerColor } = useMatch();
  const [activeTab, setActiveTab] = useState<string>(
    defaultTab ? defaultTab : 'newMatch'
  );

  if (!user)
    return (
      <div className="card bg-[#1b262c] w-full flex-1 h-full rounded-lg shadow-lg flex flex-col overflow-hidden lg:min-w-[350px] max-w-[400px] overflow-hidden">
        <LoadingDots />
      </div>
    );

  return (
    <div className="card bg-[#1b262c] w-full flex-1 h-full rounded-lg shadow-lg flex flex-col overflow-hidden lg:min-w-[350px] max-w-[400px]">
      <div className="tabs tabs-boxed flex flex-nowrap">
        {/* <a className={`p-2 w-full tab ${activeTab === 'statistic' ? 'tab-active text-white bg-[#1b262c]' : '!text-gray-500 bg-[#121c22]'}`}
          onClick={() => setActiveTab('match')}
        >
          Match
        </a> */}
        <a
          className={`p-2 w-full tab ${activeTab === 'history' ? 'tab-active text-white bg-[#1b262c]' : '!text-gray-500 bg-[#121c22]'}`}
          onClick={() => setActiveTab('history')}
        >
          Statistic
        </a>
        <a
          className={`p-2 w-full tab ${activeTab === 'newMatch' ? 'tab-active text-white bg-[#1b262c]' : '!text-gray-500 bg-[#121c22]'}`}
          onClick={() => (game ? null : setActiveTab('newMatch'))}
        >
          New Match
        </a>
      </div>

      <div className="card-body flex-1 overflow-y-auto p-4 rounded-[10px_10px_0_0] bg-[#1b262c]">
        {activeTab === 'summary' && game && (
          <div className="text-sm text-white space-y-2">
            <p>
              <span className="font-semibold">Cor:</span>{' '}
              {/* @ts-ignore */}
              {playerColor === ('white' as BoardOrientation)
                ? 'Branco'
                : 'Preto'}
            </p>
            <p>
              <span className="font-semibold">Turno Atual:</span>{' '}
              {game.turn() === 'w' ? 'Branco' : 'Preto'}
            </p>
            <p>
              <span className="font-semibold">Status:</span>{' '}
              {game.isGameOver() ? 'Finalizado' : 'Em andamento'}
            </p>
            <p>
              <span className="font-semibold">Chequemate:</span>{' '}
              {game.isCheckmate() ? 'Sim' : 'Não'}
            </p>
            <p>
              <span className="font-semibold">Empate:</span>{' '}
              {game.isDraw() ? 'Sim' : 'Não'}
            </p>
          </div>
        )}

        {activeTab === 'history' && <StatisticColumn />}

        {activeTab === 'newMatch' && (
          <div className="col-span-6 space-y-4">
            <div className="rounded-lg p-4 overflow-hidden inset-0 bg-gradient-to-r from-primary/10 to-secondary/10">
              {user ? (
                <>
                  <div className="flex flex-col items-center justify-center gap-4">
                    <h2 className="text-3xl font-bold mb-2 text-center">
                      A new era of Chess begins
                    </h2>
                    <p className="text-md font-bold mb-2">
                      Choose your ticket and go to the WARR!!!!
                    </p>
                    <div className="flex flex-col gap-2 w-full">
                      <Suspense fallback={<div>Loading queue manager...</div>}>
                        {/* <QueueManager /> */}
                        <MatchmakingButtons />
                      </Suspense>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 p-4">
                  <h2 className="text-3xl font-bold mb-2 text-center">
                    A new era of Chess begins
                  </h2>
                  <p className="text-md font-bold mb-2">
                    Connect your wallet. The warriors are coming.
                  </p>
                  <div className="flex flex-row gap-2">
                    <div className="flex gap-2">
                      <button className="btn relative transition-all duration-150 py-2 font-semibold rounded px-2 opacity-30 cursor-pointer">
                        0.00001 Aurion
                      </button>
                      <button className="btn relative transition-all duration-150 py-2 font-semibold rounded px-2 opacity-30 cursor-pointer">
                        0.00005 Aurion
                      </button>
                      <button className="btn relative transition-all duration-150 py-2 font-semibold rounded px-2 opacity-30 cursor-pointer">
                        0.00010 Aurion
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="bg-nivel-2 rounded-lg p-4">
              <h2 className="text-xl font-bold mb-2">Missions</h2>
              <p className="text-zinc-400">
                Coming soon!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
