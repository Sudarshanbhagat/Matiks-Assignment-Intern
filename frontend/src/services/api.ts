import axios, { AxiosInstance } from 'axios';
import { LeaderboardEntry, SearchResult, LeaderboardStats } from '../types';

// Read API base URL from environment so Netlify (or other hosts)
// can point the frontend to the deployed backend. Falls back to
// localhost for local development.
const API_BASE_URL = (process.env.REACT_APP_API_BASE_URL as string) || 'http://localhost:8080';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
    });
  }

  /**
   * Fetch leaderboard with optional limit. We never cache this because
   * ranks change whenever any user updates. Stale cache = stale ranks.
   * Backend returns pre-computed ranks, frontend displays as-is.
   */
  async getLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
    try {
      const response = await this.client.get<LeaderboardEntry[]>(
        `/leaderboard?limit=${limit}`
      );
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      throw error;
    }
  }

  /**
   * Search users by prefix (case-insensitive). Returns top 50 matches with
   * live-computed ranks. Why recompute on each request? Because between searches,
   * the system might have updated user ratings. Stale rank = wrong answer.
   * Frontend trusts the backend rank completely; no guessing or caching.
   */
  async searchUsers(query: string): Promise<SearchResult[]> {
    if (!query.trim()) {
      return [];
    }

    try {
      const response = await this.client.get<SearchResult[]>(
        `/search?username=${encodeURIComponent(query)}`
      );
      return response.data || [];
    } catch (error) {
      console.error('Failed to search users:', error);
      throw error;
    }
  }

  /**
   * Fetch system stats (e.g., total user count). Useful for debugging
   * and understanding system state during development.
   */
  async getStats(): Promise<LeaderboardStats> {
    try {
      const response = await this.client.get<LeaderboardStats>('/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      throw error;
    }
  }

  /**
   * Health check: is the backend running? Used to show a helpful error
   * if user tries to search/browse without a working backend.
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get('/stats');
      return true;
    } catch {
      return false;
    }
  }
}

export default new ApiService();
