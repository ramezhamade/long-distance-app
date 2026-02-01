-- Long Distance Love App - Supabase Schema
-- Run this in the Supabase SQL Editor to create all tables

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Statistics table (single row)
CREATE TABLE IF NOT EXISTS statistics (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  relationship_start DATE,
  last_meeting DATE,
  next_meeting DATE
);

-- Player names table
CREATE TABLE IF NOT EXISTS player_names (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- Insert default players
INSERT INTO player_names (name) VALUES ('Ramez'), ('Layan') ON CONFLICT DO NOTHING;

-- Wordle game state
CREATE TABLE IF NOT EXISTS wordle_state (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  current_puzzle_id INTEGER DEFAULT 0,
  used_word_indices INTEGER[] DEFAULT '{}'
);

-- Wordle puzzles
CREATE TABLE IF NOT EXISTS wordle_puzzles (
  puzzle_id INTEGER PRIMARY KEY,
  word TEXT NOT NULL,
  word_index INTEGER NOT NULL,
  winner TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wordle results
CREATE TABLE IF NOT EXISTS wordle_results (
  id SERIAL PRIMARY KEY,
  puzzle_id INTEGER REFERENCES wordle_puzzles(puzzle_id),
  player_name TEXT NOT NULL,
  guesses INTEGER NOT NULL,
  won BOOLEAN NOT NULL,
  attempts INTEGER NOT NULL,
  completed BOOLEAN DEFAULT TRUE,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(puzzle_id, player_name)
);

-- Connections game state
CREATE TABLE IF NOT EXISTS connections_state (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  current_puzzle_id INTEGER DEFAULT 0,
  used_puzzle_indices INTEGER[] DEFAULT '{}'
);

-- Connections puzzles
CREATE TABLE IF NOT EXISTS connections_puzzles (
  puzzle_id INTEGER PRIMARY KEY,
  groups JSONB NOT NULL,
  shuffled_groups JSONB NOT NULL,
  puzzle_index INTEGER NOT NULL,
  winner TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Connections results
CREATE TABLE IF NOT EXISTS connections_results (
  id SERIAL PRIMARY KEY,
  puzzle_id INTEGER REFERENCES connections_puzzles(puzzle_id),
  player_name TEXT NOT NULL,
  mistakes INTEGER NOT NULL,
  completed BOOLEAN NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(puzzle_id, player_name)
);

-- Who's More Likely questions
CREATE TABLE IF NOT EXISTS wml_questions (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Who's More Likely responses
CREATE TABLE IF NOT EXISTS wml_responses (
  id SERIAL PRIMARY KEY,
  question_id TEXT REFERENCES wml_questions(id),
  player_name TEXT NOT NULL,
  answer TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(question_id, player_name)
);

-- Who's More Likely used questions
CREATE TABLE IF NOT EXISTS wml_used_questions (
  question_id TEXT PRIMARY KEY REFERENCES wml_questions(id),
  used_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scoreboard
CREATE TABLE IF NOT EXISTS scoreboard (
  player_name TEXT PRIMARY KEY,
  overall_wins INTEGER DEFAULT 0,
  overall_losses INTEGER DEFAULT 0,
  overall_ties INTEGER DEFAULT 0,
  wordle_wins INTEGER DEFAULT 0,
  wordle_losses INTEGER DEFAULT 0,
  wordle_ties INTEGER DEFAULT 0,
  wordle_avg_guesses DECIMAL DEFAULT 0,
  connections_wins INTEGER DEFAULT 0,
  connections_losses INTEGER DEFAULT 0,
  connections_ties INTEGER DEFAULT 0,
  connections_avg_mistakes DECIMAL DEFAULT 0
);

-- Insert default scoreboard entries
INSERT INTO scoreboard (player_name) VALUES ('Ramez'), ('Layan') ON CONFLICT DO NOTHING;

-- Initialize default statistics
INSERT INTO statistics (id, relationship_start, last_meeting, next_meeting)
VALUES (1, '2022-10-14', '2026-01-11', '2026-05-23')
ON CONFLICT DO NOTHING;

-- Initialize game states
INSERT INTO wordle_state (id) VALUES (1) ON CONFLICT DO NOTHING;
INSERT INTO connections_state (id) VALUES (1) ON CONFLICT DO NOTHING;

-- Enable Row Level Security (optional but recommended)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE wordle_puzzles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wordle_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections_puzzles ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE wml_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wml_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE scoreboard ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (since we handle auth in the backend)
CREATE POLICY "Allow all" ON events FOR ALL USING (true);
CREATE POLICY "Allow all" ON statistics FOR ALL USING (true);
CREATE POLICY "Allow all" ON wordle_puzzles FOR ALL USING (true);
CREATE POLICY "Allow all" ON wordle_results FOR ALL USING (true);
CREATE POLICY "Allow all" ON connections_puzzles FOR ALL USING (true);
CREATE POLICY "Allow all" ON connections_results FOR ALL USING (true);
CREATE POLICY "Allow all" ON wml_questions FOR ALL USING (true);
CREATE POLICY "Allow all" ON wml_responses FOR ALL USING (true);
CREATE POLICY "Allow all" ON scoreboard FOR ALL USING (true);
CREATE POLICY "Allow all" ON wordle_state FOR ALL USING (true);
CREATE POLICY "Allow all" ON connections_state FOR ALL USING (true);
CREATE POLICY "Allow all" ON wml_used_questions FOR ALL USING (true);
CREATE POLICY "Allow all" ON player_names FOR ALL USING (true);

ALTER TABLE wordle_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE wml_used_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_names ENABLE ROW LEVEL SECURITY;

-- Function to increment scores
CREATE OR REPLACE FUNCTION increment_score(p_player TEXT, p_game TEXT, p_result TEXT)
RETURNS void AS $$
BEGIN
  IF p_result = 'win' THEN
    UPDATE scoreboard SET
      overall_wins = overall_wins + 1,
      wordle_wins = CASE WHEN p_game = 'wordle' THEN wordle_wins + 1 ELSE wordle_wins END,
      connections_wins = CASE WHEN p_game = 'connections' THEN connections_wins + 1 ELSE connections_wins END
    WHERE player_name = p_player;
  ELSIF p_result = 'loss' THEN
    UPDATE scoreboard SET
      overall_losses = overall_losses + 1,
      wordle_losses = CASE WHEN p_game = 'wordle' THEN wordle_losses + 1 ELSE wordle_losses END,
      connections_losses = CASE WHEN p_game = 'connections' THEN connections_losses + 1 ELSE connections_losses END
    WHERE player_name = p_player;
  ELSIF p_result = 'tie' THEN
    UPDATE scoreboard SET
      overall_ties = overall_ties + 1,
      wordle_ties = CASE WHEN p_game = 'wordle' THEN wordle_ties + 1 ELSE wordle_ties END,
      connections_ties = CASE WHEN p_game = 'connections' THEN connections_ties + 1 ELSE connections_ties END
    WHERE player_name = p_player;
  END IF;
END;
$$ LANGUAGE plpgsql;