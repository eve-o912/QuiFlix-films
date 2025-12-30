import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useWalletInfo } from '@/hooks/useWalletInfo';

interface WalletStatusProps {
  showCopyButton?: boolean;
  showChainInfo?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
}

/**
 * Reusable component to display wallet connection status
 * Shows wallet type (MetaMask, Coinbase, Custodial), address, and chain
 */
export function WalletStatus({ 
  showCopyButton = true, 
  showChainInfo = true,
  variant = 'default',
  className = '' 
}: WalletStatusProps) {
  const { address, walletType, isConnected, chainName, isCustodial } = useWalletInfo();

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success('Address copied to clipboard');
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getWalletDisplayName = () => {
    switch (walletType) {
      case 'metamask':
        return 'MetaMask';
      case 'coinbase':
        return 'Coinbase Wallet';
      case 'custodial':
        return 'QuiFlix Custodial Wallet';
      default:
        return 'No Wallet';
    }
  };

  const getWalletIcon = () => {
    switch (walletType) {
      case 'metamask':
        return '🦊';
      case 'coinbase':
        return '🔷';
      case 'custodial':
        return '🔐';
      default:
        return '💳';
    }
  };

  if (!isConnected) {
    return (
      <div className={`flex items-center gap-2 px-3 py-1 bg-gray-500/10 text-gray-500 rounded-full text-sm ${className}`}>
        <span className="h-2 w-2 rounded-full bg-gray-500" />
        No Wallet Connected
      </div>
    );
  }

  // Compact variant - just connection status
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm ${className}`}>
        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        Connected
      </div>
    );
  }

  // Detailed variant - full information
  if (variant === 'detailed') {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getWalletIcon()}</span>
            <div>
              <p className="font-semibold">{getWalletDisplayName()}</p>
              <p className="text-xs text-muted-foreground">
                {isCustodial ? 'Managed by QuiFlix' : 'External Wallet'}
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Connected
          </span>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Address</span>
            {showCopyButton && address && (
              <Button
                variant="ghost"
                size="sm"
                onClick={copyAddress}
                className="h-8"
              >
                <Copy className="h-4 w-4" />
              </Button>
            )}
          </div>
          <code className="text-sm bg-background px-3 py-2 rounded block break-all">
            {address ? formatAddress(address) : 'N/A'}
          </code>
        </div>

        {showChainInfo && !isCustodial && (
          <div className="p-3 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">Network</span>
            <p className="text-base font-semibold mt-1">{chainName}</p>
          </div>
        )}

        {showChainInfo && isCustodial && (
          <div className="p-3 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">Network</span>
            <p className="text-base font-semibold mt-1">{chainName} Network</p>
          </div>
        )}
      </div>
    );
  }

  // Default variant - badge with wallet type
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm">
        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        <span className="hidden sm:inline">{getWalletIcon()}</span>
        <span>{getWalletDisplayName()}</span>
      </div>
      
      {address && showCopyButton && (
        <Button
          variant="ghost"
          size="sm"
          onClick={copyAddress}
          className="h-8 px-2"
          title="Copy address"
        >
          <Copy className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
