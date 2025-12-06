import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
      const { data, error } = await supabase
        .from('films')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Film[];
    },
  });
}

export function useFilm(id: string) {
  return useQuery({
    queryKey: ['film', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('films')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Film;
    },
    enabled: !!id,
  });
}

export function useMyFilms() {
  return useQuery({
    queryKey: ['my-films'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('films')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Film[];
    },
  });
}

export function useMyInvestments() {
  return useQuery({
    queryKey: ['my-investments'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('investments')
        .select(`
          *,
          film:films(*)
        `)
        .eq('investor_id', user.id);

      if (error) throw error;
      return data;
    },
  });
}

export function useMyPurchases() {
  return useQuery({
    queryKey: ['my-purchases'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('purchases')
        .select(`
          *,
          film:films(*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      return data;
    },
  });
}

export function useMyEarnings() {
  return useQuery({
    queryKey: ['my-earnings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('earnings')
        .select(`
          *,
          film:films(title)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      return data;
    },
  });
}
