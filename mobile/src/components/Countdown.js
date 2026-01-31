import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

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
          seconds: Math.floor((difference / 1000) % 60),
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
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>No Upcoming Events</Text>
          <Text style={styles.message}>Add your first special date below!</Text>
        </View>
      </View>
    );
  }

  if (!timeLeft) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.celebration}>🎉 It's Today! 🎉</Text>
          <Text style={styles.eventTitle}>{event.title}</Text>
        </View>
      </View>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Counting down to...</Text>
        <Text style={styles.eventTitle}>{event.title}</Text>
        {event.description && (
          <Text style={styles.description}>{event.description}</Text>
        )}

        <View style={styles.timerContainer}>
          <View style={styles.timeUnit}>
            <Text style={styles.timeValue}>{timeLeft.days}</Text>
            <Text style={styles.timeLabel}>DAYS</Text>
          </View>
          <View style={styles.timeUnit}>
            <Text style={styles.timeValue}>{timeLeft.hours}</Text>
            <Text style={styles.timeLabel}>HOURS</Text>
          </View>
          <View style={styles.timeUnit}>
            <Text style={styles.timeValue}>{timeLeft.minutes}</Text>
            <Text style={styles.timeLabel}>MINUTES</Text>
          </View>
          <View style={styles.timeUnit}>
            <Text style={styles.timeValue}>{timeLeft.seconds}</Text>
            <Text style={styles.timeLabel}>SECONDS</Text>
          </View>
        </View>

        <Text style={styles.eventDate}>📅 {formatDate(event.date)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 10,
    alignItems: 'center',
  },
  title: {
    color: '#667eea',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  eventTitle: {
    color: '#764ba2',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    color: '#666',
    fontSize: 14,
    marginBottom: 20,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 24,
    flexWrap: 'wrap',
  },
  timeUnit: {
    alignItems: 'center',
    minWidth: 70,
    marginHorizontal: 4,
    marginVertical: 8,
  },
  timeValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#667eea',
  },
  timeLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
    fontWeight: '600',
  },
  eventDate: {
    color: '#666',
    fontSize: 14,
    marginTop: 12,
  },
  celebration: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#764ba2',
    marginBottom: 12,
  },
  message: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default Countdown;
