#!/usr/bin/env node

/**
 * Migration script to import data.json into MongoDB
 * Usage: node migrate.js [path-to-data.json]
 */

const fs = require('fs');
const path = require('path');
const { readData, writeData, closeDatabase } = require('./database');

async function migrate() {
  try {
    // Get data.json path from command line argument or use default
    const dataFilePath = process.argv[2] || path.join(__dirname, 'data.json');

    console.log(`[${new Date().toISOString()}] Migration starting...`);
    console.log(`[${new Date().toISOString()}] Reading from: ${dataFilePath}`);

    // Check if data.json exists
    if (!fs.existsSync(dataFilePath)) {
      console.log(`[${new Date().toISOString()}] ⚠️  No data.json found at ${dataFilePath}`);
      console.log(`[${new Date().toISOString()}] Initializing MongoDB with default data...`);

      // This will create default data in MongoDB
      await readData();

      console.log(`[${new Date().toISOString()}] ✅ MongoDB initialized with default data`);
      await closeDatabase();
      process.exit(0);
    }

    // Read existing data.json
    const fileData = fs.readFileSync(dataFilePath, 'utf8');
    const jsonData = JSON.parse(fileData);

    console.log(`[${new Date().toISOString()}] Data loaded from ${dataFilePath}`);
    console.log(`[${new Date().toISOString()}] Events: ${jsonData.events?.length || 0}`);
    console.log(`[${new Date().toISOString()}] Wordle puzzles: ${Object.keys(jsonData.games?.wordle?.puzzles || {}).length}`);
    console.log(`[${new Date().toISOString()}] Connections puzzles: ${Object.keys(jsonData.games?.connections?.puzzles || {}).length}`);
    console.log(`[${new Date().toISOString()}] Who's More Likely questions: ${jsonData.whoMoreLikely?.questions?.length || 0}`);

    // Check if MongoDB already has data
    const existingData = await readData();
    const hasExistingData = existingData.events?.length > 0 ||
                           Object.keys(existingData.games?.wordle?.puzzles || {}).length > 0 ||
                           Object.keys(existingData.games?.connections?.puzzles || {}).length > 0;

    if (hasExistingData) {
      console.log(`[${new Date().toISOString()}] ⚠️  MongoDB already contains data!`);
      console.log(`[${new Date().toISOString()}] Existing events: ${existingData.events?.length || 0}`);
      console.log(`[${new Date().toISOString()}] Do you want to overwrite? (Ctrl+C to cancel, wait 5 seconds to proceed)`);

      await new Promise(resolve => setTimeout(resolve, 5000));
      console.log(`[${new Date().toISOString()}] Proceeding with migration...`);
    }

    // Ensure data has required structure
    const migratedData = {
      _id: 'app-state',
      events: jsonData.events || [],
      statistics: jsonData.statistics || {
        relationshipStart: null,
        lastMeeting: null,
        nextMeeting: null,
      },
      playerNames: jsonData.playerNames || ['Ramez', 'Layan'],
      games: {
        wordle: {
          currentPuzzleId: jsonData.games?.wordle?.currentPuzzleId || 0,
          puzzles: jsonData.games?.wordle?.puzzles || {},
        },
        connections: {
          currentPuzzleId: jsonData.games?.connections?.currentPuzzleId || 0,
          puzzles: jsonData.games?.connections?.puzzles || {},
        },
      },
      whoMoreLikely: {
        currentQuestionIndex: jsonData.whoMoreLikely?.currentQuestionIndex || 0,
        questions: jsonData.whoMoreLikely?.questions || [],
        responses: jsonData.whoMoreLikely?.responses || {},
      },
      scoreboard: jsonData.scoreboard || {
        overall: {
          Ramez: { wins: 0, losses: 0, ties: 0 },
          Layan: { wins: 0, losses: 0, ties: 0 },
        },
        byGame: {
          wordle: {
            Ramez: { wins: 0, losses: 0, ties: 0 },
            Layan: { wins: 0, losses: 0, ties: 0 },
          },
          connections: {
            Ramez: { wins: 0, losses: 0, ties: 0 },
            Layan: { wins: 0, losses: 0, ties: 0 },
          },
        },
      },
    };

    // Write to MongoDB
    await writeData(migratedData);

    console.log(`[${new Date().toISOString()}] ✅ Migration completed successfully!`);
    console.log(`[${new Date().toISOString()}] Data has been imported to MongoDB`);

    // Create a backup of the original file
    const backupPath = `${dataFilePath}.backup-${Date.now()}`;
    fs.copyFileSync(dataFilePath, backupPath);
    console.log(`[${new Date().toISOString()}] 📦 Backup created: ${backupPath}`);

    await closeDatabase();
    process.exit(0);

  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ Migration failed:`, error);
    process.exit(1);
  }
}

migrate();
