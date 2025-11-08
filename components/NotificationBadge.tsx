"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/utils"

export function NotificationBadge() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    let channel: any = null

    const setupNotifications = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        try {
          const { data, error } = await supabase
            .from("notifications")
            .select("*")
            .eq("user_id", user.id)
            .eq("read", false)
            .order("created_at", { ascending: false })
            .limit(10)

          if (error) {
            console.warn("Notifications query error:", error)
            return
          }

          setNotifications(data || [])
          setUnreadCount(data?.length || 0)

          // Realtime 구독
          try {
            channel = supabase
              .channel(`notifications:${user.id}`)
              .on(
                "postgres_changes",
                {
                  event: "INSERT",
                  schema: "public",
                  table: "notifications",
                  filter: `user_id=eq.${user.id}`,
                },
                (payload: any) => {
                  setNotifications((prev) => [payload.new, ...prev])
                  setUnreadCount((prev) => prev + 1)
                  toast({
                    title: payload.new.title,
                    description: payload.new.message,
                  })
                }
              )
              .subscribe()
          } catch (realtimeError) {
            console.warn("Realtime subscription error:", realtimeError)
          }
        } catch (queryError) {
          console.warn("Notifications query error:", queryError)
          return
        }
      } catch (authError) {
        console.warn("Auth error in notifications:", authError)
        return
      }
    }

    setupNotifications()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [supabase, toast])

  const handleMarkAsRead = async (notificationId: string) => {
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId)

    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-primary text-white text-xs flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>알림</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <DropdownMenuItem disabled>알림이 없습니다</DropdownMenuItem>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              onClick={() => handleMarkAsRead(notification.id)}
              className="flex flex-col items-start p-3 cursor-pointer"
            >
              <p className="font-semibold text-sm">{notification.title}</p>
              <p className="text-xs text-primary/80 mt-1">{notification.message}</p>
              <p className="text-xs text-primary/60 mt-1">
                {formatDate(notification.created_at)}
              </p>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

