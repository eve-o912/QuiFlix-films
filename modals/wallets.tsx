"use client"


import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface WalletsModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	trigger?: React.ReactNode
}

export function WalletsModal({ open, onOpenChange, trigger }: WalletsModalProps) {
	const [selected, setSelected] = useState<string | null>(null)

	const walletOptions = [
		{
			key: "metamask",
			label: "Connect with MetaMask",
			img: "/metamask.webp",
			onClick: () => alert('MetaMask connect (mock)')
		},
		{
			key: "walletconnect",
			label: "Connect with WalletConnect",
			img: "/walletconnect.png",
			onClick: () => alert('WalletConnect (mock)')
		},
		{
			key: "coinbase",
			label: "Connect with Coinbase Wallet",
			img: "/coinbase.webp",
			onClick: () => alert('Coinbase Wallet (mock)')
		},
	]

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
					{walletOptions.map(option => (
						<Button
							key={option.key}
							variant="outline"
							className={`flex items-center gap-2 justify-center border-2 transition-colors ${selected === option.key ? 'border-primary text-primary bg-primary/10' : 'border-primary/30'} `}
							onClick={() => {
								setSelected(option.key)
								option.onClick()
							}}
						>
							<img src={option.img} alt={option.label} className="h-6 w-6" />
							{option.label}
						</Button>
					))}
					<div className="relative flex items-center py-2">
						<div className="flex-grow border-t border-muted" />
						<span className="mx-4 text-muted-foreground text-xs">or</span>
						<div className="flex-grow border-t border-muted" />
					</div>
					<Button
						variant="secondary"
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
