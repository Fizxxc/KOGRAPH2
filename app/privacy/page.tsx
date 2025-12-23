"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useRealtime } from "@/lib/realtime-context"
import { Shield, Lock, Eye, UserCheck, FileText, Bell } from "lucide-react"

export default function PrivacyPage() {
  const { settings } = useRealtime()

  const sections = [
    {
      icon: FileText,
      title: "Informasi yang Kami Kumpulkan",
      content: `Kami mengumpulkan informasi yang Anda berikan secara langsung kepada kami, termasuk:
      • Nama dan alamat email saat mendaftar
      • Informasi kontak seperti nomor telepon
      • Detail pesanan dan preferensi layanan
      • Komunikasi yang Anda lakukan dengan kami`,
    },
    {
      icon: Eye,
      title: "Penggunaan Informasi",
      content: `Informasi yang kami kumpulkan digunakan untuk:
      • Memproses dan menyelesaikan pesanan Anda
      • Berkomunikasi tentang pesanan dan layanan
      • Mengirimkan update dan notifikasi penting
      • Meningkatkan layanan dan pengalaman pengguna`,
    },
    {
      icon: Lock,
      title: "Keamanan Data",
      content: `Kami menerapkan langkah-langkah keamanan yang sesuai untuk melindungi informasi pribadi Anda dari akses, perubahan, pengungkapan, atau penghancuran yang tidak sah. Data Anda disimpan dengan enkripsi dan akses terbatas hanya untuk tim yang berwenang.`,
    },
    {
      icon: UserCheck,
      title: "Hak Pengguna",
      content: `Anda memiliki hak untuk:
      • Mengakses informasi pribadi Anda
      • Memperbarui atau mengoreksi data Anda
      • Meminta penghapusan data Anda
      • Menolak penggunaan data untuk marketing`,
    },
    {
      icon: Bell,
      title: "Cookies & Tracking",
      content: `Kami menggunakan cookies dan teknologi serupa untuk meningkatkan pengalaman browsing Anda. Cookies membantu kami memahami bagaimana Anda menggunakan situs kami dan memungkinkan kami menyimpan preferensi Anda.`,
    },
    {
      icon: Shield,
      title: "Berbagi Informasi",
      content: `Kami tidak menjual, memperdagangkan, atau mentransfer informasi pribadi Anda kepada pihak ketiga tanpa persetujuan Anda, kecuali diperlukan untuk memproses pesanan atau mematuhi hukum yang berlaku.`,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative pt-32 pb-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10" />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <lord-icon
                src="https://cdn.lordicon.com/jxzkkoed.json"
                trigger="loop"
                delay="1000"
                colors="primary:#6366f1,secondary:#8b5cf6"
                style={{ width: "100px", height: "100px" }}
              />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Kebijakan <span className="gradient-text">Privasi</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Terakhir diperbarui:{" "}
              {new Date().toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>

          <div className="glass rounded-2xl p-8 mb-8">
            <p className="text-muted-foreground leading-relaxed">
              {settings?.privacyPolicy ||
                "KOGRAPH Studio berkomitmen untuk melindungi privasi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda saat menggunakan layanan kami."}
            </p>
          </div>

          <div className="space-y-6">
            {sections.map((section, index) => (
              <div key={index} className="glass rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <section.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold mb-3">{section.title}</h2>
                    <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{section.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 glass rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Pertanyaan tentang Privasi?</h2>
            <p className="text-muted-foreground mb-6">
              Jika Anda memiliki pertanyaan tentang kebijakan privasi kami, silakan hubungi kami.
            </p>
            <a
              href={`mailto:${settings?.contactEmail || "kograph@gmail.com"}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl gradient-primary text-white"
            >
              Hubungi Kami
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
