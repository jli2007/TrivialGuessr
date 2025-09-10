// components/GameQuestion.tsx
import React from 'react';
import { Clock, Target, Volume2, Globe, Maximize2 } from 'lucide-react';
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
  if (isMapFullscreen) {
    return (
      <div className="h-screen flex flex-col">
        <div className="bg-black/50 text-white p-4 flex justify-between items-center">
          <div>
            <span className="text-lg">Round {currentQuestion + 1} of {totalQuestions}</span>
            <span className="ml-4 text-xl font-bold">Score: {score.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span className="text-xl font-bold">{timeLeft}s</span>
            </div>
            <button
              onClick={onToggleFullscreen}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="flex-1">
          <GoogleMap
            onLocationSelect={onLocationSelect}
            selectedLocation={selectedLocation}
            correctLocation={null}
            showAnswer={false}
            isFullscreen={true}
          />
        </div>
        
        <div className="bg-black/50 p-4 text-center">
          <button
            onClick={onSubmitGuess}
            disabled={!selectedLocation}
            className="bg-green-600 text-white py-3 px-8 rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2 mx-auto"
          >
            <Target className="w-5 h-5" />
            Submit Guess
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 h-screen flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div className="text-white">
          <span className="text-lg">Round {currentQuestion + 1} of {totalQuestions}</span>
          <div className="text-2xl font-bold">Score: {score.toLocaleString()}</div>
        </div>
        <div className="flex items-center gap-2 text-white">
          <Clock className="w-5 h-5" />
          <span className="text-xl font-bold">{timeLeft}s</span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Question Panel */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 flex flex-col">
          <h2 className="text-2xl font-bold text-white mb-6">{question.prompt}</h2>
          
          {question.type === 'image' && question.asset_url && (
            <div className="mb-6 flex-1">
              <img
                src={question.asset_url}
                alt="Question"
                className="w-full h-full object-cover rounded-lg max-h-96"
              />
            </div>
          )}
          
          {question.type === 'audio' && (
            <div className="mb-6 flex items-center justify-center flex-1">
              <div className="bg-white/20 rounded-lg p-8 flex items-center gap-4">
                <Volume2 className="w-8 h-8 text-white" />
                <span className="text-white">Audio clip would play here</span>
              </div>
            </div>
          )}

          {question.type === 'text' && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-white/80">
                <Globe className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Use the map to make your guess</p>
              </div>
            </div>
          )}

          <div className="text-center mt-auto">
            <button
              onClick={onSubmitGuess}
              disabled={!selectedLocation}
              className="bg-green-600 text-white py-3 px-8 rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2 mx-auto mb-4"
            >
              <Target className="w-5 h-5" />
              Submit Guess
            </button>
            {!selectedLocation && (
              <p className="text-blue-200 text-sm">Click on the map to place your guess</p>
            )}
          </div>
        </div>

        {/* Map Panel */}
        <div className="relative">
          <button
            onClick={onToggleFullscreen}
            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg transition-colors"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
          <GoogleMap
            onLocationSelect={onLocationSelect}
            selectedLocation={selectedLocation}
            correctLocation={null}
            showAnswer={false}
            isFullscreen={false}
          />
        </div>
      </div>
    </div>
  );
};

export default GameQuestion;