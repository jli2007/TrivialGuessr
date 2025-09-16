import React, { useState } from "react";
import { Calendar, User, Crown, Infinity } from "lucide-react";
import { TypingAnimation } from "@/components/magicui/typing-animation";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { LeaderboardEntry } from "@/types/leaderboard";

interface GameMenuProps {
  onStartDaily: () => void;
  onStartCasual: () => void;
  onStartMultiplayer: () => void;
  dailyLeaderboard: LeaderboardEntry[];
}

const GameMenu: React.FC<GameMenuProps> = ({
  onStartDaily,
  onStartCasual,
  onStartMultiplayer,
  dailyLeaderboard,
}) => {
  const [isDailyHovered, setIsDailyHovered] = useState(false);
  const [isCasualHovered, setIsCasualHovered] = useState(false);
  const [isMultiplayerHovered, setIsMultiplayerHovered] = useState(false);

  return (
    <div className="min-h-screen inset-0 z-50 bg-[url('/bg.jpg')] bg-cover bg-center  flex items-center justify-center p-4 relative overflow-x-hidden overflow-y-auto md:overflow-hidden">
      <div className="absolute inset-0 opacity-25 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0 animate-diagonal-scroll bg-amber-100/25 opacity-25"
          style={{
            backgroundImage: "url(/logoY.png)",
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
            <TypingAnimation
              className="text-7xl bg-gradient-to-r from-accent-300 to-accent-400 bg-clip-text text-transparent inline !font-ragas font-bold"
              startOnView={true}
              delay={200}
            >
              Trivial
            </TypingAnimation>
            <TypingAnimation
              className="text-7xl bg-gradient-to-r from-accent-400 to-accent-500 bg-clip-text text-transparent inline !font-odachi px-2"
              startOnView={true}
              delay={1000}
            >
              Guessr.
            </TypingAnimation>
          </div>
          <p className="text-primary-200 text-2xl drop-shadow-lg !font-ragas font-bold">
            <AnimatedGradientText colorFrom="#FCD730" colorTo="#FDDA37dd">
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
              <AnimatedGradientText colorFrom="#ffff55ff" colorTo="#f4fdffff" className="!font-ragas">
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
            className="w-full bg-gradient-to-r from-accent-300 to-accent-400 hover:from-accent-400 hover:to-accent-500 text-gray-900 py-3 px-4 rounded-2xl !font-ragas font-bold text-lg flex items-center justify-center gap-3 transform hover:scale-105 transition-all duration-300 shadow-accent hover:shadow-2xl"
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
            className="w-full bg-gradient-to-r from-accent-300 to-accent-400 hover:from-accent-400 hover:to-accent-500 text-gray-900 py-3 px-4 rounded-2xl !font-ragas font-bold text-lg flex items-center justify-center gap-3 transform hover:scale-105 transition-all duration-300 shadow-accent hover:shadow-2xl"
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
          {/* Multiplayer Button */}
          <button
            onClick={onStartMultiplayer}
            onMouseEnter={() => setIsMultiplayerHovered(true)}
            onMouseLeave={() => setIsMultiplayerHovered(false)}
            className="w-full bg-gradient-to-r from-accent-300 to-accent-400 hover:from-accent-400 hover:to-accent-500 text-gray-900 py-3 px-4 rounded-2xl !font-ragas font-bold text-lg flex items-center justify-center gap-3 transform hover:scale-105 transition-all duration-300 shadow-accent hover:shadow-2xl"
          >
            <div className="p-1.5 bg-black/10 rounded-lg">
              <User className="w-5 h-5" />
            </div>
            {isMultiplayerHovered ? (
              <TypingAnimation
                className="text-lg font-bold text-gray-900 inline"
                startOnView={true}
                delay={50}
              >
                Multiplayer Mode
              </TypingAnimation>
            ) : (
              "Multiplayer Mode"
            )}
          </button>
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
