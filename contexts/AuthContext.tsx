
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    console.log("Iniciando Auth")
    async function getUserDetails(userId: string) {
      
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
        console.log({getUserDetail: userId, data})
      return data;

    }

    // Check active sessions and sets the user
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log({session})
      if (session?.user) {
        const userDetails = await getUserDetails(session.user.id);
        setUser({ ...session.user, ...userDetails });
      } else {
        console.log("Cant load user!")
        setUser(null);
      }
      setLoading(false);
    });

    // Listen for changes on auth state 
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const userDetails = await getUserDetails(session.user.id);
        setUser({ ...session.user, ...userDetails });
      } else {
        console.log("Cant load user!")
        setUser(null);
      }
      setLoading(false);
    });

    console.log({AuthSubscription: subscription})

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
