import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { createUserProfile, getUserProfile } from '@/lib/firebaseService';
import { User, logout as logoutStorage, initializeStorage } from '@/lib/storage';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => void;
}

interface SignupData {
  email: string;
  password: string;
  name: string;
  department: string;
  role?: 'student' | 'academic_faculty' | 'lab_incharge' | 'maintenance_incharge';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeStorage();

    // Subscribe to Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch additional user data from Firestore
        const profileResult = await getUserProfile(firebaseUser.uid);
        if (profileResult.success && profileResult.data) {
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: profileResult.data.name,
            role: profileResult.data.role,
            department: profileResult.data.department,
            createdAt: profileResult.data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            password: '', // Password is not stored on frontend for security
          } as User);
        } else {
          // Fallback if profile doesn't exist yet but user is authenticated
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || 'User',
            role: 'student',
            department: 'General',
            createdAt: new Date().toISOString(),
            password: '',
          } as User);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error: any) {
      console.error("Login error:", error);
      let message = 'An error occurred during login.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = 'Invalid email or password.';
      }
      return { success: false, error: message };
    }
  };

  const signup = async (data: SignupData): Promise<{ success: boolean; error?: string }> => {
    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const firebaseUser = userCredential.user;

      // 2. Create user profile in Firestore
      const profileData = {
        name: data.name,
        department: data.department,
        role: data.role || 'student',
        email: data.email
      };

      const profileResult = await createUserProfile(firebaseUser.uid, profileData);

      if (!profileResult.success) {
        throw new Error(profileResult.error);
      }

      return { success: true };
    } catch (error: any) {
      console.error("Signup error:", error);
      let message = error.message || 'An error occurred during signup.';
      if (error.code === 'auth/email-already-in-use') {
        message = 'An account with this email already exists.';
      }
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      logoutStorage(); // Clear any local remnants
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      // Optional: sync this to Firestore as well if needed in future
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
