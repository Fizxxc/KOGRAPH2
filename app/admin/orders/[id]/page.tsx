"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/auth-context"
import { db, doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from "@/lib/firebase"
import type { Order } from "@/lib/types"
import { formatPrice, formatDate, getStatusColor, getStatusLabel, cn } from "@/lib/utils"
import { showSuccess, showError, showLoading, closeLoading } from "@/lib/sweetalert"
import { LoadingSpinner } from "@/components/loading-spinner"
import {
  Package,
  LayoutDashboard,
  MenuIcon,
  Users,
  LogOut,
  Home,
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  CreditCard,
  Save,
} from "lucide-react"

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { signOut } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [status, setStatus] = useState("")
  const [paymentStatus, setPaymentStatus] = useState("")
  const [adminNotes, setAdminNotes] = useState("")

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return

      try {
        const orderDoc = await getDoc(doc(db, "orders", id))
        if (orderDoc.exists()) {
          const data = orderDoc.data()
          const orderData = {
            id: orderDoc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as Order
          setOrder(orderData)
          setStatus(orderData.status)
          setPaymentStatus(orderData.paymentStatus)
          setAdminNotes(orderData.adminNotes || "")
        }
      } catch (error) {
        console.error("Error fetching order:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [id])

  const handleUpdate = async () => {
    if (!order) return

    showLoading("Memperbarui...")

    try {
      await updateDoc(doc(db, "orders", order.id), {
        status,
        paymentStatus,
        adminNotes,
        updatedAt: serverTimestamp(),
      })

      await addDoc(collection(db, "notifications"), {
        userId: order.userId,
        title: "Update Pesanan",
        message: `Status pesanan #${order.id.slice(0, 8).toUpperCase()} telah diperbarui menjadi ${getStatusLabel(status)}`,
        type: "order",
        isRead: false,
        orderId: order.id,
        createdAt: serverTimestamp(),
      })

      closeLoading()
      showSuccess("Pesanan berhasil diperbarui!")
    } catch (error) {
      closeLoading()
      console.error("Error updating order:", error)
      showError("Gagal memperbarui pesanan")
    }
  }

  const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: Package, label: "Pesanan", href: "/admin/orders", active: true },
    { icon: MenuIcon, label: "Menu Layanan", href: "/admin/menu" },
    { icon: Users, label: "Pengguna", href: "/admin/users" },
  ]

  if (loading) {
    return <LoadingSpinner />
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <lord-icon
            src="https://cdn.lordicon.com/msoeawqm.json"
            trigger="loop"
            colors="primary:#6366f1,secondary:#8b5cf6"
            style={{ width: "100px", height: "100px" }}
          />
          <h2 className="text-2xl font-bold mt-6 mb-4">Pesanan Tidak Ditemukan</h2>
          <Link href="/admin/orders">
            <Button className="gradient-primary">Kembali ke Pesanan</Button>
          </Link>
        </div>
      </div>
    )
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
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  item.active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className="h-5 w-5" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-border space-y-2">
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Home className="h-5 w-5" />
              {sidebarOpen && <span>Ke Beranda</span>}
            </Link>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors w-full"
            >
              <LogOut className="h-5 w-5" />
              {sidebarOpen && <span>Keluar</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn("flex-1 transition-all duration-300", sidebarOpen ? "ml-64" : "ml-20")}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Link href="/admin/orders">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Detail Pesanan</h1>
              <p className="text-muted-foreground">#{order.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informasi Pelanggan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{order.userEmail}</span>
                  </div>
                  {order.customerName && (
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{order.customerName}</span>
                    </div>
                  )}
                  {order.customerPhone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{order.customerPhone}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Item Pesanan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-start p-4 bg-muted/50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-semibold">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">{item.category}</p>
                          {item.details && (
                            <div className="mt-2 space-y-1 text-sm">
                              {item.details.projectName && (
                                <p>
                                  <span className="text-muted-foreground">Nama Project:</span>{" "}
                                  {item.details.projectName}
                                </p>
                              )}
                              {item.details.description && (
                                <p>
                                  <span className="text-muted-foreground">Deskripsi:</span> {item.details.description}
                                </p>
                              )}
                              {item.details.deadline && (
                                <p>
                                  <span className="text-muted-foreground">Deadline:</span> {item.details.deadline}
                                </p>
                              )}
                              {item.details.reference && (
                                <p>
                                  <span className="text-muted-foreground">Referensi:</span> {item.details.reference}
                                </p>
                              )}
                              {item.details.notes && (
                                <p>
                                  <span className="text-muted-foreground">Catatan:</span> {item.details.notes}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatPrice(item.price)}</p>
                          <p className="text-sm text-muted-foreground">x{item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t border-border">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total</span>
                      <span className="gradient-text">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Informasi Pesanan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Tanggal Order</p>
                        <p className="font-medium">{formatDate(order.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Metode Pembayaran</p>
                        <p className="font-medium">{order.paymentMethod || "Transfer Bank"}</p>
                      </div>
                    </div>
                  </div>
                  {order.notes && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Catatan Pelanggan</p>
                      <p className="p-3 bg-muted/50 rounded-lg">{order.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Status Update Panel */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Update Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Status Pesanan</label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Menunggu</SelectItem>
                        <SelectItem value="processing">Diproses</SelectItem>
                        <SelectItem value="completed">Selesai</SelectItem>
                        <SelectItem value="cancelled">Dibatalkan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Status Pembayaran</label>
                    <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unpaid">Belum Bayar</SelectItem>
                        <SelectItem value="paid">Lunas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Catatan Admin</label>
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Tambahkan catatan internal..."
                      rows={4}
                    />
                  </div>

                  <Button onClick={handleUpdate} className="w-full gradient-primary">
                    <Save className="h-4 w-4 mr-2" />
                    Simpan Perubahan
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status Saat Ini</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Pesanan</span>
                    <Badge className={getStatusColor(order.status)}>{getStatusLabel(order.status)}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Pembayaran</span>
                    <Badge className={getStatusColor(order.paymentStatus)}>{getStatusLabel(order.paymentStatus)}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
