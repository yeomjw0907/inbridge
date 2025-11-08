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
import { Users, TrendingUp, CheckCircle, XCircle, Clock } from "lucide-react"

export default function MyPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [influencer, setInfluencer] = useState<any>(null)
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

      // Fetch influencer information
      const { data: influencerData } = await supabase
        .from("influencers")
        .select("*")
        .eq("user_id", user.id)
        .single()

      setInfluencer(influencerData)

      // Fetch proposal inbox
      const { data: proposalsData } = await supabase
        .from("proposals")
        .select("*, brands:brand_id(*)")
        .eq("influencer_id", influencerData?.id)
        .order("created_at", { ascending: false })

      setProposals(proposalsData || [])

      // Fetch ongoing campaigns
      const { data: campaignsData } = await supabase
        .from("campaign_history")
        .select("*")
        .eq("influencer_id", influencerData?.id)
        .order("created_at", { ascending: false })

      setCampaigns(campaignsData || [])
    }

    fetchData()
  }, [router, supabase])

  const handleProposalAction = async (proposalId: string, action: "accept" | "reject") => {
    const { error } = await supabase
      .from("proposals")
      .update({ status: action === "accept" ? "accepted" : "rejected" })
      .eq("id", proposalId)

    if (error) {
      console.error("Error updating proposal:", error)
      return
    }

    // Create chat room when proposal is accepted
    if (action === "accept") {
      const { data: proposal } = await supabase
        .from("proposals")
        .select("*")
        .eq("id", proposalId)
        .single()

      if (proposal) {
        const { error: chatError } = await supabase.from("chat_rooms").insert({
          brand_id: proposal.brand_id,
          influencer_id: proposal.influencer_id,
          proposal_id: proposalId,
        })

        if (chatError) {
          console.error("Error creating chat room:", chatError)
        }
      }
    }

    // Reload data
    const { data: proposalsData } = await supabase
      .from("proposals")
      .select("*, brands:brand_id(*)")
      .eq("influencer_id", influencer?.id)
      .order("created_at", { ascending: false })

    setProposals(proposalsData || [])
  }

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
        <h1 className="text-3xl font-bold mb-8">My Page</h1>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile Management</TabsTrigger>
            <TabsTrigger value="proposals">Proposal Inbox</TabsTrigger>
            <TabsTrigger value="campaigns">Ongoing Campaigns</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Management</CardTitle>
                <CardDescription>Manage your SNS connection status and profile information</CardDescription>
              </CardHeader>
              <CardContent>
                {influencer ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Channel Name</p>
                      <p className="text-lg font-semibold">
                        {influencer.channel_name || "Not set"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Followers</p>
                      <p className="text-lg font-semibold">
                        {formatNumber(influencer.followers || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Main Categories</p>
                      <div className="flex flex-wrap gap-2">
                        {influencer.categories?.map((category: string) => (
                          <span
                            key={category}
                            className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                          >
                            {category}
                          </span>
                        )) || <p className="text-gray-500">No categories</p>}
                      </div>
                    </div>
                    <Button>Edit Profile</Button>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-500 mb-4">No influencer profile found</p>
                    <Button>Create Profile</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="proposals">
            <div className="space-y-4">
              {proposals.map((proposal) => (
                <Card key={proposal.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>
                          {proposal.campaign_name || "No Campaign Name"}
                        </CardTitle>
                        <CardDescription>
                          Brand: {proposal.brands?.company_name || "Unknown"}
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
                    {proposal.message && (
                      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{proposal.message}</p>
                      </div>
                    )}
                    {proposal.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleProposalAction(proposal.id, "accept")}
                          className="flex-1"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Accept
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleProposalAction(proposal.id, "reject")}
                          className="flex-1"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    )}
                    {proposal.status === "accepted" && (
                      <Button
                        onClick={() => {
                          // Navigate to chat room
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
                    No proposals received
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
                        <CardTitle>{campaign.brand_name || "Brand Name"}</CardTitle>
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
                          ${campaign.budget?.toLocaleString() || 0}
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

          <TabsContent value="insights">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Followers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Users className="w-12 h-12 text-primary" />
                    <div>
                      <p className="text-3xl font-bold">
                        {formatNumber(influencer?.followers || 0)}
                      </p>
                      <p className="text-sm text-gray-600">Total Followers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Average Engagement Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <TrendingUp className="w-12 h-12 text-primary" />
                    <div>
                      <p className="text-3xl font-bold">
                        {influencer?.engagement_rate || 0}%
                      </p>
                      <p className="text-sm text-gray-600">Average Engagement Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
}

