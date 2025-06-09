'use client';

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Chess, Color, Piece, PieceSymbol, Square } from 'chess.js';
import { createClient } from '@/utils/supabase/client';

export type PlayerTime = {
  white: number;
  black: number;
};

export type MatchContextType = ReturnType<typeof useMatchProvider>;

const MatchContext = createContext<MatchContextType | undefined>(undefined);

export const MatchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = useMatchProvider();
  return <MatchContext.Provider value={value}>{children}</MatchContext.Provider>;
};

export const useMatch = () => {
  const context = useContext(MatchContext);
  if (!context) {
    throw new Error('useMatch must be used within a MatchProvider');
  }
  return context;
};

function useMatchProvider() {
  const initialTime = {
    white: 100, // 5 min
    black: 100,
  };
  const [match, setMatch] = useState<any | null>(null);
  const [game, setGame] = useState<Chess | null>(null);
  const [visualPosition, setVisualPosition] = useState(null); 
  const [level, setLevel] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [firstMove, setFirstMove] = useState(false);
  const [playerColor, setPlayerColor] = useState<'w' | 'b'>('w');
  const [markedSquares, setMarkedSquares] = useState<Set<string>>(new Set());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  const [movePreview, setMovePreview] = useState<{ from: string; to: string }[]>([]);
  const chessboardRef = useRef<any>(null);
  const [time, setTime] = useState<PlayerTime>({ white: initialTime.white, black: initialTime.black });
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stockfish = useRef<Worker | null>(null);
  const supabase = createClient();
  const [channel, setChannel] = useState<any>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [startTimestamp, setStartTimestamp] = useState<number | null>(null);
  

  function changeFenTurn(fen: string, newTurn: 'w' | 'b'): string {
    const parts = fen.split(' ');
    if (parts.length < 2) throw new Error("FEN inválido");
    parts[1] = newTurn;
    return parts.join(' ');
  }

  // Recebe jogada do outro

  // Timer
  useEffect(() => {
  if (!hasStarted || !startTimestamp || game == null || game.isGameOver() || winner) return;

  timerRef.current = setInterval(() => {
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - startTimestamp) / 1000);

    setTime((prev) => {
      const currentTurn = game.turn() === 'w' ? 'white' : 'black';
      const timeLeft = Math.max(initialTime[currentTurn] - elapsedSeconds, 0);

      if (timeLeft === 0 && !winner) {
        setWinner(currentTurn === 'white' ? 'b' : 'w');
        clearInterval(timerRef.current!);
      }

      return {
        ...prev,
        [currentTurn]: timeLeft,
      };
    });
  }, 1000);

  return () => clearInterval(timerRef.current!);
}, [hasStarted, startTimestamp, game, winner]);




  function onSquareRightClick(square: string) {
    setMarkedSquares((prev) => {
      const updated = new Set(prev);
      if (updated.has(square)) {
        updated.delete(square);
      } else {
        updated.add(square);
      }
      return updated;
    });
  }

  function onPieceDragged(piece: string, square: string) {
    if(!game) return;
    if (selectedSquare && possibleMoves.includes(square)) {
      setSelectedSquare(null);
      setPossibleMoves([]);
    } else {
      try {
        const clone = new Chess(changeFenTurn(game.fen(), playerColor))

        const moves = clone.moves({ square, verbose: true });
        const hasPiece = game.get(square);
          if (moves?.length > 0) {
            setSelectedSquare(square);
            setPossibleMoves(moves.map((m) => m.to));
          } else {
            setSelectedSquare(null);
            setPossibleMoves([]);
          }
        } catch (error) {
          console.log(error)
        }
      }
  }

  const customSquareStyles = useMemo(() => {
    const styles: { [square: string]: React.CSSProperties } = {};
    for (const sq of possibleMoves) {
      styles[sq] = {
        backgroundColor: 'rgba(34,197,94,0.4)', // bg-green-500/40
      };
    }
    for (const mv of movePreview) {
      styles[mv.to] = {
        backgroundColor: 'rgba(234,179,8,0.2)', // yellow highlight
      };
    }
    for (const sq of Array.from(markedSquares)) {
      styles[sq] = {
        backgroundColor: 'rgba(239, 68, 68, 0.5)', // vermelho bg-red-500/50
      };
    }
  
    return styles;
  }, [possibleMoves, movePreview, markedSquares]);

  const makeMove = (sourceSquare, targetSquare,piece) => {
    if(!game) return;
    if(piece[0] != playerColor) return;
    if (isPaused || game.isGameOver() || winner) return;
    if (!firstMove) setFirstMove(true);
    const move = {
      from: sourceSquare,
      to: targetSquare,
      promotion: "q", // promoção automática para rainha
    };
    try {

      const result = game.move(move);
      if (result === null) return false; // movimento ilegal
      const newGame = new Chess(game.fen())
      setGame(newGame); // atualiza o estado do jogo
      sendMove(newGame.fen())
      return true;
    } catch (error) {
      console.log('Erro ao tentar mover peça:', error);
    }

  };


  // Cria Coneção
     useEffect(() => {
      if(!match) return;
      const channel = supabase.channel(`match-${match.url_hash}`, {
        config: {
          broadcast: {
            self: true,
          },
        },
      });
  
      channel
        .on('broadcast', { event: 'chat-message' }, (payload) => {
          console.log( {payload})
          const newGame = new Chess(payload.payload.fen)
          setGame(newGame); // atualiza o estado do jogo
          setTime(payload.payload.timeLeft)
          // if(playerColor == "w") {
          //   if(time.white != payload.payload.timeLeft) {
          //     setTime({black: time.black, white: payload.payload.timeLeft})
          //     }
          // } else {
          //   if(time.black != payload.payload.timeLeft) {
          //     setTime({white: time.white, black: payload.payload.timeLeft})
          //     }
          // }
        })
        .subscribe();
  
      return () => {
        supabase.removeChannel(channel);
      };
    }, [match]);

  const sendMove = async (fen:any) => {
    console.log("Send", fen)
    if(!match) return;
    const channel = supabase.getChannels().find((c) => c.topic === `realtime:match-${match.url_hash}`);

    if (channel) {
      await channel.send({
        type: 'broadcast',
        event: 'chat-message',
        payload: {
          fen,
          timeLeft: time
        },
      });
    }
  };



  // Controle
  const pause = () => {
    // const newGame = new Chess("rnb1kbnr/pppp1Qpp/8/4p3/8/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4");
    // const newGame = new Chess("8/8/8/8/8/8/8/K1k5 w - - 0 1");
    const newGame = new Chess("rnb1kbnr/pppp1ppp/8/4p3/4q3/5P2/PPPP2PP/RNBQKBNR w KQkq - 0 4");
    console.log({newGame: newGame?.isGameOver() || Boolean(winner), winner})
    setGame(newGame)
    // setIsPaused(true);
    // clearInterval(timerRef.current!);
  };

  const resume = () => {
    // setIsPaused(false)
  };

  const restart = () => {
    // const newGame = new Chess();
    chessboardRef.current?.clearPremoves()
    // setFirstMove(false);
    // setGame(newGame);
    // setFen(newGame.fen());
    // setIsPaused(false);
    // setWinner(null);
    // setTime({ white: initialTime, black: initialTime });
    // setMarkedSquares([])
  };

  return {
    match,
    startTimestamp, setStartTimestamp,
    hasStarted, setHasStarted,
    playerColor,
    setPlayerColor,
    setMatch,
    chessboardRef,
    setGame,
    game,
    fen: game?.fen(),
    makeMove,
    isPlayerTurn: game?.turn() == playerColor ? true : false,
    isPaused,
    gameOver: game?.isGameOver() || Boolean(winner),
    turn: game?.turn(),
    pause,
    resume,
    restart,
    setLevel,
    level,
    time,
    winner,
    playerColor,
    markedSquares, setMarkedSquares,onSquareRightClick,
    moveHistory: game?.history({ verbose: true }),
    onPieceDragged,
    possibleMoves,
    movePreview,
    customSquareStyles,
    setSelectedSquare,
    setPossibleMoves
  };
}
