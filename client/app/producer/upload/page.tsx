"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { PriceDisplay } from "@/components/price-display"

export default function NFTMarketPage() {
  // Mock data for floor price chart (in USDC)
  const floorPriceData = [
    { date: "1/1", quantum: 0.008, neon: 0.006, ocean: 0.005 },
    { date: "1/7", quantum: 0.009, neon: 0.007, ocean: 0.006 },
    { date: "1/14", quantum: 0.012, neon: 0.008, ocean: 0.007 },
    { date: "1/21", quantum: 0.015, neon: 0.009, ocean: 0.008 },
    { date: "1/28", qu
