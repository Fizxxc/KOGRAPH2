"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import {
  db,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "@/lib/firebase"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, Send, Search, User, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ChatConversation, ChatMessage } from "@/lib/types"

export default function AdminChatPage() {
  const { user, userProfile, isAdmin } = useAuth()
  const router = useRouter()
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [message, setMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user && !isAdmin) {
      router.push("/")
    }
  }, [user, isAdmin, router])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Listen to all conversations
  useEffect(() => {
    if (!isAdmin) return

    const conversationsRef = collection(db, "chatConversations")
    const q = query(conversationsRef, orderBy("lastMessageTime", "desc"))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convs: ChatConversation[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        convs.push({
          id: doc.id,
          ...data,
          lastMessageTime: data.lastMessageTime?.toDate() || new Date(),
        } as ChatConversation)
      })
      setConversations(convs)
    })

    return () => unsubscribe()
  }, [isAdmin])

  // Listen to messages of selected conversation
  useEffect(() => {
    if (!selectedConversation) return

    const messagesRef = collection(db, "chatMessages")
    const q = query(messagesRef, where("conversationId", "==", selectedConversation.id), orderBy("createdAt", "asc"))

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const msgs: ChatMessage[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        msgs.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as ChatMessage)
      })
      setMessages(msgs)

      // Mark user messages as read
      msgs.forEach(async (msg) => {
        if (!msg.isAdmin && !msg.isRead) {
          await updateDoc(doc(db, "chatMessages", msg.id), { isRead: true })
        }
      })

      // Reset unread count
      if (selectedConversation.unreadCount > 0) {
        await updateDoc(doc(db, "chatConversations", selectedConversation.id), { unreadCount: 0 })
      }
    })

    return () => unsubscribe()
  }, [selectedConversation])

  const handleSend = async () => {
    if (!message.trim() || !selectedConversation || !user) return

    try {
      await addDoc(collection(db, "chatMessages"), {
        conversationId: selectedConversation.id,
        senderId: user.uid,
        senderName: userProfile?.displayName || "Admin",
        senderPhoto: userProfile?.photoURL || "",
        message: message.trim(),
        isAdmin: true,
        isRead: false,
        createdAt: serverTimestamp(),
      })

      await updateDoc(doc(db, "chatConversations", selectedConversation.id), {
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

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.userEmail.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0)

  if (!isAdmin) return null

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Kelola Live Chat</h1>
          <p className="text-muted-foreground">Balas pesan dari pengguna secara real-time</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <Card className="lg:col-span-1 border-border">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Percakapan</h3>
                {totalUnread > 0 && <Badge className="bg-destructive">{totalUnread} pesan baru</Badge>}
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari pengguna..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background"
                />
              </div>
            </div>

            <ScrollArea className="h-[600px]">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Belum ada percakapan</p>
                </div>
              ) : (
                <div className="p-2">
                  {filteredConversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      className={cn(
                        "w-full p-3 rounded-lg text-left transition-colors mb-2",
                        selectedConversation?.id === conv.id
                          ? "bg-primary/10 border-2 border-primary"
                          : "hover:bg-muted border-2 border-transparent",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {conv.userPhoto ? (
                          <img
                            src={conv.userPhoto || "/placeholder.svg"}
                            alt={conv.userName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium truncate">{conv.userName}</p>
                            {conv.unreadCount > 0 && <Badge className="ml-2 bg-destructive">{conv.unreadCount}</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">
                              {conv.lastMessageTime.toLocaleString("id-ID", {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2 border-border">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    {selectedConversation.userPhoto ? (
                      <img
                        src={selectedConversation.userPhoto || "/placeholder.svg"}
                        alt={selectedConversation.userName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold">{selectedConversation.userName}</h3>
                      <p className="text-sm text-muted-foreground">{selectedConversation.userEmail}</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="h-[480px]">
                  <div className="p-4 space-y-3">
                    {messages.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Belum ada pesan</p>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div key={msg.id} className={cn("flex gap-2", msg.isAdmin ? "justify-end" : "justify-start")}>
                          {!msg.isAdmin && msg.senderPhoto && (
                            <img
                              src={msg.senderPhoto || "/placeholder.svg"}
                              alt={msg.senderName}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          )}
                          <div
                            className={cn(
                              "max-w-[70%] rounded-2xl px-4 py-2 text-sm",
                              msg.isAdmin ? "bg-primary text-primary-foreground" : "bg-card border border-border",
                            )}
                          >
                            {!msg.isAdmin && <p className="text-xs font-medium mb-1 opacity-70">{msg.senderName}</p>}
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
                </ScrollArea>

                {/* Input */}
                <div className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ketik balasan..."
                      className="flex-1 bg-background"
                    />
                    <Button onClick={handleSend} disabled={!message.trim()} className="gradient-primary">
                      <Send className="h-4 w-4 mr-2" />
                      Kirim
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-[600px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Pilih percakapan untuk memulai</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
