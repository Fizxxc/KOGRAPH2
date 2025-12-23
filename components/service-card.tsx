"use client"

import type { MenuItem } from "@/lib/types"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { showSuccess, showWarning } from "@/lib/sweetalert"
import { ShoppingCart, Clock, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface ServiceCardProps {
  service: MenuItem
}

export function ServiceCard({ service }: ServiceCardProps) {
  const { addToCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()

  const handleAddToCart = () => {
    if (!user) {
      showWarning("Silakan login terlebih dahulu")
      router.push("/login")
      return
    }

    addToCart(service)
    showSuccess("Berhasil ditambahkan ke keranjang!")
  }

  return (
    <Card className="group bg-card border-border overflow-hidden card-hover">
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={service.image || "/placeholder.svg?height=200&width=400&query=editing service"}
          alt={service.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          <Badge className="gradient-primary">{service.category}</Badge>
        </div>
      </div>
      <CardContent className="p-5">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{service.name}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{service.description}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {service.features.slice(0, 3).map((feature, index) => (
            <div key={index} className="flex items-center gap-1 text-xs text-muted-foreground">
              <Check className="h-3 w-3 text-success" />
              {feature}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Estimasi {service.estimatedDays} hari</span>
        </div>
      </CardContent>
      <CardFooter className="p-5 pt-0 flex items-center justify-between">
        <div className="font-bold text-lg text-primary">{formatPrice(service.price)}</div>
        <Button onClick={handleAddToCart} className="gradient-primary" size="sm">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Tambah
        </Button>
      </CardFooter>
    </Card>
  )
}
