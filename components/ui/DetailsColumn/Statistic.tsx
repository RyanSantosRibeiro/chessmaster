'use client';

import { useChessVsBot } from '@/contexts/GameBot';
import { useMatch } from '@/contexts/MatchContext';
import { useEffect, useRef, useState } from 'react';

export default function StatisticColumn() {
  const { moveHistory: moveHistoryBot } = useChessVsBot();
  const { history } = useMatch();
  const [filter, setFilter] = useState<'all' | 'white' | 'black'>('all');
  const bottomRef = useRef<HTMLDivElement>(null);
  const currentHistory = history?.length > 0 ? history : moveHistoryBot;


  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [moveHistoryBot]);

  const filteredMoves = currentHistory.filter((move) => {
    if (filter === 'all') return true;
    return move.color === (filter === 'white' ? 'w' : 'b');
  });

  const toggleFilter = () => {
    setFilter((prev) =>
      prev === 'all' ? 'white' : prev === 'white' ? 'black' : 'all'
    );
  };

  return (
    <div className="card bg-base-200 w-full flex-1 h-full rounded-lg shadow-lg flex flex-col overflow-hidden">
      <div className="p-4 flex items-center justify-between border-b border-base-300">
        <span className="text-white font-semibold">Moves</span>
        <button className="btn btn-sm btn-outline btn-primary" onClick={()=>setFilter("all")}>
          All
        </button>
        <button className="btn btn-sm btn-outline btn-[white]" onClick={()=>setFilter("white")}>
          White
        </button>
        <button className="btn btn-sm btn-outline btn-warning" onClick={()=>setFilter("black")}>
          Black
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 text-white text-sm">
        {filteredMoves.map((data, index) => {
          const { move } = data;
          return (
          <div
            key={index}
            className={`flex justify-between p-2 rounded ${
              index % 2 === 0 ? 'bg-base-100' : 'bg-base-300/20'
            }`}
          >
            <span className="text-gray-400">{Math.floor(index / 2) + 1} {move.color === 'w' ? '⬜' : '⬛'}</span>
            <span>
              {move.color === 'w' ? '♙' : '♟'} {move.san}
            </span>
          </div>
        )
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
