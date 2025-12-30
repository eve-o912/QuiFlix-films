import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Copy, Film, Trophy, Download, User, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/firebase.config";
import { useWalletInfo } from "@/hooks/useWalletInfo";
import { useNFTBalance } from "@/hooks/useNFTBalance";
import { WalletStatus } from "@/components/WalletStatus";

const Profile = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Use custom hooks for wallet info and NFT balance
  const walletInfo = useWalletInfo();
  const { balance: nftBalance, isLoading: nftLoading, refetch: refetchNFTs } = useNFTBalance();

  // Authentication listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/auth');
        return;
      }

      setUserId(user.uid);
      await fetchUserData(user.uid);
    });

    return () => unsubscribe();
  }, [navigate]);

  // Fetch user profile and wallet data from Firestore
  const fetchUserData = async (uid) => {
    try {
      setLoading(true);

      // Fetch user profile from 'profiles' collection
      const profileDoc = await getDoc(doc(db, 'profiles', uid));
      if (profileDoc.exists()) {
        setProfile({
          id: profileDoc.id,
          ...profileDoc.data()
        });
      }

      // Fetch wallet data from 'wallets' collection
      const walletDoc = await getDoc(doc(db, 'wallets', uid));
      if (walletDoc.exists()) {
        const walletData: any = {
          id: walletDoc.id,
          ...walletDoc.data()
        };
        setWallet(walletData);

        // Fetch balance if wallet exists
        if (walletData.wallet_address) {
          await fetchBalance(walletData.wallet_address);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch wallet balance from Firebase Function or API
  const fetchBalance = async (walletAddress) => {
    try {
      // TODO: Replace with your actual API endpoint
      // For now, using mock data
      setBalance({
        usdc: '100.00',
        usdt: '50.00',
        kes: '15000.00',
        exchangeRate: '150'
      });

      // Uncomment when you have the API ready:
      /*
      const response = await fetch('YOUR_API_ENDPOINT/get-wallet-balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress }),
      });

      if (response.ok) {
        const data = await response.json();
        setBalance(data);
      }
      */
    } catch (error) {
      console.error('Error fetching balance:', error);
      // Set default values on error
      setBalance({ usdc: '0.00', usdt: '0.00', kes: '0.00', exchangeRate: '0' });
    }
  };

  // Auto-refresh balance every 30 seconds
  useEffect(() => {
    if (!wallet?.wallet_address) return;

    const interval = setInterval(() => {
      fetchBalance(wallet.wallet_address);
    }, 30000);

    return () => clearInterval(interval);
  }, [wallet?.wallet_address]);

  const copyAddress = () => {
    if (wallet?.wallet_address) {
      navigator.clipboard.writeText(wallet.wallet_address);
      toast.success("Address copied to clipboard");
    }
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (loading || !userId) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="md:ml-16 pt-16 p-4 md:p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-12 w-48" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <main className="md:ml-16 pt-16 p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            className="mb-4"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-start gap-4 md:gap-6">
            <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-primary/10 flex items-center justify-center">     
              <User className="h-10 w-10 md:h-12 md:w-12 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                {profile?.full_name || 'QuiFlix User'}
              </h1>
              <p className="text-muted-foreground mb-2 md:mb-4 text-sm md:text-base">{profile?.email}</p>
              <p className="text-xs md:text-sm text-muted-foreground">
                Manage your QuiFlix account and view your digital film collection
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <WalletStatus variant="default" showCopyButton={false} showChainInfo={false} />
            </div>
          </div>

          {/* Wallet Details */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Wallet Details
              </h2>
              {walletInfo.isConnected ? (
                  <div className="space-y-4">
                    <WalletStatus 
                      variant="detailed" 
                      showCopyButton={true} 
                      showChainInfo={true} 
                    />

                    <div className="p-4 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg">     
                      <span className="text-sm text-muted-foreground">Token Balance</span>
                      <p className="text-2xl font-bold mt-1">
                        {balance ? `KES ${balance.kes}` : 'Loading...'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <span className="text-sm text-muted-foreground">USDC</span>
                        <p className="text-lg font-semibold mt-1">
                          {balance ? balance.usdc : '0.00'}
                        </p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <span className="text-sm text-muted-foreground">USDT</span>
                        <p className="text-lg font-semibold mt-1">
                          {balance ? balance.usdt : '0.00'}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground text-center">
                      Balance updates automatically
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No wallet connected</p>
                    <Button
                      onClick={() => navigate('/auth')}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Connect Wallet
                    </Button>
                  </div>
                )}
            </CardContent>
          </Card>

            {/* Stats and Collection */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <Film className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-3xl font-bold mb-1">
                    {nftLoading ? '...' : nftBalance}
                  </p>
                  <p className="text-sm text-muted-foreground">Films Owned</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Trophy className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-3xl font-bold mb-1">
                    {nftLoading ? '...' : nftBalance}
                  </p>
                  <p className="text-sm text-muted-foreground">NFTs Collected</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Download className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-3xl font-bold mb-1">0</p>
                  <p className="text-sm text-muted-foreground">Downloads</p>
                </CardContent>
              </Card>
            </div>

            {/* My Film Collection */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Film className="h-5 w-5 text-primary" />
                    My Film Collection
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Films you own and can watch anytime
                </p>
                {nftBalance === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <Film className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">No films yet</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Start building your collection by purchasing films
                    </p>
                    <Button onClick={() => navigate('/browse')}>
                      Browse Films
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Film className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <p className="text-xl font-semibold mb-2">You own {nftBalance} film{nftBalance !== 1 ? 's' : ''}!</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Film collection display coming soon
                    </p>
                    <Button onClick={() => refetchNFTs()} variant="outline">
                      Refresh Collection
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Settings */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-between"
                    onClick={() => toast.info('Feature coming soon')}
                  >
                    <span className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Edit Profile
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-between"
                    onClick={() => toast.info('Feature coming soon')}
                  >
                    <span className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Download Data
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-between"
                    disabled
                  >
                    <span className="flex items-center gap-2">
                      Preferences
                    </span>
                    <span className="text-xs text-muted-foreground">Soon</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    
  );
};

export default Profile;
