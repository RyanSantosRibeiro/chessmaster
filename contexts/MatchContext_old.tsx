
'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Chess } from 'chess.js';
import type { ReactNode } from 'react';

type MatchContextType = {
  game: Chess;
  setMatch: (g: Chess) => void;
  setGame: (g: Chess) => void;
  matchId: string | null;
  setMatchId: (id: string | null) => void;
  playerColor: 'white' | 'black' | null;
  setPlayerColor: (color: 'white' | 'black' | null) => void;
  isMyTurn: boolean;
  setIsMyTurn: (v: boolean) => void;
  disconnected: boolean;
  setDisconnected: (v: boolean) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGameAsDraw: () => void;
  updateMoveHistory: (move: string) => void;
  moveHistory: string[];
  status:string
};

const MatchContext = createContext<MatchContextType | undefined>(undefined);

export const MatchProvider = ({ children }: { children: ReactNode }) => {

  const [match, setMatch] = useState<any | null>(null);
  const [game, setGame] = useState(() => new Chess());
  const [matchId, setMatchId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const [playerColor, setPlayerColor] = useState<'white' | 'black' | null>(null);
  const [isMyTurn, setIsMyTurn] = useState<boolean>(false);
  const [disconnected, setDisconnected] = useState(false);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);

  const pauseGame = useCallback(() => {
    console.log('Game paused');
    setStatus('in-progress')
    // Lógica visual ou de estado para pausar o jogo
  }, []);

  const resumeGame = useCallback(() => {
    console.log('Game resumed');
    // Lógica visual ou de estado para retomar o jogo
  }, []);

  const endGameAsDraw = useCallback(() => {
    console.log('Game ended as draw due to timeout');
    setGame(new Chess(game.fen())); // Atualiza instância
    // Aqui você poderia também salvar o resultado no banco
  }, [game]);

  const updateMoveHistory = useCallback((move: string) => {
    setMoveHistory((prev) => [...prev, move]);
  }, []);

  // Recuperar do sessionStorage se possível
  useEffect(() => {
    const savedFen = sessionStorage.getItem('chess-fen');
    const savedHistory = sessionStorage.getItem('chess-history');
    const savedColor = sessionStorage.getItem('player-color');
    const savedMatchId = sessionStorage.getItem('match-id');

    if (savedFen) {
      const newGame = new Chess();
      newGame.load(savedFen);
      setGame(newGame);
    }

    if (savedHistory) setMoveHistory(JSON.parse(savedHistory));
    if (savedColor) setPlayerColor(savedColor as 'white' | 'black');
    if (savedMatchId) setMatchId(savedMatchId);
  }, []);

  // Salvar no sessionStorage
  useEffect(() => {
    sessionStorage.setItem('chess-fen', game.fen());
    sessionStorage.setItem('chess-history', JSON.stringify(moveHistory));
    if (playerColor) sessionStorage.setItem('player-color', playerColor);
    if (matchId) sessionStorage.setItem('match-id', matchId);
  }, [game, moveHistory, playerColor, matchId]);

  return (
    <MatchContext.Provider
      value={{
        setMatch,
        game,
        setGame,
        matchId,
        setMatchId,
        playerColor,
        setPlayerColor,
        isMyTurn,
        setIsMyTurn,
        disconnected,
        setDisconnected,
        pauseGame,
        resumeGame,
        endGameAsDraw,
        updateMoveHistory,
        moveHistory,
        status
      }}
    >
      {children}
    </MatchContext.Provider>
  );
};

export const useMatch = () => {
  const context = useContext(MatchContext);
  if (!context) {
    throw new Error('useMatch must be used within a MatchProvider');
  }
  return context;
};
