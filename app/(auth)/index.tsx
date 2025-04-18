import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';

export default function WelcomeScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  // Use a timeout to ensure the Root Layout is mounted before navigation
  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        router.replace('/(tabs)/consultations');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    router.push('/login');
  };

  const handleRegister = () => {
    router.push('/register');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' }}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        
        <Text style={styles.title}>TOUCH</Text>
        <Text style={styles.subtitle}>
          保護者、保育施設、クリニックをつなぐ{'\n'}シームレスなオンライン診療
        </Text>
        
        <View style={styles.features}>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureEmoji}>👨‍👩‍👧‍👦</Text>
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>保護者向け</Text>
              <Text style={styles.featureDescription}>
                どこからでもお子様の健康を管理
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureEmoji}>🏫</Text>
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>保育施設向け</Text>
              <Text style={styles.featureDescription}>
                医療機関とすぐに連携
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureEmoji}>👩‍⚕️</Text>
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>クリニック向け</Text>
              <Text style={styles.featureDescription}>
                効率的な遠隔医療を提供
              </Text>
            </View>
          </View>
        </View>
      </View>
      
      <View style={styles.buttons}>
        <Button
          title="ログイン"
          onPress={handleLogin}
          variant="primary"
          style={styles.button}
        />
        <Button
          title="アカウント作成"
          onPress={handleRegister}
          variant="outline"
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  features: {
    marginTop: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureEmoji: {
    fontSize: 24,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
  },
  buttons: {
    padding: 24,
    gap: 12,
  },
  button: {
    width: '100%',
  },
});