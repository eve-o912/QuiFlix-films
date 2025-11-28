"use client"

import { useState, useEffect } from 'react'
import { Wallet, Copy, RefreshCw, Plus, Eye, EyeOff, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react'

// Token configurations with correct addresses
const TOKENS = {
  lisk: {
    name: 'Lisk',
    chainId: 1135,
    rpcUrl: 'https://rpc.api.lisk.com',
    explorer: 'https://blockscout.lisk.com',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    tokens: [
      {
        symbol: 'USDC',
        name: 'Bridged USD Coin',
        address: '0xf242275d3a6527d877f2c927a82d9b057609cc71',
        decimals: 6
      },
      {
        symbol: 'USDT',
        name: 'Tether USD',
        address: '0x05D032ac25d322df992303dCa074EE7392C117b9',
        decimals: 6
      }
    ]
  },
  base: {
    name: 'Base',
    chainId: 8453,
    rpcUrl: 'https://mainnet.base.org',
    explorer: 'https://basescan.org',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    tokens: [
      {
        symbol: 'USDC',
        name: 'USD Coin',
        address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        decimals: 6
      },
      {
        symbol: 'USDT',
        name: 'Bridged Tether USD',
        address: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
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
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function'
  }
]

export default function CustodialWalletCard() {
  const [walletData, setWalletData] = useState(null)
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [copied, setCopied] = useState(null)
  const [selectedNetwork, setSelectedNetwork] = useState('lisk')
  const [tokenBalances, setTokenBalances] = useState({})
  const [loadingBalances, setLoadingBalances] = useState(false)
  const [metamaskConnected, setMetamaskConnected] = useState(false)
  const [metamaskAddress, setMetamaskAddress] = useState(null)
  const [showFundDialog, setShowFundDialog] = useState(false)
  const [toast, setToast] = useState(null)
  const [selectedWalletType, setSelectedWalletType] = useState('custodial')

  useEffect(() => {
    generateWallet()
  }, [])

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const showToast = (title, description, variant = 'default') => {
    setToast({ title, description, variant })
  }

  const generateWallet = async () => {
    try {
      const privateKeyArray = new Uint8Array(32)
      crypto.getRandomValues(privateKeyArray)
      const privateKey = '0x' + Array.from(privateKeyArray)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')

      const { ethers } = await import('https://cdn.ethers.io/lib/ethers-5.7.esm.min.js')
      const wallet = new ethers.Wallet(privateKey)

      setWalletData({
        address: wallet.address,
        privateKey: privateKey
      })
    } catch (error) {
      console.error('Error generating wallet:', error)
    }
  }

  const formatAddress = (address) => {
    if (!address) return ''
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(label)
      showToast('Copied!', `${label} copied to clipboard`)
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      showToast('Copy Failed', 'Failed to copy to clipboard', 'destructive')
    }
  }

  const connectMetaMask = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        showToast('MetaMask Not Found', 'Please install MetaMask to continue', 'destructive')
        return
      }

      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      })
      
      const currentChainId = await window.ethereum.request({ 
        method: 'eth_chainId' 
      })
      
      const network = TOKENS[selectedNetwork]
      const expectedChainId = `0x${network.chainId.toString(16)}`
      
      if (currentChainId !== expectedChainId) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: expectedChainId }],
          })
        } catch (switchError) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: expectedChainId,
                chainName: network.name,
                nativeCurrency: network.nativeCurrency,
                rpcUrls: [network.rpcUrl],
                blockExplorerUrls: [network.explorer]
              }]
            })
          } else {
            throw switchError
          }
        }
      }

      setMetamaskAddress(accounts[0])
      setMetamaskConnected(true)
      setSelectedWalletType('metamask')
      
      showToast('MetaMask Connected!', `Connected to ${network.name}`)
      await fetchMetaMaskBalances(accounts[0])
    } catch (error) {
      showToast('Connection Failed', error.message || 'Failed to connect MetaMask', 'destructive')
    }
  }

  const fetchMetaMaskBalances = async (walletAddress) => {
    setLoadingBalances(true)
    try {
      const { ethers } = await import('https://cdn.ethers.io/lib/ethers-5.7.esm.min.js')
      const network = TOKENS[selectedNetwork]
      const provider = new ethers.providers.Web3Provider(window.ethereum)

      const ethBalance = await provider.getBalance(walletAddress)
      const formattedEthBalance = ethers.utils.formatEther(ethBalance)

      const balances = {
        ETH: parseFloat(formattedEthBalance).toFixed(6)
      }

      for (const token of network.tokens) {
        try {
          const contract = new ethers.Contract(token.address, ERC20_ABI, provider)
          const balance = await contract.balanceOf(walletAddress)
          balances[token.symbol] = parseFloat(ethers.utils.formatUnits(balance, token.decimals)).toFixed(2)
        } catch (err) {
          balances[token.symbol] = '0.00'
        }
      }

      setTokenBalances(balances)
    } catch (error) {
      console.error('Error fetching balances:', error)
      showToast('Error', 'Failed to fetch wallet balances', 'destructive')
    } finally {
      setLoadingBalances(false)
    }
  }

  const fetchCustodialBalances = async () => {
    if (!walletData?.address) return
    
    setLoadingBalances(true)
    setSelectedWalletType('custodial')
    try {
      const { ethers } = await import('https://cdn.ethers.io/lib/ethers-5.7.esm.min.js')
      const network = TOKENS[selectedNetwork]
      const provider = new ethers.providers.JsonRpcProvider(network.rpcUrl)

      const ethBalance = await provider.getBalance(walletData.address)
      const formattedEthBalance = ethers.utils.formatEther(ethBalance)

      const balances = {
        ETH: parseFloat(formattedEthBalance).toFixed(6)
      }

      for (const token of network.tokens) {
        try {
          const contract = new ethers.Contract(token.address, ERC20_ABI, provider)
          const balance = await contract.balanceOf(walletData.address)
          balances[token.symbol] = parseFloat(ethers.utils.formatUnits(balance, token.decimals)).toFixed(2)
        } catch (err) {
          balances[token.symbol] = '0.00'
        }
      }

      setTokenBalances(balances)
      showToast('Custodial Wallet Selected', 'Using your custodial wallet')
    } catch (error) {
      console.error('Error fetching balances:', error)
      showToast('Error', 'Failed to fetch wallet balances', 'destructive')
    } finally {
      setLoadingBalances(false)
    }
  }

  if (!walletData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Generating wallet...</div>
      </div>
    )
  }

  const network = TOKENS[selectedNetwork]
  const displayAddress = selectedWalletType === 'metamask' ? metamaskAddress : walletData.address

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 sm:p-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          toast.variant === 'destructive' 
            ? 'bg-red-500 text-white' 
            : 'bg-white text-gray-900'
        } animate-in slide-in-from-top`}>
          <div className="font-semibold">{toast.title}</div>
          <div className="text-sm opacity-90">{toast.description}</div>
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">Multi-Chain Wallet</h1>
              <p className="text-purple-200 text-sm">Custodial & MetaMask Support</p>
            </div>
            <div className="px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-green-200 text-sm font-medium">Active</span>
            </div>
          </div>

          {/* Network Selector */}
          <div className="mb-6">
            <label className="text-purple-200 text-sm font-medium mb-2 block">Select Network</label>
            <div className="flex gap-2">
              {Object.entries(TOKENS).map(([key, net]) => (
                <button
                  key={key}
                  onClick={() => setSelectedNetwork(key)}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                    selectedNetwork === key
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {net.name}
                </button>
              ))}
            </div>
          </div>

          {/* Wallet Type Indicator */}
          <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg">
            <div className="flex items-center gap-2 text-blue-200">
              <Wallet className="h-4 w-4" />
              <span className="text-sm font-medium">
                Active: {selectedWalletType === 'metamask' ? 'MetaMask' : 'Custodial Wallet'}
              </span>
            </div>
          </div>

          {/* Wallet Address */}
          <div className="space-y-2 mb-4">
            <label className="text-purple-200 text-sm font-medium">Wallet Address</label>
            <div className="flex gap-2">
              <div className="flex-1 bg-black/30 rounded-lg p-3 font-mono text-sm text-white break-all">
                {displayAddress}
              </div>
              <button
                onClick={() => copyToClipboard(displayAddress, 'Address')}
                className="px-4 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                {copied === 'Address' ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <Copy className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </div>

          {/* Token Balances */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <label className="text-purple-200 text-sm font-medium">Balances</label>
              <button
                onClick={() => selectedWalletType === 'metamask' ? fetchMetaMaskBalances(metamaskAddress) : fetchCustodialBalances()}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 text-white ${loadingBalances ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="space-y-2">
              {/* ETH Balance */}
              <div className="bg-black/30 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    Ξ
                  </div>
                  <div>
                    <div className="text-white font-medium">ETH</div>
                    <div className="text-purple-200 text-sm">Ether</div>
                  </div>
                </div>
                <div className="text-white font-bold text-lg">
                  {loadingBalances ? '...' : (tokenBalances.ETH || '0.000000')}
                </div>
              </div>

              {/* Token Balances */}
              {network.tokens.map((token) => (
                <div key={token.symbol} className="bg-black/30 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                      token.symbol === 'USDC' 
                        ? 'bg-gradient-to-br from-blue-500 to-blue-700'
                        : 'bg-gradient-to-br from-green-500 to-green-700'
                    }`}>
                      {token.symbol[0]}
                    </div>
                    <div>
                      <div className="text-white font-medium">{token.symbol}</div>
                      <div className="text-purple-200 text-sm">{token.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold text-lg">
                      {loadingBalances ? '...' : (tokenBalances[token.symbol] || '0.00')}
                    </div>
                    <a
                      href={`${network.explorer}/token/${token.address}?a=${displayAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-300 text-xs hover:text-purple-200 flex items-center gap-1"
                    >
                      View <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Private Key (Custodial Only) */}
          {selectedWalletType === 'custodial' && (
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <label className="text-orange-400 text-sm font-medium">Private Key</label>
                <button
                  onClick={() => setShowPrivateKey(!showPrivateKey)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-2"
                >
                  {showPrivateKey ? <EyeOff className="w-4 h-4 text-white" /> : <Eye className="w-4 h-4 text-white" />}
                  <span className="text-white text-sm">{showPrivateKey ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              {showPrivateKey ? (
                <div className="space-y-2">
                  <div className="font-mono text-xs bg-orange-950/50 p-3 rounded border border-orange-500/30 break-all text-orange-200">
                    {walletData.privateKey}
                  </div>
                  <button
                    onClick={() => copyToClipboard(walletData.privateKey, 'Private Key')}
                    className="w-full py-2 px-4 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4 text-white" />
                    <span className="text-white text-sm">Copy Private Key</span>
                  </button>
                  <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-red-400 mt-0.5" />
                      <p className="text-red-200 text-xs">
                        <strong>Warning:</strong> Never share your private key! Anyone with access can control your wallet.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="font-mono text-xs bg-black/30 p-3 rounded border border-white/10 text-white">
                  {'•'.repeat(64)}
                </div>
              )}
            </div>
          )}

          {/* Fund Wallet Button */}
          <button
            onClick={() => setShowFundDialog(!showFundDialog)}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg transition-all flex items-center justify-center gap-2 text-white font-medium shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Fund Wallet
          </button>

          {/* Wallet Selection Dialog */}
          {showFundDialog && (
            <div className="mt-4 space-y-3 p-4 bg-black/30 rounded-lg border border-white/10">
              <h3 className="text-white font-semibold text-lg">Choose Wallet Type</h3>
              <p className="text-purple-200 text-sm">Select which wallet you want to use on {network.name}</p>
              
              <button
                onClick={() => {
                  fetchCustodialBalances()
                  setShowFundDialog(false)
                }}
                className="w-full p-4 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-left"
              >
                <div className="flex items-start gap-3">
                  <Wallet className="h-5 w-5 text-purple-400 mt-0.5" />
                  <div>
                    <div className="text-white font-semibold">Custodial Wallet</div>
                    <div className="text-purple-200 text-sm">Use your built-in wallet</div>
                    <div className="text-xs font-mono text-purple-300 mt-1">
                      {formatAddress(walletData.address)}
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  connectMetaMask()
                  setShowFundDialog(false)
                }}
                className="w-full p-4 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-left"
              >
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">
                    M
                  </div>
                  <div>
                    <div className="text-white font-semibold">MetaMask</div>
                    <div className="text-purple-200 text-sm">Connect your MetaMask wallet</div>
                    {metamaskConnected && (
                      <div className="text-xs font-mono text-purple-300 mt-1">
                        {formatAddress(metamaskAddress)}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Info Alert */}
          <div className="mt-4 p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-400 mt-0.5" />
              <p className="text-blue-200 text-xs">
                This wallet supports both custodial (built-in) and MetaMask connections. 
                Switch networks to see USDC/USDT balances on Lisk and Base.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
