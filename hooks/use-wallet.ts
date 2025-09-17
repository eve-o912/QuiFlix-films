'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useCallback } from 'react'

export function useWallet() {
  const { address, isConnected, isConnecting } = useAccount()
  const { connect, connectors, error } = useConnect()
  const { disconnect } = useDisconnect()

  const connectWallet = useCallback(async (connectorId: string) => {
    const connector = connectors.find(c => c.id === connectorId)
    if (connector) {
      try {
        connect({ connector })
        return true
      } catch (error) {
        console.error('Wallet connection failed:', error)
        return false
      }
    }
    return false
  }, [connect, connectors])

  const disconnectWallet = useCallback(() => {
    disconnect()
  }, [disconnect])

  const formatAddress = useCallback((addr?: string) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }, [])

  return {
    address,
    isConnected,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    formatAddress,
    connectors
  }
}
