'use client';
import { getUser, sendTicket } from '@/utils/supabase/queries';
import { useWallet } from '@/contexts/WalletContext';
import { useState } from 'react';

export default function Ticket() {
  const { user } = useWallet();
  const [input, setInput] = useState('');

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
        Please, connect your wallet first!
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
      <form
        action={sendTicket}
        className="w-full max-w-lg bg-card p-6 rounded-lg shadow-md border border-primary/10 flex flex-col justify-center items-center"
      >
        <h1 className="text-3xl font-bold mb-4 text-primary">Support Ticket</h1>
        <h2 className="text-xl font-bold mb-4 text-primary">
          We apologize for the inconvenience.
        </h2>

        <label htmlFor="problem" className="block text-sm font-medium mb-2">
          We apologize for the inconvenience. Please tell us everything about
          the issue you're facing so we can help you as soon as possible.
        </label>
        <textarea
          placeholder="Your ticket here..."
          id="problem"
          onChange={(e) => setInput(e.target.value)}
          name="problem"
          rows={6}
          required
          className="w-full p-3 rounded-md border border-primary/20 bg-background text-foreground resize-none mb-4"
        />

        <button
          onClick={() =>
            sendTicket({
              id: user.id,
              ticket: input
            })
          }
          className="bg-accent text-white font-bold px-6 py-3 rounded-lg hover:bg-accent/90 transition-all"
        >
          Submit Ticket
        </button>
      </form>
    </div>
  );
}
