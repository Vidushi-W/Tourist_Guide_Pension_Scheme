import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from './api';
import type { User } from './types';

type AuthValue = { user: User | null; loading: boolean; login(email: string, password: string): Promise<User>; logout(): Promise<void>; refresh(): Promise<void> };
const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null); const [loading, setLoading] = useState(true);
  const refresh = async () => { try { setUser((await api.get('/auth/me')).data.data); } catch { setUser(null); } finally { setLoading(false); } };
  useEffect(() => { void refresh(); }, []);
  const value = useMemo(() => ({ user, loading, refresh,
    login: async (email: string, password: string) => { const result = (await api.post('/auth/login', { email, password })).data.data; setUser(result); return result; },
    logout: async () => { await api.post('/auth/logout'); setUser(null); },
  }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => { const value = useContext(AuthContext); if (!value) throw new Error('AuthProvider is missing'); return value; };

