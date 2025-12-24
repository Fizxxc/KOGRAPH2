"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { db, collection, getDocs, query, where, orderBy } from "@/lib/firebase"
import type { FAQ } from "@/lib/types"
import { ChevronDown, HelpCircle, MessageCircle, Phone } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRealtime } from "@/lib/realtime-context"

const defaultFaqs: FAQ[] = [
  {
    id: "1",
    question: "Berapa lama waktu pengerjaan?",
    answer:
      "Waktu pengerjaan bervariasi tergantung jenis layanan dan kompleksitas project. Umumnya 1-7 hari kerja. Anda bisa melihat estimasi waktu di setiap layanan.",
    order: 1,
    isActive: true,
  },
  {
    id: "2",
    question: "Apakah ada revisi?",
    answer:
      "Ya, kami menyediakan revisi tergantung yang di berikan di produk kami, untuk memastikan hasil sesuai dengan keinginan Anda.",
    order: 2,
    isActive: true,
  },
  {
    id: "3",
    question: "Bagaimana cara pembayaran?",
    answer:
      "Pembayaran dapat dilakukan melalui transfer bank, e-wallet, atau QRIS. Setelah checkout, Anda akan menerima instruksi pembayaran lengkap.",
    order: 3,
    isActive: true,
  },
  {
    id: "4",
    question: "Apakah file mentah disertakan?",
    answer:
      "Untuk beberapa layanan, file mentah (source file) dapat disertakan dengan biaya tambahan. Silakan tanyakan kepada kami untuk info lebih lanjut.",
    order: 4,
    isActive: true,
  },
  {
    id: "5",
    question: "Bagaimana jika tidak puas dengan hasil?",
    answer:
      "Kepuasan Anda adalah prioritas kami. Jika tidak puas, kami akan melakukan revisi hingga sesuai ekspektasi. Jika masih tidak puas, kami menawarkan revisi tambahan.",
    order: 5,
    isActive: true,
  },
  {
    id: "6",
    question: "Apakah bisa request urgent/express?",
    answer:
      "Ya, kami menyediakan layanan express dengan biaya tambahan. Hubungi kami langsung untuk negosiasi waktu dan harga.",
    order: 6,
    isActive: true,
  },
]

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>(defaultFaqs)
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const { settings } = useRealtime()

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const q = query(collection(db, "faqs"), where("isActive", "==", true), orderBy("order", "asc"))
        const snapshot = await getDocs(q)
        if (!snapshot.empty) {
          const faqsList: FAQ[] = []
          snapshot.forEach((doc) => {
            faqsList.push({ id: doc.id, ...doc.data() } as FAQ)
          })
          setFaqs(faqsList)
        }
      } catch (error) {
        console.error("Error fetching FAQs:", error)
      }
    }

    fetchFaqs()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative pt-32 pb-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10" />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <lord-icon
                src="https://cdn.lordicon.com/kipaqhoz.json"
                trigger="loop"
                delay="1000"
                colors="primary:#6366f1,secondary:#8b5cf6"
                style={{ width: "100px", height: "100px" }}
              />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Pertanyaan <span className="gradient-text">Umum</span>
            </h1>
            <p className="text-lg text-muted-foreground">Temukan jawaban untuk pertanyaan yang sering diajukan</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={faq.id}
                className={cn(
                  "glass rounded-2xl overflow-hidden transition-all",
                  openIndex === index ? "ring-2 ring-primary/50" : "",
                )}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <div className="flex items-center gap-4">
                    <HelpCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="font-medium">{faq.question}</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 text-muted-foreground transition-transform",
                      openIndex === index ? "rotate-180" : "",
                    )}
                  />
                </button>
                <div
                  className={cn("overflow-hidden transition-all", openIndex === index ? "max-h-96 pb-6" : "max-h-0")}
                >
                  <div className="px-6 pl-[52px]">
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Still have questions */}
          <div className="mt-16 glass rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Masih ada pertanyaan?</h2>
            <p className="text-muted-foreground mb-6">Jangan ragu untuk menghubungi kami langsung</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`https://t.me/${(settings?.contactTelegram || "@Kokociixx").replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0088cc] text-white hover:bg-[#0088cc]/90 transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
                Chat Telegram
              </a>
              <a
                href={`https://wa.me/62${(settings?.contactWhatsapp || "085776568948").replace(/^0/, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#25D366] text-white hover:bg-[#25D366]/90 transition-colors"
              >
                <Phone className="h-5 w-5" />
                Chat WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
