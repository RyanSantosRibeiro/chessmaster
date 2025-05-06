
-- Enum for game status
CREATE TYPE game_status AS ENUM ('waiting', 'in_progress', 'completed', 'canceled');

-- Enum for withdrawal status
CREATE TYPE withdrawal_status AS ENUM ('pending', 'approved', 'rejected', 'completed');

-- Profiles table (extends users with game-specific info)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  balance_cents BIGINT DEFAULT 0,
  trophies INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Lobbies table
CREATE TABLE lobbies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_amount_cents BIGINT NOT NULL,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  joined_by UUID REFERENCES profiles(id),
  status game_status DEFAULT 'waiting',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Matches table
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  white_player_id UUID REFERENCES profiles(id) NOT NULL,
  black_player_id UUID REFERENCES profiles(id) NOT NULL,
  winner_id UUID REFERENCES profiles(id),
  ticket_amount_cents BIGINT NOT NULL,
  status game_status DEFAULT 'in_progress',
  pgn TEXT, -- Chess game moves in PGN format
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) NOT NULL,
  amount_cents BIGINT NOT NULL,
  type TEXT NOT NULL, -- 'deposit', 'withdrawal', 'win', 'loss', 'house_fee'
  status TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Withdrawals table
CREATE TABLE withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) NOT NULL,
  amount_cents BIGINT NOT NULL,
  payment_method TEXT NOT NULL, -- 'pix' or 'bitcoin'
  payment_details JSONB NOT NULL, -- Pix key or BTC address
  status withdrawal_status DEFAULT 'pending',
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Add RLS (Row Level Security) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lobbies ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view any profile" ON profiles
  FOR SELECT USING (true);
  
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Lobbies policies
CREATE POLICY "Users can view all lobbies" ON lobbies
  FOR SELECT USING (true);
  
CREATE POLICY "Users can create lobbies" ON lobbies
  FOR INSERT WITH CHECK (auth.uid() = created_by);
  
CREATE POLICY "Users can update own lobbies" ON lobbies
  FOR UPDATE USING (auth.uid() = created_by);

-- Matches policies
CREATE POLICY "Users can view own matches" ON matches
  FOR SELECT USING (
    auth.uid() = white_player_id OR 
    auth.uid() = black_player_id
  );

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = profile_id);

-- Withdrawals policies
CREATE POLICY "Users can view own withdrawals" ON withdrawals
  FOR SELECT USING (auth.uid() = profile_id);
  
CREATE POLICY "Users can create withdrawal requests" ON withdrawals
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

-- Add realtime subscription support
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE 
  profiles,
  lobbies,
  matches;
