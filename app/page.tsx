"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import GameMenu from "@components/game/GameMenu";
import { LeaderboardEntry } from "@/types/leaderboard";

const HomePage: React.FC = () => {
  const router = useRouter();

  const [playerName, setPlayerName] = useState<string>("");
  const [roomCode, setRoomCode] = useState<string>("");
  const [dailyLeaderboard, setDailyLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const response = await fetch(
        "/api/daily_leaderboard?action=leaderboard&limit=10&orderBy=total_score"
      );
      const data = await response.json();

      // Map to match Player type expected by GameMenu
      const mappedData = data.map((entry: any, index: number) => ({
        id: entry.id,
        player_name: entry.player_name,
        total_score: entry.total_score,
        time_created: entry.time_created,
        rank: index + 1,
      }));

      setDailyLeaderboard(mappedData);
    };

    fetchLeaderboard();
  }, []);

  const handleStartDaily = (): void => {
    router.push("/play/daily");
  };

  const handleCreateRoom = (): void => {
    router.push("/play/multiplayer");
  };

  const handleJoinRoom = (): void => {
    router.push("/play/multiplayer");
  };

  const handleStartInfinite = () => {
    router.push("/play/infinite");
  };

  return (
    <GameMenu
      onStartDaily={handleStartDaily}
      onStartInfinite={handleStartInfinite}
      onCreateRoom={handleCreateRoom}
      onJoinRoom={handleJoinRoom}
      playerName={playerName}
      setPlayerName={setPlayerName}
      roomCode={roomCode}
      setRoomCode={setRoomCode}
      dailyLeaderboard={dailyLeaderboard}
    />
  );
};

export default HomePage;
