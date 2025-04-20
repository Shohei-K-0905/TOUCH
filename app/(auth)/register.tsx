import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
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
import { Mail, Lock, User, Phone } from 'lucide-react-native';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error, isAuthenticated } = useAuthStore();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)/consultations');
    }
  }, [isAuthenticated, router]);

  const validateForm = () => {
    let isValid = true;
    const errors = {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    };

    if (!name) {
      errors.name = '名前を入力してください';
      isValid = false;
    }

    if (!email) {
      errors.email = 'メールアドレスを入力してください';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'メールアドレスの形式が正しくありません';
      isValid = false;
    }

    if (!phone) {
      errors.phone = '電話番号を入力してください';
      isValid = false;
    }

    if (!password) {
      errors.password = 'パスワードを入力してください';
      isValid = false;
    } else if (password.length < 6) {
      errors.password = 'パスワードは6文字以上で入力してください';
      isValid = false;
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'パスワードが一致しません';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleRegister = async () => {
    if (validateForm()) {
      await register(name, email, phone, password);
    }
  };

  const handleLogin = () => {
    router.push('/login');
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
            <Header title="アカウント作成" showBackButton />
            
            <ScrollView 
              style={styles.content}
              contentContainerStyle={styles.contentContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
            >
              <Text style={styles.subtitle}>
                新しいアカウントを作成して、オンライン診療サービスを利用しましょう。
              </Text>
              
              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
              
              <View style={styles.form}>
                <Input
                  label="お名前"
                  placeholder="お名前を入力"
                  value={name}
                  onChangeText={setName}
                  error={formErrors.name}
                  leftIcon={<User size={20} color={colors.gray} />}
                />
                
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
                  label="電話番号"
                  placeholder="電話番号を入力"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  error={formErrors.phone}
                  leftIcon={<Phone size={20} color={colors.gray} />}
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
                
                <Input
                  label="パスワード（確認）"
                  placeholder="パスワードを再入力"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  error={formErrors.confirmPassword}
                  leftIcon={<Lock size={20} color={colors.gray} />}
                />
                
                <Button
                  title="アカウント作成"
                  onPress={handleRegister}
                  loading={isLoading}
                  style={styles.button}
                />
              </View>
              
              <View style={styles.footerContainer}>
                <Text style={styles.footerText}>すでにアカウントをお持ちですか？</Text>
                <TouchableOpacity onPress={handleLogin}>
                  <Text style={styles.footerLink}>ログイン</Text>
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
  button: {
    marginTop: 24,
    marginBottom: 16,
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