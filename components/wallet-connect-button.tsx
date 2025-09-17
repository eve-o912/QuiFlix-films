'use client'

import { Button } from '@/components/ui/button'
import { WalletsModal } from '@/modals/wallets'
import { useWallet } from '@/hooks/use-wallet'
import { useState } from 'react'

interface WalletConnectButtonProps {
  className?: string
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  redirectTo?: string
}

export function WalletConnectButton({ 
  className, 
  variant = 'default', 
  size = 'default',
  redirectTo = '/films'
}: WalletConnectButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { isConnected, address, formatAddress, disconnectWallet } = useWallet()

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size={size}
          className={className}
          onClick={() => setIsModalOpen(true)}
        >
          {formatAddress(address)}
        </Button>
        <WalletsModal 
          open={isModalOpen} 
          onOpenChange={setIsModalOpen}
          redirectTo={redirectTo}
        />
      </div>
    )
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setIsModalOpen(true)}
      >
        Connect Wallet
      </Button>
      <WalletsModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
        redirectTo={redirectTo}
      />
    </>
  )
}
