'use client';

import { useChessVsBot } from '@/contexts/GameBot';
import { Chessboard } from 'react-chessboard';
import { useEffect, useMemo, useState } from 'react';
import PlayerCard from '../Player/Card';
import GameStatus from '../Game/GameOver';
import Controls from '../Controls/Controls';
import { Chess } from 'chess.js';
import { useWallet } from '@/contexts/WalletContext';

export default function ChessVsBot() {
  const {
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
    onSquareRightClick,
    setPossibleMoves,
    customSquareStyles,
    onPieceDragged,
    setGame,
    chessboardRef
  } = useChessVsBot();
  const { user } = useWallet()

  // function onDrop(sourceSquare, targetSquare, piece) {
  //   const move = {
  //     from: sourceSquare,
  //     to: targetSquare,
  //     promotion: "q", // promoção automática para rainha
  //   };

  //   const result = game.move(move);
  //   if (result === null) return false; // movimento ilegal
  //   setGame(new Chess(game.fen())); // atualiza o estado do jogo
  //   return true;
  // }

  return (
    <div className="flex flex-col items-center gap-4 h-full max-h-full">
      <div className="w-full flex items-start justify-between">
        <PlayerCard
          time={time.black}
          name="Bot Magnus"
          isBot
          botLevel={level}
          isTurn={!isPlayerTurn ? 'Your turn' : null}
          onBotLevelChange={(level) => {
            setLevel(level);
            restart();
          }}
        />
        <Controls
          stop={() => pause()}
          resume={() => resume()}
          restart={() => restart()}
          isPaused={isPaused}
        />
      </div>

      <div className="w-auto h-full aspect-square relative rounded-sm overflow-hidden bg-[#121c22] flex">
        {winner && <GameStatus result="gameWin" />}
        {gameOver && <GameStatus result="gameOver" />}
        {isPaused && <GameStatus result="gamePause" />}

        <Chessboard
          ref={chessboardRef}
          position={fen}
          // position={fen}
          animationDuration={200}
          arePremovesAllowed={true}
          // onPieceDrop={onDrop}
          onPieceDrop={makeMove}
          onSquareRightClick={onSquareRightClick}
          onPieceDragBegin={onPieceDragged}
          onPieceDragEnd={() => setPossibleMoves([])}
          customSquareStyles={customSquareStyles}
        />
      </div>

      <div className="w-full flex items-end justify-end">
        <PlayerCard
            time={time.white} 
            name={user?.username || 'Jhon jones'}
            trophies={user?.trophies}
            isTurn={isPlayerTurn ? 'Your Turn' : null}
            isCheck={(isPlayerTurn && game?.inCheck()) || false}
            align="right"
            image={user?.avatar_url}
          />
      </div>
    </div>
  );
}
