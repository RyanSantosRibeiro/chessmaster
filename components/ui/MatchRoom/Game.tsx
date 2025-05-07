'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { useMatch } from '@/contexts/MatchContext';

type Props = {
  matchCode: string;
};

export default function GameRoom({ matchCode }: Props) {
  const supabase = createClient();
  const { user } = useAuth();
  const { match, status, sessionKey, playerColor, isMyTurn, pauseGame, drawGame, resumeGame, setIsMyTurn } = useMatch();
  const matchId = match?.id || null;
  

  const [game, setGame] = useState(new Chess());
  
  
  const [opponentOnline, setOpponentOnline] = useState(true);

  const gameRef = useRef<Chess>(game);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if(!match) return;
    const sessionState = sessionStorage.getItem(sessionKey);
        if (sessionState) {
          try {
            const parsed = JSON.parse(sessionState);
            const localGame = new Chess();
            localGame.load(parsed.fen);
            setGame(localGame);
          } catch {
            // Fallback: usa estado do Supabase
            if (match.fen) {
              const g = new Chess();
              g.load(match.fen);
              setGame(g);
            }
          }
        } else if (match.fen) {
          const g = new Chess();
          g.load(match.fen);
          setGame(g);
        }
  }, [user, match]);

  

  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  // // 2. Subscreve aos movimentos
  // useEffect(() => {
  //   if (!matchId || !user) return;

  //   const channel = supabase
  //     .channel('match_moves')
  //     .on(
  //       'postgres_changes',
  //       {
  //         event: 'INSERT',
  //         schema: 'public',
  //         table: 'match_moves',
  //         filter: `match_id=eq.${matchId}`,
  //       },
  //       (payload) => {
  //         const move = payload.new.move;
  //         const sender = payload.new.sender;

  //         if (sender !== user.id) {
  //           const newGame = new Chess(gameRef.current.fen());
  //           newGame.move({
  //             from: move.slice(0, 2),
  //             to: move.slice(2, 4),
  //             promotion: 'q',
  //           });
  //           setGame(newGame);
  //           persistGame(newGame);
  //           setIsMyTurn(true);
  //         }
  //       }
  //     )
  //     .subscribe();

  //   return () => {
  //     supabase.removeChannel(channel);
  //   };
  // }, [matchId, user]);

  // 3. Subscreve à presença e controla timeout
  useEffect(() => {
    if (!matchId || !user) return;

    const presenceChannel = supabase.channel(`presence:${matchId}`, {
      config: { presence: { key: user.id } },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const allPlayers = Object.keys(state || {});
        const opponentConnected = allPlayers.some((id) => id !== user.id);
        console.log({opponentConnected, allPlayers})
        setOpponentOnline(opponentConnected);

        if (!opponentConnected) {
          pauseGameWithTimeout();
        } else {
          clearTimeout(timerRef.current!);
          resumeGame();
        }
      })
      .subscribe(async () => {
        await presenceChannel.track({});
      });

    return () => {
      presenceChannel.unsubscribe();
    };
  }, [match, user]);

  const pauseGameWithTimeout = async () => {
    if (status === 'paused') return;

    pauseGame()
    await supabase.from('matches').update({ status: 'paused' }).eq('id', matchId);

    timerRef.current = setTimeout(async () => {
      drawGame()
      await supabase.from('matches').update({
        status: 'draw',
        pgn: gameRef.current.pgn(),
      }).eq('id', matchId);
      sessionStorage.removeItem(sessionKey);
    }, 45000);
  };

  

  // 4. Função de persistência híbrida (local + Supabase)
  const persistGame = async (g: Chess) => {
    const data = {
      fen: g.fen(),
      pgn: g.pgn(),
    };
    sessionStorage.setItem(sessionKey, JSON.stringify(data));

    await supabase.from('matches').update(data).eq('id', matchId);
  };

  // 5. Movimentação
  const makeMove = async (source: string, target: string) => {
    if (!isMyTurn || !playerColor || !matchId || status !== 'in_progress') return false;

    const newGame = new Chess(game.fen());
    const move = newGame.move({ from: source, to: target, promotion: 'q' });

    if (move) {
      setGame(newGame);
      setIsMyTurn(false);
      await persistGame(newGame);

      await supabase.from('match_moves').insert({
        match_id: matchId,
        move: source + target,
        sender: user.id,
      });

      return true;
    }

    return false;
  };

  return (
    <div className="col-span-6 bg-zinc-900 rounded-lg p-4">
      <div className="aspect-square bg-zinc-800 rounded-lg overflow-hidden relative">
        {playerColor && (
          <Chessboard
            position={game.fen()}
            boardOrientation={playerColor}
            onPieceDrop={makeMove}
            arePiecesDraggable={isMyTurn && status === 'in_progress'}
            animationDuration={200}
          />
        )}
        {status === 'paused' && (
          <div className="absolute inset-0 bg-black/70 text-white flex items-center justify-center text-xl">
            Aguardando jogador retornar... (até 45s)
          </div>
        )}
        {status === 'draw' && (
          <div className="absolute inset-0 bg-black/70 text-white flex items-center justify-center text-xl">
            Jogo finalizado: Empate por desconexão
          </div>
        )}
      </div>
    </div>
  );
}
