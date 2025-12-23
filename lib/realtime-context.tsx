"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { db, collection, query, where, orderBy, onSnapshot, doc, setDoc, deleteDoc } from "@/lib/firebase"
import type { Review, SiteSettings } from "@/lib/types"

interface RealtimeStats {
  completedProjects: number
  averageRating: number
  totalReviews: number
  responseTime: string
  activeUsers: number
}

interface RealtimeContextType {
  stats: RealtimeStats
  reviews: Review[]
  settings: SiteSettings | null
  loading: boolean
}

const defaultSettings: SiteSettings = {
  id: "main",
  responseTime: "< 1 Jam",
  contactTelegram: "@Kokociixx",
  contactWhatsapp: "085776568948",
  contactEmail: "kograph@gmail.com",
  address: "Indonesia",
  aboutUs: "",
  privacyPolicy: "",
  updatedAt: new Date(),
}

const RealtimeContext = createContext<RealtimeContextType>({
  stats: {
    completedProjects: 0,
    averageRating: 0,
    totalReviews: 0,
    responseTime: "< 1 Jam",
    activeUsers: 0,
  },
  reviews: [],
  settings: defaultSettings,
  loading: true,
})

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<RealtimeStats>({
    completedProjects: 0,
    averageRating: 0,
    totalReviews: 0,
    responseTime: "< 1 Jam",
    activeUsers: 0,
  })
  const [reviews, setReviews] = useState<Review[]>([])
  const [settings, setSettings] = useState<SiteSettings | null>(defaultSettings)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const visitorId =
      localStorage.getItem("visitorId") || `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem("visitorId", visitorId)

    const updateActiveStatus = async () => {
      try {
        // Get current user from auth if available
        const currentUserId = localStorage.getItem("currentUserId") || null

        await setDoc(doc(db, "activeUsers", visitorId), {
          visitorId,
          userId: currentUserId,
          lastSeen: new Date(),
        })
      } catch (error) {
        console.error("Error updating active status:", error)
      }
    }

    updateActiveStatus()
    const interval = setInterval(updateActiveStatus, 30000)

    // Cleanup old active users and listen for active count
    const cleanupAndListen = async () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

      const activeQuery = query(collection(db, "activeUsers"))
      const unsubActive = onSnapshot(activeQuery, (snapshot) => {
        let count = 0
        snapshot.forEach((doc) => {
          const data = doc.data()
          const lastSeen = data.lastSeen?.toDate() || new Date(0)
          if (lastSeen > fiveMinutesAgo) {
            count++
          }
        })
        setStats((prev) => ({ ...prev, activeUsers: count }))
      })

      return unsubActive
    }

    let unsubActive: (() => void) | undefined

    cleanupAndListen().then((unsub) => {
      unsubActive = unsub
    })

    // Listen for completed orders count
    const ordersQuery = query(collection(db, "orders"), where("status", "==", "completed"))
    const unsubOrders = onSnapshot(ordersQuery, (snapshot) => {
      setStats((prev) => ({ ...prev, completedProjects: snapshot.size }))
    })

    // Listen for approved reviews
    const reviewsQuery = query(collection(db, "reviews"), where("isApproved", "==", true), orderBy("createdAt", "desc"))
    const unsubReviews = onSnapshot(reviewsQuery, (snapshot) => {
      const reviewsList: Review[] = []
      let totalRating = 0

      snapshot.forEach((doc) => {
        const data = doc.data()
        reviewsList.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as Review)
        totalRating += data.rating || 0
      })

      const avgRating = reviewsList.length > 0 ? totalRating / reviewsList.length : 5.0
      setReviews(reviewsList)
      setStats((prev) => ({
        ...prev,
        averageRating: Math.round(avgRating * 10) / 10,
        totalReviews: reviewsList.length,
      }))
    })

    // Listen for site settings
    const unsubSettings = onSnapshot(doc(db, "settings", "main"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data()
        setSettings({
          ...defaultSettings,
          ...data,
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as SiteSettings)
        setStats((prev) => ({ ...prev, responseTime: data.responseTime || "< 1 Jam" }))
      } else {
        setSettings(defaultSettings)
      }
      setLoading(false)
    })

    return () => {
      clearInterval(interval)
      unsubOrders()
      unsubReviews()
      unsubSettings()
      if (unsubActive) unsubActive()
      // Remove user from active when leaving
      deleteDoc(doc(db, "activeUsers", visitorId)).catch(() => {})
    }
  }, [])

  return <RealtimeContext.Provider value={{ stats, reviews, settings, loading }}>{children}</RealtimeContext.Provider>
}

export const useRealtime = () => useContext(RealtimeContext)
