import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, Text, ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors } from '@/constants/colors';

interface JitsiMeetingProps {
  url: string;
  userInfo?: {
    displayName?: string;
    email?: string;
    avatarURL?: string;
  };
  style?: ViewStyle;
  audioMuted?: boolean;
  videoMuted?: boolean;
}

export const JitsiMeeting: React.FC<JitsiMeetingProps> = ({
  url,
  userInfo = {},
  style,
  audioMuted = false,
  videoMuted = false,
}) => {
  const webViewRef = useRef<WebView>(null);

  // Extract room name from URL
  const getRoomName = (url: string) => {
    try {
      // For URLs like https://meet.jit.si/roomName
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      return pathParts[pathParts.length - 1] || 'TOUCHMeeting';
    } catch (e) {
      // If URL parsing fails, use the URL as is or a default
      return url.split('/').pop() || 'TOUCHMeeting';
    }
  };

  const roomName = getRoomName(url);
  
  // Create a clean domain from the URL
  const getDomain = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.origin;
    } catch (e) {
      // Default to meet.jit.si if parsing fails
      return 'https://meet.jit.si';
    }
  };

  const domain = getDomain(url);

  // Generate HTML for the Jitsi iframe
  const generateJitsiHtml = () => {
    const { displayName = '保護者', email = '', avatarURL = '' } = userInfo;
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
          <title>TOUCH オンライン診療</title>
          <style>
            body, html {
              margin: 0;
              padding: 0;
              overflow: hidden;
              height: 100%;
              width: 100%;
            }
            #jitsiContainer {
              height: 100%;
              width: 100%;
            }
          </style>
          <script src='https://meet.jit.si/external_api.js'></script>
        </head>
        <body>
          <div id="jitsiContainer"></div>
          <script>
            // Wait for the API to load
            document.addEventListener('DOMContentLoaded', () => {
              try {
                const domain = '${domain.replace('https://', '')}';
                const options = {
                  roomName: '${roomName}',
                  width: '100%',
                  height: '100%',
                  parentNode: document.getElementById('jitsiContainer'),
                  userInfo: {
                    displayName: '${displayName}',
                    email: '${email}',
                    avatarURL: '${avatarURL}'
                  },
                  configOverwrite: {
                    startWithAudioMuted: ${audioMuted},
                    startWithVideoMuted: ${videoMuted},
                    prejoinPageEnabled: false,
                    disableDeepLinking: true,
                    startAudioOnly: false,
                    startScreenSharing: false,
                    enableWelcomePage: false,
                    defaultLanguage: 'ja',
                    disableInviteFunctions: true,
                    toolbarButtons: [
                      'microphone', 'camera', 'desktop', 'chat',
                      'raisehand', 'videoquality', 'fullscreen', 'hangup'
                    ]
                  },
                  interfaceConfigOverwrite: {
                    TOOLBAR_BUTTONS: [
                      'microphone', 'camera', 'desktop', 'chat',
                      'raisehand', 'videoquality', 'fullscreen', 'hangup'
                    ],
                    SHOW_JITSI_WATERMARK: false,
                    SHOW_WATERMARK_FOR_GUESTS: false,
                    DEFAULT_BACKGROUND: '#3D3D3D',
                    DEFAULT_REMOTE_DISPLAY_NAME: '参加者',
                    DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
                    MOBILE_APP_PROMO: false,
                  }
                };
                
                const api = new JitsiMeetExternalAPI(domain, options);
                
                // Listen for API ready
                api.addEventListener('videoConferenceJoined', () => {
                  // Set initial audio/video state
                  api.isAudioMuted().then(muted => {
                    if (muted !== ${audioMuted}) {
                      api.executeCommand('toggleAudio');
                    }
                  });
                  
                  api.isVideoMuted().then(muted => {
                    if (muted !== ${videoMuted}) {
                      api.executeCommand('toggleVideo');
                    }
                  });
                });
                
                // Handle messages from React Native
                window.addEventListener('message', event => {
                  const { type, data } = event.data;
                  
                  if (type === 'toggleAudio') {
                    api.executeCommand('toggleAudio');
                  } else if (type === 'toggleVideo') {
                    api.executeCommand('toggleVideo');
                  } else if (type === 'hangup') {
                    api.executeCommand('hangup');
                  }
                });
                
                // Notify React Native when ready
                window.ReactNativeWebView?.postMessage(JSON.stringify({
                  type: 'jitsiLoaded',
                  success: true
                }));
              } catch (error) {
                console.error('Jitsi initialization error:', error);
                window.ReactNativeWebView?.postMessage(JSON.stringify({
                  type: 'jitsiError',
                  error: error.toString()
                }));
              }
            });
          </script>
        </body>
      </html>
    `;
  };

  // Handle messages from WebView
  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('Message from WebView:', data);
      
      if (data.type === 'jitsiError') {
        console.error('Jitsi error:', data.error);
      }
    } catch (e) {
      console.log('Non-JSON message from WebView:', event.nativeEvent.data);
    }
  };

  // Send commands to WebView
  useEffect(() => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({
        type: 'toggleAudio',
        muted: audioMuted
      }));
    }
  }, [audioMuted]);

  useEffect(() => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({
        type: 'toggleVideo',
        muted: videoMuted
      }));
    }
  }, [videoMuted]);

  // For web platform, we'll use a different approach
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, style]}>
        <iframe
          allow="camera; microphone; fullscreen; display-capture; autoplay"
          src={`${domain}/${roomName}?config.prejoinPageEnabled=false&userInfo.displayName=${encodeURIComponent(userInfo.displayName || '保護者')}`}
          style={{
            height: '100%',
            width: '100%',
            border: 'none',
          }}
          allowFullScreen={true}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: generateJitsiHtml() }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        onMessage={handleMessage}
        style={styles.webView}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    overflow: 'hidden',
  },
  webView: {
    flex: 1,
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fallbackText: {
    color: colors.white,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
});