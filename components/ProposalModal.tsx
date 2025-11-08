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
        title: "Please fill in all required fields",
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
          title: "Login required",
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
        title: "Proposal sent successfully ✅",
        description: "Please wait for the influencer's response",
      })

      setCampaignName("")
      setBudget("")
      setSchedule("")
      setMessage("")
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "An error occurred",
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
          <DialogTitle>Send Proposal</DialogTitle>
          <DialogDescription>
            Send a campaign proposal to the influencer
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="campaign-name">Campaign Name *</Label>
            <Input
              id="campaign-name"
              placeholder="e.g., Spring New Product Launch Campaign"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="budget">Budget *</Label>
            <Input
              id="budget"
              type="number"
              placeholder="e.g., 1000000"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="schedule">Schedule *</Label>
            <Input
              id="schedule"
              placeholder="e.g., 2024-03-01 ~ 2024-03-31"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Enter a message to send to the influencer"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Sending..." : "Send Proposal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

