const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;

// Player credentials
const PLAYERS = {
  ramez: {
    username: 'ramez',
    password: 'ramez123',
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

const DATA_FILE = path.join(__dirname, 'data.json');

function readData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      const parsed = JSON.parse(data);

      // Initialize whoMoreLikely structure if missing
      if (!parsed.whoMoreLikely) {
        parsed.whoMoreLikely = {
          questions: [],
          responses: {}
        };
      }
      if (!parsed.whoMoreLikely.questions) parsed.whoMoreLikely.questions = [];
      if (!parsed.whoMoreLikely.responses) parsed.whoMoreLikely.responses = {};

      return parsed;
    }
  } catch (error) {
    console.error('Error reading data:', error);
  }
  return {
    events: [],
    statistics: {
      relationshipStart: null,
      lastMeeting: null,
      nextMeeting: null
    },
    whoMoreLikely: {
      questions: [],
      responses: {}
    }
  };
}

function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing data:', error);
  }
}

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  const playerName = validateCredentials(username, password);
  if (playerName) {
    res.json({
      success: true,
      message: 'Login successful',
      playerName: playerName
    });
  } else {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
});

// Protected routes
app.get('/api/events', authenticate, (req, res) => {
  const data = readData();
  res.json(data.events);
});

app.post('/api/events', authenticate, (req, res) => {
  const data = readData();
  const newEvent = {
    id: Date.now().toString(),
    title: req.body.title,
    date: req.body.date,
    description: req.body.description || '',
    createdAt: new Date().toISOString()
  };
  data.events.push(newEvent);
  writeData(data);
  res.status(201).json(newEvent);
});

app.delete('/api/events/:id', authenticate, (req, res) => {
  const data = readData();
  data.events = data.events.filter(event => event.id !== req.params.id);
  writeData(data);
  res.status(204).send();
});

app.put('/api/events/:id', authenticate, (req, res) => {
  const data = readData();
  const index = data.events.findIndex(event => event.id === req.params.id);
  if (index !== -1) {
    data.events[index] = {
      ...data.events[index],
      title: req.body.title,
      date: req.body.date,
      description: req.body.description || ''
    };
    writeData(data);
    res.json(data.events[index]);
  } else {
    res.status(404).json({ error: 'Event not found' });
  }
});

app.get('/api/statistics', authenticate, (req, res) => {
  const data = readData();
  if (!data.statistics) {
    data.statistics = {
      relationshipStart: null,
      lastMeeting: null,
      nextMeeting: null
    };
  }
  res.json(data.statistics);
});

app.put('/api/statistics', authenticate, (req, res) => {
  const data = readData();
  data.statistics = {
    relationshipStart: req.body.relationshipStart || null,
    lastMeeting: req.body.lastMeeting || null,
    nextMeeting: req.body.nextMeeting || null
  };
  writeData(data);
  res.json(data.statistics);
});

// ============ GAME ENDPOINTS ============

// Load game content
const wordleWords = require('./gameContent/wordleWords');
const connectionsPuzzles = require('./gameContent/connectionsPuzzles');
const whoMoreLikelyQuestions = require('./gameContent/whoMoreLikelyQuestions');

// Helper functions
function initializeGameData(data) {
  if (!data.games) data.games = {};
  if (!data.games.wordle) data.games.wordle = {};
  if (!data.games.connections) data.games.connections = {};

  // Initialize current puzzle IDs
  if (data.games.wordle.currentPuzzleId === undefined) {
    data.games.wordle.currentPuzzleId = 0;
  }
  if (data.games.connections.currentPuzzleId === undefined) {
    data.games.connections.currentPuzzleId = 0;
  }

  // Initialize puzzles storage
  if (!data.games.wordle.puzzles) {
    data.games.wordle.puzzles = {};
  }
  if (!data.games.connections.puzzles) {
    data.games.connections.puzzles = {};
  }
}

function getWordByPuzzleId(puzzleId) {
  return wordleWords[puzzleId % wordleWords.length];
}

function getPuzzleByPuzzleId(puzzleId) {
  return connectionsPuzzles[puzzleId % connectionsPuzzles.length];
}

function getPlayerName(req) {
  return req.playerName || 'Unknown';
}

