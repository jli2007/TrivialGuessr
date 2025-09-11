"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { dailyLeaderboard } from '@data/mockData';
import GameMenu from '@components/game/GameMenu';

const HomePage: React.FC = () => {
  const router = useRouter();
  
  const [playerName, setPlayerName] = useState<string>('');
  const [roomCode, setRoomCode] = useState<string>('');

  const handleStartDaily = (): void => {
    router.push('/play/daily');
  };

  const handleCreateRoom = (): void => {
    router.push('/play/multiplayer');
  };

  const handleJoinRoom = (): void => {
    router.push('/play/multiplayer');
  };

  return (
    <GameMenu
      onStartDaily={handleStartDaily}
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