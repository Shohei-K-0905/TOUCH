import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import { ArrowLeft, Calendar, User, Mail, Phone, MapPin, Briefcase } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateUserProfile } = useAuthStore();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [birthDate, setBirthDate] = useState(user?.birthDate ? new Date(user.birthDate) : new Date());
  const [address, setAddress] = useState(user?.address || '');
  const [workplace, setWorkplace] = useState(user?.workplace || '');
  const [workplacePhone, setWorkplacePhone] = useState(user?.workplacePhone || '');
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || birthDate;
    setShowDatePicker(Platform.OS === 'ios');
    setBirthDate(currentDate);
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = '名前を入力してください';
    }
    
    if (!email.trim()) {
      newErrors.email = 'メールアドレスを入力してください';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }
    
    if (!phone.trim()) {
      newErrors.phone = '電話番号を入力してください';
    }
    
    if (!address.trim()) {
      newErrors.address = '住所を入力してください';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      await updateUserProfile({
        name,
        email,
        phone,
        birthDate: formatDate(birthDate),
        address,
        workplace,
        workplacePhone,
      });
      
      Alert.alert('成功', 'プロフィールが更新されました');
      router.back();
    } catch (error) {
      Alert.alert('エラー', '更新に失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'プロフィール編集',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View style={styles.innerContainer}>
            <ScrollView 
              style={styles.scrollView} 
              contentContainerStyle={styles.contentContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
            >
              <Text style={styles.sectionTitle}>基本情報</Text>
              
              <Input
                label="名前"
                value={name}
                onChangeText={setName}
                placeholder="山田 太郎"
                leftIcon={<User size={20} color={colors.gray} />}
                error={errors.name}
              />
              
              <Input
                label="メールアドレス"
                value={email}
                onChangeText={setEmail}
                placeholder="example@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={<Mail size={20} color={colors.gray} />}
                error={errors.email}
              />
              
              <Input
                label="電話番号"
                value={phone}
                onChangeText={setPhone}
                placeholder="090-1234-5678"
                keyboardType="phone-pad"
                leftIcon={<Phone size={20} color={colors.gray} />}
                error={errors.phone}
              />
              
              <View style={styles.datePickerContainer}>
                <Text style={styles.label}>生年月日</Text>
                <TouchableOpacity 
                  style={styles.datePickerButton} 
                  onPress={showDatepicker}
                >
                  <Calendar size={20} color={colors.gray} />
                  <Text style={styles.dateText}>
                    {formatDate(birthDate)}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={birthDate}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                  />
                )}
              </View>
              
              <Input
                label="住所"
                value={address}
                onChangeText={setAddress}
                placeholder="東京都渋谷区..."
                leftIcon={<MapPin size={20} color={colors.gray} />}
                error={errors.address}
              />
              
              <Text style={styles.sectionTitle}>勤務先情報</Text>
              
              <Input
                label="勤務先"
                value={workplace}
                onChangeText={setWorkplace}
                placeholder="株式会社..."
                leftIcon={<Briefcase size={20} color={colors.gray} />}
              />
              
              <Input
                label="勤務先電話番号"
                value={workplacePhone}
                onChangeText={setWorkplacePhone}
                placeholder="03-1234-5678"
                keyboardType="phone-pad"
                leftIcon={<Phone size={20} color={colors.gray} />}
              />
              
              <Button
                title="保存"
                onPress={handleSave}
                variant="primary"
                size="large"
                loading={isLoading}
                style={styles.saveButton}
              />
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
    padding: 20,
    paddingBottom: 100, // Extra padding at the bottom to ensure scrollability
  },
  backButton: {
    padding: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 16,
  },
  datePickerContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    color: colors.text,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: colors.white,
    gap: 12,
  },
  dateText: {
    fontSize: 16,
    color: colors.text,
  },
  saveButton: {
    marginTop: 24,
    marginBottom: 40,
  },
});