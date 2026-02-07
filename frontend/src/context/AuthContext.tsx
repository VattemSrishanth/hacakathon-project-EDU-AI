import { createContext, useContext, useMemo, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { api } from '../services/api';

export type UserRole = 'student' | 'teacher' | 'parent' | 'admin' | 'user';

export interface AuthUser {
  id?: string | number;
  username?: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  initials?: string;
  role?: UserRole;
}

export type AuthStatus = 'logged_in' | 'guest' | 'logged_out';

export interface AuthState {
  token?: string;
  user?: AuthUser;
  status: AuthStatus;
}

interface AuthContextValue {
  auth: AuthState | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  login: (state: Omit<AuthState, 'status'>) => void;
  continueAsGuest: () => void;
  logout: () => void;
  updateUser: (user: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const getInitials = (user?: AuthUser) => {
  const source = user?.name || user?.username || user?.email || '';
  if (!source) return 'U';
  const parts = source.split(/\s+|@/).filter(Boolean);
  const initials = parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
  return initials || 'U';
};

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [auth, setAuth] = useLocalStorage<AuthState | null>('auth', null);

  // Sync user role and details from server on mount
  useEffect(() => {
    const syncUser = async () => {
      if (auth?.status === 'logged_in' && auth.token) {
        try {
          const response = await api.get('/auth/me', {
            headers: { Authorization: `Bearer ${auth.token}` }
          });
          if (response.data.status === 'ok' && response.data.user) {
            setAuth((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                user: {
                  ...prev.user,
                  ...response.data.user,
                  initials: getInitials(response.data.user)
                }
              };
            });
          }
        } catch (error) {
          console.error("Auth sync failed", error);
        }
      }
    };
    syncUser();
  }, []); // Run once on startup

  const value = useMemo<AuthContextValue>(() => {
    const normalizedAuth: AuthState | null = auth
      ? {
          ...auth,
          user: auth.user ? {
            ...auth.user,
            initials: auth.user?.initials || getInitials(auth.user),
          } : undefined,
        }
      : null;

    return {
      auth: normalizedAuth,
      isAuthenticated: normalizedAuth?.status === 'logged_in',
      isGuest: normalizedAuth?.status === 'guest',
      login: (state) => {
        const normalized: AuthState = {
          token: state.token,
          status: 'logged_in',
          user: {
            ...state.user,
            initials: state.user?.initials || getInitials(state.user),
          },
        };
        setAuth(normalized);
      },
      continueAsGuest: () => {
        setAuth({
          status: 'guest',
          user: { name: 'Guest User', initials: 'GU' }
        });
      },
      logout: () => setAuth(null),
      updateUser: (userUpdates) => {
        if (!auth || auth.status !== 'logged_in') return;
        const updated: AuthState = {
          ...auth,
          user: {
            ...auth.user!,
            ...userUpdates,
          }
        };
        // Re-calculate initials if name or email changed
        if (userUpdates.name || userUpdates.email) {
          updated.user!.initials = getInitials(updated.user);
        }
        setAuth(updated);
      }
    };
  }, [auth, setAuth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
