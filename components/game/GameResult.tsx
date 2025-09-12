// components/GameResult.tsx
import React from "react";
import { Target, Crown } from "lucide-react";
import { GameAnswer } from "../../types";
import { formatDistance } from "../../utils/gameUtils";

interface GameResultProps {
  score: number;
  answers: GameAnswer[];
  onPlayAgain: () => void;
}

const GameResult: React.FC<GameResultProps> = ({
  score,
  answers,
  onPlayAgain,
}) => {
  const averageDistance =
    answers.reduce((acc, ans) => acc + (ans.distance || 0), 0) / answers.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-secondary-900 to-primary-800 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white/10 backdrop-blur-md rounded-xl p-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white mb-4">
            🎉 Game Complete!
          </h2>
          <div className="text-6xl font-bold text-yellow-400 mb-2">
            {score.toLocaleString()}
          </div>
          <p className="text-blue-200 mb-2">Total Score</p>
          <p className="text-white">
            Average Distance: {formatDistance(averageDistance)}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/20 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Round Results
            </h3>
            <div className="space-y-3">
              {answers.map((answer, index) => (
                <div key={index} className="bg-white/10 rounded p-3">
                  <div className="text-white font-medium mb-1">
                    Round {index + 1}
                  </div>
                  <div className="text-sm text-blue-200 mb-2">
                    {answer.correctAnswer}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-green-400">
                      {formatDistance(answer.distance || 0)}
                    </span>
                    <span className="text-yellow-400 font-bold">
                      +{answer.score.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/20 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Crown className="w-5 h-5" />
              Performance Stats
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-blue-200">Perfect Guesses:</span>
                <span className="text-white">
                  {
                    answers.filter((a) => a.distance !== null && a.distance < 1)
                      .length
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200">
                  Close Guesses (&lt;100km):
                </span>
                <span className="text-white">
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
              <div className="flex justify-between">
                <span className="text-blue-200">Best Guess:</span>
                <span className="text-green-400">
                  {formatDistance(
                    Math.min(
                      ...answers
                        .map((a) => a.distance || Infinity)
                        .filter((d) => d !== Infinity)
                    )
                  )}
                </span>
              </div>
              <div className="flex justify-between border-t border-white/20 pt-2 mt-2">
                <span className="text-blue-200">Total Points:</span>
                <span className="text-yellow-400 font-bold">
                  {score.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={onPlayAgain}
            className="bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameResult;