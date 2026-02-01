import { useState, useEffect } from 'react';
import axios from 'axios';
import Calendar from './components/Calendar';
import Countdown from './components/Countdown';
import Statistics from './components/Statistics';
import Login from './components/Login';
import TabNavigation from './components/TabNavigation';
import GamesHub from './components/games/GamesHub';
import WhoMoreLikely from './components/whoMoreLikely/WhoMoreLikely';
import Scoreboard from './components/scoreboard/Scoreboard';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

function App() {
  const [events, setEvents] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [playerName, setPlayerName] = useState(null);
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    // Check if already logged in
    const savedAuth = localStorage.getItem('auth');
    const savedPlayer = localStorage.getItem('playerName');

    if (savedAuth) {
      setAuthToken(savedAuth);
      setIsAuthenticated(true);
      if (savedPlayer) {
        setPlayerName(savedPlayer);
      }
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && authToken) {
      fetchEvents();
      fetchStatistics();
    }
  }, [isAuthenticated, authToken]);

  const getAuthHeaders = () => {
    const headers = {
      Authorization: `Basic ${authToken}`,
    };
    if (playerName) {
      headers['X-Player-Name'] = playerName;
    }
    return headers;
  };

  const handleLogin = (credentials, playerName) => {
    setAuthToken(credentials);
    setIsAuthenticated(true);
    setPlayerName(playerName);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth');
    localStorage.removeItem('playerName');
    setIsAuthenticated(false);
    setAuthToken(null);
    setPlayerName(null);
    setEvents([]);
    setStatistics(null);
  };

  const handleDownloadData = async () => {
    try {
      const response = await axios.get(`${API_URL}/download-data`, {
        headers: getAuthHeaders(),
        responseType: 'blob' // Important for file download
      });

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `data-backup-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Error downloading data:', error);
      alert('Failed to download data backup');
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axios.get(`${API_URL}/statistics`, {
        headers: getAuthHeaders(),
      });
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API_URL}/events`, {
        headers: getAuthHeaders(),
      });
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const addEvent = async (event) => {
    try {
      const response = await axios.post(`${API_URL}/events`, event, {
        headers: getAuthHeaders(),
      });
      setEvents([...events, response.data]);
    } catch (error) {
      console.error('Error adding event:', error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    }
  };

  const deleteEvent = async (id) => {
    try {
      await axios.delete(`${API_URL}/events/${id}`, {
        headers: getAuthHeaders(),
      });
      setEvents(events.filter(event => event.id !== id));
    } catch (error) {
      console.error('Error deleting event:', error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    }
  };

  const updateStatistics = async (stats) => {
    try {
      const response = await axios.put(`${API_URL}/statistics`, stats, {
        headers: getAuthHeaders(),
      });
      setStatistics(response.data);
    } catch (error) {
      console.error('Error updating statistics:', error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const nextEvent = events
    .filter(event => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>The Lamez Hub</h1>
        <p>Where Ramez & Layan connect across the miles</p>
        <div className="header-actions">
          {playerName && <span className="current-player">Playing as: {playerName}</span>}
          <button onClick={handleDownloadData} className="download-button" title="Download data backup">
            💾 Backup
          </button>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="container">
        {activeTab === 'home' && (
          <>
            <Countdown event={nextEvent} />
            <Statistics statistics={statistics} onUpdateStatistics={updateStatistics} />
            <Calendar events={events} onAddEvent={addEvent} onDeleteEvent={deleteEvent} />
          </>
        )}

        {activeTab === 'games' && (
          <GamesHub getAuthHeaders={getAuthHeaders} />
        )}

        {activeTab === 'whoMoreLikely' && (
          <WhoMoreLikely getAuthHeaders={getAuthHeaders} playerName={playerName} />
        )}

        {activeTab === 'stats' && (
          <Scoreboard getAuthHeaders={getAuthHeaders} />
        )}
      </div>
    </div>
  );
}

export default App;
