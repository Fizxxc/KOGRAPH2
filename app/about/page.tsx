"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useRealtime } from "@/lib/realtime-context"
import { Users, Award, Star, Zap, Target, Heart, Shield, Sparkles } from "lucide-react"

export default function AboutPage() {
  const { stats, settings } = useRealtime()

  const values = [
    {
      icon: Target,
      title: "Fokus pada Kualitas",
      description: "Kami tidak pernah berkompromi dengan kualitas. Setiap project dikerjakan dengan standar tertinggi.",
    },
    {
      icon: Heart,
      title: "Kepuasan Pelanggan",
      description: "Kepuasan Anda adalah prioritas utama kami. Kami selalu berusaha melampaui ekspektasi.",
    },
    {
      icon: Shield,
      title: "Terpercaya",
      description: "Dengan ratusan klien yang puas, kami telah membuktikan kredibilitas dan profesionalisme kami.",
    },
    {
      icon: Sparkles,
      title: "Inovatif",
      description: "Selalu mengikuti tren terbaru dan menggunakan teknologi terkini untuk hasil maksimal.",
    },
  ]

  const team = [
    { name: "Tim Video Editor", role: "Spesialis editing video profesional", icon: "🎬" },
    { name: "Tim Photo Editor", role: "Ahli retouching dan manipulasi foto", icon: "📸" },
    { name: "Tim Graphic Designer", role: "Desainer kreatif untuk berbagai kebutuhan", icon: "🎨" },
    { name: "Tim Motion Graphics", role: "Animator dan motion designer", icon: "✨" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <lord-icon
                src="https://cdn.lordicon.com/kkvxgpti.json"
                trigger="loop"
                delay="1000"
                colors="primary:#6366f1,secondary:#8b5cf6"
                style={{ width: "100px", height: "100px" }}
              />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Tentang <span className="gradient-text">KOGRAPH</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              {settings?.aboutUs ||
                "KOGRAPH adalah studio kreatif yang menyediakan layanan edit video, foto, dan desain grafis profesional. Kami berkomitmen untuk menghasilkan karya berkualitas tinggi dengan harga terjangkau."}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            <div className="glass rounded-2xl p-6 text-center card-hover">
              <Users className="h-8 w-8 mx-auto mb-3 text-primary" />
              <div className="text-2xl md:text-3xl font-bold mb-1">{stats.activeUsers}+</div>
              <div className="text-sm text-muted-foreground">User Aktif</div>
            </div>
            <div className="glass rounded-2xl p-6 text-center card-hover">
              <Award className="h-8 w-8 mx-auto mb-3 text-primary" />
              <div className="text-2xl md:text-3xl font-bold mb-1">{stats.completedProjects}+</div>
              <div className="text-sm text-muted-foreground">Project Selesai</div>
            </div>
            <div className="glass rounded-2xl p-6 text-center card-hover">
              <Star className="h-8 w-8 mx-auto mb-3 text-primary" />
              <div className="text-2xl md:text-3xl font-bold mb-1">{stats.averageRating.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">Rating</div>
            </div>
            <div className="glass rounded-2xl p-6 text-center card-hover">
              <Zap className="h-8 w-8 mx-auto mb-3 text-primary" />
              <div className="text-2xl md:text-3xl font-bold mb-1">{stats.responseTime}</div>
              <div className="text-sm text-muted-foreground">Response Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Nilai-Nilai <span className="gradient-text">Kami</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Prinsip yang kami pegang teguh dalam setiap pekerjaan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div key={index} className="glass rounded-2xl p-6 card-hover">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                  <value.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tim <span className="gradient-text">Profesional</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Didukung oleh tim berpengalaman di bidangnya masing-masing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <div key={index} className="glass rounded-2xl p-6 text-center card-hover">
                <div className="text-5xl mb-4">{member.icon}</div>
                <h3 className="font-semibold text-lg mb-1">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
