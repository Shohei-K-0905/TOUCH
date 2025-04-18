import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components/Header';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { colors } from '@/constants/colors';
import { useDaycareStore } from '@/store/daycare-store';
import { Building, MapPin, Phone, Mail, User, Trash2 } from 'lucide-react-native';

export default function EditDaycareScreen() {
  // Get the ID from URL params and log it
  const params = useLocalSearchParams<{ id: string }>();
  const id = params.id;
  console.log(`Editing daycare with id: ${id}`);
  
  const router = useRouter();
  const { daycares, updateDaycare, deleteDaycare, unselectDaycare } = useDaycareStore();
  
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // エラー状態
  const [errors, setErrors] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
  });
  
  // 保育施設データの取得
  useEffect(() => {
    console.log(`Loading daycare with id: ${id}`);
    console.log(`Available daycares: ${daycares.length} total`);
    console.log(`Daycare IDs: ${daycares.map(d => d.id).join(', ')}`);
    
    const daycare = daycares.find(d => d.id === id);
    console.log(`Found daycare:`, daycare);
    
    if (daycare) {
      setName(daycare.name);
      setAddress(daycare.address);
      setPhone(daycare.phone);
      setEmail(daycare.email);
      setContactPerson(daycare.contactPerson || '');
    } else {
      Alert.alert('エラー', '保育施設が見つかりません');
      router.back();
    }
  }, [id, daycares]);
  
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
  
  const handleUpdate = () => {
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      updateDaycare(id, {
        name,
        address,
        phone,
        email,
        contactPerson,
      });
      
      router.back();
    } catch (error) {
      console.error('Failed to update daycare:', error);
      Alert.alert('エラー', '保育施設の更新に失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = () => {
    console.log(`Attempting to delete daycare with id: ${id}`);
    
    Alert.alert(
      "保育施設を削除",
      "この保育施設を削除してもよろしいですか？",
      [
        {
          text: "キャンセル",
          style: "cancel"
        },
        {
          text: "削除",
          onPress: () => {
            setIsDeleting(true);
            
            try {
              console.log(`Deleting daycare with id: ${id}`);
              
              // First unselect the daycare if it's selected
              unselectDaycare(id);
              console.log(`Unselected daycare with id: ${id}`);
              
              // Then delete the daycare
              deleteDaycare(id);
              console.log(`Deleted daycare with id: ${id}`);
              
              // Navigate away after deletion
              setTimeout(() => {
                router.replace('/');
              }, 500);
            } catch (error) {
              console.error(`Error deleting daycare with id: ${id}:`, error);
              Alert.alert('エラー', '保育施設の削除に失敗しました。もう一度お試しください。');
              setIsDeleting(false);
            }
          },
          style: "destructive"
        }
      ]
    );
  };
  
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };
  
  if (isDeleting) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>保育施設を削除中...</Text>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View style={styles.innerContainer}>
            <Header title="保育施設を編集" showBackButton />
            
            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.contentContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
            >
              <View style={styles.formSection}>
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
                  title="保存"
                  onPress={handleUpdate}
                  loading={isLoading}
                />
                
                <Button
                  title="保育施設を削除"
                  onPress={handleDelete}
                  variant="outline"
                  style={styles.deleteButton}
                  textStyle={{ color: colors.error }}
                  icon={<Trash2 size={16} color={colors.error} />}
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
  buttonContainer: {
    padding: 20,
    backgroundColor: colors.white,
    marginTop: 12,
    marginBottom: 24,
    gap: 16,
  },
  deleteButton: {
    borderColor: colors.error,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text,
  },
});