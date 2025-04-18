import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/Card';
import { colors } from '@/constants/colors';
import { 
  Bell, 
  Lock, 
  HelpCircle, 
  FileText, 
  Shield, 
  ChevronRight,
  Smartphone,
  Globe,
  Mail,
  Calendar
} from 'lucide-react-native';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = React.useState(true);
  const [appointmentRemindersEnabled, setAppointmentRemindersEnabled] = React.useState(true);
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>設定</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>通知</Text>
          
          <Card variant="outlined" style={styles.card}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Bell size={20} color={colors.text} />
                <Text style={styles.settingText}>プッシュ通知</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: colors.grayLight, true: colors.primaryLight }}
                thumbColor={notificationsEnabled ? colors.primary : colors.gray}
              />
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Mail size={20} color={colors.text} />
                <Text style={styles.settingText}>メール通知</Text>
              </View>
              <Switch
                value={emailNotificationsEnabled}
                onValueChange={setEmailNotificationsEnabled}
                trackColor={{ false: colors.grayLight, true: colors.primaryLight }}
                thumbColor={emailNotificationsEnabled ? colors.primary : colors.gray}
              />
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Calendar size={20} color={colors.text} />
                <Text style={styles.settingText}>予約リマインダー</Text>
              </View>
              <Switch
                value={appointmentRemindersEnabled}
                onValueChange={setAppointmentRemindersEnabled}
                trackColor={{ false: colors.grayLight, true: colors.primaryLight }}
                thumbColor={appointmentRemindersEnabled ? colors.primary : colors.gray}
              />
            </View>
          </Card>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>アプリ設定</Text>
          
          <Card variant="outlined" style={styles.card}>
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Smartphone size={20} color={colors.text} />
                <Text style={styles.settingText}>アプリ設定</Text>
              </View>
              <ChevronRight size={20} color={colors.gray} />
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Globe size={20} color={colors.text} />
                <Text style={styles.settingText}>言語</Text>
              </View>
              <View style={styles.valueContainer}>
                <Text style={styles.valueText}>日本語</Text>
                <ChevronRight size={20} color={colors.gray} />
              </View>
            </TouchableOpacity>
          </Card>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>セキュリティとプライバシー</Text>
          
          <Card variant="outlined" style={styles.card}>
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Lock size={20} color={colors.text} />
                <Text style={styles.settingText}>パスワード変更</Text>
              </View>
              <ChevronRight size={20} color={colors.gray} />
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Shield size={20} color={colors.text} />
                <Text style={styles.settingText}>プライバシー設定</Text>
              </View>
              <ChevronRight size={20} color={colors.gray} />
            </TouchableOpacity>
          </Card>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>サポート</Text>
          
          <Card variant="outlined" style={styles.card}>
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <HelpCircle size={20} color={colors.text} />
                <Text style={styles.settingText}>ヘルプとサポート</Text>
              </View>
              <ChevronRight size={20} color={colors.gray} />
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <FileText size={20} color={colors.text} />
                <Text style={styles.settingText}>利用規約</Text>
              </View>
              <ChevronRight size={20} color={colors.gray} />
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <FileText size={20} color={colors.text} />
                <Text style={styles.settingText}>プライバシーポリシー</Text>
              </View>
              <ChevronRight size={20} color={colors.gray} />
            </TouchableOpacity>
          </Card>
        </View>
        
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>バージョン 1.0.0</Text>
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
  section: {
    padding: 20,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  valueText: {
    fontSize: 14,
    color: colors.textLight,
  },
  versionContainer: {
    padding: 24,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    color: colors.textLight,
  },
});