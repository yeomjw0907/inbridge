"use client"

import { useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Users, Building2, Loader2 } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const [role, setRole] = useState<"influencer" | "brand">("influencer")
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  // Influencer form state
  const [infName, setInfName] = useState("")
  const [infEmail, setInfEmail] = useState("")
  const [infPassword, setInfPassword] = useState("")
  const [infProfileImage, setInfProfileImage] = useState<File | null>(null)
  const [infLocation, setInfLocation] = useState("")
  const [infPlatforms, setInfPlatforms] = useState<string[]>([])
  const [infChannelUrl, setInfChannelUrl] = useState("")
  const [infFollowers, setInfFollowers] = useState("")
  const [infCategory, setInfCategory] = useState<string[]>([])
  const [infCollabType, setInfCollabType] = useState<string[]>([])
  const [infPricePerPost, setInfPricePerPost] = useState("")
  const [infBio, setInfBio] = useState("")

  // Brand form state
  const [brandManagerName, setBrandManagerName] = useState("")
  const [brandEmail, setBrandEmail] = useState("")
  const [brandPassword, setBrandPassword] = useState("")
  const [brandCompanyName, setBrandCompanyName] = useState("")
  const [brandWebsite, setBrandWebsite] = useState("")
  const [brandPhone, setBrandPhone] = useState("")
  const [brandIndustry, setBrandIndustry] = useState("")
  const [brandCampaignGoal, setBrandCampaignGoal] = useState<string[]>([])
  const [brandBudgetRange, setBrandBudgetRange] = useState("")
  const [brandPreferredPlatforms, setBrandPreferredPlatforms] = useState<string[]>([])

  const handlePlatformToggle = useCallback((platform: string, isInfluencer: boolean) => {
    if (isInfluencer) {
      setInfPlatforms((prev) =>
        prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
      )
    } else {
      setBrandPreferredPlatforms((prev) =>
        prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
      )
    }
  }, [])

  const handleCategoryToggle = useCallback((category: string) => {
    setInfCategory((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    )
  }, [])

  const handleCollabTypeToggle = useCallback((type: string) => {
    setInfCollabType((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }, [])

  const handleCampaignGoalToggle = useCallback((goal: string) => {
    setBrandCampaignGoal((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    )
  }, [])

  const uploadProfileImage = useCallback(async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `profiles/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file)

      if (uploadError) {
        console.warn("Image upload error:", uploadError)
        return null
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath)
      return data.publicUrl
    } catch (error) {
      console.warn("Image upload error:", error)
      return null
    }
  }, [supabase])

  const signupInfluencer = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!infName || !infEmail || !infPassword || !infChannelUrl || !infFollowers) {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (infPlatforms.length === 0) {
      toast({
        title: "Please select main platforms",
        variant: "destructive",
      })
      return
    }

    if (infCategory.length === 0) {
      toast({
        title: "Please select main categories",
        variant: "destructive",
      })
      return
    }

    if (infCollabType.length === 0) {
      toast({
        title: "Please select preferred collaboration types",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // 1. Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: infEmail,
        password: infPassword,
      })

      if (authError) throw authError
      if (!authData.user) throw new Error("User creation failed")

      // 2. Upload profile image
      let profileImageUrl: string | null = null
      if (infProfileImage) {
        profileImageUrl = await uploadProfileImage(infProfileImage)
      }

      // 3. Save data to profiles table (or use users + influencers tables if profiles doesn't exist)
      try {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: authData.user.id,
          role: "influencer",
          name: infName,
          email: infEmail,
          profile_image: profileImageUrl,
          location: infLocation || null,
          platforms: infPlatforms,
          channel_url: infChannelUrl,
          followers: parseInt(infFollowers) || 0,
          category: infCategory,
          collab_type: infCollabType,
          price_per_post: infPricePerPost ? parseFloat(infPricePerPost) : null,
          bio: infBio || null,
        })

        if (profileError) throw profileError
      } catch (profileError: any) {
        // Use existing table structure if profiles table doesn't exist
        const { error: userError } = await supabase.from("users").insert({
          id: authData.user.id,
          email: infEmail,
          role: "influencer",
        })

        if (userError) throw userError

        const { error: influencerError } = await supabase.from("influencers").insert({
          user_id: authData.user.id,
          channel_name: infName,
          followers: parseInt(infFollowers) || 0,
          categories: infCategory,
          platforms: infPlatforms,
        })

        if (influencerError) throw influencerError
      }

      toast({
        title: "Sign up completed ✅",
        description: "Redirecting to influencer dashboard",
      })

      // 4. Redirect
      router.push("/mypage")
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const signupBrand = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!brandManagerName || !brandEmail || !brandPassword || !brandCompanyName || !brandPhone || !brandIndustry) {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // 1. Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: brandEmail,
        password: brandPassword,
      })

      if (authError) throw authError
      if (!authData.user) throw new Error("User creation failed")

      // 2. Save data to profiles table (or use users + brands tables if profiles doesn't exist)
      try {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: authData.user.id,
          role: "brand",
          name: brandManagerName,
          email: brandEmail,
          company_name: brandCompanyName,
          website: brandWebsite || null,
          phone: brandPhone,
          industry: brandIndustry,
          campaign_goal: brandCampaignGoal.length > 0 ? brandCampaignGoal : null,
          budget_range: brandBudgetRange || null,
          preferred_platforms: brandPreferredPlatforms.length > 0 ? brandPreferredPlatforms : null,
        })

        if (profileError) throw profileError
      } catch (profileError: any) {
        // Use existing table structure if profiles table doesn't exist
        const { error: userError } = await supabase.from("users").insert({
          id: authData.user.id,
          email: brandEmail,
          role: "brand",
        })

        if (userError) throw userError

        const { error: brandError } = await supabase.from("brands").insert({
          user_id: authData.user.id,
          company_name: brandCompanyName,
          contact_person: brandManagerName,
          website: brandWebsite || null,
        })

        if (brandError) throw brandError
      }

      toast({
        title: "Sign up completed ✅",
        description: "Redirecting to brand dashboard",
      })

      // 3. Redirect
      router.push("/brand")
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-md mx-auto">
          <Card className="bg-white rounded-2xl shadow-sm border-gray-200">
            <CardHeader className="space-y-4">
              <div className="flex gap-2 border-b border-gray-200 pb-4">
                <button
                  onClick={() => setRole("influencer")}
                  className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                    role === "influencer"
                      ? "text-primary border-b-2 border-primary font-bold"
                      : "text-gray-600 hover:text-primary"
                  }`}
                >
                  <Users className="w-4 h-4 inline mr-2" />
                  Influencer
                </button>
                <button
                  onClick={() => setRole("brand")}
                  className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                    role === "brand"
                      ? "text-primary border-b-2 border-primary font-bold"
                      : "text-gray-600 hover:text-primary"
                  }`}
                >
                  <Building2 className="w-4 h-4 inline mr-2" />
                  Brand
                </button>
              </div>
              <CardTitle className="text-2xl font-bold text-center text-gray-900">
                {role === "influencer" ? "Influencer Sign Up" : "Brand Sign Up"}
              </CardTitle>
              <CardDescription className="text-center text-primary/80">
                {role === "influencer"
                  ? "Create a new account to get started"
                  : "Create a brand account to get started"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {role === "influencer" ? (
                <form onSubmit={signupInfluencer} className="space-y-4">
                  {/* Name */}
                  <div>
                    <Label htmlFor="inf-name" className="text-gray-900">
                      Name <span className="text-primary">*</span>
                    </Label>
                    <Input
                      id="inf-name"
                      placeholder="Stage name or real name"
                      value={infName}
                      onChange={(e) => setInfName(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <Label htmlFor="inf-email" className="text-gray-900">
                      Email <span className="text-primary">*</span>
                    </Label>
                    <Input
                      id="inf-email"
                      type="email"
                      placeholder="example@email.com"
                      value={infEmail}
                      onChange={(e) => setInfEmail(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <Label htmlFor="inf-password" className="text-gray-900">
                      Password <span className="text-primary">*</span>
                    </Label>
                    <Input
                      id="inf-password"
                      type="password"
                      placeholder="********"
                      value={infPassword}
                      onChange={(e) => setInfPassword(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>

                  {/* Profile Image */}
                  <div>
                    <Label htmlFor="inf-image" className="text-gray-900">Profile Image</Label>
                    <Input
                      id="inf-image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setInfProfileImage(e.target.files?.[0] || null)}
                      className="mt-1"
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <Label htmlFor="inf-location" className="text-gray-900">Location</Label>
                    <Select value={infLocation} onValueChange={setInfLocation}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select your state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Alabama">Alabama</SelectItem>
                        <SelectItem value="Alaska">Alaska</SelectItem>
                        <SelectItem value="Arizona">Arizona</SelectItem>
                        <SelectItem value="Arkansas">Arkansas</SelectItem>
                        <SelectItem value="California">California</SelectItem>
                        <SelectItem value="Colorado">Colorado</SelectItem>
                        <SelectItem value="Connecticut">Connecticut</SelectItem>
                        <SelectItem value="Delaware">Delaware</SelectItem>
                        <SelectItem value="Florida">Florida</SelectItem>
                        <SelectItem value="Georgia">Georgia</SelectItem>
                        <SelectItem value="Hawaii">Hawaii</SelectItem>
                        <SelectItem value="Idaho">Idaho</SelectItem>
                        <SelectItem value="Illinois">Illinois</SelectItem>
                        <SelectItem value="Indiana">Indiana</SelectItem>
                        <SelectItem value="Iowa">Iowa</SelectItem>
                        <SelectItem value="Kansas">Kansas</SelectItem>
                        <SelectItem value="Kentucky">Kentucky</SelectItem>
                        <SelectItem value="Louisiana">Louisiana</SelectItem>
                        <SelectItem value="Maine">Maine</SelectItem>
                        <SelectItem value="Maryland">Maryland</SelectItem>
                        <SelectItem value="Massachusetts">Massachusetts</SelectItem>
                        <SelectItem value="Michigan">Michigan</SelectItem>
                        <SelectItem value="Minnesota">Minnesota</SelectItem>
                        <SelectItem value="Mississippi">Mississippi</SelectItem>
                        <SelectItem value="Missouri">Missouri</SelectItem>
                        <SelectItem value="Montana">Montana</SelectItem>
                        <SelectItem value="Nebraska">Nebraska</SelectItem>
                        <SelectItem value="Nevada">Nevada</SelectItem>
                        <SelectItem value="New Hampshire">New Hampshire</SelectItem>
                        <SelectItem value="New Jersey">New Jersey</SelectItem>
                        <SelectItem value="New Mexico">New Mexico</SelectItem>
                        <SelectItem value="New York">New York</SelectItem>
                        <SelectItem value="North Carolina">North Carolina</SelectItem>
                        <SelectItem value="North Dakota">North Dakota</SelectItem>
                        <SelectItem value="Ohio">Ohio</SelectItem>
                        <SelectItem value="Oklahoma">Oklahoma</SelectItem>
                        <SelectItem value="Oregon">Oregon</SelectItem>
                        <SelectItem value="Pennsylvania">Pennsylvania</SelectItem>
                        <SelectItem value="Rhode Island">Rhode Island</SelectItem>
                        <SelectItem value="South Carolina">South Carolina</SelectItem>
                        <SelectItem value="South Dakota">South Dakota</SelectItem>
                        <SelectItem value="Tennessee">Tennessee</SelectItem>
                        <SelectItem value="Texas">Texas</SelectItem>
                        <SelectItem value="Utah">Utah</SelectItem>
                        <SelectItem value="Vermont">Vermont</SelectItem>
                        <SelectItem value="Virginia">Virginia</SelectItem>
                        <SelectItem value="Washington">Washington</SelectItem>
                        <SelectItem value="West Virginia">West Virginia</SelectItem>
                        <SelectItem value="Wisconsin">Wisconsin</SelectItem>
                        <SelectItem value="Wyoming">Wyoming</SelectItem>
                        <SelectItem value="District of Columbia">District of Columbia</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Main Platforms */}
                  <div>
                    <Label className="text-gray-900">
                      Main Platforms <span className="text-primary">*</span>
                    </Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {useMemo(() => ["Instagram", "YouTube", "TikTok"], []).map((platform) => (
                        <Button
                          key={platform}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handlePlatformToggle(platform.toLowerCase(), true)}
                          className={
                            infPlatforms.includes(platform.toLowerCase())
                              ? "bg-primary text-white border-primary hover:bg-primary/90"
                              : "border-gray-300 text-gray-700 bg-transparent hover:bg-gray-50"
                          }
                        >
                          {platform}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Channel URL */}
                  <div>
                    <Label htmlFor="inf-channel-url" className="text-gray-900">
                      Channel URL <span className="text-primary">*</span>
                    </Label>
                    <Input
                      id="inf-channel-url"
                      type="url"
                      placeholder="https://instagram.com/..."
                      value={infChannelUrl}
                      onChange={(e) => setInfChannelUrl(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>

                  {/* Followers */}
                  <div>
                    <Label htmlFor="inf-followers" className="text-gray-900">
                      Followers <span className="text-primary">*</span>
                    </Label>
                    <Input
                      id="inf-followers"
                      type="number"
                      placeholder="e.g., 12500"
                      value={infFollowers}
                      onChange={(e) => setInfFollowers(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>

                  {/* Main Categories */}
                  <div>
                    <Label className="text-gray-900">
                      Main Categories <span className="text-primary">*</span>
                    </Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {useMemo(() => ["Beauty", "Fashion", "Health", "Food", "Travel", "IT"], []).map((category) => (
                        <Button
                          key={category}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleCategoryToggle(category)}
                          className={
                            infCategory.includes(category)
                              ? "bg-primary text-white border-primary hover:bg-primary/90"
                              : "border-gray-300 text-gray-700 bg-transparent hover:bg-gray-50"
                          }
                        >
                          {category}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Preferred Collaboration Types */}
                  <div>
                    <Label className="text-gray-900">
                      Preferred Collaboration Types <span className="text-primary">*</span>
                    </Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {useMemo(() => ["Review", "Experience", "Paid Ad", "Joint Campaign"], []).map((type) => (
                        <Button
                          key={type}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleCollabTypeToggle(type)}
                          className={
                            infCollabType.includes(type)
                              ? "bg-primary text-white border-primary hover:bg-primary/90"
                              : "border-gray-300 text-gray-700 bg-transparent hover:bg-gray-50"
                          }
                        >
                          {type}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Price Per Post */}
                  <div>
                    <Label htmlFor="inf-price" className="text-gray-900">Price Per Post</Label>
                    <Input
                      id="inf-price"
                      type="number"
                      placeholder="e.g., 200000"
                      value={infPricePerPost}
                      onChange={(e) => setInfPricePerPost(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <Label htmlFor="inf-bio" className="text-gray-900">Bio</Label>
                    <Textarea
                      id="inf-bio"
                      placeholder="Introduce yourself"
                      value={infBio}
                      onChange={(e) => setInfBio(e.target.value)}
                      className="mt-1"
                      rows={4}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#0066FF] hover:bg-[#0055DD] text-white rounded-xl font-medium mt-6"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing up...
                      </>
                    ) : (
                      "Sign Up"
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={signupBrand} className="space-y-4">
                  {/* Contact Person Name */}
                  <div>
                    <Label htmlFor="brand-manager-name" className="text-gray-900">
                      Contact Person Name <span className="text-primary">*</span>
                    </Label>
                    <Input
                      id="brand-manager-name"
                      placeholder="John Doe"
                      value={brandManagerName}
                      onChange={(e) => setBrandManagerName(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <Label htmlFor="brand-email" className="text-gray-900">
                      Email <span className="text-primary">*</span>
                    </Label>
                    <Input
                      id="brand-email"
                      type="email"
                      placeholder="example@brand.com"
                      value={brandEmail}
                      onChange={(e) => setBrandEmail(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <Label htmlFor="brand-password" className="text-gray-900">
                      Password <span className="text-primary">*</span>
                    </Label>
                    <Input
                      id="brand-password"
                      type="password"
                      placeholder="********"
                      value={brandPassword}
                      onChange={(e) => setBrandPassword(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>

                  {/* Company Name */}
                  <div>
                    <Label htmlFor="brand-company-name" className="text-gray-900">
                      Company Name <span className="text-primary">*</span>
                    </Label>
                    <Input
                      id="brand-company-name"
                      placeholder="Inbridge Inc."
                      value={brandCompanyName}
                      onChange={(e) => setBrandCompanyName(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>

                  {/* Website */}
                  <div>
                    <Label htmlFor="brand-website" className="text-gray-900">Website</Label>
                    <Input
                      id="brand-website"
                      type="url"
                      placeholder="https://brand.com"
                      value={brandWebsite}
                      onChange={(e) => setBrandWebsite(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <Label htmlFor="brand-phone" className="text-gray-900">
                      Phone <span className="text-primary">*</span>
                    </Label>
                    <Input
                      id="brand-phone"
                      placeholder="010-0000-0000"
                      value={brandPhone}
                      onChange={(e) => setBrandPhone(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>

                  {/* Industry Category */}
                  <div>
                    <Label htmlFor="brand-industry" className="text-gray-900">
                      Industry Category <span className="text-primary">*</span>
                    </Label>
                    <Select value={brandIndustry} onValueChange={setBrandIndustry}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Beauty / Fashion / IT / Food / Health / Other" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beauty">Beauty</SelectItem>
                        <SelectItem value="Fashion">Fashion</SelectItem>
                        <SelectItem value="IT">IT</SelectItem>
                        <SelectItem value="Food">Food</SelectItem>
                        <SelectItem value="Health">Health</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Campaign Goals */}
                  <div>
                    <Label className="text-gray-900">Campaign Goals</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {useMemo(() => ["Brand Awareness", "Sales", "New Leads"], []).map((goal) => (
                        <Button
                          key={goal}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleCampaignGoalToggle(goal)}
                          className={
                            brandCampaignGoal.includes(goal)
                              ? "bg-primary text-white border-primary hover:bg-primary/90"
                              : "border-gray-300 text-gray-700 bg-transparent hover:bg-gray-50"
                          }
                        >
                          {goal}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Marketing Budget Range */}
                  <div>
                    <Label htmlFor="brand-budget" className="text-gray-900">Marketing Budget Range</Label>
                    <Select value={brandBudgetRange} onValueChange={setBrandBudgetRange}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Under $500K / $500K-$2M / Over $2M" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Under $500K">Under $500K</SelectItem>
                        <SelectItem value="$500K-$2M">$500K-$2M</SelectItem>
                        <SelectItem value="Over $2M">Over $2M</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Preferred Platforms */}
                  <div>
                    <Label className="text-gray-900">Preferred Platforms</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {useMemo(() => ["Instagram", "YouTube", "TikTok"], []).map((platform) => (
                        <Button
                          key={platform}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handlePlatformToggle(platform.toLowerCase(), false)}
                          className={
                            brandPreferredPlatforms.includes(platform.toLowerCase())
                              ? "bg-primary text-white border-primary hover:bg-primary/90"
                              : "border-gray-300 text-gray-700 bg-transparent hover:bg-gray-50"
                          }
                        >
                          {platform}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#0066FF] hover:bg-[#0055DD] text-white rounded-xl font-medium mt-6"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing up...
                      </>
                    ) : (
                      "Sign Up"
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}

