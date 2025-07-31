'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { Chess, Color, Piece, PieceSymbol, Square } from 'chess.js';
import { createClient } from '@/utils/supabase/client';
import { BoardOrientation } from 'react-chessboard/dist/chessboard/types';
import { updateMatch } from '@/utils/supabase/queries';

export type PlayerTime = {
  white: number;
  black: number;
};

export type MatchContextType = ReturnType<typeof useMatchProvider>;

const MatchContext = createContext<MatchContextType | undefined>(undefined);

export const MatchProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const value = useMatchProvider();
  return (
    <MatchContext.Provider value={value}>{children}</MatchContext.Provider>
  );
};

export const useMatch = () => {
  const context = useContext(MatchContext);
  if (!context) {
    throw new Error('useMatch must be used within a MatchProvider');
  }
  return context;
};

function useMatchProvider() {
  const [match, setMatch] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [game, setGame] = useState<Chess | null>(null);
  const [level, setLevel] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [firstMove, setFirstMove] = useState(false);
  const [playerColor, setPlayerColor] = useState<Color>('w');
  const [markedSquares, setMarkedSquares] = useState<Set<string>>(new Set());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  const [movePreview, setMovePreview] = useState<
    { from: string; to: string }[]
  >([]);
  const chessboardRef = useRef<any>(null);
  const [time, setTime] = useState<PlayerTime | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [startTimestamp, setStartTimestamp] = useState<number | null>(null);
  const supabase = createClient();

  function changeFenTurn(fen: string, newTurn: 'white' | 'black'): string {
    const parts = fen.split(' ');
    if (parts.length < 2) throw new Error('FEN inválido');
    parts[1] = newTurn;
    return parts.join(' ');
  }

  const sendResult = async (status: string) => {
    if (!match || !status || status == null) return;

    try {
      const payload = {
        winner_id: status == "draw" ? "draw" : status == 'w' ? match.white_player_id : match.black_player_id,
        match: match.id,
        fen: game?.fen(),
        status: 'completed',
        completed_at: new Date().toISOString()
      };
      const response = await updateMatch(payload);

      if (!response.ok) throw new Error('Error on update match');
    } catch (error) {
      console.log('Error on update match', error);
    }
  };

  // Timer
  useEffect(() => {
    if (
      !startTimestamp ||
      !game ||
      game.isGameOver() ||
      result ||
      time == null ||
      !hasStarted
    )
      return;

    let lastUpdate = Date.now();

    timerRef.current = setInterval(() => {
      const now = Date.now();
      const delta = Math.floor((now - lastUpdate) / 1000);

      if (delta > 0) {
        lastUpdate = now;
        // @ts-ignore
        setTime((prev) => {
          const currentTurn =
            game.turn() === ('w' as Color) ? 'white' : 'black';
            // @ts-ignore
          const newTime = Math.max(prev[currentTurn] - delta, 0);

          if (newTime === 0 && !result) {
            setResult(currentTurn === 'white' ? 'b' : 'w');
            clearInterval(timerRef.current!);
          }

          return {
            ...prev,
            [currentTurn]: newTime
          };
        });
      }
    }, 1000);

    return () => clearInterval(timerRef.current!);
  }, [game, result, startTimestamp, hasStarted]);

  // Timer
  useEffect(() => {
    if (!game || !game.isGameOver()) return;

    // Cheque-mate
    if (game.isCheckmate()) {
      const loser = game.turn(); // quem teria jogado agora perdeu
      const winnerColor = loser === 'w' ? 'b' : 'w';
      setResult(winnerColor);
      sendResult(winnerColor);
      return;
    }

    // Empates
    if (game.isStalemate() || game.isDraw() || game.isInsufficientMaterial()) {
      console.log('Empate');
      sendResult('draw');
      return;
    }

    // Fallback
    console.warn('Partida finalizada sem resultado definido.');
  }, [game]);

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
    if (!game) return;
    if (selectedSquare && possibleMoves.includes(square)) {
      setSelectedSquare(null);
      setPossibleMoves([]);
    } else {
      try {
        const clone = new Chess(game.fen());

        const moves = clone.moves({ square, verbose: true });
        if (moves?.length > 0) {
          setSelectedSquare(square);
          setPossibleMoves(moves.map((m) => m.to));
        } else {
          setSelectedSquare(null);
          setPossibleMoves([]);
        }
      } catch (error) {
        console.log('onPieceDragged:', error);
      }
    }
  }

  const customSquareStyles = useMemo(() => {
    const styles: { [square: string]: React.CSSProperties } = {};
    for (const sq of possibleMoves) {
      styles[sq] = {
        backgroundColor: 'rgba(34,197,94,0.4)' // bg-green-500/40
      };
    }
    for (const mv of movePreview) {
      styles[mv.to] = {
        backgroundColor: 'rgba(234,179,8,0.2)' // yellow highlight
      };
    }
    for (const sq of Array.from(markedSquares)) {
      styles[sq] = {
        backgroundColor: 'rgba(239, 68, 68, 0.5)' // vermelho bg-red-500/50
      };
    }

    return styles;
  }, [possibleMoves, movePreview, markedSquares]);

  const saveMove = async ({
    player_id,
    match_id,
    move,
    timestamp,
    fen,
    time_left
  }: {
    player_id: string;
    match_id: string;
    move: any;
    timestamp: string;
    fen: string;
    time_left: number;
  }) => {
    try {
      const { data: saveMove } = await supabase
        // @ts-ignore
        .from('match_moves')
        .insert({
          // @ts-ignore
          player_id,
          match_id,
          move,
          timestamp,
          fen,
          time_left
        });
    } catch (error) {
      console.log('Error on send move:', error);
    }
  };

  const addToHistory = ({
    player_id,
    match_id,
    move,
    timestamp,
    fen,
    time_left
  }: {
    player_id: string;
    match_id: string;
    move: any;
    timestamp: string;
    fen: string;
    time_left: number;
  }) => {
    setHistory((prev) => [
      {
        player_id,
        match_id,
        move,
        timestamp,
        fen,
        time_left
      },
      ...prev
    ]);
  };

  const makeMove = (sourceSquare: Square, targetSquare: Square, piece: any) => {
    if (!game) return false;
    if (piece[0] != playerColor) return false;
    if (isPaused || game.isGameOver() || result) return false;
    if (!firstMove) setFirstMove(true);
    const move = {
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q' // promoção automática para rainha
    };
    try {
      const currentTurn = game.turn() === ('w' as Color) ? 'white' : 'black';
      const result = game.move(move);
      if (result === null) return false; // movimento ilegal
      const newGame = new Chess(game.fen());

      setGame(newGame); // atualiza o estado do jogo
      sendMove(newGame.fen());
      const payload = {
        player_id:
          playerColor == 'w' ? match?.white_player_id : match?.black_player_id,
        match_id: match?.id,
        move: result,
        timestamp: new Date().toISOString(),
        fen: game.fen(),
        time_left: time ? time[currentTurn] : 0
      };
      saveMove(payload);
      addToHistory(payload);

      return true;
    } catch (error) {
      console.log('Erro ao tentar mover peça:', error);
      return false;
    }
  };

  // Cria Coneção
  useEffect(() => {
    if (!match) return;
    const channel = supabase.channel(`match-${match.url_hash}`, {
      config: {
        broadcast: {
          self: true
        }
      }
    });

    channel
      .on('broadcast', { event: 'chat-message' }, (payload) => {
        const newGame = new Chess(payload.payload.fen);
        setGame(newGame); // atualiza o estado do jogo
        setTime(payload.payload.time);
        // setTime(payload.payload.timeLeft);
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

  const sendMove = async (fen: any) => {
    if (!match) return;
    const channel = supabase
      .getChannels()
      .find((c) => c.topic === `realtime:match-${match.url_hash}`);

    if (channel) {
      await channel.send({
        type: 'broadcast',
        event: 'chat-message',
        payload: {
          fen,
          time
        }
      });
    }
  };

  // Controle
  const pause = () => {
    // const newGame = new Chess("rnb1kbnr/pppp1Qpp/8/4p3/8/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4");
    // const newGame = new Chess("8/8/8/8/8/8/8/K1k5 w - - 0 1");
    const newGame = new Chess(
      'r1bB1b1r/1pp4p/pn4p1/1B2Np2/2P5/1Q2kP2/PP2N1PP/R3K2R b KQ - 2 17'
    );
    setGame(newGame);
    // setIsPaused(true);
    // clearInterval(timerRef.current!);
  };

  const resume = () => {
    // setIsPaused(false)
  };

  const restart = () => {
    // const newGame = new Chess();
    chessboardRef.current?.clearPremoves();
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
    startTimestamp,
    setHistory,
    setStartTimestamp,
    playerColor,
    history,
    setTime,
    setPlayerColor,
    setMatch,
    setHasStarted,
    chessboardRef,
    setGame,
    game,
    makeMove,
    isPlayerTurn: game?.turn() == (playerColor as Color) ? true : false,
    isPaused,
    gameOver: game?.isGameOver() || Boolean(result),
    turn: game?.turn(),
    pause,
    resume,
    restart,
    setLevel,
    level,
    time,
    result,
    markedSquares,
    setMarkedSquares,
    onSquareRightClick,
    moveHistory: game?.history({ verbose: true }),
    onPieceDragged,
    possibleMoves,
    movePreview,
    customSquareStyles,
    setSelectedSquare,
    setPossibleMoves
  };
}
