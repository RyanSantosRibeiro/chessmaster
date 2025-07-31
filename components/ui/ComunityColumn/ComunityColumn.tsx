'use client';

import { Suspense, useState } from 'react';
import { useMatch } from '@/contexts/MatchContext';
import MatchRoomChat from '../MatchRoom/Chat';
import { useAuth } from '@/contexts/AuthContext';
import QueueManager from '../Queue/QueueManager';
import bg from '@/app/bg.png';
import Scoreboard from '../Scoreboard';

type Props = {
  matchCode?: string;
};

export default function ComunityColumn({ matchCode }: Props) {
  const { game, moveHistory, playerColor } = useMatch();
  const [activeTab, setActiveTab] = useState('summary');
  const { user } = useAuth();

  return (
    <div className="card bg-[#1b262c] w-full flex-1 h-full rounded-lg shadow-lg flex flex-col overflow-hidden lg:min-w-[350px] max-w-[400px]">
      <div className="card-body flex-1 overflow-y-auto p-4 rounded-[10px_10px_0_0] bg-[#1b262c] relative">
        <div className="relative flex overflow-hidden rounded-2xl shadow-xl group transition-transform duration-300 hover:scale-[1.02]">
          <img
            src={bg.src}
            alt="Fair and Secure Gaming"
            className="w-full max-h-[400px] object-cover brightness-75 group-hover:brightness-90 transition duration-300"
            width={300}
            height={200}
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />

          {/* Text content */}
          <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center text-center px-4 gap-2 animate-fade-in">
            <span className="text-white text-2xl md:text-4xl font-extrabold drop-shadow-lg transition-opacity duration-700 opacity-90 group-hover:opacity-100">
              ⚔️ Big Update
            </span>
            <span className="text-white text-xl md:text-2xl italic font-semibold opacity-80 transition-opacity duration-700 group-hover:opacity-100">
              July 30, 2025
            </span>
          </div>
        </div>

        <div className="relative w-full">
          <Scoreboard />
        </div>
      </div>
      <div className="h-aut flex flex-col">
        <MatchRoomChat matchId={matchCode || 'bot'} />
      </div>
    </div>
  );
}
