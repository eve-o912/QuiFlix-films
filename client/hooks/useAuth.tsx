'use client'

import React, { useEffect, useState, useContext, ReactNode } from "react";
import { auth } from "@/firebase/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { 
    createAccountWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    userSignOut 
} from "@/firebase/auth";

interface AuthContextType {
  currentUser: User | null;
  userLoggedIn: boolean;
  loading: boolean;
  signUp: (email: string, password: string, username?: string) => Promise<User>;
  logIn: (email: string, password: string) => Promise<User>;
  logOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        // During SSR or if not wrapped in AuthProvider, return default values
        return {
            currentUser: null,
            userLoggedIn: false,
            loading: true,
            signUp: async () => { throw new Error('useAuth must be used within an AuthProvider'); },
            logIn: async () => { throw new Error('useAuth must be used within an AuthProvider'); },
            logOut: async () => { throw new Error('useAuth must be used within an AuthProvider'); }
        };
    }
    return context;
}

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps){
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userLoggedIn, setUserLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const unsubscribe = onAuthStateChanged(auth, initializeUser);
        return unsubscribe;
    }, [])

    async function initializeUser(user: User | null) {
        if (user) {
            setCurrentUser({...user});
            setUserLoggedIn(true);
        } else {
            setCurrentUser(null);
            setUserLoggedIn(false);
        }
        setLoading(false);
    }

    const signUp = async (email: string, password: string, username?: string): Promise<User> => {
        const userCredential = await createAccountWithEmailAndPassword(email, password, username);
        return userCredential.user;
    }

    const logIn = async (email: string, password: string): Promise<User> => {
        const userCredential = await signInWithEmailAndPassword(email, password);
        return userCredential.user;
    }

    const logOut = async (): Promise<void> => {
        setCurrentUser(null);
        setUserLoggedIn(false);
        await userSignOut();
    }

    const value = {
        currentUser,
        userLoggedIn, 
        loading,
        signUp,
        logIn,
        logOut
    }

    // Prevent SSR hydration mismatch by waiting for client mount
    if (!mounted) {
        return (
            <AuthContext.Provider value={{
                currentUser: null,
                userLoggedIn: false,
                loading: true,
                signUp,
                logIn,
                logOut
            }}>
                {children}
            </AuthContext.Provider>
        );
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}