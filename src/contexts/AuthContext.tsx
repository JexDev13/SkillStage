import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, ExerciseScore } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for stored user data on app load
    const storedUser = localStorage.getItem('englishLearningUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo purposes, accept any email/password combination
    const newUser: User = {
      id: '1',
      email,
      name: email.split('@')[0],
      progress: {
        completedUnits: [],
        exerciseScores: {},
        currentUnit: 1
      }
    };
    
    setUser(newUser);
    localStorage.setItem('englishLearningUser', JSON.stringify(newUser));
    return true;
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      progress: {
        completedUnits: [],
        exerciseScores: {},
        currentUnit: 1
      }
    };
    
    setUser(newUser);
    localStorage.setItem('englishLearningUser', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('englishLearningUser');
  };

  const updateProgress = (unitId: number, exerciseId: string, score: ExerciseScore) => {
    if (!user) return;
    
    const updatedUser = {
      ...user,
      progress: {
        ...user.progress,
        exerciseScores: {
          ...user.progress.exerciseScores,
          [exerciseId]: score
        },
        completedUnits: user.progress.completedUnits.includes(unitId) 
          ? user.progress.completedUnits 
          : [...user.progress.completedUnits, unitId]
      }
    };
    
    setUser(updatedUser);
    localStorage.setItem('englishLearningUser', JSON.stringify(updatedUser));
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    updateProgress
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};