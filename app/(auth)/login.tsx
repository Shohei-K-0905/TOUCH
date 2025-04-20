import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Header } from '@/components/Header';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import { Mail, Lock } from 'lucide-react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error, isAuthenticated } = useAuthStore();
  
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('password');
  const [formErrors, setFormErrors] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)/consultations');
    }
  }, [isAuthenticated, router]);

  const validateForm = () => {
    let isValid = true;
    const errors = {
      email: '',
      password: '',
    };

    if (!email) {
      errors.email = 'メールアドレスを入力してください';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'メールアドレスの形式が正しくありません';
      isValid = false;
    }

    if (!password) {
      errors.password = 'パスワードを入力してください';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleLogin = async () => {
    if (validateForm()) {
      await login(email, password);
    }
  };

  const handleRegister = () => {
    router.push('/register');
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View style={styles.innerContainer}>
            <Header title="ログイン" showBackButton />
            
            <ScrollView 
              style={styles.content}
              contentContainerStyle={styles.contentContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
            >
              <Text style={styles.subtitle}>
                おかえりなさい！アカウントにログインしてください。
              </Text>
              
              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
              
              <View style={styles.form}>
                <Input
                  label="メールアドレス"
                  placeholder="メールアドレスを入力"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={formErrors.email}
                  leftIcon={<Mail size={20} color={colors.gray} />}
                />
                
                <Input
                  label="パスワード"
                  placeholder="パスワードを入力"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  error={formErrors.password}
                  leftIcon={<Lock size={20} color={colors.gray} />}
                />
                
                <TouchableOpacity style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>パスワードをお忘れですか？</Text>
                </TouchableOpacity>
                
                <Button
                  title="ログイン"
                  onPress={handleLogin}
                  loading={isLoading}
                  style={styles.button}
                />
              </View>
              
              <View style={styles.footerContainer}>
                <Text style={styles.footerText}>アカウントをお持ちでないですか？</Text>
                <TouchableOpacity onPress={handleRegister}>
                  <Text style={styles.footerLink}>アカウント作成</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 100, // Extra padding at the bottom to ensure scrollability
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 24,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
  },
  form: {
    marginTop: 8,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: 14,
  },
  button: {
    marginTop: 8,
    marginBottom: 24,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  footerText: {
    color: colors.textLight,
    marginRight: 4,
  },
  footerLink: {
    color: colors.primary,
    fontWeight: '500',
  },
});