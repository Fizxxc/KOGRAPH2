"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import {
  auth,
  db,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  type User,
} from "./firebase"
import type { UserProfile } from "./types"

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName: string) => Promise<void>
  signOut: () => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)

      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as UserProfile)
        }
      } else {
        setUserProfile(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password)
    const userDoc = await getDoc(doc(db, "users", result.user.uid))
    if (userDoc.exists()) {
      setUserProfile(userDoc.data() as UserProfile)
    }
  }

  const signUp = async (email: string, password: string, displayName: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password)

    const newUserProfile: UserProfile = {
      uid: result.user.uid,
      email: result.user.email!,
      displayName,
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await setDoc(doc(db, "users", result.user.uid), {
      ...newUserProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    setUserProfile(newUserProfile)
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
    setUser(null)
    setUserProfile(null)
  }

  const isAdmin = userProfile?.role === "admin"

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signIn,
        signUp,
        signOut,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
