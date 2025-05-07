-- Add INSERT policy for matches table
CREATE POLICY "Users can create matches" ON matches
  FOR INSERT WITH CHECK (
    auth.uid() IN (white_player_id, black_player_id)
  );