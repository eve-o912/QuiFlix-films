"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { PriceDisplay } from "@/components/price-display"
import { getPreferredCurrency, setPreferredCurrency, EXCHANGE_RATES } from "@/lib/currency"
import { DollarSign, Wallet, Bell, AlertTriangle } from "lucide-react"

export default function SettingsPage() {
  const [displayCurrency, setDisplayCurrency] = useState<'KES' | 'USDC'>('USDC')
  const [minPayoutAmount, setMinPayoutAmount] = useState(100)

  // Load preferred currency on mount
  useEffect(() => {
    const preferred = getPreferredCurrency()
    setDisplayCurrency(preferred)
  }, [])

  const handleCurrencyChange = (currency: 'KES' | 'USDC') => {
    setDisplayCurrency(currency)
    setPreferredCurrency(currency)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your producer profile and preferences</p>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div>
              <Button variant="outline">Upload Logo</Button>
              <p className="text-sm text-muted-foreground mt-1">Recommended: 400x400px, PNG or JPG</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="producerName">Producer Name</Label>
              <Input id="producerName" defaultValue="Stellar Studios" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="studioName">Studio Name</Label>
              <Input id="studioName" defaultValue="Stellar Entertainment" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell viewers about your studio and filmmaking journey..."
              defaultValue="Independent film studio creating cutting-edge sci-fi and thriller content for the Web3 era."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input id="website" placeholder="https://your-studio.com" defaultValue="https://stellarstudios.com" />
          </div>

          <Button>Save Profile</Button>
        </CardContent>
      </Card>

      {/* Currency Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Currency & Display Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold mb-3 block">Display Currency</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Choose your preferred currency for displaying prices and earnings throughout the platform
              </p>
              <div className="flex gap-3">
                <Button
                  variant={displayCurrency === 'KES' ? 'default' : 'outline'}
                  onClick={() => handleCurrencyChange('KES')}
                  className="flex-1"
                >
                  <span className="font-semibold">KES</span>
                  <span className="ml-2 text-xs opacity-75">Kenya Shillings</span>
                </Button>
                <Button
                  variant={displayCurrency === 'USDC' ? 'default' : 'outline'}
                  onClick={() => handleCurrencyChange('USDC')}
                  className="flex-1"
                >
                  <span className="font-semibold">USDC</span>
                  <span className="ml-2 text-xs opacity-75">Stablecoin</span>
                </Button>
              </div>
            </div>

            <Separator />

            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Exchange Rate</span>
                <Badge variant="outline">Live Rate</Badge>
              </div>
              <div className="text-2xl font-bold">
                1 USDC = KES {EXCHANGE_RATES.USDC_TO_KES.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Exchange rates are updated regularly to ensure accurate conversions
              </p>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-base font-semibold">Preview</Label>
              <div className="p-4 border rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Film Price Example:</span>
                  <PriceDisplay amount={25} currency="USDC" showToggle={false} size="md" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Earnings Example:</span>
                  <PriceDisplay amount={1000} currency="USDC" showToggle={false} size="md" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Prices will be displayed in {displayCurrency} across all pages
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallet & Blockchain */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet & Blockchain
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Connected Wallet</Label>
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0L1.608 9H9v6h6V9h7.392L12 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">0x1234...5678</p>
                  <p className="text-sm text-muted-foreground">MetaMask</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Disconnect
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="royaltyRate">Default Royalty Rate</Label>
            <div className="flex items-center gap-2">
              <Input id="royaltyRate" type="number" min="0" max="15" defaultValue="10" className="w-20" />
              <span className="text-sm text-muted-foreground">% (5-15% recommended)</span>
            </div>
            <p className="text-sm text-muted-foreground">
              This will be applied to all new film NFTs for secondary sales
            </p>
          </div>

          <Button>Update Wallet Settings</Button>
        </CardContent>
      </Card>

      {/* Payout Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Payout Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Preferred Payout Currency</Label>
            <Select defaultValue="usdc">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usdc">USDC (USD Coin) - Recommended</SelectItem>
                <SelectItem value="usdt">USDT (Tether)</SelectItem>
                <SelectItem value="eth">ETH (Ethereum)</SelectItem>
                <SelectItem value="kes">KES (Bank Transfer)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Choose which currency you want to receive your earnings in
            </p>
          </div>

          <div className="space-y-2">
            <Label>Minimum Payout Threshold</Label>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Input 
                  type="number"
                  value={minPayoutAmount}
                  onChange={(e) => setMinPayoutAmount(parseFloat(e.target.value))}
                  className="w-32" 
                />
                <span className="text-sm text-muted-foreground">USDC</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm">
                  Equivalent to approximately:{" "}
                  <PriceDisplay 
                    amount={minPayoutAmount} 
                    currency="USDC" 
                    showToggle={false}
                    size="sm"
                  />
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Automatic payouts will be triggered when your balance reaches this amount
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-withdraw Earnings</Label>
              <p className="text-sm text-muted-foreground">Automatically withdraw when threshold is met</p>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex gap-3">
              <div className="text-blue-600 dark:text-blue-400 mt-0.5">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Currency Conversion</p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  If you select KES bank transfer, conversions will be done at the current exchange rate at time of payout
                </p>
              </div>
            </div>
          </div>

          <Button>Save Payout Settings</Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" defaultValue="producer@stellarstudios.com" />
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-medium">Email Notifications</h3>

            <div className="flex items-center justify-between">
              <div>
                <Label>New Sales</Label>
                <p className="text-sm text-muted-foreground">Get notified when someone buys your NFT tickets</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Royalty Payments</Label>
                <p className="text-sm text-muted-foreground">Get notified when you earn royalties from resales</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Currency Rate Changes</Label>
                <p className="text-sm text-muted-foreground">Get notified of significant exchange rate changes</p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Weekly Reports</Label>
                <p className="text-sm text-muted-foreground">Receive weekly performance summaries</p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Marketing Updates</Label>
                <p className="text-sm text-muted-foreground">Platform updates and promotional opportunities</p>
              </div>
              <Switch />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-medium">Push Notifications</h3>

            <div className="flex items-center justify-between">
              <div>
                <Label>High-Value Sales</Label>
                <p className="text-sm text-muted-foreground">Sales above 100 USDC (~KES 12,950)</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Milestone Achievements</Label>
                <p className="text-sm text-muted-foreground">When you reach view or sales milestones</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>

          <Button>Save Notification Settings</Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-900 rounded-lg">
            <div>
              <h3 className="font-medium">Delete Producer Account</h3>
              <p className="text-sm text-muted-foreground">
                Permanently delete your producer account and all associated data
              </p>
            </div>
            <Button variant="destructive">Delete Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
