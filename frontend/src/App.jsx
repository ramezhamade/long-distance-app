import { useState, useEffect } from 'react';
import axios from 'axios';
import Calendar from './components/Calendar';
import Countdown from './components/Countdown';
import Statistics from './components/Statistics';
import Login from './components/Login';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

function App() {
  const [events, setEvents] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    // Check if already logged in
    const savedAuth = localStorage.getItem('auth');
    if (savedAuth) {
      setAuthToken(savedAuth);
      setIsAuthenticated(true);
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

  const getAuthHeaders = () => ({
    Authorization: `Basic ${authToken}`,
  });

  const handleLogin = (credentials) => {
    setAuthToken(credentials);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth');
    setIsAuthenticated(false);
    setAuthToken(null);
    setEvents([]);
    setStatistics(null);
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
        <h1>💕 Our Long Distance Love 💕</h1>
        <p>Together, no matter the distance</p>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </header>

      <div className="container">
        <Countdown event={nextEvent} />
        <Statistics statistics={statistics} onUpdateStatistics={updateStatistics} />
        <Calendar events={events} onAddEvent={addEvent} onDeleteEvent={deleteEvent} />
      </div>
    </div>
  );
}

export default App;
