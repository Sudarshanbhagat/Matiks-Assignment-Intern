import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import SearchInput from '../components/SearchInput';
import SearchResultsList from '../components/SearchResultsList';
import { SearchResult } from '../types';
import apiService from '../services/api';
import { Colors } from '../theme';

/**
 * Search Screen
 *
 * Users search for players by username prefix. We debounce input (300ms) to
 * avoid hammering the backend with every keystroke (user types 'alice' = 5 API
 * calls without debounce, 1 call with debounce).
 *
 * Critical invariant: Each search result shows its live-computed rank, fetched
 * from the server at request time. We never cache or derive ranks locally.
 */
const SearchScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.background,
    },
  });

  // Debounced search: Wait 300ms after user stops typing before making API call.
  // Why? Avoid unnecessary requests. If user types 'alice' quickly, we send
  // one request for 'alice', not requests for 'a', 'al', 'ali', 'alic', 'alice'.
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);

      // Clear previous timer
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      // No search if empty
      if (!query.trim()) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      // Set new timer for debounced search. If user types again before 300ms,
      // we clear this and set a new one (see the if statement above).
      const timer = setTimeout(async () => {
        try {
          setIsLoading(true);
          const searchResults = await apiService.searchUsers(query);
          setResults(searchResults);
        } catch (error) {
          console.error('Search failed:', error);
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      }, 300); // 300ms debounce

      setDebounceTimer(timer);
    },
    [debounceTimer]
  );

  // Clean up the debounce timer when the component unmounts to prevent
  // memory leaks and stale requests after screen is closed.
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <SearchInput
          value={searchQuery}
          onChangeText={handleSearch}
          isLoading={isLoading}
        />
        <SearchResultsList
          data={results}
          isLoading={isLoading}
          isEmpty={searchQuery.trim().length === 0}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default SearchScreen;
