"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { db, collection, addDoc } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { showSuccess, showError } from "@/lib/sweetalert"
import { Star } from "lucide-react"
import type { Order } from "@/lib/types"

interface ReviewModalProps {
  order: Order
  isOpen: boolean
  onClose: () => void
}

export function ReviewModal({ order, isOpen, onClose }: ReviewModalProps) {
  const { user, userProfile } = useAuth()
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [hoveredRating, setHoveredRating] = useState(0)

  const handleSubmit = async () => {
    if (!user || !userProfile) return
    if (!comment.trim()) {
      showError("Gagal", "Silakan tulis ulasan Anda")
      return
    }

    setLoading(true)
    try {
      await addDoc(collection(db, "reviews"), {
        orderId: order.id,
        userId: user.uid,
        userName: userProfile.displayName,
        userPhoto: userProfile.photoURL || null,
        rating,
        comment: comment.trim(),
        serviceNames: order.items.map((item) => item.menuItem.name),
        isApproved: true, // Auto approve, atau bisa di-set false untuk moderasi
        createdAt: new Date(),
      })

      showSuccess("Terima Kasih!", "Ulasan Anda telah dikirim")
      onClose()
    } catch (error) {
      console.error("Error submitting review:", error)
      showError("Gagal", "Terjadi kesalahan saat mengirim ulasan")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Beri Ulasan</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Rating Stars */}
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-lg font-medium">{rating}/5</span>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-2">
            <Label>Layanan yang Diorder</Label>
            <div className="flex flex-wrap gap-2">
              {order.items.map((item, idx) => (
                <span key={idx} className="text-sm px-3 py-1 bg-primary/10 text-primary rounded-full">
                  {item.menuItem.name}
                </span>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label>Ulasan Anda</Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ceritakan pengalaman Anda menggunakan layanan kami..."
              rows={4}
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={loading} className="flex-1 gradient-primary">
              {loading ? "Mengirim..." : "Kirim Ulasan"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
