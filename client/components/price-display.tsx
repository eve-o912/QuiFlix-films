"use client"

import { useState, useEffect } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Exchange rates
const EXCHANGE_RATES = {
  USD_TO_KES: 129.5,
  USDC_TO_USDT: 1, // 1:1 parity
}

interface PriceDisplayProps {
  amount?: number // Made optional with default
  usdcPrice?: number // Alternative prop name for backward compatibility
  currency?: "USDC" | "USDT" | "KES"
  showToggle?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

export function PriceDisplay({
  amount,
  usdcPrice, // Alternative prop for backward compatibility
  currency = "USDC",
  showToggle = false,
  size = "md",
  className = "",
}: PriceDisplayProps) {
  // Safely handle undefined amounts - use whichever prop is provided
  const safeAmount = amount ?? usdcPrice ?? 0

  // Calculate all three currency values
  const usdcAmount = safeAmount
  const usdtAmount = safeAmount * EXCHANGE_RATES.USDC_TO_USDT
  const kesAmount = safeAmount * EXCHANGE_RATES.USD_TO_KES

  // Size classes
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl font-bold",
  }

  // Format with safe toFixed
  const formatAmount = (value: number, decimals: number = 2): string => {
    if (typeof value !== 'number' || isNaN(value)) {
      return '0.00'
    }
    return value.toFixed(decimals)
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`inline-flex flex-wrap gap-2 items-center ${sizeClasses[size]} ${className}`}>
            <span className="font-medium">{formatAmount(usdcAmount)} USDC</span>
            <span className="text-muted-foreground">•</span>
            <span className="font-medium">{formatAmount(usdtAmount)} USDT</span>
            <span className="text-muted-foreground">•</span>
            <span className="font-medium">{formatAmount(kesAmount, 2)} KES</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs space-y-1">
            <div>USDC: {formatAmount(usdcAmount, 4)}</div>
            <div>USDT: {formatAmount(usdtAmount, 4)}</div>
            <div>KES: {formatAmount(kesAmount, 2)}</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
