'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import MatchRoomChat from '../MatchRoom/Chat';
import { useMatch } from '@/contexts/MatchContext';

type Props = {
  matchCode: string;
};


export default function DetailsColumn({ matchCode }: Props) {
  const supabase = createClient();
  const [input, setInput] = useState('');
  const { user, loading } = useAuth();
  const {
      game
    } = useMatch();


  console.log({user, loading})
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="col-span-3">
      <div>
        <p></p>
      </div>
      <MatchRoomChat matchId={matchCode} />
    </div>
  );
}
