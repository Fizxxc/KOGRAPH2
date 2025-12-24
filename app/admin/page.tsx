"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { db, collection, getDocs, query, where, orderBy, onSnapshot } from "@/lib/firebase"
import type { Order, DashboardStats, Notification } from "@/lib/types"
import { formatPrice, formatDate, getStatusColor, getStatusLabel } from "@/lib/utils"
import { LoadingSpinner } from "@/components/loading-spinner"
import {
  LayoutDashboard,
  Package,
  Menu,
  Users,
  Bell,
  LogOut,
  Home,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Clock,
  ChevronRight,
  Settings,
  MessageSquare,
  Star,
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function AdminDashboard() {
  const { signOut, userProfile } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    todayOrders: 0,
    todayRevenue: 0,
  })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [reviewCount, setReviewCount] = useState(0)
  const [avgRating, setAvgRating] = useState(0)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"))
        const ordersSnapshot = await getDocs(ordersQuery)
        const orders: Order[] = []

        ordersSnapshot.forEach((doc) => {
          orders.push({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt ?? null,
            updatedAt: doc.data().updatedAt ?? null,
          } as Order)
        })

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const todayOrders = orders.filter((o) => new Date(o.createdAt) >= today)

        setStats({
          totalOrders: orders.length,
          pendingOrders: orders.filter((o) => o.status === "pending").length,
          completedOrders: orders.filter((o) => o.status === "completed").length,
          totalRevenue: orders.filter((o) => o.paymentStatus === "paid").reduce((sum, o) => sum + o.totalPrice, 0),
          todayOrders: todayOrders.length,
          todayRevenue: todayOrders.filter((o) => o.paymentStatus === "paid").reduce((sum, o) => sum + o.totalPrice, 0),
        })

        setRecentOrders(orders.slice(0, 5))

        // Fetch reviews stats
        const reviewsSnapshot = await getDocs(collection(db, "reviews"))
        let totalRating = 0
        reviewsSnapshot.forEach((doc) => {
          totalRating += doc.data().rating || 0
        })
        setReviewCount(reviewsSnapshot.size)
        setAvgRating(reviewsSnapshot.size > 0 ? totalRating / reviewsSnapshot.size : 0)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()

    // Listen for admin notifications
    const notifQuery = query(
      collection(db, "notifications"),
      where("userId", "==", "admin"),
      orderBy("createdAt", "desc"),
    )

    const unsubscribe = onSnapshot(notifQuery, (snapshot) => {
      const notifs: Notification[] = []
      snapshot.forEach((doc) => {
        notifs.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt ?? null,
        } as Notification)
      })
      setNotifications(notifs.slice(0, 5))
    })

    return () => unsubscribe()
  }, [])

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin", active: true },
    { icon: Package, label: "Pesanan", href: "/admin/orders" },
    { icon: Menu, label: "Menu Layanan", href: "/admin/menu" },
    { icon: MessageSquare, label: "Reviews", href: "/admin/reviews" },
    { icon: Users, label: "Pengguna", href: "/admin/users" },
    { icon: Settings, label: "Pengaturan", href: "/admin/settings" },
  ]

  const statCards = [
    {
      icon: ShoppingBag,
      label: "Total Pesanan",
      value: stats.totalOrders,
      color: "text-blue-500",
      bg: "bg-blue-500/20",
    },
    {
      icon: Clock,
      label: "Menunggu",
      value: stats.pendingOrders,
      color: "text-yellow-500",
      bg: "bg-yellow-500/20",
    },
    {
      icon: TrendingUp,
      label: "Selesai",
      value: stats.completedOrders,
      color: "text-green-500",
      bg: "bg-green-500/20",
    },
    {
      icon: DollarSign,
      label: "Pendapatan",
      value: formatPrice(stats.totalRevenue),
      color: "text-primary",
      bg: "bg-primary/20",
    },
  ]

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-card border-r border-border transition-all duration-300",
          sidebarOpen ? "w-64" : "w-20",
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-border">
            <Link href="/admin" className="flex items-center gap-3">
              <lord-icon
                src="https://cdn.lordicon.com/wloilxuq.json"
                trigger="loop"
                delay="3000"
                colors="primary:#6366f1,secondary:#8b5cf6"
                style={{ width: "40px", height: "40px" }}
              />
              {sidebarOpen && <span className="font-bold text-xl gradient-text">Admin</span>}
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
                  item.active ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-secondary",
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-border space-y-2">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-secondary transition-colors"
            >
              <Home className="h-5 w-5" />
              {sidebarOpen && <span>Ke Website</span>}
            </Link>
            <button
              onClick={signOut}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors w-full"
            >
              <LogOut className="h-5 w-5" />
              {sidebarOpen && <span>Keluar</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn("flex-1 transition-all duration-300", sidebarOpen ? "ml-64" : "ml-20")}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-lg border-b border-border">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Dashboard</h1>
                <p className="text-sm text-muted-foreground">Selamat datang, {userProfile?.displayName}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notifications.filter((n) => !n.isRead).length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
                    {notifications.filter((n) => !n.isRead).length}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat, index) => (
              <Card key={index} className="glass border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={cn("p-3 rounded-xl", stat.bg)}>
                      <stat.icon className={cn("h-6 w-6", stat.color)} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Review Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="glass border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-yellow-500/20">
                    <Star className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Reviews</p>
                    <p className="text-2xl font-bold">{reviewCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-yellow-500/20">
                    <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Rata-rata Rating</p>
                    <p className="text-2xl font-bold">{avgRating.toFixed(1)} / 5</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Orders */}
            <div className="lg:col-span-2">
              <Card className="glass border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Pesanan Terbaru</CardTitle>
                  <Link href="/admin/orders">
                    <Button variant="ghost" size="sm">
                      Lihat Semua
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {recentOrders.length === 0 ? (
                    <div className="text-center py-8">
                      <lord-icon
                        src="https://cdn.lordicon.com/slkvcfos.json"
                        trigger="loop"
                        colors="primary:#6366f1,secondary:#8b5cf6"
                        style={{ width: "60px", height: "60px" }}
                      />
                      <p className="mt-4 text-muted-foreground">Belum ada pesanan</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentOrders.map((order) => (
                        <Link
                          key={order.id}
                          href={`/admin/orders/${order.id}`}
                          className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-primary/20">
                              <Package className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">#{order.id.slice(0, 8).toUpperCase()}</p>
                              <p className="text-sm text-muted-foreground">{order.userName}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(order.status)}>{getStatusLabel(order.status)}</Badge>
                            <p className="text-sm font-medium mt-1">{formatPrice(order.totalPrice)}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Notifications */}
            <Card className="glass border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifikasi
                </CardTitle>
              </CardHeader>
              <CardContent>
                {notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <lord-icon
                      src="https://cdn.lordicon.com/psnhyobz.json"
                      trigger="loop"
                      colors="primary:#6366f1,secondary:#8b5cf6"
                      style={{ width: "60px", height: "60px" }}
                    />
                    <p className="mt-4 text-muted-foreground">Tidak ada notifikasi</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={cn(
                          "p-3 rounded-xl",
                          !notif.isRead ? "bg-primary/10 border border-primary/30" : "bg-secondary/30",
                        )}
                      >
                        <p className="text-sm font-medium">{notif.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">{formatDate(notif.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
