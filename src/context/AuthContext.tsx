import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, googleProvider, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, UserRole } from '../types/job';

export const ADMIN_EMAILS = [
  'rahimiqtina@gmail.com',
  'chtaha1995@gmail.com',
];

export const isDirectAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.some(e => e.toLowerCase() === email.trim().toLowerCase());
};

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let profileUnsubscribe: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (profileUnsubscribe) {
        profileUnsubscribe();
        profileUnsubscribe = null;
      }

      if (currentUser) {
        try {
          const isDirectAdmin = isDirectAdminEmail(currentUser.email);

          // 1. Check if admin
          const adminDocRef = doc(db, 'admins', currentUser.uid);
          const adminSnap = await getDoc(adminDocRef);

          if (adminSnap.exists() && adminSnap.data()?.role === 'superadmin') {
            setIsAdmin(true);
          } else if (isDirectAdmin) {
            setIsAdmin(true);
            try {
              await setDoc(adminDocRef, {
                uid: currentUser.uid,
                email: currentUser.email,
                role: 'superadmin',
                createdAt: new Date().toISOString(),
              }, { merge: true });
            } catch (err) {
              console.warn('Admin record note:', err);
            }
          } else {
            setIsAdmin(false);
          }

          // 2. Listen to UserProfile document (/users/{uid})
          const userDocRef = doc(db, 'users', currentUser.uid);
          profileUnsubscribe = onSnapshot(userDocRef, async (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              setUserProfile({ 
                uid: currentUser.uid, 
                ...data,
                // If direct admin, always consider onboarding complete
                hasCompletedOnboarding: isDirectAdmin ? true : (data.hasCompletedOnboarding ?? false)
              } as UserProfile);
            } else {
              // Create initial profile for this user
              const initialProfile: UserProfile = {
                uid: currentUser.uid,
                email: currentUser.email || '',
                displayName: currentUser.displayName || (currentUser.email ? currentUser.email.split('@')[0] : 'User'),
                photoURL: currentUser.photoURL || '',
                role: isDirectAdmin ? 'admin' : 'job_seeker',
                countryId: 'qatar',
                city: 'Doha',
                headline: isDirectAdmin ? 'مدير منصة وظائف الخليج' : 'باحث عن عمل في دول الخليج',
                isSeekingJob: true,
                hasCompletedOnboarding: isDirectAdmin ? true : false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };

              try {
                await setDoc(userDocRef, initialProfile, { merge: true });
                setUserProfile(initialProfile);
              } catch (err) {
                console.warn('Could not auto-create profile doc:', err);
                setUserProfile(initialProfile);
              }
            }
          });

        } catch (error) {
          console.error('Error verifying user profile:', error);
          if (isDirectAdminEmail(currentUser.email)) {
            setIsAdmin(true);
          }
        }
      } else {
        setUserProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (profileUnsubscribe) profileUnsubscribe();
    };
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
      setIsAdmin(false);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error('Not authenticated');
    const userDocRef = doc(db, 'users', user.uid);
    const updated = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    try {
      await setDoc(userDocRef, updated, { merge: true });
      setUserProfile(prev => prev ? { ...prev, ...updated } : null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile, 
      isAdmin, 
      loading, 
      loginWithGoogle, 
      logout,
      updateUserProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
