import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
  TextStyle
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { colors } from '@/constants/colors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputStyle?: ViewStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  labelStyle,
  inputStyle,
  leftIcon,
  rightIcon,
  secureTextEntry,
  ...rest
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPassword = secureTextEntry !== undefined;

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>{label}</Text>
      )}
      
      <View style={[
        styles.inputContainer,
        error ? styles.inputError : null,
        inputStyle
      ]}>
        {leftIcon && (
          <View style={styles.iconLeft}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          style={[
            styles.input,
            leftIcon ? { paddingLeft: 40 } : null,
            (rightIcon || isPassword) ? { paddingRight: 40 } : null,
          ]}
          placeholderTextColor={colors.gray}
          secureTextEntry={isPassword ? !isPasswordVisible : secureTextEntry}
          {...rest}
        />
        
        {isPassword && (
          <TouchableOpacity 
            style={styles.iconRight} 
            onPress={togglePasswordVisibility}
          >
            {isPasswordVisible ? (
              <EyeOff size={20} color={colors.gray} />
            ) : (
              <Eye size={20} color={colors.gray} />
            )}
          </TouchableOpacity>
        )}
        
        {rightIcon && !isPassword && (
          <View style={styles.iconRight}>
            {rightIcon}
          </View>
        )}
      </View>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    color: colors.text,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.white,
    position: 'relative',
  },
  input: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.error,
  },
  iconLeft: {
    position: 'absolute',
    left: 12,
    top: 12,
    zIndex: 1,
  },
  iconRight: {
    position: 'absolute',
    right: 12,
    top: 12,
    zIndex: 1,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
  },
});