import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Colors, Spacing, Typography, Layout } from '../theme';

interface LeaderboardRowProps {
  rank: number;
  username: string;
  rating: number;
}

/**
 * Fixed-height leaderboard row (exactly 60px). This constraint is intentional:
 * fixed height enables FlatList's getItemLayout optimization, which makes scroll
 * position calculation O(1) instead of O(N). For 1000-row lists, this is the
 * difference between smooth (60fps) and janky (10fps) scrolling.
 *
 * Layout: Rank (20%) | Username (50%) | Rating (30%)
 * Design: Top 3 get subtle gold left border + light accent background (no gradients).
 * No animations, no images, no dynamic heights. Performance-first.
 */
const LeaderboardRow: React.FC<LeaderboardRowProps> = ({
  rank,
  username,
  rating,
}) => {
  const isTopThree = rank <= 3;

  const styles = StyleSheet.create({
    container: {
      height: Layout.leaderboardRowHeight,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: isTopThree ? Colors.accentColor + '08' : Colors.cardBackground,
      paddingHorizontal: Spacing.md,
      borderRadius: 8,
      marginHorizontal: Spacing.md,
      marginVertical: Spacing.xs,
      borderLeftWidth: isTopThree ? 3 : 0,
      borderLeftColor: isTopThree ? Colors.topThreeGold : 'transparent',
    },
    rankSection: {
      width: '20%',
      justifyContent: 'center',
    },
    rankText: {
      fontSize: Typography.fontSize.lg,
      fontWeight: Typography.fontWeight.bold,
      color: isTopThree ? Colors.topThreeGold : Colors.textPrimary,
    },
    usernameSection: {
      width: '50%',
      justifyContent: 'center',
    },
    usernameText: {
      fontSize: Typography.fontSize.base,
      fontWeight: Typography.fontWeight.medium,
      color: Colors.textPrimary,
    },
    ratingSection: {
      width: '30%',
      alignItems: 'flex-end',
      justifyContent: 'center',
    },
    ratingText: {
      fontSize: Typography.fontSize.base,
      fontWeight: Typography.fontWeight.bold,
      color: Colors.accentColor,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.rankSection}>
        <Text style={styles.rankText}>#{rank}</Text>
      </View>

      <View style={styles.usernameSection}>
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={styles.usernameText}
        >
          {username}
        </Text>
      </View>

      <View style={styles.ratingSection}>
        <Text style={styles.ratingText}>{rating}</Text>
      </View>
    </View>
  );
};

export default LeaderboardRow;
