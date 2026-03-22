import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/lib/supabase";

/**
 * Force navigation using window.location - more reliable than React Router
 * when dealing with OAuth callbacks and session state changes.
 */
const forceNavigate = (path: string) => {
  const base = window.location.origin;
  const url = path.startsWith('/') ? `${base}${path}` : `${base}/${path}`;
  console.log('[AuthCallback] Force navigating to:', url);
  // Use replace to avoid adding to history
  window.location.replace(url);
};

const AuthCallback = () => {
  const { isRTL } = useLanguage();
  const [hasNavigated, setHasNavigated] = useState(false);
  const hasNavigatedRef = useRef(false);

  useEffect(() => {
    // Prevent double navigation
    if (hasNavigatedRef.current) {
      console.log('[AuthCallback] Already navigated, skipping');
      return;
    }

    console.log('[AuthCallback] Component mounted, hash:', window.location.hash);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    console.log('[AuthCallback] Access token in hash:', accessToken ? 'YES' : 'NO');

    const doNavigate = (path: string) => {
      if (hasNavigatedRef.current) return;
      hasNavigatedRef.current = true;
      setHasNavigated(true);
      // Clean hash before navigating (security - don't leave tokens in history)
      const url = new URL(window.location.href);
      url.hash = '';
      window.history.replaceState(null, '', url.toString());
      forceNavigate(path);
    };

    if (accessToken) {
      // OAuth callback WITH tokens - Supabase will process the hash
      // We need to wait for Supabase to set the session, then navigate
      console.log('[AuthCallback] OAuth callback detected with access_token, waiting for Supabase to process...');
      let cleaned = false;

      // Verify session using Supabase getSession instead of localStorage
      const verifySession = async (): Promise<boolean> => {
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) {
            console.warn('[AuthCallback] Error checking session:', error);
            return false;
          }
          if (session?.user) {
            console.log('[AuthCallback] Session verified via Supabase');
            return true;
          }
        } catch (e) {
          console.warn('[AuthCallback] Error checking session:', e);
        }
        return false;
      };

      const cleanupAndNavigate = async (path: string) => {
        if (hasNavigatedRef.current) {
          console.log('[AuthCallback] Already navigated, skipping cleanupAndNavigate');
          return;
        }
        
        // CRITICAL: Verify session using Supabase before navigating
        // This ensures AuthContext will have the session when ProtectedRoute checks
        if (path === '/dashboard' || path === '/profile') {
          // Wait for session to be fully set - poll multiple times
          let attempts = 0;
          const maxAttempts = 10; // 10 attempts * 300ms = 3 seconds
          
          const checkAndNavigate = async () => {
            attempts++;
            const sessionExists = await verifySession();
            
            if (sessionExists) {
              console.log('[AuthCallback] Session verified, navigating to profile');
              if (!cleaned) {
                cleaned = true;
                const url = new URL(window.location.href);
                url.hash = '';
                window.history.replaceState(null, '', url.toString());
              }
              hasNavigatedRef.current = true;
              setHasNavigated(true);
              forceNavigate(path);
            } else if (attempts >= maxAttempts) {
              console.error('[AuthCallback] Session not found after', maxAttempts, 'attempts, going to home');
              if (!cleaned) {
                cleaned = true;
                const url = new URL(window.location.href);
                url.hash = '';
                window.history.replaceState(null, '', url.toString());
              }
              hasNavigatedRef.current = true;
              setHasNavigated(true);
              forceNavigate('/');
            } else {
              // Wait and try again
              setTimeout(checkAndNavigate, 300);
            }
          };
          
          // Start checking immediately
          checkAndNavigate();
          return;
        }
        
        if (!cleaned) {
          cleaned = true;
          const url = new URL(window.location.href);
          url.hash = '';
          window.history.replaceState(null, '', url.toString());
        }
        hasNavigatedRef.current = true;
        setHasNavigated(true);
        console.log('[AuthCallback] Navigating to:', path);
        forceNavigate(path);
      };

      // Give Supabase a moment to initialize and process the hash
      // Supabase's detectSessionInUrl needs time to parse the hash and set the session
      let subscription: { unsubscribe: () => void } | null = null;
      let pollInterval: NodeJS.Timeout | null = null;
      let fallbackTimeout: NodeJS.Timeout | null = null;

      const initTimeout = setTimeout(() => {
        // 1. Listen for auth state change (set up after initial delay)
        const authSub = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('[AuthCallback] Auth state changed:', event, session?.user ? 'HAS USER' : 'NO USER');
          if (session?.user) {
            await cleanupAndNavigate('/dashboard');
          }
        });
        subscription = authSub.data;

        // 2. Poll getSession every 200ms (Supabase processes hash on load)
        // Give Supabase time to process the hash - it needs to parse tokens and set session
        let pollCount = 0;
        const maxPolls = 25; // 25 polls * 200ms = 5 seconds max
        pollInterval = setInterval(async () => {
          if (hasNavigatedRef.current) return;
          pollCount++;
          try {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) {
              console.log('[AuthCallback] Poll error:', error);
            }
            if (session?.user) {
              console.log('[AuthCallback] Session found after', pollCount, 'polls, navigating to profile');
              if (pollInterval) clearInterval(pollInterval);
              if (subscription) subscription.unsubscribe();
              cleanupAndNavigate('/dashboard');
            } else if (pollCount >= maxPolls) {
              // Max polls reached, check one more time and navigate
              console.warn('[AuthCallback] Max polls reached, checking session one final time');
              if (pollInterval) clearInterval(pollInterval);
              if (subscription) subscription.unsubscribe();
              try {
                const { data: { session: finalSession } } = await supabase.auth.getSession();
                console.log('[AuthCallback] Final session check:', finalSession?.user ? 'FOUND' : 'NOT FOUND');
                cleanupAndNavigate(finalSession?.user ? '/dashboard' : '/');
              } catch {
                cleanupAndNavigate('/');
              }
            }
          } catch (err) {
            console.error('[AuthCallback] Poll exception:', err);
            // Continue polling unless we've hit max
            if (pollCount >= maxPolls) {
              if (pollInterval) clearInterval(pollInterval);
              if (subscription) subscription.unsubscribe();
              cleanupAndNavigate('/');
            }
          }
        }, 200);

        // 3. Fallback: after 5 seconds, check session once more and navigate
        fallbackTimeout = setTimeout(async () => {
          if (hasNavigatedRef.current) return;
          if (pollInterval) clearInterval(pollInterval);
          if (subscription) subscription.unsubscribe();
          console.log('[AuthCallback] Fallback timeout (5s) reached, checking session');
          try {
            const { data: { session } } = await supabase.auth.getSession();
            console.log('[AuthCallback] Fallback session check:', session?.user ? 'FOUND - going to profile' : 'NOT FOUND - going to home');
            cleanupAndNavigate(session?.user ? '/dashboard' : '/');
          } catch (err) {
            console.error('[AuthCallback] Fallback error:', err);
            cleanupAndNavigate('/');
          }
        }, 5000);
      }, 100); // Small delay to let Supabase initialize

      // Return cleanup function
      return () => {
        clearTimeout(initTimeout);
        if (pollInterval) clearInterval(pollInterval);
        if (fallbackTimeout) clearTimeout(fallbackTimeout);
        if (subscription) subscription.unsubscribe();
      };
    }

    // NO access_token in hash - either wrong redirect or hash was cleared
    // This usually means Supabase redirect URL is misconfigured
    console.warn('[AuthCallback] No access_token in hash - Supabase redirect URL may be misconfigured');
    
    // Check if we already have a session (e.g. from previous attempt)
    const checkAndNavigate = async () => {
      if (hasNavigatedRef.current) {
        console.log('[AuthCallback] Already navigated, skipping check');
        return;
      }
      try {
        console.log('[AuthCallback] Checking for existing session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('[AuthCallback] Error getting session:', error);
        }
        console.log('[AuthCallback] Session exists:', session?.user ? 'YES' : 'NO');
        // If we have a session, user is logged in - go to profile
        // If no session, redirect to home (user can try signing in again)
        const target = session?.user ? '/dashboard' : '/';
        console.log('[AuthCallback] Navigating to:', target);
        doNavigate(target);
      } catch (err) {
        // On any error, just go home
        console.error('[AuthCallback] Exception during session check:', err);
        doNavigate('/');
      }
    };

    // AGGRESSIVE: Check immediately, then after 300ms, then after 1s
    // This ensures we never get stuck on this page
    console.log('[AuthCallback] Starting immediate session check...');
    checkAndNavigate();
    const t1 = setTimeout(() => {
      console.log('[AuthCallback] Retry 1 (300ms)');
      checkAndNavigate();
    }, 300);
    const t2 = setTimeout(() => {
      console.log('[AuthCallback] Retry 2 (1000ms)');
      checkAndNavigate();
    }, 1000);

    // ABSOLUTE FALLBACK: After 1.5 seconds, force navigate to home no matter what
    const absoluteFallback = setTimeout(() => {
      if (hasNavigatedRef.current) {
        console.log('[AuthCallback] Already navigated, skipping fallback');
        return;
      }
      console.warn('[AuthCallback] Maximum timeout (1.5s) reached, forcing navigation to home');
      hasNavigatedRef.current = true;
      setHasNavigated(true);
      const url = new URL(window.location.href);
      url.hash = '';
      window.history.replaceState(null, '', url.toString());
      forceNavigate('/');
    }, 1500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(absoluteFallback);
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background/95 to-background flex items-center justify-center" dir={isRTL ? "rtl" : "ltr"}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <motion.div
          className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/50"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-12 h-12 text-primary-foreground" />
        </motion.div>

        <h2 className={`text-2xl font-black text-foreground mb-4 ${isRTL ? "font-arabic" : ""}`}>
          {isRTL ? "جاري تسجيل الدخول..." : "Signing you in..."}
        </h2>

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-8 h-8 text-primary mx-auto" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AuthCallback;
