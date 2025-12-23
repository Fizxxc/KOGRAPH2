import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatCurrency(amount: number): string {
  return formatPrice(amount)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d)
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "pending":
      return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
    case "processing":
      return "bg-blue-500/20 text-blue-500 border-blue-500/30"
    case "completed":
      return "bg-green-500/20 text-green-500 border-green-500/30"
    case "cancelled":
      return "bg-red-500/20 text-red-500 border-red-500/30"
    case "paid":
      return "bg-green-500/20 text-green-500 border-green-500/30"
    case "unpaid":
      return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
    default:
      return "bg-muted text-muted-foreground border-border"
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case "pending":
      return "Menunggu"
    case "processing":
      return "Diproses"
    case "completed":
      return "Selesai"
    case "cancelled":
      return "Dibatalkan"
    case "paid":
      return "Lunas"
    case "unpaid":
      return "Belum Bayar"
    default:
      return status
  }
}
