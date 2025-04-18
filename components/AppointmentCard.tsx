import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '@/components/Card';
import { Appointment, Child, Daycare, Clinic } from '@/types';
import { colors } from '@/constants/colors';
import { Calendar, Clock, MapPin, User, Video } from 'lucide-react-native';

interface AppointmentCardProps {
  appointment: Appointment;
  child: Child;
  daycare: Daycare;
  clinic: Clinic;
  onPress?: () => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  child,
  daycare,
  clinic,
  onPress,
}) => {
  const getStatusColor = () => {
    switch (appointment.status) {
      case 'scheduled':
        return colors.primary;
      case 'in-progress':
        return colors.warning;
      case 'completed':
        return colors.success;
      case 'cancelled':
        return colors.error;
      default:
        return colors.gray;
    }
  };

  const getStatusText = () => {
    switch (appointment.status) {
      case 'scheduled':
        return '予約済み';
      case 'in-progress':
        return '進行中';
      case 'completed':
        return '完了';
      case 'cancelled':
        return 'キャンセル';
      default:
        return '';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card variant="elevated" style={styles.card}>
        <View style={styles.header}>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: getStatusColor() },
              ]}
            />
            <Text style={styles.status}>
              {getStatusText()}
            </Text>
          </View>
          
          {appointment.status === 'scheduled' && (
            <View style={styles.joinButton}>
              <Video size={16} color={colors.primary} />
              <Text style={styles.joinText}>参加</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.infoRow}>
            <Calendar size={16} color={colors.textLight} />
            <Text style={styles.infoText}>{formatDate(appointment.date)}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Clock size={16} color={colors.textLight} />
            <Text style={styles.infoText}>{appointment.time}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <User size={16} color={colors.textLight} />
            <Text style={styles.infoText}>{child.name}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <MapPin size={16} color={colors.textLight} />
            <Text style={styles.infoText}>
              {daycare.name} ↔ {clinic.name}
            </Text>
          </View>
        </View>
        
        {appointment.notes && (
          <View style={styles.notes}>
            <Text style={styles.notesTitle}>メモ:</Text>
            <Text style={styles.notesText}>{appointment.notes}</Text>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 4,
  },
  joinText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary,
  },
  content: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
  },
  notes: {
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: colors.textLight,
  },
});