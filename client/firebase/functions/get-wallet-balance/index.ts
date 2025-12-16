import * as functions from 'firebase-functions';

// Network RPC URLs
const RPC_URLS: Record<string, string> = {
  base: 'https://mainnet.base.org',
  lisk: 'https://rpc.api.lisk.com',
  scroll: 'https://rpc.scroll.io',
  celo: 'https://forno.celo.org',
};

// USDC contract addresses per network
const USDC_ADDRESSES: Record<string, string> = {
  base: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  lisk: '0x05D032ac25d322df992303dCa074EE7392C117b9',
  scroll: '0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4',
  celo: '0xcebA9300f2b948710d2653dD7B07f33A8B32118C',
};

// USDT addresses (not available on all networks)
const USDT_ADDRESSES: Record<string, string> = {
  base: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
  celo: '0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e',
};

// ERC20 ABI for balanceOf
const BALANCE_OF_SELECTOR = '0x70a08231';

export const getWalletBalance = functions.https.onRequest(async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type');
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const { walletAddress, network = 'base' } = req.body;

    if (!walletAddress) {
      throw new Error('Wallet address is required');
    }

    const rpcUrl = RPC_URLS[network] || RPC_URLS.base;
    const usdcAddress = USDC_ADDRESSES[network];
    const usdtAddress = USDT_ADDRESSES[network];

    console.log(`Fetching balance for ${walletAddress} on ${network}`);

    // Fetch USDC balance
    const usdcBalance = usdcAddress 
      ? await getTokenBalance(walletAddress, usdcAddress, 6, rpcUrl)
      : 0;
    
    // Fetch USDT balance (if available on network)
    const usdtBalance = usdtAddress 
      ? await getTokenBalance(walletAddress, usdtAddress, 6, rpcUrl)
      : 0;

    // Get native token balance
    const nativeBalance = await getNativeBalance(walletAddress, rpcUrl);

    console.log(`USDC: ${usdcBalance}, USDT: ${usdtBalance}, Native: ${nativeBalance}`);

    // Get USD to KES rate
    const exchangeRate = await getUsdToKesRate();
    const totalUsd = usdcBalance + usdtBalance;
    const totalKes = totalUsd * exchangeRate;

    res.status(200).json({
      usdc: usdcBalance.toFixed(2),
      usdt: usdtBalance.toFixed(2),
      native: nativeBalance.toFixed(6),
      kes: totalKes.toFixed(2),
      exchangeRate: exchangeRate.toFixed(2),
      network,
    });
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    res.status(200).json({
      error: error instanceof Error ? error.message : 'Unknown error',
      usdc: '0.00',
      usdt: '0.00',
      native: '0.000000',
      kes: '0.00',
      exchangeRate: '129.00',
    });
  }
});

async function getTokenBalance(
  walletAddress: string,
  tokenAddress: string,
  decimals: number,
  rpcUrl: string
): Promise<number> {
  try {
    const paddedAddress = walletAddress.slice(2).padStart(64, '0');
    const data = BALANCE_OF_SELECTOR + paddedAddress;

    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [{ to: tokenAddress, data }, 'latest'],
        id: 1,
      }),
    });

    const result = await response.json();
    if (result.error) {
      console.error('RPC Error:', result.error);
      return 0;
    }

    const balanceWei = BigInt(result.result || '0x0');
    return Number(balanceWei) / Math.pow(10, decimals);
  } catch (error) {
    console.error(`Error fetching token balance:`, error);
    return 0;
  }
}

async function getNativeBalance(walletAddress: string, rpcUrl: string): Promise<number> {
  try {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [walletAddress, 'latest'],
        id: 1,
      }),
    });

    const result = await response.json();
    if (result.error) return 0;

    const balanceWei = BigInt(result.result || '0x0');
    return Number(balanceWei) / 1e18;
  } catch {
    return 0;
  }
}

async function getUsdToKesRate(): Promise<number> {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=usd&vs_currencies=kes'
    );
    if (!response.ok) return 129;
    const data = await response.json();
    return data.usd?.kes || 129;
  } catch {
    return 129;
  }
}