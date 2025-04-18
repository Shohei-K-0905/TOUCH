import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components/Header';
import { ChildCard } from '@/components/ChildCard';
import { SelectionCard } from '@/components/SelectionCard';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { colors } from '@/constants/colors';
import { useChildStore } from '@/store/child-store';
import { useDaycareStore } from '@/store/daycare-store';
import { useClinicStore } from '@/store/clinic-store';
import { useAppointmentStore } from '@/store/appointment-store';
import { Calendar, Clock, FileText, Building, Hospital } from 'lucide-react-native';

export default function NewAppointmentScreen() {
  const router = useRouter();
  const { children, selectedChildId, selectChild } = useChildStore();
  const { daycares, selectedDaycareIds } = useDaycareStore();
  const { clinics, selectedClinicIds } = useClinicStore();
  const { 
    addAppointment
  } = useAppointmentStore();
  
  // 選択済みの保育園とクリニックを取得
  const availableDaycares = daycares.filter(d => selectedDaycareIds.includes(d.id));
  const availableClinics = clinics.filter(c => selectedClinicIds.includes(c.id));
  
  const [selectedDaycareId, setSelectedDaycareId] = useState<string | null>(null);
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // 保育園やクリニックが登録されていない場合のメッセージ
  const showRegistrationMessage = availableDaycares.length === 0 || availableClinics.length === 0;
  
  const handleChildSelect = (childId: string) => {
    selectChild(childId);
  };
  
  const handleDaycareSelect = (daycareId: string) => {
    setSelectedDaycareId(daycareId);
  };
  
  const handleClinicSelect = (clinicId: string) => {
    setSelectedClinicId(clinicId);
  };
  
  const handleCreateAppointment = () => {
    if (!selectedChildId || !selectedDaycareId || !selectedClinicId || !date || !time) {
      alert('必須項目をすべて入力してください');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const appointmentId = addAppointment({
        childId: selectedChildId,
        daycareId: selectedDaycareId,
        clinicId: selectedClinicId,
        doctorId: "", // 医師選択を削除したため空文字列を設定
        date,
        time,
        notes,
      });
      
      router.replace(`/appointment/${appointmentId}`);
    } catch (error) {
      console.error('Failed to create appointment:', error);
      alert('予約の作成に失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Header title="新規予約" showBackButton />
      
      <ScrollView style={styles.scrollView}>
        {showRegistrationMessage ? (
          <View style={styles.warningSection}>
            <Text style={styles.warningTitle}>
              {availableDaycares.length === 0 && availableClinics.length === 0
                ? "保育園とクリニックを登録してください"
                : availableDaycares.length === 0
                ? "保育園を登録してください"
                : "クリニックを登録してください"}
            </Text>
            <Text style={styles.warningText}>
              予約を作成するには、まずプロフィール画面で保育園とクリニックを登録してください。
            </Text>
            <Button
              title="プロフィールへ移動"
              onPress={() => router.push('/profile')}
              variant="primary"
              style={styles.warningButton}
            />
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1. お子様を選択</Text>
              
              <View style={styles.childrenContainer}>
                {children.map(child => (
                  <ChildCard
                    key={child.id}
                    child={child}
                    selected={child.id === selectedChildId}
                    onPress={() => handleChildSelect(child.id)}
                  />
                ))}
              </View>
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. 保育園を選択</Text>
              
              <View style={styles.selectionContainer}>
                {availableDaycares.map(daycare => (
                  <SelectionCard
                    key={daycare.id}
                    title={daycare.name}
                    subtitle={daycare.address}
                    selected={daycare.id === selectedDaycareId}
                    onPress={() => handleDaycareSelect(daycare.id)}
                    icon={<Building size={20} color={daycare.id === selectedDaycareId ? colors.white : colors.gray} />}
                  />
                ))}
              </View>
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>3. クリニックを選択</Text>
              
              <View style={styles.selectionContainer}>
                {availableClinics.map(clinic => (
                  <SelectionCard
                    key={clinic.id}
                    title={clinic.name}
                    subtitle={`専門: ${clinic.specialties.join(', ')}`}
                    selected={clinic.id === selectedClinicId}
                    onPress={() => handleClinicSelect(clinic.id)}
                    icon={<Hospital size={20} color={clinic.id === selectedClinicId ? colors.white : colors.gray} />}
                  />
                ))}
              </View>
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>4. 日程</Text>
              
              <View style={styles.scheduleContainer}>
                <Input
                  label="日付"
                  placeholder="YYYY-MM-DD"
                  value={date}
                  onChangeText={setDate}
                  leftIcon={<Calendar size={20} color={colors.gray} />}
                  containerStyle={styles.dateInput}
                />
                
                <Input
                  label="時間"
                  placeholder="HH:MM"
                  value={time}
                  onChangeText={setTime}
                  leftIcon={<Clock size={20} color={colors.gray} />}
                  containerStyle={styles.timeInput}
                />
              </View>
              
              <Input
                label="メモ（任意）"
                placeholder="予約に関するメモを追加"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                leftIcon={<FileText size={20} color={colors.gray} />}
                inputStyle={styles.notesInput}
              />
            </View>
            
            <View style={styles.buttonContainer}>
              <Button
                title="予約を作成"
                onPress={handleCreateAppointment}
                loading={isLoading}
                disabled={!selectedChildId || !selectedDaycareId || !selectedClinicId || !date || !time}
              />
            </View>
          </>
        )}
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
  warningSection: {
    margin: 20,
    padding: 20,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.warning,
    alignItems: 'center',
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.warning,
    marginBottom: 12,
    textAlign: 'center',
  },
  warningText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  warningButton: {
    minWidth: 200,
  },
  section: {
    padding: 16,
    backgroundColor: colors.white,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  childrenContainer: {
    gap: 8,
  },
  selectionContainer: {
    gap: 8,
  },
  scheduleContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dateInput: {
    flex: 3,
  },
  timeInput: {
    flex: 2,
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: colors.white,
    marginBottom: 24,
  },
});