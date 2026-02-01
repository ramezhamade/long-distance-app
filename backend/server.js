const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;

// Simple authentication - Change these credentials!
const AUTH_USERNAME = 'kingramez';
const AUTH_PASSWORD = 'Layan';

app.use(cors());
app.use(bodyParser.json());

// Simple authentication middleware
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');

  if (username === AUTH_USERNAME && password === AUTH_PASSWORD) {
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
      return JSON.parse(data);
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

  if (username === AUTH_USERNAME && password === AUTH_PASSWORD) {
    res.json({ success: true, message: 'Login successful' });
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
function getTodayDate() {
  const today = new Date();
  return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
}

function getDailyWord(date) {
  const [year, month, day] = date.split('-').map(Number);
  const seed = year * 10000 + month * 100 + day;
  return wordleWords[seed % wordleWords.length];
}

function getDailyPuzzle(date) {
  const [year, month, day] = date.split('-').map(Number);
  const seed = year * 10000 + month * 100 + day;
  return connectionsPuzzles[seed % connectionsPuzzles.length];
}

function getPlayerName(req) {
  return req.headers['x-player-name'] || 'Unknown';
}

function calculateWinner(game, dateKey, data) {
  const puzzle = data.games[game].dailyPuzzles[dateKey];
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
  } else if (winner === 'tie') {
    data.scoreboard.overall[p1].ties++;
    data.scoreboard.overall[p2].ties++;
  }
}

// WORDLE ENDPOINTS
app.get('/api/games/wordle/today', authenticate, (req, res) => {
  const data = readData();
  const dateKey = getTodayDate();
  const word = getDailyWord(dateKey);
  const playerName = getPlayerName(req);

  if (!data.games.wordle.dailyPuzzles[dateKey]) {
    data.games.wordle.dailyPuzzles[dateKey] = {
      word,
      date: dateKey,
      results: {}
    };
    writeData(data);
  }

  const puzzle = data.games.wordle.dailyPuzzles[dateKey];
  const myResult = puzzle.results[playerName];
  const otherPlayer = playerName === 'Ramez' ? 'Layan' : 'Ramez';
  const otherResult = puzzle.results[otherPlayer];

  res.json({
    date: dateKey,
    word: word, // Send the word so frontend can validate
    validWords: wordleWords, // Send valid words list for validation
    myResult: myResult || null,
    opponentResult: otherResult && otherResult.completed ? otherResult : null,
    winner: puzzle.winner || null
  });
});

app.post('/api/games/wordle/submit', authenticate, (req, res) => {
  const data = readData();
  const dateKey = getTodayDate();
  const playerName = getPlayerName(req);
  const { guesses, won, attempts } = req.body;

  if (!data.games.wordle.dailyPuzzles[dateKey]) {
    return res.status(400).json({ error: 'No puzzle for today' });
  }

  data.games.wordle.dailyPuzzles[dateKey].results[playerName] = {
    guesses,
    won,
    attempts,
    completed: true,
    timestamp: new Date().toISOString()
  };

  calculateWinner('wordle', dateKey, data);
  writeData(data);

  res.json({ success: true });
});

// CONNECTIONS ENDPOINTS
app.get('/api/games/connections/today', authenticate, (req, res) => {
  const data = readData();
  const dateKey = getTodayDate();
  const puzzle = getDailyPuzzle(dateKey);
  const playerName = getPlayerName(req);

  if (!data.games.connections.dailyPuzzles[dateKey]) {
    data.games.connections.dailyPuzzles[dateKey] = {
      groups: puzzle.groups,
      date: dateKey,
      results: {}
    };
    writeData(data);
  }

  const dailyPuzzle = data.games.connections.dailyPuzzles[dateKey];
  const myResult = dailyPuzzle.results[playerName];
  const otherPlayer = playerName === 'Ramez' ? 'Layan' : 'Ramez';
  const otherResult = dailyPuzzle.results[otherPlayer];

  res.json({
    date: dateKey,
    groups: dailyPuzzle.groups,
    myResult: myResult || null,
    opponentResult: otherResult && otherResult.completed ? otherResult : null,
    winner: dailyPuzzle.winner || null
  });
});

app.post('/api/games/connections/submit', authenticate, (req, res) => {
  const data = readData();
  const dateKey = getTodayDate();
  const playerName = getPlayerName(req);
  const { mistakes, completed } = req.body;

  if (!data.games.connections.dailyPuzzles[dateKey]) {
    return res.status(400).json({ error: 'No puzzle for today' });
  }

  data.games.connections.dailyPuzzles[dateKey].results[playerName] = {
    mistakes,
    completed,
    timestamp: new Date().toISOString()
  };

  calculateWinner('connections', dateKey, data);
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
