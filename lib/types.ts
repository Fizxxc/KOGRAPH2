export interface UserProfile {
  uid: string
  email: string
  displayName: string
  photoURL?: string
  phone?: string
  address?: string
  role: "user" | "admin"
  createdAt: Date
  updatedAt: Date
}

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  image: string
  features: string[]
  estimatedDays: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CartItem {
  menuItem: MenuItem
  quantity: number
  notes?: string
}

export interface OrderDetail {
  projectName: string
  projectDescription: string
  referenceLinks?: string
  deadline?: string
  additionalNotes?: string
}

export interface Order {
  id: string
  userId: string
  userEmail: string
  userName: string
  userPhone?: string
  items: CartItem[]
  orderDetails: OrderDetail
  totalPrice: number
  status: "pending" | "processing" | "completed" | "cancelled"
  paymentStatus: "unpaid" | "paid" | "refunded"
  paymentProof?: string
  adminNotes?: string
  createdAt: Date
  updatedAt: Date
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: "order" | "payment" | "system" | "promo"
  isRead: boolean
  orderId?: string
  createdAt: Date
}

export interface Review {
  id: string
  orderId: string
  userId: string
  userName: string
  userPhoto?: string
  rating: number
  comment: string
  serviceNames: string[]
  isApproved: boolean
  createdAt: Date
}

export interface SiteSettings {
  id: string
  responseTime: string
  contactTelegram: string
  contactWhatsapp: string
  contactEmail: string
  address: string
  aboutUs: string
  privacyPolicy: string
  updatedAt: Date
}

export interface ActiveUser {
  id: string
  visitorId: string
  lastSeen: Date
}

export interface FAQ {
  id: string
  question: string
  answer: string
  order: number
  isActive: boolean
}

export interface DashboardStats {
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  totalRevenue: number
  todayOrders: number
  todayRevenue: number
}

export interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderPhoto?: string
  message: string
  isAdmin: boolean
  isRead: boolean
  createdAt: Date
}

export interface ChatConversation {
  id: string
  userId: string
  userName: string
  userEmail: string
  userPhoto?: string
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
  status: "active" | "closed"
}
