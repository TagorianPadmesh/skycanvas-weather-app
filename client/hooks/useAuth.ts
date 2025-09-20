import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { storage } from '../utils/storage';
import type { Session } from '@supabase/supabase-js';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setLoading(false);
      
      // Clear remember me data when user signs out
      if (!session) {
        const rememberMe = await storage.getRememberMe();
        if (!rememberMe) {
          await storage.clearRememberMe();
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    session,
    loading,
    user: session?.user ?? null,
    signOut: async () => {
      await storage.clearRememberMe(); // Clear remember me data on sign out
      return supabase.auth.signOut();
    },
  };
}