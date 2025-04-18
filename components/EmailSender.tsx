import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  ActivityIndicator, 
  TouchableOpacity, 
  Alert,
  Platform
} from 'react-native';
import { colors } from '@/constants/colors';
import { useChildStore } from '@/store/child-store';
import { useDaycareStore } from '@/store/daycare-store';
import { useClinicStore } from '@/store/clinic-store';
import * as MailComposer from 'expo-mail-composer';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { X, Mail, Check } from 'lucide-react-native';

interface EmailSenderProps {
  childId: string;
  daycareId: string;
  clinicId: string;
  meetingLink: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const EmailSender: React.FC<EmailSenderProps> = ({
  childId,
  daycareId,
  clinicId,
  meetingLink,
  onClose,
  onSuccess
}) => {
  const { children } = useChildStore();
  const { daycares } = useDaycareStore();
  const { clinics } = useClinicStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<'preparing' | 'sending' | 'success' | 'error'>('preparing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const child = children.find(c => c.id === childId);
  const daycare = daycares.find(d => d.id === daycareId);
  const clinic = clinics.find(c => c.id === clinicId);
  
  useEffect(() => {
    // Check for permissions first to avoid unexpected permission dialogs
    const checkPermissions = async () => {
      if (child?.insuranceCardImage || child?.recipientCertImage) {
        try {
          const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync({
            iosUseSystemDialog: true
          });
          
          if (!permissionResult.granted) {
            Alert.alert(
              'アクセス許可が必要です',
              'メールに画像を添付するには、写真へのアクセス許可が必要です。設定アプリから許可を変更できます。',
              [
                { text: 'キャンセル', style: 'cancel', onPress: onClose },
                { text: '設定を開く', onPress: () => ImagePicker.openSettings() }
              ]
            );
            return false;
          }
          return true;
        } catch (error) {
          console.error('Permission check error:', error);
          return false;
        }
      }
      return true;
    };
    
    const initializeEmailSender = async () => {
      const hasPermissions = await checkPermissions();
      if (hasPermissions && child && daycare && clinic) {
        prepareAndSendEmail();
      } else if (!hasPermissions) {
        // Permission denied, handled in checkPermissions
        setIsLoading(false);
      } else {
        setStatus('error');
        setErrorMessage('必要な情報が見つかりません。');
        setIsLoading(false);
      }
    };
    
    initializeEmailSender();
  }, [childId, daycareId, clinicId, meetingLink]);
  
  const prepareAndSendEmail = async () => {
    if (!child || !daycare || !clinic) {
      setStatus('error');
      setErrorMessage('必要な情報が見つかりません。');
      setIsLoading(false);
      return;
    }
    
    setStatus('preparing');
    setIsLoading(true);
    
    try {
      // Check if MailComposer is available
      const isAvailable = await MailComposer.isAvailableAsync();
      
      if (!isAvailable) {
        throw new Error('メール送信機能が利用できません。');
      }
      
      // Prepare attachments
      const attachments: string[] = [];
      
      // Process insurance card image if available
      if (child.insuranceCardImage) {
        try {
          const localUri = await prepareAttachment(child.insuranceCardImage, `${child.name}_保険証.jpg`);
          if (localUri) {
            attachments.push(localUri);
          }
        } catch (error) {
          console.error('Failed to prepare insurance card image:', error);
        }
      }
      
      // Process recipient certificate image if available
      if (child.recipientCertImage) {
        try {
          const localUri = await prepareAttachment(child.recipientCertImage, `${child.name}_受給者証.jpg`);
          if (localUri) {
            attachments.push(localUri);
          }
        } catch (error) {
          console.error('Failed to prepare recipient cert image:', error);
        }
      }
      
      // Prepare email content
      const subject = `【TOUCH】${child.name}さんのオンライン診療のご案内`;
      
      const body = `
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
      
      // Send email
      setStatus('sending');
      
      const result = await MailComposer.composeAsync({
        recipients: [daycare.email],
        ccRecipients: [clinic.email],
        subject: subject,
        body: body,
        attachments: attachments,
        isHtml: false,
      });
      
      if (result.status === 'sent') {
        setStatus('success');
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        // User cancelled or other status
        onClose();
      }
    } catch (error) {
      console.error('Email sending error:', error);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : '不明なエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to prepare attachments
  const prepareAttachment = async (uri: string, filename: string): Promise<string | null> => {
    // If the URI is already a file URI, return it
    if (uri.startsWith('file://')) {
      return uri;
    }
    
    // For remote URIs, download the file first
    if (uri.startsWith('http')) {
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;
      
      try {
        const { uri: downloadUri } = await FileSystem.downloadAsync(uri, fileUri);
        return downloadUri;
      } catch (error) {
        console.error('Error downloading file:', error);
        return null;
      }
    }
    
    // For content URIs (like content://), we need to copy them to a file URI
    if (Platform.OS === 'android' && uri.startsWith('content://')) {
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;
      
      try {
        await FileSystem.copyAsync({
          from: uri,
          to: fileUri
        });
        return fileUri;
      } catch (error) {
        console.error('Error copying file:', error);
        return null;
      }
    }
    
    // If we can't handle the URI, return null
    return uri;
  };
  
  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={onClose}
            disabled={isLoading}
          >
            <X size={24} color={colors.text} />
          </TouchableOpacity>
          
          <Text style={styles.title}>メール送信</Text>
          
          <View style={styles.statusContainer}>
            {isLoading ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : status === 'success' ? (
              <View style={styles.successContainer}>
                <View style={styles.successIcon}>
                  <Check size={40} color={colors.white} />
                </View>
                <Text style={styles.successText}>メールを送信しました</Text>
              </View>
            ) : status === 'error' ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorTitle}>エラーが発生しました</Text>
                <Text style={styles.errorMessage}>{errorMessage}</Text>
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={prepareAndSendEmail}
                >
                  <Text style={styles.retryButtonText}>再試行</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.preparingContainer}>
                <Text style={styles.preparingText}>
                  {status === 'preparing' ? 'メールを準備中...' : 'メールを送信中...'}
                </Text>
                <Text style={styles.preparingSubtext}>
                  {status === 'preparing' 
                    ? '保険証と受給者証の画像を添付しています' 
                    : 'メールアプリが開きます'}
                </Text>
              </View>
            )}
          </View>
          
          {!isLoading && status !== 'success' && (
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>キャンセル</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
    zIndex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  statusContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
  },
  preparingContainer: {
    alignItems: 'center',
  },
  preparingText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  preparingSubtext: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
  },
  successContainer: {
    alignItems: 'center',
  },
  successIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.success,
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    width: '100%',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 24,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  cancelButtonText: {
    color: colors.textLight,
    fontWeight: '500',
  },
});