
-- Add url_hash column to matches table
ALTER TABLE matches 
ADD COLUMN url_hash TEXT;

-- Add a unique constraint to ensure no duplicate hashes
ALTER TABLE matches
ADD CONSTRAINT matches_url_hash_unique UNIQUE (url_hash);

-- Update existing matches with a random hash (if any exist)
UPDATE matches 
SET url_hash = SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6)
WHERE url_hash IS NULL;

-- Make url_hash NOT NULL after updating existing records
ALTER TABLE matches
ALTER COLUMN url_hash SET NOT NULL;
