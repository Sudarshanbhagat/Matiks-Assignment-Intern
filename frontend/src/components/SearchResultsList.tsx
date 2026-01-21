import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ListRenderItem,
  ActivityIndicator,
} from 'react-native';
import { Colors, Spacing, Typography } from '../theme';
import LeaderboardRow from './LeaderboardRow';
import { SearchResult } from '../types';

interface SearchResultsListProps {
  data: SearchResult[];
  isLoading: boolean;
  isEmpty: boolean;
}

/**
 * Search results list component. Reuses LeaderboardRow for consistent styling.
 * Each result includes its global_rank, computed server-side at search time.
 * We never cache or guess ranks—frontend shows exactly what backend said.
 *
 * FlatList optimization: removeClippedSubviews + scrollEventThrottle keep memory
 * and CPU usage reasonable, even for 50 results.
 */
const SearchResultsList: React.FC<SearchResultsListProps> = ({
  data,
  isLoading,
  isEmpty,
}) => {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.background,
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
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    resultCount: {
      fontSize: Typography.fontSize.sm,
      color: Colors.textSecondary,
      marginHorizontal: Spacing.md,
      marginTop: Spacing.md,
    },
  });

  const renderItem: ListRenderItem<SearchResult> = ({ item }) => (
    <LeaderboardRow
      rank={item.global_rank}
      username={item.username}
      rating={item.rating}
    />
  );

  const keyExtractor = (item: SearchResult, index: number) =>
    `search-${item.username}-${index}`;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accentColor} />
      </View>
    );
  }

  if (isEmpty && data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No results found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.resultCount}>
        {data.length} result{data.length !== 1 ? 's' : ''}
      </Text>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        removeClippedSubviews={true}
        maxToRenderPerBatch={20}
        scrollEventThrottle={16}
      />
    </View>
  );
};

export default SearchResultsList;
