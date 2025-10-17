"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Trash2,
  Search,
  Filter,
  Eye,
  DollarSign,
  Film,
  AlertTriangle,
  RefreshCw
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Film {
  id: string
  title: string
  description: string
  genre: string
  duration: number
  releaseDate: string
  producerId: string
  price: string
  thumbnailUrl?: string
  isActive: boolean
  totalViews: number
  totalRevenue: string
  tokenId?: number
  createdAt: string
  purchases: number
  views: number
}

interface FilmsResponse {
  success: boolean
  films: Film[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export function AdminFilmTable() {
  const [films, setFilms] = useState<Film[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [genreFilter, setGenreFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null)
  const [removalReason, setRemovalReason] = useState("")
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const [removing, setRemoving] = useState(false)

  const fetchFilms = async (page = 1) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      })

      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (genreFilter !== 'all') params.append('genre', genreFilter)

      const response = await fetch(`/api/admin/films?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('quiflix_token')}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch films')
      }

      const data: FilmsResponse = await response.json()
      setFilms(data.films)
      setTotalPages(data.pagination.pages)
      setCurrentPage(data.pagination.page)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load films')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFilms()
  }, [statusFilter, genreFilter])

  const handleRemoveFilm = async () => {
    if (!selectedFilm || !removalReason.trim()) return

    try {
      setRemoving(true)

      const response = await fetch(`/api/admin/films/${selectedFilm.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('quiflix_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: removalReason }),
      })

      if (!response.ok) {
        throw new Error('Failed to remove film')
      }

      toast({
        title: "Film Removed",
        description: `"${selectedFilm.title}" has been successfully removed.`,
      })

      // Refresh the films list
      fetchFilms(currentPage)

      // Reset dialog state
      setShowRemoveDialog(false)
      setSelectedFilm(null)
      setRemovalReason("")
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to remove film',
        variant: "destructive",
      })
    } finally {
      setRemoving(false)
    }
  }

  const filteredFilms = films.filter(film =>
    film.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    film.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const uniqueGenres = Array.from(new Set(films.map(film => film.genre)))

  if (loading && films.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin mr-2" />
          Loading films...
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <AlertTriangle className="h-8 w-8 text-red-500 mr-2" />
          <div>
            <p className="font-medium">Error loading films</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Film Management
          </CardTitle>
          <CardDescription>
            Search, filter, and manage films on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search films..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={genreFilter} onValueChange={setGenreFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                {uniqueGenres.map(genre => (
                  <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Films Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Film</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Genre</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Purchases</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFilms.map((film) => (
                <TableRow key={film.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {film.thumbnailUrl ? (
                        <img
                          src={film.thumbnailUrl}
                          alt={film.title}
                          className="w-12 h-12 rounded object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                          <Film className="h-6 w-6" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium truncate max-w-[200px]">{film.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(film.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={film.isActive ? "default" : "secondary"}>
                      {film.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{film.genre}</TableCell>
                  <TableCell>{film.price} USDT</TableCell>
                  <TableCell>{film.totalViews}</TableCell>
                  <TableCell>{film.totalRevenue} USDT</TableCell>
                  <TableCell>{film.purchases}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Dialog open={showRemoveDialog && selectedFilm?.id === film.id} onOpenChange={setShowRemoveDialog}>
                        <DialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setSelectedFilm(film)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Remove Film</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to remove "{film.title}"? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="reason">Reason for removal</Label>
                              <Textarea
                                id="reason"
                                placeholder="Please provide a reason for removing this film..."
                                value={removalReason}
                                onChange={(e) => setRemovalReason(e.target.value)}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setShowRemoveDialog(false)
                                setSelectedFilm(null)
                                setRemovalReason("")
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={handleRemoveFilm}
                              disabled={removing || !removalReason.trim()}
                            >
                              {removing ? (
                                <>
                                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                  Removing...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Remove Film
                                </>
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => fetchFilms(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => fetchFilms(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
