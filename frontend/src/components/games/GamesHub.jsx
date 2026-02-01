import { useState } from 'react';
import WordleGame from './WordleGame';
import ConnectionsGame from './ConnectionsGame';

function GamesHub({ getAuthHeaders }) {
  const [selectedGame, setSelectedGame] = useState(null);

  if (selectedGame === 'wordle') {
    return (
      <div className="games-hub">
        <button className="back-button" onClick={() => setSelectedGame(null)}>
          ← Back to Games
        </button>
        <WordleGame getAuthHeaders={getAuthHeaders} />
      </div>
    );
  }

  if (selectedGame === 'connections') {
    return (
      <div className="games-hub">
        <button className="back-button" onClick={() => setSelectedGame(null)}>
          ← Back to Games
        </button>
        <ConnectionsGame getAuthHeaders={getAuthHeaders} />
      </div>
    );
  }

  return (
    <div className="games-hub">
      <h2>Games</h2>
      <p className="games-subtitle">No mercy</p>

      <div className="game-cards">
        <div className="game-card" onClick={() => setSelectedGame('wordle')}>
          <div className="game-icon">🟩</div>
          <h3>Wordle</h3>
          <p>Guess the 5-letter word in 6 tries. Fewest guesses wins!</p>
        </div>

        <div className="game-card" onClick={() => setSelectedGame('connections')}>
          <div className="game-icon">🔗</div>
          <h3>Connections</h3>
          <p>Find 4 groups of 4 related words. Fewest mistakes wins!</p>
        </div>
      </div>
    </div>
  );
}

export default GamesHub;
