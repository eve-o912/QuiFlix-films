import { http, createConfig } from 'wagmi'
import { mainnet, polygon, arbitrum, optimism, base } from 'wagmi/chains'
import { walletConnect, metaMask, coinbaseWallet } from 'wagmi/connectors'

// WalletConnect project ID - you'll need to get this from https://cloud.walletconnect.com/
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id'

export const config = createConfig({
  chains: [mainnet, polygon, arbitrum, optimism, base],
  connectors: [
    metaMask(),
    walletConnect({ 
      projectId,
      metadata: {
        name: 'QuiFlix',
        description: 'Web3 Box Office for Film NFTs',
        url: 'https://quiflix.com',
        icons: ['https://quiflix.com/logo.png']
      }
    }),
    coinbaseWallet({
      appName: 'QuiFlix',
      appLogoUrl: 'https://quiflix.com/logo.png'
    })
  ],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [base.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
