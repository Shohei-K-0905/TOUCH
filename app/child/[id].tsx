import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { colors } from '@/constants/colors';
import { useChildStore } from '@/store/child-store';
import { useAppointmentStore } from '@/store/appointment-store';
import { 
  Calendar, 
  Clock, 
  AlertCircle, 
  Edit, 
  Trash2, 
  User, 
  Cake,
  Heart,
  CreditCard,
  FileText
} from 'lucide-react-native';

export default function ChildDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const { children, deleteChild } = useChildStore();
  const { appointments, daycares, clinics, doctors } = useAppointmentStore();
  
  const child = children.find(c => c.id === id);
  
  if (!child) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="子どもの詳細" showBackButton />
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
  
  const childAppointments = appointments
    .filter(a => a.childId === id && a.status === 'scheduled')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 2);
  
  const handleEditChild = () => {
    router.push(`/profile/edit-child/${id}`);
  };
  
  const handleDeleteChild = () => {
    deleteChild(id);
    router.back();
  };
  
  const handleNewAppointment = () => {
    router.push('/appointments/new');
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
  
  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="子どもの詳細" 
        showBackButton
        rightComponent={
          <TouchableOpacity onPress={handleEditChild} style={styles.editButton}>
            <Edit size={20} color={colors.primary} />
          </TouchableOpacity>
        }
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            {child.photo ? (
              <Image source={{ uri: child.photo }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <User size={40} color={colors.white} />
              </View>
            )}
            
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{child.name}</Text>
              <Text style={styles.profileAge}>{child.age}歳</Text>
              
              <View style={styles.profileDetail}>
                <Cake size={16} color={colors.textLight} />
                <Text style={styles.profileDetailText}>
                  誕生日: {formatDate(child.birthDate)}
                </Text>
              </View>
              
              <View style={styles.profileDetail}>
                <User size={16} color={colors.textLight} />
                <Text style={styles.profileDetailText}>
                  性別: {child.gender === 'male' ? '男の子' : child.gender === 'female' ? '女の子' : 'その他'}
                </Text>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>医療情報</Text>
          
          <Card variant="outlined" style={styles.card}>
            <View style={styles.medicalInfo}>
              <Text style={styles.medicalInfoTitle}>アレルギー</Text>
              {child.allergies && child.allergies.length > 0 ? (
                child.allergies.map((allergy, index) => (
                  <View key={index} style={styles.medicalItem}>
                    <AlertCircle size={16} color={colors.warning} />
                    <Text style={styles.medicalItemText}>{allergy}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyMedicalText}>アレルギーなし</Text>
              )}
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.medicalInfo}>
              <Text style={styles.medicalInfoTitle}>既往症</Text>
              {child.medicalConditions && child.medicalConditions.length > 0 ? (
                child.medicalConditions.map((condition, index) => (
                  <View key={index} style={styles.medicalItem}>
                    <Heart size={16} color={colors.error} />
                    <Text style={styles.medicalItemText}>{condition}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyMedicalText}>既往症なし</Text>
              )}
            </View>
          </Card>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>書類情報</Text>
          
          <Card variant="outlined" style={styles.card}>
            <View style={styles.documentInfo}>
              <Text style={styles.documentInfoTitle}>保険証</Text>
              {child.insuranceCardImage ? (
                <View style={styles.documentImageContainer}>
                  <Image source={{ uri: child.insuranceCardImage }} style={styles.documentImage} />
                </View>
              ) : (
                <View style={styles.documentPlaceholder}>
                  <CreditCard size={24} color={colors.textLight} />
                  <Text style={styles.emptyDocumentText}>保険証をアップロードしてください</Text>
                </View>
              )}
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.documentInfo}>
              <Text style={styles.documentInfoTitle}>受給者証</Text>
              {child.recipientCertImage ? (
                <View style={styles.documentImageContainer}>
                  <Image source={{ uri: child.recipientCertImage }} style={styles.documentImage} />
                </View>
              ) : (
                <View style={styles.documentPlaceholder}>
                  <FileText size={24} color={colors.textLight} />
                  <Text style={styles.emptyDocumentText}>受給者証をアップロードしてください</Text>
                </View>
              )}
            </View>
          </Card>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>今後の予約</Text>
            <TouchableOpacity onPress={handleNewAppointment}>
              <Text style={styles.sectionAction}>予約する</Text>
            </TouchableOpacity>
          </View>
          
          {childAppointments.length > 0 ? (
            childAppointments.map(appointment => {
              const daycare = daycares.find(d => d.id === appointment.daycareId);
              const clinic = clinics.find(c => c.id === appointment.clinicId);
              const doctor = doctors.find(d => d.id === appointment.doctorId);
              
              if (!daycare || !clinic || !doctor) return null;
              
              return (
                <Card key={appointment.id} variant="elevated" style={styles.appointmentCard}>
                  <View style={styles.appointmentHeader}>
                    <View style={styles.appointmentDate}>
                      <Calendar size={16} color={colors.primary} />
                      <Text style={styles.appointmentDateText}>
                        {formatDate(appointment.date)}
                      </Text>
                    </View>
                    <View style={styles.appointmentTime}>
                      <Clock size={16} color={colors.primary} />
                      <Text style={styles.appointmentTimeText}>
                        {appointment.time}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.appointmentDetails}>
                    <Text style={styles.appointmentDoctor}>
                      {doctor.name}先生
                    </Text>
                    <Text style={styles.appointmentClinic}>
                      {clinic.name}
                    </Text>
                    {appointment.notes && (
                      <Text style={styles.appointmentNotes}>
                        メモ: {appointment.notes}
                      </Text>
                    )}
                  </View>
                </Card>
              );
            })
          ) : (
            <Card variant="outlined" style={styles.emptyCard}>
              <Text style={styles.emptyText}>今後の予約はありません</Text>
              <Button
                title="予約を作成"
                onPress={handleNewAppointment}
                variant="outline"
                size="small"
                icon={<Calendar size={16} color={colors.primary} />}
                style={styles.emptyButton}
              />
            </Card>
          )}
        </View>
        
        <View style={styles.deleteSection}>
          <Button
            title="子どものプロフィールを削除"
            onPress={handleDeleteChild}
            variant="outline"
            style={styles.deleteButton}
            textStyle={{ color: colors.error }}
            icon={<Trash2 size={16} color={colors.error} />}
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
  editButton: {
    padding: 4,
  },
  profileSection: {
    backgroundColor: colors.white,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 20,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  profileAge: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 12,
  },
  profileDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  profileDetailText: {
    fontSize: 14,
    color: colors.textLight,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  sectionAction: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  card: {
    padding: 16,
  },
  medicalInfo: {
    marginBottom: 8,
  },
  medicalInfoTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  medicalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  medicalItemText: {
    fontSize: 14,
    color: colors.text,
  },
  emptyMedicalText: {
    fontSize: 14,
    color: colors.textLight,
    fontStyle: 'italic',
  },
  documentInfo: {
    marginBottom: 8,
  },
  documentInfoTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  documentImageContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  documentImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  documentPlaceholder: {
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  emptyDocumentText: {
    fontSize: 14,
    color: colors.textLight,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  appointmentCard: {
    marginBottom: 12,
    padding: 16,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  appointmentDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  appointmentDateText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  appointmentTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  appointmentTimeText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  appointmentDetails: {
    gap: 4,
  },
  appointmentDoctor: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  appointmentClinic: {
    fontSize: 14,
    color: colors.textLight,
  },
  appointmentNotes: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 4,
  },
  emptyCard: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 12,
  },
  emptyButton: {
    minWidth: 200,
  },
  deleteSection: {
    padding: 20,
    alignItems: 'center',
  },
  deleteButton: {
    borderColor: colors.error,
  },
});