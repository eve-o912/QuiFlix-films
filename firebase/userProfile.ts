import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export interface UserProfile {
  uid: string;
  email: string;
  username?: string;
  displayName?: string;
  avatar?: string;
  createdAt: any;
  updatedAt: any;
  provider: string;
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    notifications?: boolean;
    language?: string;
  };
  walletAddress?: string;
  isActive: boolean;
}

// Create or update user profile
export const createOrUpdateUserProfile = async (uid: string, email: string, additionalData?: Partial<UserProfile>): Promise<UserProfile> => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  const baseProfile: UserProfile = {
    uid,
    email,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    provider: 'password',
    isActive: true,
    preferences: {
      theme: 'system',
      notifications: true,
      language: 'en'
    },
    ...additionalData
  };

  if (userSnap.exists()) {
    // Update existing profile
    const updateData = {
      ...baseProfile,
      createdAt: userSnap.data().createdAt, // Keep original creation date
      updatedAt: serverTimestamp(),
      ...additionalData
    };
    await updateDoc(userRef, updateData);
    return updateData as UserProfile;
  } else {
    // Create new profile
    await setDoc(userRef, baseProfile);
    return baseProfile;
  }
};

// Get user profile
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// Update user profile
export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
};

// Set user wallet address
export const setUserWalletAddress = async (uid: string, walletAddress: string): Promise<boolean> => {
  return updateUserProfile(uid, { walletAddress });
};
