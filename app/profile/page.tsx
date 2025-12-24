"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { db, collection, query, where, getDocs, orderBy } from "@/lib/firebase"
import type { Order } from "@/lib/types"
import { formatPrice, formatDate, getStatusColor, getStatusLabel } from "@/lib/utils"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Mail, Phone, Calendar, Package, CreditCard, Bell, Settings, ChevronRight, ShoppingBag } from "lucide-react"
import Link from "next/link"

export default function ProfilePage() {
  const router = useRouter()
  const { user, userProfile, loading: authLoading } = useAuth()
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [stats, setStats] = useState({
    totalOrders: 0,
    completedOrders: 0,
    totalSpent: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return

      try {
        const ordersQuery = query(
          collection(db, "orders"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
        )
        const snapshot = await getDocs(ordersQuery)
        const orders: Order[] = []
        snapshot.forEach((doc) => {
          orders.push({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt ?? null,
            updatedAt: doc.data().updatedAt ?? null,
          } as Order)
        })

        setRecentOrders(orders.slice(0, 5))
        setStats({
          totalOrders: orders.length,
          completedOrders: orders.filter((o) => o.status === "completed").length,
          totalSpent: orders.reduce((sum, o) => sum + o.totalPrice, 0),
        })
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [user])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <LoadingSpinner />
        <Footer />
      </div>
    )
  }

  if (!user || !userProfile) {
    return null
  }

  const menuItems = [
    {
      icon: Package,
      label: "Pesanan Saya",
      href: "/profile/orders",
      description: "Lihat semua riwayat pesanan",
    },
    {
      icon: Bell,
      label: "Notifikasi",
      href: "/profile/notifications",
      description: "Kelola notifikasi Anda",
    },
    {
      icon: Settings,
      label: "Pengaturan",
      href: "/profile/settings",
      description: "Ubah profil dan password",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <Card className="glass border-border mb-8 overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-primary/30 via-purple-500/20 to-pink-500/20" />
            <CardContent className="relative px-6 pb-6">
              <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-12">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                  {userProfile.displayName?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold">{userProfile.displayName}</h1>
                  <p className="text-muted-foreground">{userProfile.email}</p>
                </div>
                <Link href="/profile/settings">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profil
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium">{userProfile.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Telepon</p>
                    <p className="text-sm font-medium">{userProfile.phone || "Belum diatur"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Bergabung</p>
                    <p className="text-sm font-medium">
                      {userProfile.createdAt ? formatDate(userProfile.createdAt) : "-"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Stats & Menu */}
            <div className="space-y-6">
              {/* Stats */}
              <Card className="glass border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Statistik</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/20">
                        <ShoppingBag className="h-4 w-4 text-blue-500" />
                      </div>
                      <span className="text-sm">Total Pesanan</span>
                    </div>
                    <span className="font-semibold">{stats.totalOrders}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-500/20">
                        <Package className="h-4 w-4 text-green-500" />
                      </div>
                      <span className="text-sm">Selesai</span>
                    </div>
                    <span className="font-semibold">{stats.completedOrders}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/20">
                        <CreditCard className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm">Total Belanja</span>
                    </div>
                    <span className="font-semibold text-primary">{formatPrice(stats.totalSpent)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Menu */}
              <Card className="glass border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Menu</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {menuItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors group"
                    >
                      <div className="p-2 rounded-lg bg-primary/20">
                        <item.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <div className="lg:col-span-2">
              <Card className="glass border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Pesanan Terbaru</CardTitle>
                  <Link href="/profile/orders">
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
                      <Link href="/services">
                        <Button className="mt-4 gradient-primary" size="sm">
                          Mulai Belanja
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentOrders.map((order) => (
                        <Link
                          key={order.id}
                          href={`/profile/orders/${order.id}`}
                          className="block p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">#{order.id.slice(0, 8).toUpperCase()}</span>
                            <Badge className={getStatusColor(order.status)}>{getStatusLabel(order.status)}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{order.orderDetails.projectName}</p>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{formatDate(order.createdAt)}</span>
                            <span className="font-semibold text-primary">{formatPrice(order.totalPrice)}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
