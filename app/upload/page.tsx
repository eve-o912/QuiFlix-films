'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useCustodialWallet } from '@/hooks/useCustodialWallet'
import { useAuth } from '@/hooks/useAuth'
import { db } from '@/firebase/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { useRouter } from 'next/navigation'
import { 
  Upload, 
  Film, 
  DollarSign, 
  Calendar, 
  Users, 
  Star, 
  Image as ImageIcon,
  Video,
  FileText,
  X,
  Plus,
  ArrowLeft
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export default function UploadFilmPage() {
  const { address, isConnected, formatAddress, walletClient } = useCustodialWallet()
  const { currentUser } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    duration: '',
    releaseDate: '',
    director: '',
    cast: '',
    price: '',
    royaltyPercentage: '',
    language: '',
    country: '',
    rating: ''
  })
  
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState({
    poster: null as File | null,
    trailer: null as File | null,
    fullFilm: null as File | null,
    script: null as File | null
  })

  // Redirect if not authenticated
  if (!currentUser) {
    router.push('/films')
    return null
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()])
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove))
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
        toast({
          title: "Error",
          description: "Please fill in all required fields and upload your film file",
          variant: "destructive",
        })
        return
      }

      // Create FormData for file upload
      const formDataToSend = new FormData()
      formDataToSend.append('title', formData.title)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('genre', formData.genre)
      formDataToSend.append('duration', formData.duration)
      formDataToSend.append('releaseDate', formData.releaseDate || new Date().toISOString().split('T')[0])
      formDataToSend.append('price', formData.price)
      formDataToSend.append('filmFile', uploadedFiles.fullFilm)

      if (uploadedFiles.poster) {
        formDataToSend.append('thumbnailFile', uploadedFiles.poster)
      }

      // Simulate upload progress
      for (let i = 0; i <= 90; i += 10) {
        setUploadProgress(i)
        await new Promise(resolve => setTimeout(resolve, 300))
      }

      // Upload to backend API
      const response = await fetch('/api/films/upload', {
        method: 'POST',
        body: formDataToSend,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const result = await response.json()

      // Save film data to Firebase
      try {
        await addDoc(collection(db, 'films'), {
          title: formData.title,
          description: formData.description,
          genre: formData.genre,
          price: formData.price,
          releaseDate: formData.releaseDate || new Date().toISOString().split('T')[0],
          duration: formData.duration,
          director: formData.director,
          cast: formData.cast,
          language: formData.language,
          country: formData.country,
          rating: formData.rating,
          ipfsHash: result.ipfsHash,
          posterUrl: result.thumbnailUrl || '/placeholder.svg',
          creatorId: currentUser?.uid,
          status: 'approved', // Set to approved for testing
          createdAt: serverTimestamp(),
          totalViews: 0,
          totalRevenue: '0'
        });

        toast({
          title: "Film Saved to Database!",
          description: "Film data has been saved successfully.",
        });
      } catch (firebaseError) {
        console.error('Firebase save failed:', firebaseError);
        toast({
          title: "Database Save Failed",
          description: "Film uploaded to IPFS but failed to save to database.",
          variant: "destructive",
        });
      }

      // After successful upload to backend, send blockchain transaction to register content
      if (isConnected && walletClient && address) {
        try {
          // Example: call createContent on QuiFlixContent contract
          // You need to replace contractAddress and abi with actual values
          const contractAddress = process.env.NEXT_PUBLIC_QUIFLIX_CONTENT_ADDRESS as `0x${string}`;
          const contractAbi = [
            {
              "inputs": [
                { "internalType": "string", "name": "_title", "type": "string" },
                { "internalType": "string", "name": "_ipfsHash", "type": "string" }
              ],
              "name": "createContent",
              "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
              "stateMutability": "nonpayable",
              "type": "function"
            }
          ];

          const ipfsHash = result.ipfsHash || ""; // Assuming backend returns IPFS hash of uploaded film

          const txHash = await walletClient.writeContract({
            account: walletClient.account!,
            chain: walletClient.chain,
            address: contractAddress,
            abi: contractAbi,
            functionName: 'createContent',
            args: [formData.title, ipfsHash],
          });

          toast({
            title: "Film Registered On-Chain!",
            description: `Transaction hash: ${txHash}`,
          });
        } catch (error) {
          console.error('Blockchain transaction failed:', error);
          toast({
            title: "Blockchain Transaction Failed",
            description: "Failed to register film on blockchain.",
            variant: "destructive",
          });
        }
      }

      // Complete progress
      setUploadProgress(100)

      toast({
        title: "Film Submitted Successfully!",
        description: "Your film has been uploaded and is now under review.",
      })

      router.push('/films')
    } catch (error) {
      console.error('Error uploading film:', error)
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your film. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const genres = [
    'Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 
    'Thriller', 'Documentary', 'Animation', 'Fantasy', 'Mystery', 'Adventure'
  ]

  const ratings = ['G', 'PG', 'PG-13', 'R', 'NC-17', 'Not Rated']

  return (
    <div className="min-h-screen bg-background">
   
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push('/films')}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Films
              </Button>
            </div>
            <h1 className="text-3xl font-bold mb-2">Submit Your Film</h1>
            <p className="text-muted-foreground">
              Upload your film to QuiFlix and start earning from your creative work
            </p>
            <div className="flex items-center gap-2 mt-4">
              <Badge variant="outline">Connected: {address?.slice(0, 6)}...{address?.slice(-4)}</Badge>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Film className="h-5 w-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Tell us about your film
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Film Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter film title"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="director">Director *</Label>
                    <Input
                      id="director"
                      value={formData.director}
                      onChange={(e) => handleInputChange('director', e.target.value)}
                      placeholder="Director name"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your film's plot, themes, and what makes it unique..."
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="genre">Genre *</Label>
                    <Select value={formData.genre} onValueChange={(value) => handleInputChange('genre', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select genre" />
                      </SelectTrigger>
                      <SelectContent>
                        {genres.map(genre => (
                          <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (minutes) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                      placeholder="90"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="rating">Rating</Label>
                    <Select value={formData.rating} onValueChange={(value) => handleInputChange('rating', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select rating" />
                      </SelectTrigger>
                      <SelectContent>
                        {ratings.map(rating => (
                          <SelectItem key={rating} value={rating}>{rating}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="language">Language *</Label>
                    <Input
                      id="language"
                      value={formData.language}
                      onChange={(e) => handleInputChange('language', e.target.value)}
                      placeholder="English"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      placeholder="United States"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="releaseDate">Release Date</Label>
                    <Input
                      id="releaseDate"
                      type="date"
                      value={formData.releaseDate}
                      onChange={(e) => handleInputChange('releaseDate', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="cast">Cast & Crew</Label>
                  <Textarea
                    id="cast"
                    value={formData.cast}
                    onChange={(e) => handleInputChange('cast', e.target.value)}
                    placeholder="List main cast members and key crew..."
                    rows={2}
                  />
                </div>

                {/* Tags */}
                <div>
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => handleRemoveTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    />
                    <Button type="button" variant="outline" onClick={handleAddTag}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing & Economics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Pricing & Economics
                </CardTitle>
                <CardDescription>
                  Set your film's pricing and revenue sharing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">NFT Ticket Price (ETH) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.001"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="0.05"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Price viewers pay to watch and own your film NFT
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="royalty">Creator Royalty % *</Label>
                    <Input
                      id="royalty"
                      type="number"
                      min="0"
                      max="10"
                      value={formData.royaltyPercentage}
                      onChange={(e) => handleInputChange('royaltyPercentage', e.target.value)}
                      placeholder="5"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Royalty on secondary NFT sales (0-10%)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* File Uploads */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  File Uploads
                </CardTitle>
                <CardDescription>
                  Upload your film files and promotional materials
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Poster Upload */}
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <ImageIcon className="h-4 w-4" />
                    Film Poster *
                  </Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload('poster', e.target.files[0])}
                      className="hidden"
                      id="poster-upload"
                    />
                    <label htmlFor="poster-upload" className="cursor-pointer">
                      <ImageIcon className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm">Click to upload poster image</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                    </label>
                    {uploadedFiles.poster && (
                      <p className="text-sm text-green-600 mt-2">✓ {uploadedFiles.poster.name}</p>
                    )}
                  </div>
                </div>

                {/* Trailer Upload */}
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Video className="h-4 w-4" />
                    Trailer
                  </Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload('trailer', e.target.files[0])}
                      className="hidden"
                      id="trailer-upload"
                    />
                    <label htmlFor="trailer-upload" className="cursor-pointer">
                      <Video className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm">Click to upload trailer</p>
                      <p className="text-xs text-muted-foreground">MP4, MOV up to 500MB</p>
                    </label>
                    {uploadedFiles.trailer && (
                      <p className="text-sm text-green-600 mt-2">✓ {uploadedFiles.trailer.name}</p>
                    )}
                  </div>
                </div>

                {/* Full Film Upload */}
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Film className="h-4 w-4" />
                    Full Film *
                  </Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload('fullFilm', e.target.files[0])}
                      className="hidden"
                      id="film-upload"
                    />
                    <label htmlFor="film-upload" className="cursor-pointer">
                      <Film className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm">Click to upload full film</p>
                      <p className="text-xs text-muted-foreground">MP4, MOV up to 5GB</p>
                    </label>
                    {uploadedFiles.fullFilm && (
                      <p className="text-sm text-green-600 mt-2">✓ {uploadedFiles.fullFilm.name}</p>
                    )}
                  </div>
                </div>

                {/* Optional Script Upload */}
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4" />
                    Script (Optional)
                  </Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload('script', e.target.files[0])}
                      className="hidden"
                      id="script-upload"
                    />
                    <label htmlFor="script-upload" className="cursor-pointer">
                      <FileText className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm">Click to upload script</p>
                      <p className="text-xs text-muted-foreground">PDF, DOC, TXT up to 50MB</p>
                    </label>
                    {uploadedFiles.script && (
                      <p className="text-sm text-green-600 mt-2">✓ {uploadedFiles.script.name}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upload Progress */}
            {isUploading && (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Uploading...</span>
                      <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="w-full" />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push('/films')}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isUploading || !formData.title || !formData.description || !formData.genre || !formData.price}
                className="bg-primary hover:bg-primary/90"
              >
                {isUploading ? 'Uploading...' : 'Submit Film'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}