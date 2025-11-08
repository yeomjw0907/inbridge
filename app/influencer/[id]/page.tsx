"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { formatNumber } from "@/lib/utils"
import { generateInfluencerInsight } from "@/lib/openai"
import { motion } from "framer-motion"
import { 
  Users, 
  TrendingUp, 
  Star, 
  Instagram, 
  Youtube, 
  Music, 
  MessageCircle, 
  ExternalLink, 
  Copy, 
  Facebook,
  Sparkles,
  Eye,
  Loader2
} from "lucide-react"
import { ProposalModal } from "@/components/ProposalModal"
import Link from "next/link"
import { Line, Doughnut, Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

export default function InfluencerDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [influencer, setInfluencer] = useState<any>(null)
  const [contents, setContents] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false)
  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false)
  const [isInsightModalOpen, setIsInsightModalOpen] = useState(false)
  const [aiInsight, setAiInsight] = useState<string>("")
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false)
  const [followerPeriod, setFollowerPeriod] = useState<"daily" | "monthly" | "yearly">("monthly")
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all")
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch influencer data
        let influencerData = null
        try {
          const { data, error } = await supabase
            .from("influencers")
            .select("*")
            .eq("id", id)
            .single()
          
          if (!error && data) {
            influencerData = data
          }
        } catch (supabaseError) {
          console.warn("Supabase query error:", supabaseError)
        }

        // Dummy data (when Supabase has no data)
        if (!influencerData) {
          const dummyInfluencers: any = {
            "1": {
              id: "1",
              channel_name: "Beauty Creator",
              name: "Beauty Creator",
              followers: 250000,
              engagement_rate: 4.5,
              growth_rate: 12.5,
              rating: 4.8,
              categories: ["beauty", "lifestyle"],
              platforms: ["instagram", "youtube"],
              profile_image: null,
              bio: "A creator who loves beauty and lifestyle. Provides various makeup tutorials and product reviews.",
              total_deals: 45,
              gender_ratio: { male: 0.35, female: 0.65 },
              age_ratio: { "20-29": 0.35, "30-39": 0.45, "40+": 0.2 },
              created_at: new Date().toISOString(),
            },
            "2": {
              id: "2",
              channel_name: "Food Explorer",
              name: "Food Explorer",
              followers: 180000,
              engagement_rate: 5.2,
              growth_rate: 15.3,
              rating: 4.9,
              categories: ["food", "travel"],
              platforms: ["instagram", "tiktok"],
              profile_image: null,
              bio: "A food creator who travels around the country to find great restaurants. Introduces hidden gems and popular spots.",
              total_deals: 32,
              gender_ratio: { male: 0.4, female: 0.6 },
              age_ratio: { "20-29": 0.4, "30-39": 0.35, "40+": 0.25 },
              created_at: new Date().toISOString(),
            },
            "3": {
              id: "3",
              channel_name: "Fashion Stylist",
              name: "Fashion Stylist",
              followers: 320000,
              engagement_rate: 3.8,
              growth_rate: 8.2,
              rating: 4.7,
              categories: ["fashion", "lifestyle"],
              platforms: ["instagram", "youtube"],
              profile_image: null,
              bio: "A fashion influencer who shares trendy fashion styling and outfit tips.",
              total_deals: 58,
              gender_ratio: { male: 0.25, female: 0.75 },
              age_ratio: { "20-29": 0.5, "30-39": 0.3, "40+": 0.2 },
              created_at: new Date().toISOString(),
            },
            "4": {
              id: "4",
              channel_name: "Travel Blogger",
              name: "Travel Blogger",
              followers: 150000,
              engagement_rate: 6.1,
              growth_rate: 18.7,
              rating: 4.9,
              categories: ["travel", "food"],
              platforms: ["instagram", "youtube", "tiktok"],
              profile_image: null,
              bio: "A travel expert creator who shares domestic and international travel information and tips.",
              total_deals: 28,
              gender_ratio: { male: 0.45, female: 0.55 },
              age_ratio: { "20-29": 0.3, "30-39": 0.4, "40+": 0.3 },
              created_at: new Date().toISOString(),
            },
            "5": {
              id: "5",
              channel_name: "Tech Reviewer",
              name: "Tech Reviewer",
              followers: 420000,
              engagement_rate: 3.2,
              growth_rate: 10.5,
              rating: 4.6,
              categories: ["tech", "review"],
              platforms: ["youtube"],
              profile_image: null,
              bio: "A tech expert who provides in-depth reviews of the latest technology products.",
              total_deals: 67,
              gender_ratio: { male: 0.7, female: 0.3 },
              age_ratio: { "20-29": 0.25, "30-39": 0.5, "40+": 0.25 },
              created_at: new Date().toISOString(),
            },
            "6": {
              id: "6",
              channel_name: "Fitness Coach",
              name: "Fitness Coach",
              followers: 280000,
              engagement_rate: 4.8,
              growth_rate: 14.2,
              rating: 4.8,
              categories: ["health", "lifestyle"],
              platforms: ["instagram", "youtube"],
              profile_image: null,
              bio: "A fitness expert who shares healthy lifestyle and workout routines.",
              total_deals: 41,
              gender_ratio: { male: 0.5, female: 0.5 },
              age_ratio: { "20-29": 0.3, "30-39": 0.45, "40+": 0.25 },
              created_at: new Date().toISOString(),
            },
            "7": {
              id: "7",
              channel_name: "Home Decor Influencer",
              name: "Home Decor Influencer",
              followers: 190000,
              engagement_rate: 5.5,
              growth_rate: 16.8,
              rating: 4.9,
              categories: ["interior", "lifestyle"],
              platforms: ["instagram"],
              profile_image: null,
              bio: "An interior design expert who introduces cozy interior design and home styling.",
              total_deals: 35,
              gender_ratio: { male: 0.2, female: 0.8 },
              age_ratio: { "20-29": 0.25, "30-39": 0.5, "40+": 0.25 },
              created_at: new Date().toISOString(),
            },
            "8": {
              id: "8",
              channel_name: "Beauty Tutor",
              name: "Beauty Tutor",
              followers: 350000,
              engagement_rate: 4.2,
              growth_rate: 11.3,
              rating: 4.7,
              categories: ["beauty", "tutorial"],
              platforms: ["youtube", "instagram"],
              profile_image: null,
              bio: "A beauty expert who provides makeup tutorials that even beginners can follow.",
              total_deals: 52,
              gender_ratio: { male: 0.1, female: 0.9 },
              age_ratio: { "20-29": 0.45, "30-39": 0.4, "40+": 0.15 },
              created_at: new Date().toISOString(),
            },
          }
          setInfluencer(dummyInfluencers[id] || null)
        } else {
          setInfluencer(influencerData)
        }

        // Fetch content data
        let contentData = null
        try {
          const { data, error } = await supabase
            .from("influencer_contents")
            .select("*")
            .eq("influencer_id", id)
            .order("created_at", { ascending: false })
            .limit(12)
          
          if (!error && data) {
            contentData = data
          }
        } catch (supabaseError) {
          console.warn("Supabase content query error:", supabaseError)
        }

        // Dummy content data
        if (!contentData || contentData.length === 0) {
          const dummyContents = [
            {
              id: "1",
              influencer_id: id,
              title: "Spring Makeup Tutorial",
              thumbnail: "https://via.placeholder.com/400x225?text=Content+1",
              views: 125000,
              platform: "youtube",
              content_url: "https://youtube.com/watch?v=1",
              created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
              id: "2",
              influencer_id: id,
              title: "New Product Review - Foundation",
              thumbnail: "https://via.placeholder.com/400x225?text=Content+2",
              views: 98000,
              platform: "instagram",
              content_url: "https://instagram.com/p/1",
              created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
              id: "3",
              influencer_id: id,
              title: "Daily Vlog",
              thumbnail: "https://via.placeholder.com/400x225?text=Content+3",
              views: 156000,
              platform: "youtube",
              content_url: "https://youtube.com/watch?v=3",
              created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
              id: "4",
              influencer_id: id,
              title: "Product Unboxing",
              thumbnail: "https://via.placeholder.com/400x225?text=Content+4",
              views: 87000,
              platform: "tiktok",
              content_url: "https://tiktok.com/@user/video/1",
              created_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
              id: "5",
              influencer_id: id,
              title: "Makeup Tips & Tricks",
              thumbnail: "https://via.placeholder.com/400x225?text=Content+5",
              views: 203000,
              platform: "youtube",
              content_url: "https://youtube.com/watch?v=5",
              created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
              id: "6",
              influencer_id: id,
              title: "Skincare Routine Share",
              thumbnail: "https://via.placeholder.com/400x225?text=Content+6",
              views: 142000,
              platform: "instagram",
              content_url: "https://instagram.com/p/6",
              created_at: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString(),
            },
          ]
          setContents(dummyContents)
        } else {
          setContents(contentData)
        }

        // Fetch campaign history
        let campaignData = null
        try {
          const { data, error } = await supabase
            .from("campaign_history")
            .select("*")
            .eq("influencer_id", id)
            .order("created_at", { ascending: false })
          
          if (!error && data) {
            campaignData = data
          }
        } catch (supabaseError) {
          console.warn("Supabase campaign query error:", supabaseError)
        }

        // 더미 캠페인 데이터
        const dummyCampaigns = [
          {
            id: "1",
            influencer_id: id,
            brand_id: "brand-1",
            campaign_name: "봄 신제품 런칭 캠페인",
            brand_name: "패션 브랜드 A",
            start_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            end_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: "completed",
            reach: 150000,
            engagement: 4.2,
            engagement_rate: 4.2,
            budget: 5000000,
            is_private: false,
            ai_summary: "이번 캠페인은 예상보다 높은 참여율을 보였습니다. 타겟 오디언스의 반응이 매우 긍정적이며, 브랜드 인지도 향상에 기여했습니다.",
            brand_feedback: "매우 만족스러운 결과였습니다.",
          },
          {
            id: "2",
            influencer_id: id,
            brand_id: "brand-2",
            campaign_name: "신제품 체험단",
            brand_name: "뷰티 브랜드 B",
            start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: "ongoing",
            reach: 200000,
            engagement: 5.1,
            engagement_rate: 5.1,
            budget: 8000000,
            is_private: false,
            ai_summary: "현재 진행 중인 캠페인으로, 초기 성과가 기대치를 상회하고 있습니다.",
            brand_feedback: null,
          },
          {
            id: "3",
            influencer_id: id,
            brand_id: "brand-3",
            campaign_name: "비공개 캠페인",
            brand_name: "라이프스타일 브랜드 C",
            start_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
            end_date: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(),
            status: "private",
            reach: 0,
            engagement: 0,
            engagement_rate: 0,
            budget: 6000000,
            is_private: true,
            ai_summary: null,
            brand_feedback: null,
          },
        ]

        setCampaigns(campaignData && campaignData.length > 0 ? campaignData : dummyCampaigns)
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
  }, [id, supabase])

  const handleGenerateInsight = async () => {
    if (!influencer) return

    setIsGeneratingInsight(true)
    setIsInsightModalOpen(true)
    setAiInsight("")

    try {
      const insight = await generateInfluencerInsight({
        name: influencer.channel_name || influencer.name || "Influencer",
        followers: influencer.followers || 0,
        category: influencer.categories || [],
        engagement_rate: influencer.engagement_rate || 0,
        growth_rate: influencer.growth_rate,
        platforms: influencer.platforms || [],
        total_deals: influencer.total_deals,
        rating: influencer.rating,
      })
      setAiInsight(insight || "")
    } catch (error: any) {
      console.error("Error generating insight:", error)
      setAiInsight("An error occurred while generating AI insight. Please check your API key.")
      toast({
        title: "AI Insight Generation Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingInsight(false)
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "instagram":
        return <Instagram className="w-4 h-4" />
      case "youtube":
        return <Youtube className="w-4 h-4" />
      case "tiktok":
        return <Music className="w-4 h-4" />
      case "facebook":
        return <Facebook className="w-4 h-4" />
      default:
        return <ExternalLink className="w-4 h-4" />
    }
  }

  if (!influencer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-primary/80">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      <Header />
      <main className="flex-1 container mx-auto px-6 py-8 max-w-7xl">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-white border-gray-100 rounded-2xl shadow-sm">
            <CardHeader>
              <div className="flex items-start gap-6 flex-wrap">
                {/* Profile image */}
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {influencer.profile_image ? (
                    <Image
                      src={influencer.profile_image}
                      alt={influencer.channel_name || influencer.name}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Users className="w-12 h-12 text-gray-400" />
                  )}
                </div>

                {/* Profile information */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-4 mb-2 flex-wrap">
                    <CardTitle className="text-3xl text-gray-900">
                      {influencer.channel_name || influencer.name || "Channel Name"}
                    </CardTitle>
                    <div className="flex gap-2 items-center">
                      {influencer?.platforms?.includes("instagram") && (
                        <button
                          onClick={() => setIsChannelModalOpen(true)}
                          className="hover:opacity-70 transition-opacity"
                        >
                          <Instagram className="w-6 h-6 text-gray-400" />
                        </button>
                      )}
                      {influencer?.platforms?.includes("youtube") && (
                        <button
                          onClick={() => setIsChannelModalOpen(true)}
                          className="hover:opacity-70 transition-opacity"
                        >
                          <Youtube className="w-6 h-6 text-gray-400" />
                        </button>
                      )}
                      {influencer?.platforms?.includes("tiktok") && (
                        <button
                          onClick={() => setIsChannelModalOpen(true)}
                          className="hover:opacity-70 transition-opacity"
                        >
                          <Music className="w-6 h-6 text-gray-400" />
                        </button>
                      )}
                      {influencer?.platforms?.includes("facebook") && (
                        <button
                          onClick={() => setIsChannelModalOpen(true)}
                          className="hover:opacity-70 transition-opacity"
                        >
                          <Facebook className="w-6 h-6 text-gray-400" />
                        </button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsChannelModalOpen(true)}
                        className="text-primary hover:bg-primary/5"
                      >
                        Channel Shortcut
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="text-lg text-primary/70 mb-2">
                    {formatNumber(influencer.followers || 0)} followers
                  </CardDescription>
                  {influencer.bio && (
                    <p className="text-sm text-primary/80 mt-3 leading-relaxed mb-4">
                      {influencer.bio}
                    </p>
                  )}
                  <div className="flex items-center gap-6 mb-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary/60" />
                      <span className="text-sm text-primary/80">
                        Total Deals {influencer.total_deals || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-primary/60" />
                      <span className="text-sm text-primary/80">
                        Rating {influencer.rating || 0}/5.0
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    <Button 
                      onClick={() => setIsProposalModalOpen(true)} 
                      size="lg" 
                      className="bg-[#0066FF] hover:bg-[#0055DD] text-white rounded-xl"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Contact
                    </Button>
                    <Button 
                      onClick={handleGenerateInsight} 
                      size="lg" 
                      variant="outline"
                      className="border-primary text-primary hover:bg-primary/5 rounded-xl"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      View AI Insight Summary
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="content" className="space-y-6">
          <TabsList className="bg-gray-100 rounded-xl">
            <TabsTrigger value="content" className="rounded-lg">Content</TabsTrigger>
            <TabsTrigger value="insights" className="rounded-lg">Insights</TabsTrigger>
            <TabsTrigger value="campaigns" className="rounded-lg">Campaign History</TabsTrigger>
          </TabsList>

          {/* Content tab */}
          <TabsContent value="content">
            <Card className="bg-white border-gray-100 rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900">Featured Content</CardTitle>
                <CardDescription className="text-primary/80">
                  Check out the influencer's representative content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {contents?.map((content) => (
                    <motion.div
                      key={content?.id}
                      whileHover={{ scale: 1.02 }}
                      className="group relative"
                    >
                      <Card className="overflow-hidden border-gray-200 hover:shadow-md transition-all cursor-pointer h-full">
                        <div className="aspect-video bg-gray-100 relative overflow-hidden">
                          {content?.thumbnail ? (
                            <Image
                              src={content?.thumbnail}
                              alt={content?.title || ""}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              className="object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Eye className="w-12 h-12 text-gray-300" />
                            </div>
                          )}
                          <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded-full p-1.5 text-white">
                            {getPlatformIcon(content?.platform || "")}
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                            {content?.title || ""}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-primary/70">
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              <span>{formatNumber(content?.views || 0)}</span>
                            </div>
                            <span className="capitalize">{content?.platform || ""}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full mt-3 text-primary hover:bg-primary/5"
                            onClick={() => window.open(content?.content_url || "#", "_blank")}
                          >
                            View Content
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
                {(!contents || contents.length === 0) && (
                  <div className="text-center py-12 text-primary/60">
                    No content available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights tab */}
          <TabsContent value="insights">
            <div className="space-y-6">
              {/* Statistics cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white border-gray-100 rounded-2xl shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-primary/70">Average Engagement Rate</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {influencer.engagement_rate || 0}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border-gray-100 rounded-2xl shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-primary/70">Growth Rate</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {influencer.growth_rate || 0}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border-gray-100 rounded-2xl shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Eye className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-primary/70">Average Reach</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatNumber(Math.floor((influencer.followers || 0) * 0.15))}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Platform selection */}
              <Card className="bg-white border-gray-100 rounded-2xl shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPlatform("all")}
                      className={
                        selectedPlatform === "all"
                          ? "bg-primary text-white border-primary hover:bg-primary/90"
                          : "border-gray-300 text-gray-700 bg-transparent hover:bg-gray-50"
                      }
                    >
                      All
                    </Button>
                    {influencer?.platforms?.includes("instagram") && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPlatform("instagram")}
                        className={
                          selectedPlatform === "instagram"
                            ? "bg-primary text-white border-primary hover:bg-primary/90"
                            : "border-gray-300 text-gray-700 bg-transparent hover:bg-gray-50"
                        }
                      >
                        Instagram
                      </Button>
                    )}
                    {influencer?.platforms?.includes("youtube") && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPlatform("youtube")}
                        className={
                          selectedPlatform === "youtube"
                            ? "bg-primary text-white border-primary hover:bg-primary/90"
                            : "border-gray-300 text-gray-700 bg-transparent hover:bg-gray-50"
                        }
                      >
                        YouTube
                      </Button>
                    )}
                    {influencer?.platforms?.includes("tiktok") && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPlatform("tiktok")}
                        className={
                          selectedPlatform === "tiktok"
                            ? "bg-primary text-white border-primary hover:bg-primary/90"
                            : "border-gray-300 text-gray-700 bg-transparent hover:bg-gray-50"
                        }
                      >
                        TikTok
                      </Button>
                    )}
                    {influencer?.platforms?.includes("facebook") && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPlatform("facebook")}
                        className={
                          selectedPlatform === "facebook"
                            ? "bg-primary text-white border-primary hover:bg-primary/90"
                            : "border-gray-300 text-gray-700 bg-transparent hover:bg-gray-50"
                        }
                      >
                        Facebook
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Follower trend */}
                <Card className="bg-white border-gray-100 rounded-2xl shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-gray-900">Follower Trend</CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant={followerPeriod === "daily" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setFollowerPeriod("daily")}
                          className={`text-xs h-7 ${followerPeriod === "daily" ? "bg-primary text-white" : ""}`}
                        >
                          Daily
                        </Button>
                        <Button
                          variant={followerPeriod === "monthly" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setFollowerPeriod("monthly")}
                          className={`text-xs h-7 ${followerPeriod === "monthly" ? "bg-primary text-white" : ""}`}
                        >
                          Monthly
                        </Button>
                        <Button
                          variant={followerPeriod === "yearly" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setFollowerPeriod("yearly")}
                          className={`text-xs h-7 ${followerPeriod === "yearly" ? "bg-primary text-white" : ""}`}
                        >
                          Yearly
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <Line
                        data={{
                          labels:
                            followerPeriod === "daily"
                              ? Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`)
                              : followerPeriod === "monthly"
                              ? ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                              : ["2021", "2022", "2023", "2024"],
                          datasets: [
                            {
                              label: "Followers",
                              data:
                                followerPeriod === "daily"
                                  ? Array.from({ length: 30 }, (_, i) =>
                                      Math.floor((influencer.followers || 0) * (0.7 + (i / 30) * 0.3))
                                    )
                                  : followerPeriod === "monthly"
                                  ? Array.from({ length: 12 }, (_, i) =>
                                      Math.floor((influencer.followers || 0) * (0.6 + (i / 12) * 0.4))
                                    )
                                  : [
                                      Math.floor((influencer.followers || 0) * 0.3),
                                      Math.floor((influencer.followers || 0) * 0.5),
                                      Math.floor((influencer.followers || 0) * 0.7),
                                      influencer.followers || 0,
                                    ],
                              borderColor: "#0066FF",
                              backgroundColor: "rgba(0, 102, 255, 0.1)",
                              tension: 0.4,
                              fill: true,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              display: false,
                            },
                          },
                          scales: {
                            y: {
                              beginAtZero: false,
                              ticks: {
                                color: "rgba(0, 102, 255, 0.7)",
                              },
                              grid: {
                                color: "rgba(0, 102, 255, 0.1)",
                              },
                            },
                            x: {
                              ticks: {
                                color: "rgba(0, 102, 255, 0.7)",
                              },
                              grid: {
                                color: "rgba(0, 102, 255, 0.1)",
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Gender & Age Ratio */}
                <Card className="bg-white border-gray-100 rounded-2xl shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-gray-900">Gender & Age Ratio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="h-48">
                        <Doughnut
                          data={{
                            labels: ["Female", "Male"],
                            datasets: [
                              {
                                data: [
                                  (influencer.gender_ratio?.female || 0.6) * 100,
                                  (influencer.gender_ratio?.male || 0.4) * 100,
                                ],
                                backgroundColor: ["#0066FF", "rgba(0, 102, 255, 0.5)"],
                                borderWidth: 0,
                              },
                            ],
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: "bottom",
                                labels: {
                                  color: "rgba(0, 102, 255, 0.8)",
                                  padding: 15,
                                },
                              },
                            },
                          }}
                        />
                      </div>
                      <div className="h-48">
                        <Bar
                          data={{
                            labels: ["20-29", "30-39", "40-49", "50+"],
                            datasets: [
                              {
                                label: "Ratio",
                                data: [
                                  (influencer.age_ratio?.["20-29"] || 0.35) * 100,
                                  (influencer.age_ratio?.["30-39"] || 0.45) * 100,
                                  (influencer.age_ratio?.["40+"] || 0.2) * 100,
                                  0,
                                ],
                                backgroundColor: "#0066FF",
                              },
                            ],
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            indexAxis: "y",
                            plugins: {
                              legend: {
                                display: false,
                              },
                            },
                            scales: {
                              x: {
                                beginAtZero: true,
                                max: 50,
                                ticks: {
                                  color: "rgba(0, 102, 255, 0.7)",
                                },
                                grid: {
                                  color: "rgba(0, 102, 255, 0.1)",
                                },
                              },
                              y: {
                                ticks: {
                                  color: "rgba(0, 102, 255, 0.7)",
                                },
                                grid: {
                                  color: "rgba(0, 102, 255, 0.1)",
                                },
                              },
                            },
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Campaign History tab */}
          <TabsContent value="campaigns">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns?.map((campaign) => {
                const isPrivate = campaign?.status === "private" || campaign?.is_private
                return (
                  <Link key={campaign?.id} href={`/campaign/${campaign?.id || ""}`}>
                    <motion.div whileHover={{ scale: 1.02 }}>
                      <Card className={`h-full hover:shadow-lg transition-all cursor-pointer bg-white border-gray-100 rounded-2xl ${isPrivate ? "relative overflow-hidden" : ""}`}>
                        {isPrivate && (
                          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
                            <div className="text-center">
                              <p className="text-lg font-semibold text-gray-700 mb-2">Private</p>
                              <p className="text-sm text-primary/70">This campaign is private</p>
                            </div>
                          </div>
                        )}
                        <CardHeader>
                          <div className="flex items-center justify-between mb-2">
                            <CardTitle className="text-lg text-gray-900">
                              {campaign?.campaign_name || campaign?.brand_name || "Brand Name"}
                            </CardTitle>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                campaign?.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : campaign?.status === "ongoing"
                                  ? "bg-primary/10 text-primary"
                                  : campaign?.status === "private"
                                  ? "bg-gray-100 text-gray-600"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {campaign?.status === "completed"
                                ? "Completed"
                                : campaign?.status === "ongoing"
                                ? "Ongoing"
                                : campaign?.status === "private"
                                ? "Private"
                                : "Pending"}
                            </span>
                          </div>
                          <CardDescription className="text-sm text-primary/70">
                            {campaign?.brand_name && `${campaign.brand_name} · `}
                            {campaign?.start_date && new Date(campaign.start_date).toLocaleDateString("en-US")} -{" "}
                            {campaign?.end_date && new Date(campaign.end_date).toLocaleDateString("en-US")}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className={isPrivate ? "blur-sm" : ""}>
                          <div className="grid grid-cols-3 gap-3 mb-4">
                            <div>
                              <p className="text-xs text-primary/70 mb-1">Reach</p>
                              <p className="text-base font-semibold text-gray-900">
                                {formatNumber(campaign?.reach || 0)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-primary/70 mb-1">Engagement</p>
                              <p className="text-base font-semibold text-gray-900">
                                {(campaign?.engagement_rate || campaign?.engagement || 0).toFixed(1)}%
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-primary/70 mb-1">Budget</p>
                              <p className="text-base font-semibold text-gray-900">
                                ${campaign?.budget?.toLocaleString() || 0}
                              </p>
                            </div>
                          </div>
                          {campaign?.ai_summary && (
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                              <p className="text-xs text-primary/80 line-clamp-2">
                                {campaign.ai_summary}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Link>
                )
              })}
              {(!campaigns || campaigns.length === 0) && (
                <Card className="col-span-full bg-white border-gray-100 rounded-2xl">
                  <CardContent className="py-12 text-center text-primary/60">
                    No campaign history
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />

      {/* Proposal modal */}
      <ProposalModal
        open={isProposalModalOpen}
        onOpenChange={setIsProposalModalOpen}
        influencerId={id}
      />

      {/* Channel shortcut modal */}
      <Dialog open={isChannelModalOpen} onOpenChange={setIsChannelModalOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Channel Shortcut</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {influencer?.platforms?.includes("instagram") && (
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Instagram className="w-6 h-6 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Instagram</p>
                    <p className="text-sm text-primary/70">@{influencer?.channel_name || "channel"}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const url = `https://instagram.com/${influencer?.channel_name || "channel"}`
                      window.open(url, "_blank")
                    }}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const url = `https://instagram.com/${influencer?.channel_name || "channel"}`
                      navigator.clipboard.writeText(url)
                      toast({
                        title: "Link copied",
                      })
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
            {influencer.platforms?.includes("youtube") && (
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Youtube className="w-6 h-6 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">YouTube</p>
                    <p className="text-sm text-primary/70">{influencer?.channel_name || "Channel Name"}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const url = `https://youtube.com/@${influencer?.channel_name || "channel"}`
                      window.open(url, "_blank")
                    }}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const url = `https://youtube.com/@${influencer?.channel_name || "channel"}`
                      navigator.clipboard.writeText(url)
                      toast({
                        title: "Link copied",
                      })
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
            {influencer?.platforms?.includes("tiktok") && (
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Music className="w-6 h-6 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">TikTok</p>
                    <p className="text-sm text-primary/70">@{influencer?.channel_name || "channel"}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const url = `https://tiktok.com/@${influencer?.channel_name || "channel"}`
                      window.open(url, "_blank")
                    }}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const url = `https://tiktok.com/@${influencer?.channel_name || "channel"}`
                      navigator.clipboard.writeText(url)
                      toast({
                        title: "Link copied",
                      })
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
            {influencer.platforms?.includes("facebook") && (
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Facebook className="w-6 h-6 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Facebook</p>
                    <p className="text-sm text-primary/70">{influencer?.channel_name || "Channel Name"}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const url = `https://facebook.com/${influencer?.channel_name || "channel"}`
                      window.open(url, "_blank")
                    }}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const url = `https://facebook.com/${influencer?.channel_name || "channel"}`
                      navigator.clipboard.writeText(url)
                      toast({
                        title: "Link copied",
                      })
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Insight modal */}
      <Dialog open={isInsightModalOpen} onOpenChange={setIsInsightModalOpen}>
        <DialogContent className="sm:max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              AI Insight Summary
            </DialogTitle>
            <DialogDescription className="text-primary/80">
              AI summary analyzing the influencer's data
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {isGeneratingInsight ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-primary/80">AI is generating insights...</p>
              </div>
            ) : aiInsight ? (
              <div className="p-6 bg-gray-50 rounded-xl">
                <p className="text-primary/90 leading-relaxed whitespace-pre-wrap">
                  {aiInsight}
                </p>
              </div>
            ) : (
              <div className="p-6 bg-gray-50 rounded-xl text-center text-primary/60">
                Unable to generate insights
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
