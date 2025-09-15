"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Play, Star, Wallet } from "lucide-react"

interface FilmCardProps {
  id: string
  title: string
  year: number
  genre: string
  rating: number
  price: string
  poster: string
  owned?: boolean
  onBuyNFT?: () => void
  onBuyDirect?: () => void
  onPlay?: () => void
}

export function FilmCard({
  title,
  poster,
}: Pick<FilmCardProps, 'title' | 'poster'>) {
  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] bg-card">
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={poster || "/placeholder.svg"}
          alt={title}
          className="object-cover w-full h-full transition-transform group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg leading-tight text-center">{title}</h3>
      </div>
    </Card>
  )
}
// ...existing code...
