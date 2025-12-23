"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/auth-context"
import { db, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "@/lib/firebase"
import type { MenuItem } from "@/lib/types"
import { formatPrice } from "@/lib/utils"
import { showSuccess, showError, confirmAction, showLoading, closeLoading } from "@/lib/sweetalert"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Plus, Edit, Trash2, LayoutDashboard, Package, Menu, Users, LogOut, Home, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

const categories = [
  { id: "video", label: "Edit Video" },
  { id: "photo", label: "Edit Foto" },
  { id: "design", label: "Desain Grafis" },
  { id: "motion", label: "Motion Graphics" },
]

export default function AdminMenuPage() {
  const { signOut } = useAuth()
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
    features: "",
    estimatedDays: "",
    isActive: true,
  })

  const fetchMenuItems = async () => {
    try {
      const snapshot = await getDocs(collection(db, "menuItems"))
      const items: MenuItem[] = []
      snapshot.forEach((doc) => {
        items.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        } as MenuItem)
      })
      setMenuItems(items)
    } catch (error) {
      console.error("Error fetching menu items:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMenuItems()
  }, [])

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      image: "",
      features: "",
      estimatedDays: "",
      isActive: true,
    })
    setEditingItem(null)
  }

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      image: item.image,
      features: item.features.join(", "),
      estimatedDays: item.estimatedDays.toString(),
      isActive: item.isActive,
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    const confirmed = await confirmAction("Hapus Menu", "Apakah Anda yakin ingin menghapus menu ini?", "Ya, Hapus")

    if (!confirmed) return

    showLoading("Menghapus...")

    try {
      await deleteDoc(doc(db, "menuItems", id))
      await fetchMenuItems()
      closeLoading()
      showSuccess("Menu berhasil dihapus!")
    } catch (error) {
      closeLoading()
      console.error("Error deleting menu:", error)
      showError("Gagal menghapus menu")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.price || !formData.category) {
      showError("Harap isi semua field yang wajib")
      return
    }

    showLoading(editingItem ? "Memperbarui..." : "Menyimpan...")

    try {
      const menuData = {
        name: formData.name,
        description: formData.description,
        price: Number.parseInt(formData.price),
        category: formData.category,
        image: formData.image || "/customer-service-interaction.png",
        features: formData.features
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean),
        estimatedDays: Number.parseInt(formData.estimatedDays) || 1,
        isActive: formData.isActive,
        updatedAt: serverTimestamp(),
      }

      if (editingItem) {
        await updateDoc(doc(db, "menuItems", editingItem.id), menuData)
      } else {
        await addDoc(collection(db, "menuItems"), {
          ...menuData,
          createdAt: serverTimestamp(),
        })
      }

      await fetchMenuItems()
      setDialogOpen(false)
      resetForm()
      closeLoading()
      showSuccess(editingItem ? "Menu berhasil diperbarui!" : "Menu berhasil ditambahkan!")
    } catch (error) {
      closeLoading()
      console.error("Error saving menu:", error)
      showError("Gagal menyimpan menu")
    }
  }

  const filteredItems = menuItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: Package, label: "Pesanan", href: "/admin/orders" },
    { icon: Menu, label: "Menu Layanan", href: "/admin/menu", active: true },
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
                <h1 className="text-xl font-bold">Menu Layanan</h1>
                <p className="text-sm text-muted-foreground">Kelola daftar layanan</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Cari menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary border-border"
              />
            </div>
            <Dialog
              open={dialogOpen}
              onOpenChange={(open) => {
                setDialogOpen(open)
                if (!open) resetForm()
              }}
            >
              <DialogTrigger asChild>
                <Button className="gradient-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Menu
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingItem ? "Edit Menu" : "Tambah Menu Baru"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nama Layanan *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-secondary border-border"
                        placeholder="Contoh: Edit Video Basic"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Kategori *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger className="bg-secondary border-border">
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Deskripsi</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-secondary border-border"
                      placeholder="Deskripsi layanan..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Harga (Rp) *</Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="bg-secondary border-border"
                        placeholder="150000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estimatedDays">Estimasi Hari</Label>
                      <Input
                        id="estimatedDays"
                        type="number"
                        value={formData.estimatedDays}
                        onChange={(e) => setFormData({ ...formData, estimatedDays: e.target.value })}
                        className="bg-secondary border-border"
                        placeholder="3"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image">URL Gambar</Label>
                    <Input
                      id="image"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="bg-secondary border-border"
                      placeholder="https://..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="features">Fitur (pisahkan dengan koma)</Label>
                    <Textarea
                      id="features"
                      value={formData.features}
                      onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                      className="bg-secondary border-border"
                      placeholder="Revisi 2x, Color Grading, Thumbnail"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                    <Label htmlFor="isActive">Aktif</Label>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setDialogOpen(false)
                        resetForm()
                      }}
                      className="flex-1"
                    >
                      Batal
                    </Button>
                    <Button type="submit" className="flex-1 gradient-primary">
                      {editingItem ? "Perbarui" : "Simpan"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Menu Grid */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <lord-icon
                src="https://cdn.lordicon.com/msoeawqm.json"
                trigger="loop"
                colors="primary:#6366f1,secondary:#8b5cf6"
                style={{ width: "100px", height: "100px" }}
              />
              <h3 className="mt-4 text-lg font-semibold">Tidak ada menu</h3>
              <p className="text-muted-foreground">
                {menuItems.length === 0 ? "Belum ada menu layanan" : "Tidak ada menu yang cocok"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <Card key={item.id} className="glass border-border overflow-hidden">
                  <div className="relative aspect-video">
                    <Image
                      src={item.image || "/placeholder.svg?height=200&width=400&query=service"}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge
                        className={item.isActive ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}
                      >
                        {item.isActive ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.category}</p>
                      </div>
                      <p className="text-primary font-bold">{formatPrice(item.price)}</p>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{item.description}</p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 bg-transparent"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
