import { useQuery } from '@tanstack/react-query';
import { auth, db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  doc, 
  getDoc 
} from 'firebase/firestore';

export interface Film {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  genre: string | null;
  director: string | null;
  duration_minutes: number | null;
  release_year: number | null;
  poster_url: string | null;
  trailer_url: string | null;
  direct_price: number;
  nft_price: number;
  investment_price_per_share: number;
  total_shares: number;
  available_shares: number;
  creator_revenue_share: number;
  investor_revenue_share: number;
  views: number;
  rating: number;
  total_earnings: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export function useFilms() {
  return useQuery({
    queryKey: ['films'],
    queryFn: async () => {
      const filmsRef = collection(db, 'films');
      const q = query(
        filmsRef,
        where('status', '==', 'approved'),
        orderBy('created_at', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const films: Film[] = [];
      
      querySnapshot.forEach((doc) => {
        films.push({ 
          id: doc.id, 
          ...doc.data() 
        } as Film);
      });
      
      return films;
    },
  });
}

export function useFilm(id: string) {
  return useQuery({
    queryKey: ['film', id],
    queryFn: async () => {
      const filmRef = doc(db, 'films', id);
      const filmSnap = await getDoc(filmRef);
      
      if (!filmSnap.exists()) {
        throw new Error('Film not found');
      }
      
      return { 
        id: filmSnap.id, 
        ...filmSnap.data() 
      } as Film;
    },
    enabled: !!id,
  });
}

export function useMyFilms() {
  return useQuery({
    queryKey: ['my-films'],
    queryFn: async () => {
      const user = auth.currentUser;
      if (!user) return [];
      
      const filmsRef = collection(db, 'films');
      const q = query(
        filmsRef,
        where('creator_id', '==', user.uid),
        orderBy('created_at', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const films: Film[] = [];
      
      querySnapshot.forEach((doc) => {
        films.push({ 
          id: doc.id, 
          ...doc.data() 
        } as Film);
      });
      
      return films;
    },
  });
}

export function useMyInvestments() {
  return useQuery({
    queryKey: ['my-investments'],
    queryFn: async () => {
      const user = auth.currentUser;
      if (!user) return [];
      
      const investmentsRef = collection(db, 'investments');
      const q = query(
        investmentsRef,
        where('investor_id', '==', user.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const investments: any[] = [];
      
      // Fetch related film data for each investment
      for (const investmentDoc of querySnapshot.docs) {
        const investmentData = { 
          id: investmentDoc.id, 
          ...investmentDoc.data() 
        };
        
        // Get the related film
        const filmRef = doc(db, 'films', investmentData.film_id);
        const filmSnap = await getDoc(filmRef);
        
        investments.push({
          ...investmentData,
          film: filmSnap.exists() ? { 
            id: filmSnap.id, 
            ...filmSnap.data() 
          } : null
        });
      }
      
      return investments;
    },
  });
}

export function useMyPurchases() {
  return useQuery({
    queryKey: ['my-purchases'],
    queryFn: async () => {
      const user = auth.currentUser;
      if (!user) return [];
      
      const purchasesRef = collection(db, 'purchases');
      const q = query(
        purchasesRef,
        where('user_id', '==', user.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const purchases: any[] = [];
      
      // Fetch related film data for each purchase
      for (const purchaseDoc of querySnapshot.docs) {
        const purchaseData = { 
          id: purchaseDoc.id, 
          ...purchaseDoc.data() 
        };
        
        // Get the related film
        const filmRef = doc(db, 'films', purchaseData.film_id);
        const filmSnap = await getDoc(filmRef);
        
        purchases.push({
          ...purchaseData,
          film: filmSnap.exists() ? { 
            id: filmSnap.id, 
            ...filmSnap.data() 
          } : null
        });
      }
      
      return purchases;
    },
  });
}

export function useMyEarnings() {
  return useQuery({
    queryKey: ['my-earnings'],
    queryFn: async () => {
      const user = auth.currentUser;
      if (!user) return [];
      
      const earningsRef = collection(db, 'earnings');
      const q = query(
        earningsRef,
        where('user_id', '==', user.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const earnings: any[] = [];
      
      // Fetch related film title for each earning
      for (const earningDoc of querySnapshot.docs) {
        const earningData = { 
          id: earningDoc.id, 
          ...earningDoc.data() 
        };
        
        // Get the related film (only title)
        const filmRef = doc(db, 'films', earningData.film_id);
        const filmSnap = await getDoc(filmRef);
        
        earnings.push({
          ...earningData,
          film: filmSnap.exists() ? { 
            title: filmSnap.data().title 
          } : null
        });
      }
      
      return earnings;
    },
  });
}