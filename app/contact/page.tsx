"use client"

import type React from "react"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useRealtime } from "@/lib/realtime-context"
import { db, collection, addDoc } from "@/lib/firebase"
import { showSuccess, showError } from "@/lib/sweetalert"
import { MessageCircle, Phone, Mail, MapPin, Send, Clock } from "lucide-react"

export default function ContactPage() {
  const { settings, stats } = useRealtime()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await addDoc(collection(db, "contactMessages"), {
        ...formData,
        createdAt: new Date(),
        isRead: false,
      })

      showSuccess("Pesan Terkirim!", "Terima kasih telah menghubungi kami. Kami akan segera membalas pesan Anda.")
      setFormData({ name: "", email: "", subject: "", message: "" })
    } catch (error) {
      showError("Gagal Mengirim", "Terjadi kesalahan saat mengirim pesan. Silakan coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  const contactInfo = [
    {
      icon: MessageCircle,
      label: "Telegram",
      value: settings?.contactTelegram || "@Kokociixx",
      href: `https://t.me/${(settings?.contactTelegram || "@Kokociixx").replace("@", "")}`,
    },
    {
      icon: Phone,
      label: "WhatsApp",
      value: settings?.contactWhatsapp || "085776568948",
      href: `https://wa.me/62${(settings?.contactWhatsapp || "085776568948").replace(/^0/, "")}`,
    },
    {
      icon: Mail,
      label: "Email",
      value: settings?.contactEmail || "kograph@gmail.com",
      href: `mailto:${settings?.contactEmail || "kograph@gmail.com"}`,
    },
    {
      icon: MapPin,
      label: "Lokasi",
      value: settings?.address || "Indonesia",
      href: null,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative pt-32 pb-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <div className="flex justify-center mb-6">
              <lord-icon
                src="https://cdn.lordicon.com/rhvddzym.json"
                trigger="loop"
                delay="1000"
                colors="primary:#6366f1,secondary:#8b5cf6"
                style={{ width: "100px", height: "100px" }}
              />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Hubungi <span className="gradient-text">Kami</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Punya pertanyaan atau ingin konsultasi? Jangan ragu untuk menghubungi kami!
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm">
                Response Time: <strong className="text-primary">{stats.responseTime}</strong>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="glass rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-6">Kirim Pesan</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Lengkap</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nama Anda"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subjek</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Subjek pesan"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Pesan</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tulis pesan Anda di sini..."
                    rows={5}
                    required
                  />
                </div>
                <Button type="submit" className="w-full gradient-primary" disabled={loading}>
                  {loading ? (
                    <lord-icon
                      src="https://cdn.lordicon.com/lqxfrxad.json"
                      trigger="loop"
                      colors="primary:#ffffff"
                      style={{ width: "24px", height: "24px" }}
                    />
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Kirim Pesan
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <div className="glass rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-6">Informasi Kontak</h2>
                <div className="space-y-6">
                  {contactInfo.map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{item.label}</p>
                        {item.href ? (
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium hover:text-primary transition-colors"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="font-medium">{item.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Contact Buttons */}
              <div className="glass rounded-2xl p-8">
                <h2 className="text-xl font-bold mb-4">Hubungi Langsung</h2>
                <div className="space-y-3">
                  <a
                    href={`https://t.me/${(settings?.contactTelegram || "@Kokociixx").replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-xl bg-[#0088cc]/20 hover:bg-[#0088cc]/30 transition-colors"
                  >
                    <MessageCircle className="h-5 w-5 text-[#0088cc]" />
                    <span className="font-medium">Chat via Telegram</span>
                  </a>
                  <a
                    href={`https://wa.me/62${(settings?.contactWhatsapp || "085776568948").replace(/^0/, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 transition-colors"
                  >
                    <Phone className="h-5 w-5 text-[#25D366]" />
                    <span className="font-medium">Chat via WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
