import Link from "next/link"
import { Phone, MapPin, Instagram, Youtube, MessageCircle } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <lord-icon
                src="https://cdn.lordicon.com/wloilxuq.json"
                trigger="loop"
                delay="3000"
                colors="primary:#6366f1,secondary:#8b5cf6"
                style={{ width: "32px", height: "32px" }}
              />
              <span className="font-bold text-xl gradient-text">KOGRAPH</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Platform jasa edit profesional untuk video, foto, dan desain grafis. Kualitas terbaik dengan harga
              terjangkau.
            </p>
            <div className="flex gap-4">
              <a
                href="https://t.me/Kokociixx"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Layanan</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/services?category=video"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Edit Video
                </Link>
              </li>
              <li>
                <Link
                  href="/services?category=photo"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Edit Foto
                </Link>
              </li>
              <li>
                <Link
                  href="/services?category=design"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Desain Grafis
                </Link>
              </li>
              <li>
                <Link
                  href="/services?category=motion"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Motion Graphics
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Legalitas</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Hubungi Kami
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Kebijakan Privasi
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Kontak</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageCircle className="h-4 w-4" />
                <a
                  href="https://t.me/Kokociixx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  @Kokociixx
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <a
                  href="https://wa.me/6285776568948"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  085776568948
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5" />
                Perum.Griya Yasa, Wanasari, Cibitung, Bekasi, Indonesia
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} KOGRAPH Studio. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
