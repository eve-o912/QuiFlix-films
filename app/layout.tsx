import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { Web3Provider } from "@/components/web3-provider"
import { Header } from "@/components/header"
import { LayoutWrapper } from "@/components/layout-wrapper"
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
        <Web3Provider>
          <Header />
          <LayoutWrapper>
            <Suspense fallback={null}>{children}</Suspense>
          </LayoutWrapper>
          <Analytics />
        </Web3Provider>
      </body>
    </html>
  )
}
