require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;

// Check if Supabase is configured
const USE_SUPABASE = process.env.SUPABASE_URL && process.env.SUPABASE_KEY;
let supabase = null;

if (USE_SUPABASE) {
  supabase = require('./database/supabase');
  console.log('Using Supabase database');
} else {
  console.log('Using file-based storage (data.json)');
}

// Player credentials
const PLAYERS = {
  ramez: {
    username: 'ramez',
    password: 'Ramez',
    playerName: 'Ramez'
  },
  layan: {
    username: 'layan',
    password: 'Layan',
    playerName: 'Layan'
  }
};

app.use(cors());
app.use(bodyParser.json());

// Helper to validate credentials and get player
function validateCredentials(username, password) {
  for (const player of Object.values(PLAYERS)) {
    if (player.username === username && player.password === password) {
      return player.playerName;
    }
  }
  return null;
}

// Simple authentication middleware
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');

  const playerName = validateCredentials(username, password);
  if (playerName) {
    req.playerName = playerName;
    next();
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
}

// ============ FILE-BASED STORAGE ============
const DATA_FILE = path.join(__dirname, 'data.json');

function readData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      const parsed = JSON.parse(data);

      if (!parsed.whoMoreLikely) {
        parsed.whoMoreLikely = { questions: [], responses: {} };
      }
      if (!parsed.whoMoreLikely.questions) parsed.whoMoreLikely.questions = [];
      if (!parsed.whoMoreLikely.responses) parsed.whoMoreLikely.responses = {};

      return parsed;
    }
  } catch (error) {
    console.error('Error reading data:', error);
  }

  const defaultData = {
    events: [],
    statistics: { relationshipStart: null, lastMeeting: null, nextMeeting: null },
    whoMoreLikely: { questions: [], responses: {} },
    games: {
      wordle: { currentPuzzleId: 0, puzzles: {}, usedWordIndices: [] },
      connections: { currentPuzzleId: 0, puzzles: {}, usedPuzzleIndices: [] }
    },
    scoreboard: {
      overall: {
        Ramez: { wins: 0, losses: 0, ties: 0 },
        Layan: { wins: 0, losses: 0, ties: 0 }
      },
      byGame: {
        wordle: { Ramez: { wins: 0, losses: 0, ties: 0 }, Layan: { wins: 0, losses: 0, ties: 0 } },
        connections: { Ramez: { wins: 0, losses: 0, ties: 0 }, Layan: { wins: 0, losses: 0, ties: 0 } }
      }
    }
  };

  writeData(defaultData);
  return defaultData;
}

function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing data:', error);
  }
}

// Load game content
const wordleWords = require('./gameContent/wordleWords');
const connectionsPuzzles = require('./gameContent/connectionsPuzzles');
const whoMoreLikelyQuestions = require('./gameContent/whoMoreLikelyQuestions');

// Helper function to shuffle an array (Fisher-Yates algorithm)
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getPlayerName(req) {
  return req.playerName || 'Unknown';
}

// ============ LOGIN ENDPOINT ============
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  const playerName = validateCredentials(username, password);
  if (playerName) {
    res.json({ success: true, message: 'Login successful', playerName });
  } else {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
});

// ============ EVENTS ENDPOINTS ============
app.get('/api/events', authenticate, async (req, res) => {
  if (USE_SUPABASE) {
    try {
      const { data, error } = await supabase.from('events').select('*').order('date', { ascending: true });
      if (error) throw error;
      res.json(data.map(e => ({ id: e.id, title: e.title, date: e.date, description: e.description, createdAt: e.created_at })));
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({ error: 'Failed to fetch events' });
    }
  } else {
    const data = readData();
    res.json(data.events);
  }
});

app.post('/api/events', authenticate, async (req, res) => {
  const newEvent = {
    id: Date.now().toString(),
    title: req.body.title,
    date: req.body.date,
    description: req.body.description || '',
    createdAt: new Date().toISOString()
  };

  if (USE_SUPABASE) {
    try {
      const { data, error } = await supabase.from('events').insert([{ ...newEvent, created_at: newEvent.createdAt }]).select().single();
      if (error) throw error;
      res.status(201).json({ id: data.id, title: data.title, date: data.date, description: data.description, createdAt: data.created_at });
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).json({ error: 'Failed to create event' });
    }
  } else {
    const data = readData();
    data.events.push(newEvent);
    writeData(data);
    res.status(201).json(newEvent);
  }
});

