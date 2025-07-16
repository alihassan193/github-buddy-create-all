
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getActiveClubSession } from '@/services/clubSessionService';
import { useAuth } from './AuthContext';

interface ClubSessionContextType {
  activeSession: any | null;
  isSessionActive: boolean;
  refreshSession: () => Promise<void>;
  setActiveSession: (session: any | null) => void;
  isLoading: boolean;
}

const ClubSessionContext = createContext<ClubSessionContextType | undefined>(undefined);

interface ClubSessionProviderProps {
  children: ReactNode;
}

export const ClubSessionProvider: React.FC<ClubSessionProviderProps> = ({ children }) => {
  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const refreshSession = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const session = await getActiveClubSession();
      setActiveSession(session);
    } catch (error) {
      console.error('Error fetching active club session:', error);
      setActiveSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && (user.role === 'manager' || user.role === 'sub_admin' || user.role === 'super_admin')) {
      refreshSession();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const value: ClubSessionContextType = {
    activeSession,
    isSessionActive: !!activeSession && !activeSession.closed_at,
    refreshSession,
    setActiveSession,
    isLoading,
  };

  return (
    <ClubSessionContext.Provider value={value}>
      {children}
    </ClubSessionContext.Provider>
  );
};

export const useClubSession = (): ClubSessionContextType => {
  const context = useContext(ClubSessionContext);
  if (!context) {
    throw new Error('useClubSession must be used within a ClubSessionProvider');
  }
  return context;
};
