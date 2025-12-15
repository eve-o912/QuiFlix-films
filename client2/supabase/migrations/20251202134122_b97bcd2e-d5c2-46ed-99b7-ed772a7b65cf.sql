-- Create enum for film status
CREATE TYPE public.film_status AS ENUM ('draft', 'pending', 'approved', 'rejected');

-- Create enum for purchase type
CREATE TYPE public.purchase_type AS ENUM ('nft', 'direct', 'investment');

-- Films table - producers own their content
CREATE TABLE public.films (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  genre TEXT,
  director TEXT,
  duration_minutes INTEGER,
  release_year INTEGER,
  poster_url TEXT,
  trailer_url TEXT,
  film_url TEXT,
  
  -- Pricing
  direct_price DECIMAL(10,2) DEFAULT 0,
  nft_price DECIMAL(10,2) DEFAULT 0,
  investment_price_per_share DECIMAL(10,2) DEFAULT 0,
  total_shares INTEGER DEFAULT 100,
  available_shares INTEGER DEFAULT 100,
  
  -- Revenue sharing
  creator_revenue_share DECIMAL(5,2) DEFAULT 70.00, -- Creator gets 70%
  investor_revenue_share DECIMAL(5,2) DEFAULT 20.00, -- Investors share 20%
  platform_fee DECIMAL(5,2) DEFAULT 10.00, -- Platform gets 10%
  
  -- Stats
  views INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  total_earnings DECIMAL(12,2) DEFAULT 0,
  
  status film_status DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Purchases table - track all film purchases
CREATE TABLE public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  film_id UUID NOT NULL REFERENCES public.films(id) ON DELETE CASCADE,
  purchase_type purchase_type NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USDC',
  network TEXT NOT NULL, -- base, lisk, scroll
  tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Investments table - fans invest in films
CREATE TABLE public.investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  film_id UUID NOT NULL REFERENCES public.films(id) ON DELETE CASCADE,
  shares_owned INTEGER NOT NULL,
  amount_invested DECIMAL(10,2) NOT NULL,
  earnings_claimed DECIMAL(10,2) DEFAULT 0,
  tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(investor_id, film_id)
);

-- Earnings table - track revenue distribution
CREATE TABLE public.earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  film_id UUID NOT NULL REFERENCES public.films(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  source TEXT NOT NULL, -- 'purchase', 'investment_dividend'
  claimed BOOLEAN DEFAULT false,
  tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.films ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.earnings ENABLE ROW LEVEL SECURITY;

-- Films policies
CREATE POLICY "Anyone can view approved films" ON public.films
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Creators can view own films" ON public.films
  FOR SELECT USING (auth.uid() = creator_id);

CREATE POLICY "Creators can insert own films" ON public.films
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update own films" ON public.films
  FOR UPDATE USING (auth.uid() = creator_id);

-- Purchases policies
CREATE POLICY "Users can view own purchases" ON public.purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create purchases" ON public.purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Investments policies
CREATE POLICY "Users can view own investments" ON public.investments
  FOR SELECT USING (auth.uid() = investor_id);

CREATE POLICY "Users can create investments" ON public.investments
  FOR INSERT WITH CHECK (auth.uid() = investor_id);

CREATE POLICY "Users can update own investments" ON public.investments
  FOR UPDATE USING (auth.uid() = investor_id);

-- Earnings policies
CREATE POLICY "Users can view own earnings" ON public.earnings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own earnings" ON public.earnings
  FOR UPDATE USING (auth.uid() = user_id);

-- Trigger to update film stats on purchase
CREATE OR REPLACE FUNCTION public.handle_film_purchase()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update film total earnings
  UPDATE public.films
  SET total_earnings = total_earnings + NEW.amount,
      updated_at = now()
  WHERE id = NEW.film_id;
  
  -- Create earnings for creator
  INSERT INTO public.earnings (user_id, film_id, amount, source)
  SELECT 
    f.creator_id,
    NEW.film_id,
    NEW.amount * (f.creator_revenue_share / 100),
    'purchase'
  FROM public.films f WHERE f.id = NEW.film_id;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_purchase_created
  AFTER INSERT ON public.purchases
  FOR EACH ROW EXECUTE FUNCTION public.handle_film_purchase();

-- Trigger to update available shares on investment
CREATE OR REPLACE FUNCTION public.handle_film_investment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.films
  SET available_shares = available_shares - NEW.shares_owned,
      total_earnings = total_earnings + NEW.amount_invested,
      updated_at = now()
  WHERE id = NEW.film_id;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_investment_created
  AFTER INSERT ON public.investments
  FOR EACH ROW EXECUTE FUNCTION public.handle_film_investment();