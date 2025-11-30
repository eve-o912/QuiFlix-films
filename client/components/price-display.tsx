"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info, RefreshCw } from "lucide-react"
import { getPricing, formatPrice, getPreferredCurrency, setPreferredCurrency } from "@/lib/currency"

interface PriceDisplayProps {
  amount: number
  currency: 'KES' | 'USDC' | 'USDT'
  showToggle?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function PriceDisplay({ 
  amount, 
  currency, 
  showToggle = false,
  className = "",
  size = 'md'
}: PriceDisplayProps) {
  // Use user's preferred currency or default to the passed currency
  const [displayCurrency, setDisplayCurrency] = useState<'KES' | 'USDC'>(currency as 'KES' | 'USDC')
  
  // Load preferred currency on mount (client-side only)
  useEffect(() => {
    if (showToggle) {
      const preferred = getPreferredCurrency()
      setDisplayCurrency(preferred)
    }
  }, [showToggle])

  const pricing = getPricing(amount, currency)

  const toggleCurrency = () => {
    const newCurrency = displayCurrency === 'KES' ? 'USDC' : 'KES'
    setDisplayCurrency(newCurrency)
    setPreferredCurrency(newCurrency)
  }

  const displayAmount = displayCurrency === 'KES' ? pricing.kes : pricing.usdc
  const alternateAmount = displayCurrency === 'KES' ? pricing.usdc : pricing.kes
  const alternateCurrency = displayCurrency === 'KES' ? 'USDC' : 'KES'

  // Size variants
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4'
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1 cursor-help">
              <span className={`font-bold ${sizeClasses[size]}`}>
                {formatPrice(displayAmount, displayCurrency)}
              </span>
              <Info className={`${iconSizes[size]} text-muted-foreground opacity-70`} />
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-popover text-popover-foreground">
            <p className="text-xs">
              ≈ {formatPrice(alternateAmount, alternateCurrency)}
            </p>
            {showToggle && (
              <p className="text-xs text-muted-foreground mt-1">
                Click <RefreshCw className="h-2.5 w-2.5 inline" /> to toggle
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {showToggle && (
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCurrency}
          className="h-6 w-6 p-0 hover:bg-accent"
          title={`Switch to ${alternateCurrency}`}
        >
          <RefreshCw className={iconSizes[size]} />
        </Button>
      )}
    </div>
  )
}
