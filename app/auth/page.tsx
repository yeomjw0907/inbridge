"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Users, Building2 } from "lucide-react"

export default function AuthPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")
  const [role, setRole] = useState<"influencer" | "brand">("influencer")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [channel, setChannel] = useState("")
  const [followers, setFollowers] = useState("")
  const [categories, setCategories] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [contactPerson, setContactPerson] = useState("")
  const [website, setWebsite] = useState("")
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast({
        title: "Please enter email and password",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Check user role
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", data.user.id)
        .single()

      if (userData?.role === "influencer") {
        router.push("/mypage")
      } else {
        router.push("/brand")
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast({
        title: "Please enter email and password",
        variant: "destructive",
      })
      return
    }

    if (role === "influencer" && (!name || !channel)) {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (role === "brand" && (!companyName || !contactPerson)) {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) throw authError

      if (!authData.user) throw new Error("User creation failed")

      // Save user information to users table
      const { error: userError } = await supabase.from("users").insert({
        id: authData.user.id,
        email: email,
        role: role,
      })

      if (userError) throw userError

      // Save additional information by role
      if (role === "influencer") {
        const { error: influencerError } = await supabase.from("influencers").insert({
          user_id: authData.user.id,
          channel_name: channel,
          followers: parseInt(followers) || 0,
          categories: categories.split(",").map((c) => c.trim()),
        })

        if (influencerError) throw influencerError
      } else {
        const { error: brandError } = await supabase.from("brands").insert({
          user_id: authData.user.id,
          company_name: companyName,
          contact_person: contactPerson,
          website: website,
        })

        if (brandError) throw brandError
      }

      toast({
        title: "Sign up completed ✅",
        description: "Please log in",
      })

      setIsLogin(true)
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
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex gap-2 mb-4">
                <Button
                  variant={authMode === "login" ? "default" : "ghost"}
                  onClick={() => setAuthMode("login")}
                  className={`flex-1 ${
                    authMode === "login"
                      ? "bg-primary text-white hover:bg-primary/90"
                      : "text-primary hover:bg-primary/5"
                  }`}
                >
                  Login
                </Button>
                <Button
                  variant={authMode === "signup" ? "default" : "ghost"}
                  onClick={() => setAuthMode("signup")}
                  className={`flex-1 ${
                    authMode === "signup"
                      ? "bg-primary text-white hover:bg-primary/90"
                      : "text-primary hover:bg-primary/5"
                  }`}
                >
                  Sign Up
                </Button>
              </div>
              <CardTitle className="text-3xl text-center text-gray-900">
                {authMode === "login" ? "Login" : "Sign Up"}
              </CardTitle>
              <CardDescription className="text-center text-primary/80">
                {authMode === "login"
                  ? "Sign in to your account"
                  : "Create a new account to get started"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {authMode === "signup" && (
                <Tabs value={role} onValueChange={(v) => setRole(v as "influencer" | "brand")}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="influencer">
                      <Users className="w-4 h-4 mr-2" />
                      Influencer
                    </TabsTrigger>
                    <TabsTrigger value="brand">
                      <Building2 className="w-4 h-4 mr-2" />
                      Brand
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              )}

              {authMode === "login" ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email" className="text-gray-900">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="example@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="login-password" className="text-gray-900">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-primary text-white hover:bg-primary/90" size="lg">
                    {loading ? "Logging in..." : "Login"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <Label htmlFor="signup-email" className="text-gray-900">Email *</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="example@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-password" className="text-gray-900">Password *</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  {role === "influencer" ? (
                    <>
                      <div>
                        <Label htmlFor="name" className="text-gray-900">Name *</Label>
                        <Input
                          id="name"
                          placeholder="John Doe"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="channel" className="text-gray-900">Channel *</Label>
                        <Input
                          id="channel"
                          placeholder="Channel Name"
                          value={channel}
                          onChange={(e) => setChannel(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="followers" className="text-gray-900">Followers</Label>
                        <Input
                          id="followers"
                          type="number"
                          placeholder="e.g., 100000"
                          value={followers}
                          onChange={(e) => setFollowers(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="categories" className="text-gray-900">Main Categories (comma-separated)</Label>
                        <Input
                          id="categories"
                          placeholder="e.g., beauty, food, travel"
                          value={categories}
                          onChange={(e) => setCategories(e.target.value)}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <Label htmlFor="company-name" className="text-gray-900">Company Name *</Label>
                        <Input
                          id="company-name"
                          placeholder="Company Name"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="contact-person" className="text-gray-900">Contact Person *</Label>
                        <Input
                          id="contact-person"
                          placeholder="John Doe"
                          value={contactPerson}
                          onChange={(e) => setContactPerson(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="website" className="text-gray-900">Website</Label>
                        <Input
                          id="website"
                          type="url"
                          placeholder="https://example.com"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  <Button type="submit" disabled={loading} className="w-full bg-primary text-white hover:bg-primary/90" size="lg">
                    {loading ? "Signing up..." : "Sign Up"}
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

