import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import LeaderboardList from '../components/LeaderboardList';
import { LeaderboardEntry } from '../types';
import apiService from '../services/api';
import { Colors } from '../theme';

/**
 * Leaderboard Screen
 *
 * Displays global rankings fetched from backend. All ranks are computed server-side
 * because the backend sees the live state; frontend never guesses or caches ranks.
 *
 * Pagination strategy: We fetch 100 * page_number total (cumulative), then slice
 * client-side. Trade-off: This means we re-fetch earlier ranks, but keeps API
 * stateless and ensures no pagination gaps if data updates between requests.
 */
const LeaderboardScreen: React.FC = () => {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.background,
    },
  });

  // Fetch initial leaderboard (top 100). This only runs once on screen mount.
  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        setIsLoading(true);
        const result = await apiService.getLeaderboard(100);
        setData(Array.isArray(result) ? result : []);
        setPage(1);
      } catch (error) {
        console.error('Failed to load leaderboard:', error);
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadLeaderboard();
  }, []);

  // When user scrolls to bottom, load the next page.
  // We fetch limit = 100 * (page + 1) total entries, then FlatList
  // automatically shows the new ones because data array grows.
  const handleEndReached = useCallback(async () => {
    if (isLoadingMore || isLoading) return;

    try {
      setIsLoadingMore(true);
      const limit = 100 * (page + 1);
      const result = await apiService.getLeaderboard(limit);
      setData(Array.isArray(result) ? result : []);
      setPage(page + 1);
    } catch (error) {
      console.error('Failed to load more entries:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [page, isLoadingMore, isLoading]);

  return (
    <View style={styles.container}>
      <LeaderboardList
        data={data}
        isLoading={isLoading}
        onEndReached={handleEndReached}
      />
    </View>
  );
};

export default LeaderboardScreen;
