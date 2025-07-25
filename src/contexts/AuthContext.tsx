// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { initializeUserProgress } from '../lib/utils';

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loginWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const register = async (email: string, password: string, name: string) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const uid = res.user.uid;
      await setDoc(doc(db, 'users', uid), {
        name,
        email,
        createdAt: new Date(),
      });

      await initializeUserProgress(uid);

      return true;
    } catch (error) {
      console.error('Error creating account:', error);
      return false;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const res = await signInWithPopup(auth, provider);
    const uid = res.user.uid;

    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', uid), {
        name: res.user.displayName,
        email: res.user.email,
        createdAt: new Date(),
      });

      await setDoc(doc(db, 'users', uid, 'user_progress', 'unit_1'), {
        unitId: '1',
        isUnitCompleted: false,
        subtopics: [
          { id: 'sub_1', isCompleted: false, isLocked: false },
          { id: 'sub_2', isCompleted: false, isLocked: true },
          // ...
        ],
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
