import React, { useState } from "react";
import { Calendar, User, Crown, Infinity, Lock } from "lucide-react";
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
  dailyLeaderboard,
}) => {
  const [isDailyHovered, setIsDailyHovered] = useState(false);
  const [isCasualHovered, setIsCasualHovered] = useState(false);
  const [isMultiplayerHovered, setIsMultiplayerHovered] = useState(false);

  return (
    <div className="min-h-screen bg-[url('/bg.jpg')] bg-cover bg-center flex items-center justify-center p-3 sm:p-4 relative overflow-x-hidden overflow-y-auto">
      {/* Background Pattern */}
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

      <div className="max-w-4xl w-full relative z-10 px-4 sm:px-6 md:px-10">
        {/* Header - Mobile Optimized */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-2 drop-shadow-2xl">
            <TypingAnimation
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl bg-gradient-to-r from-accent-300 to-accent-400 bg-clip-text text-transparent inline !font-ragas font-bold"
              startOnView={true}
              delay={200}
            >
              Trivial
            </TypingAnimation>
            <TypingAnimation
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl bg-gradient-to-r from-accent-400 to-accent-500 bg-clip-text text-transparent inline !font-odachi px-1 sm:px-2"
              startOnView={true}
              delay={1000}
            >
              Guessr.
            </TypingAnimation>
          </div>
          <p className="text-primary-200 text-lg sm:text-xl md:text-2xl drop-shadow-lg !font-ragas font-bold px-2">
            <AnimatedGradientText colorFrom="#FCD730" colorTo="#FDDA37dd">
              Knowledge of little value or importance.
            </AnimatedGradientText>
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-4 sm:space-y-5">
          {/* Leaderboard - Mobile Optimized */}
          <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-4 sm:p-5 shadow-2xl border border-white/10">
            <h3 className="text-white font-bold text-base sm:text-lg mb-3 flex items-center justify-center gap-2">
              <div className="p-1.5 bg-accent-300/20 rounded-lg">
                <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-accent-300" />
              </div>
              <AnimatedGradientText colorFrom="#ffff55ff" colorTo="#f4fdffff" className="!font-ragas">
                Daily Leaderboard
              </AnimatedGradientText>
            </h3>
            
            <div className="space-y-2 max-h-40 sm:max-h-48 md:max-h-60 overflow-y-auto gaming-scrollbar">
              {dailyLeaderboard.slice(0, 50).map((player, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors duration-200"
                >
                  <span className="text-white flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div
                      className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-black font-bold text-xs shadow-lg flex-shrink-0 ${
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
                    <span className="font-medium text-xs sm:text-sm truncate">
                      {player.player_name}
                    </span>
                  </span>
                  <span className="text-primary-200 font-bold text-xs sm:text-sm flex-shrink-0">
                    {player.total_score}
                  </span>
                </div>
              ))}
              {dailyLeaderboard.length === 0 && (
                <div className="text-center py-4 sm:py-6 text-white/60">
                  <p className="text-sm sm:text-base">No scores yet today!</p>
                  <p className="text-xs sm:text-sm mt-1">Be the first to play</p>
                </div>
              )}
            </div>
          </div>

          {/* Game Mode Buttons - Mobile Optimized */}
          <div className="space-y-3 sm:space-y-4">
            {/* Daily Challenge Button */}
            <button
              onClick={onStartDaily}
              onMouseEnter={() => setIsDailyHovered(true)}
              onMouseLeave={() => setIsDailyHovered(false)}
              className="w-full bg-gradient-to-r from-accent-300 to-accent-400 hover:from-accent-400 hover:to-accent-500 text-gray-900 py-3 sm:py-4 px-4 sm:px-6 rounded-2xl !font-ragas font-bold text-base sm:text-lg flex items-center justify-center gap-3 transform hover:scale-105 transition-all duration-300 shadow-accent hover:shadow-2xl opacity-95 active:scale-95"
            >
              <div className="p-1.5 bg-black/10 rounded-lg">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="flex-1 text-center">
                {isDailyHovered ? (
                  <TypingAnimation
                    className="text-base sm:text-lg font-bold text-gray-900 inline"
                    startOnView={true}
                    delay={50}
                  >
                    Daily Challenge
                  </TypingAnimation>
                ) : (
                  "Daily Challenge"
                )}
              </span>
            </button>

            {/* Casual Mode Button */}
            <button
              onClick={onStartCasual}
              onMouseEnter={() => setIsCasualHovered(true)}
              onMouseLeave={() => setIsCasualHovered(false)}
              className="w-full bg-gradient-to-r from-accent-300 to-accent-400 hover:from-accent-400 hover:to-accent-500 text-gray-900 py-3 sm:py-4 px-4 sm:px-6 rounded-2xl !font-ragas font-bold text-base sm:text-lg flex items-center justify-center gap-3 transform hover:scale-105 transition-all duration-300 shadow-accent hover:shadow-2xl opacity-95 active:scale-95"
            >
              <div className="p-1.5 bg-black/10 rounded-lg">
                <Infinity className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="flex-1 text-center">
                {isCasualHovered ? (
                  <TypingAnimation
                    className="text-base sm:text-lg font-bold text-gray-900 inline"
                    startOnView={true}
                    delay={50}
                  >
                    Casual Mode
                  </TypingAnimation>
                ) : (
                  "Casual Mode"
                )}
              </span>
            </button>

            {/* Multiplayer Button - Locked */}
            <div className="relative">
              <button
                onClick={isMultiplayerHovered ? undefined : undefined}
                onMouseEnter={() => setIsMultiplayerHovered(true)}
                onMouseLeave={() => setIsMultiplayerHovered(false)}
                disabled={true}
                className="w-full bg-gradient-to-r from-gray-400 to-gray-500 text-gray-700 py-3 sm:py-4 px-4 sm:px-6 rounded-2xl !font-ragas font-bold text-base sm:text-lg flex items-center justify-center gap-3 cursor-not-allowed opacity-60 relative"
              >
                <div className="p-1.5 bg-black/10 rounded-lg">
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="flex-1 text-center">
                  {isMultiplayerHovered ? (
                    <TypingAnimation
                      className="text-base sm:text-lg font-bold text-gray-700 inline"
                      startOnView={true}
                      delay={50}
                    >
                      Multiplayer Mode
                    </TypingAnimation>
                  ) : (
                    "Multiplayer Mode"
                  )}
                </span>
                
                {/* Lock Icon Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-black/80 backdrop-blur-sm rounded-full p-2 sm:p-3">
                    <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
              </button>
              
              {/* Coming Soon Badge */}
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg transform rotate-12">
                Coming Soon
              </div>
            </div>
          </div>

          {/* Mobile Bottom Spacing */}
          <div className="h-4 sm:h-6"></div>
        </div>
      </div>

      {/* CSS Animations & Scrollbar */}
      <style jsx>{`
        @keyframes diagonal-scroll {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(-85px, -100px);
          }
        }
        
        .animate-diagonal-scroll {
          animation: diagonal-scroll 15s linear infinite;
        }
        
        .gaming-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(251, 191, 36, 0.4) rgba(51, 65, 85, 0.3);
        }
        
        .gaming-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .gaming-scrollbar::-webkit-scrollbar-track {
          background: rgba(51, 65, 85, 0.3);
          border-radius: 6px;
        }
        
        .gaming-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(251, 191, 36, 0.4);
          border-radius: 6px;
        }
        
        .gaming-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(251, 191, 36, 0.6);
        }
      `}</style>
    </div>
  );
};

export default GameMenu;