"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { generateInfluencerRecommendations } from "@/lib/openai"
import { createClient } from "@/lib/supabase/client"
import { formatNumber } from "@/lib/utils"
import { motion } from "framer-motion"
import { Search, Users, TrendingUp, Star, Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function HomePage() {
  const [productInput, setProductInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [influencers, setInfluencers] = useState<any[]>([])
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  // Keyword extraction function
  const extractKeywords = (text: string): { categories: string[]; platforms: string[] } => {
    const categoryKeywords: { [key: string]: string[] } = {
      beauty: ["beauty", "cosmetics", "makeup", "skincare", "cosmetic", "lipstick", "foundation", "eyeshadow", "mascara", "blush", "highlighter", "concealer", "primer", "serum", "toner", "essence", "cream", "lotion", "sunscreen", "beauty product", "beauty item"],
      fashion: ["fashion", "clothing", "clothes", "style", "outfit", "apparel", "fashion item", "dress", "top", "bottom", "dress", "skirt", "pants", "shirt", "t-shirt", "jacket", "coat", "shoes", "sneakers", "bag", "handbag", "accessory", "watch", "earrings", "necklace", "ring"],
      food: ["food", "restaurant", "cafe", "taste", "cooking", "meal", "food product", "beverage", "drink", "coffee", "tea", "wine", "beer", "dessert", "cake", "bread", "bakery"],
      travel: ["travel", "tourism", "vacation", "travel destination", "travel product", "travel package", "hotel", "resort", "pension", "guesthouse", "accommodation", "airline", "airplane", "train", "bus", "rental car", "passport", "visa", "international travel", "domestic travel"],
      tech: ["tech", "technology", "electronics", "appliance", "smartphone", "phone", "mobile phone", "iphone", "galaxy", "tablet", "laptop", "computer", "pc", "desktop", "monitor", "keyboard", "mouse", "earphones", "headphones", "speaker", "camera", "drone", "smartwatch", "wearable", "appliance", "refrigerator", "washing machine", "vacuum", "air conditioner", "heater", "rice cooker", "mixer", "coffee machine"],
      health: ["health", "fitness", "exercise", "diet", "gym", "yoga", "pilates", "running", "jogging", "walking", "hiking", "swimming", "bicycle", "bodybuilding", "crossfit", "supplement", "protein", "vitamin", "nutrition", "health food", "organic"],
      interior: ["interior", "home", "house", "deco", "furniture", "bed", "sofa", "chair", "desk", "bookshelf", "storage", "decoration", "lighting", "lamp", "light", "curtain", "blind", "carpet", "rug", "wallpaper", "flooring", "tile", "bathroom", "kitchen", "remodeling", "construction", "moving"],
      lifestyle: ["lifestyle", "daily", "life", "daily goods", "daily items", "bathroom goods", "kitchen goods", "cleaning goods", "detergent", "laundry detergent", "fabric softener", "toilet paper", "wet wipes", "tissue", "towel"],
    }

    const platformKeywords: { [key: string]: string[] } = {
      youtube: ["youtube", "youtuber", "yt", "youtube channel", "youtube creator", "youtube influencer"],
      instagram: ["instagram", "ig", "instagram influencer", "instagram creator", "influencer"],
      tiktok: ["tiktok", "tiktok creator", "tiktok influencer"],
      facebook: ["facebook", "fb", "facebook page", "facebook influencer"],
    }

    const textLower = text.toLowerCase()
    const categories: string[] = []
    const platforms: string[] = []

    // Extract categories
    Object.entries(categoryKeywords).forEach(([category, keywords]) => {
      if (keywords.some((keyword) => textLower.includes(keyword.toLowerCase()))) {
        if (!categories.includes(category)) {
          categories.push(category)
        }
      }
    })

    // Extract platforms
    Object.entries(platformKeywords).forEach(([platform, keywords]) => {
      if (keywords.some((keyword) => textLower.includes(keyword.toLowerCase()))) {
        if (!platforms.includes(platform)) {
          platforms.push(platform)
        }
      }
    })

    return { categories, platforms }
  }

  const handleSearch = async () => {
    if (!productInput.trim()) {
      toast({
        title: "Please enter a search term",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Extract keywords
      const { categories, platforms } = extractKeywords(productInput)

      // Get AI recommendations (skip if API key is not available)
      try {
        await generateInfluencerRecommendations(productInput)
      } catch (aiError: any) {
        console.warn("AI recommendation skipped:", aiError.message)
      }
      
      // Fetch influencer data from Supabase
      let data = null
      try {
        const { data: supabaseData, error } = await supabase
          .from("influencers")
          .select("*")
          .limit(12)
          .order("followers", { ascending: false })
        
        if (!error) {
          data = supabaseData
        }
      } catch (supabaseError) {
        console.warn("Supabase query error:", supabaseError)
        // Continue even if error occurs (use dummy data)
      }

      // Merge with dummy data (when Supabase has no data)
      const dummyData = [
        {
          id: "1",
          channel_name: "Beauty Creator",
          followers: 250000,
          engagement_rate: 4.5,
          rating: 4.8,
          categories: ["beauty", "lifestyle"],
          platforms: ["instagram", "youtube"],
          created_at: new Date().toISOString(),
        },
        {
          id: "2",
          channel_name: "Food Explorer",
          followers: 180000,
          engagement_rate: 5.2,
          rating: 4.9,
          categories: ["food", "travel"],
          platforms: ["instagram", "tiktok"],
          created_at: new Date().toISOString(),
        },
        {
          id: "3",
          channel_name: "Fashion Stylist",
          followers: 320000,
          engagement_rate: 3.8,
          rating: 4.7,
          categories: ["fashion", "lifestyle"],
          platforms: ["instagram", "youtube"],
          created_at: new Date().toISOString(),
        },
        {
          id: "4",
          channel_name: "Travel Blogger",
          followers: 150000,
          engagement_rate: 6.1,
          rating: 4.9,
          categories: ["travel", "food"],
          platforms: ["instagram", "youtube", "tiktok"],
          created_at: new Date().toISOString(),
        },
        {
          id: "5",
          channel_name: "Tech Reviewer",
          followers: 420000,
          engagement_rate: 3.2,
          rating: 4.6,
          categories: ["tech", "review"],
          platforms: ["youtube"],
          created_at: new Date().toISOString(),
        },
        {
          id: "6",
          channel_name: "Fitness Coach",
          followers: 280000,
          engagement_rate: 4.8,
          rating: 4.8,
          categories: ["health", "lifestyle"],
          platforms: ["instagram", "youtube"],
          created_at: new Date().toISOString(),
        },
        {
          id: "7",
          channel_name: "Home Decor Influencer",
          followers: 190000,
          engagement_rate: 5.5,
          rating: 4.9,
          categories: ["interior", "lifestyle"],
          platforms: ["instagram"],
          created_at: new Date().toISOString(),
        },
        {
          id: "8",
          channel_name: "Beauty Tutor",
          followers: 350000,
          engagement_rate: 4.2,
          rating: 4.7,
          categories: ["beauty", "tutorial"],
          platforms: ["youtube", "instagram"],
          created_at: new Date().toISOString(),
        },
      ]

      // Filtered dummy data
      let filteredData = dummyData
      if (categories.length > 0 || platforms.length > 0) {
        filteredData = dummyData.filter((inf) => {
          const hasCategory =
            categories.length === 0 ||
            categories.some((cat) => inf.categories?.includes(cat))
          const hasPlatform =
            platforms.length === 0 ||
            platforms.some((plat) => inf.platforms?.includes(plat))
          return hasCategory && hasPlatform
        })
      }

      const finalData = (data && data.length > 0 ? data : filteredData).slice(0, 12)
      setInfluencers(finalData)

      // Scroll to show search results
      setTimeout(() => {
        const resultsSection = document.getElementById("search-results")
        if (resultsSection) {
          resultsSection.scrollIntoView({ behavior: "smooth", block: "start" })
        }
      }, 100)
    } catch (error) {
      console.error("Error fetching influencers:", error)
      toast({
        title: "An error occurred",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-lg font-medium text-gray-900">Searching for influencers...</p>
            <p className="text-sm text-primary/80">Please wait a moment</p>
          </motion.div>
        </div>
      )}
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center space-y-6"
          >
            <h1 className="text-5xl font-bold text-gray-900">
              Find the Perfect
              <br />
              <span className="text-primary">Influencer for Your Brand</span>
            </h1>
            <p className="text-xl text-primary/80">
              Connect with influencers that match your brand quickly and easily
            </p>

            {/* Prompt input area */}
            <div className="max-w-2xl mx-auto mt-8 space-y-4">
              <div className="flex gap-3 items-center bg-white rounded-2xl px-4 py-3 border border-primary/30">
                <input
                  type="text"
                  placeholder="e.g., Need a YouTuber for new cosmetics product launch"
                  value={productInput}
                  onChange={(e) => setProductInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1 h-auto text-base bg-white border-0 text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button
                  onClick={handleSearch}
                  disabled={loading}
                  size="icon"
                  variant="ghost"
                  className="h-10 w-10 rounded-xl text-primary hover:bg-primary/10 flex-shrink-0"
                >
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
              
              {/* Prompt suggestions */}
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  "Beauty Products",
                  "Fashion Brand",
                  "Food Promotion",
                  "Travel Products",
                  "Tech Products",
                  "Lifestyle",
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => setProductInput(prompt)}
                    className="px-4 py-2 text-sm text-primary/80 bg-white border border-gray-200 rounded-full hover:bg-primary/5 hover:border-primary transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* Search Results Section */}
        {influencers.length > 0 && (
          <section id="search-results" className="container mx-auto px-6 py-16">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Recommended Influencers
                </h2>
                <p className="text-primary/80">
                  Found {influencers.length} influencers matching your search
                </p>
              </motion.div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {influencers.map((influencer, index) => (
                  <motion.div
                    key={influencer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  >
                    <Card className="hover:shadow-md transition-all duration-200 h-full flex flex-col border-gray-200 bg-white rounded-2xl overflow-hidden">
                      <CardHeader className="pb-4">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <Users className="w-7 h-7 text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base font-semibold truncate mb-1 text-gray-900">
                              {influencer.channel_name || "Channel Name"}
                            </CardTitle>
                            <CardDescription className="text-sm text-primary/70 truncate">
                              {formatNumber(influencer.followers || 0)} followers
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col pt-0">
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <TrendingUp className="w-4 h-4 text-primary/60" />
                            <span className="text-primary/80">Engagement {influencer.engagement_rate || 0}%</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Star className="w-4 h-4 text-primary/60" />
                            <span className="text-primary/80">Rating {influencer.rating || 0}</span>
                          </div>
                        </div>
                        {influencer.categories && influencer.categories.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-6">
                            {influencer.categories.slice(0, 2).map((category: string) => (
                              <span
                                key={category}
                                className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
                              >
                                {category}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex flex-col sm:flex-row gap-2 mt-auto pt-4 border-t border-gray-100">
                          <Link href={`/influencer/${influencer.id}`} className="flex-1">
                            <Button variant="ghost" className="w-full text-primary hover:bg-primary/5 hover:text-primary">
                              View Details
                            </Button>
                          </Link>
                          <Button className="flex-1 bg-primary hover:bg-primary/90 text-white">Contact</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Features Section */}
        <section className="container mx-auto px-6 py-16 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Features of inbridge.ai
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <Sparkles className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>AI-Powered Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-primary/80">
                    Enter your product information and AI will recommend the best influencers for you
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Users className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>All-in-One Platform</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-primary/80">
                    Handle everything from proposals to chat, contracts, and payments in one place
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <TrendingUp className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>Performance Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-primary/80">
                    Analyze campaign performance in real-time and get AI-powered reports
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
