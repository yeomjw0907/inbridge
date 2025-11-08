"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { formatNumber, formatDate } from "@/lib/utils"
import { Building2, FileText, TrendingUp } from "lucide-react"

export default function BrandPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [brand, setBrand] = useState<any>(null)
  const [proposals, setProposals] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth")
        return
      }

      setUser(user)

      // Fetch brand information
      const { data: brandData } = await supabase
        .from("brands")
        .select("*")
        .eq("user_id", user.id)
        .single()

      setBrand(brandData)

      // Fetch sent proposals
      const { data: proposalsData } = await supabase
        .from("proposals")
        .select("*, influencers:influencer_id(*)")
        .eq("brand_id", user.id)
        .order("created_at", { ascending: false })

      setProposals(proposalsData || [])

      // Fetch ongoing campaigns
      const { data: campaignsData } = await supabase
        .from("campaign_history")
        .select("*")
        .eq("brand_id", user.id)
        .order("created_at", { ascending: false })

      setCampaigns(campaignsData || [])
    }

    fetchData()
  }, [router, supabase])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-8">Brand Dashboard</h1>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="proposals">Proposal Management</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sent Proposals</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{proposals.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Ongoing Campaigns</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {campaigns.filter((c) => c.status === "ongoing").length}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Completed Campaigns</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {campaigns.filter((c) => c.status === "completed").length}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="proposals">
            <div className="space-y-4">
              {proposals.map((proposal) => (
                <Card key={proposal.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{proposal.campaign_name || "No Campaign Name"}</CardTitle>
                        <CardDescription>
                          {proposal.influencers?.channel_name || "Influencer"}
                        </CardDescription>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          proposal.status === "accepted"
                            ? "bg-green-100 text-green-800"
                            : proposal.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {proposal.status === "accepted"
                          ? "Accepted"
                          : proposal.status === "rejected"
                          ? "Rejected"
                          : "Pending"}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Budget</p>
                        <p className="text-lg font-semibold">
                          ${proposal.budget?.toLocaleString() || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Schedule</p>
                        <p className="text-lg font-semibold">{proposal.schedule || "TBD"}</p>
                      </div>
                    </div>
                    {proposal.status === "accepted" && (
                      <Button
                        onClick={() => {
                          router.push(`/chat/${proposal.id}`)
                        }}
                        className="w-full"
                      >
                        Chat
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
              {proposals.length === 0 && (
                <Card>
                  <CardContent className="py-8 text-center text-gray-500">
                    No proposals sent
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="campaigns">
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <Card key={campaign.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{campaign.brand_name || "Campaign"}</CardTitle>
                        <CardDescription>
                          {formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}
                        </CardDescription>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          campaign.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : campaign.status === "ongoing"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {campaign.status === "completed"
                          ? "Completed"
                          : campaign.status === "ongoing"
                          ? "Ongoing"
                          : "Pending"}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Reach</p>
                        <p className="text-lg font-semibold">
                          {formatNumber(campaign.reach || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Engagement Rate</p>
                        <p className="text-lg font-semibold">
                          {campaign.engagement_rate || 0}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Budget</p>
                        <p className="text-lg font-semibold">
                          ${(campaign.budget || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/campaign/${campaign.id}`)}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {campaigns.length === 0 && (
                <Card>
                  <CardContent className="py-8 text-center text-gray-500">
                    No ongoing campaigns
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
}

