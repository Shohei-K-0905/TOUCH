import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Card } from '@/components/Card';
import { Child } from '@/types';
import { colors } from '@/constants/colors';
import { User, Calendar } from 'lucide-react-native';

interface ChildCardProps {
  child: Child;
  selected?: boolean;
  onPress?: () => void;
  showDetails?: boolean;
}

export const ChildCard: React.FC<ChildCardProps> = ({
  child,
  selected = false,
  onPress,
  showDetails = false,
}) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card
        variant="elevated"
        style={[
          styles.card,
          selected && styles.selectedCard,
        ]}
      >
        <View style={styles.content}>
          {child.photo ? (
            <Image source={{ uri: child.photo }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <User size={24} color={colors.gray} />
            </View>
          )}
          
          <View style={styles.details}>
            <Text style={styles.name}>{child.name}</Text>
            <Text style={styles.age}>{child.age}歳</Text>
            
            {showDetails && (
              <>
                <View style={styles.infoRow}>
                  <Calendar size={16} color={colors.textLight} />
                  <Text style={styles.infoText}>誕生日: {new Date(child.birthDate).toLocaleDateString('ja-JP')}</Text>
                </View>
                
                {child.allergies && child.allergies.length > 0 && (
                  <Text style={styles.medicalInfo}>
                    アレルギー: {child.allergies.join(', ')}
                  </Text>
                )}
                
                {child.medicalConditions && child.medicalConditions.length > 0 && (
                  <Text style={styles.medicalInfo}>
                    既往症: {child.medicalConditions.join(', ')}
                  </Text>
                )}
              </>
            )}
          </View>
        </View>
        
        {selected && <View style={styles.selectedIndicator} />}
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 12,
    marginVertical: 6,
  },
  selectedCard: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  photo: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  photoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.grayLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  details: {
    marginLeft: 12,
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  age: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    color: colors.textLight,
  },
  medicalInfo: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 4,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderRightWidth: 24,
    borderTopWidth: 24,
    borderRightColor: 'transparent',
    borderTopColor: colors.primary,
  },
});