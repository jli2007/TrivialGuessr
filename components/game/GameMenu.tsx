// components/GameMenu.tsx
import React from 'react';
import { Calendar, Users, Crown } from 'lucide-react';
import { Player } from '../../types';

interface GameMenuProps {
  onStartDaily: () => void;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  playerName: string;
  setPlayerName: (name: string) => void;
  roomCode: string;
  setRoomCode: (code: string) => void;
  dailyLeaderboard: Player[];
}

const GameMenu: React.FC<GameMenuProps> = ({
  onStartDaily,
  onCreateRoom,
  onJoinRoom,
  playerName,
  setPlayerName,
  roomCode,
  setRoomCode,
  dailyLeaderboard,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">🌍 TriviaGuessr</h1>
          <p className="text-blue-200 text-lg">Guess locations around the world</p>
          <p className="text-blue-300 text-sm mt-2">Powered by Google Maps</p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={onStartDaily}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            <Calendar className="w-6 h-6" />
            Daily Challenge
          </button>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 space-y-4">
            <h3 className="text-white text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5" />
              Multiplayer Mode
            </h3>
            
            <input
              type="text"
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:border-white/60 focus:outline-none"
            />
            
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Room Code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:border-white/60 focus:outline-none"
              />
              <button
                onClick={onJoinRoom}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Join
              </button>
            </div>
            
            <button
              onClick={onCreateRoom}
              className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Create Room
            </button>
          </div>
        </div>
        
        <div className="mt-8 bg-white/10 backdrop-blur-md rounded-xl p-4">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-400" />
            Daily Leaderboard
          </h3>
          <div className="space-y-2">
            {dailyLeaderboard.slice(0, 3).map((player, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-black font-bold text-xs">
                    {player.rank}
                  </span>
                  {player.name}
                </span>
                <span className="text-blue-200 font-medium">{player.score.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameMenu;