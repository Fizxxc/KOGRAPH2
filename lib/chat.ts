import {
  db,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  doc,
  getDocs,
} from "./firebase"
import type { ChatMessage, ChatConversation } from "./types"

export async function sendMessage(
  conversationId: string,
  senderId: string,
  senderName: string,
  senderPhoto: string | undefined,
  message: string,
  isAdmin: boolean,
) {
  await addDoc(collection(db, "chatMessages"), {
    conversationId,
    senderId,
    senderName,
    senderPhoto: senderPhoto || "",
    message,
    isAdmin,
    isRead: false,
    createdAt: serverTimestamp(),
  })

  // Update conversation last message
  const conversationRef = doc(db, "chatConversations", conversationId)
  await updateDoc(conversationRef, {
    lastMessage: message,
    lastMessageTime: serverTimestamp(),
    unreadCount: isAdmin ? 0 : 1,
  })
}

export function subscribeToMessages(conversationId: string, callback: (messages: ChatMessage[]) => void) {
  const q = query(
    collection(db, "chatMessages"),
    where("conversationId", "==", conversationId),
    orderBy("createdAt", "asc"),
  )

  return onSnapshot(q, (snapshot) => {
    const messages: ChatMessage[] = []
    snapshot.forEach((doc) => {
      messages.push({
        id: doc.id,
        ...doc.data(),
       createdAt: doc.data().createdAt ?? null,
      } as ChatMessage)
    })
    callback(messages)
  })
}

export function subscribeToConversations(callback: (conversations: ChatConversation[]) => void) {
  const q = query(collection(db, "chatConversations"), orderBy("lastMessageTime", "desc"))

  return onSnapshot(q, (snapshot) => {
    const conversations: ChatConversation[] = []
    snapshot.forEach((doc) => {
      conversations.push({
        id: doc.id,
        ...doc.data(),
        lastMessageTime: doc.data().lastMessageTime?.toDate() || new Date(),
      } as ChatConversation)
    })
    callback(conversations)
  })
}

export async function markMessagesAsRead(conversationId: string, userId: string, isAdmin: boolean) {
  const q = query(
    collection(db, "chatMessages"),
    where("conversationId", "==", conversationId),
    where("isRead", "==", false),
    where("isAdmin", "==", !isAdmin),
  )

  const snapshot = await getDocs(q)
  const promises = snapshot.docs.map((doc) => updateDoc(doc.ref, { isRead: true }))
  await Promise.all(promises)

  // Reset unread count
  const conversationRef = doc(db, "chatConversations", conversationId)
  await updateDoc(conversationRef, { unreadCount: 0 })
}

export async function createOrGetConversation(
  userId: string,
  userName: string,
  userEmail: string,
  userPhoto?: string,
): Promise<string> {
  const q = query(collection(db, "chatConversations"), where("userId", "==", userId))
  const snapshot = await getDocs(q)

  if (!snapshot.empty) {
    return snapshot.docs[0].id
  }

  const docRef = await addDoc(collection(db, "chatConversations"), {
    userId,
    userName,
    userEmail,
    userPhoto: userPhoto || "",
    lastMessage: "",
    lastMessageTime: serverTimestamp(),
    unreadCount: 0,
    status: "active",
  })

  return docRef.id
}
