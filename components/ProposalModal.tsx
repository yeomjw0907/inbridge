"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface ProposalModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  influencerId: string
}

export function ProposalModal({ open, onOpenChange, influencerId }: ProposalModalProps) {
  const [campaignName, setCampaignName] = useState("")
  const [budget, setBudget] = useState("")
  const [schedule, setSchedule] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!campaignName || !budget || !schedule) {
      toast({
        title: "필수 항목을 입력해주세요",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "로그인이 필요합니다",
          variant: "destructive",
        })
        return
      }

      const { error } = await supabase.from("proposals").insert({
        brand_id: user.id,
        influencer_id: influencerId,
        campaign_name: campaignName,
        budget: parseInt(budget),
        schedule: schedule,
        message: message,
        status: "pending",
      })

      if (error) throw error

      toast({
        title: "제안이 전송되었습니다 ✅",
        description: "인플루언서의 응답을 기다려주세요",
      })

      setCampaignName("")
      setBudget("")
      setSchedule("")
      setMessage("")
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "오류가 발생했습니다",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>제안 보내기</DialogTitle>
          <DialogDescription>
            인플루언서에게 캠페인 제안을 보내세요
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="campaign-name">캠페인명 *</Label>
            <Input
              id="campaign-name"
              placeholder="예: 봄 신상품 홍보 캠페인"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="budget">예산 *</Label>
            <Input
              id="budget"
              type="number"
              placeholder="예: 1000000"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="schedule">일정 *</Label>
            <Input
              id="schedule"
              placeholder="예: 2024-03-01 ~ 2024-03-31"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="message">메시지</Label>
            <Textarea
              id="message"
              placeholder="인플루언서에게 전달할 메시지를 입력하세요"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "전송 중..." : "제안 보내기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

