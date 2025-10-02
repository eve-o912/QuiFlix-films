"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, Mail, Phone, Wallet, CheckCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/hooks/useAuth"

interface SignupModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (userData: any) => void
}

export function SignupModal({ open, onOpenChange, onSuccess }: SignupModalProps) {
  const [activeTab, setActiveTab] = useState("signup")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: ""
  })
  const { toast } = useToast()
  const { signUp, logIn, loading: authLoading } = useAuth()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = () => {
    // Email validation
    if (!formData.email) {
      toast({
        variant: "destructive",
        title: "Email Required",
        description: "Please provide an email address"
      })
      return false
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter a valid email address"
      })
      return false
    }

    if (!formData.password) {
      toast({
        variant: "destructive",
        title: "Password Required",
        description: "Please enter a password"
      })
      return false
    }

    if (activeTab === "signup" && formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Password Mismatch",
        description: "Passwords do not match"
      })
      return false
    }

    if (formData.password.length < 6) {
      toast({
        variant: "destructive",
        title: "Weak Password",
        description: "Password must be at least 6 characters long"
      })
      return false
    }

    return true
  }

  const handleSignup = async () => {
    if (!validateForm() || authLoading) return

    setIsLoading(true)
    try {
      await signUp(formData.email, formData.password)

      toast({
        title: "Account Created Successfully!",
        description: "Welcome to QuiFlix! You can now start exploring films.",
      })

      // Call onSuccess callback
      onSuccess?.({ email: formData.email })
      
      // Close modal
      onOpenChange(false)

    } catch (error) {
      let errorMessage = "Something went wrong"
      
      if (error instanceof Error) {
        // Handle specific Firebase error codes
        if (error.message.includes('email-already-in-use')) {
          errorMessage = "An account with this email already exists"
        } else if (error.message.includes('weak-password')) {
          errorMessage = "Password is too weak. Please choose a stronger password"
        } else if (error.message.includes('invalid-email')) {
          errorMessage = "Please enter a valid email address"
        } else {
          errorMessage = error.message
        }
      }
      
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: errorMessage
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async () => {
    if (!validateForm() || authLoading) return

    setIsLoading(true)
    try {
      await logIn(formData.email, formData.password)

      toast({
        title: "Welcome Back!",
        description: "Successfully logged in to your account.",
      })

      // Call onSuccess callback
      onSuccess?.({ email: formData.email })
      
      // Close modal
      onOpenChange(false)

    } catch (error) {
      let errorMessage = "Invalid credentials"
      
      if (error instanceof Error) {
        // Handle specific Firebase error codes
        if (error.message.includes('user-not-found')) {
          errorMessage = "No account found with this email address"
        } else if (error.message.includes('wrong-password')) {
          errorMessage = "Incorrect password. Please try again"
        } else if (error.message.includes('invalid-email')) {
          errorMessage = "Please enter a valid email address"
        } else if (error.message.includes('too-many-requests')) {
          errorMessage = "Too many failed attempts. Please try again later"
        } else {
          errorMessage = error.message
        }
      }
      
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: errorMessage
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Welcome to QuiFlix</DialogTitle>
          <DialogDescription className="text-center">
            Create an account to start your movie journey
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
            <TabsTrigger value="login">Log In</TabsTrigger>
          </TabsList>

          <TabsContent value="signup" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Create Your Account
                </CardTitle>
                <CardDescription>
                  We'll auto-generate a secure wallet for you - no crypto knowledge needed!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username (Optional)</Label>
                  <Input
                    id="username"
                    name="username"
                    placeholder="Enter username"
                    value={formData.username}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter email address"
                      className="pl-10"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create password"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                </div>

                <Button 
                  onClick={handleSignup} 
                  disabled={isLoading} 
                  className="w-full"
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="login" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Welcome Back</CardTitle>
                <CardDescription>
                  Sign in to your QuiFlix account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      name="email"
                      type="email"
                      placeholder="Enter email address"
                      className="pl-10"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button 
                  onClick={handleLogin} 
                  disabled={isLoading} 
                  className="w-full"
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Features highlight */}
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Secure Firebase authentication • Instant access • No crypto wallet needed</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}