import React from "react";
import { Target, Crown, Trophy, Star, Award, Home, MapPin } from "lucide-react";
import { GameAnswer } from "../../types";
import { formatDistance } from "../../utils/gameUtils";

interface GameResultProps {
  score: number;
  answers: GameAnswer[];
  onPlayAgain: () => void;
  mode?: string;
}

const GameResult: React.FC<GameResultProps> = ({
  score,
  answers,
  onPlayAgain,
  mode,
}) => {
  const averageDistance =
    answers.reduce((acc, ans) => acc + (ans.distance || 0), 0) / answers.length;

  const getDistanceColor = (distance: number | null): string => {
    if (!distance) return "text-slate-400";
    if (distance <= 100) return "text-emerald-400";
    if (distance <= 500) return "text-yellow-400";
    if (distance <= 1000) return "text-orange-400";
    return "text-red-400";
  };

  const getScoreRank = (
    score: number,
    mode?: string
  ): { rank: string; color: string; icon: React.ReactNode } => {
    if (mode === "daily") {
      if (score >= 22500)
        return {
          rank: "Elite Ball Knowledge",
          color: "text-yellow-300",
          icon: <Crown className="w-6 h-6" />,
        };
      if (score >= 17500)
        return {
          rank: "You're Him Lil Bro",
          color: "text-purple-400",
          icon: <Award className="w-6 h-6" />,
        };
      if (score >= 12500)
        return {
          rank: "You Aight",
          color: "text-blue-400",
          icon: <Trophy className="w-6 h-6" />,
        };
      if (score >= 7500)
        return {
          rank: "Lock In Bro",
          color: "text-amber-400",
          icon: <Star className="w-6 h-6" />,
        };
      return {
        rank: "You Kinda Ahh",
        color: "text-slate-400",
        icon: <MapPin className="w-6 h-6" />,
      };
    }

    if (score >= 45000)
      return {
        rank: "Elite Ball Knowledge",
        color: "text-yellow-300",
        icon: <Crown className="w-6 h-6" />,
      };
    if (score >= 35000)
      return {
        rank: "You're Him Lil Bro",
        color: "text-purple-400",
        icon: <Award className="w-6 h-6" />,
      };
    if (score >= 25000)
      return {
        rank: "You Aight",
        color: "text-blue-400",
        icon: <Trophy className="w-6 h-6" />,
      };
    if (score >= 15000)
      return {
        rank: "Lock In Bro",
        color: "text-amber-400",
        icon: <Star className="w-6 h-6" />,
      };
    return {
      rank: "You Kinda Ahh",
      color: "text-slate-400",
      icon: <MapPin className="w-6 h-6" />,
    };
  };

  const scoreRank = getScoreRank(score, mode);

  return (
    <div className="min-h-screen bg-[url('/bg.jpg')] bg-cover bg-center flex items-center justify-center p-3 sm:p-4 relative overflow-x-hidden overflow-y-auto">
      {/* Subtle background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(234,179,8,0.03),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(16,185,129,0.02),transparent_60%)]" />

      {/* Mountain silhouette */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg
          viewBox="0 0 1200 300"
          className="w-full h-16 sm:h-24 text-slate-700/20"
        >
          <path
            d="M0,300 L200,150 L400,200 L600,100 L800,180 L1000,120 L1200,200 L1200,300 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto py-6 sm:py-8">
        {/* Mobile-Optimized Header */}
        <div className="text-center mb-6">
          <div className="relative inline-block mb-4">
            <div className="absolute -inset-2 bg-gradient-to-r from-yellow-500/8 via-yellow-400/12 to-yellow-500/8 blur-lg rounded-full" />
            <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-yellow-500/20 shadow-lg px-4 sm:px-8 md:px-12 py-4 sm:py-6 w-full max-w-sm sm:max-w-md md:min-w-[400px]">
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-yellow-400/15 to-yellow-600/15 rounded-xl border border-yellow-400/20">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6">
                    {scoreRank.icon}
                  </div>
                </div>
                <h2
                  className={`text-lg sm:text-xl md:text-2xl font-bold ${scoreRank.color} font-odachi text-center leading-tight`}
                >
                  {scoreRank.rank}
                </h2>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3 font-odachi">
                Game Finished
              </h1>

              {/* Responsive score display */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/8 via-yellow-300/12 to-yellow-400/8 blur-md rounded-xl" />
                <div className="relative text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-400 bg-clip-text text-transparent tracking-tight">
                  {score.toLocaleString()}
                </div>
              </div>

              <p className="text-slate-300 text-xs sm:text-sm mt-2 font-medium">
                Total Points Earned
              </p>
            </div>
          </div>
        </div>

        {/* Mobile-Optimized Results Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
          {/* Round Results - Mobile Optimized */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500/8 via-amber-500/8 to-yellow-500/8 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-xl border border-slate-600/40 shadow-lg p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-amber-500/15 to-yellow-500/15 rounded-lg border border-amber-400/20">
                  <Target className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Round Results
                </h3>
              </div>

              <div className="space-y-2 h-64 sm:h-80 overflow-y-auto pr-2 custom-scrollbar">
                {answers.map((answer, index) => (
                  <div key={index} className="group/item relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/2 to-transparent rounded-lg opacity-0 group-hover/item:opacity-100 transition-all duration-300" />
                    <div className="relative bg-gradient-to-r from-slate-700/30 to-slate-800/30 rounded-lg p-2.5 sm:p-3 border border-slate-600/20 hover:border-yellow-500/20 transition-all duration-300">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-yellow-400/20 to-amber-500/20 rounded-lg flex items-center justify-center border border-yellow-400/15">
                            <span className="text-yellow-300 font-bold text-xs">
                              {index + 1}
                            </span>
                          </div>
                          <span className="text-white font-medium text-xs sm:text-sm">
                            Round {index + 1}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-yellow-400 font-bold text-xs sm:text-sm">
                            +{answer.score.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="text-slate-300 mb-1 ml-6 sm:ml-8 font-medium text-xs sm:text-sm">
                        {answer.correctAnswer}
                      </div>

                      <div className="text-slate-400 mb-1 ml-6 sm:ml-8 font-medium text-xs italic line-clamp-2">
                        {answer.question || "Question not available"}
                      </div>

                      <div className="flex items-center gap-1 ml-6 sm:ml-8">
                        <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
                        <span
                          className={`font-medium text-xs ${getDistanceColor(
                            answer.distance
                          )}`}
                        >
                          {formatDistance(answer.distance || 0)} off target
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance Statistics - Mobile Optimized */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/6 via-blue-500/6 to-purple-500/6 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-xl border border-slate-600/40 shadow-lg p-4 sm:p-6 h-full">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500/15 to-purple-500/15 rounded-lg border border-blue-400/20">
                  <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Performance Stats
                </h3>
              </div>

              <div className="flex flex-col h-64 sm:h-80 overflow-hidden">
                {/* Mobile-optimized stats */}
                <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
                  {/* Compact stat cards for mobile */}
                  <div className="relative group/stat">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-emerald-400/5 rounded-lg blur-sm opacity-50 group-hover/stat:opacity-100 transition-opacity" />
                    <div className="relative flex justify-between items-center py-2.5 sm:py-3 px-3 sm:px-4 bg-gradient-to-r from-emerald-500/8 via-emerald-400/4 to-transparent rounded-lg border border-emerald-500/15">
                      <span className="text-white font-medium text-xs sm:text-sm leading-tight">
                        Perfect Shots (&lt;1km)
                      </span>
                      <span className="text-emerald-400 font-bold text-base sm:text-lg">
                        {
                          answers.filter(
                            (a) => a.distance !== null && a.distance < 1
                          ).length
                        }
                      </span>
                    </div>
                  </div>

                  <div className="relative group/stat">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-yellow-400/5 rounded-lg blur-sm opacity-50 group-hover/stat:opacity-100 transition-opacity" />
                    <div className="relative flex justify-between items-center py-2.5 sm:py-3 px-3 sm:px-4 bg-gradient-to-r from-yellow-500/8 via-yellow-400/4 to-transparent rounded-lg border border-yellow-500/15">
                      <span className="text-white font-medium text-xs sm:text-sm leading-tight">
                        Close Calls (&lt;100km)
                      </span>
                      <span className="text-yellow-400 font-bold text-base sm:text-lg">
                        {
                          answers.filter(
                            (a) =>
                              a.distance !== null &&
                              a.distance < 100 &&
                              a.distance >= 1
                          ).length
                        }
                      </span>
                    </div>
                  </div>

                  <div className="relative group/stat">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-blue-400/5 rounded-lg blur-sm opacity-50 group-hover/stat:opacity-100 transition-opacity" />
                    <div className="relative flex justify-between items-center py-2.5 sm:py-3 px-3 sm:px-4 bg-gradient-to-r from-blue-500/8 via-blue-400/4 to-transparent rounded-lg border border-blue-500/15">
                      <span className="text-white font-medium text-xs sm:text-sm leading-tight">
                        Average Distance
                      </span>
                      <span
                        className={`font-bold text-base sm:text-lg ${getDistanceColor(
                          averageDistance
                        )}`}
                      >
                        {formatDistance(averageDistance)}
                      </span>
                    </div>
                  </div>

                  <div className="relative group/stat">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-green-400/5 rounded-lg blur-sm opacity-50 group-hover/stat:opacity-100 transition-opacity" />
                    <div className="relative flex justify-between items-center py-2.5 sm:py-3 px-3 sm:px-4 bg-gradient-to-r from-green-500/8 via-green-400/4 to-transparent rounded-lg border border-green-500/15">
                      <span className="text-white font-medium text-xs sm:text-sm leading-tight">
                        Best Performance
                      </span>
                      <span className="text-green-400 font-bold text-base sm:text-lg">
                        {formatDistance(
                          Math.min(
                            ...answers
                              .map((a) => a.distance || Infinity)
                              .filter((d) => d !== Infinity)
                          )
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mobile-optimized final score */}
                <div className="pt-3 sm:pt-4 border-t border-slate-600/40 flex-shrink-0">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/8 via-amber-400/8 to-yellow-400/8 rounded-lg blur" />
                    <div className="relative flex justify-between items-center py-3 sm:py-4 px-4 sm:px-5 bg-gradient-to-r from-yellow-500/15 via-amber-500/10 to-yellow-500/15 rounded-lg border border-yellow-400/25">
                      <span className="text-white font-bold text-sm sm:text-base">
                        Final Score
                      </span>
                      <span className="text-yellow-300 font-black text-lg sm:text-xl tracking-wide">
                        {score.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-Optimized Action Button */}
        <div className="text-center px-2">
          <button
            onClick={onPlayAgain}
            className="group relative overflow-hidden w-full max-w-xs sm:w-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-400 rounded-xl blur opacity-50 group-hover:opacity-75 transition-all duration-300 group-hover:scale-105" />
            <div className="relative bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-500 hover:from-yellow-400 hover:via-amber-400 hover:to-yellow-400 text-slate-900 py-3 px-6 sm:px-8 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 group-hover:scale-105 shadow-lg flex items-center justify-center gap-3">
              <Home className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Home</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </button>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(51, 65, 85, 0.3);
          border-radius: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(251, 191, 36, 0.4);
          border-radius: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(251, 191, 36, 0.6);
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default GameResult;
