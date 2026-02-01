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

// Data file location
const DATA_FILE = path.join(__dirname, 'data.json');

// File-based data storage functions
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

  // Return default data
  const defaultData = {
    events: [],
    statistics: {
      relationshipStart: null,
      lastMeeting: null,
      nextMeeting: null
    },
    whoMoreLikely: {
      questions: [],
      responses: {}
    },
    games: {
      wordle: {
        currentPuzzleId: 0,
        puzzles: {}
      },
      connections: {
        currentPuzzleId: 0,
        puzzles: {}
      }
    },
    scoreboard: {
      overall: {
        Ramez: { wins: 0, losses: 0, ties: 0 },
        Layan: { wins: 0, losses: 0, ties: 0 }
      },
      byGame: {
        wordle: {
          Ramez: { wins: 0, losses: 0, ties: 0 },
          Layan: { wins: 0, losses: 0, ties: 0 }
        },
        connections: {
          Ramez: { wins: 0, losses: 0, ties: 0 },
          Layan: { wins: 0, losses: 0, ties: 0 }
        }
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

// Helper function to shuffle an array (Fisher-Yates algorithm)
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

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

  // Initialize used indices tracking
  if (!data.games.wordle.usedWordIndices) {
    data.games.wordle.usedWordIndices = [];
  }
  if (!data.games.connections.usedPuzzleIndices) {
    data.games.connections.usedPuzzleIndices = [];
  }

  // Initialize whoMoreLikely tracking
  if (!data.whoMoreLikely) {
    data.whoMoreLikely = { questions: [], responses: {}, usedQuestionIds: [] };
  }
  if (!data.whoMoreLikely.usedQuestionIds) {
    data.whoMoreLikely.usedQuestionIds = [];
  }
}

// Get a random unused word for Wordle
function getRandomUnusedWord(data) {
  const usedIndices = data.games.wordle.usedWordIndices || [];
  const availableIndices = [];

  for (let i = 0; i < wordleWords.length; i++) {
    if (!usedIndices.includes(i)) {
      availableIndices.push(i);
    }
  }

  if (availableIndices.length === 0) {
    return null; // All words used
  }

  // Pick a random index from available
  const randomIdx = availableIndices[Math.floor(Math.random() * availableIndices.length)];
  return { word: wordleWords[randomIdx], index: randomIdx };
}

// Get a random unused puzzle for Connections
function getRandomUnusedPuzzle(data) {
  const usedIndices = data.games.connections.usedPuzzleIndices || [];
  const availableIndices = [];

  for (let i = 0; i < connectionsPuzzles.length; i++) {
    if (!usedIndices.includes(i)) {
      availableIndices.push(i);
    }
  }

  if (availableIndices.length === 0) {
    return null; // All puzzles used
  }

  // Pick a random index from available
  const randomIdx = availableIndices[Math.floor(Math.random() * availableIndices.length)];
  return { puzzle: connectionsPuzzles[randomIdx], index: randomIdx };
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

  // Check if both players have finished (submitted results)
  // For Wordle: completed is set when game ends (win or lose all attempts)
  // For Connections: completed is set when succeeded or failed (4 mistakes)
  const bothFinished = (r1.timestamp && r2.timestamp);
  if (!bothFinished) return;

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
    // If one completed successfully and one failed, successful player wins
    if (r1.completed && !r2.completed) winner = p1;
    else if (r2.completed && !r1.completed) winner = p2;
    // If both completed or both failed, fewer mistakes wins
    else if (r1.mistakes < r2.mistakes) winner = p1;
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

  // If both players finished, advance to next puzzle
  data.games[game].currentPuzzleId++;
}

// WORDLE ENDPOINTS
app.get('/api/games/wordle/today', authenticate, (req, res) => {
  const data = readData();
  initializeGameData(data);

  const puzzleId = data.games.wordle.currentPuzzleId;
  const playerName = getPlayerName(req);

  // Check if current puzzle already exists
  if (data.games.wordle.puzzles[puzzleId]) {
    const puzzle = data.games.wordle.puzzles[puzzleId];
    const myResult = puzzle.results[playerName];
    const otherPlayer = playerName === 'Ramez' ? 'Layan' : 'Ramez';
    const otherResult = puzzle.results[otherPlayer];

    return res.json({
      puzzleId,
      word: puzzle.word,
      validWords: wordleWords,
      myResult: myResult || null,
      opponentResult: otherResult && otherResult.timestamp ? otherResult : null,
      winner: puzzle.winner || null
    });
  }

  // Need to create a new puzzle - get a random unused word
  const wordResult = getRandomUnusedWord(data);

  if (!wordResult) {
    return res.status(400).json({
      error: 'No more unique puzzles available',
      message: `You've completed all ${wordleWords.length} Wordle puzzles! 🎉`
    });
  }

  // Create the new puzzle with the random word
  data.games.wordle.puzzles[puzzleId] = {
    word: wordResult.word,
    wordIndex: wordResult.index,
    puzzleId,
    results: {}
  };
  // Mark this word index as used
  data.games.wordle.usedWordIndices.push(wordResult.index);
  writeData(data);

  res.json({
    puzzleId,
    word: wordResult.word,
    validWords: wordleWords,
    myResult: null,
    opponentResult: null,
    winner: null
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
  const playerName = getPlayerName(req);

  // Check if current puzzle already exists
  if (data.games.connections.puzzles[puzzleId]) {
    const currentPuzzle = data.games.connections.puzzles[puzzleId];
    const myResult = currentPuzzle.results[playerName];
    const otherPlayer = playerName === 'Ramez' ? 'Layan' : 'Ramez';
    const otherResult = currentPuzzle.results[otherPlayer];

    // Shuffle the words within each group for display
    const shuffledGroups = currentPuzzle.groups.map(group => ({
      ...group,
      words: shuffleArray(group.words)
    }));

    return res.json({
      puzzleId,
      groups: shuffledGroups,
      myResult: myResult || null,
      opponentResult: otherResult && otherResult.timestamp ? otherResult : null,
      winner: currentPuzzle.winner || null
    });
  }

  // Need to create a new puzzle - get a random unused puzzle
  const puzzleResult = getRandomUnusedPuzzle(data);

  if (!puzzleResult) {
    return res.status(400).json({
      error: 'No more unique puzzles available',
      message: `You've completed all ${connectionsPuzzles.length} Connections puzzles! 🎉`
    });
  }

  // Shuffle the groups order and words within each group
  const shuffledGroups = shuffleArray(puzzleResult.puzzle.groups).map(group => ({
    ...group,
    words: shuffleArray(group.words)
  }));

  // Create the new puzzle with the random selection
  data.games.connections.puzzles[puzzleId] = {
    groups: puzzleResult.puzzle.groups, // Store original for validation
    shuffledGroups: shuffledGroups,
    puzzleIndex: puzzleResult.index,
    puzzleId,
    results: {}
  };
  // Mark this puzzle index as used
  data.games.connections.usedPuzzleIndices.push(puzzleResult.index);
  writeData(data);

  res.json({
    puzzleId,
    groups: shuffledGroups,
    myResult: null,
    opponentResult: null,
    winner: null
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

// Helper function to shuffle questions by alternating categories (shuffled within each category)
function shuffleQuestionsByCategory(questionsObj) {
  // Group questions by category and shuffle within each category
  const categorizedQuestions = {};
  const categories = Object.keys(questionsObj);

  categories.forEach(category => {
    // Shuffle questions within the category
    const shuffledCategoryQuestions = shuffleArray(questionsObj[category]);
    categorizedQuestions[category] = shuffledCategoryQuestions.map(text => ({
      id: `wml_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      text,
      category,
      createdAt: new Date().toISOString()
    }));
  });

  // Shuffle the order of categories themselves
  const shuffledCategories = shuffleArray(categories);

  // Interleave questions from different categories (now shuffled)
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

// WHO'S MORE LIKELY ENDPOINTS
app.get('/api/who-more-likely/questions', authenticate, (req, res) => {
  const data = readData();

  // Initialize questions if empty
  if (!data.whoMoreLikely.questions || data.whoMoreLikely.questions.length === 0) {
    data.whoMoreLikely.questions = shuffleQuestionsByCategory(whoMoreLikelyQuestions);
    writeData(data);
  }

  res.json(data.whoMoreLikely.questions);
});

app.get('/api/who-more-likely/next', authenticate, (req, res) => {
  const data = readData();
  const playerName = getPlayerName(req);

  // Initialize questions if empty
  if (!data.whoMoreLikely.questions || data.whoMoreLikely.questions.length === 0) {
    data.whoMoreLikely.questions = shuffleQuestionsByCategory(whoMoreLikelyQuestions);
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

  // Check if both players have answered - if so, mark as used
  const responses = data.whoMoreLikely.responses[questionId];
  const otherPlayer = playerName === 'Ramez' ? 'Layan' : 'Ramez';
  if (responses[playerName] && responses[otherPlayer]) {
    // Both answered - mark question as used and remove from active list
    if (!data.whoMoreLikely.usedQuestionIds) {
      data.whoMoreLikely.usedQuestionIds = [];
    }
    if (!data.whoMoreLikely.usedQuestionIds.includes(questionId)) {
      data.whoMoreLikely.usedQuestionIds.push(questionId);
    }
    // Remove from active questions list
    data.whoMoreLikely.questions = data.whoMoreLikely.questions.filter(q => q.id !== questionId);
  }

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

// DOWNLOAD DATA ENDPOINT
app.get('/api/download-data', authenticate, (req, res) => {
  const data = readData();

  // Set headers to trigger download
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="data-backup-${new Date().toISOString().split('T')[0]}.json"`);

  // Send the data as a formatted JSON file
  res.send(JSON.stringify(data, null, 2));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Data file: ${DATA_FILE}`);
});
