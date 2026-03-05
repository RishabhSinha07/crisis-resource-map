-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Resource type enum
CREATE TYPE resource_type AS ENUM ('shelter','water','food','medical','wifi','transport');

-- Resources table
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type resource_type NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  status VARCHAR(10) DEFAULT 'active',
  contact_info VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  source VARCHAR(20) DEFAULT 'crowdsourced',
  source_id VARCHAR(100),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Votes table
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
  vote_type VARCHAR(4) CHECK (vote_type IN ('up','down')),
  voter_fingerprint VARCHAR(64),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(resource_id, voter_fingerprint)
);

-- Atomic vote toggle/switch function
CREATE OR REPLACE FUNCTION cast_vote(
  p_resource_id UUID,
  p_vote_type VARCHAR(4),
  p_voter_fingerprint VARCHAR(64)
)
RETURNS JSON AS $$
DECLARE
  existing_vote RECORD;
  result JSON;
BEGIN
  -- Check for existing vote
  SELECT * INTO existing_vote
  FROM votes
  WHERE resource_id = p_resource_id AND voter_fingerprint = p_voter_fingerprint;

  IF existing_vote IS NOT NULL THEN
    IF existing_vote.vote_type = p_vote_type THEN
      -- Same vote type: remove vote (toggle off)
      DELETE FROM votes WHERE id = existing_vote.id;

      IF p_vote_type = 'up' THEN
        UPDATE resources SET upvotes = GREATEST(upvotes - 1, 0) WHERE id = p_resource_id;
      ELSE
        UPDATE resources SET downvotes = GREATEST(downvotes - 1, 0) WHERE id = p_resource_id;
      END IF;

      SELECT json_build_object('action', 'removed', 'vote_type', p_vote_type) INTO result;
    ELSE
      -- Different vote type: switch vote
      UPDATE votes SET vote_type = p_vote_type WHERE id = existing_vote.id;

      IF p_vote_type = 'up' THEN
        UPDATE resources SET upvotes = upvotes + 1, downvotes = GREATEST(downvotes - 1, 0) WHERE id = p_resource_id;
      ELSE
        UPDATE resources SET downvotes = downvotes + 1, upvotes = GREATEST(upvotes - 1, 0) WHERE id = p_resource_id;
      END IF;

      SELECT json_build_object('action', 'switched', 'vote_type', p_vote_type) INTO result;
    END IF;
  ELSE
    -- No existing vote: insert new vote
    INSERT INTO votes (resource_id, vote_type, voter_fingerprint)
    VALUES (p_resource_id, p_vote_type, p_voter_fingerprint);

    IF p_vote_type = 'up' THEN
      UPDATE resources SET upvotes = upvotes + 1 WHERE id = p_resource_id;
    ELSE
      UPDATE resources SET downvotes = downvotes + 1 WHERE id = p_resource_id;
    END IF;

    SELECT json_build_object('action', 'added', 'vote_type', p_vote_type) INTO result;
  END IF;

  -- Auto-flag resources with high downvote ratio
  UPDATE resources
  SET status = 'flagged'
  WHERE id = p_resource_id
    AND (upvotes + downvotes) >= 5
    AND downvotes::FLOAT / (upvotes + downvotes)::FLOAT > 0.6;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- RLS policies
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Anyone can read resources
CREATE POLICY "Anyone can read resources" ON resources
  FOR SELECT USING (true);

-- Anyone can insert resources
CREATE POLICY "Anyone can insert resources" ON resources
  FOR INSERT WITH CHECK (true);

-- Anyone can update resources (for vote counts)
CREATE POLICY "Anyone can update resources" ON resources
  FOR UPDATE USING (true);

-- Anyone can read votes
CREATE POLICY "Anyone can read votes" ON votes
  FOR SELECT USING (true);

-- Anyone can insert votes
CREATE POLICY "Anyone can insert votes" ON votes
  FOR INSERT WITH CHECK (true);

-- Anyone can update votes
CREATE POLICY "Anyone can update votes" ON votes
  FOR UPDATE USING (true);

-- Anyone can delete votes (for toggle)
CREATE POLICY "Anyone can delete votes" ON votes
  FOR DELETE USING (true);

-- Enable realtime on resources
ALTER PUBLICATION supabase_realtime ADD TABLE resources;

-- Indexes
CREATE UNIQUE INDEX idx_resources_source_dedup
  ON resources (source, source_id);
CREATE INDEX idx_resources_source ON resources(source);
CREATE INDEX idx_resources_type ON resources(type);
CREATE INDEX idx_resources_status ON resources(status);
CREATE INDEX idx_resources_location ON resources(lat, lng);
CREATE INDEX idx_votes_resource ON votes(resource_id);
CREATE INDEX idx_votes_fingerprint ON votes(resource_id, voter_fingerprint);
