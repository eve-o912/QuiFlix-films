'use client';

import { useWeb3 } from '@/hooks/useWeb3';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';
import { useState, useEffect } from 'react';

export function WalletConnect() {
  const { isConnected, connectWallet, signAuthMessage, address } = useWeb3();
  const [mounted, setMounted] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleConnect = async () => {
    try {
      await connectWallet();
      // After connecting, authenticate with backend
      await authenticateWithBackend();
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  };

  const authenticateWithBackend = async () => {
    if (!address) return;

    setAuthenticating(true);
    try {
      // Generate message and sign it
      const message = `QuiFlix Authentication\nWallet: ${address}\nTimestamp: ${Date.now()}`;
      const signature = await signAuthMessage(message);

      // Call backend authentication
      const response = await fetch('/api/users/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: address,
          signature,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const data = await response.json();
      // Store the token
      localStorage.setItem('authToken', data.token);
      console.log('Authenticated successfully');
    } catch (error) {
      console.error('Authentication failed:', error);
    } finally {
      setAuthenticating(false);
    }
  };

  if (!mounted) {
    return (
      <Button disabled className="flex items-center gap-2">
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </Button>
    );
  }

  if (isConnected) {
    return null; // Header handles connected state
  }

  return (
    <Button onClick={handleConnect} disabled={authenticating} className="flex items-center gap-2">
      <Wallet className="h-4 w-4" />
      {authenticating ? 'Authenticating...' : 'Connect Wallet'}
    </Button>
  );
}
