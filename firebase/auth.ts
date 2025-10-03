import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword as firebaseSignIn,
    signOut
} from "firebase/auth";
import { auth } from "./firebase";
import { createOrUpdateUserProfile } from "./userProfile";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const db = getFirestore();
// Create account with email and password
export const createAccountWithEmailAndPassword = async (email: string, password: string, username?: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user profile in Firestore
    await setDoc(doc(db, "users", cred.user.uid), {
        email: cred.user.email,
        username,
        displayName: username || cred.user.displayName || email.split('@')[0]
    });
    
    // Create user profile in Firestore
    await createOrUpdateUserProfile(cred.user.uid, cred.user.email!, {
        username,
        displayName: username || cred.user.displayName || email.split('@')[0]
    });
    
    return cred;
}

// Sign in with email and password  
export const signInWithEmailAndPassword = async (email: string, password: string) => {
    const cred = await firebaseSignIn(auth, email, password);

    await setDoc(doc(db, "users", cred.user.uid), {
        email: cred.user.email,
        username: cred.user.displayName || email.split('@')[0]
    });

    await createOrUpdateUserProfile(cred.user.uid, cred.user.email!, {
        username: cred.user.displayName || email.split('@')[0]
    });


    return cred;
}

// Sign out user
export const userSignOut = async () => {
    return signOut(auth);
}