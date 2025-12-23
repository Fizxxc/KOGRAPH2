"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, isAdmin, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login")
      } else if (!isAdmin) {
        router.push("/")
      }
    }
  }, [user, isAdmin, loading, router])

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user || !isAdmin) {
    return null
  }

  return <>{children}</>
}
