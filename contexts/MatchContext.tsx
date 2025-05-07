
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { createClient } from '@/utils/supabase/client';

export interface MatchContextType {
  match: any;
  setMatch: (match:any) => void;
  history: string[];
  setHistory: (moves: string[]) => void;
  playerColor: 'white' | 'black';
  setPlayerColor: (color: 'white' | 'black') => void;
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
  opponentDisconnected: boolean;
  setOpponentDisconnected: (disconnected: boolean) => void;
  timeLeft: number;
  setTimeLeft: (time: number) => void;
  status: 'in_progress' | 'paused' | 'draw',
  sessionKey: string,
  isMyTurn: boolean,
  pauseGame: ()=>void,
  drawGame: ()=>void,
  resumeGame: ()=>void,
  setIsMyTurn: (myTurn: boolean)=>void,
}

const MatchContext = createContext<MatchContextType | undefined>(undefined);

export const MatchProvider = ({ children, matchCode }: { children: React.ReactNode, matchCode:string }) => {
  const supabase = createClient();
  const [match, setMatch] = useState(null);
  const [history, setHistory] = useState<string[]>([]);
  const [playerColor, setPlayerColor] = useState<'white' | 'black'>('white');
  const [isPaused, setIsPaused] = useState(false);
  const [opponentDisconnected, setOpponentDisconnected] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const [status, setStatus] = useState<'in_progress' | 'paused' | 'draw'>('in_progress');
  const [isMyTurn, setIsMyTurn] = useState(false);
  const { user } = useAuth();
  // SessionStorage key
  const sessionKey = `match_${matchCode}_state`;

  const playGame = () => {
    setStatus('in_progress');
  }

  const pauseGame = () => {
    setStatus('paused');
  }
  
  const drawGame = () => {
    setStatus('draw');
  }

  const resumeGame = () => {
    setStatus('in_progress');
  };

  useEffect(() => {
      if (!user) return;
  
      const fetchMatch = async () => {
        const { data: match } = await supabase
          .from('matches')
          .select('*')
          .eq('url_hash', matchCode)
          .single();
  
        if (!match) return;
  
        setMatch(match);
        const color = match.white_player_id === user.id ? 'white' : 'black';
        setPlayerColor(color);
        setStatus(match.status || 'in_progress');
        setIsMyTurn(color === 'white');
      };
  
      fetchMatch();
    }, [user, matchCode]);

  return (
    <MatchContext.Provider
      value={{
        match,
        setMatch,
        history,
        setHistory,
        playerColor,
        setPlayerColor,
        isPaused,
        setIsPaused,
        opponentDisconnected,
        setOpponentDisconnected,
        timeLeft,
        setTimeLeft,
        status,
        sessionKey,
        isMyTurn,
        pauseGame,
        drawGame,
        resumeGame,
        setIsMyTurn
      }}
    >
      {children}
    </MatchContext.Provider>
  );
};

export const useMatch = (): MatchContextType => {
  const context = useContext(MatchContext);
  if (!context) {
    throw new Error('useMatch must be used within a MatchProvider');
  }
  return context;
};