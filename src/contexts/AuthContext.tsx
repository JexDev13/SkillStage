import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  setPersistence,
  browserSessionPersistence
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
  resetPassword: (email: string) => Promise<boolean>;
  signUpWithGoogle: () => Promise<boolean>;
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
      await setPersistence(auth, browserSessionPersistence);
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

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error) {
      console.error('Reset password error:', error);
      return false;
    }
  };

  const signUpWithGoogle = async () => {
    try {
      await setPersistence(auth, browserSessionPersistence);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          name: user.displayName,
          email: user.email,
          createdAt: new Date(),
        });

        await initializeUserProgress(user.uid);
      }

      return true;
    } catch (error) {
      console.error('Google sign-in error:', error);
      return false;
    }
  };


  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, resetPassword, signUpWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
