"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ServiceCard } from "@/components/service-card"
import { Button } from "@/components/ui/button"
import { db, collection, getDocs, query, where } from "@/lib/firebase"
import { useRealtime } from "@/lib/realtime-context"
import type { MenuItem } from "@/lib/types"
import { ArrowRight, Star, Users, Award, Zap, CheckCircle, Quote, UserCheck } from "lucide-react"

export default function HomePage() {
  const [featuredServices, setFeaturedServices] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const { stats, reviews } = useRealtime()

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const q = query(collection(db, "menuItems"), where("isActive", "==", true))
        const snapshot = await getDocs(q)
        const services: MenuItem[] = []
        snapshot.forEach((doc) => {
          services.push({ id: doc.id, ...doc.data() } as MenuItem)
        })
        setFeaturedServices(services.slice(0, 6))
      } catch (error) {
        console.error("Error fetching services:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  const realtimeStats = [
    { icon: Users, value: stats.activeUsers.toString(), label: "User Aktif", live: true },
    { icon: Award, value: `${stats.completedProjects}+`, label: "Project Selesai", live: true },
    { icon: Star, value: stats.averageRating.toFixed(1), label: `Rating (${stats.totalReviews} ulasan)`, live: true },
    { icon: Zap, value: stats.responseTime, label: "Response Time", live: true },
  ]

  const features = [
    "Revisi",
    "Harga Terjangkau",
    "Tim Profesional",
    "Support 24/7",
    "Hasil Berkualitas",
    "Proses Cepat",
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <lord-icon
                src="https://cdn.lordicon.com/wloilxuq.json"
                trigger="loop"
                delay="1000"
                colors="primary:#6366f1,secondary:#8b5cf6"
                style={{ width: "100px", height: "100px" }}
              />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">KOGRAPH</span> Studio
              <br />
              Jasa Edit Profesional
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Tingkatkan kualitas konten Anda dengan layanan edit video, foto, dan desain grafis dari tim profesional
              kami.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/services">
                <Button size="lg" className="gradient-primary px-8">
                  Lihat Layanan
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="px-8 bg-transparent">
                  Hubungi Kami
                </Button>
              </Link>
            </div>
          </div>

          {/* Realtime Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            {realtimeStats.map((stat, index) => (
              <div key={index} className="glass rounded-2xl p-6 text-center card-hover relative overflow-hidden">
                {stat.live && (
                  <div className="absolute top-3 right-3 flex items-center gap-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-[10px] text-green-500 font-medium">LIVE</span>
                  </div>
                )}
                <stat.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                <div className="text-2xl md:text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Mengapa Pilih <span className="gradient-text">KOGRAPH?</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Kami berkomitmen memberikan layanan terbaik dengan kualitas premium
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 glass rounded-xl p-4">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                Layanan <span className="gradient-text">Unggulan</span>
              </h2>
              <p className="text-muted-foreground">Pilihan layanan terbaik untuk kebutuhan Anda</p>
            </div>
            <Link href="/services">
              <Button variant="outline">
                Lihat Semua
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <lord-icon
                src="https://cdn.lordicon.com/lqxfrxad.json"
                trigger="loop"
                colors="primary:#6366f1,secondary:#8b5cf6"
                style={{ width: "60px", height: "60px" }}
              />
            </div>
          ) : featuredServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <lord-icon
                src="https://cdn.lordicon.com/msoeawqm.json"
                trigger="loop"
                colors="primary:#6366f1,secondary:#8b5cf6"
                style={{ width: "80px", height: "80px" }}
              />
              <p className="mt-4 text-muted-foreground">Belum ada layanan tersedia. Silakan cek kembali nanti.</p>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      {reviews.length > 0 && (
        <section className="py-20 px-4 bg-card/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Apa Kata <span className="gradient-text">Klien Kami?</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Testimoni nyata dari klien yang telah menggunakan layanan kami
              </p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-sm text-green-500 font-medium">Testimoni Realtime</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.slice(0, 6).map((review) => (
                <div key={review.id} className="glass rounded-2xl p-6 card-hover">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      {review.userPhoto ? (
                        <img
                          src={review.userPhoto || "/placeholder.svg"}
                          alt={review.userName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <UserCheck className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{review.userName}</h4>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <Quote className="h-8 w-8 text-primary/30" />
                  </div>
                  <p className="text-muted-foreground text-sm mb-3">{review.comment}</p>
                  <div className="flex flex-wrap gap-2">
                    {review.serviceNames?.map((service, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-purple-500/20" />
            <div className="relative z-10">
              <lord-icon
                src="https://cdn.lordicon.com/lupuorrc.json"
                trigger="loop"
                delay="2000"
                colors="primary:#6366f1,secondary:#8b5cf6"
                style={{ width: "80px", height: "80px" }}
              />
              <h2 className="text-3xl md:text-4xl font-bold mt-6 mb-4">Siap Memulai Project Anda?</h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Konsultasikan kebutuhan edit Anda dengan tim kami dan dapatkan penawaran terbaik.
              </p>
              <Link href="/services">
                <Button size="lg" className="gradient-primary px-8">
                  Mulai Sekarang
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
