'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { useCustodialWallet } from '@/hooks/useCustodialWallet'
import { getWalletBalance, getTokenBalance, getOwnedNfts, USDT_TOKEN_ADDRESS, USDC_TOKEN_ADDRESS, ERC721_ABI } from '@/lib/custodial-wallet-simple'
import { useAuth } from '@/hooks/useAuth'
import { getUserProfile, updateUserProfile } from '@/firebase/auth'
import {
  User,
  Wallet,
  Film,
  Trophy,
  Copy,
  Check,
  ArrowLeft,
  Settings,
  Download,
  Edit
} from 'lucide-react'

export default function ProfilePage() {
  const { currentUser, userLoggedIn } = useAuth()
  const { address, isConnected, balance, formatAddress: formatWalletAddress, isLoading: walletLoading, error: walletError, sendTransaction, writeContract, refreshBalance } = useCustodialWallet()
  const router = useRouter()
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [editUsername, setEditUsername] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [amountKsh, setAmountKsh] = useState('')
  const [selectedToken, setSelectedToken] = useState<'USDT' | 'USDC'>('USDT')
  const [recipient, setRecipient] = useState<string | undefined>(address)
  const [walletDialogOpen, setWalletDialogOpen] = useState(false)
  const [ethBalance, setEthBalance] = useState('0.0000')
  const [usdtBalanceLocal, setUsdtBalanceLocal] = useState('0.0000')
  const [usdcBalanceLocal, setUsdcBalanceLocal] = useState('0.0000')
  const [ownedNfts, setOwnedNfts] = useState<Array<{contract: string; tokenId: string; tokenURI?: string}>>([])

  // Send form state
  const [sendAmount, setSendAmount] = useState('')
  const [sendRecipient, setSendRecipient] = useState<string | undefined>(address)

  // NFT transfer state
  const [nftContract, setNftContract] = useState('')
  const [nftTokenId, setNftTokenId] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setRecipient(address)
  }, [address])

  useEffect(() => {
    setSendRecipient(address)
  }, [address])

  // Fetch balances when wallet dialog opens
  useEffect(() => {
    const fetchBalances = async () => {
      if (!address) return
      try {
        const eth = await getWalletBalance(address)
        setEthBalance(eth)

        const usdtAddr = process.env.NEXT_PUBLIC_USDT_ADDRESS || USDT_TOKEN_ADDRESS || ''
        const usdcAddr = process.env.NEXT_PUBLIC_USDC_ADDRESS || USDC_TOKEN_ADDRESS || ''

        if (usdtAddr) {
          const b = await getTokenBalance(address, usdtAddr)
          setUsdtBalanceLocal(b)
        }

        if (usdcAddr) {
          const b = await getTokenBalance(address, usdcAddr)
          setUsdcBalanceLocal(b)
        }

        // NFT contracts from env (comma separated) or empty
        const nftListRaw = process.env.NEXT_PUBLIC_NFT_CONTRACTS || ''
        const nftContracts = nftListRaw.split(',').map(s => s.trim()).filter(Boolean)
        if (nftContracts.length > 0) {
          const nfts = await getOwnedNfts(address, nftContracts)
          setOwnedNfts(nfts)
        } else {
          setOwnedNfts([])
        }
      } catch (err) {
        console.error('Error fetching balances for dialog:', err)
      }
    }

    if (walletDialogOpen) fetchBalances()
  }, [walletDialogOpen, address])

  // Redirect if user not logged in
  useEffect(() => {
    if (mounted && !userLoggedIn) {
      router.push('/')
    }
  }, [mounted, userLoggedIn, router])

  // Load user profile from Firestore
  useEffect(() => {
    const loadUserProfile = async () => {
      if (currentUser) {
        try {
          const profile = await getUserProfile(currentUser.uid)
          setUserProfile(profile)
          setEditUsername(profile?.username || '')
        } catch (error) {
          console.error('Error loading profile:', error)
        }
      }
    }

    if (mounted && currentUser) {
      loadUserProfile()
    }
  }, [mounted, currentUser])

  const handleSaveProfile = async () => {
    if (!currentUser) return

    setIsSaving(true)
    try {
      await updateUserProfile(currentUser.uid, {
        username: editUsername.trim()
      })

      // Update local state
      setUserProfile({ ...userProfile, username: editUsername.trim() })

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      })

      setEditDialogOpen(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSendEth = async () => {
    if (!sendRecipient || !sendAmount) {
      toast({ variant: 'destructive', title: 'Missing fields', description: 'Recipient and amount are required.' })
      return
    }

    try {
      const hash = await sendTransaction(sendRecipient, sendAmount)
      toast({ title: 'Transaction sent', description: `Tx: ${hash}` })

      // Refresh balances
      await refreshBalance()
      if (address) {
        const eth = await getWalletBalance(address)
        setEthBalance(eth)
      }
    } catch (err) {
      console.error('Error sending ETH:', err)
      toast({ variant: 'destructive', title: 'Send failed', description: String(err) })
    }
  }

  const handleSendNft = async () => {
    if (!nftContract || !nftTokenId || !sendRecipient) {
      toast({ variant: 'destructive', title: 'Missing fields', description: 'NFT contract, token id and recipient are required.' })
      return
    }

    try {
      const tokenIdBig = BigInt(nftTokenId)
      const tx = await writeContract({
        address: nftContract as `0x${string}`,
        abi: ERC721_ABI,
        functionName: 'transferFrom',
        args: [address as `0x${string}`, sendRecipient as `0x${string}`, tokenIdBig],
      })

      toast({ title: 'NFT transfer sent', description: `Tx: ${String(tx)}` })
      // Optionally refresh balances or NFT lists later
    } catch (err) {
      console.error('Error transferring NFT:', err)
      toast({ variant: 'destructive', title: 'Transfer failed', description: String(err) })
    }
  }

  // formatWalletAddress is already provided by the hook

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background">

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="h-32 bg-muted rounded"></div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Don't show profile if user is not logged in
  if (!mounted || !userLoggedIn) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">


      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>

          {/* Profile Header */}
          <div className="mb-8">
            <div className="flex items-start gap-6">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-10 w-10 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">
                    {userProfile?.username || currentUser?.email?.split('@')[0] || 'User'}
                  </h1>
                  <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                        <DialogDescription>
                          Update your profile information
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            placeholder="Enter your username"
                            value={editUsername}
                            onChange={(e) => setEditUsername(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">
                            This is how other users will see you on QuiFlix
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input
                            value={currentUser?.email || ''}
                            disabled
                            className="bg-muted"
                          />
                          <p className="text-xs text-muted-foreground">
                            Email cannot be changed
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setEditDialogOpen(false)}
                          disabled={isSaving}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleSaveProfile} disabled={isSaving}>
                          {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <p className="text-muted-foreground mb-1">
                  {currentUser?.email}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Manage your QuiFlix account and view your digital film collection
                </p>
                <div className="flex items-center gap-2">
                  {isConnected ? (
                    <Badge variant="secondary" className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                      Wallet Connected
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-orange-500 rounded-full animate-pulse" />
                      Setting up wallet...
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Wallet Information */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Wallet Details
                    {!isConnected && (
                      <div className="h-2 w-2 bg-orange-500 rounded-full animate-pulse ml-auto" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isConnected ? (
                    <>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Address</label>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-sm bg-muted px-2 py-1 rounded flex-1">
                            {formatWalletAddress(address!)}
                          </code>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={copyAddress}
                            className="flex items-center gap-1"
                          >
                            {copied ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Click to copy full address
                        </p>
                      </div>

                      <Separator />

                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Network</label>
                        <p className="text-sm mt-1">Lisk Network</p>
                        <p className="text-sm mt-1">Base Network</p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Balance</label>
                        <p className="text-sm mt-1">{balance} USDT</p>
                        <p className="text-xs text-muted-foreground">Balance updates automatically</p>
                      </div>
                    </>
                  ) : walletError ? (
                    <div className="space-y-4">
                      <div className="text-center py-8">
                        <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <div className="h-4 w-4 bg-red-500 rounded-full"></div>
                        </div>
                        <h3 className="text-sm font-medium mb-2 text-red-600">Wallet Setup Failed</h3>
                        <p className="text-xs text-muted-foreground mb-4">
                          {walletError}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.location.reload()}
                        >
                          Retry
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <h3 className="text-sm font-medium mb-2">Setting Up Your Wallet</h3>
                        <p className="text-xs text-muted-foreground">
                          We're creating your secure custodial wallet. This will only take a moment.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6 text-center">
                    <Film className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-sm text-muted-foreground">Films Owned</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <Trophy className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-sm text-muted-foreground">NFTs Collected</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <Download className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-sm text-muted-foreground">Downloads</p>
                  </CardContent>
                </Card>
              </div>

              {/* My Films Section */}
              <Card>
                <CardHeader>
                  <CardTitle>My Film Collection</CardTitle>
                  <CardDescription>
                    Films you own and can watch anytime
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Film className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No films yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start building your collection by purchasing films
                    </p>
                    <Button onClick={() => router.push('/films')}>
                      Browse Films
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Account Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Account Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setEditDialogOpen(true)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Download Data
                  </Button>
                  <Button variant="outline" className="w-full justify-start" disabled>
                    <Settings className="h-4 w-4 mr-2" />
                    Preferences
                    <Badge variant="secondary" className="ml-auto text-xs">Soon</Badge>
                  </Button>
                </CardContent>
              </Card>

              {/* Onramp / Offramp Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Onramp / Offramp (KSH ↔ Stablecoin)</CardTitle>
                  <CardDescription>
                    Use this section to onramp or offramp KSH to USDT or USDC on Lisk Sepolia. Connect your offramp provider later.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount-ksh">Amount (KSH)</Label>
                      <Input
                        id="amount-ksh"
                        placeholder="Enter amount in KSH"
                        value={amountKsh}
                        onChange={(e) => setAmountKsh(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="token-select">Stablecoin</Label>
                      <select
                        id="token-select"
                        className="w-full rounded border bg-background px-3 py-2"
                        value={selectedToken}
                        onChange={(e) => setSelectedToken(e.target.value as 'USDT' | 'USDC')}
                      >
                        <option value="USDT">USDT</option>
                        <option value="USDC">USDC</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recipient">Recipient Address</Label>
                    <Input
                      id="recipient"
                      placeholder="0x..."
                      value={recipient || ''}
                      onChange={(e) => setRecipient(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Recipient address where stablecoins will be delivered (your wallet address by default).</p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => toast({ title: 'Onramp placeholder', description: 'Onramp flow not yet connected. You will integrate an offramp provider here.' })}
                      className="flex-1"
                    >
                      Onramp KSH → {selectedToken}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => toast({ title: 'Offramp placeholder', description: 'Offramp flow not yet connected. You will integrate an offramp provider here.' })}
                      className="flex-1"
                    >
                      Offramp {selectedToken} → KSH
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        {/* Wallet Manager Dialog */}
        <Dialog open={walletDialogOpen} onOpenChange={setWalletDialogOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Wallet Manager</DialogTitle>
              <DialogDescription>
                View balances and perform transactions from your custodial wallet.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label>Address</Label>
                <code className="block bg-muted px-2 py-1 rounded mt-1">{address}</code>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label>ETH Balance</Label>
                  <div className="text-lg font-medium">{ethBalance} ETH</div>
                </div>
                <div className="space-y-1">
                  <Label>USDT</Label>
                  <div className="text-lg font-medium">{usdtBalanceLocal} USDT</div>
                </div>
                <div className="space-y-1">
                  <Label>USDC</Label>
                  <div className="text-lg font-medium">{usdcBalanceLocal} USDC</div>
                </div>
              </div>

              <div>
                <Separator />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Send ETH</Label>
                  <Input placeholder="Recipient address" value={sendRecipient || ''} onChange={(e) => setSendRecipient(e.target.value)} />
                  <Input placeholder="Amount (ETH)" value={sendAmount} onChange={(e) => setSendAmount(e.target.value)} />
                  <div className="flex gap-2">
                    <Button onClick={handleSendEth} className="flex-1">Send</Button>
                    <Button variant="outline" onClick={() => { setSendRecipient(address); setSendAmount('') }}>Reset</Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Transfer NFT</Label>
                  <Input placeholder="NFT Contract (0x...)" value={nftContract} onChange={(e) => setNftContract(e.target.value)} />
                  <Input placeholder="Token ID" value={nftTokenId} onChange={(e) => setNftTokenId(e.target.value)} />
                  <Input placeholder="Recipient" value={sendRecipient || ''} onChange={(e) => setSendRecipient(e.target.value)} />
                  <div className="flex gap-2">
                    <Button onClick={handleSendNft} className="flex-1">Transfer NFT</Button>
                    <Button variant="outline" onClick={() => { setNftContract(''); setNftTokenId('') }}>Reset</Button>
                  </div>
                </div>
              </div>
              {ownedNfts.length > 0 && (
                <div>
                  <Separator />
                  <div className="mt-3">
                    <Label>Owned NFTs</Label>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      {ownedNfts.map((n) => (
                        <div key={`${n.contract}-${n.tokenId}`} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <div className="text-sm font-medium">Token #{n.tokenId}</div>
                            <div className="text-xs text-muted-foreground">{n.contract}</div>
                            {n.tokenURI && <div className="text-xs truncate">{n.tokenURI}</div>}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" onClick={() => { setNftContract(n.contract); setNftTokenId(n.tokenId); setSendRecipient(address); toast({ title: 'NFT selected', description: `Token ${n.tokenId} selected for transfer` }) }}>Select</Button>
                            <Button size="sm" variant="outline" onClick={() => { setNftContract(n.contract); setNftTokenId(n.tokenId); setSendRecipient(address); handleSendNft() }}>Transfer</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setWalletDialogOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
