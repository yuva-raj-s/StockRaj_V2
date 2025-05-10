import React, { createContext, useContext, useState } from 'react';
import { AuthState, User } from '../types/auth';
import { authService } from '../services/auth';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false
  });

  const login = async (email: string, password: string) => {
    const user = await authService.login(email, password);
    if (user) {
      setState({ user, isAuthenticated: true });
      return true;
    }
    return false;
  };

  const signup = async (name: string, email: string, password: string) => {
    const user = await authService.signup(name, email, password);
    if (user) {
      setState({ user, isAuthenticated: true });
      return true;
    }
    return false;
  };

  const logout = () => {
    setState({ user: null, isAuthenticated: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};