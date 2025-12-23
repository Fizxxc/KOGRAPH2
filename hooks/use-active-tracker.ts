"use client"

import { useEffect } from "react"
import { useAuth } from "@/lib/auth-context"

export function useActiveTracker() {
  const { user } = useAuth()

  useEffect(() => {
    if (user?.uid) {
      localStorage.setItem("currentUserId", user.uid)
    } else {
      localStorage.removeItem("currentUserId")
    }
  }, [user])
}
