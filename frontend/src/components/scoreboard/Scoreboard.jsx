import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

function Scoreboard({ getAuthHeaders }) {
  const [loading, setLoading] = useState(true);
  const [scoreboard, setScoreboard] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchScoreboard();
  }, []);

  const fetchScoreboard = async () => {
    try {
      console.log('Fetching scoreboard from:', `${API_URL}/scoreboard`);
      const response = await axios.get(`${API_URL}/scoreboard`, {
        headers: getAuthHeaders(),
      });
      console.log('Scoreboard data:', response.data);
      setScoreboard(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching scoreboard:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="game-loading">Loading stats...</div>;
  }

  if (error || !scoreboard) {
    return (
      <div className="game-error">
        <p>Error loading scoreboard</p>
        <button onClick={fetchScoreboard} className="retry-btn">Retry</button>
        {error && <p style={{fontSize: '0.8rem', marginTop: '1rem'}}>Error: {error}</p>}
      </div>
    );
  }

  const { overall, byGame } = scoreboard;

  return (
    <div className="scoreboard">
      <h2>📊 Scoreboard</h2>

      <div className="overall-stats">
        <h3>Overall Stats</h3>
        <div className="player-stats-grid">
          {Object.entries(overall).map(([player, stats]) => (
            <div key={player} className="player-stat-card">
              <h4>{player}</h4>
              <div className="stats-row">
                <div className="stat">
                  <span className="stat-value wins">{stats.wins}</span>
                  <span className="stat-label">Wins</span>
                </div>
                <div className="stat">
                  <span className="stat-value losses">{stats.losses}</span>
                  <span className="stat-label">Losses</span>
                </div>
                <div className="stat">
                  <span className="stat-value ties">{stats.ties}</span>
                  <span className="stat-label">Ties</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="game-stats">
        <h3>By Game</h3>

        <div className="game-stat-section">
          <h4>🟩 Wordle</h4>
          <div className="player-stats-grid">
            {Object.entries(byGame.wordle).map(([player, stats]) => (
              <div key={player} className="game-stat-card">
                <h5>{player}</h5>
                <p>{stats.wins}W - {stats.losses}L</p>
              </div>
            ))}
          </div>
        </div>

        <div className="game-stat-section">
          <h4>🔗 Connections</h4>
          <div className="player-stats-grid">
            {Object.entries(byGame.connections).map(([player, stats]) => (
              <div key={player} className="game-stat-card">
                <h5>{player}</h5>
                <p>{stats.wins}W - {stats.losses}L</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Scoreboard;
