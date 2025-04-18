import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share, Platform, Linking } from 'react-native';
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
  MapPin, 
  User, 
  ExternalLink, 
  Share2, 
  X,
  MessageCircle,
  FileText,
  Mail
} from 'lucide-react-native';

export default function AppointmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const { children } = useChildStore();
  const { 
    appointments, 
    daycares, 
    clinics, 
    doctors, 
    cancelAppointment,
    generateMeetingLink
  } = useAppointmentStore();
  
  const appointment = appointments.find(a => a.id === id);
  
  if (!appointment) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="予約詳細" showBackButton />
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>予約が見つかりません</Text>
          <Button
            title="戻る"
            onPress={() => router.back()}
            variant="primary"
          />
        </View>
      </SafeAreaView>
    );
  }
  
  const child = children.find(c => c.id === appointment.childId);
  const daycare = daycares.find(d => d.id === appointment.daycareId);
  const clinic = clinics.find(c => c.id === appointment.clinicId);
  const doctor = appointment.doctorId ? doctors.find(d => d.id === appointment.doctorId) : null;
  
  if (!child || !daycare || !clinic) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="予約詳細" showBackButton />
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>予約データが不完全です</Text>
          <Text style={styles.notFoundSubtext}>
            {!child ? "子どもの情報が見つかりません" : ""}
            {!daycare ? "保育園の情報が見つかりません" : ""}
            {!clinic ? "クリニックの情報が見つかりません" : ""}
          </Text>
          <Button
            title="戻る"
            onPress={() => router.back()}
            variant="primary"
          />
        </View>
      </SafeAreaView>
    );
  }
  
  const handleCancelAppointment = () => {
    Alert.alert(
      "予約をキャンセル",
      "この予約をキャンセルしてもよろしいですか？",
      [
        {
          text: "いいえ",
          style: "cancel"
        },
        {
          text: "はい、キャンセルします",
          onPress: () => {
            cancelAppointment(id);
            router.back();
          },
          style: "destructive"
        }
      ]
    );
  };
  
  const openMeetingInBrowser = () => {
    // Make sure we have a meeting link
    const meetingLink = appointment.meetingLink || generateMeetingLink(appointment.id);
    
    try {
      Linking.openURL(meetingLink);
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
  
  const handleShareLink = async () => {
    const link = appointment.meetingLink || generateMeetingLink(appointment.id);
    
    try {
      if (Platform.OS === 'web') {
        Alert.alert(
          "ミーティングリンク",
          `以下のリンクを共有してください:
${link}`
        );
      } else {
        await Share.share({
          message: `テレケアコネクト オンライン診療に参加してください:
${link}`,
          url: link,
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
  
  const sendToBothFacilities = () => {
    if (!daycare || !clinic) return;
    
    const meetingLink = appointment.meetingLink || generateMeetingLink(id);
    const subject = `【テレケアコネクト】${child.name}さんのオンライン診療のご案内`;
    const body = `
${daycare.contactPerson || daycare.name}様、${clinic.name}様

${child.name}さんのオンライン診療のご案内です。

日時: ${new Date(appointment.date).toLocaleDateString('ja-JP')} ${appointment.time}
${doctor ? `医師: ${doctor.name} (${doctor.specialty})` : ''}
保育施設: ${daycare.name}
クリニック: ${clinic.name}

以下のリンクからオンライン診療にご参加ください:
${meetingLink}

※ リンクをクリックすると、ブラウザでJitsiミーティングが開きます。
※ カメラとマイクへのアクセスを許可してください。

よろしくお願いいたします。
`;
    
    const mailtoLink = `mailto:${daycare.email}?cc=${clinic.email}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    if (Platform.OS === 'web') {
      window.location.href = mailtoLink;
    } else {
      Alert.alert(
        "メール送信",
        `保育施設とクリニックへメールを送信します。メールアプリが開きます。`,
        [
          { text: "キャンセル", style: "cancel" },
          { 
            text: "送信", 
            onPress: () => {
              try {
                Linking.openURL(mailtoLink);
              } catch (error) {
                Alert.alert("エラー", "メールアプリを開けませんでした。");
              }
            }
          }
        ]
      );
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  const getStatusColor = () => {
    switch (appointment.status) {
      case 'scheduled':
        return colors.primary;
      case 'in-progress':
        return colors.warning;
      case 'completed':
        return colors.success;
      case 'cancelled':
        return colors.error;
      default:
        return colors.gray;
    }
  };

  const getStatusText = () => {
    switch (appointment.status) {
      case 'scheduled':
        return '予約済み';
      case 'in-progress':
        return '進行中';
      case 'completed':
        return '完了';
      case 'cancelled':
        return 'キャンセル';
      default:
        return '';
    }
  };
  
  const isUpcoming = appointment.status === 'scheduled';
  
  return (
    <SafeAreaView style={styles.container}>
      <Header title="予約詳細" showBackButton />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: getStatusColor() },
            ]}
          />
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>
        
        <Card variant="elevated" style={styles.mainCard}>
          <View style={styles.appointmentHeader}>
            <View style={styles.appointmentDate}>
              <Calendar size={20} color={colors.primary} />
              <Text style={styles.appointmentDateText}>
                {formatDate(appointment.date)}
              </Text>
            </View>
            <View style={styles.appointmentTime}>
              <Clock size={20} color={colors.primary} />
              <Text style={styles.appointmentTimeText}>
                {appointment.time}
              </Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>患者</Text>
            <View style={styles.infoRow}>
              <User size={18} color={colors.textLight} />
              <Text style={styles.infoText}>{child.name}</Text>
            </View>
          </View>
          
          {doctor && (
            <View style={styles.infoSection}>
              <Text style={styles.infoTitle}>医師</Text>
              <View style={styles.infoRow}>
                <User size={18} color={colors.textLight} />
                <Text style={styles.infoText}>{doctor.name}先生</Text>
              </View>
              <Text style={styles.infoSubtext}>{doctor.specialty}</Text>
            </View>
          )}
          
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>場所</Text>
            <View style={styles.infoRow}>
              <MapPin size={18} color={colors.textLight} />
              <Text style={styles.infoText}>保育園: {daycare.name}</Text>
            </View>
            <Text style={styles.infoSubtext}>{daycare.address}</Text>
            
            <View style={[styles.infoRow, { marginTop: 8 }]}>
              <MapPin size={18} color={colors.textLight} />
              <Text style={styles.infoText}>クリニック: {clinic.name}</Text>
            </View>
            <Text style={styles.infoSubtext}>{clinic.address}</Text>
          </View>
          
          {appointment.notes && (
            <View style={styles.infoSection}>
              <Text style={styles.infoTitle}>メモ</Text>
              <View style={styles.notesContainer}>
                <FileText size={18} color={colors.textLight} />
                <Text style={styles.notesText}>{appointment.notes}</Text>
              </View>
            </View>
          )}
          
          {appointment.meetingLink && (
            <View style={styles.infoSection}>
              <Text style={styles.infoTitle}>オンライン診療リンク</Text>
              <View style={styles.meetingLinkContainer}>
                <Text style={styles.meetingLinkText}>{appointment.meetingLink}</Text>
              </View>
            </View>
          )}
        </Card>
        
        {isUpcoming && (
          <View style={styles.actionsContainer}>
            {appointment.meetingLink ? (
              <>
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
              </>
            ) : (
              <>
                <Button
                  title="診療リンクを作成して送信"
                  onPress={sendToBothFacilities}
                  variant="primary"
                  icon={<Mail size={20} color={colors.white} />}
                  style={styles.actionButton}
                />
              </>
            )}
            
            <Button
              title="リンクを共有"
              onPress={handleShareLink}
              variant="outline"
              icon={<Share2 size={20} color={colors.primary} />}
              style={styles.actionButton}
            />
            
            <Button
              title="メッセージを送信"
              onPress={() => {}}
              variant="outline"
              icon={<MessageCircle size={20} color={colors.primary} />}
              style={styles.actionButton}
            />
            
            <Button
              title="予約をキャンセル"
              onPress={handleCancelAppointment}
              variant="text"
              textStyle={{ color: colors.error }}
              icon={<X size={20} color={colors.error} />}
              style={styles.cancelButton}
            />
          </View>
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
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notFoundText: {
    fontSize: 18,
    color: colors.textLight,
    marginBottom: 8,
    textAlign: 'center',
  },
  notFoundSubtext: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 20,
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  mainCard: {
    margin: 16,
    padding: 20,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  appointmentDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appointmentDateText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.primary,
  },
  appointmentTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appointmentTimeText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 16,
  },
  infoSection: {
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 16,
    color: colors.text,
  },
  infoSubtext: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 26,
    marginTop: 2,
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: colors.backgroundLight,
    padding: 12,
    borderRadius: 8,
  },
  notesText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
    lineHeight: 20,
  },
  meetingLinkContainer: {
    backgroundColor: colors.backgroundLight,
    padding: 12,
    borderRadius: 8,
  },
  meetingLinkText: {
    fontSize: 14,
    color: colors.primary,
    lineHeight: 20,
  },
  actionsContainer: {
    padding: 16,
    gap: 12,
  },
  actionButton: {
    width: '100%',
  },
  cancelButton: {
    width: '100%',
    marginTop: 8,
  },
});