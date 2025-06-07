
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthUser extends User {
  channelName?: string;
  isLive?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, channelName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, session);
        setSession(session);
        
        if (session?.user) {
          // Use setTimeout to avoid potential deadlock in auth callback
          setTimeout(async () => {
            try {
              // Fetch user profile to get channel info
              const { data: profile } = await supabase
                .from('profiles')
                .select('channel_name')
                .eq('id', session.user.id)
                .single();
                
              // Check if user has a live stream
              const { data: channels } = await supabase
                .from('channels')
                .select('is_live')
                .eq('user_id', session.user.id)
                .single();
                
              const authUser: AuthUser = {
                ...session.user,
                channelName: profile?.channel_name || `${session.user.email?.split('@')[0]}'s Channel`,
                isLive: channels?.is_live || false
              };
              
              setUser(authUser);
            } catch (error) {
              console.error('Error fetching user profile:', error);
              // Set basic user info even if profile fetch fails
              const authUser: AuthUser = {
                ...session.user,
                channelName: `${session.user.email?.split('@')[0]}'s Channel`,
                isLive: false
              };
              setUser(authUser);
            }
          }, 0);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Login error:', error);
        setIsLoading(false);
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const signup = async (email: string, password: string, channelName: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            channel_name: channelName
          }
        }
      });
      
      if (error) {
        console.error('Signup error:', error);
        setIsLoading(false);
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      setIsLoading(false);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
