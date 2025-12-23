export interface QRISData {
  qrisString: string
  amount: number
}

export function generateQRISWithAmount(baseQRIS: string, amount: number): string {
  // QRIS format: base QRIS + amount tag (54) + checksum (63)
  // Tag 54 = Transaction Amount
  const amountStr = amount.toString()
  const amountTag = `54${amountStr.length.toString().padStart(2, "0")}${amountStr}`

  // Remove old checksum (last 4 characters are the CRC)
  const qrisWithoutChecksum = baseQRIS.slice(0, -4)

  // Find position to insert amount (before tag 58 - country code)
  const tag58Index = qrisWithoutChecksum.indexOf("5802")

  if (tag58Index === -1) {
    // If tag 58 not found, append before checksum position
    const newQRIS = qrisWithoutChecksum + amountTag
    return newQRIS + calculateCRC16(newQRIS + "6304")
  }

  // Insert amount tag before country code
  const newQRIS = qrisWithoutChecksum.slice(0, tag58Index) + amountTag + qrisWithoutChecksum.slice(tag58Index)

  // Calculate and append new checksum
  return newQRIS + calculateCRC16(newQRIS + "6304")
}

function calculateCRC16(data: string): string {
  let crc = 0xffff

  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8

    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021
      } else {
        crc = crc << 1
      }
    }
  }

  crc = crc & 0xffff
  return crc.toString(16).toUpperCase().padStart(4, "0")
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount)
}
