"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { formatPrice, formatCurrency } from "@/lib/utils"
import { showError, showLoading, closeLoading, confirmAction } from "@/lib/sweetalert"
import { db, addDoc, collection, serverTimestamp } from "@/lib/firebase"
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, MessageCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import Swal from "sweetalert2"

const BASE_QRIS_STRING =
  "00020101021126670016COM.NOBUBANK.WWW01189360050300000879140214353153527368570303UMI51440014ID.CO.QRIS.WWW0215ID20232679645180303UMI5204481253033605802ID5920MEFZ STORE OK11724136006BEKASI61051711162070703A016304DE60"

export default function CartPage() {
  const router = useRouter()
  const { items, updateQuantity, removeFromCart, clearCart, totalPrice } = useCart()
  const { user, userProfile } = useAuth()
  const [orderDetails, setOrderDetails] = useState({
    projectName: "",
    projectDescription: "",
    referenceLinks: "",
    deadline: "",
    additionalNotes: "",
  })
  const [userPhone, setUserPhone] = useState("")

  const showPaymentPopup = async (orderId: string) => {
    try {
      Swal.fire({
        title: '<span style="color:#6366f1">Pembayaran QRIS</span>',
        html: `
          <div style="text-align:center;">
            <p style="margin-bottom:15px; font-size:14px;">Scan QR Code untuk melakukan pembayaran:</p>
            <div style="background:white;padding:20px;border-radius:12px;margin:0 auto 20px;display:inline-block;">
              <img src="/qris.png" alt="QRIS" style="width:300px;height:300px;"/>
            </div>
            <div style="background:#1e1e2e;padding:20px;border-radius:12px;margin-bottom:20px;">
              <p style="font-weight:bold;color:#6366f1;margin-bottom:15px;font-size:16px;">Jumlah Pembayaran:</p>
              <p style="font-size:28px;font-weight:bold;color:#22c55e;margin-bottom:15px;">${formatCurrency(totalPrice)}</p>
              <p style="font-size:13px;color:#888;margin-bottom:10px;">Order ID: ${orderId}</p>
              <div style="border-top:1px solid #333;margin:15px 0;padding-top:15px;">
                <p style="font-weight:bold;color:#6366f1;margin-bottom:10px;font-size:14px;">Hubungi Admin untuk Konfirmasi:</p>
                <p style="margin:5px 0;font-size:13px;"><strong>Telegram:</strong> @Kokociixx</p>
                <p style="margin:5px 0;font-size:13px;"><strong>WhatsApp:</strong> 085776568948</p>
              </div>
            </div>
            <p style="font-size:12px;color:#888;line-height:1.6;">
              Setelah pembayaran, silakan kirim bukti transfer ke admin untuk verifikasi.<br/>
              Pesanan akan diproses setelah pembayaran dikonfirmasi.
            </p>
          </div>
        `,
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: "#6366f1",
        cancelButtonColor: "#3f3f46",
        confirmButtonText: '<i class="fa fa-whatsapp"></i> WhatsApp Admin',
        cancelButtonText: "Lihat Pesanan",
        background: "#0f0f17",
        color: "#fff",
        width: "600px",
      }).then((result) => {
        if (result.isConfirmed) {
          window.open(
            `https://wa.me/6285776568948?text=Halo Admin KOGRAPH, saya ingin konfirmasi pembayaran untuk Order ID: ${orderId}. Total: ${formatCurrency(totalPrice)}`,
            "_blank",
          )
        }
        router.push(`/profile/orders/${orderId}`)
      })
    } catch (error) {
      console.error("Error showing payment popup:", error)
      showError("Gagal menampilkan informasi pembayaran", "Silakan hubungi admin untuk pembayaran")
    }
  }

  const handleCheckout = async () => {
    if (!user) {
      showError("Silakan login terlebih dahulu")
      router.push("/login")
      return
    }

    if (items.length === 0) {
      showError("Keranjang kosong")
      return
    }

    if (!orderDetails.projectName || !orderDetails.projectDescription) {
      showError("Harap isi nama project dan deskripsi")
      return
    }

    const confirmed = await confirmAction(
      "Konfirmasi Pesanan",
      `Total pembayaran: ${formatPrice(totalPrice)}. Lanjutkan?`,
      "Ya, Pesan Sekarang",
    )

    if (!confirmed) return

    showLoading("Memproses pesanan...")

    try {
      const orderData = {
        userId: user.uid || "",
        userEmail: user.email || "",
        userName: userProfile?.displayName || user.email?.split("@")[0] || "User",
        userPhone: userPhone || userProfile?.phone || "",
        items: items.map((item) => ({
          menuItem: {
            id: item.menuItem.id || "",
            name: item.menuItem.name || "",
            price: item.menuItem.price || 0,
            category: item.menuItem.category || "",
            image: item.menuItem.image || "",
          },
          quantity: item.quantity || 1,
          notes: item.notes || "",
        })),
        orderDetails: {
          projectName: orderDetails.projectName || "",
          projectDescription: orderDetails.projectDescription || "",
          referenceLinks: orderDetails.referenceLinks || "",
          deadline: orderDetails.deadline || "",
          additionalNotes: orderDetails.additionalNotes || "",
        },
        totalPrice: totalPrice || 0,
        status: "pending",
        paymentStatus: "unpaid",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, "orders"), orderData)

      // Create notification for admin
      await addDoc(collection(db, "notifications"), {
        userId: "admin",
        title: "Pesanan Baru!",
        message: `Pesanan baru dari ${userProfile?.displayName || user.email}`,
        type: "order",
        isRead: false,
        orderId: docRef.id,
        createdAt: serverTimestamp(),
      })

      // Create notification for user
      await addDoc(collection(db, "notifications"), {
        userId: user.uid,
        title: "Pesanan Berhasil",
        message: `Pesanan Anda dengan ID ${docRef.id} berhasil dibuat`,
        type: "order",
        isRead: false,
        orderId: docRef.id,
        createdAt: serverTimestamp(),
      })

      // Send Telegram notification
      try {
        await fetch("/api/telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: docRef.id,
            userName: userProfile?.displayName || user.email,
            userEmail: user.email || "",
            userPhone: userPhone || userProfile?.phone || "",
            items,
            totalPrice,
            orderDetails,
          }),
        })
      } catch (telegramError) {
        console.error("Telegram notification failed:", telegramError)
      }

      clearCart()
      closeLoading()
      await showPaymentPopup(docRef.id)
    } catch (error) {
      closeLoading()
      console.error("Checkout error:", error)
      showError("Gagal membuat pesanan", "Silakan coba lagi")
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16 px-4">
          <div className="max-w-4xl mx-auto text-center py-16">
            <lord-icon
              src="https://cdn.lordicon.com/hrjifpbq.json"
              trigger="loop"
              colors="primary:#6366f1,secondary:#8b5cf6"
              style={{ width: "100px", height: "100px" }}
            />
            <h2 className="text-2xl font-bold mt-6 mb-4">Silakan Login</h2>
            <p className="text-muted-foreground mb-6">Anda harus login untuk mengakses keranjang belanja</p>
            <Link href="/login">
              <Button className="gradient-primary">Login Sekarang</Button>
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
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">
            Keranjang <span className="gradient-text">Belanja</span>
          </h1>

          {items.length === 0 ? (
            <div className="text-center py-16">
              <lord-icon
                src="https://cdn.lordicon.com/slkvcfos.json"
                trigger="loop"
                colors="primary:#6366f1,secondary:#8b5cf6"
                style={{ width: "100px", height: "100px" }}
              />
              <h2 className="text-xl font-semibold mt-6 mb-2">Keranjang Kosong</h2>
              <p className="text-muted-foreground mb-6">Belum ada layanan di keranjang Anda</p>
              <Link href="/services">
                <Button className="gradient-primary">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Lihat Layanan
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <Card key={item.menuItem.id} className="glass border-border">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={item.menuItem.image || "/placeholder.svg?height=100&width=100&query=service"}
                            alt={item.menuItem.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold line-clamp-1">{item.menuItem.name}</h3>
                          <p className="text-sm text-muted-foreground">{item.menuItem.category}</p>
                          <p className="text-primary font-medium mt-1">{formatPrice(item.menuItem.price)}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 bg-transparent"
                              onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 bg-transparent"
                              onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive ml-auto"
                              onClick={() => removeFromCart(item.menuItem.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="space-y-4">
                <Card className="glass border-border">
                  <CardHeader>
                    <CardTitle>Detail Pesanan</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="projectName">Nama Project *</Label>
                      <Input
                        id="projectName"
                        placeholder="Contoh: Video Promosi Produk"
                        value={orderDetails.projectName}
                        onChange={(e) =>
                          setOrderDetails({
                            ...orderDetails,
                            projectName: e.target.value,
                          })
                        }
                        className="bg-secondary border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="projectDescription">Deskripsi Project *</Label>
                      <Textarea
                        id="projectDescription"
                        placeholder="Jelaskan detail kebutuhan Anda..."
                        value={orderDetails.projectDescription}
                        onChange={(e) =>
                          setOrderDetails({
                            ...orderDetails,
                            projectDescription: e.target.value,
                          })
                        }
                        className="bg-secondary border-border min-h-[100px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="referenceLinks">Link Referensi</Label>
                      <Input
                        id="referenceLinks"
                        placeholder="Link contoh atau inspirasi"
                        value={orderDetails.referenceLinks}
                        onChange={(e) =>
                          setOrderDetails({
                            ...orderDetails,
                            referenceLinks: e.target.value,
                          })
                        }
                        className="bg-secondary border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deadline">Deadline</Label>
                      <Input
                        id="deadline"
                        type="date"
                        value={orderDetails.deadline}
                        onChange={(e) =>
                          setOrderDetails({
                            ...orderDetails,
                            deadline: e.target.value,
                          })
                        }
                        className="bg-secondary border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">No. WhatsApp</Label>
                      <Input
                        id="phone"
                        placeholder="08xxxxxxxxxx"
                        value={userPhone}
                        onChange={(e) => setUserPhone(e.target.value)}
                        className="bg-secondary border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="additionalNotes">Catatan Tambahan</Label>
                      <Textarea
                        id="additionalNotes"
                        placeholder="Catatan lainnya..."
                        value={orderDetails.additionalNotes}
                        onChange={(e) =>
                          setOrderDetails({
                            ...orderDetails,
                            additionalNotes: e.target.value,
                          })
                        }
                        className="bg-secondary border-border"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass border-border">
                  <CardHeader>
                    <CardTitle>Ringkasan</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div key={item.menuItem.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {item.menuItem.name} x{item.quantity}
                          </span>
                          <span>{formatPrice(item.menuItem.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-border pt-4">
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span className="text-primary">{formatPrice(totalPrice)}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <p className="text-sm font-medium text-primary mb-2 flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Metode Pembayaran:
                      </p>
                      <p className="text-xs text-muted-foreground">QRIS (Scan QR Code)</p>
                      <p className="text-xs text-muted-foreground">Konfirmasi via Telegram/WhatsApp</p>
                    </div>

                    <Button onClick={handleCheckout} className="w-full gradient-primary">
                      Checkout
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "lord-icon": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string
          trigger?: string
          delay?: string
          colors?: string
          style?: React.CSSProperties
        },
        HTMLElement
      >
    }
  }
}
