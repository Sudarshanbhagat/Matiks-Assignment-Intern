import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Colors, Spacing, Typography, Layout } from '../theme';

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  isLoading?: boolean;
}

/**
 * Search input component (dumb component—no debounce logic).
 * The parent (SearchScreen) handles debouncing because it also manages the
 * results state. This component just renders the input field and shows a
 * loading spinner when parent is fetching.
 *
 * Fixed height: 44px (iOS standard). Rounded border, light theme.
 */
const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChangeText,
  placeholder = 'Search username…',
  isLoading = false,
}) => {
  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      height: Layout.searchInputHeight,
      backgroundColor: Colors.cardBackground,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: Colors.borderLight,
      paddingHorizontal: Spacing.md,
      marginHorizontal: Spacing.md,
      marginVertical: Spacing.md,
    },
    input: {
      flex: 1,
      fontSize: Typography.fontSize.base,
      color: Colors.textPrimary,
      height: '100%',
    },
    loader: {
      marginLeft: Spacing.sm,
    },
  });

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={Colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
        editable={!isLoading}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
      {isLoading && (
        <ActivityIndicator
          size="small"
          color={Colors.accentColor}
          style={styles.loader}
        />
      )}
    </View>
  );
};

export default SearchInput;
