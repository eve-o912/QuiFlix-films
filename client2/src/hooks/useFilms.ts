import { useQuery } from '@tanstack/react-query';
import { db, auth } from '@/config/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  orderBy 
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
      try {
        const q = query(
          collection(db, 'films'),
          where('status', '==', 'approved'),
          orderBy('created_at', 'desc')
        );
        
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Film[];
      } catch (error) {
        console.error('Error fetching films:', error);
        return [];
      }
    },
  });
}

export function useFilm(id: string) {
  return useQuery({
    queryKey: ['film', id],
    queryFn: async () => {
      try {
        const docRef = doc(db, 'films', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          return {
            id: docSnap.id,
            ...docSnap.data()
          } as Film;
        }
        throw new Error('Film not found');
      } catch (error) {
        console.error('Error fetching film:', error);
        throw error;
      }
    },
    enabled: !!id,
  });
}

export function useMyFilms() {
  return useQuery({
    queryKey: ['my-films'],
    queryFn: async () => {
      try {
        const user = auth.currentUser;
        if (!user) return [];

        const q = query(
          collection(db, 'films'),
          where('creator_id', '==', user.uid),
          orderBy('created_at', 'desc')
        );
        
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Film[];
      } catch (error) {
        console.error('Error fetching my films:', error);
        return [];
      }
    },
  });
}

export function useMyInvestments() {
  return useQuery({
    queryKey: ['my-investments'],
    queryFn: async () => {
      try {
        const user = auth.currentUser;
        if (!user) return [];

        const q = query(
          collection(db, 'investments'),
          where('investor_id', '==', user.uid)
        );
        
        const snapshot = await getDocs(q);
        const investments = await Promise.all(
          snapshot.docs.map(async (investmentDoc) => {
            const investmentData = investmentDoc.data();
            
            const filmRef = doc(db, 'films', investmentData.film_id);
            const filmSnap = await getDoc(filmRef);
            
            return {
              id: investmentDoc.id,
              ...investmentData,
              film: filmSnap.exists() ? { id: filmSnap.id, ...filmSnap.data() } : null
            };
          })
        );
        
        return investments;
      } catch (error) {
        console.error('Error fetching investments:', error);
        return [];
      }
    },
  });
}

export function useMyPurchases() {
  return useQuery({
    queryKey: ['my-purchases'],
    queryFn: async () => {
      try {
        const user = auth.currentUser;
        if (!user) return [];

        const q = query(
          collection(db, 'purchases'),
          where('user_id', '==', user.uid)
        );
        
        const snapshot = await getDocs(q);
        const purchases = await Promise.all(
          snapshot.docs.map(async (purchaseDoc) => {
            const purchaseData = purchaseDoc.data();
            
            const filmRef = doc(db, 'films', purchaseData.film_id);
            const filmSnap = await getDoc(filmRef);
            
            return {
              id: purchaseDoc.id,
              ...purchaseData,
              film: filmSnap.exists() ? { id: filmSnap.id, ...filmSnap.data() } : null
            };
          })
        );
        
        return purchases;
      } catch (error) {
        console.error('Error fetching purchases:', error);
        return [];
      }
    },
  });
}

export function useMyEarnings() {
  return useQuery({
    queryKey: ['my-earnings'],
    queryFn: async () => {
      try {
        const user = auth.currentUser;
        if (!user) return [];

        const q = query(
          collection(db, 'earnings'),
          where('user_id', '==', user.uid)
        );
        
        const snapshot = await getDocs(q);
        const earnings = await Promise.all(
          snapshot.docs.map(async (earningDoc) => {
            const earningData = earningDoc.data();
            
            const filmRef = doc(db, 'films', earningData.film_id);
            const filmSnap = await getDoc(filmRef);
            
            return {
              id: earningDoc.id,
              ...earningData,
              film: filmSnap.exists() ? { title: filmSnap.data().title } : { title: 'Unknown' }
            };
          })
        );
        
        return earnings;
      } catch (error) {
        console.error('Error fetching earnings:', error);
        return [];
      }
    },
  });
}
