"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useConnect, useAccount, useDisconnect } from 'wagmi'
import { metaMask, walletConnect, coinbaseWallet } from 'wagmi/connectors'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'

interface WalletsModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	trigger?: React.ReactNode
	redirectTo?: string
}

export function WalletsModal({ open, onOpenChange, trigger, redirectTo = '/films' }: WalletsModalProps) {
	const [selected, setSelected] = useState<string | null>(null)
	const [isConnecting, setIsConnecting] = useState(false)
	const { connect, connectors, error, isPending } = useConnect()
	const { isConnected, address } = useAccount()
	const { disconnect } = useDisconnect()
	const router = useRouter()
	const { toast } = useToast()

	const handleConnect = async (connector: any, key: string) => {
		setSelected(key)
		setIsConnecting(true)
		try {
			await connect({ connector })
			// Show success toast
			toast({
				title: "Wallet Connected!",
				description: "Successfully connected to your wallet. Redirecting to films...",
			})
			// Close modal and redirect to specified page on successful connection
			setTimeout(() => {
				onOpenChange(false)
				setIsConnecting(false)
				router.push(redirectTo)
			}, 1500)
		} catch (error) {
			console.error('Connection failed:', error)
			toast({
				title: "Connection Failed",
				description: "Failed to connect to wallet. Please try again.",
				variant: "destructive",
			})
			setIsConnecting(false)
		}
	}

	const walletOptions = [
		{
			key: "metamask",
			label: "Connect with MetaMask",
			img: "/metamask.webp",
			connector: metaMask(),
			description: "Connect using MetaMask browser extension"
		},
		{
			key: "walletconnect",
			label: "Connect with WalletConnect",
			img: "/walletconnect.png",
			connector: walletConnect({ 
				projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id-here'
			}),
			description: "Scan with your mobile wallet"
		},
		{
			key: "coinbase",
			label: "Connect with Coinbase Wallet",
			img: "/coinbase.webp",
			connector: coinbaseWallet({
				appName: 'QuiFlix',
				appLogoUrl: '/logo.png'
			}),
			description: "Connect using Coinbase Wallet"
		},
	]

	// If already connected, show account info
	if (isConnected && address) {
		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				{trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
				<DialogContent className="max-w-md w-full">
					<DialogHeader>
						<DialogTitle>Wallet Connected</DialogTitle>
						<DialogDescription>
							Your wallet is successfully connected.
						</DialogDescription>
					</DialogHeader>
					<div className="flex flex-col gap-4 mt-4">
						<div className="p-4 bg-green-50 border border-green-200 rounded-lg">
							<p className="text-sm font-medium text-green-800">Connected Address:</p>
							<p className="text-xs text-green-600 break-all">{address}</p>
						</div>
						<Button
							variant="outline"
							onClick={() => {
								disconnect()
								onOpenChange(false)
							}}
							className="w-full"
						>
							Disconnect Wallet
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			{trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
			<DialogContent className="max-w-md w-full">
				<DialogHeader>
					<DialogTitle>Connect Your Wallet</DialogTitle>
					<DialogDescription>
						Choose a wallet to connect or continue with Google to get started.
					</DialogDescription>
				</DialogHeader>
				<div className="flex flex-col gap-4 mt-4">
					{error && (
						<div className="p-3 bg-red-50 border border-red-200 rounded-lg">
							<p className="text-sm text-red-600">
								Connection failed: {error.message}
							</p>
						</div>
					)}
					{walletOptions.map(option => (
						<Button
							key={option.key}
							variant="outline"
							disabled={isConnecting || isPending}
							className={`flex flex-col items-start gap-2 p-4 h-auto border-2 transition-colors ${
								selected === option.key && isConnecting 
									? 'border-primary text-primary bg-primary/10' 
									: 'border-primary/30 hover:border-primary/50'
							}`}
							onClick={() => handleConnect(option.connector, option.key)}
						>
							<div className="flex items-center gap-3 w-full">
								<img src={option.img} alt={option.label} className="h-8 w-8" />
								<div className="flex-1 text-left">
									<div className="font-medium">{option.label}</div>
									<div className="text-xs text-muted-foreground">{option.description}</div>
								</div>
								{selected === option.key && isConnecting && (
									<div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
								)}
							</div>
						</Button>
					))}
					<div className="relative flex items-center py-2">
						<div className="flex-grow border-t border-muted" />
						<span className="mx-4 text-muted-foreground text-xs">or</span>
						<div className="flex-grow border-t border-muted" />
					</div>
					<Button
						variant="secondary"
						disabled={isConnecting}
						className={`flex items-center gap-2 justify-center border-2 transition-colors ${selected === 'google' ? 'border-primary text-primary bg-primary/10' : 'border-primary/30'}`}
						onClick={() => {
							setSelected('google')
							alert('Continue with Google (mock)')
						}}
					>
						<img src="/googleicon.png" alt="Google" className="h-5 w-5" />
						Continue with Google
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}
