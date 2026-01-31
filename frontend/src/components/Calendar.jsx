import { useState } from 'react';

function Calendar({ events, onAddEvent, onDeleteEvent }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title && formData.date) {
      onAddEvent(formData);
      setFormData({ title: '', date: '', description: '' });
      setShowForm(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));
  const upcomingEvents = sortedEvents.filter(event => new Date(event.date) >= new Date());
  const pastEvents = sortedEvents.filter(event => new Date(event.date) < new Date());

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h2>Our Special Dates</h2>
        <button className="add-button" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Add Event'}
        </button>
      </div>

      {showForm && (
        <form className="event-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            placeholder="Event title (e.g., 'Our Anniversary')"
            value={formData.title}
            onChange={handleChange}
            required
          />
          <input
            type="datetime-local"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
          <textarea
            name="description"
            placeholder="Description (optional)"
            value={formData.description}
            onChange={handleChange}
            rows="3"
          />
          <button type="submit" className="submit-button">Add Event</button>
        </form>
      )}

      <div className="events-section">
        {upcomingEvents.length > 0 && (
          <div className="events-group">
            <h3>Upcoming Events</h3>
            <div className="events-list">
              {upcomingEvents.map(event => (
                <div key={event.id} className="event-card upcoming">
                  <div className="event-content">
                    <h4>{event.title}</h4>
                    <p className="event-date">
                      📅 {new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    {event.description && <p className="event-desc">{event.description}</p>}
                  </div>
                  <button
                    className="delete-button"
                    onClick={() => onDeleteEvent(event.id)}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {pastEvents.length > 0 && (
          <div className="events-group">
            <h3>Memories</h3>
            <div className="events-list">
              {pastEvents.reverse().map(event => (
                <div key={event.id} className="event-card past">
                  <div className="event-content">
                    <h4>{event.title}</h4>
                    <p className="event-date">
                      📅 {new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                    {event.description && <p className="event-desc">{event.description}</p>}
                  </div>
                  <button
                    className="delete-button"
                    onClick={() => onDeleteEvent(event.id)}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {events.length === 0 && (
          <div className="empty-state">
            <p>No events yet. Add your first special date!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Calendar;
