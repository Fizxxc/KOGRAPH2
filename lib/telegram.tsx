const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

export async function sendTelegramNotification(message: string) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn("Telegram credentials not configured")
    return
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "HTML",
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to send Telegram notification")
    }

    return await response.json()
  } catch (error) {
    console.error("Telegram notification error:", error)
  }
}

export function formatOrderNotification(order: {
  id: string
  userName: string
  userEmail: string
  userPhone?: string
  items: Array<{ menuItem: { name: string; price: number }; quantity: number }>
  totalPrice: number
  orderDetails: {
    projectName: string
    projectDescription: string
  }
}) {
  const itemsList = order.items
    .map(
      (item) =>
        `• ${item.menuItem.name} x${item.quantity} - Rp ${(item.menuItem.price * item.quantity).toLocaleString("id-ID")}`,
    )
    .join("\n")

  return `
🛒 <b>PESANAN BARU!</b>

📋 <b>Order ID:</b> ${order.id}
👤 <b>Nama:</b> ${order.userName}
📧 <b>Email:</b> ${order.userEmail}
📱 <b>Phone:</b> ${order.userPhone || "-"}

📦 <b>Items:</b>
${itemsList}

💰 <b>Total:</b> Rp ${order.totalPrice.toLocaleString("id-ID")}

📝 <b>Project:</b> ${order.orderDetails.projectName}
📄 <b>Deskripsi:</b> ${order.orderDetails.projectDescription}

⏰ <b>Waktu:</b> ${new Date().toLocaleString("id-ID")}
  `.trim()
}
