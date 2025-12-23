"use client"

import type { ReactNode } from "react"
import { AuthProvider } from "@/lib/auth-context"
import { CartProvider } from "@/lib/cart-context"
import { NotificationProvider } from "@/lib/notification-context"
import { RealtimeProvider } from "@/lib/realtime-context"
import { useActiveTracker } from "@/hooks/use-active-tracker"
import Script from "next/script"

function ActiveTrackerWrapper({ children }: { children: ReactNode }) {
  useActiveTracker()
  return <>{children}</>
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <NotificationProvider>
          <RealtimeProvider>
            <ActiveTrackerWrapper>{children}</ActiveTrackerWrapper>
            {/* LordIcon Script */}
            <Script src="https://cdn.lordicon.com/lordicon.js" strategy="lazyOnload" />
          </RealtimeProvider>
        </NotificationProvider>
      </CartProvider>
    </AuthProvider>
  )
}
