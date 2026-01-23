import { createContext, useContext, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

export interface AuthUser {
  id?: string | number;
  username?: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  initials?: string;
}

export interface AuthState {
  token?: string;
  user?: AuthUser;
}

interface AuthContextValue {
  auth: AuthState | null;
  isAuthenticated: boolean;
  login: (state: AuthState) => void;
  logout: () => void;
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

  const value = useMemo<AuthContextValue>(() => {
    const normalizedAuth: AuthState | null = auth
      ? {
          token: auth.token,
          user: {
            ...auth.user,
            initials: auth.user?.initials || getInitials(auth.user),
          },
        }
      : null;

    return {
      auth: normalizedAuth,
      isAuthenticated: Boolean(normalizedAuth?.token),
      login: (state) => {
        const normalized: AuthState = {
          token: state.token,
          user: {
            ...state.user,
            initials: state.user?.initials || getInitials(state.user),
          },
        };
        setAuth(normalized);
      },
      logout: () => setAuth(null),
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
