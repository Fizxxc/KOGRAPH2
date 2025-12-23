"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth-context"
import { db, doc, getDoc, collection, query, where, getDocs } from "@/lib/firebase"
import type { Order, Review } from "@/lib/types"
import { formatPrice, formatDate, getStatusColor, getStatusLabel } from "@/lib/utils"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ReviewModal } from "@/components/review-modal"
import {
  ArrowLeft,
  Package,
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  CreditCard,
  Copy,
  Check,
  MessageCircle,
  Star,
} from "lucide-react"
import Link from "next/link"
import { showSuccess } from "@/lib/sweetalert"

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [hasReviewed, setHasReviewed] = useState(false)
  const [existingReview, setExistingReview] = useState<Review | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const fetchOrder = async () => {
      if (!user || !id) return

      try {
        const orderDoc = await getDoc(doc(db, "orders", id))
        if (orderDoc.exists()) {
          const data = orderDoc.data()
          setOrder({
            id: orderDoc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as Order)

          // Check if user has already reviewed this order
          const reviewQuery = query(
            collection(db, "reviews"),
            where("orderId", "==", id),
            where("userId", "==", user.uid),
          )
          const reviewSnapshot = await getDocs(reviewQuery)
          if (!reviewSnapshot.empty) {
            setHasReviewed(true)
            const reviewData = reviewSnapshot.docs[0].data()
            setExistingReview({
              id: reviewSnapshot.docs[0].id,
              ...reviewData,
              createdAt: reviewData.createdAt?.toDate() || new Date(),
            } as Review)
          }
        }
      } catch (error) {
        console.error("Error fetching order:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [user, id])

  const copyOrderId = () => {
    navigator.clipboard.writeText(id)
    setCopied(true)
    showSuccess("Order ID disalin!")
    setTimeout(() => setCopied(false), 2000)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <LoadingSpinner />
        <Footer />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16 px-4">
          <div className="max-w-4xl mx-auto text-center py-16">
            <lord-icon
              src="https://cdn.lordicon.com/msoeawqm.json"
              trigger="loop"
              colors="primary:#6366f1,secondary:#8b5cf6"
              style={{ width: "100px", height: "100px" }}
            />
            <h2 className="text-2xl font-bold mt-6 mb-4">Pesanan Tidak Ditemukan</h2>
            <Link href="/profile/orders">
              <Button className="gradient-primary">Kembali ke Pesanan</Button>
            </Link>
          </div>
        </main>
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
            href="/profile/orders"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Pesanan
          </Link>

          {/* Order Header */}
          <Card className="glass border-border mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-primary/20">
                    <Package className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl font-bold">#{order.id.slice(0, 8).toUpperCase()}</h1>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyOrderId}>
                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge className={getStatusColor(order.status)}>{getStatusLabel(order.status)}</Badge>
                  <Badge className={getStatusColor(order.paymentStatus)}>{getStatusLabel(order.paymentStatus)}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Items */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="glass border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Item Pesanan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
                      <div>
                        <p className="font-medium">{item.menuItem.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.menuItem.category} x{item.quantity}
                        </p>
                        {item.notes && <p className="text-xs text-muted-foreground mt-1">Catatan: {item.notes}</p>}
                      </div>
                      <p className="font-semibold">{formatPrice(item.menuItem.price * item.quantity)}</p>
                    </div>
                  ))}

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(order.totalPrice)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Project Details */}
              <Card className="glass border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5" />
                    Detail Project
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nama Project</p>
                    <p className="font-medium">{order.orderDetails.projectName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Deskripsi</p>
                    <p className="font-medium">{order.orderDetails.projectDescription}</p>
                  </div>
                  {order.orderDetails.referenceLinks && (
                    <div>
                      <p className="text-sm text-muted-foreground">Link Referensi</p>
                      <p className="font-medium">{order.orderDetails.referenceLinks}</p>
                    </div>
                  )}
                  {order.orderDetails.deadline && (
                    <div>
                      <p className="text-sm text-muted-foreground">Deadline</p>
                      <p className="font-medium">{order.orderDetails.deadline}</p>
                    </div>
                  )}
                  {order.orderDetails.additionalNotes && (
                    <div>
                      <p className="text-sm text-muted-foreground">Catatan Tambahan</p>
                      <p className="font-medium">{order.orderDetails.additionalNotes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Review Section - Show for completed orders */}
              {order.status === "completed" && (
                <Card className="glass border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Star className="h-5 w-5" />
                      Ulasan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {hasReviewed && existingReview ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-5 w-5 ${i < existingReview.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                            />
                          ))}
                          <span className="font-medium ml-2">{existingReview.rating}/5</span>
                        </div>
                        <p className="text-muted-foreground">{existingReview.comment}</p>
                        <p className="text-xs text-muted-foreground">
                          Dikirim pada {formatDate(existingReview.createdAt)}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <lord-icon
                          src="https://cdn.lordicon.com/mdgrhyca.json"
                          trigger="loop"
                          colors="primary:#6366f1,secondary:#8b5cf6"
                          style={{ width: "60px", height: "60px" }}
                        />
                        <p className="text-muted-foreground mt-4 mb-4">
                          Bagikan pengalaman Anda menggunakan layanan kami
                        </p>
                        <Button onClick={() => setShowReviewModal(true)} className="gradient-primary">
                          <Star className="h-4 w-4 mr-2" />
                          Beri Ulasan
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Customer Info & Payment */}
            <div className="space-y-6">
              <Card className="glass border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5" />
                    Info Customer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{order.userName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{order.userEmail}</span>
                  </div>
                  {order.userPhone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{order.userPhone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{formatDate(order.createdAt)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CreditCard className="h-5 w-5" />
                    Pembayaran
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge className={getStatusColor(order.paymentStatus)}>{getStatusLabel(order.paymentStatus)}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-bold text-primary">{formatPrice(order.totalPrice)}</span>
                  </div>
                  {order.paymentStatus === "unpaid" && (
                    <div className="pt-2 space-y-4">
                      <p className="text-sm text-muted-foreground">Silakan lakukan pembayaran melalui QRIS:</p>
                      <div className="flex justify-center">
                        <Image
                          src="/qris-payment-code.jpg"
                          alt="QRIS Payment"
                          width={180}
                          height={180}
                          className="rounded-lg"
                        />
                      </div>
                      <div className="p-3 rounded-lg bg-secondary/50 text-sm space-y-2">
                        <p className="font-medium text-primary flex items-center gap-2">
                          <MessageCircle className="h-4 w-4" />
                          Hubungi Admin:
                        </p>
                        <p>
                          <strong>Telegram:</strong>{" "}
                          <a
                            href="https://t.me/Kokociixx"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            @Kokociixx
                          </a>
                        </p>
                        <p>
                          <strong>WhatsApp:</strong>{" "}
                          <a
                            href="https://wa.me/6285776568948"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            085776568948
                          </a>
                        </p>
                      </div>
                      <Button
                        className="w-full gradient-primary"
                        onClick={() =>
                          window.open(
                            `https://wa.me/6285776568948?text=Halo Admin KOGRAPH, saya ingin konfirmasi pembayaran untuk Order ID: ${order.id}`,
                            "_blank",
                          )
                        }
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Konfirmasi Pembayaran
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {order.adminNotes && (
                <Card className="glass border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Catatan Admin</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{order.adminNotes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Review Modal */}
      {order && (
        <ReviewModal
          order={order}
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false)
            // Refresh to show the review
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}
