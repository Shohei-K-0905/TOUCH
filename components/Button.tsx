import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View
} from 'react-native';
import { colors } from '@/constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon
}) => {
  const getButtonStyle = () => {
    let buttonStyle: ViewStyle = {};
    
    switch (variant) {
      case 'primary':
        buttonStyle = {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
        };
        break;
      case 'secondary':
        buttonStyle = {
          backgroundColor: colors.secondary,
          borderColor: colors.secondary,
        };
        break;
      case 'outline':
        buttonStyle = {
          backgroundColor: 'transparent',
          borderColor: colors.primary,
          borderWidth: 1,
        };
        break;
      case 'text':
        buttonStyle = {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        };
        break;
    }
    
    if (disabled) {
      buttonStyle.opacity = 0.5;
    }
    
    return buttonStyle;
  };
  
  const getTextStyle = () => {
    let style: TextStyle = {};
    
    switch (variant) {
      case 'primary':
      case 'secondary':
        style = {
          color: colors.white,
        };
        break;
      case 'outline':
      case 'text':
        style = {
          color: colors.primary,
        };
        break;
    }
    
    switch (size) {
      case 'small':
        style.fontSize = 14;
        break;
      case 'medium':
        style.fontSize = 16;
        break;
      case 'large':
        style.fontSize = 18;
        break;
    }
    
    return style;
  };
  
  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderRadius: 4,
        };
      case 'medium':
        return {
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 6,
        };
      case 'large':
        return {
          paddingVertical: 16,
          paddingHorizontal: 32,
          borderRadius: 8,
        };
    }
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        getSizeStyle(),
        style
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'outline' || variant === 'text' ? colors.primary : colors.white} 
          size="small" 
        />
      ) : (
        <View style={styles.buttonContent}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[styles.text, getTextStyle(), textStyle]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});