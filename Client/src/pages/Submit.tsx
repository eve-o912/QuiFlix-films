import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Film, DollarSign, Upload, Image, Video, FileText, TrendingUp, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/firebase.config"; // Fixed import

const Submit = () => {
  const navigate = useNavigate();
  const [walletAddress, setWalletAddress] = useState(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    director: "",
    description: "",
    genre: "",
    duration: "",
    releaseYear: new Date().getFullYear().toString(),
    directPurchasePrice: "10",
    nftPrimaryPrice: "15",
    investmentPricePerShare: "2",
    totalShares: "100",
    creatorRevenueShare: "90",
    investorRevenueShare: "0",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/auth');
        return;
      }

      setUserId(user.uid);

      // Fetch wallet address from Firestore
      try {
        const walletsRef = collection(db, 'wallets');
        const q = query(
          walletsRef,
          where('user_id', '==', user.uid),
          where('network', '==', 'base')
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const walletDoc = querySnapshot.docs[0];
          setWalletAddress(walletDoc.data().wallet_address);
        }
      } catch (error) {
        console.error('Error fetching wallet:', error);
      } finally {
        setIsLoadingWallet(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.director || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error("Please sign in to submit a film");
        navigate('/auth');
        return;
      }

      // Calculate platform fee
      const platformFee = 100 - parseFloat(formData.creatorRevenueShare) - parseFloat(formData.investorRevenueShare);

      // Add film to Firestore
      const filmsRef = collection(db, 'films');
      await addDoc(filmsRef, {
        creator_id: user.uid,
        title: formData.title,
        director: formData.director,
        description: formData.description,
        genre: formData.genre || null,
        duration_minutes: formData.duration ? parseInt(formData.duration) : null,
        release_year: formData.releaseYear ? parseInt(formData.releaseYear) : null,
        direct_price: parseFloat(formData.directPurchasePrice),
        nft_price: parseFloat(formData.nftPrimaryPrice),
        investment_price_per_share: parseFloat(formData.investmentPricePerShare),
        total_shares: parseInt(formData.totalShares),
        available_shares: parseInt(formData.totalShares),
        creator_revenue_share: parseFloat(formData.creatorRevenueShare),
        investor_revenue_share: parseFloat(formData.investorRevenueShare),
        platform_fee: platformFee,
        status: 'pending',
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      toast.success("Film submitted for review! You'll be notified when approved.");
      navigate('/my-films');
    } catch (error) {
      console.error('Error submitting film:', error);
      toast.error("Failed to submit film. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
                  <span className="text-sm text-destructive">No wallet connected</span>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <Card className="border-border bg-card">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="rounded bg-primary/20 p-2">
                      <Film className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">Basic Information</h2>
                      <p className="text-sm text-muted-foreground">Tell us about your film</p>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-foreground">
                        Film Title <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="title"
                        placeholder="Enter film title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="border-border bg-secondary text-foreground"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="director" className="text-foreground">
                        Director <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="director"
                        placeholder="Director name"
                        value={formData.director}
                        onChange={(e) => setFormData({ ...formData, director: e.target.value })}
                        className="border-border bg-secondary text-foreground"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <Label htmlFor="description" className="text-foreground">
                      Description <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your film's plot, themes, and what makes it unique..."
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="border-border bg-secondary text-foreground"
                      required
                    />
                  </div>

                  <div className="mt-4 grid gap-6 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="genre" className="text-foreground">Genre</Label>
                      <Input
                        id="genre"
                        placeholder="e.g., Drama, Sci-Fi"
                        value={formData.genre}
                        onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                        className="border-border bg-secondary text-foreground"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration" className="text-foreground">Duration (minutes)</Label>
                      <Input
                        id="duration"
                        type="number"
                        placeholder="90"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
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
                        className="border-border bg-secondary text-foreground"
                      />
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
                      <Label htmlFor="directPurchasePrice" className="text-foreground">
                        Direct Purchase Price (USDC) <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="directPurchasePrice"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.directPurchasePrice}
                        onChange={(e) => setFormData({ ...formData, directPurchasePrice: e.target.value })}
                        className="border-border bg-secondary text-foreground"
                      />
                      <p className="text-xs text-muted-foreground">
                        Price for stream-only access (no NFT)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nftPrimaryPrice" className="text-foreground">
                        NFT Price (USDC) <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="nftPrimaryPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.nftPrimaryPrice}
                        onChange={(e) => setFormData({ ...formData, nftPrimaryPrice: e.target.value })}
                        className="border-border bg-secondary text-foreground"
                      />
                      <p className="text-xs text-muted-foreground">
                        Price for NFT ownership (resellable)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Investment Options */}
              <Card className="border-border bg-card border-primary/30">
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
                      <p className="text-xs text-muted-foreground">
                        Set to 0 to disable investment
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="totalShares" className="text-foreground">
                        Total Shares Available
                      </Label>
                      <Input
                        id="totalShares"
                        type="number"
                        min="1"
                        step="1"
                        value={formData.totalShares}
                        onChange={(e) => setFormData({ ...formData, totalShares: e.target.value })}
                        className="border-border bg-secondary text-foreground"
                      />
                      <p className="text-xs text-muted-foreground">
                        Number of investment shares to offer
                      </p>
                    </div>
                  </div>

                  {/* Revenue Sharing Info */}
                  <div className="mt-6 p-4 rounded-lg bg-secondary/50 border border-border">
                    <h3 className="font-semibold text-foreground mb-3">Revenue Distribution</h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-primary">{formData.creatorRevenueShare}%</div>
                        <div className="text-xs text-muted-foreground">You (Creator)</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary">{formData.investorRevenueShare}%</div>
                        <div className="text-xs text-muted-foreground">Investors Pool</div>
                      </div>
                      <div>
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

              {/* File Uploads Placeholder */}
              <Card className="border-border bg-card">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="rounded bg-primary/20 p-2">
                      <Upload className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">File Uploads</h2>
                      <p className="text-sm text-muted-foreground">Upload your film files (coming soon)</p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="flex cursor-not-allowed flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/30 p-8 opacity-60">
                      <Image className="mb-2 h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Poster</p>
                    </div>
                    <div className="flex cursor-not-allowed flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/30 p-8 opacity-60">
                      <Video className="mb-2 h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Trailer</p>
                    </div>
                    <div className="flex cursor-not-allowed flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/30 p-8 opacity-60">
                      <Film className="mb-2 h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Full Film</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    File uploads will be available after approval
                  </p>
                </CardContent>
              </Card>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate('/browse')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="min-w-[150px]">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Film'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Submit;
