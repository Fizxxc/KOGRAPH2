"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { db, collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from "@/lib/firebase"
import type { Review } from "@/lib/types"
import { formatDate } from "@/lib/utils"
import { LoadingSpinner } from "@/components/loading-spinner"
import { showSuccess, showError, showConfirm } from "@/lib/sweetalert"
import {
  LayoutDashboard,
  Package,
  Menu,
  Users,
  Settings,
  LogOut,
  Home,
  Star,
  Check,
  X,
  Trash2,
  MessageSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function AdminReviewsPage() {
  const { signOut } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all")

  useEffect(() => {
    const reviewsQuery = query(collection(db, "reviews"), orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(reviewsQuery, (snapshot) => {
      const reviewsList: Review[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        reviewsList.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as Review)
      })
      setReviews(reviewsList)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleApprove = async (reviewId: string) => {
    try {
      await updateDoc(doc(db, "reviews", reviewId), { isApproved: true })
      showSuccess("Berhasil!", "Review telah disetujui")
    } catch (error) {
      showError("Gagal", "Terjadi kesalahan")
    }
  }

  const handleReject = async (reviewId: string) => {
    try {
      await updateDoc(doc(db, "reviews", reviewId), { isApproved: false })
      showSuccess("Berhasil!", "Review telah ditolak")
    } catch (error) {
      showError("Gagal", "Terjadi kesalahan")
    }
  }

  const handleDelete = async (reviewId: string) => {
    const confirmed = await showConfirm("Hapus Review?", "Review yang dihapus tidak dapat dikembalikan")
    if (confirmed) {
      try {
        await deleteDoc(doc(db, "reviews", reviewId))
        showSuccess("Berhasil!", "Review telah dihapus")
      } catch (error) {
        showError("Gagal", "Terjadi kesalahan")
      }
    }
  }

  const filteredReviews = reviews.filter((review) => {
    if (filter === "pending") return !review.isApproved
    if (filter === "approved") return review.isApproved
    return true
  })

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: Package, label: "Pesanan", href: "/admin/orders" },
    { icon: Menu, label: "Menu Layanan", href: "/admin/menu" },
    { icon: MessageSquare, label: "Reviews", href: "/admin/reviews", active: true },
    { icon: Users, label: "Pengguna", href: "/admin/users" },
    { icon: Settings, label: "Pengaturan", href: "/admin/settings" },
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
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-lg border-b border-border">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Reviews</h1>
                <p className="text-sm text-muted-foreground">Kelola ulasan dari pelanggan</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="glass border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Star className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{reviews.length}</p>
                    <p className="text-sm text-muted-foreground">Total Reviews</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{reviews.filter((r) => r.isApproved).length}</p>
                    <p className="text-sm text-muted-foreground">Disetujui</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-yellow-500/20">
                    <Star className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {reviews.length > 0
                        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                        : "0"}
                    </p>
                    <p className="text-sm text-muted-foreground">Rata-rata Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
              className={filter === "all" ? "gradient-primary" : "bg-transparent"}
            >
              Semua
            </Button>
            <Button
              variant={filter === "pending" ? "default" : "outline"}
              onClick={() => setFilter("pending")}
              className={filter === "pending" ? "gradient-primary" : "bg-transparent"}
            >
              Pending
            </Button>
            <Button
              variant={filter === "approved" ? "default" : "outline"}
              onClick={() => setFilter("approved")}
              className={filter === "approved" ? "gradient-primary" : "bg-transparent"}
            >
              Disetujui
            </Button>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {filteredReviews.length === 0 ? (
              <Card className="glass border-border">
                <CardContent className="p-8 text-center">
                  <lord-icon
                    src="https://cdn.lordicon.com/msoeawqm.json"
                    trigger="loop"
                    colors="primary:#6366f1,secondary:#8b5cf6"
                    style={{ width: "80px", height: "80px" }}
                  />
                  <p className="mt-4 text-muted-foreground">Belum ada review</p>
                </CardContent>
              </Card>
            ) : (
              filteredReviews.map((review) => (
                <Card key={review.id} className="glass border-border">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            {review.userPhoto ? (
                              <img
                                src={review.userPhoto || "/placeholder.svg"}
                                alt={review.userName}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <span className="font-bold text-primary">{review.userName[0]}</span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{review.userName}</p>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                                />
                              ))}
                            </div>
                          </div>
                          <Badge
                            className={
                              review.isApproved ? "bg-green-500/20 text-green-500" : "bg-yellow-500/20 text-yellow-500"
                            }
                          >
                            {review.isApproved ? "Disetujui" : "Pending"}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-3">{review.comment}</p>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {review.serviceNames?.map((service, idx) => (
                            <span key={idx} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                              {service}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>
                      </div>
                      <div className="flex gap-2">
                        {!review.isApproved && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-green-500 hover:bg-green-500/10"
                            onClick={() => handleApprove(review.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        {review.isApproved && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-yellow-500 hover:bg-yellow-500/10"
                            onClick={() => handleReject(review.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-red-500 hover:bg-red-500/10"
                          onClick={() => handleDelete(review.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
