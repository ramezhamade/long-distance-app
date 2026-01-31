import { useState, useEffect } from 'react';

function Statistics({ statistics, onUpdateStatistics }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    relationshipStart: '',
    lastMeeting: '',
    nextMeeting: ''
  });
  const [timeSince, setTimeSince] = useState({
    together: null,
    lastSeen: null
  });

  useEffect(() => {
    if (statistics) {
      setFormData({
        relationshipStart: statistics.relationshipStart || '',
        lastMeeting: statistics.lastMeeting || '',
        nextMeeting: statistics.nextMeeting || ''
      });
    }
  }, [statistics]);

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const result = { together: null, lastSeen: null };

      if (statistics?.relationshipStart) {
        const start = new Date(statistics.relationshipStart);
        const diff = now - start;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const years = Math.floor(days / 365);
        const months = Math.floor((days % 365) / 30);
        const remainingDays = Math.floor((days % 365) % 30);

        result.together = { years, months, days: remainingDays, totalDays: days };
      }

      if (statistics?.lastMeeting) {
        const lastSeen = new Date(statistics.lastMeeting);
        const diff = now - lastSeen;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);

        result.lastSeen = { days, hours };
      }

      setTimeSince(result);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [statistics]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateStatistics(formData);
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const hasNoData = !statistics?.relationshipStart && !statistics?.lastMeeting && !statistics?.nextMeeting;

  if (isEditing || hasNoData) {
    return (
      <div className="statistics-container">
        <div className="statistics-card">
          <div className="statistics-header">
            <h2>Relationship Statistics</h2>
            {!hasNoData && (
              <button className="cancel-button" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            )}
          </div>

          <form className="statistics-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>When did your relationship start?</label>
              <input
                type="date"
                name="relationshipStart"
                value={formData.relationshipStart}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>When did you last see each other?</label>
              <input
                type="date"
                name="lastMeeting"
                value={formData.lastMeeting}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>When will you next see each other?</label>
              <input
                type="date"
                name="nextMeeting"
                value={formData.nextMeeting}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="save-button">
              {hasNoData ? 'Set Up Statistics' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const timeUntilNext = statistics?.nextMeeting
    ? Math.floor((new Date(statistics.nextMeeting) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="statistics-container">
      <div className="statistics-header">
        <h2>Our Journey</h2>
        <button className="edit-stats-button" onClick={() => setIsEditing(true)}>
          ✏️ Edit
        </button>
      </div>

      <div className="stats-grid">
        {timeSince.together && (
          <div className="stat-card">
            <div className="stat-icon">💕</div>
            <div className="stat-content">
              <h3>Together</h3>
              <div className="stat-value">
                {timeSince.together.years > 0 && (
                  <span>{timeSince.together.years} year{timeSince.together.years !== 1 ? 's' : ''} </span>
                )}
                {timeSince.together.months > 0 && (
                  <span>{timeSince.together.months} month{timeSince.together.months !== 1 ? 's' : ''} </span>
                )}
                {timeSince.together.days > 0 && (
                  <span>{timeSince.together.days} day{timeSince.together.days !== 1 ? 's' : ''}</span>
                )}
              </div>
              <div className="stat-subtext">{timeSince.together.totalDays} days total</div>
            </div>
          </div>
        )}

        {timeSince.lastSeen && (
          <div className="stat-card">
            <div className="stat-icon">😢</div>
            <div className="stat-content">
              <h3>Since We Last Met</h3>
              <div className="stat-value">
                {timeSince.lastSeen.days} day{timeSince.lastSeen.days !== 1 ? 's' : ''}
              </div>
              <div className="stat-subtext">
                Last saw each other on {new Date(statistics.lastMeeting).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
            </div>
          </div>
        )}

        {timeUntilNext !== null && timeUntilNext >= 0 && (
          <div className="stat-card">
            <div className="stat-icon">🎉</div>
            <div className="stat-content">
              <h3>Until We Meet Again</h3>
              <div className="stat-value">
                {timeUntilNext} day{timeUntilNext !== 1 ? 's' : ''}
              </div>
              <div className="stat-subtext">
                {new Date(statistics.nextMeeting).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
            </div>
          </div>
        )}

        {timeUntilNext !== null && timeUntilNext < 0 && (
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <h3>Next Meeting</h3>
              <div className="stat-value">Update needed</div>
              <div className="stat-subtext">Your next meeting date has passed</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Statistics;
