import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import Countdown from './src/components/Countdown';
import Statistics from './src/components/Statistics';
import Calendar from './src/components/Calendar';

// Update this with your computer's IP address when testing on a real device
// Find it by running: ipconfig getifaddr en0 (on Mac)
const API_URL = 'http://localhost:5001/api';

function App() {
  const [events, setEvents] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await axios.get(`${API_URL}/statistics`);
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API_URL}/events`);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const addEvent = async (event) => {
    try {
      const response = await axios.post(`${API_URL}/events`, event);
      setEvents([...events, response.data]);
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const deleteEvent = async (id) => {
    try {
      await axios.delete(`${API_URL}/events/${id}`);
      setEvents(events.filter(event => event.id !== id));
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const updateStatistics = async (stats) => {
    try {
      const response = await axios.put(`${API_URL}/statistics`, stats);
      setStatistics(response.data);
    } catch (error) {
      console.error('Error updating statistics:', error);
    }
  };

  const nextEvent = events
    .filter(event => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  if (loading) {
    return (
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>Loading...</Text>
      </LinearGradient>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}>
        <View style={styles.header}>
          <Text style={styles.title}>💕 Our Long Distance Love 💕</Text>
          <Text style={styles.subtitle}>Together, no matter the distance</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <Countdown event={nextEvent} />
          <Statistics
            statistics={statistics}
            onUpdateStatistics={updateStatistics}
          />
          <Calendar
            events={events}
            onAddEvent={addEvent}
            onDeleteEvent={deleteEvent}
          />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 18,
    marginTop: 16,
    fontWeight: '600',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: {width: 2, height: 2},
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
});

export default App;
