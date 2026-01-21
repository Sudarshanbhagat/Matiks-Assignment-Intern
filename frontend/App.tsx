import React, { useEffect, useState } from 'react';
import {
  NavigationContainer,
  DefaultTheme,
} from '@react-navigation/native';
import {
  createBottomTabNavigator,
  BottomTabNavigationProp,
} from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';
import LeaderboardScreen from './src/screens/LeaderboardScreen';
import SearchScreen from './src/screens/SearchScreen';
import { Colors } from './src/theme';

// ErrorBoundary catches and displays errors gracefully. This might look like
// boilerplate, but in production, crashing silently is worse than showing a friendly
// error. Users need to know what went wrong.
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('React Error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#fff',
            padding: 20,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            App Error
          </Text>
          <Text style={{ color: '#666', textAlign: 'center' }}>
            {this.state.error?.message || 'An unknown error occurred'}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

type RootTabParamList = {
  Leaderboard: undefined;
  Search: undefined;
};

type TabNavigationProp = BottomTabNavigationProp<RootTabParamList>;

// Two tabs: Leaderboard (global rankings) and Search (live rank lookup).
const Tab = createBottomTabNavigator<RootTabParamList>();

// Navigation theme uses our design tokens (Colors). Centralized design tokens
// prevent magic numbers scattered everywhere. If we need to rebrand, one change
// updates the entire app.
const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.accentColor,
    background: Colors.background,
    card: Colors.cardBackground,
  },
};

/**
 * App (Root Navigator)
 *
 * We chose tab-based navigation for simplicity: Leaderboard and Search are
 * independent features that users flip between. No complex state threading.
 * Each tab re-fetches data on focus (handled in screen components).
 */
export default function App() {
  const [loading, setLoading] = useState(false);

  // Placeholder for initialization logic. In production, this would be app startup
  // checks (permissions, auth, feature flags, etc.).
  useEffect(() => {
    // Can add initialization logic here (auth, config fetch, etc.)
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <NavigationContainer theme={navigationTheme}>
        <Tab.Navigator
          screenOptions={{          // Tab styling: accent color when active, gray when inactive.
          // This gives users clear visual feedback about which tab they're on.            tabBarActiveTintColor: Colors.accentColor,
            tabBarInactiveTintColor: Colors.textSecondary,
            tabBarStyle: {
              backgroundColor: Colors.cardBackground,
              borderTopColor: Colors.borderLight,
              borderTopWidth: 1,
            },
            headerStyle: {
              backgroundColor: Colors.cardBackground,
              borderBottomColor: Colors.borderLight,
              borderBottomWidth: 1,
            },
            headerTitleStyle: {
              color: Colors.textPrimary,
              fontWeight: '600',
            },
          }}
        >
          <Tab.Screen
            name="Leaderboard"
            component={LeaderboardScreen}
            options={{
              title: 'Leaderboard',
              // FlatList with fixed row height = smooth scrolling for thousands of users
              tabBarLabel: 'Rankings',
            }}
          />
          <Tab.Screen
            name="Search"
            component={SearchScreen}
            options={{
              title: 'Search Players',
              // Frontend never caches ranks. We fetch fresh rank with each search.
              // Users see live data, not stale guesses.
              tabBarLabel: 'Search',
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
