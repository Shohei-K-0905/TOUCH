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
import { useClinicStore } from '@/store/clinic-store';
import { Hospital, MapPin, Phone, Mail, Stethoscope } from 'lucide-react-native';

export default function AddClinicScreen() {
  const router = useRouter();
  const { addClinic, selectClinic } = useClinicStore();
  
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [specialties, setSpecialties] = useState('');
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
      newErrors.name = 'クリニック名は必須です';
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
      // クリニックを追加
      const clinicData = {
        name,
        address,
        phone,
        email,
        specialties: specialties ? specialties.split(',').map(s => s.trim()) : [],
      };
      
      addClinic(clinicData);
      
      // 最後に追加したクリニックを選択状態にする
      const newClinicId = Date.now().toString();
      selectClinic(newClinicId);
      
      router.back();
    } catch (error) {
      console.error('Failed to add clinic:', error);
      alert('クリニックの追加に失敗しました。もう一度お試しください。');
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
            <Header title="クリニックを追加" showBackButton />
            
            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.contentContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
            >
              <View style={styles.formSection}>
                <Text style={styles.subtitle}>
                  お子様がかかっているクリニックの情報を入力してください。
                </Text>
                
                <Input
                  label="クリニック名 *"
                  placeholder="クリニック名を入力"
                  value={name}
                  onChangeText={setName}
                  leftIcon={<Hospital size={20} color={colors.gray} />}
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
                  label="診療科目"
                  placeholder="診療科目をカンマ区切りで入力（例：小児科,アレルギー科）"
                  value={specialties}
                  onChangeText={setSpecialties}
                  leftIcon={<Stethoscope size={20} color={colors.gray} />}
                />
              </View>
              
              <View style={styles.buttonContainer}>
                <Button
                  title="クリニックを登録"
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