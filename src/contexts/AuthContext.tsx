import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, UserProfile } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { migrateLocalStorageToDatabase } from '@/services/migration';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  // Start with loading = true to wait for session check
  const [loading, setLoading] = useState(true);
  const isInitializedRef = useRef(false);
  const currentSessionTokenRef = useRef<string | null>(null);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Handle 406 Not Acceptable (table doesn't exist or RLS blocking)
        if (error.code === 'PGRST116' || error.code === '42P01' || error.status === 406 || error.status === 404) {
          // Silently handle - user can create profile later
          setProfile(null);
          return;
        }
        // Only log unexpected errors
        if (error.status !== 406 && error.status !== 404) {
          console.warn('Error fetching profile:', error);
        }
        setProfile(null);
        return;
      }
      setProfile(data);
    } catch (error) {
      // Silently handle - app should work without database
      setProfile(null);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;
    let hasSetLoading = false;
    let sessionPromise: Promise<{ data: { session: Session | null }; error: any }> | null = null;
    
    // Set loading to false only after session check completes
    const setLoadingFalse = () => {
      if (!hasSetLoading && isMounted) {
        hasSetLoading = true;
        setLoading(false);
      }
    };
    
    // Don't set loading to false immediately - wait for session check
    // This ensures ProtectedRoute waits for the session to be loaded
    
    // Start session check (don't wait for it - non-blocking)
    // Wrap in try-catch to handle any Supabase initialization errors
    try {
      sessionPromise = supabase.auth.getSession();
    } catch (error) {
      // If Supabase client initialization fails, just proceed without session
      console.warn('Supabase client initialization error (non-fatal):', error);
      clearTimeout(quickTimeout);
      setLoadingFalse();
      setSession(null);
      setUser(null);
      return;
    }
    
    // Set a timeout to ensure loading stops even if getSession hangs
    timeoutId = setTimeout(() => {
      if (isMounted && !isInitializedRef.current) {
        console.warn('getSession taking too long - proceeding without waiting');
        setLoadingFalse();
      }
    }, 3000); // Reduced to 3 seconds

    // Handle session result when it arrives
    if (sessionPromise) {
      sessionPromise
      .then(async ({ data: { session }, error }) => {
        clearTimeout(timeoutId);
        if (!isMounted) return;
        if (isInitializedRef.current) return; // Prevent duplicate initialization
        isInitializedRef.current = true;
        
        // Handle error gracefully
        if (error) {
          console.warn('Error getting session:', error);
          setLoadingFalse();
          setSession(null);
          setUser(null);
          return;
        }
        
        currentSessionTokenRef.current = session?.access_token || null;
        setSession(session);
        setUser(session?.user ?? null);
        setLoadingFalse(); // Set loading to false AFTER session is loaded
        
        if (session?.user) {
          // Then fetch profile and migrate in background (non-blocking)
          fetchProfile(session.user.id).catch(console.error);
          migrateLocalStorageToDatabase(session.user.id).catch(console.error);
        }
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        // Ignore AbortError - it's expected in some cases
        if (error?.name === 'AbortError') {
          // Silently ignore - Supabase sometimes aborts during initialization
          return;
        }
        console.error('Error getting session:', error);
        if (!isMounted) return;
        // Set loading to false on error
        setLoadingFalse();
        setSession(null);
        setUser(null);
      });
    }

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      
      // ALWAYS skip INITIAL_SESSION - we handle it with getSession above
      if (event === 'INITIAL_SESSION') {
        return;
      }
      
      // CRITICAL: Process SIGNED_IN events immediately, even if not initialized
      // This is needed for OAuth callbacks where the session is set before getSession completes
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('[AuthContext] SIGNED_IN event detected, updating user state immediately');
        isInitializedRef.current = true; // Mark as initialized
        currentSessionTokenRef.current = session.access_token || null;
        setSession(session);
        setUser(session.user);
        setLoading(false);
        // Fetch profile and migrate in background
        fetchProfile(session.user.id).catch(console.error);
        migrateLocalStorageToDatabase(session.user.id).catch(console.error);
        return;
      }
      
      // For other events, only process if we're initialized (getSession completed)
      if (!isInitializedRef.current) {
        return; // Wait for getSession to finish first
      }
      
      // Only update if session actually changed
      const newToken = session?.access_token || null;
      if (currentSessionTokenRef.current === newToken) {
        return; // No change, don't update
      }
      currentSessionTokenRef.current = newToken;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Fetch profile and migrate in background (non-blocking)
        fetchProfile(session.user.id).catch(console.error);
        migrateLocalStorageToDatabase(session.user.id).catch(console.error);
      } else {
        setProfile(null);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    // Determine the correct redirect URL based on environment
    // If on dev server (port 3006), stay on dev server
    // If on production (falah.live), use production
    const isDev = window.location.hostname === 'localhost' || 
                  window.location.hostname === '127.0.0.1' ||
                  window.location.hostname === '20.107.168.51' ||
                  window.location.port === '3006';
    
    const redirectTo = isDev 
      ? `${window.location.origin}/auth/callback`
      : 'https://falah.live/auth/callback';
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      }
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email!,
          ...updates,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      await fetchProfile(user.id);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    updateProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
