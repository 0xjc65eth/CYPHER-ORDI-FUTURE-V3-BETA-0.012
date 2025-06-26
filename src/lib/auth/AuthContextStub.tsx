'use client';

import { createContext, useContext, useState } from 'react';

/**
 * Stub AuthContext para desenvolvimento/build sem Supabase
 */

interface StubUser {
  id: string;
  email: string;
  username?: string;
}

interface AuthContextType {
  user: StubUser | null;
  session: any | null;
  profile: any | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata?: { username?: string }) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithOAuth: (provider: 'google' | 'github' | 'discord') => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: any) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StubUser | null>(null);
  const [loading, setLoading] = useState(false);

  const signUp = async (email: string, password: string, metadata?: { username?: string }) => {
    console.warn('⚠️ AuthProvider Stub: signUp called in development mode');
    return { error: new Error('Supabase not configured - using development stub') };
  };

  const signIn = async (email: string, password: string) => {
    console.warn('⚠️ AuthProvider Stub: signIn called in development mode');
    // Simulate successful login for development
    setUser({
      id: 'dev-user-123',
      email: email,
      username: 'DevUser'
    });
    return { error: null };
  };

  const signInWithOAuth = async (provider: 'google' | 'github' | 'discord') => {
    console.warn('⚠️ AuthProvider Stub: OAuth sign in not available in development mode');
    return { error: new Error('OAuth not configured - using development stub') };
  };

  const signOut = async () => {
    console.warn('⚠️ AuthProvider Stub: signOut called in development mode');
    setUser(null);
  };

  const updateProfile = async (updates: any) => {
    console.warn('⚠️ AuthProvider Stub: updateProfile called in development mode');
    return { error: null };
  };

  const value = {
    user,
    session: user ? { user } : null,
    profile: user ? { username: user.username, email: user.email } : null,
    loading,
    signUp,
    signIn,
    signInWithOAuth,
    signOut,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}