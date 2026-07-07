import { createContext, useContext, useMemo, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { api } from '../services/api';































const AuthContext = createContext(undefined);

const getInitials = (user) => {
  const source = user?.name || user?.username || user?.email || '';
  if (!source) return 'U';
  const parts = source.split(/\s+|@/).filter(Boolean);
  const initials = parts.
  slice(0, 2).
  map((p) => p[0]?.toUpperCase()).
  join('');
  return initials || 'U';
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useLocalStorage('auth', null);

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

  const value = useMemo(() => {
    const normalizedAuth = auth ?
    {
      ...auth,
      user: auth.user ? {
        ...auth.user,
        initials: auth.user?.initials || getInitials(auth.user)
      } : undefined
    } :
    null;

    return {
      auth: normalizedAuth,
      isAuthenticated: normalizedAuth?.status === 'logged_in',
      isGuest: normalizedAuth?.status === 'guest',
      login: (state) => {
        const normalized = {
          token: state.token,
          status: 'logged_in',
          user: {
            ...state.user,
            initials: state.user?.initials || getInitials(state.user)
          }
        };
        setAuth(normalized);
      },
      continueAsGuest: () => {
        setAuth({
          status: 'guest',
          user: { name: 'Guest User', initials: 'GU' }
        });
      },
      logout: async () => {
        try {
          if (auth?.token) {
            await api.post('/users/logout', {}, {
              headers: { Authorization: `Bearer ${auth.token}` }
            });
          }
        } catch (e) {
          console.error("Backend logout error", e);
        } finally {
          setAuth(null);
        }
      },
      updateUser: (userUpdates) => {
        if (!auth || auth.status !== 'logged_in') return;
        const updated = {
          ...auth,
          user: {
            ...auth.user,
            ...userUpdates
          }
        };
        // Re-calculate initials if name or email changed
        if (userUpdates.name || userUpdates.email) {
          updated.user.initials = getInitials(updated.user);
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