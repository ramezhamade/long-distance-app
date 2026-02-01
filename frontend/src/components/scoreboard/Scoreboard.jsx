import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

function Scoreboard({ getAuthHeaders }) {
  const [loading, setLoading] = useState(true);
  const [scoreboard, setScoreboard] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch scoreboard when component mounts or becomes visible
    fetchScoreboard();

    // Set up interval to refresh every 10 seconds
    const interval = setInterval(() => {
      fetchScoreboard();
    }, 10000);

    return () => clearInterval(interval);
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

  const { byGame } = scoreboard;

  return (
    <div className="scoreboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>📊 Game Stats</h2>
        <button onClick={fetchScoreboard} className="refresh-button" title="Refresh stats">
          🔄 Refresh
        </button>
      </div>

      <div className="game-stats-container">
        {/* Wordle Stats */}
        <div className="game-stat-card">
          <h3>🟩 Wordle</h3>
          <div className="stats-table">
            <div className="stats-header">
              <span>Player</span>
              <span className="stat-col wins-col">Wins</span>
              <span className="stat-col ties-col">Ties</span>
              <span className="stat-col losses-col">Losses</span>
            </div>
            {Object.entries(byGame.wordle).map(([player, stats]) => (
              <div key={player} className="stats-row">
                <span className="player-name">{player}</span>
                <span className="stat-col stat-wins">{stats.wins}</span>
                <span className="stat-col stat-ties">{stats.ties || 0}</span>
                <span className="stat-col stat-losses">{stats.losses}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Connections Stats */}
        <div className="game-stat-card">
          <h3>🔗 Connections</h3>
          <div className="stats-table">
            <div className="stats-header">
              <span>Player</span>
              <span className="stat-col wins-col">Wins</span>
              <span className="stat-col ties-col">Ties</span>
              <span className="stat-col losses-col">Losses</span>
            </div>
            {Object.entries(byGame.connections).map(([player, stats]) => (
              <div key={player} className="stats-row">
                <span className="player-name">{player}</span>
                <span className="stat-col stat-wins">{stats.wins}</span>
                <span className="stat-col stat-ties">{stats.ties || 0}</span>
                <span className="stat-col stat-losses">{stats.losses}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Scoreboard;
