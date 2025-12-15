'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from 'next/navigation'

export default function UploadFilmPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    duration: '',
    releaseDate: '',
    price: '',
  })
  const [filmFile, setFilmFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'film' | 'thumbnail') => {
    const file = e.target.files?.[0] || null
    if (type === 'film') {
      setFilmFile(file)
    } else {
      setThumbnailFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!filmFile) {
      setError('Please select a film file')
      return
    }

    setUploading(true)
    setProgress(0)
    setError('')
    setSuccess('')

    try {
      const data = new FormData()
      data.append('filmFile', filmFile)
      if (thumbnailFile) {
        data.append('thumbnailFile', thumbnailFile)
      }
      data.append('title', formData.title)
      data.append('description', formData.description)
      data.append('genre', formData.genre)
      data.append('duration', formData.duration)
      data.append('releaseDate', formData.releaseDate)
      data.append('price', formData.price)

      // Get auth token (assuming it's stored in localStorage)
      const token = localStorage.getItem('authToken')
      if (!token) {
        setError('Authentication required. Please connect your wallet.')
        return
      }

      const response = await fetch('/api/films/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await response.json()
      setSuccess('Film uploaded successfully!')
      setProgress(100)

      // Redirect to films page after success
      setTimeout(() => {
        router.push('/producer/films')
      }, 2000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Upload New Film</h1>
        <p className="text-muted-foreground">Add your film to the platform and start selling NFT tickets</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Film Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="Enter film title"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter film description"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="genre">Genre *</Label>
                <Input
                  id="genre"
                  name="genre"
                  value={formData.genre}
                  onChange={handleInputChange}
                  required
                  placeholder="Action, Drama, etc."
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration (seconds) *</Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                  placeholder="3600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="releaseDate">Release Date *</Label>
                <Input
                  id="releaseDate"
                  name="releaseDate"
                  type="date"
                  value={formData.releaseDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="price">Price (ETH) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.001"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  placeholder="0.01"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="filmFile">Film File *</Label>
              <Input
                id="filmFile"
                type="file"
                accept="video/*"
                onChange={(e) => handleFileChange(e, 'film')}
                required
              />
              {filmFile && <p className="text-sm text-muted-foreground mt-1">Selected: {filmFile.name}</p>}
            </div>

            <div>
              <Label htmlFor="thumbnailFile">Thumbnail Image</Label>
              <Input
                id="thumbnailFile"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'thumbnail')}
              />
              {thumbnailFile && <p className="text-sm text-muted-foreground mt-1">Selected: {thumbnailFile.name}</p>}
            </div>

            {uploading && (
              <div>
                <Label>Uploading...</Label>
                <Progress value={progress} className="mt-2" />
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-4">
              <Button type="submit" disabled={uploading} className="flex-1">
                {uploading ? 'Uploading...' : 'Upload Film'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