function calculateWinner(game, puzzleId, data) {
  const puzzle = data.games[game].puzzles[puzzleId];
  if (!puzzle || !puzzle.results) return;

  const players = Object.keys(puzzle.results);
  if (players.length !== 2) return; // Need both players

  const [p1, p2] = players;
  const r1 = puzzle.results[p1];
  const r2 = puzzle.results[p2];

  if (!r1.completed || !r2.completed) return;

  let winner = null;
  if (game === 'wordle') {
    // If one won and one lost, winner wins
    if (r1.won && !r2.won) winner = p1;
    else if (r2.won && !r1.won) winner = p2;
    // If both won or both lost, fewer guesses wins
    else if (r1.guesses < r2.guesses) winner = p1;
    else if (r2.guesses < r1.guesses) winner = p2;
    else winner = 'tie';
  } else if (game === 'connections') {
    // Fewer mistakes wins (if both completed)
    if (r1.mistakes < r2.mistakes) winner = p1;
    else if (r2.mistakes < r1.mistakes) winner = p2;
    else winner = 'tie';
  }

  puzzle.winner = winner;

  // Update scoreboard
  if (winner && winner !== 'tie') {
    const loser = winner === p1 ? p2 : p1;
    data.scoreboard.overall[winner].wins++;
    data.scoreboard.overall[loser].losses++;
    data.scoreboard.byGame[game][winner].wins++;
    data.scoreboard.byGame[game][loser].losses++;
    // Add ties to scoreboard structure
    if (!data.scoreboard.byGame[game][winner].ties) data.scoreboard.byGame[game][winner].ties = 0;
    if (!data.scoreboard.byGame[game][loser].ties) data.scoreboard.byGame[game][loser].ties = 0;
  } else if (winner === 'tie') {
    data.scoreboard.overall[p1].ties++;
    data.scoreboard.overall[p2].ties++;
    if (!data.scoreboard.byGame[game][p1].ties) data.scoreboard.byGame[game][p1].ties = 0;
    if (!data.scoreboard.byGame[game][p2].ties) data.scoreboard.byGame[game][p2].ties = 0;
    data.scoreboard.byGame[game][p1].ties++;
    data.scoreboard.byGame[game][p2].ties++;
  }

  // If both players completed, advance to next puzzle
  if (r1.completed && r2.completed) {
    data.games[game].currentPuzzleId++;
  }
}

// WORDLE ENDPOINTS
app.get('/api/games/wordle/today', authenticate, (req, res) => {
  const data = readData();
  initializeGameData(data);

  const puzzleId = data.games.wordle.currentPuzzleId;
  const word = getWordByPuzzleId(puzzleId);
  const playerName = getPlayerName(req);

  if (!data.games.wordle.puzzles[puzzleId]) {
    data.games.wordle.puzzles[puzzleId] = {
      word,
      puzzleId,
      results: {}
    };
    writeData(data);
  }

  const puzzle = data.games.wordle.puzzles[puzzleId];
  const myResult = puzzle.results[playerName];
  const otherPlayer = playerName === 'Ramez' ? 'Layan' : 'Ramez';
  const otherResult = puzzle.results[otherPlayer];

  res.json({
    puzzleId,
    word: word,
    validWords: wordleWords,
    myResult: myResult || null,
    opponentResult: otherResult && otherResult.completed ? otherResult : null,
    winner: puzzle.winner || null
  });
});

app.post('/api/games/wordle/submit', authenticate, (req, res) => {
  const data = readData();
  initializeGameData(data);

  const puzzleId = data.games.wordle.currentPuzzleId;
  const playerName = getPlayerName(req);
  const { guesses, won, attempts } = req.body;

  if (!data.games.wordle.puzzles[puzzleId]) {
    return res.status(400).json({ error: 'No active puzzle' });
  }

  data.games.wordle.puzzles[puzzleId].results[playerName] = {
    guesses,
    won,
    attempts,
    completed: true,
    timestamp: new Date().toISOString()
  };

  calculateWinner('wordle', puzzleId, data);
  writeData(data);

  res.json({ success: true });
});

