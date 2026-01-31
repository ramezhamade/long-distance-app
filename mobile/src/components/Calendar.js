import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

function Calendar({ events, onAddEvent, onDeleteEvent }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    description: '',
  });

  const handleSubmit = () => {
    if (formData.title && formData.date) {
      onAddEvent(formData);
      setFormData({ title: '', date: '', description: '' });
      setShowForm(false);
    }
  };

  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );
  const upcomingEvents = sortedEvents.filter(
    event => new Date(event.date) >= new Date()
  );
  const pastEvents = sortedEvents.filter(
    event => new Date(event.date) < new Date()
  );

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Our Special Dates</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowForm(!showForm)}>
            <Text style={styles.addButtonText}>
              {showForm ? '✕ Cancel' : '+ Add Event'}
            </Text>
          </TouchableOpacity>
        </View>

        {showForm && (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Event title (e.g., 'Our Anniversary')"
              placeholderTextColor="#999"
              value={formData.title}
              onChangeText={text => setFormData({ ...formData, title: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Date & Time (YYYY-MM-DDTHH:MM)"
              placeholderTextColor="#999"
              value={formData.date}
              onChangeText={text => setFormData({ ...formData, date: text })}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              placeholderTextColor="#999"
              value={formData.description}
              onChangeText={text =>
                setFormData({ ...formData, description: text })
              }
              multiline
              numberOfLines={3}
            />
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Add Event</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.eventsSection}>
          {upcomingEvents.length > 0 && (
            <View style={styles.eventsGroup}>
              <Text style={styles.groupTitle}>Upcoming Events</Text>
              {upcomingEvents.map(event => (
                <View key={event.id} style={styles.eventCard}>
                  <View style={styles.eventContent}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventDate}>
                      📅{' '}
                      {new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                    {event.description && (
                      <Text style={styles.eventDesc}>{event.description}</Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => onDeleteEvent(event.id)}>
                    <Text style={styles.deleteButtonText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {pastEvents.length > 0 && (
            <View style={styles.eventsGroup}>
              <Text style={styles.groupTitle}>Memories</Text>
              {pastEvents.reverse().map(event => (
                <View key={event.id} style={[styles.eventCard, styles.pastEvent]}>
                  <View style={styles.eventContent}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventDate}>
                      📅{' '}
                      {new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                    {event.description && (
                      <Text style={styles.eventDesc}>{event.description}</Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => onDeleteEvent(event.id)}>
                    <Text style={styles.deleteButtonText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {events.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                No events yet. Add your first special date!
              </Text>
            </View>
          )}
        </View>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 12,
  },
  headerTitle: {
    color: '#667eea',
    fontSize: 22,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#667eea',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  form: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 15,
    marginBottom: 20,
    gap: 12,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#667eea',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  eventsSection: {
    gap: 20,
  },
  eventsGroup: {
    gap: 12,
  },
  groupTitle: {
    color: '#764ba2',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  eventCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  pastEvent: {
    opacity: 0.7,
    borderLeftColor: '#999',
  },
  eventContent: {
    flex: 1,
    gap: 4,
  },
  eventTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: '600',
  },
  eventDate: {
    color: '#666',
    fontSize: 13,
  },
  eventDesc: {
    color: '#666',
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 20,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default Calendar;
