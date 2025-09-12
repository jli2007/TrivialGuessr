import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Clock, Target, Globe, Info, MapPin, Calendar, Star, ArrowRight } from 'lucide-react';
import { Question } from '../../types/question';
import { Location, GameAnswer } from '../../types';
import { haversineDistance, calculateScore } from '../../utils/gameUtils';
import GoogleMap from '../GoogleMap';

interface GameQuestionProps {
  question: Question;
  currentQuestion: number;
  totalQuestions: number;
  score: number;
  onAnswerSubmitted: (answer: GameAnswer) => void;
  onNextRound: () => void;
}

const GameQuestion: React.FC<GameQuestionProps> = ({
  question,
  currentQuestion,
  totalQuestions,
  score,
  onAnswerSubmitted,
  onNextRound,
}) => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [currentAnswer, setCurrentAnswer] = useState<GameAnswer | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Wrap handleSubmitGuess in useCallback to prevent unnecessary re-renders
  const handleSubmitGuess = useCallback((): void => {
    if (showAnswer) return;

    let distance: number | null = null;
    let questionScore = 0;
    
    // Create correct coordinates from question data
    const correctCoordinates = {
      lat: Number(question.answer_lat),
      lng: Number(question.answer_lng)
    };
    
    // Validate coordinates
    if (isNaN(correctCoordinates.lat) || isNaN(correctCoordinates.lng)) {
      console.error('Invalid coordinates in question:', question);
      return;
    }
    
    if (!isFinite(correctCoordinates.lat) || !isFinite(correctCoordinates.lng)) {
      console.error('Coordinates are not finite numbers:', correctCoordinates);
      return;
    }
    
    if (selectedLocation) {
      distance = haversineDistance(
        selectedLocation.lat,
        selectedLocation.lng,
        correctCoordinates.lat,
        correctCoordinates.lng
      );
      questionScore = calculateScore(distance);
    }
    
    const newAnswer: GameAnswer = {
      question: question.question,
      userGuess: selectedLocation,
      correctLocation: correctCoordinates,
      correctAnswer: `${question.answer_city}, ${question.answer_country}`,
      distance,
      score: questionScore
    };

    setCurrentAnswer(newAnswer);
    setShowAnswer(true);
    
    // Notify parent component about the answer
    onAnswerSubmitted(newAnswer);
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, [showAnswer, selectedLocation, question, onAnswerSubmitted, onNextRound]);

  // Timer effect - now includes handleSubmitGuess in dependency array
  useEffect(() => {
    if (!showAnswer && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitGuess();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [showAnswer, timeLeft, handleSubmitGuess]); // Added handleSubmitGuess dependency

  // Reset state when question changes
  useEffect(() => {
    setSelectedLocation(null);
    setShowAnswer(false);
    setTimeLeft(60); // Consistent 60 second timer
    setCurrentAnswer(null);
  }, [currentQuestion]);

  const handleLocationSelect = (location: Location): void => {
    if (!showAnswer) {
      setSelectedLocation(location);
    }
  };

  const handleNextRound = (): void => {
    onNextRound();
  };

  const getScoreColor = (score: number): string => {
    if (score >= 4000) return 'text-green-400';
    if (score >= 2000) return 'text-yellow-400';
    if (score >= 1000) return 'text-orange-400';
    return 'text-red-400';
  };

  const getDistanceColor = (distance: number | null): string => {
    if (!distance) return 'text-gray-400';
    if (distance <= 100) return 'text-green-400';
    if (distance <= 500) return 'text-yellow-400';
    if (distance <= 1000) return 'text-orange-400';
    return 'text-red-400';
  };

  // Helper functions for question display
  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 3) return 'text-green-400';
    if (difficulty <= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getDifficultyText = (difficulty: number) => {
    if (difficulty <= 3) return 'Easy';
    if (difficulty <= 6) return 'Medium';
    return 'Hard';
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Landmarks': 'text-purple-300 bg-purple-500/20',
      'Architecture': 'text-blue-300 bg-blue-500/20',
      'Ancient History': 'text-amber-300 bg-amber-500/20',
      'Religious Monuments': 'text-rose-300 bg-rose-500/20',
      'Religious Sites': 'text-rose-300 bg-rose-500/20',
      'Archaeological Sites': 'text-orange-300 bg-orange-500/20',
      'Ancient Civilizations': 'text-yellow-300 bg-yellow-500/20',
      'National Monuments': 'text-green-300 bg-green-500/20',
    };
    return colors[category] || 'text-gray-300 bg-gray-500/20';
  };

  const formatDistance = (distance: number | null): string => {
    if (distance === null) return 'No guess made';
    if (distance < 1) return `${Math.round(distance * 1000)}m`;
    return `${Math.round(distance)}km`;
  };

  return (
    <div className="h-screen relative">
      {/* Full-screen Map */}
      <GoogleMap
        onLocationSelect={handleLocationSelect}
        selectedLocation={selectedLocation}
        correctLocation={showAnswer ? { lat: Number(question.answer_lat), lng: Number(question.answer_lng) } : null}
        showAnswer={showAnswer}
        isFullscreen={true}
      />
      
      {!showAnswer ? (
        <>
          {/* Question Card - Top Left */}
          <div className="absolute top-4 left-4 z-10 bg-black/85 backdrop-blur-md rounded-xl p-4 text-white shadow-2xl max-w-sm w-80 border border-white/10">
            {/* Header */}
            <div className="flex justify-between items-center mb-3">
              <div className="text-sm">
                <span className="text-white/70">Round {currentQuestion + 1} of {totalQuestions}</span>
                <div className="font-bold text-lg">Score: {score.toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className={`font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-white'}`}>
                  {timeLeft}s
                </span>
              </div>
            </div>
            
            {/* Question Content */}
            <div className="mb-4">
              <h2 className="text-lg font-bold mb-3 leading-tight">{question.question}</h2>
              
              {/* Context section (if available) */}
              {question.context && (
                <div className="mb-3 bg-blue-500/15 border border-blue-500/25 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-blue-300" />
                    <span className="text-sm text-blue-300 font-medium">Context</span>
                  </div>
                  <p className="text-sm text-white/90 leading-relaxed">{question.context}</p>
                </div>
              )}

              {/* Category and Difficulty Row */}
              <div className="mb-3 flex items-center gap-2 text-xs flex-wrap">
                <div className={`px-2 py-1 rounded-md flex items-center gap-1 ${getCategoryColor(question.category)}`}>
                  <Star className="w-3 h-3" />
                  <span>{question.category}</span>
                </div>
                <div className="bg-gray-500/20 px-2 py-1 rounded-md flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  <span className={getDifficultyColor(question.difficulty)}>
                    {getDifficultyText(question.difficulty)} ({question.difficulty}/10)
                  </span>
                </div>
              </div>

              {/* Time Period (if available) */}
              {question.time_period && (
                <div className="mb-3 bg-amber-500/15 border border-amber-500/25 rounded-lg p-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-300" />
                  <span className="text-xs text-amber-300">Built: {question.time_period}</span>
                </div>
              )}

              {/* Map instruction */}
              <div className="mb-3 text-center text-white/60 py-2">
                <MapPin className="w-6 h-6 mx-auto mb-1 opacity-50" />
                <p className="text-xs">Click on the map to place your guess</p>
                {selectedLocation && (
                  <p className="text-xs text-green-400 mt-1">
                    📍 Guess placed at {selectedLocation.lat.toFixed(2)}, {selectedLocation.lng.toFixed(2)}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitGuess}
              disabled={!selectedLocation}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center justify-center gap-2 shadow-lg disabled:shadow-none"
            >
              <Target className="w-4 h-4" />
              {selectedLocation ? 'Submit Guess' : 'Place Your Guess First'}
            </button>
            
            {!selectedLocation && (
              <p className="text-blue-200 text-xs mt-2 text-center opacity-75">
                💡 Tip: Click anywhere on the map to make your guess
              </p>
            )}
          </div>

          {/* Fun Fact Card - Bottom Right (if available) */}
          {question.fun_fact && (
            <div className="absolute bottom-4 right-4 z-10 bg-black/85 backdrop-blur-md rounded-xl p-4 text-white shadow-2xl max-w-xs border border-yellow-500/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="text-lg">💡</div>
                <span className="text-sm font-medium text-yellow-300">Did You Know?</span>
              </div>
              <p className="text-sm text-white/90 leading-relaxed">{question.fun_fact}</p>
            </div>
          )}

          {/* Answer Preview Card - Bottom Left */}
          <div className="absolute bottom-4 left-4 z-10 bg-black/85 backdrop-blur-md rounded-xl p-3 text-white shadow-2xl border border-white/10">
            <div className="flex items-center gap-2 text-sm">
              <Globe className="w-4 h-4 text-blue-400" />
              <span className="text-white/70">Looking for:</span>
              <span className="font-medium text-blue-300">{question.answer_city}, {question.answer_country}</span>
            </div>
          </div>
        </>
      ) : (
        /* Answer Screen */
        <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
          <div className="bg-black/90 backdrop-blur-md rounded-2xl p-8 text-white shadow-2xl max-w-2xl w-full border border-white/20">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-2">Round {currentQuestion + 1} Complete!</h2>
              <p className="text-white/70">Here's how you did:</p>
            </div>

            {/* Score Display */}
            <div className="text-center mb-6">
              <div className="text-6xl font-bold mb-2">
                <span className={getScoreColor(currentAnswer?.score || 0)}>
                  {(currentAnswer?.score || 0).toLocaleString()}
                </span>
              </div>
              <p className="text-white/70">points earned this round</p>
            </div>

            {/* Distance and Location Info */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="text-2xl font-bold mb-1">
                  <span className={getDistanceColor(currentAnswer?.distance || null)}>
                    {formatDistance(currentAnswer?.distance || null)}
                  </span>
                </div>
                <p className="text-sm text-white/70">away from correct location</p>
              </div>
              
              <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="text-lg font-bold mb-1 text-blue-300">
                  {question.answer_city}, {question.answer_country}
                </div>
                <p className="text-sm text-white/70">correct answer</p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <h3 className="font-semibold mb-2 text-blue-300">About this location:</h3>
              <p className="text-sm text-white/90 leading-relaxed">
                {question.context || question.fun_fact || `${question.answer_city} is located in ${question.answer_country}.`}
              </p>
            </div>

            {/* Current Total Score */}
            <div className="text-center mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="text-sm text-white/70 mb-1">Total Score</div>
              <div className="text-2xl font-bold text-green-400">
                {(score + (currentAnswer?.score || 0)).toLocaleString()}
              </div>
            </div>

            {/* Next Button */}
            <button
              onClick={handleNextRound}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium flex items-center justify-center gap-2 shadow-lg text-lg"
            >
              {currentQuestion < totalQuestions - 1 ? (
                <>
                  Next Round
                  <ArrowRight className="w-5 h-5" />
                </>
              ) : (
                <>
                  View Final Results
                  <Target className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameQuestion;