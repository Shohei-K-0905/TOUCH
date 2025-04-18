import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '@/components/Card';
import { colors } from '@/constants/colors';
import { Check } from 'lucide-react-native';

interface SelectionCardProps {
  title: string;
  subtitle?: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
}

export const SelectionCard: React.FC<SelectionCardProps> = ({
  title,
  subtitle,
  selected = false,
  onPress,
  icon,
}) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card
        variant="outlined"
        style={[
          styles.card,
          selected && styles.selectedCard,
        ]}
      >
        <View style={styles.content}>
          {icon && (
            <View style={[styles.iconContainer, selected && styles.selectedIconContainer]}>
              {icon}
            </View>
          )}
          
          <View style={styles.textContainer}>
            <Text style={[styles.title, selected && styles.selectedText]}>
              {title}
            </Text>
            {subtitle && (
              <Text style={[styles.subtitle, selected && styles.selectedSubtitle]}>
                {subtitle}
              </Text>
            )}
          </View>
          
          {selected && (
            <View style={styles.checkContainer}>
              <Check size={20} color={colors.white} />
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedCard: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.grayLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedIconContainer: {
    backgroundColor: colors.primary,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  selectedText: {
    color: colors.primary,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 2,
  },
  selectedSubtitle: {
    color: colors.primary,
  },
  checkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});