import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase';

export const ADMIN_BOOTSTRAP_EMAIL = 'johnnynoguera272@gmail.com';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'admin' | 'streamer';
  status: 'pending' | 'active' | 'suspended';
  tiktokUsername?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  isActive: boolean;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateTikTokHandle: (handle: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (unsubscribeDoc) {
        unsubscribeDoc();
        unsubscribeDoc = null;
      }

      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);

        try {
          const userSnap = await getDoc(userDocRef);
          const isBootstrapAdmin = firebaseUser.email?.toLowerCase() === ADMIN_BOOTSTRAP_EMAIL.toLowerCase();

          if (!userSnap.exists()) {
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'Streamer',
              photoURL: firebaseUser.photoURL || '',
              role: isBootstrapAdmin ? 'admin' : 'streamer',
              status: isBootstrapAdmin ? 'active' : 'pending',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);

            if (isBootstrapAdmin) {
              const adminDocRef = doc(db, 'admins', firebaseUser.uid);
              await setDoc(adminDocRef, {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
              });
            }
          } else {
            const existingData = userSnap.data() as UserProfile;
            // Ensure admin role for bootstrap email
            if (isBootstrapAdmin && (existingData.role !== 'admin' || existingData.status !== 'active')) {
              await updateDoc(userDocRef, { role: 'admin', status: 'active' });
              existingData.role = 'admin';
              existingData.status = 'active';
            }
            setUserProfile(existingData);
          }

          // Real-time listener for profile status updates (e.g. activation by admin)
          unsubscribeDoc = onSnapshot(
            userDocRef,
            (snapshot) => {
              if (snapshot.exists()) {
                setUserProfile(snapshot.data() as UserProfile);
              }
            },
            (error) => {
              handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
            }
          );
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) {
        unsubscribeDoc();
      }
    };
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Error cerrando sesión:', error);
    }
  };

  const updateTikTokHandle = async (handle: string) => {
    if (!user) return;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        tiktokUsername: handle.trim().replace(/^@+/, ''),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const isAdmin =
    user?.email?.toLowerCase() === ADMIN_BOOTSTRAP_EMAIL.toLowerCase() ||
    userProfile?.role === 'admin';

  const isActive = isAdmin || userProfile?.status === 'active';

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isAdmin,
        isActive,
        loading,
        loginWithGoogle,
        logout,
        updateTikTokHandle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}
