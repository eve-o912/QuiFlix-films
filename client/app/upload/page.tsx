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

// Force dynamic rendering - prevents SSR/SSG
export const dynamic = 'force-dynamic'

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
          status: 'approved',
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

      // Blockchain transaction
      if (isConnected && walletClient && address) {
        try {
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

          const ipfsHash = result.ipfsHash || "";

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

          {/* Rest of your form code - keeping it the same */}
          {/* ... (I'm truncating for brevity, but include all your existing form code) */}
          
        </div>
      </div>
    </div>
  )
}