app.delete('/api/events/:id', authenticate, async (req, res) => {
  if (USE_SUPABASE) {
    try {
      await supabase.from('events').delete().eq('id', req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting event:', error);
      res.status(500).json({ error: 'Failed to delete event' });
    }
  } else {
    const data = readData();
    data.events = data.events.filter(event => event.id !== req.params.id);
    writeData(data);
    res.status(204).send();
  }
});

app.put('/api/events/:id', authenticate, async (req, res) => {
  if (USE_SUPABASE) {
    try {
      const { data, error } = await supabase.from('events').update({
        title: req.body.title, date: req.body.date, description: req.body.description || ''
      }).eq('id', req.params.id).select().single();
      if (error) throw error;
      res.json({ id: data.id, title: data.title, date: data.date, description: data.description, createdAt: data.created_at });
    } catch (error) {
      console.error('Error updating event:', error);
      res.status(500).json({ error: 'Failed to update event' });
    }
  } else {
    const data = readData();
    const index = data.events.findIndex(event => event.id === req.params.id);
    if (index !== -1) {
      data.events[index] = { ...data.events[index], title: req.body.title, date: req.body.date, description: req.body.description || '' };
      writeData(data);
      res.json(data.events[index]);
    } else {
      res.status(404).json({ error: 'Event not found' });
    }
  }
});

// ============ STATISTICS ENDPOINTS ============
app.get('/api/statistics', authenticate, async (req, res) => {
  if (USE_SUPABASE) {
    try {
      const { data, error } = await supabase.from('statistics').select('*').eq('id', 1).single();
      if (error && error.code !== 'PGRST116') throw error;
      res.json({ relationshipStart: data?.relationship_start || null, lastMeeting: data?.last_meeting || null, nextMeeting: data?.next_meeting || null });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  } else {
    const data = readData();
    res.json(data.statistics || { relationshipStart: null, lastMeeting: null, nextMeeting: null });
  }
});

app.put('/api/statistics', authenticate, async (req, res) => {
  const stats = { relationshipStart: req.body.relationshipStart || null, lastMeeting: req.body.lastMeeting || null, nextMeeting: req.body.nextMeeting || null };

  if (USE_SUPABASE) {
    try {
      const { data, error } = await supabase.from('statistics').upsert({ id: 1, relationship_start: stats.relationshipStart, last_meeting: stats.lastMeeting, next_meeting: stats.nextMeeting }).select().single();
      if (error) throw error;
      res.json({ relationshipStart: data.relationship_start, lastMeeting: data.last_meeting, nextMeeting: data.next_meeting });
    } catch (error) {
      console.error('Error updating statistics:', error);
      res.status(500).json({ error: 'Failed to update statistics' });
    }
  } else {
    const data = readData();
    data.statistics = stats;
    writeData(data);
    res.json(stats);
  }
});

// ============ GAME HELPER FUNCTIONS ============
function initializeGameData(data) {
  if (!data.games) data.games = {};
  if (!data.games.wordle) data.games.wordle = { currentPuzzleId: 0, puzzles: {}, usedWordIndices: [] };
  if (!data.games.connections) data.games.connections = { currentPuzzleId: 0, puzzles: {}, usedPuzzleIndices: [] };
  if (!data.games.wordle.usedWordIndices) data.games.wordle.usedWordIndices = [];
  if (!data.games.connections.usedPuzzleIndices) data.games.connections.usedPuzzleIndices = [];
}

function getRandomUnusedWordFile(data) {
  const usedIndices = data.games.wordle.usedWordIndices || [];
  const availableIndices = [];
  for (let i = 0; i < wordleWords.length; i++) {
    if (!usedIndices.includes(i)) availableIndices.push(i);
  }
  if (availableIndices.length === 0) return null;
  const randomIdx = availableIndices[Math.floor(Math.random() * availableIndices.length)];
  return { word: wordleWords[randomIdx], index: randomIdx };
}

function getRandomUnusedPuzzleFile(data) {
  const usedIndices = data.games.connections.usedPuzzleIndices || [];
  const availableIndices = [];
  for (let i = 0; i < connectionsPuzzles.length; i++) {
    if (!usedIndices.includes(i)) availableIndices.push(i);
  }
  if (availableIndices.length === 0) return null;
  const randomIdx = availableIndices[Math.floor(Math.random() * availableIndices.length)];
  return { puzzle: connectionsPuzzles[randomIdx], index: randomIdx };
}

function calculateWinnerFile(game, puzzleId, data) {
  const puzzle = data.games[game].puzzles[puzzleId];
  if (!puzzle || !puzzle.results) return;

  const players = Object.keys(puzzle.results);
  if (players.length !== 2) return;

  const [p1, p2] = players;
  const r1 = puzzle.results[p1];
  const r2 = puzzle.results[p2];

  if (!(r1.timestamp && r2.timestamp)) return;

  let winner = null;
  if (game === 'wordle') {
    if (r1.won && !r2.won) winner = p1;
    else if (r2.won && !r1.won) winner = p2;
    else if (r1.guesses < r2.guesses) winner = p1;
    else if (r2.guesses < r1.guesses) winner = p2;
    else winner = 'tie';
  } else if (game === 'connections') {
    if (r1.completed && !r2.completed) winner = p1;
    else if (r2.completed && !r1.completed) winner = p2;
    else if (r1.mistakes < r2.mistakes) winner = p1;
    else if (r2.mistakes < r1.mistakes) winner = p2;
    else winner = 'tie';
  }

  puzzle.winner = winner;

  if (winner && winner !== 'tie') {
    const loser = winner === p1 ? p2 : p1;
    data.scoreboard.overall[winner].wins++;
    data.scoreboard.overall[loser].losses++;
    data.scoreboard.byGame[game][winner].wins++;
    data.scoreboard.byGame[game][loser].losses++;
  } else if (winner === 'tie') {
    data.scoreboard.overall[p1].ties++;
    data.scoreboard.overall[p2].ties++;
    if (!data.scoreboard.byGame[game][p1].ties) data.scoreboard.byGame[game][p1].ties = 0;
    if (!data.scoreboard.byGame[game][p2].ties) data.scoreboard.byGame[game][p2].ties = 0;
    data.scoreboard.byGame[game][p1].ties++;
    data.scoreboard.byGame[game][p2].ties++;
  }

  data.games[game].currentPuzzleId++;
}

// ============ WORDLE ENDPOINTS ============
app.get('/api/games/wordle/today', authenticate, async (req, res) => {
  const playerName = getPlayerName(req);

  if (USE_SUPABASE) {
    try {
      let { data: state } = await supabase.from('wordle_state').select('*').eq('id', 1).single();
      if (!state) {
        await supabase.from('wordle_state').insert([{ id: 1, current_puzzle_id: 0, used_word_indices: [] }]);
        state = { current_puzzle_id: 0, used_word_indices: [] };
      }

      const puzzleId = state.current_puzzle_id;
      let { data: puzzle } = await supabase.from('wordle_puzzles').select('*').eq('puzzle_id', puzzleId).single();

      if (puzzle) {
        const { data: results } = await supabase.from('wordle_results').select('*').eq('puzzle_id', puzzleId);
        const myResult = results?.find(r => r.player_name === playerName);
        const otherPlayer = playerName === 'Ramez' ? 'Layan' : 'Ramez';
        const otherResult = results?.find(r => r.player_name === otherPlayer);

        return res.json({
          puzzleId, word: puzzle.word, validWords: wordleWords,
          myResult: myResult ? { guesses: myResult.guesses, won: myResult.won, attempts: myResult.attempts, completed: myResult.completed, timestamp: myResult.timestamp } : null,
          opponentResult: otherResult?.timestamp ? { guesses: otherResult.guesses, won: otherResult.won, attempts: otherResult.attempts, completed: otherResult.completed, timestamp: otherResult.timestamp } : null,
          winner: puzzle.winner
        });
      }

      // Create new puzzle
      const usedIndices = state.used_word_indices || [];
      const availableIndices = [];
      for (let i = 0; i < wordleWords.length; i++) {
        if (!usedIndices.includes(i)) availableIndices.push(i);
      }

      if (availableIndices.length === 0) {
        return res.status(400).json({ error: 'No more unique puzzles available', message: `You've completed all ${wordleWords.length} Wordle puzzles!` });
      }

      const randomIdx = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      const word = wordleWords[randomIdx];

      await supabase.from('wordle_puzzles').insert([{ puzzle_id: puzzleId, word, word_index: randomIdx }]);
      await supabase.from('wordle_state').update({ used_word_indices: [...usedIndices, randomIdx] }).eq('id', 1);

      res.json({ puzzleId, word, validWords: wordleWords, myResult: null, opponentResult: null, winner: null });
    } catch (error) {
      console.error('Error in wordle/today:', error);
      res.status(500).json({ error: 'Failed to get wordle puzzle' });
    }
  } else {
    const data = readData();
    initializeGameData(data);

    const puzzleId = data.games.wordle.currentPuzzleId;

    if (data.games.wordle.puzzles[puzzleId]) {
      const puzzle = data.games.wordle.puzzles[puzzleId];
      const myResult = puzzle.results[playerName];
      const otherPlayer = playerName === 'Ramez' ? 'Layan' : 'Ramez';
      const otherResult = puzzle.results[otherPlayer];

      return res.json({
        puzzleId, word: puzzle.word, validWords: wordleWords,
        myResult: myResult || null,
        opponentResult: otherResult?.timestamp ? otherResult : null,
        winner: puzzle.winner || null
      });
    }

    const wordResult = getRandomUnusedWordFile(data);
    if (!wordResult) {
      return res.status(400).json({ error: 'No more unique puzzles available', message: `You've completed all ${wordleWords.length} Wordle puzzles!` });
    }

    data.games.wordle.puzzles[puzzleId] = { word: wordResult.word, wordIndex: wordResult.index, puzzleId, results: {} };
    data.games.wordle.usedWordIndices.push(wordResult.index);
    writeData(data);

    res.json({ puzzleId, word: wordResult.word, validWords: wordleWords, myResult: null, opponentResult: null, winner: null });
  }
});

app.post('/api/games/wordle/submit', authenticate, async (req, res) => {
  const playerName = getPlayerName(req);
  const { guesses, won, attempts } = req.body;

  if (USE_SUPABASE) {
    try {
      const { data: state } = await supabase.from('wordle_state').select('current_puzzle_id').eq('id', 1).single();
      const puzzleId = state.current_puzzle_id;

      const { data: puzzle } = await supabase.from('wordle_puzzles').select('*').eq('puzzle_id', puzzleId).single();
      if (!puzzle) return res.status(400).json({ error: 'No active puzzle' });

      await supabase.from('wordle_results').upsert([{ puzzle_id: puzzleId, player_name: playerName, guesses, won, attempts, completed: true, timestamp: new Date().toISOString() }]);

      const { data: results } = await supabase.from('wordle_results').select('*').eq('puzzle_id', puzzleId);

      if (results.length === 2) {
        const [r1, r2] = results;
        let winner = null;
        if (r1.won && !r2.won) winner = r1.player_name;
        else if (r2.won && !r1.won) winner = r2.player_name;
        else if (r1.guesses < r2.guesses) winner = r1.player_name;
        else if (r2.guesses < r1.guesses) winner = r2.player_name;
        else winner = 'tie';

        await supabase.from('wordle_puzzles').update({ winner }).eq('puzzle_id', puzzleId);

        if (winner !== 'tie') {
          const loser = winner === r1.player_name ? r2.player_name : r1.player_name;
          await supabase.rpc('increment_score', { p_player: winner, p_game: 'wordle', p_result: 'win' });
          await supabase.rpc('increment_score', { p_player: loser, p_game: 'wordle', p_result: 'loss' });
        } else {
          await supabase.rpc('increment_score', { p_player: r1.player_name, p_game: 'wordle', p_result: 'tie' });
          await supabase.rpc('increment_score', { p_player: r2.player_name, p_game: 'wordle', p_result: 'tie' });
        }

        await supabase.from('wordle_state').update({ current_puzzle_id: puzzleId + 1 }).eq('id', 1);
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Error in wordle/submit:', error);
      res.status(500).json({ error: 'Failed to submit wordle result' });
    }
  } else {
    const data = readData();
    initializeGameData(data);
    const puzzleId = data.games.wordle.currentPuzzleId;

    if (!data.games.wordle.puzzles[puzzleId]) return res.status(400).json({ error: 'No active puzzle' });

    data.games.wordle.puzzles[puzzleId].results[playerName] = { guesses, won, attempts, completed: true, timestamp: new Date().toISOString() };
    calculateWinnerFile('wordle', puzzleId, data);
    writeData(data);

    res.json({ success: true });
  }
});

// ============ CONNECTIONS ENDPOINTS ============
app.get('/api/games/connections/today', authenticate, async (req, res) => {
  const playerName = getPlayerName(req);

  if (USE_SUPABASE) {
    try {
      let { data: state } = await supabase.from('connections_state').select('*').eq('id', 1).single();
      if (!state) {
        await supabase.from('connections_state').insert([{ id: 1, current_puzzle_id: 0, used_puzzle_indices: [] }]);
        state = { current_puzzle_id: 0, used_puzzle_indices: [] };
      }

      const puzzleId = state.current_puzzle_id;
      let { data: puzzle } = await supabase.from('connections_puzzles').select('*').eq('puzzle_id', puzzleId).single();

      if (puzzle) {
        const { data: results } = await supabase.from('connections_results').select('*').eq('puzzle_id', puzzleId);
        const myResult = results?.find(r => r.player_name === playerName);
        const otherPlayer = playerName === 'Ramez' ? 'Layan' : 'Ramez';
        const otherResult = results?.find(r => r.player_name === otherPlayer);

        const shuffledGroups = puzzle.groups.map(group => ({ ...group, words: shuffleArray(group.words) }));

        return res.json({
          puzzleId, groups: shuffledGroups,
          myResult: myResult ? { mistakes: myResult.mistakes, completed: myResult.completed, timestamp: myResult.timestamp } : null,
          opponentResult: otherResult?.timestamp ? { mistakes: otherResult.mistakes, completed: otherResult.completed, timestamp: otherResult.timestamp } : null,
          winner: puzzle.winner
        });
      }

      // Create new puzzle
      const usedIndices = state.used_puzzle_indices || [];
      const availableIndices = [];
      for (let i = 0; i < connectionsPuzzles.length; i++) {
        if (!usedIndices.includes(i)) availableIndices.push(i);
      }

      if (availableIndices.length === 0) {
        return res.status(400).json({ error: 'No more unique puzzles available', message: `You've completed all ${connectionsPuzzles.length} Connections puzzles!` });
      }

      const randomIdx = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      const puzzleContent = connectionsPuzzles[randomIdx];
      const shuffledGroups = shuffleArray(puzzleContent.groups).map(g => ({ ...g, words: shuffleArray(g.words) }));

      await supabase.from('connections_puzzles').insert([{ puzzle_id: puzzleId, groups: puzzleContent.groups, shuffled_groups: shuffledGroups, puzzle_index: randomIdx }]);
      await supabase.from('connections_state').update({ used_puzzle_indices: [...usedIndices, randomIdx] }).eq('id', 1);

      res.json({ puzzleId, groups: shuffledGroups, myResult: null, opponentResult: null, winner: null });
    } catch (error) {
      console.error('Error in connections/today:', error);
      res.status(500).json({ error: 'Failed to get connections puzzle' });
    }
  } else {
    const data = readData();
    initializeGameData(data);

    const puzzleId = data.games.connections.currentPuzzleId;

    if (data.games.connections.puzzles[puzzleId]) {
      const currentPuzzle = data.games.connections.puzzles[puzzleId];
      const myResult = currentPuzzle.results[playerName];
      const otherPlayer = playerName === 'Ramez' ? 'Layan' : 'Ramez';
      const otherResult = currentPuzzle.results[otherPlayer];

      const shuffledGroups = currentPuzzle.groups.map(group => ({ ...group, words: shuffleArray(group.words) }));

      return res.json({
        puzzleId, groups: shuffledGroups,
        myResult: myResult || null,
        opponentResult: otherResult?.timestamp ? otherResult : null,
        winner: currentPuzzle.winner || null
      });
    }

    const puzzleResult = getRandomUnusedPuzzleFile(data);
    if (!puzzleResult) {
      return res.status(400).json({ error: 'No more unique puzzles available', message: `You've completed all ${connectionsPuzzles.length} Connections puzzles!` });
    }

    const shuffledGroups = shuffleArray(puzzleResult.puzzle.groups).map(g => ({ ...g, words: shuffleArray(g.words) }));

    data.games.connections.puzzles[puzzleId] = { groups: puzzleResult.puzzle.groups, shuffledGroups, puzzleIndex: puzzleResult.index, puzzleId, results: {} };
    data.games.connections.usedPuzzleIndices.push(puzzleResult.index);
    writeData(data);

    res.json({ puzzleId, groups: shuffledGroups, myResult: null, opponentResult: null, winner: null });
  }
});

app.post('/api/games/connections/submit', authenticate, async (req, res) => {
  const playerName = getPlayerName(req);
  const { mistakes, completed } = req.body;

  if (USE_SUPABASE) {
    try {
      const { data: state } = await supabase.from('connections_state').select('current_puzzle_id').eq('id', 1).single();
      const puzzleId = state.current_puzzle_id;

      const { data: puzzle } = await supabase.from('connections_puzzles').select('*').eq('puzzle_id', puzzleId).single();
      if (!puzzle) return res.status(400).json({ error: 'No active puzzle' });

      await supabase.from('connections_results').upsert([{ puzzle_id: puzzleId, player_name: playerName, mistakes, completed, timestamp: new Date().toISOString() }]);

      const { data: results } = await supabase.from('connections_results').select('*').eq('puzzle_id', puzzleId);

      if (results.length === 2) {
        const [r1, r2] = results;
        let winner = null;
        if (r1.completed && !r2.completed) winner = r1.player_name;
        else if (r2.completed && !r1.completed) winner = r2.player_name;
        else if (r1.mistakes < r2.mistakes) winner = r1.player_name;
        else if (r2.mistakes < r1.mistakes) winner = r2.player_name;
        else winner = 'tie';

        await supabase.from('connections_puzzles').update({ winner }).eq('puzzle_id', puzzleId);

        if (winner !== 'tie') {
          const loser = winner === r1.player_name ? r2.player_name : r1.player_name;
          await supabase.rpc('increment_score', { p_player: winner, p_game: 'connections', p_result: 'win' });
          await supabase.rpc('increment_score', { p_player: loser, p_game: 'connections', p_result: 'loss' });
        } else {
          await supabase.rpc('increment_score', { p_player: r1.player_name, p_game: 'connections', p_result: 'tie' });
          await supabase.rpc('increment_score', { p_player: r2.player_name, p_game: 'connections', p_result: 'tie' });
        }

        await supabase.from('connections_state').update({ current_puzzle_id: puzzleId + 1 }).eq('id', 1);
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Error in connections/submit:', error);
      res.status(500).json({ error: 'Failed to submit connections result' });
    }
  } else {
    const data = readData();
    initializeGameData(data);
    const puzzleId = data.games.connections.currentPuzzleId;

    if (!data.games.connections.puzzles[puzzleId]) return res.status(400).json({ error: 'No active puzzle' });

    data.games.connections.puzzles[puzzleId].results[playerName] = { mistakes, completed, timestamp: new Date().toISOString() };
    calculateWinnerFile('connections', puzzleId, data);
    writeData(data);

    res.json({ success: true });
  }
});

// ============ WHO'S MORE LIKELY ENDPOINTS ============
function shuffleQuestionsByCategory(questionsObj) {
  const categorizedQuestions = {};
  const categories = Object.keys(questionsObj);

  categories.forEach(category => {
    const shuffledCategoryQuestions = shuffleArray(questionsObj[category]);
    categorizedQuestions[category] = shuffledCategoryQuestions.map(text => ({
      id: `wml_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      text,
      category,
      createdAt: new Date().toISOString()
    }));
  });

  const shuffledCategories = shuffleArray(categories);
  const allQuestions = [];
  const maxLength = Math.max(...shuffledCategories.map(cat => categorizedQuestions[cat].length));

  for (let i = 0; i < maxLength; i++) {
    shuffledCategories.forEach(category => {
      if (categorizedQuestions[category][i]) {
        allQuestions.push(categorizedQuestions[category][i]);
      }
    });
  }

  return allQuestions;
}

app.get('/api/who-more-likely/questions', authenticate, async (req, res) => {
  if (USE_SUPABASE) {
    try {
      // Initialize if empty
      const { data: existing } = await supabase.from('wml_questions').select('id').limit(1);
      if (!existing || existing.length === 0) {
        const questions = shuffleQuestionsByCategory(whoMoreLikelyQuestions);
        await supabase.from('wml_questions').insert(questions.map(q => ({ id: q.id, text: q.text, category: q.category, created_at: q.createdAt })));
      }

      const { data: usedIds } = await supabase.from('wml_used_questions').select('question_id');
      const usedIdList = usedIds?.map(u => u.question_id) || [];

      let query = supabase.from('wml_questions').select('*');
      if (usedIdList.length > 0) {
        query = query.not('id', 'in', `(${usedIdList.join(',')})`);
      }

      const { data: questions } = await query;
      res.json(questions.map(q => ({ id: q.id, text: q.text, category: q.category, createdAt: q.created_at })));
    } catch (error) {
      console.error('Error fetching wml questions:', error);
      res.status(500).json({ error: 'Failed to fetch questions' });
    }
  } else {
    const data = readData();
    if (!data.whoMoreLikely.questions || data.whoMoreLikely.questions.length === 0) {
      data.whoMoreLikely.questions = shuffleQuestionsByCategory(whoMoreLikelyQuestions);
      writeData(data);
    }
    res.json(data.whoMoreLikely.questions);
  }
});

app.get('/api/who-more-likely/next', authenticate, async (req, res) => {
  const playerName = getPlayerName(req);

  if (USE_SUPABASE) {
    try {
      // Initialize if empty
      const { data: existing } = await supabase.from('wml_questions').select('id').limit(1);
      if (!existing || existing.length === 0) {
        const questions = shuffleQuestionsByCategory(whoMoreLikelyQuestions);
        await supabase.from('wml_questions').insert(questions.map(q => ({ id: q.id, text: q.text, category: q.category, created_at: q.createdAt })));
      }

      const { data: usedIds } = await supabase.from('wml_used_questions').select('question_id');
      const usedIdList = usedIds?.map(u => u.question_id) || [];

      let query = supabase.from('wml_questions').select('*');
      if (usedIdList.length > 0) {
        query = query.not('id', 'in', `(${usedIdList.join(',')})`);
      }

      const { data: questions } = await query;

      if (!questions || questions.length === 0) {
        return res.json({ question: null, allAnswered: true });
      }

      for (const q of questions) {
        const { data: responses } = await supabase.from('wml_responses').select('*').eq('question_id', q.id);
        const myResponse = responses?.find(r => r.player_name === playerName);

        if (!myResponse) {
          const otherPlayer = playerName === 'Ramez' ? 'Layan' : 'Ramez';
          const otherResponse = responses?.find(r => r.player_name === otherPlayer);
          const bothAnswered = myResponse && otherResponse;

          return res.json({
            question: { id: q.id, text: q.text, category: q.category, createdAt: q.created_at },
            myAnswer: myResponse?.answer || null,
            opponentAnswer: bothAnswered ? otherResponse?.answer : null,
            bothAnswered
          });
        }
      }

      res.json({ question: null, allAnswered: true });
    } catch (error) {
      console.error('Error fetching next wml question:', error);
      res.status(500).json({ error: 'Failed to fetch next question' });
    }
  } else {
    const data = readData();
    if (!data.whoMoreLikely.questions || data.whoMoreLikely.questions.length === 0) {
      data.whoMoreLikely.questions = shuffleQuestionsByCategory(whoMoreLikelyQuestions);
      writeData(data);
    }

    const unanswered = data.whoMoreLikely.questions.find(q => {
      const responses = data.whoMoreLikely.responses[q.id];
      return !responses || !responses[playerName];
    });

    if (!unanswered) {
      return res.json({ question: null, allAnswered: true });
    }

    const responses = data.whoMoreLikely.responses[unanswered.id] || {};
    const otherPlayer = playerName === 'Ramez' ? 'Layan' : 'Ramez';
    const bothAnswered = responses[playerName] && responses[otherPlayer];

    res.json({
      question: unanswered,
      myAnswer: responses[playerName] || null,
      opponentAnswer: bothAnswered ? responses[otherPlayer] : null,
      bothAnswered
    });
  }
});

app.post('/api/who-more-likely/answer', authenticate, async (req, res) => {
  const playerName = getPlayerName(req);
  const { questionId, answer } = req.body;

  if (USE_SUPABASE) {
    try {
      await supabase.from('wml_responses').upsert([{ question_id: questionId, player_name: playerName, answer, timestamp: new Date().toISOString() }]);

      const { data: responses } = await supabase.from('wml_responses').select('*').eq('question_id', questionId);

      if (responses.length === 2) {
        await supabase.from('wml_used_questions').upsert([{ question_id: questionId, used_at: new Date().toISOString() }]);
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Error submitting wml answer:', error);
      res.status(500).json({ error: 'Failed to submit answer' });
    }
  } else {
    const data = readData();

    // Find the question to save its text
    const question = data.whoMoreLikely.questions.find(q => q.id === questionId);

    if (!data.whoMoreLikely.responses[questionId]) {
      data.whoMoreLikely.responses[questionId] = {};
    }

    data.whoMoreLikely.responses[questionId][playerName] = answer;

    // Store question text with responses so we can retrieve it for history
    if (question && !data.whoMoreLikely.responses[questionId]._questionData) {
      data.whoMoreLikely.responses[questionId]._questionData = {
        text: question.text,
        category: question.category,
        createdAt: question.createdAt
      };
    }

    const responses = data.whoMoreLikely.responses[questionId];
    const otherPlayer = playerName === 'Ramez' ? 'Layan' : 'Ramez';
    if (responses[playerName] && responses[otherPlayer]) {
      if (!data.whoMoreLikely.usedQuestionIds) data.whoMoreLikely.usedQuestionIds = [];
      if (!data.whoMoreLikely.usedQuestionIds.includes(questionId)) {
        data.whoMoreLikely.usedQuestionIds.push(questionId);
      }
      data.whoMoreLikely.questions = data.whoMoreLikely.questions.filter(q => q.id !== questionId);
    }

    writeData(data);
    res.json({ success: true });
  }
});

// FIXED: History endpoint that shows ALL questions both players answered, with disagreements flagged
app.get('/api/who-more-likely/history', authenticate, async (req, res) => {
  if (USE_SUPABASE) {
    try {
      const { data: allResponses, error: respError } = await supabase.from('wml_responses').select('*').order('timestamp', { ascending: false });

      if (respError) throw respError;
      if (!allResponses || allResponses.length === 0) return res.json([]);

      // Group responses by question_id
      const responsesByQuestion = {};
      for (const resp of allResponses) {
        if (!responsesByQuestion[resp.question_id]) responsesByQuestion[resp.question_id] = {};
        responsesByQuestion[resp.question_id][resp.player_name] = resp.answer;
      }

      // Find questions where BOTH players have answered
      const completedQuestionIds = Object.keys(responsesByQuestion).filter(qId => {
        const responses = responsesByQuestion[qId];
        return responses['Ramez'] && responses['Layan'];
      });

      if (completedQuestionIds.length === 0) return res.json([]);

      const { data: questions, error: qError } = await supabase.from('wml_questions').select('*').in('id', completedQuestionIds);

      if (qError) throw qError;

      const history = questions.map(q => {
        const responses = responsesByQuestion[q.id];
        return {
          question: { id: q.id, text: q.text, category: q.category, createdAt: q.created_at },
          responses: { Ramez: responses['Ramez'], Layan: responses['Layan'] },
          disagreed: responses['Ramez'] !== responses['Layan']
        };
      });

      // Sort: disagreements first
      history.sort((a, b) => {
        if (a.disagreed && !b.disagreed) return -1;
        if (!a.disagreed && b.disagreed) return 1;
        return 0;
      });

      res.json(history);
    } catch (error) {
      console.error('Error fetching wml history:', error);
      res.status(500).json({ error: 'Failed to fetch history' });
    }
  } else {
    // FILE-BASED: Look at ALL responses, not just remaining questions
    const data = readData();
    const history = [];

    // Iterate through ALL responses to find completed ones
    for (const [questionId, responses] of Object.entries(data.whoMoreLikely.responses || {})) {
      if (responses['Ramez'] && responses['Layan']) {
        // Find the question text - check current questions first
        let question = data.whoMoreLikely.questions.find(q => q.id === questionId);

        // If not in current questions, check if we stored the question data with the responses
        if (!question && responses._questionData) {
          question = {
            id: questionId,
            text: responses._questionData.text,
            category: responses._questionData.category,
            createdAt: responses._questionData.createdAt
          };
        }

        // Skip if we don't have question text (shouldn't happen with the fix in place)
        if (!question) {
          question = { id: questionId, text: 'Question (text not available)', category: 'unknown' };
        }

        history.push({
          question: {
            id: questionId,
            text: question.text,
            category: question.category,
            createdAt: question.createdAt
          },
          responses: {
            Ramez: responses['Ramez'],
            Layan: responses['Layan']
          },
          disagreed: responses['Ramez'] !== responses['Layan']
        });
      }
    }

    // Sort: disagreements first
    history.sort((a, b) => {
      if (a.disagreed && !b.disagreed) return -1;
      if (!a.disagreed && b.disagreed) return 1;
      return 0;
    });

    res.json(history);
  }
});

// ============ SCOREBOARD ENDPOINT ============
app.get('/api/scoreboard', authenticate, async (req, res) => {
  if (USE_SUPABASE) {
    try {
      const { data: scores, error } = await supabase.from('scoreboard').select('*');
      if (error) throw error;

      const scoreboard = { overall: {}, byGame: { wordle: {}, connections: {} } };

      for (const score of scores) {
        scoreboard.overall[score.player_name] = { wins: score.overall_wins, losses: score.overall_losses, ties: score.overall_ties };
        scoreboard.byGame.wordle[score.player_name] = { wins: score.wordle_wins, losses: score.wordle_losses, ties: score.wordle_ties, avgGuesses: score.wordle_avg_guesses };
        scoreboard.byGame.connections[score.player_name] = { wins: score.connections_wins, losses: score.connections_losses, ties: score.connections_ties, avgMistakes: score.connections_avg_mistakes };
      }

      res.json(scoreboard);
    } catch (error) {
      console.error('Error fetching scoreboard:', error);
      res.status(500).json({ error: 'Failed to fetch scoreboard' });
    }
  } else {
    const data = readData();
    res.json(data.scoreboard);
  }
});

// ============ DOWNLOAD DATA ENDPOINT ============
app.get('/api/download-data', authenticate, async (req, res) => {
  if (USE_SUPABASE) {
    try {
      const [events, statistics, wordleState, wordlePuzzles, wordleResults, connectionsState, connectionsPuzzlesData, connectionsResults, wmlQuestions, wmlResponses, wmlUsed, scoreboard] = await Promise.all([
        supabase.from('events').select('*'),
        supabase.from('statistics').select('*').single(),
        supabase.from('wordle_state').select('*').single(),
        supabase.from('wordle_puzzles').select('*'),
        supabase.from('wordle_results').select('*'),
        supabase.from('connections_state').select('*').single(),
        supabase.from('connections_puzzles').select('*'),
        supabase.from('connections_results').select('*'),
        supabase.from('wml_questions').select('*'),
        supabase.from('wml_responses').select('*'),
        supabase.from('wml_used_questions').select('*'),
        supabase.from('scoreboard').select('*')
      ]);

      const data = {
        events: events.data,
        statistics: statistics.data,
        games: { wordle: { state: wordleState.data, puzzles: wordlePuzzles.data, results: wordleResults.data }, connections: { state: connectionsState.data, puzzles: connectionsPuzzlesData.data, results: connectionsResults.data } },
        whoMoreLikely: { questions: wmlQuestions.data, responses: wmlResponses.data, usedQuestions: wmlUsed.data },
        scoreboard: scoreboard.data
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="data-backup-${new Date().toISOString().split('T')[0]}.json"`);
      res.send(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error downloading data:', error);
      res.status(500).json({ error: 'Failed to download data' });
    }
  } else {
    const data = readData();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="data-backup-${new Date().toISOString().split('T')[0]}.json"`);
    res.send(JSON.stringify(data, null, 2));
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(USE_SUPABASE ? 'Database: Supabase' : 'Database: data.json (file-based)');
});