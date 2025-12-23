import { type NextRequest, NextResponse } from "next/server"
import { sendTelegramNotification, formatOrderNotification } from "@/lib/telegram"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, userName, userEmail, userPhone, items, totalPrice, orderDetails } = body

    const message = formatOrderNotification({
      id: orderId,
      userName,
      userEmail,
      userPhone,
      items,
      totalPrice,
      orderDetails,
    })

    await sendTelegramNotification(message)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Telegram API error:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}
