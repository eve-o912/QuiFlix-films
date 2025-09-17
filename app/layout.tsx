import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { WalletProvider } from "@/components/wallet-provider"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

export const metadata: Metadata = {
  title: "QuiFlix - Own Your Movie Experience",
  description:
    "Stream premium films and own NFT tickets. No wallet? No problem. Buy directly and claim your NFT anytime.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <WalletProvider>
          <Suspense fallback={null}>{children}</Suspense>
          <Toaster />
        </WalletProvider>
        <Analytics />
      </body>
    </html>
  )
}
