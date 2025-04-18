import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components/Header';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { colors } from '@/constants/colors';
import { useChildStore } from '@/store/child-store';
import { 
  User, 
  Calendar, 
  AlertCircle, 
  Heart, 
  Plus, 
  X, 
  CreditCard,
  FileText
} from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function EditChildScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { children, updateChild } = useChildStore();
  
  const child = children.find(c => c.id === id);
  
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [birthDate, setBirthDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [newAllergy, setNewAllergy] = useState('');
  const [medicalConditions, setMedicalConditions] = useState<string[]>([]);
  const [newMedicalCondition, setNewMedicalCondition] = useState('');
  const [photo, setPhoto] = useState<string | undefined>('');
  const [insuranceCardImage, setInsuranceCardImage] = useState<string | undefined>('');
  const [recipientCertImage, setRecipientCertImage] = useState<string | undefined>('');
  
  useEffect(() => {
    if (child) {
      setName(child.name);
      setGender(child.gender);
      setBirthDate(new Date(child.birthDate));
      setAllergies(child.allergies || []);
      setMedicalConditions(child.medicalConditions || []);
      setPhoto(child.photo);
      setInsuranceCardImage(child.insuranceCardImage);
      setRecipientCertImage(child.recipientCertImage);
    }
  }, [child]);
  
  if (!child) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="子どもの編集" showBackButton />
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>子どもが見つかりません</Text>
          <Button
            title="戻る"
            onPress={() => router.back()}
            variant="primary"
          />
        </View>
      </SafeAreaView>
    );
  }
  
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setBirthDate(selectedDate);
    }
  };
  
  const showDatepicker = () => {
    setShowDatePicker(true);
  };
  
  const addAllergy = () => {
    if (newAllergy.trim() !== '') {
      setAllergies([...allergies, newAllergy.trim()]);
      setNewAllergy('');
    }
  };
  
  const removeAllergy = (index: number) => {
    const newAllergies = [...allergies];
    newAllergies.splice(index, 1);
    setAllergies(newAllergies);
  };
  
  const addMedicalCondition = () => {
    if (newMedicalCondition.trim() !== '') {
      setMedicalConditions([...medicalConditions, newMedicalCondition.trim()]);
      setNewMedicalCondition('');
    }
  };
  
  const removeMedicalCondition = (index: number) => {
    const newConditions = [...medicalConditions];
    newConditions.splice(index, 1);
    setMedicalConditions(newConditions);
  };
  
  const pickImage = async (setter: React.Dispatch<React.SetStateAction<string | undefined>>) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync({
      // Provide a Japanese explanation for the permission request
      iosUseSystemDialog: true
    });
    
    if (permissionResult.granted === false) {
      Alert.alert(
        'アクセス許可が必要です',
        '画像を選択するには、写真へのアクセス許可が必要です。設定アプリから許可を変更できます。',
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
      quality: 0.7,
    });
    
    if (!result.canceled) {
      setter(result.assets[0].uri);
    }
  };
  
  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };
  
  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('エラー', '名前を入力してください');
      return;
    }
    
    const age = calculateAge(birthDate);
    
    updateChild(id, {
      name,
      gender,
      birthDate: birthDate.toISOString().split('T')[0],
      age,
      allergies,
      medicalConditions,
      photo,
      insuranceCardImage,
      recipientCertImage
    });
    
    router.back();
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Header title="子どもの編集" showBackButton />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>基本情報</Text>
          
          <TouchableOpacity 
            style={styles.photoContainer}
            onPress={() => pickImage(setPhoto)}
          >
            {photo ? (
              <Image source={{ uri: photo }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <User size={40} color={colors.white} />
              </View>
            )}
            <Text style={styles.photoText}>写真を変更</Text>
          </TouchableOpacity>
          
          <Input
            label="名前"
            value={name}
            onChangeText={setName}
            placeholder="例: 田中 花"
          />
          
          <Text style={styles.label}>性別</Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[
                styles.genderOption,
                gender === 'male' && styles.genderSelected
              ]}
              onPress={() => setGender('male')}
            >
              <Text style={[
                styles.genderText,
                gender === 'male' && styles.genderTextSelected
              ]}>男の子</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.genderOption,
                gender === 'female' && styles.genderSelected
              ]}
              onPress={() => setGender('female')}
            >
              <Text style={[
                styles.genderText,
                gender === 'female' && styles.genderTextSelected
              ]}>女の子</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.genderOption,
                gender === 'other' && styles.genderSelected
              ]}
              onPress={() => setGender('other')}
            >
              <Text style={[
                styles.genderText,
                gender === 'other' && styles.genderTextSelected
              ]}>その他</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.label}>誕生日</Text>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={showDatepicker}
          >
            <Calendar size={20} color={colors.primary} />
            <Text style={styles.dateText}>
              {birthDate.toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={birthDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
              locale="ja-JP"
            />
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>医療情報</Text>
          
          <Text style={styles.label}>アレルギー</Text>
          <View style={styles.tagContainer}>
            {allergies.map((allergy, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{allergy}</Text>
                <TouchableOpacity
                  onPress={() => removeAllergy(index)}
                  style={styles.tagRemove}
                >
                  <X size={14} color={colors.white} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          
          <View style={styles.addItemContainer}>
            <Input
              value={newAllergy}
              onChangeText={setNewAllergy}
              placeholder="アレルギーを追加"
              containerStyle={{ flex: 1, marginBottom: 0 }}
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={addAllergy}
            >
              <Plus size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.label, { marginTop: 16 }]}>既往症</Text>
          <View style={styles.tagContainer}>
            {medicalConditions.map((condition, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{condition}</Text>
                <TouchableOpacity
                  onPress={() => removeMedicalCondition(index)}
                  style={styles.tagRemove}
                >
                  <X size={14} color={colors.white} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          
          <View style={styles.addItemContainer}>
            <Input
              value={newMedicalCondition}
              onChangeText={setNewMedicalCondition}
              placeholder="既往症を追加"
              containerStyle={{ flex: 1, marginBottom: 0 }}
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={addMedicalCondition}
            >
              <Plus size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>書類情報</Text>
          
          <Text style={styles.label}>保険証</Text>
          <TouchableOpacity 
            style={styles.documentContainer}
            onPress={() => pickImage(setInsuranceCardImage)}
          >
            {insuranceCardImage ? (
              <View style={styles.documentImageContainer}>
                <Image source={{ uri: insuranceCardImage }} style={styles.documentImage} />
                <Text style={styles.documentText}>保険証の画像を変更</Text>
              </View>
            ) : (
              <View style={styles.documentPlaceholder}>
                <CreditCard size={30} color={colors.primary} />
                <Text style={styles.documentPlaceholderText}>保険証をアップロードしてください</Text>
              </View>
            )}
          </TouchableOpacity>
          
          <Text style={[styles.label, { marginTop: 16 }]}>受給者証</Text>
          <TouchableOpacity 
            style={styles.documentContainer}
            onPress={() => pickImage(setRecipientCertImage)}
          >
            {recipientCertImage ? (
              <View style={styles.documentImageContainer}>
                <Image source={{ uri: recipientCertImage }} style={styles.documentImage} />
                <Text style={styles.documentText}>受給者証の画像を変更</Text>
              </View>
            ) : (
              <View style={styles.documentPlaceholder}>
                <FileText size={30} color={colors.primary} />
                <Text style={styles.documentPlaceholderText}>受給者証をアップロードしてください</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.buttonContainer}>
          <Button
            title="保存"
            onPress={handleSave}
            variant="primary"
          />
          <Button
            title="キャンセル"
            onPress={() => router.back()}
            variant="outline"
            style={{ marginTop: 12 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  scrollView: {
    flex: 1,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notFoundText: {
    fontSize: 18,
    color: colors.textLight,
    marginBottom: 20,
  },
  section: {
    backgroundColor: colors.white,
    padding: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 8,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  photoText: {
    fontSize: 14,
    color: colors.primary,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  genderContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  genderSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  genderText: {
    color: colors.text,
  },
  genderTextSelected: {
    color: colors.primary,
    fontWeight: '500',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginBottom: 16,
    gap: 10,
  },
  dateText: {
    fontSize: 16,
    color: colors.text,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 6,
  },
  tagText: {
    color: colors.white,
    fontSize: 14,
  },
  tagRemove: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  documentPlaceholder: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
  },
  documentPlaceholderText: {
    marginTop: 8,
    color: colors.primary,
    fontSize: 14,
  },
  documentImageContainer: {
    alignItems: 'center',
  },
  documentImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  documentText: {
    padding: 8,
    color: colors.primary,
    fontSize: 14,
  },
  buttonContainer: {
    padding: 20,
  },
});