export interface LeaderboardEntry {
  rank: number;
  username: string;
  rating: number;
}

export interface SearchResult {
  username: string;
  rating: number;
  global_rank: number;
}

export interface LeaderboardStats {
  total_users: number;
}
