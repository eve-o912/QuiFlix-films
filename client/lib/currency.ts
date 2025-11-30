// Currency conversion utilities for QuiFlix platform
// File: client/lib/currency.ts

/**
 * Exchange rates (update regularly or fetch from API)
 * Current rate: 1 USD ≈ 129 KES (as of Nov 2024)
 */
export const EXCHANGE_RATES = {
  USD_TO_KES: 129.5,
  USDC_TO_KES: 129.5, // USDC is pegged 1:1 with USD
  USDT_TO_KES: 129.5, // USDT is also pegged 1:1 with USD
} as const;

/**
 * Convert KES to USDC
 */
export function convertKEStoUSDC(kesAmount: number): number {
  return kesAmount / EXCHANGE_RATES.USDC_TO_KES;
}

/**
 * Convert USDC to KES
 */
export function convertUSDCtoKES(usdcAmount: number): number {
  return usdcAmount * EXCHANGE_RATES.USDC_TO_KES;
}

/**
 * Convert KES to USDT
 */
export function convertKEStoUSDT(kesAmount: number): number {
  return kesAmount / EXCHANGE_RATES.USDT_TO_KES;
}

/**
 * Convert USDT to KES
 */
export function convertUSDTtoKES(usdtAmount: number): number {
  return usdtAmount * EXCHANGE_RATES.USDT_TO_KES;
}

/**
 * Format price for display with proper currency symbol
 */
export function formatPrice(amount: number, currency: 'KES' | 'USDC' | 'USDT'): string {
  if (currency === 'KES') {
    // Format KES with comma separators: KES 3,237.50
    return `KES ${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  }
  // Format stablecoins: 25.00 USDC
  return `${amount.toFixed(2)} ${currency}`;
}

/**
 * Get pricing in both currencies (KES and stablecoin)
 */
export function getPricing(baseAmount: number, baseCurrency: 'KES' | 'USDC' | 'USDT') {
  if (baseCurrency === 'KES') {
    return {
      kes: baseAmount,
      usdc: convertKEStoUSDC(baseAmount),
      usdt: convertKEStoUSDT(baseAmount),
    };
  }
  
  if (baseCurrency === 'USDC') {
    return {
      kes: convertUSDCtoKES(baseAmount),
      usdc: baseAmount,
      usdt: baseAmount, // USDC and USDT are equivalent
    };
  }
  
  // baseCurrency === 'USDT'
  return {
    kes: convertUSDTtoKES(baseAmount),
    usdc: baseAmount, // USDC and USDT are equivalent
    usdt: baseAmount,
  };
}

/**
 * Get user's preferred currency from localStorage
 */
export function getPreferredCurrency(): 'KES' | 'USDC' {
  if (typeof window === 'undefined') return 'USDC';
  
  const stored = localStorage.getItem('preferredCurrency');
  return (stored === 'KES' || stored === 'USDC') ? stored : 'USDC';
}

/**
 * Save user's preferred currency to localStorage
 */
export function setPreferredCurrency(currency: 'KES' | 'USDC'): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('preferredCurrency', currency);
}

/**
 * Fetch live exchange rates (optional - for future implementation)
 */
export async function fetchLiveExchangeRate(): Promise<number> {
  try {
    // Example: Fetch from a free API like exchangerate-api.com
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json();
    return data.rates.KES || EXCHANGE_RATES.USD_TO_KES;
  } catch (error) {
    console.error('Failed to fetch live exchange rate:', error);
    return EXCHANGE_RATES.USD_TO_KES; // Fallback to hardcoded rate
  }
}
