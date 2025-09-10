// components/RoundResult.tsx
import React from 'react';
import { GameAnswer } from '../types';
import { formatDistance } from '../utils/gameUtils';
import GoogleMap from './GoogleMap';

interface RoundResultProps {
  lastAnswer: GameAnswer;
  score: number;
}

const RoundResult: React.FC<RoundResultProps> = ({
  lastAnswer,
  score,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        <div className="text-center mb-6">
          <div className="text-4xl font-bold text-white mb-2">
            {lastAnswer.distance ? formatDistance(lastAnswer.distance) + ' away!' : 'No guess made'}
          </div>
          <div className="text-2xl font-bold text-yellow-400 mb-2">+{lastAnswer.score.toLocaleString()}</div>
          <p className="text-blue-200">
            Correct answer: <span className="text-white font-semibold">{lastAnswer.correctAnswer}</span>
          </p>
        </div>

        <div className="flex-1">
          <GoogleMap
            selectedLocation={lastAnswer.userGuess}
            correctLocation={lastAnswer.correctLocation}
            showAnswer={true}
            onLocationSelect={() => {}}
            isFullscreen={true}
          />
        </div>

        <div className="text-center mt-4">
          <div className="text-white text-lg">
            Total Score: <span className="text-yellow-400 font-bold">{score.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoundResult;