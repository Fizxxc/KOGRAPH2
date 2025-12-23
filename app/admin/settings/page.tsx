"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { db, doc, getDoc, setDoc } from "@/lib/firebase"
import type { SiteSettings } from "@/lib/types"
import { showSuccess, showError } from "@/lib/sweetalert"
import { LoadingSpinner } from "@/components/loading-spinner"
import {
  LayoutDashboard,
  Package,
  Menu,
  Users,
  Settings,
  LogOut,
  Home,
  Save,
  Clock,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function AdminSettingsPage() {
  const { signOut, userProfile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [settings, setSettings] = useState<SiteSettings>({
    id: "main",
    responseTime: "< 1 Jam",
    contactTelegram: "@Kokociixx",
    contactWhatsapp: "085776568948",
    contactEmail: "kograph@gmail.com",
    address: "Indonesia",
    aboutUs: "",
    privacyPolicy: "",
    updatedAt: new Date(),
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, "settings", "main")
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setSettings({
            ...settings,
            ...docSnap.data(),
            updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
          } as SiteSettings)
        }
      } catch (error) {
        console.error("Error fetching settings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await setDoc(doc(db, "settings", "main"), {
        ...settings,
        updatedAt: new Date(),
      })
      showSuccess("Berhasil!", "Pengaturan telah disimpan")
    } catch (error) {
      showError("Gagal", "Terjadi kesalahan saat menyimpan pengaturan")
    } finally {
      setSaving(false)
    }
  }

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: Package, label: "Pesanan", href: "/admin/orders" },
    { icon: Menu, label: "Menu Layanan", href: "/admin/menu" },
    { icon: Users, label: "Pengguna", href: "/admin/users" },
    { icon: Settings, label: "Pengaturan", href: "/admin/settings", active: true },
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
                <h1 className="text-xl font-bold">Pengaturan</h1>
                <p className="text-sm text-muted-foreground">Kelola pengaturan website</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Response Time */}
          <Card className="glass border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Response Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Response Time (ditampilkan di homepage)</Label>
                  <Input
                    value={settings.responseTime}
                    onChange={(e) => setSettings({ ...settings, responseTime: e.target.value })}
                    placeholder="contoh: < 1 Jam, 24 Jam, dll"
                  />
                  <p className="text-xs text-muted-foreground">
                    Ini akan ditampilkan secara realtime di homepage dan halaman kontak
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card className="glass border-border">
            <CardHeader>
              <CardTitle>Informasi Kontak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Telegram
                  </Label>
                  <Input
                    value={settings.contactTelegram}
                    onChange={(e) => setSettings({ ...settings, contactTelegram: e.target.value })}
                    placeholder="@username"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    WhatsApp
                  </Label>
                  <Input
                    value={settings.contactWhatsapp}
                    onChange={(e) => setSettings({ ...settings, contactWhatsapp: e.target.value })}
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    value={settings.contactEmail}
                    onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Alamat
                  </Label>
                  <Input
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    placeholder="Lokasi"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* About Us */}
          <Card className="glass border-border">
            <CardHeader>
              <CardTitle>Tentang Kami</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Deskripsi (ditampilkan di halaman About)</Label>
                <Textarea
                  value={settings.aboutUs}
                  onChange={(e) => setSettings({ ...settings, aboutUs: e.target.value })}
                  placeholder="Deskripsi tentang KOGRAPH..."
                  rows={5}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Policy */}
          <Card className="glass border-border">
            <CardHeader>
              <CardTitle>Kebijakan Privasi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Intro Kebijakan Privasi</Label>
                <Textarea
                  value={settings.privacyPolicy}
                  onChange={(e) => setSettings({ ...settings, privacyPolicy: e.target.value })}
                  placeholder="Kebijakan privasi..."
                  rows={5}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} className="gradient-primary">
              {saving ? (
                <lord-icon
                  src="https://cdn.lordicon.com/lqxfrxad.json"
                  trigger="loop"
                  colors="primary:#ffffff"
                  style={{ width: "24px", height: "24px" }}
                />
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Simpan Pengaturan
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
