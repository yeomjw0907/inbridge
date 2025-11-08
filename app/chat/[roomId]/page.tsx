"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { formatDate } from "@/lib/utils"
import { Send, FileText } from "lucide-react"

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.roomId as string
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [user, setUser] = useState<any>(null)
  const [room, setRoom] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      const { data: roomData } = await supabase
        .from("chat_rooms")
        .select("*")
        .eq("id", roomId)
        .single()

      setRoom(roomData)

      const { data: messagesData } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("room_id", roomId)
        .order("created_at", { ascending: true })

      setMessages(messagesData || [])
    }

    fetchData()

    // Realtime 구독
    const channel = supabase
      .channel(`chat:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new])
          scrollToBottom()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomId, supabase])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return

    const { error } = await supabase.from("chat_messages").insert({
      room_id: roomId,
      sender_id: user.id,
      message: newMessage,
    })

    if (error) {
      console.error("Error sending message:", error)
      return
    }

    setNewMessage("")
  }

  const handleCreateContract = async () => {
    if (!room) return

    const { data: proposal } = await supabase
      .from("proposals")
      .select("*")
      .eq("id", room.proposal_id)
      .single()

    if (proposal) {
      router.push(`/contract/${proposal.id}`)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">채팅</h1>
            {room && (
              <Button onClick={handleCreateContract}>
                <FileText className="w-4 h-4 mr-2" />
                계약서 생성하기
              </Button>
            )}
          </div>

          <Card className="h-[600px] flex flex-col">
            <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => {
                const isOwn = message.sender_id === user?.id
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-xl px-4 py-2 ${
                        isOwn
                          ? "bg-primary text-white"
                          : "bg-gray-200 text-gray-900"
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isOwn ? "text-white/70" : "text-primary/80"
                        }`}
                      >
                        {formatDate(message.created_at)}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </CardContent>
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="메시지를 입력하세요..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}

