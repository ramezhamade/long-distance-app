import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';

function Statistics({ statistics, onUpdateStatistics }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    relationshipStart: '',
    lastMeeting: '',
    nextMeeting: '',
  });
  const [timeSince, setTimeSince] = useState({
    together: null,
    lastSeen: null,
  });

  useEffect(() => {
    if (statistics) {
      setFormData({
        relationshipStart: statistics.relationshipStart || '',
        lastMeeting: statistics.lastMeeting || '',
        nextMeeting: statistics.nextMeeting || '',
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

        result.lastSeen = { days };
      }

      setTimeSince(result);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 60000);

    return () => clearInterval(interval);
  }, [statistics]);

  const handleSave = () => {
    onUpdateStatistics(formData);
    setIsEditing(false);
  };

  const hasNoData =
    !statistics?.relationshipStart &&
    !statistics?.lastMeeting &&
    !statistics?.nextMeeting;

  if (isEditing || hasNoData) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Relationship Statistics</Text>
            {!hasNoData && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsEditing(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>When did your relationship start?</Text>
              <TextInput
                style={styles.input}
                value={formData.relationshipStart}
                onChangeText={text =>
                  setFormData({ ...formData, relationshipStart: text })
                }
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>When did you last see each other?</Text>
              <TextInput
                style={styles.input}
                value={formData.lastMeeting}
                onChangeText={text =>
                  setFormData({ ...formData, lastMeeting: text })
                }
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>When will you next see each other?</Text>
              <TextInput
                style={styles.input}
                value={formData.nextMeeting}
                onChangeText={text =>
                  setFormData({ ...formData, nextMeeting: text })
                }
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#999"
              />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>
                {hasNoData ? 'Set Up Statistics' : 'Save Changes'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  const timeUntilNext = statistics?.nextMeeting
    ? Math.floor(
        (new Date(statistics.nextMeeting) - new Date()) / (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Our Journey</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setIsEditing(true)}>
          <Text style={styles.editButtonText}>✏️ Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        {timeSince.together && (
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>💕</Text>
            <View style={styles.statContent}>
              <Text style={styles.statTitle}>TOGETHER</Text>
              <Text style={styles.statValue}>
                {timeSince.together.years > 0 &&
                  `${timeSince.together.years}y `}
                {timeSince.together.months > 0 &&
                  `${timeSince.together.months}m `}
                {timeSince.together.days > 0 && `${timeSince.together.days}d`}
              </Text>
              <Text style={styles.statSubtext}>
                {timeSince.together.totalDays} days total
              </Text>
            </View>
          </View>
        )}

        {timeSince.lastSeen && (
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>😢</Text>
            <View style={styles.statContent}>
              <Text style={styles.statTitle}>SINCE WE LAST MET</Text>
              <Text style={styles.statValue}>
                {timeSince.lastSeen.days} day{timeSince.lastSeen.days !== 1 ? 's' : ''}
              </Text>
              <Text style={styles.statSubtext}>
                {new Date(statistics.lastMeeting).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </View>
        )}

        {timeUntilNext !== null && timeUntilNext >= 0 && (
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🎉</Text>
            <View style={styles.statContent}>
              <Text style={styles.statTitle}>UNTIL WE MEET AGAIN</Text>
              <Text style={styles.statValue}>
                {timeUntilNext} day{timeUntilNext !== 1 ? 's' : ''}
              </Text>
              <Text style={styles.statSubtext}>
                {new Date(statistics.nextMeeting).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </View>
        )}
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
  },
  headerTitle: {
    color: '#667eea',
    fontSize: 22,
    fontWeight: 'bold',
  },
  editButton: {
    borderWidth: 2,
    borderColor: '#667eea',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  editButtonText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  form: {
    marginTop: 8,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#667eea',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  statsGrid: {
    gap: 16,
  },
  statCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#e8e8e8',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  statIcon: {
    fontSize: 36,
  },
  statContent: {
    flex: 1,
  },
  statTitle: {
    color: '#764ba2',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    color: '#667eea',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statSubtext: {
    color: '#666',
    fontSize: 12,
  },
});

export default Statistics;
