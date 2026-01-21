/**
 * Image Asset Verification Utility
 * 
 * This component verifies that image assets are readable.
 * Optional debug component - can be removed if not needed.
 */

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

interface ImageStatus {
  icon: 'checking' | 'ok' | 'error';
  splash: 'checking' | 'ok' | 'error';
  adaptiveIcon: 'checking' | 'ok' | 'error';
}

const ImageVerifier: React.FC = () => {
  const [imageStatus, setImageStatus] = React.useState<ImageStatus>({
    icon: 'checking',
    splash: 'checking',
    adaptiveIcon: 'checking',
  });

  const checkImage = (uri: string, name: keyof ImageStatus) => {
    if (typeof window === 'undefined') {
      setImageStatus(prev => ({ ...prev, [name]: 'ok' }));
      return;
    }

    try {
      const img = new (window as any).Image();
      img.onload = () => {
        setImageStatus(prev => ({ ...prev, [name]: 'ok' }));
        console.log(`✓ ${name} loaded successfully`);
      };
      img.onerror = () => {
        setImageStatus(prev => ({ ...prev, [name]: 'error' }));
        console.warn(`✗ ${name} failed to load`);
      };
      img.src = uri;
    } catch (error) {
      setImageStatus(prev => ({ ...prev, [name]: 'error' }));
      console.error(`Error checking ${name}:`, error);
    }
  };

  React.useEffect(() => {
    checkImage('./assets/icon.png', 'icon');
    checkImage('./assets/splash.png', 'splash');
    checkImage('./assets/adaptive-icon.png', 'adaptiveIcon');
  }, []);

  const styles = StyleSheet.create({
    container: {
      padding: 16,
      marginTop: 16,
      backgroundColor: '#f0f0f0',
      borderRadius: 8,
    },
    statusItem: {
      marginBottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },
    statusText: {
      marginLeft: 8,
      fontFamily: 'monospace',
      fontSize: 12,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={{ fontWeight: 'bold', marginBottom: 12 }}>Asset Status</Text>
      {(Object.entries(imageStatus) as Array<[keyof ImageStatus, string]>).map(([name, status]) => (
        <View key={name} style={styles.statusItem}>
          <Text style={styles.statusText}>
            {status === 'ok' ? '✓' : status === 'error' ? '✗' : '...'} {name}: {status}
          </Text>
        </View>
      ))}
    </View>
  );
};

export default ImageVerifier;
