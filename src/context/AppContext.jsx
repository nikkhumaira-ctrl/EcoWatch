// src/context/AppContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  setDoc,
  doc,
  getDoc,
  deleteDoc,
  query,
  orderBy,
  getDocs,
} from "firebase/firestore";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile
} from "firebase/auth";
import { ASEAN_COUNTRIES } from '../data/mockData';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  // -----------------------------
  // Listen to Firebase Auth changes
  // -----------------------------
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch Firestore user data
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setCurrentUser({ uid: user.uid, ...userDoc.data() });
        } else {
          setCurrentUser(user); // fallback
        }
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // -----------------------------
  // Fetch logs from Firestore
  // -----------------------------
  useEffect(() => {
    const fetchLogs = async () => {
      const q = query(collection(db, "observations"), orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      const fetchedLogs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLogs(fetchedLogs);
    };
    fetchLogs();
  }, []);

  // -----------------------------
// Fetch users from Firestore  
// -----------------------------
useEffect(() => {
  const fetchUsers = async () => {
    try {
      const usersRef = collection(db, "users");
      const querySnapshot = await getDocs(usersRef);
      const fetchedUsers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(fetchedUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };
  fetchUsers();
}, []);

  // -----------------------------
  // Auth functions
  // -----------------------------
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch Firestore data
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        setCurrentUser({ uid: user.uid, ...userDoc.data() });
      } else {
        setCurrentUser(user);
      }
      return true;
    } catch (err) {
      console.error("Login error:", err);
      return false;
    }
  };

  const signup = async (email, password, name, country) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update display name in Auth
      await updateProfile(user, { displayName: name });

      // Save user in Firestore using UID as doc ID
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name,
        email,
        country,
        points: 10, // starting points
        avatar: name.substring(0, 2).toUpperCase()
      });

      // Fetch Firestore data and set as current user
      const userDoc = await getDoc(doc(db, "users", user.uid));
      setCurrentUser({ uid: user.uid, ...userDoc.data() });

      return true;
    } catch (err) {
      console.error("Signup error:", err);
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // -----------------------------
  // Logs/Observations
  // -----------------------------
  const addLog = async (newLogEntry) => {
    if (!currentUser) return null;
    const log = {
      ...newLogEntry,
      userId: currentUser.uid,
      timestamp: new Date(),
    };
    try {
      const docRef = await addDoc(collection(db, "observations"), log);
      setLogs(prev => [{ id: docRef.id, ...log }, ...prev]);
      return { id: docRef.id, ...log };
    } catch (err) {
      console.error("Error adding log:", err);
      return null;
    }
  };

  const deleteLog = async (logId) => {
    try {
      await deleteDoc(doc(db, "observations", logId));
      setLogs(prev => prev.filter(l => l.id !== logId));
    } catch (err) {
      console.error("Error deleting log:", err);
    }
  };

  const reportLog = (logId) => {
    setLogs(prev => prev.filter(l => l.id !== logId));
  };

  const getUserById = (id) => users.find(u => u.id === id);

  // -----------------------------
  // Context Value
  // -----------------------------
  return (
    <AppContext.Provider value={{
      currentUser,
      setCurrentUser,
      logs,
      users,
      leaderboard,
      login,
      signup,
      logout,
      addLog,
      deleteLog,
      reportLog,
      getUserById,
      aseanCountries: ASEAN_COUNTRIES
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
