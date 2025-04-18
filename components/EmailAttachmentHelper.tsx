import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Linking, Image } from 'react-native';
import { colors } from '@/constants/colors';
import { ImageIcon, Download, FileText } from 'lucide-react-native';

interface EmailAttachmentHelperProps {
  childName: string;
  insuranceCardImage?: string | null;
  recipientCertImage?: string | null;
  onClose: () => void;
}

export const EmailAttachmentHelper: React.FC<EmailAttachmentHelperProps> = ({
  childName,
  insuranceCardImage,
  recipientCertImage,
  onClose
}) => {
  const hasInsuranceCard = !!insuranceCardImage;
  const hasRecipientCert = !!recipientCertImage;
  
  const openImage = (imageUrl: string, title: string) => {
    if (Platform.OS === 'web') {
      window.open(imageUrl, '_blank');
    } else {
      Linking.openURL(imageUrl);
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>メールに添付する画像</Text>
      
      <Text style={styles.instructions}>
        メールアプリで以下の画像を手動で添付してください。
      </Text>
      
      {!hasInsuranceCard && !hasRecipientCert ? (
        <View style={styles.noImagesContainer}>
          <Text style={styles.noImagesText}>
            保険証・受給者証の画像が登録されていません。
          </Text>
          <Text style={styles.noImagesSubtext}>
            プロフィール画面からお子様の情報を編集して、画像を追加できます。
          </Text>
        </View>
      ) : (
        <View style={styles.imagesContainer}>
          {hasInsuranceCard && (
            <View style={styles.imageCard}>
              <View style={styles.imageHeader}>
                <ImageIcon size={20} color={colors.primary} />
                <Text style={styles.imageTitle}>保険証</Text>
              </View>
              {Platform.OS !== 'web' && insuranceCardImage && (
                <Image 
                  source={{ uri: insuranceCardImage }} 
                  style={styles.imagePreview} 
                  resizeMode="cover"
                />
              )}
              <TouchableOpacity 
                style={styles.imageButton}
                onPress={() => openImage(insuranceCardImage!, "保険証")}
              >
                <Text style={styles.imageButtonText}>
                  {`${childName}_保険証.jpg`}
                </Text>
                <Download size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>
          )}
          
          {hasRecipientCert && (
            <View style={styles.imageCard}>
              <View style={styles.imageHeader}>
                <FileText size={20} color={colors.primary} />
                <Text style={styles.imageTitle}>受給者証</Text>
              </View>
              {Platform.OS !== 'web' && recipientCertImage && (
                <Image 
                  source={{ uri: recipientCertImage }} 
                  style={styles.imagePreview} 
                  resizeMode="cover"
                />
              )}
              <TouchableOpacity 
                style={styles.imageButton}
                onPress={() => openImage(recipientCertImage!, "受給者証")}
              >
                <Text style={styles.imageButtonText}>
                  {`${childName}_受給者証.jpg`}
                </Text>
                <Download size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
      
      <TouchableOpacity 
        style={styles.closeButton}
        onPress={onClose}
      >
        <Text style={styles.closeButtonText}>閉じる</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  instructions: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  noImagesContainer: {
    backgroundColor: colors.backgroundLight,
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  noImagesText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  noImagesSubtext: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
  },
  imagesContainer: {
    marginBottom: 20,
  },
  imageCard: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  imageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  imageTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginLeft: 8,
  },
  imagePreview: {
    width: '100%',
    height: 150,
    borderRadius: 6,
    marginBottom: 8,
  },
  imageButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  imageButtonText: {
    fontSize: 14,
    color: colors.primary,
  },
  closeButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});