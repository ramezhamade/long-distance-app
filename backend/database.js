const { MongoClient } = require('mongodb');

// MongoDB connection
let client;
let db;
let dataCollection;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'lamez-hub';
const COLLECTION_NAME = 'app-data';

// Initialize MongoDB connection
async function initDatabase() {
  try {
    if (!client) {
      console.log(`[${new Date().toISOString()}] Connecting to MongoDB...`);
      client = new MongoClient(MONGODB_URI);
      await client.connect();
      db = client.db(DB_NAME);
      dataCollection = db.collection(COLLECTION_NAME);
      console.log(`[${new Date().toISOString()}] Connected to MongoDB successfully`);
    }
    return true;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] MongoDB connection error:`, error);
    throw error;
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

// Read data from MongoDB
async function readData() {
  try {
    await initDatabase();

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
    if (!data.whoMoreLikely) {
      data.whoMoreLikely = { currentQuestionIndex: 0, responses: {} };
    }
    if (!data.whoMoreLikely.responses) {
      data.whoMoreLikely.responses = {};
    }
    if (!data.games) {
      data.games = {
        wordle: { currentPuzzleId: 0, dailyPuzzles: {} },
        connections: { currentPuzzleId: 0, dailyPuzzles: {} },
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
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error reading from MongoDB:`, error);
    throw error;
  }
}

// Write data to MongoDB
async function writeData(data) {
  try {
    await initDatabase();

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
