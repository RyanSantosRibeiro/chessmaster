'use client';

import { getScoreboard } from '@/utils/supabase/queries';
import { get } from 'http';
import { useEffect, useState } from 'react';

export default function Scoreboard() {
  const [scoreboard, setScoreboard] = useState<
    { username: string; trophies: number }[] | null
  >(null);

  const getScoreboardData = async () => {
    const scoreboardData = await getScoreboard();
    if (scoreboardData) {
      setScoreboard(scoreboardData);
    }
  };

  useEffect(() => {
    if (scoreboard == null) {
      getScoreboardData();
    }
  }, [scoreboard]);

  if (!scoreboard || scoreboard == null) {
    return <></>;
  }

  return (
    <div className="flex flex-col items-start justify-center w-full max-w-md mx-auto mt-3">
      <h2 className="text-xl font-bold text-left text-white dark:text-white">
        🏆 Scoreboard
      </h2>

      <div className="w-full">
        <div className="px-2 flex justify-between font-semibold border-b border-zinc-300 dark:border-zinc-700 py-2 text-white dark:text-zinc-300">
          <span className="cursor-default text-left"># Player</span>
          <span className="cursor-default text-right">Trophies</span>
        </div>

        {scoreboard?.length > 0 && scoreboard?.map(
          (
            { username, trophies }: { username: string; trophies: number },
            index
          ) => (
            <div
              key={index}
              className="px-2 cursor-default flex justify-between py-2 border-b border-zinc-200 hover:bg-[#00000036] dark:hover:bg-[#00000036] transition-colors"
            >
              <span className="cursor-default text-left font-medium text-white dark:text-white">
                {index + 1}. {username}
              </span>
              <span className="cursor-default text-right text-white dark:text-zinc-100">
                {trophies}
              </span>
            </div>
          )
        )}
      </div>
    </div>
  );
}
