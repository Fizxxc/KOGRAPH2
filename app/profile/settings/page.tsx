"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth-context"
import { db, doc, updateDoc, serverTimestamp } from "@/lib/firebase"
import { showError, showSuccess, showLoading, closeLoading } from "@/lib/sweetalert"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ArrowLeft, User, Save } from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
  const router = useRouter()
  const { user, userProfile, loading: authLoading } = useAuth()
  const [formData, setFormData] = useState({
    displayName: "",
    phone: "",
    address: "",
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (userProfile) {
      setFormData({
        displayName: userProfile.displayName || "",
        phone: userProfile.phone || "",
        address: userProfile.address || "",
      })
    }
  }, [userProfile])

  const handleSave = async () => {
    if (!user) return

    if (!formData.displayName.trim()) {
      showError("Nama tidak boleh kosong")
      return
    }

    showLoading("Menyimpan perubahan...")

    try {
      await updateDoc(doc(db, "users", user.uid), {
        displayName: formData.displayName,
        phone: formData.phone,
        address: formData.address,
        updatedAt: serverTimestamp(),
      })

      closeLoading()
      showSuccess("Profil berhasil diperbarui!")
    } catch (error) {
      closeLoading()
      console.error("Error updating profile:", error)
      showError("Gagal menyimpan perubahan")
    }
  }

  if (authLoading) {
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
        <div className="max-w-2xl mx-auto">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Profil
          </Link>

          <h1 className="text-3xl font-bold mb-8">
            <span className="gradient-text">Pengaturan</span> Profil
          </h1>

          <Card className="glass border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informasi Profil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-secondary border-border"
                />
                <p className="text-xs text-muted-foreground">Email tidak dapat diubah</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Nama Lengkap</Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="bg-secondary border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">No. Telepon</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="08xxxxxxxxxx"
                  className="bg-secondary border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Alamat</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Alamat lengkap..."
                  className="bg-secondary border-border"
                />
              </div>

              <Button onClick={handleSave} className="w-full gradient-primary">
                <Save className="h-4 w-4 mr-2" />
                Simpan Perubahan
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
