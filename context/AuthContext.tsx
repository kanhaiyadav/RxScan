// context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import appwriteService from '@/lib/appwrite';

interface User {
  $id: string;
  email: string;
  name: string;
  emailVerification: boolean;
  registration: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, name?: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      setIsLoading(true);
      const currentUser = await appwriteService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    } catch (error) {
      console.log('Error checking auth state:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      setIsLoading(true);
      
      await appwriteService.signIn(email, password);
      const currentUser = await appwriteService.getCurrentUser();
      
      if (currentUser) {
        setUser(currentUser);
        return true;
      }
      return false;
    } catch (error: any) {
      console.log('Sign in error:', error);
      setError(error.message || 'Failed to sign in');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name?: string): Promise<boolean> => {
    try {
      setError(null);
      setIsLoading(true);
      
      await appwriteService.createAccount(email, password, name);
      const currentUser = await appwriteService.getCurrentUser();
      
      if (currentUser) {
        setUser(currentUser);
        return true;
      }
      return false;
    } catch (error: any) {
      console.log('Sign up error:', error);
      setError(error.message || 'Failed to create account');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await appwriteService.signOut();
      setUser(null);
    } catch (error) {
      console.log('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};