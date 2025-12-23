"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { db, collection, getDocs, query, orderBy } from "@/lib/firebase"
import type { Order } from "@/lib/types"
import { formatPrice, formatDate, getStatusColor, getStatusLabel } from "@/lib/utils"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Search, LayoutDashboard, Package, Menu, Users, LogOut, Home } from "lucide-react"
import { cn } from "@/lib/utils"

const statusFilters = [
  { id: "all", label: "Semua" },
  { id: "pending", label: "Menunggu" },
  { id: "processing", label: "Diproses" },
  { id: "completed", label: "Selesai" },
  { id: "cancelled", label: "Dibatalkan" },
]

export default function AdminOrdersPage() {
  const { signOut } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"))
        const snapshot = await getDocs(ordersQuery)
        const ordersList: Order[] = []
        snapshot.forEach((doc) => {
          ordersList.push({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date(),
          } as Order)
        })
        setOrders(ordersList)
        setFilteredOrders(ordersList)
      } catch (error) {
        console.error("Error fetching orders:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  useEffect(() => {
    let filtered = orders

    if (selectedStatus !== "all") {
      filtered = filtered.filter((order) => order.status === selectedStatus)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(query) ||
          order.userName.toLowerCase().includes(query) ||
          order.userEmail.toLowerCase().includes(query),
      )
    }

    setFilteredOrders(filtered)
  }, [orders, selectedStatus, searchQuery])

  const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: Package, label: "Pesanan", href: "/admin/orders", active: true },
    { icon: Menu, label: "Menu Layanan", href: "/admin/menu" },
    { icon: Users, label: "Pengguna", href: "/admin/users" },
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
            {sidebarItems.map((item) => (
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
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors w-full"
            >
              <LogOut className="h-5 w-5" />
              {sidebarOpen && <span>Keluar</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn("flex-1 transition-all duration-300", sidebarOpen ? "ml-64" : "ml-20")}>
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-lg border-b border-border">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Pesanan</h1>
                <p className="text-sm text-muted-foreground">{filteredOrders.length} pesanan</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Cari pesanan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary border-border"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {statusFilters.map((filter) => (
                <Button
                  key={filter.id}
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedStatus(filter.id)}
                  className={cn(
                    "flex-shrink-0",
                    selectedStatus === filter.id && "gradient-primary border-transparent text-white",
                  )}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-16">
              <lord-icon
                src="https://cdn.lordicon.com/slkvcfos.json"
                trigger="loop"
                colors="primary:#6366f1,secondary:#8b5cf6"
                style={{ width: "100px", height: "100px" }}
              />
              <h3 className="mt-4 text-lg font-semibold">Tidak ada pesanan</h3>
              <p className="text-muted-foreground">Tidak ada pesanan yang ditemukan</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Link key={order.id} href={`/admin/orders/${order.id}`}>
                  <Card className="glass border-border card-hover cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-xl bg-primary/20">
                            <Package className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">#{order.id.slice(0, 8).toUpperCase()}</span>
                              <Badge className={getStatusColor(order.status)}>{getStatusLabel(order.status)}</Badge>
                              <Badge className={getStatusColor(order.paymentStatus)}>
                                {getStatusLabel(order.paymentStatus)}
                              </Badge>
                            </div>
                            <p className="text-sm font-medium">{order.userName}</p>
                            <p className="text-xs text-muted-foreground">{order.userEmail}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {order.items.length} item • {formatDate(order.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-primary">{formatPrice(order.totalPrice)}</p>
                          <p className="text-sm text-muted-foreground">{order.orderDetails.projectName}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
