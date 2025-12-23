"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { useNotifications } from "@/lib/notification-context"
import { formatDate } from "@/lib/utils"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ArrowLeft, Bell, Package, CreditCard, Megaphone, Settings, CheckCheck } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "order":
      return Package
    case "payment":
      return CreditCard
    case "promo":
      return Megaphone
    case "system":
      return Settings
    default:
      return Bell
  }
}

export default function NotificationsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <LoadingSpinner />
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Profil
          </Link>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">
                <span className="gradient-text">Notifikasi</span>
              </h1>
              <p className="text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : "Semua notifikasi sudah dibaca"}
              </p>
            </div>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                <CheckCheck className="h-4 w-4 mr-2" />
                Tandai Semua Dibaca
              </Button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="text-center py-16">
              <lord-icon
                src="https://cdn.lordicon.com/psnhyobz.json"
                trigger="loop"
                colors="primary:#6366f1,secondary:#8b5cf6"
                style={{ width: "100px", height: "100px" }}
              />
              <h3 className="mt-4 text-lg font-semibold">Tidak Ada Notifikasi</h3>
              <p className="text-muted-foreground">Anda belum memiliki notifikasi</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type)
                return (
                  <Card
                    key={notification.id}
                    className={cn(
                      "glass border-border cursor-pointer transition-colors",
                      !notification.isRead && "border-primary/50 bg-primary/5",
                    )}
                    onClick={() => {
                      markAsRead(notification.id)
                      if (notification.orderId) {
                        router.push(`/profile/orders/${notification.orderId}`)
                      }
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div
                          className={cn(
                            "p-3 rounded-xl flex-shrink-0",
                            !notification.isRead ? "bg-primary/20" : "bg-secondary/50",
                          )}
                        >
                          <Icon
                            className={cn("h-5 w-5", !notification.isRead ? "text-primary" : "text-muted-foreground")}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className={cn("font-medium", !notification.isRead && "text-primary")}>
                              {notification.title}
                            </h3>
                            {!notification.isRead && <Badge className="gradient-primary text-xs">Baru</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">{formatDate(notification.createdAt)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
