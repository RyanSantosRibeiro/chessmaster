
-- Enum for queue status
CREATE TYPE queue_status AS ENUM ('searching', 'matched', 'canceled');

-- Queue table
CREATE TABLE queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  ticket_amount_cents BIGINT NOT NULL,
  rank_points INTEGER DEFAULT 1000,
  status queue_status DEFAULT 'searching',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Add RLS policies
ALTER TABLE queue ENABLE ROW LEVEL SECURITY;

-- Queue policies
CREATE POLICY "Users can view queue entries" ON queue
  FOR SELECT USING (true);

CREATE POLICY "Users can create queue entries" ON queue
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own queue entries" ON queue
  FOR UPDATE USING (auth.uid() = user_id);

-- Add realtime subscription support
ALTER publication supabase_realtime ADD TABLE queue;
