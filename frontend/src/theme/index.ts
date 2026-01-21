export const Colors = {
  background: '#F7F7F7',
  cardBackground: '#FFFFFF',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  accentColor: '#2563EB',
  borderLight: '#E5E7EB',
  topThreeGold: '#F59E0B',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

export const Typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
  },
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    bold: '700' as const,
  },
} as const;

export const Layout = {
  leaderboardRowHeight: 60,
  searchInputHeight: 44,
  headerHeight: 56,
} as const;
