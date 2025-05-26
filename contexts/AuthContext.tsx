'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'
import { getUserDetails } from '@/utils/supabase/queries'

type AuthContextType = {
  user: User | null
  profile: any | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true })

export function AuthProvider({
  children,
  initialUser = null,
}: {
  children: React.ReactNode
  initialUser?: User | null
}) {
  const [user, setUser] = useState<User | null>(initialUser)
  const [profile, setProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(!initialUser)
  const supabase = createClient()

  const getProfile = async (userId: string) => {
      try {
        const { data: profile, error } = await supabase
        .from('profile')
        .select('*')
        .eq('id', userId)
        .single();

        if(error) return;

        setProfile(profile);
      } catch (error) {
        console.log(error)
      }
    }
    useEffect(() => {
      if(user?.id)
          getProfile(user?.id)
    }, [user])

  useEffect(() => {
    if (!initialUser) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        setUser(user)
        setLoading(false)
      })

      
    }

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
