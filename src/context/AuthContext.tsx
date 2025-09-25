import React, { createContext, useContext, useState } from 'react';

interface Auth {
  token: string | null;
  login: (t: string) => void;
  logout: () => void;
}
const AuthCtx = createContext<Auth>({ token: null, login: () => {}, logout: () => {} });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const login = (t: string) => { localStorage.setItem('token', t); setToken(t); };
  const logout = () => { localStorage.removeItem('token'); setToken(null); };
  return <AuthCtx.Provider value={{ token, login, logout }}>{children}</AuthCtx.Provider>;
};
export const useAuth = () => useContext(AuthCtx);