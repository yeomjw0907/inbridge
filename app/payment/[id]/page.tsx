"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { CreditCard, CheckCircle } from "lucide-react"

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [contract, setContract] = useState<any>(null)
  const [proposal, setProposal] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      const { data: contractData } = await supabase
        .from("contracts")
        .select("*, proposals:proposal_id(*)")
        .eq("id", id)
        .single()

      setContract(contractData)
      setProposal(contractData?.proposals)
    }

    fetchData()
  }, [id, supabase])

  const handlePayment = async () => {
    setLoading(true)
    try {
      // Should redirect to Stripe Checkout in production
      // This is a simulation

      const { error: paymentError } = await supabase.from("payments").insert({
        contract_id: id,
        amount: proposal?.budget || 0,
        status: "paid",
      })

      if (paymentError) throw paymentError

      // Activate campaign
      const { error: campaignError } = await supabase.from("campaign_history").insert({
        brand_id: proposal?.brand_id,
        influencer_id: proposal?.influencer_id,
        proposal_id: proposal?.id,
        brand_name: proposal?.brands?.company_name,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        budget: proposal?.budget,
        status: "ongoing",
      })

      if (campaignError) throw campaignError

      toast({
        title: "Payment completed 💰",
        description: "Campaign has started",
      })

      setTimeout(() => {
        router.push(`/campaign/${proposal?.id}`)
      }, 2000)
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
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <CreditCard className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Payment</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 mb-2">Campaign Name</p>
                <p className="text-lg font-semibold">
                  {proposal?.campaign_name || "No Campaign Name"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Payment Amount</p>
                <p className="text-3xl font-bold text-primary">
                  ${(proposal?.budget || 0).toLocaleString()}
                </p>
              </div>

              <div className="border-t pt-6">
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Campaign Cost</span>
                    <span>${(proposal?.budget || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Fee</span>
                    <span>$0</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-2 border-t">
                    <span>Total Payment</span>
                    <span>${(proposal?.budget || 0).toLocaleString()}</span>
                  </div>
                </div>

                <Button
                  onClick={handlePayment}
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? "Processing..." : "Pay Now"}
                </Button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  Actual payment will be processed through Stripe
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}

