const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// MongoDB connection
let client;
let db;
let dataCollection;
let useFileStorage = false;

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'lamez-hub';
const COLLECTION_NAME = 'app-data';

// File-based fallback
const DATA_FILE = path.join(__dirname, 'data.json');

// Initialize MongoDB connection
async function initDatabase() {
  // If MONGODB_URI is not set, use file-based storage
  if (!MONGODB_URI) {
    if (!useFileStorage) {
      console.log(`[${new Date().toISOString()}] No MONGODB_URI set, using file-based storage`);
      console.log(`[${new Date().toISOString()}] Set MONGODB_URI environment variable to use MongoDB`);
      useFileStorage = true;
    }
    return true;
  }

  try {
    if (!client) {
      console.log(`[${new Date().toISOString()}] Connecting to MongoDB...`);
      client = new MongoClient(MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      });
      await client.connect();
      db = client.db(DB_NAME);
      dataCollection = db.collection(COLLECTION_NAME);
      console.log(`[${new Date().toISOString()}] Connected to MongoDB successfully`);
      useFileStorage = false;
    }
    return true;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] MongoDB connection error:`, error.message);
    console.log(`[${new Date().toISOString()}] Falling back to file-based storage`);
    useFileStorage = true;
    return true;
  }
}

// Get default data structure
function getDefaultData() {
  return {
    _id: 'app-state',
    events: [],
    statistics: {
      daysApart: 0,
      daysTogether: 0,
      totalDays: 0,
      percentageTogether: 0,
      currentStreak: 0,
      longestStreak: 0,
    },
    playerNames: ['Ramez', 'Layan'],
    games: {
      wordle: {
        currentPuzzleId: 0,
        dailyPuzzles: {},
      },
      connections: {
        currentPuzzleId: 0,
        dailyPuzzles: {},
      },
    },
    whoMoreLikely: {
      currentQuestionIndex: 0,
      responses: {},
    },
    scoreboard: {
      overall: {
        Ramez: { wins: 0, losses: 0, ties: 0 },
        Layan: { wins: 0, losses: 0, ties: 0 },
      },
    },
  };
}

// Read data from MongoDB or file
async function readData() {
  await initDatabase();

  // Use file-based storage if MongoDB is not available
  if (useFileStorage) {
    return readDataFromFile();
  }

  try {
    let data = await dataCollection.findOne({ _id: 'app-state' });

    if (!data) {
      console.log(`[${new Date().toISOString()}] No data found, creating default data`);
      data = getDefaultData();
      await dataCollection.insertOne(data);
      console.log(`[${new Date().toISOString()}] Default data created in MongoDB`);
    } else {
      console.log(`[${new Date().toISOString()}] Data loaded from MongoDB`);
    }

    // Ensure all required structures exist
    ensureDataStructure(data);

    return data;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error reading from MongoDB:`, error);
    throw error;
  }
}

// Helper to ensure data structure is complete
function ensureDataStructure(data) {
  if (!data.whoMoreLikely) {
    data.whoMoreLikely = { currentQuestionIndex: 0, responses: {}, questions: [] };
  }
  if (!data.whoMoreLikely.responses) {
    data.whoMoreLikely.responses = {};
  }
  if (!data.whoMoreLikely.questions) {
    data.whoMoreLikely.questions = [];
  }
  if (!data.games) {
    data.games = {
      wordle: { currentPuzzleId: 0, puzzles: {} },
      connections: { currentPuzzleId: 0, puzzles: {} },
    };
  }
  if (!data.scoreboard) {
    data.scoreboard = {
      overall: {
        Ramez: { wins: 0, losses: 0, ties: 0 },
        Layan: { wins: 0, losses: 0, ties: 0 },
      },
    };
  }
  return data;
}

// Read data from file (fallback)
function readDataFromFile() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const fileData = fs.readFileSync(DATA_FILE, 'utf8');
      const data = JSON.parse(fileData);
      console.log(`[${new Date().toISOString()}] Data loaded from file`);
      ensureDataStructure(data);
      return data;
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error reading file:`, error);
  }

  // Return default data
  console.log(`[${new Date().toISOString()}] Creating new data file`);
  const data = getDefaultData();
  writeDataToFile(data);
  return data;
}

// Write data to MongoDB or file
async function writeData(data) {
  await initDatabase();

  // Use file-based storage if MongoDB is not available
  if (useFileStorage) {
    return writeDataToFile(data);
  }

  try {
    // Ensure _id is set
    if (!data._id) {
      data._id = 'app-state';
    }

    await dataCollection.replaceOne(
      { _id: 'app-state' },
      data,
      { upsert: true }
    );

    console.log(`[${new Date().toISOString()}] Data saved to MongoDB`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error writing to MongoDB:`, error);
    throw error;
  }
}

// Write data to file (fallback)
function writeDataToFile(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    console.log(`[${new Date().toISOString()}] Data saved to file`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error writing file:`, error);
    throw error;
  }
}

// Graceful shutdown
async function closeDatabase() {
  if (client) {
    await client.close();
    console.log(`[${new Date().toISOString()}] MongoDB connection closed`);
  }
}

module.exports = {
  initDatabase,
  readData,
  writeData,
  closeDatabase,
};
