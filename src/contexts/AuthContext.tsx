import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, getCurrentUser, setCurrentUser, logout as logoutStorage, getUserByEmail, createUser, initializeStorage } from '@/lib/storage';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

interface SignupData {
  email: string;
  password: string;
  name: string;
  department: string;
  role?: 'student' | 'staff';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeStorage();
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const foundUser = getUserByEmail(email);
    
    if (!foundUser) {
      return { success: false, error: 'No account found with this email address' };
    }
    
    if (foundUser.password !== password) {
      return { success: false, error: 'Incorrect password' };
    }

    setUser(foundUser);
    setCurrentUser(foundUser);
    return { success: true };
  };

  const signup = async (data: SignupData): Promise<{ success: boolean; error?: string }> => {
    const existingUser = getUserByEmail(data.email);
    
    if (existingUser) {
      return { success: false, error: 'An account with this email already exists' };
    }

    const newUser = createUser({
      email: data.email,
      password: data.password,
      name: data.name,
      department: data.department,
      role: data.role || 'student',
    });

    setUser(newUser);
    setCurrentUser(newUser);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    logoutStorage();
  };

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      setCurrentUser(updatedUser);
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
