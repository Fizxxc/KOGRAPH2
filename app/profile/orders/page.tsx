"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { db, collection, query, where, getDocs, orderBy } from "@/lib/firebase"
import type { Order } from "@/lib/types"
import { formatPrice, formatDate, getStatusColor, getStatusLabel } from "@/lib/utils"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Search, ArrowLeft, Package } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const statusFilters = [
  { id: "all", label: "Semua" },
  { id: "pending", label: "Menunggu" },
  { id: "processing", label: "Diproses" },
  { id: "completed", label: "Selesai" },
  { id: "cancelled", label: "Dibatalkan" },
]

export default function OrdersPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return

      try {
        const ordersQuery = query(
          collection(db, "orders"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
        )
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
  }, [user])

  useEffect(() => {
    let filtered = orders

    if (selectedStatus !== "all") {
      filtered = filtered.filter((order) => order.status === selectedStatus)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(query) || order.orderDetails.projectName.toLowerCase().includes(query),
      )
    }

    setFilteredOrders(filtered)
  }, [orders, selectedStatus, searchQuery])

  if (authLoading || loading) {
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
        <div className="max-w-4xl mx-auto">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Profil
          </Link>

          <h1 className="text-3xl font-bold mb-8">
            Pesanan <span className="gradient-text">Saya</span>
          </h1>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
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
              <h3 className="mt-4 text-lg font-semibold">Tidak ada pesanan ditemukan</h3>
              <p className="text-muted-foreground">
                {orders.length === 0 ? "Anda belum memiliki pesanan" : "Coba ubah filter pencarian Anda"}
              </p>
              {orders.length === 0 && (
                <Link href="/services">
                  <Button className="mt-4 gradient-primary">Mulai Belanja</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Link key={order.id} href={`/profile/orders/${order.id}`}>
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
                            </div>
                            <p className="text-sm text-muted-foreground">{order.orderDetails.projectName}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {order.items.length} item • {formatDate(order.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-primary">{formatPrice(order.totalPrice)}</p>
                          <Badge className={getStatusColor(order.paymentStatus)}>
                            {getStatusLabel(order.paymentStatus)}
                          </Badge>
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

      <Footer />
    </div>
  )
}
