import { useState, useEffect } from 'react'
import { Header } from '@/components/Header'
import { Sidebar } from '@/components/Sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/hooks/useAuth'
import { db } from '@/config/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { Upload, Film, DollarSign, Loader2, Image, Video, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'

export default function Submit() {
  const { currentUser, isLoading } = useAuth()
  const navigate = useNavigate()
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isLoadingWallet, setIsLoadingWallet] = useState(true)
  
  const [formData, setFormData] = useState({
    title: '',
    director: '',
    description: '',
    genre: '',
    duration: '',
    releaseYear: new Date().getFullYear().toString(),
    price: '10',
    nftPrice: '15',
    investmentPricePerShare: '2',
    totalShares: '100',
    creatorRevenueShare: '90',
    investorRevenueShare: '0',
  })
  
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState({
    poster: null as File | null,
    fullFilm: null as File | null
  })

  useEffect(() => {
    if (!isLoading && !currentUser) {
      navigate('/auth')
      return
    }
    
    // Load wallet address from localStorage
    if (currentUser) {
      const savedWallet = localStorage.getItem(`wallet_${currentUser.uid}`)
      if (savedWallet) {
        setWalletAddress(savedWallet)
      }
      setIsLoadingWallet(false)
    }
  }, [isLoading, currentUser, navigate])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return null
  }

  const handleFileUpload = (type: keyof typeof uploadedFiles, file: File) => {
    setUploadedFiles(prev => ({ ...prev, [type]: file }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)

    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.genre || !formData.duration || !formData.price || !uploadedFiles.fullFilm) {
        toast.error('Please fill in all required fields and upload your film file')
        setIsUploading(false)
        return
      }

      // Create FormData for file upload
      const formDataToSend = new FormData()
      formDataToSend.append('title', formData.title)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('genre', formData.genre)
      formDataToSend.append('duration', formData.duration)
      formDataToSend.append('releaseDate', formData.releaseYear)
      formDataToSend.append('price', formData.price)
      formDataToSend.append('filmFile', uploadedFiles.fullFilm)

      if (uploadedFiles.poster) {
        formDataToSend.append('thumbnailFile', uploadedFiles.poster)
      }

      // Start upload progress simulation
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) return 90
          return prev + 10
        })
      }, 500)

      // Upload to backend API
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'
      const response = await fetch(`${backendUrl}/api/films/upload`, {
        method: 'POST',
        headers: {
          'x-wallet-address': walletAddress || currentUser?.uid || 'anonymous',
        },
        body: formDataToSend,
      })

      // Stop progress simulation
      clearInterval(progressInterval)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await response.json()

      // Complete the progress bar
      setUploadProgress(100)

      // Save film data to Firebase in the background (non-blocking)
      addDoc(collection(db, 'films'), {
        title: formData.title,
        description: formData.description,
        genre: formData.genre,
        price: formData.price,
        releaseDate: formData.releaseYear,
        duration: formData.duration,
        ipfsHash: result.film.ipfsHash,
        posterUrl: result.film.thumbnailUrl || '/placeholder.svg',
        creatorId: currentUser?.uid,
        status: 'approved',
        createdAt: serverTimestamp(),
        totalViews: 0,
        totalRevenue: '0'
      }).catch(err => console.error('Error saving to Firebase:', err))

      // Show success message immediately
      toast.success('Film uploaded successfully to IPFS!')
      
      // Wait a moment to show the completed progress, then redirect
      setTimeout(() => {
        navigate('/browse')
      }, 1000)
    } catch (error) {
      console.error('Error uploading film:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upload film')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />
      
      <main className="ml-16 pt-16">
        <div className="px-8 py-8">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8">
              <h1 className="mb-2 text-4xl font-bold text-foreground">Submit Your Film</h1>
              <p className="text-muted-foreground">
                Upload your film to QuiFlix. Earn from sales and let fans invest in your success.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-2">
                <span className="text-sm text-muted-foreground">Connected:</span>
                {isLoadingWallet ? (
                  <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                ) : walletAddress ? (
                  <code className="text-sm text-foreground">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </code>
                ) : (
                  <span className="text-sm text-muted-foreground">No wallet connected</span>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Film Information */}
              <Card className="border-border bg-card">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="rounded bg-primary/20 p-2">
                      <Film className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">Film Information</h2>
                      <p className="text-sm text-muted-foreground">Basic details about your film</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-foreground">
                        Title <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Enter film title"
                        className="border-border bg-secondary text-foreground"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="director" className="text-foreground">
                        Director/Creator <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="director"
                        value={formData.director}
                        onChange={(e) => setFormData({ ...formData, director: e.target.value })}
                        placeholder="Director name"
                        className="border-border bg-secondary text-foreground"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-foreground">
                        Description <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe your film..."
                        rows={4}
                        className="border-border bg-secondary text-foreground resize-none"
                        required
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="genre" className="text-foreground">Genre</Label>
                        <Input
                          id="genre"
                          value={formData.genre}
                          onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                          placeholder="e.g., Drama, Action"
                          className="border-border bg-secondary text-foreground"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="duration" className="text-foreground">Duration (minutes)</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={formData.duration}
                          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                          placeholder="90"
                          className="border-border bg-secondary text-foreground"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="releaseYear" className="text-foreground">Release Year</Label>
                        <Input
                          id="releaseYear"
                          type="number"
                          value={formData.releaseYear}
                          onChange={(e) => setFormData({ ...formData, releaseYear: e.target.value })}
                          placeholder={new Date().getFullYear().toString()}
                          className="border-border bg-secondary text-foreground"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pricing & Economics */}
              <Card className="border-border bg-card">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="rounded bg-primary/20 p-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">Pricing & Sales</h2>
                      <p className="text-sm text-muted-foreground">Set prices for direct purchase and NFT</p>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="price" className="text-foreground">
                        Direct Purchase Price (USDC) <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="border-border bg-secondary text-foreground"
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Price for stream-only access (no NFT)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nftPrice" className="text-foreground">
                        NFT Price (USDC)
                      </Label>
                      <Input
                        id="nftPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.nftPrice}
                        onChange={(e) => setFormData({ ...formData, nftPrice: e.target.value })}
                        className="border-border bg-secondary text-foreground"
                      />
                      <p className="text-xs text-muted-foreground">
                        Price for NFT ownership (resellable)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Fan Investment */}
              <Card className="border-border bg-card">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="rounded bg-primary/20 p-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">Fan Investment</h2>
                      <p className="text-sm text-muted-foreground">Let fans invest in your film and share in its success</p>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="investmentPricePerShare" className="text-foreground">
                        Price per Share (USDC)
                      </Label>
                      <Input
                        id="investmentPricePerShare"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.investmentPricePerShare}
                        onChange={(e) => setFormData({ ...formData, investmentPricePerShare: e.target.value })}
                        className="border-border bg-secondary text-foreground"
                      />
                      <p className="text-xs text-muted-foreground">Set to 0 to disable investment</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="totalShares" className="text-foreground">
                        Total Shares Available
                      </Label>
                      <Input
                        id="totalShares"
                        type="number"
                        min="0"
                        value={formData.totalShares}
                        onChange={(e) => setFormData({ ...formData, totalShares: e.target.value })}
                        className="border-border bg-secondary text-foreground"
                      />
                      <p className="text-xs text-muted-foreground">Number of investment shares to offer</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Label className="mb-3 text-foreground">Revenue Distribution</Label>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-lg border border-border bg-secondary/50 p-3">
                        <div className="text-2xl font-bold text-primary">
                          {formData.creatorRevenueShare}%
                        </div>
                        <div className="text-xs text-muted-foreground">You (Creator)</div>
                      </div>
                      <div className="rounded-lg border border-border bg-secondary/50 p-3">
                        <div className="text-2xl font-bold text-muted-foreground">
                          {formData.investorRevenueShare}%
                        </div>
                        <div className="text-xs text-muted-foreground">Investors Pool</div>
                      </div>
                      <div className="rounded-lg border border-border bg-secondary/50 p-3">
                        <div className="text-2xl font-bold text-muted-foreground">
                          {100 - parseFloat(formData.creatorRevenueShare) - parseFloat(formData.investorRevenueShare)}%
                        </div>
                        <div className="text-xs text-muted-foreground">Platform</div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground text-center mt-3">
                      Every purchase generates revenue shared automatically
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* File Uploads */}
              <Card className="border-border bg-card">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="rounded bg-primary/20 p-2">
                      <Upload className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">File Uploads</h2>
                      <p className="text-sm text-muted-foreground">Upload your film and poster image</p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/30 p-8 hover:bg-secondary/50 transition-colors">
                      <Image className="mb-2 h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-2">Poster</p>
                      <Input
                        id="posterFile"
                        type="file"
                        accept="image/*"
                        className="cursor-pointer file:cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileUpload('poster', file)
                        }}
                      />
                      {uploadedFiles.poster && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {uploadedFiles.poster.name}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/30 p-8 hover:bg-secondary/50 transition-colors">
                      <Video className="mb-2 h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-2">Full Film *</p>
                      <Input
                        id="filmFile"
                        type="file"
                        accept="video/*"
                        className="cursor-pointer file:cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileUpload('fullFilm', file)
                        }}
                        required
                      />
                      {uploadedFiles.fullFilm && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {uploadedFiles.fullFilm.name} ({(uploadedFiles.fullFilm.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/30 p-8 opacity-60 cursor-not-allowed">
                      <Video className="mb-2 h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Trailer</p>
                      <p className="text-xs text-muted-foreground mt-2">Coming soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {isUploading && (
                <Card className="border-border bg-card">
                  <CardContent className="p-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uploading to IPFS...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="w-full" />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Submit Buttons */}
              <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate('/browse')}>
                  Cancel
                </Button>
                <Button type="submit" className="min-w-[150px]" disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Submit Film
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
