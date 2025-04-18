import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { ChildCard } from '@/components/ChildCard';
import { SelectionCard } from '@/components/SelectionCard';
import { Card } from '@/components/Card';
import { colors } from '@/constants/colors';
import { useChildStore } from '@/store/child-store';
import { useDaycareStore } from '@/store/daycare-store';
import { useClinicStore } from '@/store/clinic-store';
import { useAppointmentStore } from '@/store/appointment-store';
import { useAuthStore } from '@/store/auth-store';
import { Video, Building, Hospital, Plus, Mail, ExternalLink } from 'lucide-react-native';
import * as MailComposer from 'expo-mail-composer';
import { EmailSender } from '@/components/EmailSender';

export default function ConsultationsScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { children, selectedChildId, selectChild } = useChildStore();
  const { daycares } = useDaycareStore();
  const { clinics } = useClinicStore();
  const { 
    addAppointment,
    generateMeetingLink
  } = useAppointmentStore();
  
  const [selectedDaycareId, setSelectedDaycareId] = useState<string | null>(null);
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [meetingLink, setMeetingLink] = useState<string | null>(null);
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const [showEmailSender, setShowEmailSender] = useState(false);

  // ログイン状態の確認
  useEffect(() => {
    if (!isAuthenticated) {
      // Use a timeout to ensure the Root Layout is mounted before navigation
      const timer = setTimeout(() => {
        router.replace('/(auth)');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  // 初期値の設定
  useEffect(() => {
    if (children.length > 0 && !selectedChildId) {
      selectChild(children[0].id);
    }
  }, [children, selectedChildId]);

  const handleChildSelect = (childId: string) => {
    selectChild(childId);
  };

  const handleDaycareSelect = (daycareId: string) => {
    setSelectedDaycareId(daycareId);
  };

  const handleClinicSelect = (clinicId: string) => {
    setSelectedClinicId(clinicId);
  };

  const handleCreateConsultation = async () => {
    if (!selectedChildId || !selectedDaycareId || !selectedClinicId) {
      Alert.alert(
        "情報が不足しています",
        "オンライン診療を開始するには、お子様、保育施設、クリニックをすべて選択してください。"
      );
      return;
    }

    setIsLoading(true);

    try {
      // Create a new appointment for the consultation
      const newAppointmentId = addAppointment({
        childId: selectedChildId,
        daycareId: selectedDaycareId,
        clinicId: selectedClinicId,
        doctorId: "", // 医師選択を削除したため空文字列を設定
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        notes: '緊急オンライン診療',
      });

      // Generate a meeting link for the appointment
      const link = generateMeetingLink(newAppointmentId);
      setMeetingLink(link);
      setAppointmentId(newAppointmentId);

      // Show success message with only an OK button
      Alert.alert(
        "オンライン診療リンクを作成しました",
        "保育施設とクリニックにリンクを送信してから、診療を開始してください。",
        [
          {
            text: "OK",
            onPress: () => {}
          }
        ]
      );
    } catch (error) {
      console.error('Failed to create consultation:', error);
      Alert.alert(
        "エラー",
        "オンライン診療の作成に失敗しました。もう一度お試しください。"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const sendToBothFacilities = async () => {
    if (!selectedDaycareId || !selectedChildId || !meetingLink || !selectedClinicId) {
      Alert.alert("情報が不足しています", "保育施設、クリニック、お子様、診療リンクが必要です");
      return;
    }
    
    const daycare = daycares.find(d => d.id === selectedDaycareId);
    const clinic = clinics.find(c => c.id === selectedClinicId);
    const child = children.find(c => c.id === selectedChildId);
    
    if (!daycare || !child || !clinic) {
      Alert.alert("情報が見つかりません", "選択した保育施設、クリニック、またはお子様の情報が見つかりません");
      return;
    }

    // Check if MailComposer is available
    const isAvailable = await MailComposer.isAvailableAsync();
    
    if (isAvailable && Platform.OS !== 'web') {
      setShowEmailSender(true);
    } else {
      // Fallback to mailto: if MailComposer is not available
      sendEmailWithMailto(daycare, clinic, child, meetingLink);
    }
  };

  const sendEmailWithMailto = (daycare: any, clinic: any, child: any, meetingLink: string) => {
    // 保険証と受給者証の画像情報を取得
    const insuranceCardImage = child.insuranceCardImage;
    const recipientCertImage = child.recipientCertImage;
    
    // メールの件名
    const subject = `【TOUCH】${child.name}さんのオンライン診療のご案内`;
    
    // プレーンテキスト版（フォールバック用）
    const plainTextBody = `
${daycare.contactPerson || daycare.name}様、${clinic.name}様

${child.name}さんのオンライン診療のご案内です。

日時: ${new Date().toLocaleDateString('ja-JP')} ${new Date().toLocaleTimeString('ja-JP')}
保育施設: ${daycare.name}
クリニック: ${clinic.name}

以下のリンクからオンライン診療にご参加ください:
${meetingLink}

※ お子様の保険証・受給者証の画像は添付ファイルをご確認ください。
※ リンクをクリックすると、ブラウザでJitsiミーティングが開きます。
※ カメラとマイクへのアクセスを許可してください。

よろしくお願いいたします。
`;

    // メール送信用のURLを作成
    let mailtoLink = `mailto:${daycare.email}?cc=${clinic.email}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(plainTextBody)}`;
    
    if (Platform.OS === 'web') {
      window.location.href = mailtoLink;
    } else {
      // 添付ファイルの有無に応じてメッセージを変更
      const hasAttachments = insuranceCardImage || recipientCertImage;
      const attachmentMessage = hasAttachments 
        ? '保険証・受給者証の画像が添付されます。' 
        : '保険証・受給者証の画像は登録されていません。';
      
      Alert.alert(
        "メール送信",
        `保育施設とクリニックへメールを送信します。メールアプリが開きます。${attachmentMessage}`,
        [
          { text: "キャンセル", style: "cancel" },
          { 
            text: "送信", 
            onPress: () => {
              try {
                // メールアプリを開く
                Linking.openURL(mailtoLink);
                
                // 添付ファイルがある場合は追加の説明を表示
                if (hasAttachments) {
                  setTimeout(() => {
                    Alert.alert(
                      "添付ファイルについて",
                      "メールアプリで保険証・受給者証の画像を手動で添付してください。技術的な制限により、自動添付ができません。",
                      [{ text: "了解" }]
                    );
                  }, 1000);
                }
              } catch (error) {
                Alert.alert("エラー", "メールアプリを開けませんでした。");
              }
            }
          }
        ]
      );
    }
  };

  const openMeetingInBrowser = (link: string) => {
    try {
      Linking.openURL(link);
    } catch (error) {
      console.error('Failed to open browser:', error);
      Alert.alert(
        "エラー",
        "ブラウザでミーティングを開けませんでした。リンクをコピーして手動で開いてください。",
        [
          {
            text: "OK",
            onPress: () => {}
          }
        ]
      );
    }
  };

  // 診療開始ボタンの有効/無効状態を確認
  const canStartConsultation = !!(selectedChildId && selectedDaycareId && selectedClinicId);
  
  // 保育施設やクリニックが登録されていない場合のメッセージ
  const showRegistrationMessage = daycares.length === 0 || clinics.length === 0;

  const handleGoToHome = () => {
    router.push('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>オンライン診療</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>診療を開始</Text>
            <Text style={styles.heroSubtitle}>
              お子様の保育施設と医療機関をつないで、オンライン診療を行います
            </Text>
          </View>
        </View>
        
        {showRegistrationMessage ? (
          <Card variant="elevated" style={styles.warningSection}>
            <Text style={styles.warningTitle}>
              保育施設とクリニックを登録してください
            </Text>
            <Text style={styles.warningText}>
              オンライン診療を行うには、まずホーム画面で保育施設とクリニックを登録してください。
            </Text>
            <Button
              title="ホーム画面へ戻る"
              onPress={handleGoToHome}
              variant="primary"
              style={styles.warningButton}
              icon={<Building size={18} color={colors.white} />}
            />
          </Card>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1. お子様を選択</Text>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.childrenContainer}
              >
                {children.map(child => (
                  <View key={child.id} style={styles.childCardContainer}>
                    <ChildCard
                      child={child}
                      selected={child.id === selectedChildId}
                      onPress={() => handleChildSelect(child.id)}
                    />
                  </View>
                ))}
                <TouchableOpacity 
                  style={styles.addChildCard}
                  onPress={() => router.push('/profile/add-child')}
                >
                  <Plus size={24} color={colors.primary} />
                  <Text style={styles.addChildText}>子どもを追加</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. 保育施設を選択</Text>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.selectionContainer}
              >
                {daycares.map(daycare => (
                  <View key={daycare.id} style={styles.selectionCardContainer}>
                    <SelectionCard
                      title={daycare.name}
                      subtitle={daycare.address}
                      selected={daycare.id === selectedDaycareId}
                      onPress={() => handleDaycareSelect(daycare.id)}
                      icon={<Building size={20} color={daycare.id === selectedDaycareId ? colors.white : colors.gray} />}
                    />
                  </View>
                ))}
                <TouchableOpacity 
                  style={styles.addFacilityCard}
                  onPress={() => router.push('/profile/add-daycare')}
                >
                  <Plus size={24} color={colors.primary} />
                  <Text style={styles.addFacilityText}>保育施設を追加</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>3. クリニックを選択</Text>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.selectionContainer}
              >
                {clinics.map(clinic => (
                  <View key={clinic.id} style={styles.selectionCardContainer}>
                    <SelectionCard
                      title={clinic.name}
                      subtitle={`専門: ${clinic.specialties.join(', ')}`}
                      selected={clinic.id === selectedClinicId}
                      onPress={() => handleClinicSelect(clinic.id)}
                      icon={<Hospital size={20} color={clinic.id === selectedClinicId ? colors.white : colors.gray} />}
                    />
                  </View>
                ))}
                <TouchableOpacity 
                  style={styles.addFacilityCard}
                  onPress={() => router.push('/profile/add-clinic')}
                >
                  <Plus size={24} color={colors.primary} />
                  <Text style={styles.addFacilityText}>クリニックを追加</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
            
            <View style={styles.buttonContainer}>
              {meetingLink ? (
                <>
                  <View style={styles.meetingLinkContainer}>
                    <Text style={styles.meetingLinkTitle}>診療リンクが作成されました</Text>
                    <Text style={styles.meetingLinkText}>{meetingLink}</Text>
                  </View>
                  
                  <Button
                    title="保育施設とクリニックへ送信"
                    onPress={sendToBothFacilities}
                    variant="primary"
                    icon={<Mail size={20} color={colors.white} />}
                    style={styles.actionButton}
                  />
                  
                  <Button
                    title="ブラウザで診療を開始"
                    onPress={() => openMeetingInBrowser(meetingLink)}
                    variant="outline"
                    icon={<ExternalLink size={20} color={colors.primary} />}
                    style={styles.actionButton}
                  />
                </>
              ) : (
                <Button
                  title="診療リンクを作成"
                  onPress={handleCreateConsultation}
                  disabled={!canStartConsultation}
                  loading={isLoading}
                  icon={<Video size={20} color={colors.white} />}
                  style={styles.startButton}
                />
              )}
              
              <Text style={styles.disclaimer}>
                オンライン診療を開始することで、お子様の情報を選択した保育施設とクリニックと共有することに同意します。
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      {showEmailSender && selectedChildId && selectedDaycareId && selectedClinicId && meetingLink && (
        <EmailSender
          childId={selectedChildId}
          daycareId={selectedDaycareId}
          clinicId={selectedClinicId}
          meetingLink={meetingLink}
          onClose={() => setShowEmailSender(false)}
          onSuccess={() => {
            setShowEmailSender(false);
            Alert.alert(
              "メール送信完了",
              "保育施設とクリニックへメールを送信しました。",
              [{ text: "OK" }]
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
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
  scrollView: {
    flex: 1,
  },
  heroSection: {
    backgroundColor: colors.primary,
    padding: 24,
    marginBottom: 16,
  },
  heroContent: {
    width: '100%',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: colors.white,
    lineHeight: 20,
  },
  warningSection: {
    margin: 16,
    padding: 20,
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
    width: '100%',
  },
  section: {
    padding: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  childrenContainer: {
    paddingRight: 16,
  },
  childCardContainer: {
    width: 200,
    marginRight: 12,
  },
  addChildCard: {
    width: 200,
    height: 120,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addChildText: {
    marginTop: 8,
    color: colors.primary,
    fontWeight: '500',
  },
  selectionContainer: {
    paddingRight: 16,
  },
  selectionCardContainer: {
    width: 250,
    marginRight: 12,
  },
  addFacilityCard: {
    width: 250,
    height: 100,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addFacilityText: {
    marginTop: 8,
    color: colors.primary,
    fontWeight: '500',
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: colors.white,
    marginTop: 8,
    marginBottom: 24,
    alignItems: 'center',
  },
  startButton: {
    width: '100%',
    paddingVertical: 16,
  },
  meetingLinkContainer: {
    width: '100%',
    backgroundColor: colors.backgroundLight,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  meetingLinkTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  meetingLinkText: {
    fontSize: 14,
    color: colors.primary,
    textAlign: 'center',
    padding: 8,
    backgroundColor: colors.white,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  actionButton: {
    width: '100%',
    marginBottom: 12,
  },
  shareContainer: {
    width: '100%',
    marginTop: 16,
  },
  shareTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  shareButton: {
    width: '100%',
  },
  disclaimer: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
  },
});