"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import GameMenu from "@components/game/GameMenu";
import { LeaderboardEntry } from "@/types/leaderboard";

const HomePage: React.FC = () => {
  const router = useRouter();
  const [dailyLeaderboard, setDailyLeaderboard] = useState<LeaderboardEntry[]>([]);

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

    fetchLeaderboard();
  }, []);

  const handleStartDaily = (): void => {
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
    />
  );
};

export default HomePage;