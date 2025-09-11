// components/GameQuestion.tsx
import React from 'react';
import { Clock, Target, Volume2, Globe, Maximize2, Minimize2 } from 'lucide-react';
import { Question, Location } from '../../types';
import GoogleMap from '../GoogleMap';

interface GameQuestionProps {
  question: Question;
  currentQuestion: number;
  totalQuestions: number;
  score: number;
  timeLeft: number;
  selectedLocation: Location | null;
  isMapFullscreen: boolean;
  onLocationSelect: (location: Location) => void;
  onSubmitGuess: () => void;
  onToggleFullscreen: () => void;
}

const GameQuestion: React.FC<GameQuestionProps> = ({
  question,
  currentQuestion,
  totalQuestions,
  score,
  timeLeft,
  selectedLocation,
  isMapFullscreen,
  onLocationSelect,
  onSubmitGuess,
  onToggleFullscreen,
}) => {
  return (
    <div className="h-screen relative">
      {/* Full-screen Map */}
      <GoogleMap
        onLocationSelect={onLocationSelect}
        selectedLocation={selectedLocation}
        correctLocation={null}
        showAnswer={false}
        isFullscreen={true}
      />
      
      {/* Question Card - Top Left */}
      <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur-md rounded-xl p-4 text-white shadow-2xl max-w-sm w-80">
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <div className="text-sm">
            <span>Round {currentQuestion + 1} of {totalQuestions}</span>
            <div className="font-bold">Score: {score.toLocaleString()}</div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4" />
            <span className="font-bold">{timeLeft}s</span>
          </div>
        </div>
        
        {/* Question Content */}
        <div className="mb-4">
          <h2 className="text-lg font-bold mb-3">{question.prompt}</h2>
          
          {question.type === 'image' && question.asset_url && (
            <div className="mb-3">
              <img
                src={question.asset_url}
                alt="Question"
                className="w-full h-32 object-cover rounded-lg"
              />
            </div>
          )}
          
          {question.type === 'audio' && (
            <div className="mb-3 bg-white/10 rounded-lg p-4 flex items-center gap-3">
              <Volume2 className="w-5 h-5" />
              <span className="text-sm">Audio clip would play here</span>
            </div>
          )}

          {question.type === 'text' && (
            <div className="mb-3 text-center text-white/60">
              <Globe className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Use the map to make your guess</p>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          onClick={onSubmitGuess}
          disabled={!selectedLocation}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
        >
          <Target className="w-4 h-4" />
          Submit Guess
        </button>
        
        {!selectedLocation && (
          <p className="text-blue-200 text-xs mt-2 text-center">Click on the map to place your guess</p>
        )}
      </div>
    </div>
  );
};

export default GameQuestion;