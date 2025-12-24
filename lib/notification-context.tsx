"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "./auth-context"
import { db, collection, query, where, orderBy, onSnapshot, doc, updateDoc } from "./firebase"
import type { Notification } from "./types"

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    if (!user) {
      setNotifications([])
      return
    }

    const q = query(collection(db, "notifications"), where("userId", "==", user.uid), orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs: Notification[] = []
      snapshot.forEach((doc) => {
        notifs.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt ?? null,
        } as Notification)
      })
      setNotifications(notifs)
    })

    return () => unsubscribe()
  }, [user])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const markAsRead = async (notificationId: string) => {
    await updateDoc(doc(db, "notifications", notificationId), {
      isRead: true,
    })
  }

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n) => !n.isRead)
    await Promise.all(unreadNotifications.map((n) => updateDoc(doc(db, "notifications", n.id), { isRead: true })))
  }

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}
