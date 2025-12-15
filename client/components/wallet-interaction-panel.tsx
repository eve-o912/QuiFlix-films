"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Send, FileSignature, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { useCustodialWallet } from '@/hooks/useCustodialWallet'
import { useToast } from '@/components/ui/use-toast'

export function WalletInteractionPanel() {
  const {
    address,
    balance,
    isConnected,
    isLoading,
    error,
    sendTransaction,
    signMessage,
    writeContract,
  } = useCustodialWallet()

  const { toast } = useToast()

  // Transaction state
  const [txForm, setTxForm] = useState({
    to: '',
    amount: ''
  })

  // Message signing state
  const [messageForm, setMessageForm] = useState({
    message: ''
  })

  // Contract interaction state
  const [contractForm, setContractForm] = useState({
    address: '',
    functionName: '',
    args: '',
    value: '0'
  })

  // Results
  const [lastResult, setLastResult] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wallet Interactions</CardTitle>
          <CardDescription>
            Please ensure you have a custodial wallet to interact with blockchain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Sign up or log in to access your custodial wallet
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const handleSendTransaction = async () => {
    if (!txForm.to || !txForm.amount) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Please provide both recipient address and amount"
      })
      return
    }

    try {
      setActionLoading('transaction')
      const hash = await sendTransaction(txForm.to, txForm.amount)
      setLastResult(`Transaction sent: ${hash}`)
      setTxForm({ to: '', amount: '' })
      toast({
        title: "Transaction Sent!",
        description: `Hash: ${hash.slice(0, 10)}...`
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Transaction Failed",
        description: error instanceof Error ? error.message : "Unknown error"
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleSignMessage = async () => {
    if (!messageForm.message.trim()) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Please provide a message to sign"
      })
      return
    }

    try {
      setActionLoading('message')
      const signature = await signMessage(messageForm.message)
      setLastResult(`Message signed: ${signature}`)
      setMessageForm({ message: '' })
      toast({
        title: "Message Signed!",
        description: `Signature: ${signature.slice(0, 20)}...`
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Signing Failed",
        description: error instanceof Error ? error.message : "Unknown error"
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleContractInteraction = async () => {
    if (!contractForm.address || !contractForm.functionName) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Please provide contract address and function name"
      })
      return
    }

    try {
      setActionLoading('contract')
      
      // Parse arguments
      let args: any[] = []
      if (contractForm.args.trim()) {
        try {
          args = JSON.parse(`[${contractForm.args}]`)
        } catch {
          args = contractForm.args.split(',').map(arg => arg.trim())
        }
      }

      const hash = await writeContract({
        address: contractForm.address as `0x${string}`,
        abi: [], // You'll need to provide the actual ABI
        functionName: contractForm.functionName,
        args,
        value: BigInt(Math.floor(parseFloat(contractForm.value || '0') * 1e18))
      })

      setLastResult(`Contract interaction: ${hash}`)
      setContractForm({ address: '', functionName: '', args: '', value: '0' })
      toast({
        title: "Contract Interaction Sent!",
        description: `Hash: ${hash.slice(0, 10)}...`
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Contract Interaction Failed",
        description: error instanceof Error ? error.message : "Unknown error"
      })
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Wallet Interactions
          <Badge variant="outline" className="ml-auto">
            <CheckCircle className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        </CardTitle>
        <CardDescription>
          Interact with your custodial wallet: {address} | Balance: {balance} ETH
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="transaction" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="transaction">Send ETH</TabsTrigger>
            <TabsTrigger value="message">Sign Message</TabsTrigger>
            <TabsTrigger value="contract">Contract</TabsTrigger>
          </TabsList>

          <TabsContent value="transaction" className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="to">Recipient Address</Label>
                <Input
                  id="to"
                  placeholder="0x..."
                  value={txForm.to}
                  onChange={(e) => setTxForm(prev => ({ ...prev, to: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="amount">Amount (ETH)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.001"
                  placeholder="0.1"
                  value={txForm.amount}
                  onChange={(e) => setTxForm(prev => ({ ...prev, amount: e.target.value }))}
                />
              </div>
              <Button 
                onClick={handleSendTransaction} 
                disabled={isLoading || actionLoading === 'transaction'}
                className="w-full"
              >
                {actionLoading === 'transaction' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Transaction
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="message" className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="message">Message to Sign</Label>
                <Textarea
                  id="message"
                  placeholder="Enter your message here..."
                  value={messageForm.message}
                  onChange={(e) => setMessageForm(prev => ({ ...prev, message: e.target.value }))}
                  rows={4}
                />
              </div>
              <Button 
                onClick={handleSignMessage} 
                disabled={isLoading || actionLoading === 'message'}
                className="w-full"
              >
                {actionLoading === 'message' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Signing...
                  </>
                ) : (
                  <>
                    <FileSignature className="h-4 w-4 mr-2" />
                    Sign Message
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="contract" className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="contractAddress">Contract Address</Label>
                <Input
                  id="contractAddress"
                  placeholder="0x..."
                  value={contractForm.address}
                  onChange={(e) => setContractForm(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="functionName">Function Name</Label>
                <Input
                  id="functionName"
                  placeholder="transfer"
                  value={contractForm.functionName}
                  onChange={(e) => setContractForm(prev => ({ ...prev, functionName: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="args">Arguments (comma-separated)</Label>
                <Input
                  id="args"
                  placeholder="0x..., 100"
                  value={contractForm.args}
                  onChange={(e) => setContractForm(prev => ({ ...prev, args: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="value">Value (ETH)</Label>
                <Input
                  id="value"
                  type="number"
                  step="0.001"
                  placeholder="0"
                  value={contractForm.value}
                  onChange={(e) => setContractForm(prev => ({ ...prev, value: e.target.value }))}
                />
              </div>
              <Button 
                onClick={handleContractInteraction} 
                disabled={isLoading || actionLoading === 'contract'}
                className="w-full"
              >
                {actionLoading === 'contract' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Interacting...
                  </>
                ) : (
                  <>
                    
                    Call Contract
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {lastResult && (
          <Alert className="mt-4">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="font-mono text-xs break-all">
              {lastResult}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}