'use client';

import Link from 'next/link';

interface Props {
  result: string | null;
  stats?: any;
}

export default function GameStatus({ result, stats }: Props) {
  if (!result) return null;

  if (result === 'gameWin') {
    return (
      <div className="fadeIn absolute w-full h-full flex justify-center items-center z-30 ">
        <div className="card w-full max-w-[300px] p-6 text-white text-center shadow-lg border border-yellow-400 bg-gradient-to-br from-green-600 to-yellow-400">
          <div className="text-5xl mb-2">🏆</div>
          <h2 className="text-3xl font-bold mb-2">Victory!</h2>
          <p className="text-lg mb-4">You dominated the arena</p>
          {stats && (
            <div className="flex flex-row justify-around mb-3">
              <p className="text-sm">🏆 +{stats?.trophies || '-'}</p>
              <p className="text-sm">🪙 +{stats?.token || '-'}</p>
              <p className="text-sm">⚡️ +{stats?.level || '-'}</p>
            </div>
          )}
          <Link href="/play" className="btn btn-sm btn-warning">
            {' '}
            Play Again
          </Link>
        </div>
      </div>
    );
  }

  if (result === 'gameLose') {
    return (
      <div className="fadeIn absolute w-full h-full flex justify-center items-center z-30 border-none">
        <div className="card w-full max-w-[300px] p-6 text-white text-center shadow-lg bg-[#1b1b1b]">
          <div className="text-5xl mb-2">❌</div>
          <h2 className="text-3xl font-bold mb-2">Defeat</h2>
          <p className="text-lg mb-4">You’ve won this battle… rise stronger!</p>
          <Link href="/play" className="btn btn-sm btn-primary">
            {' '}
            Play Again
          </Link>
        </div>
      </div>
    );
  }

  if (result === 'gameDrawn') {
    return (
      <div className="fadeIn absolute w-full h-full flex justify-center items-center z-30 border-none">
        <div className="card w-full max-w-[300px] p-6 text-white text-center shadow-lg bg-[#1b1b1b]">
          <h2 className="text-3xl font-bold mb-2">Stalemate</h2>
          <p className="text-lg mb-4">
            An even match. One more game could change everything.
          </p>
          <button
            className="btn btn-sm btn-warning"
            onClick={() => window.location.reload()}
          >
            Play again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute w-full h-full flex justify-center items-center z-30 bg-[#1b1b1b]">
      <div className="card border-base-300 w-full max-w-[300px] p-4 flex flex-col items-center justify-center">
        <p className="card-title text-3xl text-center text-white">
          {'Erro no servidor!'}
        </p>
        <div className="flex gap-2 mt-3">
          <button
            className="btn btn-sm btn-error"
            onClick={() => window.location.reload()}
          >
            Recarregar
          </button>
        </div>
      </div>
    </div>
  );
}
