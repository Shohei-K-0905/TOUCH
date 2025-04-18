import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import { useChildStore } from '@/store/child-store';
import { useDaycareStore } from '@/store/daycare-store';
import { useClinicStore } from '@/store/clinic-store';
import { Building, Building2, Plus, LogOut, Edit, Trash2 } from 'lucide-react-native';
import { ChildCard } from '@/components/ChildCard';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { colors } from '@/constants/colors';

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { children } = useChildStore();
  const { daycares, deleteDaycare, unselectDaycare } = useDaycareStore();
  const { clinics, deleteClinic, unselectClinic } = useClinicStore();
  
  const [deletingDaycareId, setDeletingDaycareId] = useState<string | null>(null);
  const [deletingClinicId, setDeletingClinicId] = useState<string | null>(null);

  const handleChildPress = (childId: string) => {
    router.push(`/child/${childId}`);
  };

  const handleEditChild = (childId: string) => {
    router.push(`/profile/edit-child/${childId}`);
  };

  const handleAddChild = () => {
    router.push('/profile/add-child');
  };

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  const handleAddDaycare = () => {
    router.push('/profile/add-daycare');
  };

  const handleEditDaycare = (id: string) => {
    router.push(`/profile/edit-daycare/${id}`);
  };

  const handleAddClinic = () => {
    router.push('/profile/add-clinic');
  };

  const handleEditClinic = (id: string) => {
    router.push(`/profile/edit-clinic/${id}`);
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

  const handleLogout = () => {
    logout();
    router.replace('/(auth)');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>
            こんにちは、{user?.name?.split(' ')[0] || 'ゲスト'}さん
          </Text>
        </View>

        {/* 保護者のプロフィール */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>保護者のプロフィール</Text>
            <TouchableOpacity onPress={handleEditProfile} style={styles.addButton}>
              <Text style={styles.addButtonText}>編集</Text>
            </TouchableOpacity>
          </View>

          <Card variant="elevated" style={styles.profileCard}>
            <View style={styles.profileInfo}>
              <Text style={styles.profileLabel}>名前:</Text>
              <Text style={styles.profileValue}>{user?.name || '未設定'}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileLabel}>メール:</Text>
              <Text style={styles.profileValue}>{user?.email || '未設定'}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileLabel}>電話番号:</Text>
              <Text style={styles.profileValue}>{user?.phone || '未設定'}</Text>
            </View>
          </Card>
        </View>

        {/* お子様 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>お子様</Text>
            <TouchableOpacity onPress={handleAddChild} style={styles.addButton}>
              <Plus size={18} color="#4A90E2" />
              <Text style={styles.addButtonText}>追加</Text>
            </TouchableOpacity>
          </View>

          {children.length > 0 ? (
            <View style={styles.childrenList}>
              {children.map((child) => (
                <Card key={child.id} variant="elevated" style={styles.childCard}>
                  <TouchableOpacity
                    onPress={() => handleChildPress(child.id)}
                    style={styles.childCardContent}
                  >
                    <ChildCard child={child} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.editChildButton}
                    onPress={() => handleEditChild(child.id)}
                  >
                    <Edit size={16} color="#4A90E2" />
                    <Text style={styles.editButtonText}>編集</Text>
                  </TouchableOpacity>
                </Card>
              ))}
            </View>
          ) : (
            <Card variant="elevated" style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                お子様の情報を追加してください
              </Text>
              <Button
                title="お子様を追加"
                onPress={handleAddChild}
                variant="primary"
                size="medium"
              />
            </Card>
          )}
        </View>

        {/* 保育施設 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>保育施設</Text>
            <TouchableOpacity onPress={handleAddDaycare} style={styles.addButton}>
              <Plus size={18} color="#4A90E2" />
              <Text style={styles.addButtonText}>追加</Text>
            </TouchableOpacity>
          </View>

          {daycares.length > 0 ? (
            <View style={styles.facilitiesContainer}>
              {daycares.map((daycare) => (
                <Card key={daycare.id} variant="elevated" style={styles.facilityCard}>
                  <View style={styles.facilityHeader}>
                    <View style={styles.facilityIconAndName}>
                      <Building size={20} color="#4A90E2" />
                      <Text style={styles.facilityName}>
                        {daycare.name}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.facilityAddress}>{daycare.address}</Text>
                  <Text style={styles.facilityPhone}>{daycare.phone}</Text>
                  <View style={styles.facilityActions}>
                    <TouchableOpacity 
                      style={styles.editButton}
                      onPress={() => handleEditDaycare(daycare.id)}
                    >
                      <Edit size={16} color="#4A90E2" />
                      <Text style={styles.editButtonText}>編集</Text>
                    </TouchableOpacity>
                    
                    {deletingDaycareId === daycare.id ? (
                      <ActivityIndicator size="small" color={colors.error} style={styles.deleteLoader} />
                    ) : (
                      <TouchableOpacity 
                        style={styles.deleteButton}
                        onPress={() => handleDeleteDaycare(daycare.id)}
                      >
                        <Trash2 size={16} color={colors.error} />
                        <Text style={styles.deleteButtonText}>削除</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </Card>
              ))}
            </View>
          ) : (
            <Card variant="elevated" style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                保育施設を登録してください
              </Text>
              <View style={styles.buttonContainer}>
                <Button
                  title="保育施設を登録"
                  onPress={handleAddDaycare}
                  variant="primary"
                  size="medium"
                />
              </View>
            </Card>
          )}
        </View>

        {/* クリニック */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>クリニック</Text>
            <TouchableOpacity onPress={handleAddClinic} style={styles.addButton}>
              <Plus size={18} color="#4A90E2" />
              <Text style={styles.addButtonText}>追加</Text>
            </TouchableOpacity>
          </View>

          {clinics.length > 0 ? (
            <View style={styles.facilitiesContainer}>
              {clinics.map((clinic) => (
                <Card key={clinic.id} variant="elevated" style={styles.facilityCard}>
                  <View style={styles.facilityHeader}>
                    <View style={styles.facilityIconAndName}>
                      <Building2 size={20} color="#4A90E2" />
                      <Text style={styles.facilityName}>
                        {clinic.name}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.facilityAddress}>{clinic.address}</Text>
                  <Text style={styles.facilityPhone}>{clinic.phone}</Text>
                  <View style={styles.facilityActions}>
                    <TouchableOpacity 
                      style={styles.editButton}
                      onPress={() => handleEditClinic(clinic.id)}
                    >
                      <Edit size={16} color="#4A90E2" />
                      <Text style={styles.editButtonText}>編集</Text>
                    </TouchableOpacity>
                    
                    {deletingClinicId === clinic.id ? (
                      <ActivityIndicator size="small" color={colors.error} style={styles.deleteLoader} />
                    ) : (
                      <TouchableOpacity 
                        style={styles.deleteButton}
                        onPress={() => handleDeleteClinic(clinic.id)}
                      >
                        <Trash2 size={16} color={colors.error} />
                        <Text style={styles.deleteButtonText}>削除</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </Card>
              ))}
            </View>
          ) : (
            <Card variant="elevated" style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                クリニックを登録してください
              </Text>
              <View style={styles.buttonContainer}>
                <Button
                  title="クリニックを登録"
                  onPress={handleAddClinic}
                  variant="primary"
                  size="medium"
                />
              </View>
            </Card>
          )}
        </View>

        {/* ログアウトボタン */}
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
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
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
    color: '#333',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    marginLeft: 4,
    color: '#4A90E2',
    fontWeight: '500',
  },
  childrenList: {
    gap: 12,
  },
  childCard: {
    padding: 12,
  },
  childCardContent: {
    marginBottom: 8,
  },
  editChildButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    padding: 4,
  },
  profileCard: {
    padding: 16,
  },
  profileInfo: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  profileLabel: {
    width: 80,
    fontWeight: '500',
    color: '#666',
  },
  profileValue: {
    flex: 1,
    color: '#333',
  },
  facilitiesContainer: {
    gap: 12,
  },
  facilityCard: {
    padding: 16,
  },
  facilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  facilityIconAndName: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  facilityName: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#333',
  },
  facilityAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  facilityPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  facilityActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  editButtonText: {
    color: '#4A90E2',
    fontWeight: '500',
    marginLeft: 4,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  deleteButtonText: {
    color: colors.error,
    fontWeight: '500',
    marginLeft: 4,
  },
  deleteLoader: {
    marginHorizontal: 8,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    margin: 16,
    marginTop: 0,
    marginBottom: 32,
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