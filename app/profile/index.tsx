import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/Card';
import { ChildCard } from '@/components/ChildCard';
import { Button } from '@/components/Button';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import { useChildStore } from '@/store/child-store';
import { useDaycareStore } from '@/store/daycare-store';
import { useClinicStore } from '@/store/clinic-store';
import { User, Mail, Phone, Plus, Edit, LogOut, Building, Hospital, Video, Trash2 } from 'lucide-react-native';
import { useState } from 'react';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { children } = useChildStore();
  const { daycares, deleteDaycare, unselectDaycare } = useDaycareStore();
  const { clinics, deleteClinic, unselectClinic } = useClinicStore();
  
  const [deletingDaycareId, setDeletingDaycareId] = useState<string | null>(null);
  const [deletingClinicId, setDeletingClinicId] = useState<string | null>(null);

  const handleAddChild = () => {
    router.push('/profile/add-child');
  };

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  const handleChildPress = (childId: string) => {
    router.push(`/child/${childId}`);
  };

  const handleAddDaycare = () => {
    router.push('/profile/add-daycare');
  };

  const handleDaycarePress = (daycareId: string) => {
    router.push(`/profile/edit-daycare/${daycareId}`);
  };

  const handleAddClinic = () => {
    router.push('/profile/add-clinic');
  };

  const handleClinicPress = (clinicId: string) => {
    router.push(`/profile/edit-clinic/${clinicId}`);
  };

  const handleStartConsultation = () => {
    router.push('/consultations');
  };

  const handleLogout = () => {
    logout();
    router.replace('/(auth)');
  };
  
  const handleDeleteDaycare = (id: string) => {
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
            setDeletingDaycareId(id);
            
            try {
              // First unselect the daycare if it's selected
              unselectDaycare(id);
              
              // Then delete the daycare
              deleteDaycare(id);
              
              // Clear the deleting state
              setTimeout(() => {
                setDeletingDaycareId(null);
              }, 500);
            } catch (error) {
              console.error(`Error deleting daycare with id: ${id}:`, error);
              Alert.alert('エラー', '保育施設の削除に失敗しました。もう一度お試しください。');
              setDeletingDaycareId(null);
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  const handleDeleteClinic = (id: string) => {
    Alert.alert(
      "クリニックを削除",
      "このクリニックを削除してもよろしいですか？",
      [
        {
          text: "キャンセル",
          style: "cancel"
        },
        {
          text: "削除",
          onPress: () => {
            setDeletingClinicId(id);
            
            try {
              // First unselect the clinic if it's selected
              unselectClinic(id);
              
              // Then delete the clinic
              deleteClinic(id);
              
              // Clear the deleting state
              setTimeout(() => {
                setDeletingClinicId(null);
              }, 500);
            } catch (error) {
              console.error(`Error deleting clinic with id: ${id}:`, error);
              Alert.alert('エラー', 'クリニックの削除に失敗しました。もう一度お試しください。');
              setDeletingClinicId(null);
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  if (!user) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>プロフィール</Text>
        </View>
        
        <Card variant="elevated" style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.profileImageContainer}>
              <View style={styles.profileImage}>
                <User size={40} color={colors.white} />
              </View>
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user.name}</Text>
              
              <View style={styles.profileDetail}>
                <Mail size={16} color={colors.textLight} />
                <Text style={styles.profileDetailText}>{user.email}</Text>
              </View>
              
              <View style={styles.profileDetail}>
                <Phone size={16} color={colors.textLight} />
                <Text style={styles.profileDetailText}>{user.phone}</Text>
              </View>
            </View>
          </View>
          
          <Button
            title="プロフィール編集"
            onPress={handleEditProfile}
            variant="outline"
            size="small"
            icon={<Edit size={16} color={colors.primary} />}
            style={styles.editProfileButton}
          />
        </Card>

        <Card variant="elevated" style={styles.consultationCard}>
          <Text style={styles.consultationTitle}>オンライン診療</Text>
          <Text style={styles.consultationDescription}>
            お子様の体調が気になりますか？保育施設とクリニックをつないでオンライン診療を行いましょう。
          </Text>
          <Button
            title="オンライン診療を開始"
            onPress={handleStartConsultation}
            variant="primary"
            icon={<Video size={20} color={colors.white} />}
            style={styles.consultationButton}
          />
        </Card>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>お子様</Text>
            <Button
              title="子どもを追加"
              onPress={handleAddChild}
              variant="outline"
              size="small"
              icon={<Plus size={16} color={colors.primary} />}
            />
          </View>
          
          {children.length > 0 ? (
            <View style={styles.childrenList}>
              {children.map(child => (
                <ChildCard
                  key={child.id}
                  child={child}
                  onPress={() => handleChildPress(child.id)}
                  showDetails
                />
              ))}
            </View>
          ) : (
            <Card variant="outlined" style={styles.emptyCard}>
              <Text style={styles.emptyText}>まだ子どもが登録されていません</Text>
              <Button
                title="子どもを追加"
                onPress={handleAddChild}
                variant="primary"
                size="small"
                icon={<Plus size={16} color={colors.white} />}
                style={styles.emptyButton}
              />
            </Card>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>保育施設</Text>
            <Button
              title="保育施設を追加"
              onPress={handleAddDaycare}
              variant="outline"
              size="small"
              icon={<Plus size={16} color={colors.primary} />}
            />
          </View>
          
          {daycares.length > 0 ? (
            <View style={styles.facilityList}>
              {daycares.map(daycare => (
                <Card key={daycare.id} variant="outlined" style={styles.facilityCard}>
                  <View style={styles.facilityContent}>
                    <TouchableOpacity 
                      style={styles.facilityMainContent}
                      onPress={() => handleDaycarePress(daycare.id)}
                    >
                      <View style={styles.facilityIconContainer}>
                        <Building size={24} color={colors.primary} />
                      </View>
                      <View style={styles.facilityInfo}>
                        <Text style={styles.facilityName}>{daycare.name}</Text>
                        <Text style={styles.facilityAddress}>{daycare.address}</Text>
                        <Text style={styles.facilityContact}>{daycare.phone}</Text>
                      </View>
                    </TouchableOpacity>
                    
                    <View style={styles.facilityActions}>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleDaycarePress(daycare.id)}
                      >
                        <Edit size={16} color={colors.primary} />
                        <Text style={styles.editButtonText}>編集</Text>
                      </TouchableOpacity>
                      
                      {deletingDaycareId === daycare.id ? (
                        <ActivityIndicator size="small" color={colors.error} style={styles.deleteLoader} />
                      ) : (
                        <TouchableOpacity 
                          style={styles.actionButton}
                          onPress={() => handleDeleteDaycare(daycare.id)}
                        >
                          <Trash2 size={16} color={colors.error} />
                          <Text style={styles.deleteButtonText}>削除</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          ) : (
            <Card variant="outlined" style={styles.emptyCard}>
              <Text style={styles.emptyText}>まだ保育施設が登録されていません</Text>
              <Button
                title="保育施設を追加"
                onPress={handleAddDaycare}
                variant="primary"
                size="small"
                icon={<Plus size={16} color={colors.white} />}
                style={styles.emptyButton}
              />
            </Card>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>クリニック</Text>
            <Button
              title="クリニックを追加"
              onPress={handleAddClinic}
              variant="outline"
              size="small"
              icon={<Plus size={16} color={colors.primary} />}
            />
          </View>
          
          {clinics.length > 0 ? (
            <View style={styles.facilityList}>
              {clinics.map(clinic => (
                <Card key={clinic.id} variant="outlined" style={styles.facilityCard}>
                  <View style={styles.facilityContent}>
                    <TouchableOpacity 
                      style={styles.facilityMainContent}
                      onPress={() => handleClinicPress(clinic.id)}
                    >
                      <View style={[styles.facilityIconContainer, { backgroundColor: colors.secondaryLight }]}>
                        <Hospital size={24} color={colors.secondary} />
                      </View>
                      <View style={styles.facilityInfo}>
                        <Text style={styles.facilityName}>{clinic.name}</Text>
                        <Text style={styles.facilityAddress}>{clinic.address}</Text>
                        <Text style={styles.facilityContact}>{clinic.phone}</Text>
                      </View>
                    </TouchableOpacity>
                    
                    <View style={styles.facilityActions}>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleClinicPress(clinic.id)}
                      >
                        <Edit size={16} color={colors.primary} />
                        <Text style={styles.editButtonText}>編集</Text>
                      </TouchableOpacity>
                      
                      {deletingClinicId === clinic.id ? (
                        <ActivityIndicator size="small" color={colors.error} style={styles.deleteLoader} />
                      ) : (
                        <TouchableOpacity 
                          style={styles.actionButton}
                          onPress={() => handleDeleteClinic(clinic.id)}
                        >
                          <Trash2 size={16} color={colors.error} />
                          <Text style={styles.deleteButtonText}>削除</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          ) : (
            <Card variant="outlined" style={styles.emptyCard}>
              <Text style={styles.emptyText}>まだクリニックが登録されていません</Text>
              <Button
                title="クリニックを追加"
                onPress={handleAddClinic}
                variant="primary"
                size="small"
                icon={<Plus size={16} color={colors.white} />}
                style={styles.emptyButton}
              />
            </Card>
          )}
        </View>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={colors.error} />
          <Text style={styles.logoutText}>ログアウト</Text>
        </TouchableOpacity>
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
  header: {
    padding: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  profileCard: {
    margin: 20,
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  profileDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  profileDetailText: {
    fontSize: 14,
    color: colors.textLight,
  },
  editProfileButton: {
    alignSelf: 'flex-start',
    marginTop: 16,
  },
  consultationCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
  },
  consultationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  consultationDescription: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 16,
    lineHeight: 20,
  },
  consultationButton: {
    width: '100%',
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  childrenList: {
    gap: 12,
  },
  facilityList: {
    gap: 12,
  },
  facilityCard: {
    padding: 0,
    overflow: 'hidden',
  },
  facilityContent: {
    padding: 16,
  },
  facilityMainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  facilityIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  facilityInfo: {
    flex: 1,
  },
  facilityName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  facilityAddress: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 2,
  },
  facilityContact: {
    fontSize: 14,
    color: colors.textLight,
  },
  facilityActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  editButtonText: {
    color: colors.primary,
    fontWeight: '500',
    marginLeft: 4,
  },
  deleteButtonText: {
    color: colors.error,
    fontWeight: '500',
    marginLeft: 4,
  },
  deleteLoader: {
    marginHorizontal: 8,
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 16,
  },
  emptyButton: {
    minWidth: 150,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    margin: 20,
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    color: colors.error,
    fontWeight: '500',
  },
});