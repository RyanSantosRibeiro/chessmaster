'use client';

import { useChessVsBot } from '@/contexts/GameBot';
import { Chessboard } from 'react-chessboard';
import { useEffect } from 'react';
import PlayerCard from '../Player/Card';
import GameStatus from '../Game/GameOver';
import Controls from '../Controls/Controls';
import { Chess, Color } from 'chess.js';
import { useMatch } from '@/contexts/MatchContext';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/utils/supabase/client';
import LoadingDots from '../LoadingDots';
import { useWallet } from '@/contexts/WalletContext';
import { timeStamp } from 'console';

export default function ChessMultiplayer() {
  const supabase = createClient();

  const { user } = useWallet();
  const {
    match,
    setStartTimestamp,
    setHistory,
    setTime,
    startTimestamp,
    setMatch,
    makeMove,
    isPlayerTurn,
    gameOver,
    restart,
    time,
    result,
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
    setHasStarted
  } = useMatch();

  const startGame = async ({ playerIds }: { playerIds: string[] }) => {
    const matchChannel = supabase.channel(`room-${match?.url_hash}`, {
      config: {
        presence: { key: user?.id }
      }
    });

    matchChannel
      .on('presence', { event: 'sync' }, () => {
        const state = matchChannel.presenceState();
        const onlinePlayers = Object.keys(state);

        // Verifica se ambos estão online
        const bothOnline = playerIds.every((id) => onlinePlayers.includes(id));

        console.log('🟢🟢 Are both online 🟢', bothOnline);
        if (bothOnline && !startTimestamp) {
          const now = Date.now(); // timestamp em ms
          setStartTimestamp(now);

          // // Só o white envia o timestamp (responsável)
          // if (user?.id === match?.white_player_id) {
          //   matchChannel.send({
          //     type: 'broadcast',
          //     event: 'start-timer',
          //     payload: { timestamp: now }
          //   });
          // }
        }
      })
      // .on('broadcast', { event: 'start-timer' }, ({ payload }) => {
      //   setStartTimestamp(payload.timestamp);
      //   setHasStarted(true);
      // })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('🟢 JOIN:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('🔴 LEAVE:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await matchChannel.track({
            user_id: user?.id
          });
        }
      });

    try {
      const initialTime = {
        white: user?.match?.match_type?.time || 900, // 5 min
        black: user?.match?.match_type?.time || 900
      };
      const { data: hasMatch, error } = await supabase
        // @ts-ignore
        .from('match_moves')
        .select('*')
        .eq('match_id', user?.match?.id)
        .order('created_at', { ascending: false });

      if (error) throw new Error('Error on search history');

      if (hasMatch.length === 0 && user?.match?.created_at) {
        const now = Math.floor(Date.now() / 1000); // em segundos
        const createdAt = Math.floor(
          new Date(user?.match.created_at).getTime() / 1000
        ); // em segundos
        const elapsed = now - createdAt;

        const whiteTimeLeft = Math.max(0, initialTime.white - elapsed);
        const blackTimeLeft = Math.max(0, initialTime.black);
        setHasStarted(true);
        setTime({
          white: whiteTimeLeft,
          black: blackTimeLeft
        });
        return;
      }

      // @ts-ignore
      const newGame = new Chess(hasMatch[0].fen);
      setGame(newGame); // atualiza o estado do jogo

      // Garante que você tem jogadas salvas
      if (hasMatch.length > 0) {
        setHistory(hasMatch);
        const lastToMove =
        // @ts-ignore
          hasMatch[0].player_id === user?.id ? user?.id : hasMatch[0].player_id;
        const currentTurn =
          user?.match?.white_player_id == lastToMove ? 'black' : 'white';

        const lastWhiteMove = hasMatch.find(
          // @ts-ignore
          (m) => m.player_id === user.match.white_player_id
        );

        const lastBlackMove = hasMatch.find(
          // @ts-ignore
          (m) => m.player_id === user.match.black_player_id
        );

        // @ts-ignore
        let whiteTimeLeft = lastWhiteMove?.time_left;
        // @ts-ignore
        let blackTimeLeft = lastBlackMove?.time_left;

        if (currentTurn == 'white') {
          // @ts-ignore
          whiteTimeLeft = hasMatch[0].time_left;
          blackTimeLeft = initialTime.black;
        } else {
          if (lastBlackMove) {
            // @ts-ignore
            blackTimeLeft = lastBlackMove.time_left;
          } else {
            const now = Math.floor(Date.now() / 1000); // em segundos
            const base = Math.floor(
              // @ts-ignore
              new Date(hasMatch[0].created_at).getTime() / 1000
            );
            const delta = now - base;

            blackTimeLeft = initialTime.black - delta;
          }
        }

        setHasStarted(true);
        setTime({
          white: whiteTimeLeft,
          black: blackTimeLeft
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!user || !user.match || game) return;
    setPlayerColor(user.match?.white_player_id == user.id ? 'w' : 'b');
    setMatch(user.match);
    setGame(new Chess());
    // setStartTimestamp(new Date(user.match.created_at).getTime())
    setStartTimestamp(new Date().getTime());
    startGame({
      playerIds: [user.match?.white_player_id, user.match?.black_player_id]
    });
  }, [user, match]);

  if (!user || !user?.match) {
    return (
      <div className="bg-[#121c22] rounded-lg p-4 max-h-full overflow-hidden w-full h-full">
        <LoadingDots />
      </div>
    );
  }

  const opponent =
    user.match?.black_player_id == user.id
      ? user.match.white_player
      : user.match.black_player;

  return (
    <div className="bg-[#121c22] rounded-lg p-4 max-h-full overflow-hidden w-auto h-full">
      <div className="flex flex-col items-center gap-4 h-full max-h-full">
        <div className="w-full flex items-start justify-between">
          <PlayerCard
            time={
              time == null ? 0 : playerColor == 'w' ? time.black : time.white
            }
            name={opponent?.username || 'Jhon jones'}
            trophies={opponent?.trophies}
            isCheck={(!isPlayerTurn && game?.inCheck()) || false}
            isTurn={!isPlayerTurn ? 'Turn' : null}
            image={opponent?.avatar_url}
          />
          {/* <Controls
            stop={() => pause()}
            resume={() => resume()}
            restart={() => restart()}
            isPaused={isPaused}
          /> */}
        </div>

        <div className="w-auto h-full aspect-square relative rounded-sm overflow-hidden bg-[#121c22] flex">
          <GameStatus
            stats={{
              trophies: match?.match_type?.trophies_on_win,
              level: opponent?.level,
              token: (match?.match_type?.ticket_amount * 2 ) * 0.8,
            }}
            result={
              result == null ? null :
              result == 'drawn'
                ? 'gameDrawn'
                : result == playerColor
                  ? 'gameWin'
                  : 'gameLose'
            }
          />
          <Chessboard
            ref={chessboardRef}
            position={game?.fen()}
            // position={fen}
            animationDuration={200}
            arePremovesAllowed={true}
            boardOrientation={playerColor == 'w' ? 'white' : 'black'}
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
            time={
              time == null ? 0 : playerColor == 'w' ? time.white : time.black
            }
            name={user?.username || 'Jhon jones'}
            trophies={user?.trophies}
            isTurn={isPlayerTurn ? 'Your Turn' : null}
            isCheck={(isPlayerTurn && game?.inCheck()) || false}
            align="right"
            image={opponent?.avatar_url}
          />
        </div>
      </div>
    </div>
  );
}
