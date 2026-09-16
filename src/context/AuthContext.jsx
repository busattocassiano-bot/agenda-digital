import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setIsAuthenticated(true);
        // Fetch additional user data from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        let userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || 'Usuário',
          cargo: 'Administrador' // default
        };

        if (userDoc.exists()) {
          userData = { ...userData, ...userDoc.data() };
        } else {
          // If document doesn't exist, create it
          await setDoc(userDocRef, { name: userData.name, cargo: userData.cargo, email: userData.email });
        }
        
        setCurrentUser(userData);
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const register = async (email, password, name) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userDocRef, {
        name,
        email,
        cargo: 'Administrador'
      });
      return { success: true };
    } catch (error) {
      console.error("Error registering:", error);
      return { success: false, error: error.message };
    }
  };

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      console.error("Error logging in:", error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const updateUser = async (updatedData) => {
    if (currentUser && currentUser.uid) {
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, updatedData);
        setCurrentUser(prev => ({ ...prev, ...updatedData }));
        return true;
      } catch (error) {
        console.error("Error updating user:", error);
        return false;
      }
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, currentUser, login, logout, register, updateUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
