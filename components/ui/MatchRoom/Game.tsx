'use client';

import { useEffect, useRef } from 'react';
import { Chessboard } from 'react-chessboard';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useMatch } from '@/contexts/MatchContext';
import { Chess } from 'chess.js';

export default function GameRoom() {
  const supabase = createClient();
  const { user } = useAuth();

  const {
    game,
    setGame,
    // @ts-ignore
    matchId,
    // @ts-ignore
    setMatchId,
    playerColor,
    setPlayerColor,
    // @ts-ignore
    isMyTurn,
    // @ts-ignore
    setIsMyTurn,
    // @ts-ignore
    setDisconnected,
    // @ts-ignore
    pauseGame,
    // @ts-ignore
    resumeGame,
    // @ts-ignore
    updateMoveHistory,
    // @ts-ignore
    status
  } = useMatch();

  const gameRef = useRef(game);

  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  // 1. Fetch match
  useEffect(() => {
    if (!user) return;

    const fetchMatch = async () => {
      const { data: match, error } = await supabase
        .from('matches')
        .select('*')
        // @ts-ignore
        .eq('url_hash', location.pathname.split('/').pop())
        .single();

      if (!match || error) return;

      setMatchId(match.id);
      const color = match.white_player_id === user.id ? 'white' : 'black';
      setPlayerColor(color);

      const newGame = new Chess();
      if (match.fen) newGame.load(match.fen);
      setGame(newGame);

      setIsMyTurn(color === 'white');
    };

    fetchMatch();
  }, [user]);

  // 2. Realtime broadcast and presence
  useEffect(() => {
    if (!matchId || !user) return;

    const channel = supabase.channel(`match-${matchId}`, {
      config: { presence: { key: user.id } },
    });

    console.log({broadcast: `match-${matchId}`})
    channel
      .on('broadcast', { event: 'new-move' }, ({ payload }) => {
        console.log("broadcast---> NEW MOVE")
        const move = payload.move;
        if(!gameRef?.current) return;
        
        try {
          const newGame = new Chess(gameRef.current.fen());
          newGame.move({ from: move.slice(0, 2), to: move.slice(2, 4), promotion: 'q' });
          setGame(newGame);
          setIsMyTurn(true);
          updateMoveHistory(move);
        } catch (error) {
          console.log(error)
        }
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        console.log("broadcast---> LEAVY")
        if (key !== user.id) {
          setDisconnected(true);
          pauseGame();
        }
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        console.log("broadcast---> JOIN")
        if (key !== user.id) {
          setDisconnected(false);
          resumeGame();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, user]);

  // 3. Make move
  const makeMove = (source: string, target: string) => {
    if (!isMyTurn || !matchId || !playerColor || !game) return false;
    

    try {
      const newGame = new Chess(game.fen());
      const move = newGame.move({ from: source, to: target, promotion: 'q' });
      if (move) {
        setGame(newGame);
        setIsMyTurn(false);
        updateMoveHistory(source + target);
  
        sessionStorage.setItem(`match-${matchId}-fen`, newGame.fen());
        sessionStorage.setItem(`match-${matchId}-history`, JSON.stringify(newGame.history()));
  
        console.log({broadcast: "send-new-move"})
        supabase
          .from('matches')
          // @ts-ignore
          .update({ fen: newGame.fen() })
          .eq('id', matchId);
  
        supabase.channel(`match-${matchId}`).send({
          type: 'broadcast',
          event: 'new-move',
          payload: { move: source + target },
        });
  
        return true;
      }
    } catch (error) {
      console.log(error)
    }

   

    return false;
  };

  return (
    <div className="col-span-6 bg-zinc-900 rounded-lg p-4">
      <div className="aspect-square bg-zinc-800 rounded-lg overflow-hidden relative">
        {playerColor && (
          <Chessboard
          // @ts-ignore
            position={game.fen()}
            boardOrientation={playerColor}
            onPieceDrop={makeMove}
            arePiecesDraggable={isMyTurn}
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
