import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword as firebaseSignIn,
    signOut
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

// Create account with email and password
export const createAccountWithEmailAndPassword = async (email: string, password: string, username?: string) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Store user data in Firestore
        const userDocRef = doc(db, 'users', userCredential.user.uid);
        await setDoc(userDocRef, {
            email: email,
            username: username || '',
            createdAt: new Date(),
            uid: userCredential.user.uid
        });

        return userCredential;
    } catch (error) {
        throw error;
    }
}

// Sign in with email and password
export const signInWithEmailAndPassword = async (email: string, password: string) => {
    try {
        const userCredential = await firebaseSignIn(auth, email, password);

        // Check if user exists in Firestore
        const userDocRef = doc(db, 'users', userCredential.user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            // If user doesn't exist in database, sign them out and throw error
            await signOut(auth);
            throw new Error('User account not found in database. Please contact support.');
        }

        return userCredential;
    } catch (error) {
        throw error;
    }
}

// Sign out user
export const userSignOut = async () => {
    return signOut(auth);
}

// Update user profile
export const updateUserProfile = async (uid: string, data: { username?: string }) => {
    try {
        const userDocRef = doc(db, 'users', uid);
        await setDoc(userDocRef, data, { merge: true });
        return true;
    } catch (error) {
        throw error;
    }
}

// Get user profile
export const getUserProfile = async (uid: string) => {
    try {
        const userDocRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
            return userDoc.data();
        }
        return null;
    } catch (error) {
        throw error;
    }
}