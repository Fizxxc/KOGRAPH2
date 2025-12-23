"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ServiceCard } from "@/components/service-card"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { db, collection, getDocs, query, where } from "@/lib/firebase"
import type { MenuItem } from "@/lib/types"
import { Search, Filter } from "lucide-react"
import { cn } from "@/lib/utils"

const categories = [
  { id: "all", label: "Semua" },
  { id: "video", label: "Edit Video" },
  { id: "photo", label: "Edit Foto" },
  { id: "design", label: "Desain Grafis" },
  { id: "motion", label: "Motion Graphics" },
]

export default function ServicesPage() {
  const [services, setServices] = useState<MenuItem[]>([])
  const [filteredServices, setFilteredServices] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const q = query(collection(db, "menuItems"), where("isActive", "==", true))
        const snapshot = await getDocs(q)
        const items: MenuItem[] = []
        snapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() } as MenuItem)
        })
        setServices(items)
        setFilteredServices(items)
      } catch (error) {
        console.error("Error fetching services:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  useEffect(() => {
    let filtered = services

    if (selectedCategory !== "all") {
      filtered = filtered.filter((service) => service.category.toLowerCase() === selectedCategory)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (service) => service.name.toLowerCase().includes(query) || service.description.toLowerCase().includes(query),
      )
    }

    setFilteredServices(filtered)
  }, [services, selectedCategory, searchQuery])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Layanan <span className="gradient-text">Kami</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Pilih layanan yang sesuai dengan kebutuhan Anda. Semua layanan dilakukan oleh tim profesional kami.
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Cari layanan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary border-border"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
              <Filter className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "flex-shrink-0",
                    selectedCategory === category.id && "gradient-primary border-transparent text-white",
                  )}
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Services Grid */}
          {loading ? (
            <LoadingSpinner />
          ) : filteredServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <lord-icon
                src="https://cdn.lordicon.com/msoeawqm.json"
                trigger="loop"
                colors="primary:#6366f1,secondary:#8b5cf6"
                style={{ width: "100px", height: "100px" }}
              />
              <h3 className="mt-4 text-lg font-semibold">Tidak ada layanan ditemukan</h3>
              <p className="text-muted-foreground">Coba ubah filter atau kata kunci pencarian Anda</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
