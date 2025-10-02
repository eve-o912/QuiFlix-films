import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword as firebaseSignIn,
    signOut
} from "firebase/auth";
import { auth } from "./firebase";

// Create account with email and password
export const createAccountWithEmailAndPassword = async (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password);
}

// Sign in with email and password  
export const signInWithEmailAndPassword = async (email: string, password: string) => {
    return firebaseSignIn(auth, email, password);
}

// Sign out user
export const userSignOut = async () => {
    return signOut(auth);
}