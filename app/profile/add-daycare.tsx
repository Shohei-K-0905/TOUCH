import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components/Header';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { colors } from '@/constants/colors';
import { useDaycareStore } from '@/store/daycare-store';
import { Building, MapPin, Phone, Mail, User } from 'lucide-react-native';

export default function AddDaycareScreen() {
  const router = useRouter();
  const { addDaycare, selectDaycare } = useDaycareStore();
  
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // エラー状態
  const [errors, setErrors] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
  });
  
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      name: '',
      address: '',
      phone: '',
      email: '',
    };
    
    if (!name.trim()) {
      newErrors.name = '保育施設名は必須です';
      isValid = false;
    }
    
    if (!address.trim()) {
      newErrors.address = '住所は必須です';
      isValid = false;
    }
    
    if (!phone.trim()) {
      newErrors.phone = '電話番号は必須です';
      isValid = false;
    }
    
    if (!email.trim()) {
      newErrors.email = 'メールアドレスは必須です';
      isValid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleSave = () => {
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 保育施設を追加
      const daycareData = {
        name,
        address,
        phone,
        email,
        contactPerson,
      };
      
      addDaycare(daycareData);
      
      // 最後に追加した保育施設を選択状態にする
      const newDaycareId = Date.now().toString();
      selectDaycare(newDaycareId);
      
      router.back();
    } catch (error) {
      console.error('Failed to add daycare:', error);
      alert('保育施設の追加に失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
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
            <Header title="保育施設を追加" showBackButton />
            
            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.contentContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
            >
              <View style={styles.formSection}>
                <Text style={styles.subtitle}>
                  お子様が通っている保育施設の情報を入力してください。
                </Text>
                
                <Input
                  label="保育施設名 *"
                  placeholder="保育施設名を入力"
                  value={name}
                  onChangeText={setName}
                  leftIcon={<Building size={20} color={colors.gray} />}
                  error={errors.name}
                />
                
                <Input
                  label="住所 *"
                  placeholder="住所を入力"
                  value={address}
                  onChangeText={setAddress}
                  leftIcon={<MapPin size={20} color={colors.gray} />}
                  error={errors.address}
                />
                
                <Input
                  label="電話番号 *"
                  placeholder="電話番号を入力"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  leftIcon={<Phone size={20} color={colors.gray} />}
                  error={errors.phone}
                />
                
                <Input
                  label="メールアドレス *"
                  placeholder="メールアドレスを入力"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  leftIcon={<Mail size={20} color={colors.gray} />}
                  error={errors.email}
                />
                
                <Input
                  label="担当者名"
                  placeholder="担当者名を入力"
                  value={contactPerson}
                  onChangeText={setContactPerson}
                  leftIcon={<User size={20} color={colors.gray} />}
                />
              </View>
              
              <View style={styles.buttonContainer}>
                <Button
                  title="保育施設を登録"
                  onPress={handleSave}
                  loading={isLoading}
                />
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
    backgroundColor: colors.backgroundLight,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100, // Extra padding at the bottom to ensure scrollability
  },
  formSection: {
    padding: 20,
    backgroundColor: colors.white,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 20,
  },
  buttonContainer: {
    padding: 20,
    backgroundColor: colors.white,
    marginTop: 12,
    marginBottom: 24,
  },
});