"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface VideoPlayerProps {
  src: string
  title: string
  watermark?: string
}

export function VideoPlayer({ src, title, watermark }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(100)
  const [showControls, setShowControls] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [quality, setQuality] = useState("1080p")

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateTime = () => setCurrentTime(video.currentTime)
    const updateDuration = () => setDuration(video.duration)

    video.addEventListener("timeupdate", updateTime)
    video.addEventListener("loadedmetadata", updateDuration)

    return () => {
      video.removeEventListener("timeupdate", updateTime)
      video.removeEventListener("loadedmetadata", updateDuration)
    }
  }, [])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
      setIsPlaying(false)
    } else {
      video.play()
      setIsPlaying(true)
    }
  }

  // Listen for video play/pause events
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    video.addEventListener("play", handlePlay)
    video.addEventListener("pause", handlePause)

    return () => {
      video.removeEventListener("play", handlePlay)
      video.removeEventListener("pause", handlePause)
    }
  }, [])

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleSeek = (value: number[]) => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = value[0]
    setCurrentTime(value[0])
  }

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current
    if (!video) return

    const newVolume = value[0]
    video.volume = newVolume / 100
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
    
    // If volume is changed from 0, unmute the video
    if (newVolume > 0 && video.muted) {
      video.muted = false
      setIsMuted(false)
    }
  }

  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement
    if (!container) return

    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      container.requestFullscreen()
    }
  }

  const handleSpeedChange = (speed: string) => {
    const video = videoRef.current
    if (!video) return

    const speedValue = parseFloat(speed)
    video.playbackRate = speedValue
    setPlaybackSpeed(speedValue)
  }

  const handleQualityChange = (newQuality: string) => {
    setQuality(newQuality)
    // In a real app, you would switch video sources here
    console.log(`Quality changed to: ${newQuality}`)
  }

  const toggleSettings = () => {
    setShowSettings(!showSettings)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div
      className="relative bg-black rounded-lg overflow-hidden group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video ref={videoRef} className="w-full aspect-video" src={src} onClick={togglePlay} />

      {/* Watermark */}
      {watermark && (
        <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">{watermark}</div>
      )}

      {/* Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Progress Bar */}
        <div className="mb-4">
          <Slider value={[currentTime]} max={duration} step={1} onValueChange={handleSeek} className="w-full" />
          <div className="flex justify-between text-xs text-white/70 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={togglePlay} className="text-white hover:bg-white/20">
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" onClick={toggleMute} className="text-white hover:bg-white/20">
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <div className="w-20">
                <Slider value={[volume]} max={100} step={1} onValueChange={handleVolumeChange} className="w-full" />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={toggleSettings} className="text-white hover:bg-white/20">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="text-white hover:bg-white/20">
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute bottom-20 right-4 bg-black/90 text-white rounded-lg p-4 min-w-[200px] z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Settings</h3>
            <Button variant="ghost" size="icon" onClick={toggleSettings} className="text-white hover:bg-white/20 h-6 w-6">
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-4">
            {/* Quality Settings */}
            <div>
              <label className="text-sm font-medium mb-2 block">Quality</label>
              <Select value={quality} onValueChange={handleQualityChange}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/20">
                  <SelectItem value="4K" className="text-white hover:bg-white/20">4K (2160p)</SelectItem>
                  <SelectItem value="1440p" className="text-white hover:bg-white/20">1440p</SelectItem>
                  <SelectItem value="1080p" className="text-white hover:bg-white/20">1080p</SelectItem>
                  <SelectItem value="720p" className="text-white hover:bg-white/20">720p</SelectItem>
                  <SelectItem value="480p" className="text-white hover:bg-white/20">480p</SelectItem>
                  <SelectItem value="360p" className="text-white hover:bg-white/20">360p</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Speed Settings */}
            <div>
              <label className="text-sm font-medium mb-2 block">Playback Speed</label>
              <Select value={playbackSpeed.toString()} onValueChange={handleSpeedChange}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/20">
                  <SelectItem value="0.25" className="text-white hover:bg-white/20">0.25x</SelectItem>
                  <SelectItem value="0.5" className="text-white hover:bg-white/20">0.5x</SelectItem>
                  <SelectItem value="0.75" className="text-white hover:bg-white/20">0.75x</SelectItem>
                  <SelectItem value="1" className="text-white hover:bg-white/20">Normal</SelectItem>
                  <SelectItem value="1.25" className="text-white hover:bg-white/20">1.25x</SelectItem>
                  <SelectItem value="1.5" className="text-white hover:bg-white/20">1.5x</SelectItem>
                  <SelectItem value="1.75" className="text-white hover:bg-white/20">1.75x</SelectItem>
                  <SelectItem value="2" className="text-white hover:bg-white/20">2x</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Play Button Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Button onClick={togglePlay} variant="ghost" size="lg" className="hover:bg-transparent text-white p-4">
            <Play className="h-16 w-16 ml-2" />
          </Button>
        </div>
      )}
    </div>
  )
}
