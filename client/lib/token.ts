// Token configurations for different networks

export const TOKEN_ADDRESSES = {
  // Base Mainnet (Chain ID: 8453)
  base: {
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    USDT: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2'
  },
  // Lisk Mainnet (Chain ID: 1135)
  lisk: {
    USDT: '0x05D032ac25d322df992303dCa074EE7392C117b9',
    USDC: '' // TODO: Verify from Blockscout
  }
} as const

export const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' }
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function'
  }
] as const

export const getTokenAddress = (
  chainId: number,
  tokenSymbol: 'USDC' | 'USDT'
): string | undefined => {
  if (chainId === 8453) {
    return TOKEN_ADDRESSES.base[tokenSymbol]
  } else if (chainId === 1135) {
    return TOKEN_ADDRESSES.lisk[tokenSymbol]
  }
  return undefined
}
