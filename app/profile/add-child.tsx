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
import * as Linking from 'expo-linking';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useAuthStore } from '@/store/auth-store';
import { auth, storage } from '@/src/firebase';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

export default function AddChildScreen() {
  const router = useRouter();
  const { addChild } = useChildStore();
  const { user } = useAuthStore();

  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
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
    
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        'アクセス許可が必要です',
        'お子様の写真をアップロードするには、写真へのアクセス許可が必要です。設定アプリから許可を変更できます。',
        [
          { text: 'キャンセル', style: 'cancel' },
          { text: '設定を開く', onPress: () => Linking.openSettings() }
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
    console.log('[handleAddInsuranceCard] Function called');
    if (Platform.OS === 'web') {
      alert('写真のアップロードはウェブでは利用できません');
      return;
    }
    
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        'アクセス許可が必要です',
        '保険証の画像をアップロードするには、写真へのアクセス許可が必要です。設定アプリから許可を変更できます。',
        [
          { text: 'キャンセル', style: 'cancel' },
          { text: '設定を開く', onPress: () => Linking.openSettings() }
        ]
      );
      return;
    }
    
    console.log('[handleAddInsuranceCard] Launching image library...');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });
    
    if (!result.canceled) {
      console.log('[handleAddInsuranceCard] Image selected:', result.assets[0].uri);
      setInsuranceCardImage(result.assets[0].uri);
    } else {
      console.log('[handleAddInsuranceCard] Image selection cancelled.');
    }
  };

  const handleAddRecipientCert = async () => {
    console.log('[handleAddRecipientCert] Function called');
    if (Platform.OS === 'web') {
      alert('写真のアップロードはウェブでは利用できません');
      return;
    }
    
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        'アクセス許可が必要です',
        '受給者証の画像をアップロードするには、写真へのアクセス許可が必要です。設定アプリから許可を変更できます。',
        [
          { text: 'キャンセル', style: 'cancel' },
          { text: '設定を開く', onPress: () => Linking.openSettings() }
        ]
      );
      return;
    }
    
    console.log('[handleAddRecipientCert] Launching image library...');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });
    
    if (!result.canceled) {
      console.log('[handleAddRecipientCert] Image selected:', result.assets[0].uri);
      setRecipientCertImage(result.assets[0].uri);
    } else {
      console.log('[handleAddRecipientCert] Image selection cancelled.');
    }
  };

  const uploadImageAsync = async (uri: string, path: string): Promise<string | null> => {
    console.log(`[uploadImageAsync] Starting upload for path: ${path}`);
    try {
      // 1. Create blob from URI
      const blob: Blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
          console.log('[uploadImageAsync] Blob created successfully');
          resolve(xhr.response);
        };
        xhr.onerror = function (e) {
          console.error('[uploadImageAsync] Blob creation failed:', e);
          reject(new Error('Blob creation failed'));
        };
        xhr.responseType = 'blob';
        xhr.open('GET', uri, true);
        xhr.send(null);
      });

      // 2. Upload blob using uploadTask and wrap in a Promise
      return new Promise((resolve, reject) => { 
        const storageRef = ref(storage, path);
        console.log(`[uploadImageAsync] Storage reference created: ${storageRef.fullPath}`);

        const uploadTask = uploadBytesResumable(storageRef, blob);

        uploadTask.on('state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`[uploadImageAsync] Upload is ${progress}% done for ${path}`);
          },
          (error) => {
            console.error(`[uploadImageAsync] Upload failed for ${path}:`, error);
            if (error.code) {
              console.error(`[uploadImageAsync] Firebase Error Code: ${error.code}`);
              console.error(`[uploadImageAsync] Firebase Error Name: ${error.name}`);
            }
            // Reject the outer promise on upload error
            reject(error); 
          },
          async () => {
            // Handle successful uploads on complete
            console.log(`[uploadImageAsync] Upload successful for ${path}`);

            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              console.log(`[uploadImageAsync] Download URL obtained: ${downloadURL}`);
              // Resolve the outer promise with the download URL
              resolve(downloadURL);
            } catch (getUrlError) {
              console.error(`[uploadImageAsync] Failed to get download URL for ${path}:`, getUrlError);
              reject(getUrlError); // Reject if getting URL fails
            }
          }
        );
      }); // End of the new Promise wrapping uploadTask

    } catch (error) {
      console.error(`[uploadImageAsync] Error during upload process for ${path}:`, error);
      Alert.alert('アップロードエラー', `画像のアップロード中にエラーが発生しました: ${(error as Error).message}`);
      return null; // Indicate failure - Ensure this path returns null
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
    console.log('[handleSave] Function called');
    if (!name || !birthDate) {
      alert('名前と生年月日は必須項目です');
      console.log('[handleSave] Validation Error: Missing name or birthDate');
      return;
    }
    if (!user) {
      Alert.alert('エラー', 'ユーザー情報が見つかりません。再ログインしてください。');
      console.error('[handleSave] Error: user is missing');
      return;
    }
    
    if (!user.id) {
      Alert.alert('エラー', 'ユーザーIDが見つかりません。データの整合性に問題がある可能性があります。');
      console.error('[handleSave] Error: user ID is missing');
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    console.log('[handleSave] setIsLoading(true)');

    try {
      let photoURL = photo;
      let insuranceCardImageURL = insuranceCardImage;
      let recipientCertImageURL = recipientCertImage;
      const childId = Date.now().toString();
      const userId = user.id;

      if (photo && photo.startsWith('file://')) {
        console.log('[handleSave] Starting photo upload...');
        const path = `child_photos/${userId}/${childId}/photo.jpg`;
        photoURL = await uploadImageAsync(photo, path);
        if (!photoURL) {
          console.error('[handleSave] Photo upload failed, stopping save.');
          throw new Error('Photo upload failed');
        }
        console.log('[handleSave] Photo upload successful:', photoURL);
      }

      if (insuranceCardImage && insuranceCardImage.startsWith('file://')) {
        console.log('[handleSave] Starting insurance card upload...');
        const path = `child_documents/${userId}/${childId}/insurance_card.jpg`;
        insuranceCardImageURL = await uploadImageAsync(insuranceCardImage, path);
        if (!insuranceCardImageURL) {
          console.error('[handleSave] Insurance card upload failed, stopping save.');
          throw new Error('Insurance card upload failed');
        }
        console.log('[handleSave] Insurance card upload successful:', insuranceCardImageURL);
      }

      if (recipientCertImage && recipientCertImage.startsWith('file://')) {
        console.log('[handleSave] Starting recipient certificate upload...');
        const path = `child_documents/${userId}/${childId}/recipient_cert.jpg`;
        recipientCertImageURL = await uploadImageAsync(recipientCertImage, path);
        if (!recipientCertImageURL) {
          console.error('[handleSave] Recipient certificate upload failed, stopping save.');
          throw new Error('Recipient certificate upload failed');
        }
        console.log('[handleSave] Recipient certificate upload successful:', recipientCertImageURL);
      }

      const birthDateString = formatDate(birthDate);

      const childData = {
        id: childId,
        parentId: userId,
        name,
        birthDate: birthDateString,
        age: calculateAge(birthDateString),
        gender,
        allergies: allergies ? allergies.split(',').map(a => a.trim()).filter(a => a) : [],
        medicalConditions: medicalConditions ? medicalConditions.split(',').map(m => m.trim()).filter(m => m) : [],
        photo: photoURL,
        insuranceCardImage: insuranceCardImageURL,
        recipientCertImage: recipientCertImageURL,
      };

      console.log('[handleSave] Child data prepared:', childData);

      console.log('[handleSave] Calling addChild store function...');
      await addChild(childData);
      console.log('[handleSave] addChild store function successful');

      router.back();
    } catch (error) {
      console.error('[handleSave] Failed to add child:', error);
      alert('子どもの追加に失敗しました。もう一度お試しください。');
    } finally {
      console.log('[handleSave] Entering finally block');
      setIsLoading(false);
      console.log('[handleSave] setIsLoading(false)');
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false); 
    if (event.type === 'set' && selectedDate) {
      setBirthDate(selectedDate); 
    }
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
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
                
                <Text style={styles.label}>生年月日</Text>
                <TouchableOpacity onPress={showDatepicker} style={styles.datePickerButton}>
                  <View style={styles.inputContainer}> 
                    <Calendar size={20} color={colors.gray} />
                    <Text style={[styles.datePickerText, !birthDate && styles.placeholderText]}>
                      {birthDate ? formatDate(birthDate) : 'YYYY-MM-DD'}
                    </Text>
                  </View>
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    testID="dateTimePicker"
                    value={birthDate || new Date()} 
                    mode={'date'}
                    is24Hour={true}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'} 
                    onChange={onDateChange}
                    maximumDate={new Date()} 
                    locale="ja-JP" // Add locale for Japanese format preference
                  />
                )}

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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10, 
    borderWidth: 1,
    borderColor: colors.border,
  },
  datePickerButton: {
    marginBottom: 16, 
  },
  datePickerText: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.text, 
  },
  placeholderText: {
    color: colors.gray, 
  },
});