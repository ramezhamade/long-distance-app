import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

function WaitingStatus({ getAuthHeaders }) {
  const [waitingData, setWaitingData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWaitingStatus();
    // Refresh every 30 seconds
    const interval = setInterval(fetchWaitingStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchWaitingStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/waiting-status`, {
        headers: getAuthHeaders(),
      });
      setWaitingData(response.data);
    } catch (error) {
      console.error('Error fetching waiting status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  if (!waitingData || waitingData.waitingOn.length === 0) {
    return null;
  }

  return (
    <div className="waiting-status-section">
      <h3>Waiting On</h3>
      <div className="waiting-items">
        {waitingData.waitingOn.map((item, index) => (
          <div
            key={index}
            className={`waiting-item ${item.isYou ? 'waiting-on-you' : 'waiting-on-them'}`}
          >
            <span className="waiting-icon">{item.icon}</span>
            <div className="waiting-details">
              <span className="waiting-game">{item.game}</span>
              <span className="waiting-text">
                {item.isYou
                  ? `${item.waitingFor === waitingData.playerName ? 'Your' : `${item.waitingFor}'s`} turn!`
                  : `Waiting on ${item.waitingFor}`
                }
              </span>
              {item.questionText && (
                <span className="waiting-question">"{item.questionText}"</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WaitingStatus;
