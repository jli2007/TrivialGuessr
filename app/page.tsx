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

  const handleCreateRoom = (): void => {
    if (!playerName.trim()) {
      alert("Please enter your name first");
      return;
    }
    
    // Navigate to multiplayer page with player name
    const params = new URLSearchParams({ playerName: playerName.trim() });
    router.push(`/play/multiplayer?${params.toString()}`);
  };

  const handleJoinRoom = (): void => {
    if (!playerName.trim()) {
      alert("Please enter your name first");
      return;
    }
    
    if (!roomCode.trim()) {
      alert("Please enter a room code");
      return;
    }
    
    // Navigate to multiplayer page with player name and room code
    const params = new URLSearchParams({ 
      playerName: playerName.trim(), 
      roomCode: roomCode.trim().toUpperCase() 
    });
    router.push(`/play/multiplayer?${params.toString()}`);
  };

  return (
    <GameMenu
      onStartDaily={handleStartDaily}
      onStartCasual={handleStartCasual}
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