// CONNECTIONS ENDPOINTS
app.get('/api/games/connections/today', authenticate, (req, res) => {
  const data = readData();
  initializeGameData(data);

  const puzzleId = data.games.connections.currentPuzzleId;
  const puzzle = getPuzzleByPuzzleId(puzzleId);
  const playerName = getPlayerName(req);

  if (!data.games.connections.puzzles[puzzleId]) {
    data.games.connections.puzzles[puzzleId] = {
      groups: puzzle.groups,
      puzzleId,
      results: {}
    };
    writeData(data);
  }

  const currentPuzzle = data.games.connections.puzzles[puzzleId];
  const myResult = currentPuzzle.results[playerName];
  const otherPlayer = playerName === 'Ramez' ? 'Layan' : 'Ramez';
  const otherResult = currentPuzzle.results[otherPlayer];

  res.json({
    puzzleId,
    groups: currentPuzzle.groups,
    myResult: myResult || null,
    opponentResult: otherResult && otherResult.completed ? otherResult : null,
    winner: currentPuzzle.winner || null
  });
});

app.post('/api/games/connections/submit', authenticate, (req, res) => {
  const data = readData();
  initializeGameData(data);

  const puzzleId = data.games.connections.currentPuzzleId;
  const playerName = getPlayerName(req);
  const { mistakes, completed } = req.body;

  if (!data.games.connections.puzzles[puzzleId]) {
    return res.status(400).json({ error: 'No active puzzle' });
  }

  data.games.connections.puzzles[puzzleId].results[playerName] = {
    mistakes,
    completed,
    timestamp: new Date().toISOString()
  };

  calculateWinner('connections', puzzleId, data);
  writeData(data);

  res.json({ success: true });
});

// WHO'S MORE LIKELY ENDPOINTS
app.get('/api/who-more-likely/questions', authenticate, (req, res) => {
  const data = readData();

  // Initialize questions if empty
  if (!data.whoMoreLikely.questions || data.whoMoreLikely.questions.length === 0) {
    const allQuestions = [];
    Object.keys(whoMoreLikelyQuestions).forEach(category => {
      whoMoreLikelyQuestions[category].forEach(text => {
        allQuestions.push({
          id: `wml_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          text,
          category,
          createdAt: new Date().toISOString()
        });
      });
    });
    data.whoMoreLikely.questions = allQuestions;
    writeData(data);
  }

  res.json(data.whoMoreLikely.questions);
});

app.get('/api/who-more-likely/next', authenticate, (req, res) => {
  const data = readData();
  const playerName = getPlayerName(req);

  // Initialize questions if empty
  if (!data.whoMoreLikely.questions || data.whoMoreLikely.questions.length === 0) {
    const allQuestions = [];
    Object.keys(whoMoreLikelyQuestions).forEach(category => {
      whoMoreLikelyQuestions[category].forEach(text => {
        allQuestions.push({
          id: `wml_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          text,
          category,
          createdAt: new Date().toISOString()
        });
      });
    });
    data.whoMoreLikely.questions = allQuestions;
    writeData(data);
  }

  // Find a question that this player hasn't answered
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
});

app.post('/api/who-more-likely/answer', authenticate, (req, res) => {
  const data = readData();
  const playerName = getPlayerName(req);
  const { questionId, answer } = req.body;

  if (!data.whoMoreLikely.responses[questionId]) {
    data.whoMoreLikely.responses[questionId] = {};
  }

  data.whoMoreLikely.responses[questionId][playerName] = answer;
  writeData(data);

  res.json({ success: true });
});

// Get history of answered questions with responses
app.get('/api/who-more-likely/history', authenticate, (req, res) => {
  const data = readData();
  const history = [];

  // Get all questions that have been answered by both players
  data.whoMoreLikely.questions.forEach(question => {
    const responses = data.whoMoreLikely.responses[question.id];
    if (responses && responses['Ramez'] && responses['Layan']) {
      history.push({
        question,
        responses: {
          Ramez: responses['Ramez'],
          Layan: responses['Layan']
        },
        disagreed: responses['Ramez'] !== responses['Layan']
      });
    }
  });

  res.json(history);
});

// SCOREBOARD ENDPOINT
app.get('/api/scoreboard', authenticate, (req, res) => {
  const data = readData();
  res.json(data.scoreboard);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
