import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('Auth event:', event);

        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle different auth events
        switch (event) {
          case 'SIGNED_OUT':
            toast.info('You have been signed out');
            navigate('/auth');
            break;

          case 'TOKEN_REFRESHED':
            console.log('Token refreshed successfully');
            break;

          case 'USER_UPDATED':
            console.log('User updated');
            break;

          case 'SIGNED_IN':
            console.log('User signed in');
            break;
        }

        // Handle session expiration or token refresh failure
        if (event === 'SIGNED_OUT' && !session) {
          // Clear any cached data
          setUser(null);
          setSession(null);
        }
      }
    );

    // Session health check - verify session is still valid every 5 minutes
    const healthCheckInterval = setInterval(async () => {
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Session health check error:', error);
        toast.error('Session error. Please sign in again.');
        await supabase.auth.signOut();
        navigate('/auth');
        return;
      }

      if (!currentSession && session) {
        // Session expired
        console.log('Session expired during health check');
        toast.warning('Your session has expired. Please sign in again.');
        setSession(null);
        setUser(null);
        navigate('/auth');
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    // Cleanup
    return () => {
      subscription.unsubscribe();
      clearInterval(healthCheckInterval);
    };
  }, [navigate]);

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();

      if (error) {
        toast.error('Error signing out: ' + error.message);
        throw error;
      }

      setUser(null);
      setSession(null);
      toast.success('Signed out successfully');
      navigate('/auth');
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
