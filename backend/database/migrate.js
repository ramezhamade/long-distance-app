// Migration script to transfer data from data.json to Supabase
// Run this once after setting up your Supabase project

require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY environment variables');
  console.error('Make sure you have a .env file with your Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
  console.log('Starting migration...\n');

  // Read existing data.json
  const dataPath = path.join(__dirname, '../data.json');

  if (!fs.existsSync(dataPath)) {
    console.log('No data.json found. Starting fresh.');
    return;
  }

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  console.log('Loaded data.json\n');

  // Migrate events
  if (data.events && data.events.length > 0) {
    console.log(`Migrating ${data.events.length} events...`);
    const events = data.events.map(e => ({
      id: e.id,
      title: e.title,
      date: e.date,
      description: e.description || '',
      created_at: e.createdAt || new Date().toISOString()
    }));

    const { error } = await supabase.from('events').upsert(events);
    if (error) {
      console.error('Error migrating events:', error);
    } else {
      console.log('Events migrated successfully!\n');
    }
  }

  // Migrate statistics
  if (data.statistics) {
    console.log('Migrating statistics...');
    const { error } = await supabase.from('statistics').upsert({
      id: 1,
      relationship_start: data.statistics.relationshipStart,
      last_meeting: data.statistics.lastMeeting,
      next_meeting: data.statistics.nextMeeting
    });
    if (error) {
      console.error('Error migrating statistics:', error);
    } else {
      console.log('Statistics migrated successfully!\n');
    }
  }

  // Migrate wordle state
  if (data.games?.wordle) {
    console.log('Migrating Wordle state...');
    const { error } = await supabase.from('wordle_state').upsert({
      id: 1,
      current_puzzle_id: data.games.wordle.currentPuzzleId || 0,
      used_word_indices: data.games.wordle.usedWordIndices || []
    });
    if (error) {
      console.error('Error migrating wordle state:', error);
    } else {
      console.log('Wordle state migrated successfully!\n');
    }

    // Migrate wordle puzzles
    if (data.games.wordle.puzzles) {
      const puzzles = Object.values(data.games.wordle.puzzles);
      if (puzzles.length > 0) {
        console.log(`Migrating ${puzzles.length} Wordle puzzles...`);
        for (const puzzle of puzzles) {
          const { error: puzzleError } = await supabase.from('wordle_puzzles').upsert({
            puzzle_id: puzzle.puzzleId,
            word: puzzle.word,
            word_index: puzzle.wordIndex || 0,
            winner: puzzle.winner
          });
          if (puzzleError) {
            console.error('Error migrating wordle puzzle:', puzzleError);
          }

          // Migrate results
          if (puzzle.results) {
            for (const [playerName, result] of Object.entries(puzzle.results)) {
              const { error: resultError } = await supabase.from('wordle_results').upsert({
                puzzle_id: puzzle.puzzleId,
                player_name: playerName,
                guesses: result.guesses,
                won: result.won,
                attempts: result.attempts,
                completed: result.completed,
                timestamp: result.timestamp
              });
              if (resultError) {
                console.error('Error migrating wordle result:', resultError);
              }
            }
          }
        }
        console.log('Wordle puzzles migrated successfully!\n');
      }
    }
  }

  // Migrate connections state
  if (data.games?.connections) {
    console.log('Migrating Connections state...');
    const { error } = await supabase.from('connections_state').upsert({
      id: 1,
      current_puzzle_id: data.games.connections.currentPuzzleId || 0,
      used_puzzle_indices: data.games.connections.usedPuzzleIndices || []
    });
    if (error) {
      console.error('Error migrating connections state:', error);
    } else {
      console.log('Connections state migrated successfully!\n');
    }

    // Migrate connections puzzles
    if (data.games.connections.puzzles) {
      const puzzles = Object.values(data.games.connections.puzzles);
      if (puzzles.length > 0) {
        console.log(`Migrating ${puzzles.length} Connections puzzles...`);
        for (const puzzle of puzzles) {
          const { error: puzzleError } = await supabase.from('connections_puzzles').upsert({
            puzzle_id: puzzle.puzzleId,
            groups: puzzle.groups,
            shuffled_groups: puzzle.shuffledGroups || puzzle.groups,
            puzzle_index: puzzle.puzzleIndex || 0,
            winner: puzzle.winner
          });
          if (puzzleError) {
            console.error('Error migrating connections puzzle:', puzzleError);
          }

          // Migrate results
          if (puzzle.results) {
            for (const [playerName, result] of Object.entries(puzzle.results)) {
              const { error: resultError } = await supabase.from('connections_results').upsert({
                puzzle_id: puzzle.puzzleId,
                player_name: playerName,
                mistakes: result.mistakes,
                completed: result.completed,
                timestamp: result.timestamp
              });
              if (resultError) {
                console.error('Error migrating connections result:', resultError);
              }
            }
          }
        }
        console.log('Connections puzzles migrated successfully!\n');
      }
    }
  }

  // Migrate Who's More Likely questions
  if (data.whoMoreLikely?.questions && data.whoMoreLikely.questions.length > 0) {
    console.log(`Migrating ${data.whoMoreLikely.questions.length} Who's More Likely questions...`);
    const questions = data.whoMoreLikely.questions.map(q => ({
      id: q.id,
      text: q.text,
      category: q.category,
      created_at: q.createdAt || new Date().toISOString()
    }));

    const { error } = await supabase.from('wml_questions').upsert(questions);
    if (error) {
      console.error('Error migrating WML questions:', error);
    } else {
      console.log('WML questions migrated successfully!\n');
    }

    // Migrate responses
    if (data.whoMoreLikely.responses) {
      console.log('Migrating WML responses...');
      for (const [questionId, responses] of Object.entries(data.whoMoreLikely.responses)) {
        for (const [playerName, answer] of Object.entries(responses)) {
          const { error: respError } = await supabase.from('wml_responses').upsert({
            question_id: questionId,
            player_name: playerName,
            answer: answer,
            timestamp: new Date().toISOString()
          });
          if (respError) {
            console.error('Error migrating WML response:', respError);
          }
        }
      }
      console.log('WML responses migrated successfully!\n');
    }

    // Migrate used question IDs
    if (data.whoMoreLikely.usedQuestionIds && data.whoMoreLikely.usedQuestionIds.length > 0) {
      console.log('Migrating used WML question IDs...');
      for (const questionId of data.whoMoreLikely.usedQuestionIds) {
        const { error } = await supabase.from('wml_used_questions').upsert({
          question_id: questionId,
          used_at: new Date().toISOString()
        });
        if (error) {
          console.error('Error migrating used question ID:', error);
        }
      }
      console.log('Used question IDs migrated successfully!\n');
    }
  }

  // Migrate scoreboard
  if (data.scoreboard) {
    console.log('Migrating scoreboard...');
    for (const playerName of ['Ramez', 'Layan']) {
      const overall = data.scoreboard.overall?.[playerName] || { wins: 0, losses: 0, ties: 0 };
      const wordle = data.scoreboard.byGame?.wordle?.[playerName] || { wins: 0, losses: 0, ties: 0, avgGuesses: 0 };
      const connections = data.scoreboard.byGame?.connections?.[playerName] || { wins: 0, losses: 0, ties: 0, avgMistakes: 0 };

      const { error } = await supabase.from('scoreboard').upsert({
        player_name: playerName,
        overall_wins: overall.wins,
        overall_losses: overall.losses,
        overall_ties: overall.ties,
        wordle_wins: wordle.wins,
        wordle_losses: wordle.losses,
        wordle_ties: wordle.ties || 0,
        wordle_avg_guesses: wordle.avgGuesses || 0,
        connections_wins: connections.wins,
        connections_losses: connections.losses,
        connections_ties: connections.ties || 0,
        connections_avg_mistakes: connections.avgMistakes || 0
      });
      if (error) {
        console.error(`Error migrating scoreboard for ${playerName}:`, error);
      }
    }
    console.log('Scoreboard migrated successfully!\n');
  }

  console.log('Migration complete!');
  console.log('\nYou can now rename data.json to data.json.backup to keep it as a backup.');
}

migrate().catch(console.error);