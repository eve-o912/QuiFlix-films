// src/lib/firebase-functions.ts

import { db } from '@/firebase.config';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  Timestamp 
} from 'firebase/firestore';

// Purchase related functions
export const recordPurchase = async (purchaseData: {
  filmId: string;
  userId: string;
  amount: number;
  transactionHash?: string;
  walletAddress: string;
}) => {
  try {
    const purchaseRef = await addDoc(collection(db, 'purchases'), {
      ...purchaseData,
      createdAt: Timestamp.now(),
      status: 'completed'
    });
    return { success: true, id: purchaseRef.id };
  } catch (error) {
    console.error('Error recording purchase:', error);
    return { success: false, error };
  }
};

// Get user's purchases
export const getUserPurchases = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'purchases'),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching purchases:', error);
    return [];
  }
};

// Check if user owns a film
export const checkFilmOwnership = async (userId: string, filmId: string) => {
  try {
    const q = query(
      collection(db, 'purchases'),
      where('userId', '==', userId),
      where('filmId', '==', filmId)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking ownership:', error);
    return false;
  }
};

// Film related functions
export const getFilms = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'films'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching films:', error);
    return [];
  }
};

export const getFilmById = async (filmId: string) => {
  try {
    const filmDoc = doc(db, 'films', filmId);
    const snapshot = await getDocs(collection(db, 'films'));
    const film = snapshot.docs.find(d => d.id === filmId);
    return film ? { id: film.id, ...film.data() } : null;
  } catch (error) {
    console.error('Error fetching film:', error);
    return null;
  }
};
