'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/contexts/WalletContext';

type Props = {
  matchId: string;
};

type Message = {
  sender: string;
  text: string;
  timestamp: string;
};

export default function MatchRoomChat({ matchId }: Props) {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const { user } = useWallet();

  useEffect(() => {
    const channel = supabase.channel(`match-${matchId}`, {
      config: {
        broadcast: {
          self: true
        }
      }
    });

    channel
      .on('broadcast', { event: 'chat-message' }, (payload) => {
        setMessages((prev) => [...prev, payload.payload as Message]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId]);

  const sendMessage = async () => {
    if (!user) return;
    const message: Message = {
      sender: user.username,
      text: input,
      timestamp: new Date().getHours() + ':' + new Date().getMinutes()
    };

    const channel = supabase
      .getChannels()
      .find((c) => c.topic === `realtime:match-${matchId}`);

    if (channel) {
      await channel.send({
        type: 'broadcast',
        event: 'chat-message',
        payload: message
      });

      setInput('');
    }
  };

  return (
    <div className="w-full space-y-4 bg-[#1b262c] rounded-lg p-4 overflow-y-auto h-fit">
      <h2 className="text-lg font-semibold mb-2">Chat</h2>
      <div className="h-40 overflow-y-auto bg-[#121c22] p-2 rounded mb-2">
        {messages.map((msg, i) => (
          <div key={i} style={{color: msg.sender==user?.username ? "#d65729" : "#89e0eb"}}>
            <strong ><span className='text-xs'>{msg.timestamp}</span> {msg.sender}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          disabled={!user}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault(); // evita quebra de linha em inputs multiline (se usar textarea futuramente)
              sendMessage();
            }
          }}
          placeholder="Type a message"
          className="flex-1 px-2 py-1 rounded text-sm bg-[#121c22] w-full"
        />
        <button
          onClick={sendMessage}
          className="bg-[#121c22] text-white px-3 py-1 rounded flex items-center justify-center"
        >
          <svg
            width="20px"
            height="20px"
            viewBox="0 -0.5 25 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              clipRule="evenodd"
              d="M18.455 9.8834L7.063 4.1434C6.76535 3.96928 6.40109 3.95274 6.08888 4.09916C5.77667 4.24558 5.55647 4.53621 5.5 4.8764C5.5039 4.98942 5.53114 5.10041 5.58 5.2024L7.749 10.4424C7.85786 10.7903 7.91711 11.1519 7.925 11.5164C7.91714 11.8809 7.85789 12.2425 7.749 12.5904L5.58 17.8304C5.53114 17.9324 5.5039 18.0434 5.5 18.1564C5.55687 18.4961 5.77703 18.7862 6.0889 18.9323C6.40078 19.0785 6.76456 19.062 7.062 18.8884L18.455 13.1484C19.0903 12.8533 19.4967 12.2164 19.4967 11.5159C19.4967 10.8154 19.0903 10.1785 18.455 9.8834V9.8834Z"
              stroke="#b8b8b8"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
