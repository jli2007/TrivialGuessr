// components/GameLobby.tsx
import React from 'react';
import { Users, Crown, Play } from 'lucide-react';
import { Player } from '../../types';

interface GameLobbyProps {
  roomCode: string;
  roomPlayers: Player[];
  isHost: boolean;
  onStartGame: () => void;
  onLeaveRoom: () => void;
}

const GameLobby: React.FC<GameLobbyProps> = ({
  roomCode,
  roomPlayers,
  isHost,
  onStartGame,
  onLeaveRoom,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-xl p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Room: {roomCode}</h2>
          <p className="text-blue-200">Waiting for players...</p>
        </div>
        
        <div className="space-y-3 mb-6">
          {roomPlayers.map((player, index) => (
            <div key={index} className="flex items-center justify-between bg-white/20 rounded-lg p-3">
              <span className="text-white flex items-center gap-2">
                <Users className="w-4 h-4" />
                {player.name}
                {player.isHost && <Crown className="w-4 h-4 text-yellow-400" />}
              </span>
              <span className="text-blue-200">Ready</span>
            </div>
          ))}
        </div>
        
        <div className="space-y-3">
          {isHost && (
            <button
              onClick={onStartGame}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              Start Game
            </button>
          )}
          
          <button
            onClick={onLeaveRoom}
            className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Leave Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameLobby;