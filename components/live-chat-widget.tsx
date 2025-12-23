"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
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
} from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, X, Send, Minimize2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ChatMessage } from "@/lib/types"

export function LiveChatWidget() {
  const { user, userProfile } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Create or get existing conversation
  useEffect(() => {
    if (!user || !isOpen) return

    const fetchConversation = async () => {
      const conversationsRef = collection(db, "chatConversations")
      const q = query(conversationsRef, where("userId", "==", user.uid))

      const unsubscribe = onSnapshot(q, async (snapshot) => {
        if (!snapshot.empty) {
          const conv = snapshot.docs[0]
          setConversationId(conv.id)
        } else {
          // Create new conversation
          const newConv = await addDoc(conversationsRef, {
            userId: user.uid,
            userName: userProfile?.displayName || "User",
            userEmail: user.email,
            userPhoto: userProfile?.photoURL || "",
            lastMessage: "",
            lastMessageTime: serverTimestamp(),
            unreadCount: 0,
            status: "active",
          })
          setConversationId(newConv.id)
        }
      })

      return () => unsubscribe()
    }

    fetchConversation()
  }, [user, isOpen, userProfile])

  // Listen to messages
  useEffect(() => {
    if (!conversationId) return

    const messagesRef = collection(db, "chatMessages")
    const q = query(messagesRef, where("conversationId", "==", conversationId), orderBy("createdAt", "asc"))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: ChatMessage[] = []
      let unread = 0

      snapshot.forEach((doc) => {
        const data = doc.data()
        const msg = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as ChatMessage

        msgs.push(msg)

        // Count unread messages from admin
        if (msg.isAdmin && !msg.isRead && !isOpen) {
          unread++
        }
      })

      setMessages(msgs)
      setUnreadCount(unread)

      // Mark messages as read when chat is open
      if (isOpen) {
        msgs.forEach(async (msg) => {
          if (msg.isAdmin && !msg.isRead) {
            await updateDoc(doc(db, "chatMessages", msg.id), { isRead: true })
          }
        })
        setUnreadCount(0)
      }
    })

    return () => unsubscribe()
  }, [conversationId, isOpen])

  const handleSend = async () => {
    if (!message.trim() || !conversationId || !user) return

    try {
      await addDoc(collection(db, "chatMessages"), {
        conversationId,
        senderId: user.uid,
        senderName: userProfile?.displayName || "User",
        senderPhoto: userProfile?.photoURL || "",
        message: message.trim(),
        isAdmin: false,
        isRead: false,
        createdAt: serverTimestamp(),
      })

      // Update conversation
      await updateDoc(doc(db, "chatConversations", conversationId), {
        lastMessage: message.trim(),
        lastMessageTime: serverTimestamp(),
      })

      setMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!user) return null

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg gradient-primary z-50"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center p-0 text-xs bg-destructive">
              {unreadCount}
            </Badge>
          )}
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card
          className={cn(
            "fixed bottom-6 right-6 w-96 shadow-2xl z-50 flex flex-col border-border",
            isMinimized ? "h-14" : "h-[500px]",
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-card">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Live Chat</h3>
                <p className="text-xs text-muted-foreground">Admin akan membalas segera</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsMinimized(!isMinimized)}>
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/30">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Mulai percakapan dengan admin</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={cn("flex gap-2", msg.isAdmin ? "justify-start" : "justify-end")}>
                      {msg.isAdmin && msg.senderPhoto && (
                        <img
                          src={msg.senderPhoto || "/placeholder.svg"}
                          alt={msg.senderName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}
                      <div
                        className={cn(
                          "max-w-[70%] rounded-2xl px-4 py-2 text-sm",
                          msg.isAdmin ? "bg-card border border-border" : "bg-primary text-primary-foreground",
                        )}
                      >
                        {msg.isAdmin && <p className="text-xs font-medium mb-1 opacity-70">{msg.senderName}</p>}
                        <p className="break-words">{msg.message}</p>
                        <p className={cn("text-xs mt-1 opacity-70")}>
                          {msg.createdAt.toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-border bg-card">
                <div className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ketik pesan..."
                    className="flex-1 bg-background"
                  />
                  <Button onClick={handleSend} disabled={!message.trim()} size="icon" className="gradient-primary">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      )}
    </>
  )
}
