
import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { Calendar, Users, Crown, Play, UserPlus, Infinity } from "lucide-react";
import { TypingAnimation } from "@/components/magicui/typing-animation";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { LeaderboardEntry } from "@/types/leaderboard";

// connect to your backend Socket.IO server
const socket = io("http://localhost:3001", {
  transports: ["websocket"],
  autoConnect: true,
});

interface GameMenuProps {
  onStartDaily: () => void;
  onStartCasual: () => void;
  dailyLeaderboard: LeaderboardEntry[];
}

const GameMenu: React.FC<GameMenuProps> = ({
  onStartDaily,
  onStartCasual,
  dailyLeaderboard,
}) => {
  const [isDailyHovered, setIsDailyHovered] = useState(false);
  const [isCasualHovered, setIsCasualHovered] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [roomData, setRoomData] = useState<any>(null);

  // setup listeners
  useEffect(() => {
    socket.on("roomCreated", ({ roomId }) => {
      setRoomCode(roomId);
      console.log("✅ Room created:", roomId);
    });

    socket.on("roomData", (data) => {
      setRoomData(data);
      console.log("📡 Room data updated:", data);
    });

    socket.on("error", (message) => {
      alert(message);
    });

    return () => {
      socket.off("roomCreated");
      socket.off("roomData");
      socket.off("error");
    };
  }, []);

  // socket actions
  const handleCreateRoom = () => {
    if (!playerName.trim()) return;
    socket.emit("createRoom", { userName: playerName });
  };

  const handleJoinRoom = () => {
    if (!playerName.trim() || !roomCode.trim()) return;
    socket.emit("joinRoom", { roomId: roomCode, userName: playerName });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-secondary-900 to-primary-800 flex items-center justify-center p-4 font-sans relative overflow-x-hidden overflow-y-auto md:overflow-hidden">
      <div className="absolute inset-0 opacity-25 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0 animate-diagonal-scroll"
          style={{
            backgroundImage: "url(/logo.png)",
            backgroundSize: "85px 100px",
            backgroundRepeat: "repeat",
            width: "calc(100% + 85px)",
            height: "calc(100% + 100px)",
          }}
        />
      </div>

      <div className="max-w-3xl w-full relative z-10 px-10">
        <div className="text-center mb-6">
          <div className="text-7xl font-bold text-white mb-2 drop-shadow-2xl">
            🌍
            <TypingAnimation
              className="text-7xl bg-gradient-to-r from-accent-300 to-accent-400 bg-clip-text text-transparent inline"
              startOnView={true}
              delay={250}
            >
              TrivialGuessr
            </TypingAnimation>
          </div>
          <p className="text-primary-200 text-2xl font-medium drop-shadow-lg">
            <AnimatedGradientText colorFrom="#ffff55ff" colorTo="#f4fdffff">
              Knowledge of little value or importance.
            </AnimatedGradientText>
          </p>
        </div>

        <div className="space-y-4">
          {/* Leaderboard */}
          <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-white/10">
            <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
              <div className="p-1.5 bg-accent-300/20 rounded-lg">
                <Crown className="w-5 h-5 text-accent-300" />
              </div>
              <AnimatedGradientText colorFrom="#ffff55ff" colorTo="#f4fdffff">
                Daily Leaderboard
              </AnimatedGradientText>
            </h3>
            <div className="space-y-2 max-h-50 overflow-y-auto gaming-scrollbar">
              {dailyLeaderboard.slice(0, 50).map((player, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors duration-200"
                >
                  <span className="text-white flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-black font-bold text-xs shadow-lg ${
                        index === 0
                          ? "bg-gradient-to-r from-accent-300 to-accent-400"
                          : index === 1
                          ? "bg-gradient-to-r from-gray-300 to-gray-400"
                          : index === 2
                          ? "bg-gradient-to-r from-amber-600 to-amber-700"
                          : "bg-gradient-to-r from-gray-100 to-gray-200"
                      }`}
                    >
                      {player.rank}
                    </div>
                    <span className="font-medium text-sm">
                      {player.player_name}
                    </span>
                  </span>
                  <span className="text-primary-200 font-bold text-sm">
                    {player.total_score}
                  </span>
                </div>
              ))}
              {dailyLeaderboard.length === 0 && (
                <div className="text-center py-3 text-white/60">
                  <p className="text-sm">No scores yet today!</p>
                  <p className="text-xs mt-1">Be the first to play</p>
                </div>
              )}
            </div>
          </div>

          {/* Daily Challenge Button */}
          <button
            onClick={onStartDaily}
            onMouseEnter={() => setIsDailyHovered(true)}
            onMouseLeave={() => setIsDailyHovered(false)}
            className="w-full bg-gradient-to-r from-accent-300 to-accent-400 hover:from-accent-400 hover:to-accent-500 text-gray-900 py-3 px-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transform hover:scale-105 transition-all duration-300 shadow-accent hover:shadow-2xl"
          >
            <div className="p-1.5 bg-black/10 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            {isDailyHovered ? (
              <TypingAnimation
                className="text-lg font-bold text-gray-900 inline"
                startOnView={true}
                delay={50}
              >
                Daily Challenge
              </TypingAnimation>
            ) : (
              "Daily Challenge"
            )}
          </button>

          {/* Casual Button */}
          <button
            onClick={onStartCasual}
            onMouseEnter={() => setIsCasualHovered(true)}
            onMouseLeave={() => setIsCasualHovered(false)}
            className="w-full bg-gradient-to-r from-accent-300 to-accent-400 hover:from-accent-400 hover:to-accent-500 text-gray-900 py-3 px-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transform hover:scale-105 transition-all duration-300 shadow-accent hover:shadow-2xl"
          >
            <div className="p-1.5 bg-black/10 rounded-lg">
              <Infinity className="w-5 h-5" />
            </div>
            {isCasualHovered ? (
              <TypingAnimation
                className="text-lg font-bold text-gray-900 inline"
                startOnView={true}
                delay={50}
              >
                Casual Mode
              </TypingAnimation>
            ) : (
              "Casual Mode"
            )}
          </button>

          {/* Multiplayer Section */}
          <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-white/10 hover:border-secondary-400/30 transition-all duration-300">
            <h3 className="text-white text-lg font-bold flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-secondary-500/20 rounded-lg">
                <Users className="w-5 h-5 text-secondary-300" />
              </div>
              Multiplayer Mode
            </h3>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-xl bg-white/10 text-white placeholder-white/50 border border-white/20 focus:border-secondary-400/60 focus:outline-none focus:ring-2 focus:ring-secondary-400/20 transition-all duration-200 backdrop-blur-sm"
              />

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Room Code"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2.5 text-sm rounded-xl bg-white/10 text-white placeholder-white/50 border border-white/20 focus:border-primary-400/60 focus:outline-none focus:ring-2 focus:ring-primary-400/20 transition-all duration-200 backdrop-blur-sm"
                />
                <button
                  onClick={handleJoinRoom}
                  disabled={!playerName.trim() || !roomCode.trim()}
                  className="px-4 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 font-semibold shadow-primary hover:shadow-lg hover:scale-105 flex items-center gap-1 text-sm"
                >
                  <Play className="w-3 h-3" />
                  Join
                </button>
              </div>

              <button
                onClick={handleCreateRoom}
                disabled={!playerName.trim()}
                className="w-full py-3 bg-secondary-500 hover:bg-secondary-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 font-semibold shadow-secondary hover:shadow-lg hover:scale-105 flex items-center justify-center gap-2 text-sm"
              >
                <UserPlus className="w-4 h-4" />
                Create Room
              </button>
            </div>
          </div>

          {/* Show active room data */}
          {roomData && (
            <div className="bg-black/40 backdrop-blur-xl mt-4 p-4 rounded-xl text-white">
              <h4 className="font-bold mb-2">Room {roomCode}</h4>
              <ul className="space-y-1">
                {roomData.players.map((p: any) => (
                  <li key={p.id}>
                    {p.name} {p.isHost && "👑"} - {p.score}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes diagonal-scroll {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(-85px, -100px);
          }
        }
        
        .animate-diagonal-scroll {
          animation: diagonal-scroll 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default GameMenu;
