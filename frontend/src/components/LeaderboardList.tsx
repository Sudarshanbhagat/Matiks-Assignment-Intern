import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  ListRenderItem,
} from 'react-native';
import { Colors, Spacing, Typography, Layout } from '../theme';
import LeaderboardRow from './LeaderboardRow';
import { LeaderboardEntry } from '../types';

interface LeaderboardListProps {
  data: LeaderboardEntry[];
  isLoading: boolean;
  onEndReached?: () => void;
}

/**
 * Optimized leaderboard FlatList component
 *
 * Why getItemLayout matters:
 * We use fixed row height (60px). This lets FlatList skip layout calculations
 * during scrolling—critical for smooth 1000-row lists. Without it, each scroll
 * triggers re-layout for every row (jank). Trade-off: we lose flexible row heights,
 * but gain smooth UX at scale.
 *
 * Performance optimizations:
 * 1. getItemLayout (60px rows) - O(1) scroll position calculation
 * 2. removeClippedSubviews - memory efficient, renders only visible rows + buffer
 * 3. maxToRenderPerBatch - reduces first render time
 * 4. Sticky header - column labels always visible
 * 5. No images, animations, or dynamic heights per row
 */
const LeaderboardList: React.FC<LeaderboardListProps> = ({
  data,
  isLoading,
  onEndReached,
}) => {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.background,
    },
    headerContainer: {
      backgroundColor: Colors.cardBackground,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: Colors.borderLight,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    headerRank: {
      width: '20%',
      fontWeight: Typography.fontWeight.bold,
      color: Colors.textSecondary,
      fontSize: Typography.fontSize.sm,
    },
    headerUsername: {
      width: '50%',
      fontWeight: Typography.fontWeight.bold,
      color: Colors.textSecondary,
      fontSize: Typography.fontSize.sm,
    },
    headerRating: {
      width: '30%',
      textAlign: 'right',
      fontWeight: Typography.fontWeight.bold,
      color: Colors.textSecondary,
      fontSize: Typography.fontSize.sm,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: {
      fontSize: Typography.fontSize.base,
      color: Colors.textSecondary,
    },
    footerLoader: {
      paddingVertical: Spacing.lg,
    },
  });

  const renderItem: ListRenderItem<LeaderboardEntry> = ({ item }) => (
    <LeaderboardRow
      rank={item.rank}
      username={item.username}
      rating={item.rating}
    />
  );

  const getItemLayout = (data: ArrayLike<LeaderboardEntry> | null | undefined, index: number) => ({
    length: Layout.leaderboardRowHeight + Spacing.xs * 2,
    offset: (Layout.leaderboardRowHeight + Spacing.xs * 2) * index,
    index,
  });

  const keyExtractor = (item: LeaderboardEntry, index: number) =>
    `${item.rank}-${item.username}-${index}`;

  // Ensure data is always an array
  const safeData = Array.isArray(data) ? data : [];

  if (isLoading && safeData.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accentColor} />
      </View>
    );
  }

  if (safeData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.headerRank}>Rank</Text>
          <Text style={styles.headerUsername}>Username</Text>
          <Text style={styles.headerRating}>Rating</Text>
        </View>
      </View>

      <FlatList
        data={safeData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        removeClippedSubviews={true}
        maxToRenderPerBatch={20}
        updateCellsBatchingPeriod={50}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        scrollEventThrottle={16}
        ListFooterComponent={
          isLoading ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={Colors.accentColor} />
            </View>
          ) : null
        }
      />
    </View>
  );
};

export default LeaderboardList;
