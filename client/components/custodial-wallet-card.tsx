"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Copy, Wallet, RefreshCw, Plus, Eye, EyeOff, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react'
import { useCustodialWallet } from '@/hooks/useCustodialWallet'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/useAuth'

// Token configurations with CORRECT addresses
const TOKENS = {
  lisk: {
    name: 'Lisk',
    chainId: 1135,
    rpcUrl: 'https://rpc.api.lisk.com',
    explorer: 'https://blockscout.lisk.com',
    tokens: [
      {
        symbol: 'USDC',
        name: 'Bridged USD Coin',
        address: '0xf242275d3a6527d877f2c927a82d9b057609cc71', // ✅ CORRECT
        decimals: 6
      },
      {
        symbol: 'USDT',
        name: 'Tether USD',
        address: '0x05D032ac25d322df992303dCa074EE7392C117b9', // ✅ CORRECT
        decimals: 6
      }
    ]
  },
  base: {
    name: 'Base',
    chainId: 8453,
    rpcUrl: 'https://mainnet.base.org',
    explorer: 'https://basescan.org',
    tokens: [
      {
        symbol: 'USDC',
        name: 'USD Coin',
        address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // ✅ CORRECT
        decimals: 6
      },
      {
        symbol: 'USDT',
        name: 'Bridged Tether USD',
        address: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2', // ✅ CORRECT
        decimals: 6
      }
    ]
  }
}

const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function'
  }
]

