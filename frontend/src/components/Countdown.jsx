import { useState, useEffect } from 'react';

function Countdown({ event }) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!event) {
      setTimeLeft(null);
      return;
    }

    const calculateTimeLeft = () => {
      const difference = new Date(event.date) - new Date();

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      }
      return null;
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [event]);

  if (!event) {
    return (
      <div className="countdown-container">
        <div className="countdown-card">
          <h2>No Upcoming Events</h2>
          <p>Add your first special date below!</p>
        </div>
      </div>
    );
  }

  if (!timeLeft) {
    return (
      <div className="countdown-container">
        <div className="countdown-card">
          <h2>🎉 It's Today! 🎉</h2>
          <h3>{event.title}</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="countdown-container">
      <div className="countdown-card">
        <h2>Counting down to...</h2>
        <h3>{event.title}</h3>
        {event.description && <p className="event-description">{event.description}</p>}
        <div className="countdown-timer">
          <div className="time-unit">
            <span className="time-value">{timeLeft.days}</span>
            <span className="time-label">Days</span>
          </div>
          <div className="time-unit">
            <span className="time-value">{timeLeft.hours}</span>
            <span className="time-label">Hours</span>
          </div>
          <div className="time-unit">
            <span className="time-value">{timeLeft.minutes}</span>
            <span className="time-label">Minutes</span>
          </div>
          <div className="time-unit">
            <span className="time-value">{timeLeft.seconds}</span>
            <span className="time-label">Seconds</span>
          </div>
        </div>
        <p className="event-date">📅 {new Date(event.date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</p>
      </div>
    </div>
  );
}

export default Countdown;
