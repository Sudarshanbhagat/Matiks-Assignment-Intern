/**
 * Image Asset Verification Utility
 * 
 * This component verifies that image assets are readable by React Native Web.
 * If images fail to load, they'll show error states instead of crashing the build.
 */

import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';

const ImageVerifier = () => {
  const [imageStatus, setImageStatus] = React.useState({
    icon: 'checking',
    splash: 'checking',
    adaptiveIcon: 'checking',
  });

  const checkImage = (uri, name) => {
    try {
      const img = new Image();
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
      {Object.entries(imageStatus).map(([name, status]) => (
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