export function CustodialWalletCard() {
  const { currentUser, userLoggedIn } = useAuth()
  const {
    wallet,
    address,
    balance,
    tokenBalances,
    isLoading,
    error,
    refreshBalance,
    fundWallet,
    formatAddress,
  } = useCustodialWallet()
  
  const { toast } = useToast()
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [showFundDialog, setShowFundDialog] = useState(false)
  const [selectedNetwork, setSelectedNetwork] = useState<'lisk' | 'base'>('lisk')
  const [metamaskConnected, setMetamaskConnected] = useState(false)
  const [metamaskAddress, setMetamaskAddress] = useState<string | null>(null)
  const [metamaskBalances, setMetamaskBalances] = useState<Record<string, string>>({})
  const [loadingMetamask, setLoadingMetamask] = useState(false)
  const [walletType, setWalletType] = useState<'custodial' | 'metamask'>('custodial')

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(label)
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`
      })
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Copy Failed",
        description: "Failed to copy to clipboard"
      })
    }
  }

  const connectMetaMask = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        toast({
          variant: "destructive",
          title: "MetaMask Not Found",
          description: "Please install MetaMask to continue"
        })
        return
      }

      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      })
      
      const network = TOKENS[selectedNetwork]
      const expectedChainId = `0x${network.chainId.toString(16)}`
      
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: expectedChainId }],
        })
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: expectedChainId,
              chainName: network.name,
              rpcUrls: [network.rpcUrl],
              blockExplorerUrls: [network.explorer]
            }]
          })
        }
      }

      setMetamaskAddress(accounts[0])
      setMetamaskConnected(true)
      setWalletType('metamask')
      
      toast({
        title: "MetaMask Connected!",
        description: `Connected to ${network.name}`
      })

      // Fetch MetaMask balances
      await fetchMetaMaskBalances(accounts[0])
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: error.message || "Failed to connect MetaMask"
      })
    }
  }

  const fetchMetaMaskBalances = async (walletAddress: string) => {
    setLoadingMetamask(true)
    try {
      const { ethers } = await import('ethers')
      const network = TOKENS[selectedNetwork]
      const provider = new ethers.providers.Web3Provider(window.ethereum)

      const balances: Record<string, string> = {}

      // Fetch token balances
      for (const token of network.tokens) {
        try {
          const contract = new ethers.Contract(token.address, ERC20_ABI, provider)
          const balance = await contract.balanceOf(walletAddress)
          balances[token.symbol] = ethers.utils.formatUnits(balance, token.decimals)
        } catch (err) {
          balances[token.symbol] = '0.00'
        }
      }

      setMetamaskBalances(balances)
    } catch (error) {
      console.error('Error fetching balances:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch wallet balances"
      })
    } finally {
      setLoadingMetamask(false)
    }
  }

  const useCustodialWalletOption = async () => {
    setWalletType('custodial')
    toast({
      title: "Custodial Wallet Selected",
      description: "Using your custodial wallet"
    })
    await refreshBalance()
  }

  const handleFundWallet = async () => {
    const success = await fundWallet('1.0')
    if (success) {
      toast({
        title: "Wallet Funded!",
        description: "Added 1 ETH to your wallet for testing"
      })
    }
  }

  const handleRefreshBalance = async () => {
    if (walletType === 'metamask' && metamaskAddress) {
      await fetchMetaMaskBalances(metamaskAddress)
    } else {
      await refreshBalance()
    }
    toast({
      title: "Balance Updated",
      description: "Wallet balance has been refreshed"
    })
  }

  if (!userLoggedIn || !currentUser) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Custodial Wallet
          </CardTitle>
          <CardDescription>
            Please sign in to access your custodial wallet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              A custodial wallet will be automatically created when you sign up
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Custodial Wallet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (isLoading || !wallet) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Custodial Wallet
          </CardTitle>
          <CardDescription>
            Creating your secure wallet...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const network = TOKENS[selectedNetwork]
  const displayAddress = walletType === 'metamask' ? metamaskAddress : address
  const displayBalances = walletType === 'metamask' ? metamaskBalances : 
    Object.fromEntries(tokenBalances.map(tb => [tb.symbol, tb.balance]))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Custodial Wallet
          <Badge variant="secondary" className="ml-auto">
            <CheckCircle className="h-3 w-3 mr-1" />
            {walletType === 'metamask' ? 'MetaMask' : 'Custodial'}
          </Badge>
        </CardTitle>
        <CardDescription>
          Your secure wallet tied to {currentUser.email}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Network Selector */}
        <div className="space-y-2">
          <span className="text-sm font-medium">Network</span>
          <div className="flex gap-2">
            {(Object.keys(TOKENS) as Array<keyof typeof TOKENS>).map((key) => (
              <Button
                key={key}
                variant={selectedNetwork === key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedNetwork(key)}
                className="flex-1"
              >
                {TOKENS[key].name}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Wallet Address */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Wallet Address</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(displayAddress!, 'Address')}
              className="h-6 px-2"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
          <div className="font-mono text-sm bg-muted p-2 rounded border">
            {formatAddress(displayAddress)}
          </div>
        </div>

        {/* Balance */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Balance</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefreshBalance}
              disabled={isLoading || loadingMetamask}
              className="h-6 px-2"
            >
              <RefreshCw className={`h-3 w-3 ${(isLoading || loadingMetamask) ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{balance}</span>
            <span className="text-sm text-muted-foreground">ETH</span>
          </div>
        </div>

        {/* Token Balances */}
        {Object.keys(displayBalances).length > 0 && (
          <div className="space-y-2">
            <span className="text-sm font-medium">Token Balances</span>
            <div className="space-y-2">
              {network.tokens.map((token) => (
                <div key={token.symbol} className="flex items-center justify-between bg-muted p-3 rounded">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                      token.symbol === 'USDC' ? 'bg-blue-500' : 'bg-green-500'
                    }`}>
                      {token.symbol[0]}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{token.symbol}</div>
                      <div className="text-xs text-muted-foreground">{token.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">
                      {(isLoading || loadingMetamask) ? '...' : (parseFloat(displayBalances[token.symbol] || '0').toFixed(2))}
                    </div>
                    <a
                      href={`${network.explorer}/token/${token.address}?a=${displayAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      View <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Private Key (Custodial Only) */}
        {walletType === 'custodial' && (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-orange-600">Private Key</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPrivateKey(!showPrivateKey)}
                  className="h-6 px-2"
                >
                  {showPrivateKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </Button>
              </div>
              {showPrivateKey ? (
                <div className="space-y-2">
                  <div className="font-mono text-xs bg-orange-50 dark:bg-orange-950 p-2 rounded border border-orange-200 dark:border-orange-800 break-all">
                    {wallet.privateKey}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(wallet.privateKey, 'Private Key')}
                      className="text-xs"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <Alert variant="destructive" className="text-xs">
                    <AlertCircle className="h-3 w-3" />
                    <AlertDescription>
                      Never share your private key! Anyone with access can control your wallet.
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <div className="font-mono text-xs bg-muted p-2 rounded border">
                  {'•'.repeat(64)}
                </div>
              )}
            </div>
            <Separator />
          </>
        )}

        {/* Actions */}
        <Dialog open={showFundDialog} onOpenChange={setShowFundDialog}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-1" />
              Fund Wallet
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Choose Wallet to Fund</DialogTitle>
              <DialogDescription>
                Select which wallet you want to use for funding on {network.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 pt-4">
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4"
                onClick={() => {
                  useCustodialWalletOption()
                  setShowFundDialog(false)
                }}
              >
                <div className="flex items-start gap-3 text-left">
                  <Wallet className="h-5 w-5 mt-0.5" />
                  <div>
                    <div className="font-semibold">Custodial Wallet</div>
                    <div className="text-sm text-muted-foreground">
                      Use your built-in wallet
                    </div>
                    <div className="text-xs font-mono text-muted-foreground mt-1">
                      {formatAddress(address)}
                    </div>
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4"
                onClick={() => {
                  connectMetaMask()
                  setShowFundDialog(false)
                }}
              >
                <div className="flex items-start gap-3 text-left">
                  <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    M
                  </div>
                  <div>
                    <div className="font-semibold">MetaMask</div>
                    <div className="text-sm text-muted-foreground">
                      Connect your MetaMask wallet
                    </div>
                    {metamaskConnected && (
                      <div className="text-xs font-mono text-muted-foreground mt-1">
                        {formatAddress(metamaskAddress)}
                      </div>
                    )}
                  </div>
                </div>
              </Button>

              {process.env.NODE_ENV === 'development' && walletType === 'custodial' && (
                <Button onClick={handleFundWallet} disabled={isLoading} className="w-full">
                  Add Test Funds (Dev Only)
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Information */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            This wallet is automatically generated from your email address and stored securely. 
            Choose between your custodial wallet or MetaMask to view balances on {network.name}.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
