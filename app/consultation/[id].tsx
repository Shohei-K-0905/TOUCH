import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert, Share, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { useChildStore } from '@/store/child-store';
import { useAppointmentStore } from '@/store/appointment-store';
import { 
  ExternalLink,
  Share2,
  Mail
} from 'lucide-react-native';
import { Button } from '@/components/Button';
import * as MailComposer from 'expo-mail-composer';
import { EmailSender } from '@/components/EmailSender';

export default function ConsultationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const { children } = useChildStore();
  const { 
    appointments, 
    daycares, 
    clinics, 
    updateAppointment,
    generateMeetingLink
  } = useAppointmentStore();
  
  const appointment = appointments.find(a => a.id === id);
  const [showEmailSender, setShowEmailSender] = useState(false);
  
  useEffect(() => {
    if (appointment && appointment.status === 'scheduled') {
      updateAppointment(id, { status: 'in-progress' });
    }
    
    // Generate meeting link if it doesn't exist
    if (appointment && !appointment.meetingLink) {
      const meetingLink = generateMeetingLink(id);
      updateAppointment(id, { meetingLink });
    }
    
    return () => {
      if (appointment && appointment.status === 'in-progress') {
        updateAppointment(id, { status: 'completed' });
      }
    };
  }, [id, appointment]);
  
  if (!appointment) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>オンライン診療が見つかりません</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>戻る</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  const child = children.find(c => c.id === appointment.childId);
  const daycare = daycares.find(d => d.id === appointment.daycareId);
  const clinic = clinics.find(c => c.id === appointment.clinicId);
  
  // Check if we have all the required data
  const isMissingData = !child || !daycare || !clinic;
  
  // If data is missing, show a more helpful error message
  if (isMissingData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>オンライン診療データが不完全です</Text>
          <Text style={styles.notFoundSubtext}>
            {!child ? "子どもの情報が見つかりません" : ""}
            {!daycare ? "保育施設の情報が見つかりません" : ""}
            {!clinic ? "クリニックの情報が見つかりません" : ""}
          </Text>
          <Text style={styles.notFoundHint}>
            診療を開始する前に、保育施設とクリニックにリンクを送信してください。
          </Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>戻る</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  const openMeetingInBrowser = () => {
    if (!appointment.meetingLink) {
      Alert.alert("エラー", "ミーティングリンクが見つかりません。");
      return;
    }
    
    try {
      Linking.openURL(appointment.meetingLink);
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
  
  const shareLink = async () => {
    if (!appointment.meetingLink) {
      Alert.alert("エラー", "ミーティングリンクが見つかりません。");
      return;
    }
    
    try {
      if (Platform.OS === 'web') {
        Alert.alert(
          "ミーティングリンク",
          `以下のリンクを共有してください:
${appointment.meetingLink}`
        );
      } else {
        await Share.share({
          message: `TOUCH オンライン診療に参加してください:
${appointment.meetingLink}`,
          url: appointment.meetingLink,
          title: 'オンライン診療リンク'
        });
      }
    } catch (error) {
      console.error('Error sharing link:', error);
      Alert.alert(
        "共有エラー",
        "リンクの共有中にエラーが発生しました。"
      );
    }
  };
  
  const sendToBothFacilities = async () => {
    if (!daycare || !clinic || !child) return;
    
    const meetingLink = appointment.meetingLink;
    if (!meetingLink) {
      Alert.alert("エラー", "ミーティングリンクが見つかりません。");
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

日時: ${new Date(appointment.date).toLocaleDateString('ja-JP')} ${appointment.time}
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
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>オンライン診療</Text>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <Text style={styles.closeButtonText}>閉じる</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>診療情報</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>お子様:</Text>
            <Text style={styles.infoValue}>{child.name}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>保育施設:</Text>
            <Text style={styles.infoValue}>{daycare.name}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>クリニック:</Text>
            <Text style={styles.infoValue}>{clinic.name}</Text>
          </View>
          
          <View style={styles.meetingLinkContainer}>
            <Text style={styles.meetingLinkLabel}>ミーティングリンク:</Text>
            <Text style={styles.meetingLinkValue}>{appointment.meetingLink}</Text>
          </View>
        </View>
        
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>診療の始め方</Text>
          <Text style={styles.instructionsText}>
            1. 「ブラウザで診療を開始」ボタンをタップすると、ブラウザでJitsiミーティングが開きます。
          </Text>
          <Text style={styles.instructionsText}>
            2. カメラとマイクへのアクセスを許可してください。
          </Text>
          <Text style={styles.instructionsText}>
            3. 保育施設とクリニックが同じリンクからミーティングに参加するのを待ちます。
          </Text>
        </View>
        
        <Button
          title="ブラウザで診療を開始"
          onPress={openMeetingInBrowser}
          variant="primary"
          icon={<ExternalLink size={20} color={colors.white} />}
          style={styles.actionButton}
        />
        
        <Button
          title="保育施設とクリニックへ送信"
          onPress={sendToBothFacilities}
          variant="outline"
          icon={<Mail size={20} color={colors.primary} />}
          style={styles.actionButton}
        />
        
        <Button
          title="リンクを共有"
          onPress={shareLink}
          variant="outline"
          icon={<Share2 size={20} color={colors.primary} />}
          style={styles.actionButton}
        />
      </View>

      {showEmailSender && (
        <EmailSender
          childId={child.id}
          daycareId={daycare.id}
          clinicId={clinic.id}
          meetingLink={appointment.meetingLink || ""}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.primary,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: colors.white,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notFoundText: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  notFoundSubtext: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 20,
    textAlign: 'center',
    opacity: 0.7,
  },
  notFoundHint: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 24,
    textAlign: 'center',
    backgroundColor: colors.backgroundLight,
    padding: 12,
    borderRadius: 8,
    width: '100%',
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    width: 80,
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: colors.textLight,
  },
  meetingLinkContainer: {
    marginTop: 12,
    backgroundColor: colors.backgroundLight,
    padding: 12,
    borderRadius: 8,
  },
  meetingLinkLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  meetingLinkValue: {
    fontSize: 14,
    color: colors.primary,
  },
  instructionsCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
    lineHeight: 20,
  },
  actionButton: {
    marginBottom: 12,
  },
});