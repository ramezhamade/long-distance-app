const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;

// Simple authentication - Change these credentials!
const AUTH_USERNAME = 'kingramez';
const AUTH_PASSWORD = 'takemewheneveryouneed';

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
