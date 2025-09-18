"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import GameMenu from "@components/game/GameMenu";
import { LeaderboardEntry } from "@/types/leaderboard";

const HomePage: React.FC = () => {
  const router = useRouter();
  const [dailyLeaderboard, setDailyLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [hasPlayedDaily, setHasPlayedDaily] = useState<boolean>(false);
  const [dailyScore, setDailyScore] = useState<number | null>(null);

  // Daily challenge localStorage functions
  const getDailyGameKey = () => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    return `daily_game_${today}`;
  };

  const checkDailyGameStatus = () => {
    if (typeof window !== 'undefined') {
      const dailyKey = getDailyGameKey();
      const savedData = localStorage.getItem(dailyKey);
      
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          if (parsed.hasPlayed) {
            setHasPlayedDaily(true);
            setDailyScore(parsed.score);
            return true;
          }
        } catch (error) {
          console.error("Error parsing daily game data:", error);
          localStorage.removeItem(dailyKey);
        }
      }
    }
    return false;
  };

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch(
          "/api/daily_leaderboard?action=leaderboard&limit=10&orderBy=total_score"
        );
        const data = await response.json();

        const mappedData = data.map((entry: any, index: number) => ({
          id: entry.id,
          player_name: entry.player_name,
          total_score: entry.total_score,
          time_created: entry.time_created,
          rank: index + 1,
        }));

        setDailyLeaderboard(mappedData);
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      }
    };

    // Check daily game status
    checkDailyGameStatus();

    fetchLeaderboard();
  }, []);

  const handleStartDaily = (): void => {
    // Always allow navigation - GamePage will handle the logic
    router.push("/play/daily");
  };

  const handleStartCasual = (): void => {
    router.push("/play/casual");
  };

  const handleStartMultiplayer = (): void => {
    router.push("/play/multiplayer");
  };

  return (
    <GameMenu
      onStartDaily={handleStartDaily}
      onStartCasual={handleStartCasual}
      onStartMultiplayer={handleStartMultiplayer}
      dailyLeaderboard={dailyLeaderboard}
      hasPlayedDaily={hasPlayedDaily}
      dailyScore={dailyScore}
    />
  );
};

export default HomePage;