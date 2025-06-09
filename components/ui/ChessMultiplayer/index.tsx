'use client';

import { useChessVsBot } from '@/contexts/GameBot';
import { Chessboard } from 'react-chessboard';
import { useEffect, useMemo, useState } from 'react';
import PlayerCard from '../Player/Card';
import GameOver from '../Game/GameOver';
import Controls from '../Controls/Controls';
import { Chess } from 'chess.js';
import { useMatch } from '@/contexts/MatchContext';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/utils/supabase/client';
import LoadingDots from '../LoadingDots';

export default function ChessMultiplayer(matchData : any) {
  const { user } = useAuth()
  
  const {
    match,
    setMatch,
    fen,
    makeMove,
    isPlayerTurn,
    gameOver,
    restart,
    setLevel,
    level,
    time,
    winner,
    pause,
    resume,
    isPaused,
    game,
    playerColor,
    onSquareRightClick,
    setPossibleMoves,
    customSquareStyles,
    onPieceDragged,
    setGame,
    chessboardRef,
    setPlayerColor,
    hasStarted, setHasStarted,
    setStartTimestamp,
    turn
  } = useMatch();
  const [opponent, setOpponent] = useState<any | null>(null);

const playerIds = [matchData?.match?.white_player_id, matchData?.match?.black_player_id]; // defina baseado na partida

  
  useEffect(() => {
    console.log({matchData, match, user})
    if((!matchData || !user) || game) return;
    setPlayerColor(matchData?.match?.white_player_id == user.id ? "w" : "b")
    setMatch(matchData.match);
    setOpponent(matchData.match.black_player)
    setGame(new Chess())
  }, [match, user]);
  const supabase = createClient();
  
  

  // StartGame
    useEffect(() => {
      const matchChannel = supabase.channel(`room-${matchData?.match?.url_hash}`, {
        config: {
          presence: { key: user?.id },
        },
      });
  
      const cleanup = async () => {
        try {
          await matchChannel.unsubscribe();
        } catch (err) {
          console.error("Erro ao sair da fila:", err);
        }
      };

      matchChannel
      .on('presence', { event: 'sync' }, () => {
        const state = matchChannel.presenceState();
        const onlinePlayers = Object.keys(state);

        // Verifica se ambos estão online
        const bothOnline = playerIds.every(id => onlinePlayers.includes(id));
        console.log({bothOnline, playerIds})
        if (bothOnline && !hasStarted) {
          const now = Date.now(); // timestamp em ms
          setHasStarted(true);
          setStartTimestamp(now);

          // Só o white envia o timestamp (responsável)
          console.log("Send Start!", user?.id, matchData.white_player_id)
          if (user?.id === matchData?.white_player_id) {
            matchChannel.send({
              type: 'broadcast',
              event: 'start-timer',
              payload: { timestamp: now },
            });
          }
        }
      })
      .on('broadcast', { event: 'start-timer' }, ({ payload }) => {
        console.log("Start!!!")
        setStartTimestamp(payload.timestamp);
        setHasStarted(true);
      })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log("🟢 JOIN:", key, newPresences);
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log("🔴 LEAVE:", key, leftPresences);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await matchChannel.track({
              user_id: user?.id
            });
          }
        });
    }, []);

  if(!match || !user) {
    return (
      <div className="flex flex-col items-center gap-4 h-full max-h-full">
        <LoadingDots />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4 h-full max-h-full">
      <div className="w-full flex items-start justify-between">
        <PlayerCard
          time={playerColor == "w" ? time.black : time.white}
          name={opponent?.full_name || "Jhon jones"}
          trophies={opponent?.rank_points} 
          isTurn={!isPlayerTurn ? "Turno" : null}
        />
        <Controls stop={() => pause()} resume={() => resume()} restart={() => restart()} isPaused={isPaused} />
      </div>

      <div className="w-auto h-full aspect-square relative rounded-sm overflow-hidden bg-base-200 flex">
        {winner == playerColor && <GameOver type="game_win" />}
        {gameOver && winner != playerColor && <GameOver type="game_over" />}
        {winner==null && gameOver && <GameOver type="game_pause" />}
        {isPaused && <GameOver type="game_pause" />}
        <Chessboard
          ref={chessboardRef}
          className="w-full h-full"
          position={fen}
          // position={fen}
          animationDuration={200}
          arePremovesAllowed={true}
          boardOrientation={playerColor == "w" ? "white" : "black"}
          // onPieceDrop={onDrop}
          onPieceDrop={makeMove}
          onPromotionPieceSelect={(piece, promoteFromSquare, promoteToSquare) => console.log({piece, promoteFromSquare, promoteToSquare})}
          onSquareRightClick={onSquareRightClick}
          onPieceDragBegin={onPieceDragged}
          onPieceDragEnd={() => setPossibleMoves([])}
          customSquareStyles={customSquareStyles}
          boardStyle={{
            borderRadius: '0.375rem', // rounded-sm
            boxShadow: '0 0 0 2px #e5e7eb',
          }}
        />
      </div>

      <div className="w-full flex items-end justify-end">
        <PlayerCard 
        time={playerColor == "w" ? time.white : time.black} 
        name={match?.black_player?.full_name || "Jhon jones"}
        trophies={match?.black_player?.rank_points} 
        isTurn={isPlayerTurn ? "Sua vez" : null} align="right" />
      </div>
    </div>
  );
}
