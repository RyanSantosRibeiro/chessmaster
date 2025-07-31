'use client';

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Chess, Color, Piece, PieceSymbol, Square } from 'chess.js';

export type PlayerTime = {
  white: number;
  black: number;
};

export type ChessVsBotContextType = ReturnType<typeof useChessVsBotProvider>;

const ChessVsBotContext = createContext<ChessVsBotContextType | undefined>(undefined);

export const ChessVsBotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = useChessVsBotProvider();
  return <ChessVsBotContext.Provider value={value}>{children}</ChessVsBotContext.Provider>;
};

export const useChessVsBot = () => {
  const context = useContext(ChessVsBotContext);
  if (!context) {
    throw new Error('useChessVsBot must be used within a ChessVsBotProvider');
  }
  return context;
};

function useChessVsBotProvider() {
  const [game, setGame] = useState(() => new Chess());
  const [fen, setFen] = useState(game.fen());
  const [visualPosition, setVisualPosition] = useState(null); 
  const [level, setLevel] = useState(3);
  const [history, setHistory] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [firstMove, setFirstMove] = useState(false);
  const [playerColor, setPlayerColor] = useState<'white' | 'black'>('white');
  const [markedSquares, setMarkedSquares] = useState<Set<string>>(new Set());
  const initialTime = 300;
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  const [movePreview, setMovePreview] = useState<{ from: string; to: string }[]>([]);
  const chessboardRef = useRef<any>(null);
  const [time, setTime] = useState<PlayerTime>({ white: initialTime, black: initialTime });
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stockfish = useRef<Worker | null>(null);

  function isMoveLegalIgnoringTurn(game:any, from:any, to:any, promotion = 'q') {
    const fenParts = game.fen().split(' ');
    // Inverte o turno
    fenParts[1] = fenParts[1] === 'w' ? 'b' : 'w';
    const fakeFen = fenParts.join(' ');
    
    const clone = new Chess(fakeFen);
    const move = clone.move({ from, to, promotion });
  
    return !!move;
  }

  function changeFenTurn(fen: string, newTurn: 'w' | 'b'): string {
    const parts = fen.split(' ');
    if (parts.length < 2) throw new Error("FEN inválido");
    parts[1] = newTurn;
    return parts.join(' ');
  }

  // Inicia bot
  useEffect(() => {
    stockfish.current = new Worker('/stockfish.js');
    stockfish.current.postMessage('uci');
    stockfish.current.postMessage(`setoption name Skill Level value ${level}`);
    stockfish.current.postMessage('isready');
    return () => stockfish.current?.terminate();
  }, [level]);

  // Timer
  useEffect(() => {
    if (isPaused || game.isGameOver() || winner || !firstMove) return;
    timerRef.current = setInterval(() => {
      setTime((prev) => {
        const currentTurn = game.turn() === 'w' ? 'white' : 'black';
        const newTime = {
          ...prev,
          [currentTurn]: Math.max(prev[currentTurn] - 1, 0),
        };
        if (newTime[currentTurn] === 0) {
          setWinner(currentTurn === 'white' ? 'black' : 'white');
          clearInterval(timerRef.current!);
        }
        return newTime;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [ isPaused, winner, game,fen]);

  useEffect(() => {
    const lastMoves = game.history({ verbose: true }).slice(-2); // pega as últimas jogadas (do bot ou do jogador)
    const preview = lastMoves.map((m) => ({ from: m.from, to: m.to }));
    setMovePreview(preview);
  }, [fen]);

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

  function onPieceDragged(piece: string, square: Square) {
    if(!square) return;
    if (selectedSquare && possibleMoves.includes(square)) {
      setSelectedSquare(null);
      setPossibleMoves([]);
    } else {
      try {
        const clone = new Chess(changeFenTurn(game.fen(), "w"))

        // Atualizando posição
        // const pieceToGet = {
        //   type: piece[1] as PieceSymbol,
        //   color: piece[0] as Color
        // }
        // Atualizando posição
        // const getPiece = clone.findPiece(pieceToGet)
        // const pieceToPut = clone.remove(square);
        // if(pieceToPut ) {
        //   clone.put(pieceToPut, square);
        // }


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

  const makeMove = (sourceSquare:any , targetSquare: any) => {
    if (isPaused || game.isGameOver() || winner) return false;
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
      const hist = game.history()
      // setHistory(history=>[...history, hist[0]])

      setGame(game); // atualiza o estado do jogo
      setFen(game.fen());
      requestBotMove();
      return true;
    } catch (error) {
      console.log('Erro ao tentar mover peça:', error);
      return false
    }

  };

  const requestBotMove = () => {
    if (isPaused || game.isGameOver() || winner) return;
    setTimeout(() => {
      stockfish.current?.postMessage(`position fen ${game.fen()}`);
      stockfish.current?.postMessage('go depth 12');
    }, 3000);
  };

  useEffect(() => {
    if (!stockfish.current) return;

    stockfish.current.onmessage = (event) => {
      if (isPaused || game.isGameOver() || winner) return;
      const message = event.data as string;

      try {
        if (message.startsWith('bestmove')) {
          const [_, move] = message.split(' ');
          if (move && move !== '(none)') {
            const from = move.slice(0, 2);
            const to = move.slice(2, 4);
            const promotion = move.slice(4);
  
            game.move({ from, to, promotion: promotion || undefined });
            
            setFen(game.fen());
          }
        }
      } catch (error) {
        console.log('Bot - Erro ao movimentar', error)
      }
    };
  }, [game, isPaused, winner]);


  // Controle
  const pause = () => {
    setIsPaused(true);
    clearInterval(timerRef.current!);
  };

  const resume = () => setIsPaused(false);

  const restart = () => {
    const newGame = new Chess();
    chessboardRef.current?.clearPremoves()
    setFirstMove(false);
    setGame(newGame);
    setFen(newGame.fen());
    setIsPaused(false);
    setWinner(null);
    setTime({ white: initialTime, black: initialTime });
    setMarkedSquares(new Set())
  };

  return {
    chessboardRef,
    setGame,
    game,
    fen,
    makeMove,
    isPlayerTurn: game.turn() == 'w' ? true : false,
    isPaused,
    gameOver: game.isGameOver() || Boolean(winner),
    turn: game.turn(),
    pause,
    resume,
    restart,
    setLevel,
    level,
    time,
    winner,
    playerColor,
    markedSquares, setMarkedSquares,onSquareRightClick,
    moveHistory: game.history({verbose: true}),
    onPieceDragged,
    possibleMoves,
    movePreview,
    customSquareStyles,
    setSelectedSquare,
    setPossibleMoves
  };
}
