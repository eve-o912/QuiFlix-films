import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
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

      {/* Wallet & Blockchain */}
      <Card>
        <CardHeader>
          <CardTitle>Wallet & Blockchain</CardTitle>
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
            <Label>Preferred Payout Method</Label>
            <Select defaultValue="usdt">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usdt">USDT (Tether)</SelectItem>
                <SelectItem value="usdc">USDC (USD Coin)</SelectItem>
                <SelectItem value="eth">ETH (Ethereum)</SelectItem>
                <SelectItem value="fiat">Bank Transfer (Fiat)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Minimum Payout Threshold</Label>
            <div className="flex items-center gap-2">
              <Input defaultValue="100" className="w-32" />
              <span className="text-sm text-muted-foreground">USDT</span>
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

          <Button>Save Payout Settings</Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
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
                <p className="text-sm text-muted-foreground">Sales above $100</p>
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
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
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
