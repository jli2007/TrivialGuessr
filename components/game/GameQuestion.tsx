import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Clock, Target, Globe, Info, MapPin, Calendar, Star, ArrowRight, Image as ImageIcon } from 'lucide-react';
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
  const [imageError, setImageError] = useState<boolean>(false);
  const [imageExpanded, setImageExpanded] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Wrap handleSubmitGuess in useCallback to prevent unnecessary re-renders
  const handleSubmitGuess = useCallback((): void => {
    if (showAnswer) return;

    let distance: number | null = null;
    let questionScore = 0;
    
    const correctCoordinates = {
      lat: Number(question.answer_lat),
      lng: Number(question.answer_lng)
    };
    
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
    
    setTimeout(() => {
      onAnswerSubmitted(newAnswer);
    }, 0);
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, [showAnswer, selectedLocation, question, onAnswerSubmitted]);

  // Timer effect
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
  }, [showAnswer, timeLeft, handleSubmitGuess]);

  // Reset state when question changes
  useEffect(() => {
    setSelectedLocation(null);
    setShowAnswer(false);
    setTimeLeft(60);
    setCurrentAnswer(null);
    setImageError(false);
    setImageExpanded(false);
  }, [currentQuestion]);

  const handleLocationSelect = (location: Location): void => {
    if (!showAnswer) {
      setSelectedLocation(location);
    }
  };

  const handleNextRound = (): void => {
    onNextRound();
  };

  const handleImageError = (): void => {
    setImageError(true);
  };

  const toggleImageExpanded = (): void => {
    setImageExpanded(!imageExpanded);
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
      
      {/* Expanded Image Modal */}
      {imageExpanded && question.image_url && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={toggleImageExpanded}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={question.image_url}
              alt={question.image_alt || question.question}
              className="max-w-full max-h-full object-contain rounded-lg"
              onError={handleImageError}
            />
            <button
              onClick={toggleImageExpanded}
              className="absolute top-4 right-4 bg-black/70 text-white p-2 rounded-full hover:bg-black/90 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      {!showAnswer ? (
        <>
          {/* Timer - Center Top */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 rounded-xl shadow-2xl border border-white/10">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md rounded-xl"></div>
            <div className="relative px-6 py-3 text-white">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <span className={`font-bold text-xl ${timeLeft <= 10 ? 'text-red-400' : 'text-white'}`}>
                  {timeLeft}s
                </span>
              </div>
            </div>
          </div>

          {/* Score and Round Card - Top Right */}
          <div className="absolute top-4 right-4 z-10 rounded-xl shadow-2xl border border-white/10">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md rounded-xl"></div>
            <div className="relative p-4 text-white">
              <div className="text-sm">
                <span className="text-white/70">Round {currentQuestion + 1} of {totalQuestions}</span>
                <div className="font-bold text-lg">Score: {score.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Question Card with Image - Top Left */}
          <div className="absolute top-4 left-4 z-10 rounded-xl shadow-2xl max-w-sm w-80 border border-white/10">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md rounded-xl"></div>
            
            <div className="relative text-white overflow-hidden rounded-xl">
              {/* Image Section */}
              {question.image_url && !imageError && (
                <div className="relative">
                  <img
                    src={question.image_url}
                    alt={question.image_alt}
                    className="w-full h-48 object-cover cursor-pointer hover:brightness-110 transition-all"
                    onError={handleImageError}
                    onClick={toggleImageExpanded}
                  />
                  
                  {/* Image Expand Button */}
                  <button
                    onClick={toggleImageExpanded}
                    className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-lg hover:bg-black/70 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Question Content */}
              <div className="p-4">
                <h2 className="text-lg font-bold mb-3 leading-tight">{question.question}</h2>


                {/* Category and Difficulty Row */}
                <div className="mb-3 flex items-center gap-2 text-xs flex-wrap">
                  <div className="bg-gray-500/20 px-2 py-1 rounded-md flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    <span className={getDifficultyColor(question.difficulty)}>
                      {getDifficultyText(question.difficulty)} ({question.difficulty}/10)
                    </span>
                  </div>
                </div>
                
                {/* Submit Button */}
                <button
                  onClick={handleSubmitGuess}
                  disabled={!selectedLocation}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center justify-center gap-2 shadow-lg disabled:shadow-none"
                >
                  <Target className="w-4 h-4" />
                  Submit Guess
                </button>
              </div>
            </div>
          </div>

          {/* Fun Fact Card - Bottom Right (if available and no image or image failed) */}
          {question.fun_fact && (!question.image_url || imageError) && (
            <div className="absolute bottom-4 right-4 z-10 rounded-xl shadow-2xl max-w-xs border border-yellow-500/20">
              <div className="absolute inset-0 bg-black/85 backdrop-blur-md rounded-xl"></div>
              <div className="relative p-4 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-lg">💡</div>
                  <span className="text-sm font-medium text-yellow-300">Did You Know?</span>
                </div>
                <p className="text-sm text-white/90 leading-relaxed">{question.fun_fact}</p>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Answer Screen - Same as before */
        <>
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-sm px-3">
            <div className="rounded-xl shadow-2xl border border-white/20">
              <div className="absolute inset-0 bg-black/90 backdrop-blur-md rounded-xl"></div>
              <div className="relative p-4 text-white">
                <div className="text-center mb-3">
                  <h2 className="text-lg font-bold mb-0.5">Round {currentQuestion + 1} Complete!</h2>
                  <p className="text-white/70 text-xs">Here's how you did:</p>
                </div>

                <div className="text-center mb-3">
                  <div className="text-2xl font-bold mb-0.5">
                    <span className={getScoreColor(currentAnswer?.score || 0)}>
                      {(currentAnswer?.score || 0).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-white/70 text-xs">points earned this round</p>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="text-center p-2 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-base font-bold mb-0.5">
                      <span className={getDistanceColor(currentAnswer?.distance || null)}>
                        {formatDistance(currentAnswer?.distance || null)}
                      </span>
                    </div>
                    <p className="text-xs text-white/70">distance off</p>
                  </div>

                  <div className="text-center p-2 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-xs font-bold mb-0.5 text-blue-300 leading-tight">
                      {question.answer_city}, {question.answer_country}
                    </div>
                    <p className="text-xs text-white/70">correct answer</p>
                  </div>
                </div>

                <button
                  onClick={handleNextRound}
                  className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium flex items-center justify-center gap-2 shadow-lg text-sm"
                >
                  {currentQuestion < totalQuestions - 1 ? (
                    <>
                      Next Round
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      View Final Results
                      <Target className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Context Box with Image Support */}
          <div className="fixed bottom-6 right-6 z-10 w-80 max-w-[calc(100vw-24rem)]">
            <div className="rounded-2xl shadow-2xl border border-white/20">
              <div className="absolute inset-0 bg-black/90 backdrop-blur-md rounded-2xl"></div>
              <div className="relative p-4 text-white">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-8 h-8 bg-blue-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-2 text-blue-300 text-sm">About this location</h3>
                    <p className="text-xs text-white/90 leading-relaxed">
                      {question.context || question.fun_fact || `${question.answer_city} is located in ${question.answer_country}.`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GameQuestion;