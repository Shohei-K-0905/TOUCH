import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components/Header';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { colors } from '@/constants/colors';
import { useChildStore } from '@/store/child-store';
import { User, Calendar, AlertCircle, Heart, Plus, CreditCard, FileText } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useAuthStore } from '@/store/auth-store';
import { auth, storage } from '@/src/firebase';

export default function AddChildScreen() {
  const router = useRouter();
  const { addChild } = useChildStore();
  const { user } = useAuthStore();

  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [allergies, setAllergies] = useState('');
  const [medicalConditions, setMedicalConditions] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [insuranceCardImage, setInsuranceCardImage] = useState<string | null>(null);
  const [recipientCertImage, setRecipientCertImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddPhoto = async () => {
    if (Platform.OS === 'web') {
      alert('写真のアップロードはウェブでは利用できません');
      return;
    }
    
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync({
      iosUseSystemDialog: true
    });
    
    if (permissionResult.granted === false) {
      Alert.alert(
        'アクセス許可が必要です',
        'お子様の写真をアップロードするには、写真へのアクセス許可が必要です。設定アプリから許可を変更できます。',
        [
          { text: 'キャンセル', style: 'cancel' },
          { text: '設定を開く', onPress: () => ImagePicker.openSettings() }
        ]
      );
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    
    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  const handleAddInsuranceCard = async () => {
    if (Platform.OS === 'web') {
      alert('写真のアップロードはウェブでは利用できません');
      return;
    }
    
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync({
      iosUseSystemDialog: true
    });
    
    if (permissionResult.granted === false) {
      Alert.alert(
        'アクセス許可が必要です',
        '保険証の画像をアップロードするには、写真へのアクセス許可が必要です。設定アプリから許可を変更できます。',
        [
          { text: 'キャンセル', style: 'cancel' },
          { text: '設定を開く', onPress: () => ImagePicker.openSettings() }
        ]
      );
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });
    
    if (!result.canceled) {
      setInsuranceCardImage(result.assets[0].uri);
    }
  };

  const handleAddRecipientCert = async () => {
    if (Platform.OS === 'web') {
      alert('写真のアップロードはウェブでは利用できません');
      return;
    }
    
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync({
      iosUseSystemDialog: true
    });
    
    if (permissionResult.granted === false) {
      Alert.alert(
        'アクセス許可が必要です',
        '受給者証の画像をアップロードするには、写真へのアクセス許可が必要です。設定アプリから許可を変更できます。',
        [
          { text: 'キャンセル', style: 'cancel' },
          { text: '設定を開く', onPress: () => ImagePicker.openSettings() }
        ]
      );
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });
    
    if (!result.canceled) {
      setRecipientCertImage(result.assets[0].uri);
    }
  };

  const uploadImageAsync = async (uri: string, path: string): Promise<string | null> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, blob);

      await uploadTask; 

      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
      return downloadURL;
    } catch (e) {
      console.error("Upload failed:", e);
      Alert.alert('アップロードエラー', '画像のアップロードに失敗しました。');
      return null;
    }
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleSave = async () => {
    if (!name || !birthDate) {
      alert('名前と生年月日は必須項目です');
      return;
    }
    if (!user) {
      Alert.alert('エラー', 'ユーザー情報が見つかりません。再ログインしてください。');
      return;
    }
    
    if (!user.id) {
      Alert.alert('エラー', 'ユーザーIDが見つかりません。データの整合性に問題がある可能性があります。');
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    let photoURL = photo;
    let insuranceCardImageURL = insuranceCardImage;
    let recipientCertImageURL = recipientCertImage;
    const childId = Date.now().toString();
    const userId = user.id;

    try {
      if (photo && photo.startsWith('file://')) {
        const path = `child_photos/${userId}/${childId}/photo.jpg`;
        photoURL = await uploadImageAsync(photo, path);
        if (!photoURL) throw new Error('Photo upload failed');
      }
      if (insuranceCardImage && insuranceCardImage.startsWith('file://')) {
        const path = `child_documents/${userId}/${childId}/insurance_card.jpg`;
        insuranceCardImageURL = await uploadImageAsync(insuranceCardImage, path);
        if (!insuranceCardImageURL) throw new Error('Insurance card upload failed');
      }
      if (recipientCertImage && recipientCertImage.startsWith('file://')) {
        const path = `child_documents/${userId}/${childId}/recipient_cert.jpg`;
        recipientCertImageURL = await uploadImageAsync(recipientCertImage, path);
        if (!recipientCertImageURL) throw new Error('Recipient certificate upload failed');
      }
      
      const childData = {
        id: childId,
        parentId: userId,
        name,
        birthDate,
        age: calculateAge(birthDate),
        gender,
        allergies: allergies ? allergies.split(',').map(a => a.trim()).filter(a => a) : [],
        medicalConditions: medicalConditions ? medicalConditions.split(',').map(m => m.trim()).filter(m => m) : [],
        photo: photoURL,
        insuranceCardImage: insuranceCardImageURL,
        recipientCertImage: recipientCertImageURL,
      };

      addChild(childData);

      router.back();
    } catch (error) {
      console.error('Failed to add child:', error);
      alert('子どもの追加に失敗しました。もう一度お試しください。');
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
            <Header title="子どもを追加" showBackButton />
            
            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.contentContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
            >
              <View style={styles.photoSection}>
                <TouchableOpacity style={styles.photoContainer} onPress={handleAddPhoto}>
                  {photo ? (
                    <Image source={{ uri: photo }} style={styles.photo} />
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <Plus size={32} color={colors.white} />
                    </View>
                  )}
                </TouchableOpacity>
                <Text style={styles.photoText}>写真を追加</Text>
              </View>
              
              <View style={styles.formSection}>
                <Input
                  label="氏名 *"
                  placeholder="お子様の氏名を入力"
                  value={name}
                  onChangeText={setName}
                  leftIcon={<User size={20} color={colors.gray} />}
                />
                
                <Input
                  label="生年月日 *"
                  placeholder="YYYY-MM-DD"
                  value={birthDate}
                  onChangeText={setBirthDate}
                  leftIcon={<Calendar size={20} color={colors.gray} />}
                />
                
                <Text style={styles.label}>性別</Text>
                <View style={styles.genderContainer}>
                  <TouchableOpacity
                    style={[
                      styles.genderOption,
                      gender === 'male' && styles.genderOptionSelected,
                    ]}
                    onPress={() => setGender('male')}
                  >
                    <Text
                      style={[
                        styles.genderText,
                        gender === 'male' && styles.genderTextSelected,
                      ]}
                    >
                      男の子
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.genderOption,
                      gender === 'female' && styles.genderOptionSelected,
                    ]}
                    onPress={() => setGender('female')}
                  >
                    <Text
                      style={[
                        styles.genderText,
                        gender === 'female' && styles.genderTextSelected,
                      ]}
                    >
                      女の子
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.genderOption,
                      gender === 'other' && styles.genderOptionSelected,
                    ]}
                    onPress={() => setGender('other')}
                  >
                    <Text
                      style={[
                        styles.genderText,
                        gender === 'other' && styles.genderTextSelected,
                      ]}
                    >
                      その他
                    </Text>
                  </TouchableOpacity>
                </View>
                
                <Input
                  label="アレルギー（任意）"
                  placeholder="アレルギーをカンマ区切りで入力"
                  value={allergies}
                  onChangeText={setAllergies}
                  leftIcon={<AlertCircle size={20} color={colors.gray} />}
                />
                
                <Input
                  label="既往症（任意）"
                  placeholder="既往症をカンマ区切りで入力"
                  value={medicalConditions}
                  onChangeText={setMedicalConditions}
                  leftIcon={<Heart size={20} color={colors.gray} />}
                />
              </View>

              <View style={styles.documentSection}>
                <Text style={styles.sectionTitle}>医療書類</Text>
                
                <View style={styles.documentItem}>
                  <Text style={styles.documentLabel}>保険証</Text>
                  <TouchableOpacity 
                    style={styles.documentUpload} 
                    onPress={handleAddInsuranceCard}
                  >
                    {insuranceCardImage ? (
                      <Image 
                        source={{ uri: insuranceCardImage }} 
                        style={styles.documentImage} 
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.documentPlaceholder}>
                        <CreditCard size={24} color={colors.gray} />
                        <Text style={styles.documentPlaceholderText}>
                          保険証をアップロードしてください
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
                
                <View style={styles.documentItem}>
                  <Text style={styles.documentLabel}>受給者証</Text>
                  <TouchableOpacity 
                    style={styles.documentUpload} 
                    onPress={handleAddRecipientCert}
                  >
                    {recipientCertImage ? (
                      <Image 
                        source={{ uri: recipientCertImage }} 
                        style={styles.documentImage} 
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.documentPlaceholder}>
                        <FileText size={24} color={colors.gray} />
                        <Text style={styles.documentPlaceholderText}>
                          受給者証をアップロードしてください
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.buttonContainer}>
                <Button
                  title="プロフィールを保存"
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
    paddingBottom: 100, 
  },
  photoSection: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.white,
  },
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: 12,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  formSection: {
    padding: 16,
    backgroundColor: colors.white,
    marginTop: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    color: colors.text,
  },
  genderContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  genderOptionSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  genderText: {
    color: colors.text,
  },
  genderTextSelected: {
    color: colors.primary,
    fontWeight: '500',
  },
  documentSection: {
    padding: 16,
    backgroundColor: colors.white,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: colors.text,
  },
  documentItem: {
    marginBottom: 16,
  },
  documentLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: colors.text,
  },
  documentUpload: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: 'hidden',
    height: 160,
  },
  documentImage: {
    width: '100%',
    height: '100%',
  },
  documentPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  documentPlaceholderText: {
    color: colors.textLight,
    marginTop: 8,
    textAlign: 'center',
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: colors.white,
    marginTop: 12,
    marginBottom: 24,
  },
});