"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  ChevronRight, 
  ChevronLeft, 
  Wallet, 
  Film, 
  Play, 
  Coins, 
  Gift,
  CheckCircle,
  Star,
  TrendingUp
} from "lucide-react"
import { useRouter } from "next/navigation"

interface OnboardingTutorialProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userEmail?: string
  walletAddress?: string
}

const tutorialSteps = [
  {
    id: 1,
    title: "Welcome to QuiFlix!",
    description: "Your journey into Web3 entertainment starts here",
    content: {
      icon: <Star className="h-16 w-16 text-yellow-500" />,
      title: "Welcome to QuiFlix",
      subtitle: "Own Your Movie Experience",
      features: [
        "Stream premium films as NFTs",
        "Earn rewards for watching",
        "Support independent creators",
        "Build your digital collection"
      ]
    }
  },
  {
    id: 2,
    title: "Your Secure Wallet",
    description: "We've created a custodial wallet for you",
    content: {
      icon: <Wallet className="h-16 w-16 text-blue-500" />,
      title: "Your Wallet is Ready",
      subtitle: "Securely managed by QuiFlix",
      features: [
        "Auto-generated secure wallet",
        "No seed phrases to remember",
        "KES balance: 0 (Add funds anytime)",
        "Ready for NFT purchases"
      ]
    }
  },
  {
    id: 3,
    title: "Browse Films",
    description: "Discover amazing content from creators worldwide",
    content: {
      icon: <Film className="h-16 w-16 text-purple-500" />,
      title: "Explore Our Library",
      subtitle: "Thousands of films waiting for you",
      features: [
        "Independent films & documentaries",
        "Blockbuster exclusives",
        "Multiple genres available",
        "New releases every week"
      ]
    }
  },
  {
    id: 4,
    title: "Buy Your First NFT",
    description: "Purchase films and truly own them",
    content: {
      icon: <Coins className="h-16 w-16 text-green-500" />,
      title: "Make Your First Purchase",
      subtitle: "Buy with KES, Card, or M-Pesa",
      features: [
        "Multiple payment options",
        "Instant access after purchase",
        "NFT automatically minted to your wallet",
        "Lifetime access to your films"
      ]
    }
  },
  {
    id: 5,
    title: "Watch & Earn",
    description: "Enjoy content and get rewarded",
    content: {
      icon: <TrendingUp className="h-16 w-16 text-orange-500" />,
      title: "Watch & Earn Rewards",
      subtitle: "The more you watch, the more you earn",
      features: [
        "Earn tokens for watching films",
        "Unlock exclusive content",
        "Get early access to new releases",
        "Build your reputation as a cinephile"
      ]
    }
  }
]

export function OnboardingTutorial({ 
  open, 
  onOpenChange, 
  userEmail, 
  walletAddress 
}: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const router = useRouter()

  const progress = ((currentStep + 1) / tutorialSteps.length) * 100

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    // Mark tutorial as completed in localStorage
    localStorage.setItem('quiflix-tutorial-completed', 'true')
    
    // Close tutorial
    onOpenChange(false)
    
    // Redirect to films page to start browsing
    router.push('/films')
  }

  const handleSkip = () => {
    localStorage.setItem('quiflix-tutorial-completed', 'true')
    onOpenChange(false)
    router.push('/films')
  }

  const step = tutorialSteps[currentStep]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-center">
            Getting Started with QuiFlix
          </DialogTitle>
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {currentStep + 1} of {tutorialSteps.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <Card className="border-2">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                {step.content.icon}
              </div>
              <CardTitle className="text-xl">{step.content.title}</CardTitle>
              <CardDescription className="text-base">
                {step.content.subtitle}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {step.content.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Show user info on wallet step */}
              {currentStep === 1 && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Email:</span> {userEmail || 'Not provided'}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Wallet:</span> 
                    <code className="ml-2 text-xs bg-background px-2 py-1 rounded">
                      {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Generating...'}
                    </code>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button 
              variant="outline" 
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <Button 
              variant="ghost" 
              onClick={handleSkip}
              className="text-muted-foreground"
            >
              Skip Tutorial
            </Button>

            <Button 
              onClick={handleNext}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90"
            >
              {currentStep === tutorialSteps.length - 1 ? 'Get Started' : 'Next'}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Quick actions on final step */}
          {currentStep === tutorialSteps.length - 1 && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardContent className="p-4 text-center">
                  <Film className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h4 className="font-medium">Browse Films</h4>
                  <p className="text-xs text-muted-foreground">Explore our library</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardContent className="p-4 text-center">
                  <Coins className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h4 className="font-medium">Add Funds</h4>
                  <p className="text-xs text-muted-foreground">Top up your wallet</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}