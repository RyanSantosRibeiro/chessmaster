'use client';

import { Suspense, useState } from 'react';
import { useMatch } from '@/contexts/MatchContext';
import MatchRoomChat from '../MatchRoom/Chat';
import { useAuth } from '@/contexts/AuthContext';
import QueueManager from '../Queue/QueueManager';

type Props = {
  matchCode?: string;
};

export default function ComunityColumn({ matchCode }: Props) {
  const { game, moveHistory, playerColor } = useMatch();
  const [activeTab, setActiveTab] = useState('summary');
  const { user } = useAuth()

  return (
    <div className="card bg-base-100 w-full flex-1 h-full rounded-lg shadow-lg flex flex-col overflow-hidden">
      <div className="tabs tabs-boxed flex flex-nowrap">
        {matchCode && <a
          className={`p-2 w-full tab ${activeTab === 'summary' ? 'tab-active text-white bg-base-100' : '!text-gray-500 bg-base-300'}`}
          onClick={() => setActiveTab('summary')}
        >
          Resumo
        </a>}
        <a
          className={`p-2 w-full tab ${activeTab === 'history' ? 'tab-active text-white bg-base-100' : '!text-gray-500 bg-base-300'}`}
          onClick={() => setActiveTab('history')}
        >
          Lances
        </a>
        <a
          className={`p-2 w-full tab ${activeTab === 'chat' ? 'tab-active text-white bg-base-100' : '!text-gray-500 bg-base-300'}`}
          onClick={() => setActiveTab('chat')}
        >
          Chat
        </a>
      </div>

      <div className="card-body flex-1 overflow-y-auto p-4 rounded-[10px_10px_0_0] bg-base-100">
        {activeTab === 'summary' && game ? (
          <div className="text-sm text-white space-y-2">
            <p><span className="font-semibold">Cor:</span> {playerColor === 'white' ? 'Branco' : 'Preto'}</p>
            <p><span className="font-semibold">Turno Atual:</span> {game.turn() === 'w' ? 'Branco' : 'Preto'}</p>
            <p><span className="font-semibold">Status:</span> {game.isGameOver() ? 'Finalizado' : 'Em andamento'}</p>
            <p><span className="font-semibold">Chequemate:</span> {game.isCheckmate() ? 'Sim' : 'Não'}</p>
            <p><span className="font-semibold">Empate:</span> {game.isDraw() ? 'Sim' : 'Não'}</p>
          </div>
        ): <></>}

        {activeTab === 'history' && (
          <div className="text-white text-sm">
            {moveHistory?.length === 0 ? (
              <p>Nenhum lance ainda.</p>
            ) : (
              <ol className="list-decimal list-inside space-y-1">
                {moveHistory?.map((move, index) => {
                  return (
                    <li key={index}>{`${move}`}</li>
                  )
                })}
              </ol>
            )}
          </div>
        )}

        {activeTab === 'newMatch' && (
          <div className="col-span-6 space-y-4">
            <div className="bg-nivel-2 rounded-lg p-4">
              {user ? (
                <>
                  <h2 className="text-xl font-bold mb-2">Welcome, {user.email}</h2>
                  <p className="text-zinc-400 mb-4">Choose your game:</p>
                  <Suspense fallback={<div>Loading queue manager...</div>}>
                    <QueueManager />
                  </Suspense>
                </>
              ) : (
                <h2 className="text-xl font-bold mb-2">Please connect wallet to play</h2>
              )}
            </div>
            <div className="bg-nivel-2 rounded-lg p-4">
              <h2 className="text-xl font-bold mb-2">🏆 Scoreboard 3</h2>
              <p className="text-zinc-400">Your current position on scoreboard</p>
            </div>
          </div>
        )}
      </div>
      <div className="h-aut flex flex-col">
            <MatchRoomChat matchId={matchCode || "bot"} />
      </div>
    </div>
  );
}
