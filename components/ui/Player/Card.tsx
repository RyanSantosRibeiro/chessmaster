'use client';

import { FC } from 'react';
import { Bot, Flame } from 'lucide-react';

type PlayerCardProps = {
  name: string;
  trophies?: number;
  isBot?: boolean;
  botLevel?: number;
  isTurn?: string | null;
  align?: "left" | "right";
  time: number;
  onBotLevelChange?: (level: number) => void;
};

const levelLabels = ['Beginner', 'Intermediate', 'Professional', 'Master'];

const PlayerCard: FC<PlayerCardProps> = ({
  name,
  trophies = 0,
  isBot = false,
  botLevel,
  isTurn,
  align,
  time = "0.0",
  onBotLevelChange,
}) => {
  const minutes = Math.floor(time / 60);
const seconds = time % 60;
  return (
    <div
      className={`card bg-base-200 shadow-md w-full max-w-sm p-4 flex flex-col gap-2 transition-all duration-300 border-2 ${
        isTurn ? 'border-accent' : 'border-transparent'
      }`}
    >
      <div className={`flex items-center justify-between ${align == "right" ? "flex-row-reverse" : "flex-row" }`}>
        <h2 className="card-title text-base-content text-lg font-semibold">
          {name}
        </h2>

        <div className="flex items-center gap-2">
          {isBot && (
            <div className="badge badge-accent gap-1">
              <Bot size={16} />
              Bot {botLevel}
            </div>
          )}
          {isTurn && (
            <div className="badge badge-success gap-1 animate-pulse font-semibold">
              <Flame size={14} />
              {isTurn}
            </div>
          )}
        </div>
      </div>

      <div className='flex justify-between'>
        {
          isBot ? (
              <div className="flex items-center justify-between text-sm text-base-content/80">
                  <select
                      className="select select-accent select-sm max-w-28 max-h-[26px] cursor-pointer"
                      value={botLevel}
                      onChange={(e) => onBotLevelChange?.(parseInt(e.target.value))}
                  >
                      {levelLabels.map((label, idx) => (
                      <option key={label} value={idx}>
                          {label}
                      </option>
                      ))}
                  </select>
              </div>
          ) : (
          <div className="flex items-center justify-between text-sm text-base-content/80">
              <span className="badge badge-warning badge-outline font-bold">🏆 {trophies}</span>
          </div>
          )
        }

        <span className="countdown font-mono text-2xl rounded-field bg-primary text-primary-content px-1 flex h-auto">
          <span style={{ "--value": minutes } as React.CSSProperties}>{minutes}</span>:
          <span style={{ "--value": seconds } as React.CSSProperties}>{seconds}</span>
        </span>
      </div>
      
    </div>
  );
};

export default PlayerCard;
