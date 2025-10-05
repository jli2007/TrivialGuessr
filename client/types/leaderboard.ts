export interface LeaderboardEntry {
  id: string;
  player_name: string;
  total_score: number;
  rank?: number;
  time_created: string;
}