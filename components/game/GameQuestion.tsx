import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Question } from "../../types/question";
import { Location, GameAnswer } from "../../types";
import { haversineDistance, calculateScore } from "../../utils/gameUtils";
import GoogleMap from "../GoogleMap";
import { 
  Clock, 
  ArrowRight, 
  Lightbulb, 
  Trophy, 
  Star, 
  HelpCircle, 
  MapPin, 
  Award,
  Flag, // Add Flag icon for report
  AlertTriangle // Add AlertTriangle for confirmation
} from "lucide-react";

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
  
  // Report functionality state
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [isReporting, setIsReporting] = useState<boolean>(false);
  const [hasReported, setHasReported] = useState<boolean>(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

const handleReportQuestion = async () => {
  if (isReporting || hasReported) return;

  setIsReporting(true);
  try {
    const response = await fetch('/api/questions', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        questionId: question.id,
        action: 'report'
      }),
    });

    if (response.ok) {
      const data = await response.json();
      setHasReported(true);
      setShowReportModal(false);
      console.log(`Question reported successfully. Total reports: ${data.reportCount}`);
      // Optional: Show success toast/notification
    } else {
      const errorData = await response.json();
      console.error('Failed to report question:', errorData.error);
      alert('Failed to report question. Please try again.');
    }
  } catch (error) {
    console.error('Error reporting question:', error);
    alert('Network error. Please check your connection and try again.');
  } finally {
    setIsReporting(false);
  }
};

  // Reset report state when question changes
  useEffect(() => {
    setHasReported(false);
    setShowReportModal(false);
  }, [currentQuestion]);

  // ... (rest of your existing code remains the same)

  const handleSubmitGuess = useCallback((): void => {
    if (showAnswer) return;

    let distance: number | null = null;
    let questionScore = 0;

    const correctCoordinates = {
      lat: Number(question.answer_lat),
      lng: Number(question.answer_lng),
    };

    if (isNaN(correctCoordinates.lat) || isNaN(correctCoordinates.lng)) {
      console.error("Invalid coordinates in question:", question);
      return;
    }

    if (!isFinite(correctCoordinates.lat) || !isFinite(correctCoordinates.lng)) {
      console.error("Coordinates are not finite numbers:", correctCoordinates);
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
      score: questionScore,
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
        setTimeLeft((prev) => {
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

  const getDistanceColor = (distance: number | null): string => {
    if (!distance) return "text-gray-400";
    if (distance <= 100) return "text-emerald-400";
    if (distance <= 500) return "text-yellow-400";
    if (distance <= 1000) return "text-amber-400";
    return "text-red-400";
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 3) return "text-emerald-400";
    if (difficulty <= 6) return "text-yellow-400";
    return "text-red-400";
  };

  const getDifficultyText = (difficulty: number) => {
    if (difficulty <= 3) return "Easy";
    if (difficulty <= 6) return "Medium";
    return "Hard";
  };

  const formatDistance = (distance: number | null): string => {
    if (distance === null) return "No guess made";
    if (distance < 1) return `${Math.round(distance * 1000)}m`;
    return `${Math.round(distance)}km`;
  };

  return (
    <div className="h-screen relative overflow-hidden">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/10 via-slate-900/5 to-gray-900/10 pointer-events-none z-0" />
      
      <GoogleMap
        onLocationSelect={handleLocationSelect}
        selectedLocation={selectedLocation}
        correctLocation={
          showAnswer
            ? {
                lat: Number(question.answer_lat),
                lng: Number(question.answer_lng),
              }
            : null
        }
        showAnswer={showAnswer}
        isFullscreen={true}
      />

      {/* Always Visible Report Button - Right Middle */}
      <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-10">
        <button
          onClick={() => setShowReportModal(true)}
          disabled={hasReported}
          className={`w-10 h-10 backdrop-blur-sm rounded-full transition-all duration-300 border shadow-lg group flex items-center justify-center ${
            hasReported 
              ? 'bg-green-600/80 border-green-400/30 text-green-200' 
              : 'bg-black/70 border-white/20 text-white hover:bg-red-600/80 hover:border-red-400/30'
          }`}
          title={hasReported ? "Question reported" : "Report question"}
        >
          {hasReported ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <Flag className="w-4 h-4 group-hover:scale-110 transition-transform" />
          )}
        </button>
      </div>

      {/* Always Visible Report Button - Right Middle */}
      <div className="absolute right-6 top-1/2 transform -translate-y-1/2 z-10">
        <button
          onClick={() => setShowReportModal(true)}
          disabled={hasReported}
          className={`w-10 h-10 backdrop-blur-sm rounded-full transition-all duration-300 border shadow-lg group flex items-center justify-center ${
            hasReported 
              ? 'bg-green-600/80 border-green-400/30 text-green-200' 
              : 'bg-black/70 border-white/20 text-white hover:bg-red-600/80 hover:border-red-400/30'
          }`}
          title={hasReported ? "Question reported" : "Report question"}
        >
          {hasReported ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <Flag className="w-4 h-4 group-hover:scale-110 transition-transform" />
          )}
        </button>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-md w-full">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-2xl blur-xl" />
            <div className="relative bg-black/90 backdrop-blur-xl rounded-2xl border border-red-500/30 shadow-2xl p-6">
              <div className="text-center">
                <div className="mb-4">
                  <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-white mb-2">Report Question</h3>
                  <p className="text-white/80 text-sm">
                    Are you sure you want to report this question? This will help us improve the game quality.
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowReportModal(false)}
                    disabled={isReporting}
                    className="flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white rounded-xl transition-all duration-300 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReportQuestion}
                    disabled={isReporting}
                    className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-xl transition-all duration-300 font-medium flex items-center justify-center gap-2"
                  >
                    {isReporting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Reporting...
                      </>
                    ) : (
                      <>
                        <Flag className="w-4 h-4" />
                        Report
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Image Modal */}
      {imageExpanded && question.image_url && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={toggleImageExpanded}
        >
          <div className="relative max-w-5xl max-h-full">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-2xl blur-xl" />
            <Image
              src={question.image_url}
              alt={question.image_alt || question.question}
              width={1200}
              height={800}
              className="relative max-w-full max-h-full object-contain rounded-2xl shadow-2xl border border-white/20"
              onError={handleImageError}
            />
            <button
              onClick={toggleImageExpanded}
              className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm text-white p-3 rounded-full hover:bg-black/90 transition-all duration-300 border border-white/20 shadow-lg"
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
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/30 to-amber-400/30 rounded-2xl blur-lg" />
              <div className="relative bg-black/80 backdrop-blur-xl rounded-2xl border border-yellow-500/30 shadow-2xl px-8 py-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Clock className={`w-6 h-6 ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-yellow-400'}`} />
                    {timeLeft <= 10 && (
                      <div className="absolute inset-0 bg-red-400/30 rounded-full animate-ping" />
                    )}
                  </div>
                  <span
                    className={`font-bold text-2xl ${
                      timeLeft <= 10 ? "text-red-400 animate-pulse" : "text-white"
                    }`}
                  >
                    {timeLeft}s
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Score Card - Top Right */}
          <div className="absolute top-6 right-6 z-10">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/30 to-amber-400/30 rounded-2xl blur-lg" />
              <div className="relative bg-black/80 backdrop-blur-xl rounded-2xl border border-yellow-500/30 shadow-2xl p-5">
                <div className="text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span className="text-white/80 text-sm font-medium">
                      Round {currentQuestion + 1} of {totalQuestions}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <span className="font-bold text-xl bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                      {score.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Question Card - Top Left */}
          <div className="absolute top-6 left-6 z-10 max-w-sm w-80">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/30 to-amber-400/30 rounded-2xl blur-lg" />
              <div className="relative bg-black/85 backdrop-blur-xl rounded-2xl border border-yellow-500/30 shadow-2xl overflow-hidden">
                {/* Image Section */}
                {question.image_url && !imageError && (
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                    <Image
                      src={question.image_url}
                      alt={question.image_alt}
                      width={320}
                      height={200}
                      className="w-full h-50 object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                      onError={handleImageError}
                      onClick={toggleImageExpanded}
                    />
                    
                    {/* Expand Button */}
                    <button
                      onClick={toggleImageExpanded}
                      className="absolute top-3 right-3 z-20 bg-black/70 backdrop-blur-sm text-white p-2 rounded-xl hover:bg-black/90 transition-all duration-300 border border-white/20 shadow-lg group"
                    >
                      <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Question Content */}
                <div className="p-5 text-white">
                  <h2 className="text-lg font-bold mb-4 leading-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    {question.question}
                  </h2>

                  {/* Difficulty Badge */}
                  <div className="mb-4 flex items-center gap-2">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-500/30 to-gray-600/30 rounded-lg blur-sm" />
                      <div className="relative bg-gray-800/80 backdrop-blur-sm px-3 py-2 rounded-lg flex items-center gap-2 border border-gray-600/30">
                        <HelpCircle className="w-3 h-3 text-gray-300" />
                        <span className={`text-xs font-bold ${getDifficultyColor(question.difficulty)}`}>
                          {getDifficultyText(question.difficulty)} ({question.difficulty}/10)
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleSubmitGuess}
                    disabled={!selectedLocation}
                    className="w-full relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/60 to-yellow-300/60 rounded-xl blur-md opacity-80 group-hover:opacity-100 transition-opacity disabled:opacity-20" />
                    <div className={`relative bg-gradient-to-r from-yellow-500/65 to-yellow-400/65 backdrop-blur-sm text-white py-3 px-4 rounded-xl font-bold transition-all duration-300 border border-yellow-300/50 shadow-lg flex items-center justify-center gap-2 ${
                      !selectedLocation ? 'opacity-40 cursor-not-allowed' : 'hover:from-yellow-400/60 hover:to-yellow-300/60 hover:scale-102 hover:shadow-yellow-400/30'
                    }`}>
                      <MapPin className="w-4 h-4" />
                      Make Guess
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Fun Fact Card - Bottom Left */}
          {question.fun_fact && (
            <div className="absolute bottom-6 left-6 z-10 max-w-sm w-80">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/30 to-amber-400/30 rounded-2xl blur-lg" />
                <div className="relative bg-black/85 backdrop-blur-xl rounded-2xl border border-yellow-500/30 shadow-2xl p-5 text-white">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="relative">
                      <div className="absolute inset-0 bg-yellow-500/30 rounded-full blur-sm" />
                      <Lightbulb className="relative w-6 h-6 text-yellow-400" />
                    </div>
                    <span className="font-bold text-yellow-300 text-sm">
                      Did You Know?
                    </span>
                  </div>
                  <p className="text-sm text-white/90 leading-relaxed font-medium">
                    {question.fun_fact}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Answer Screen - (rest remains the same) */
        <>
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-md px-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/30 to-amber-400/30 rounded-2xl blur-lg animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 via-amber-400/20 to-yellow-600/20 rounded-2xl blur-xl opacity-60" />
              
              <div className="relative bg-gradient-to-br from-black/95 via-gray-900/90 to-black/95 backdrop-blur-xl rounded-2xl border border-yellow-500/40 shadow-2xl p-6 text-white overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 -left-4 w-24 h-24 bg-gradient-to-br from-yellow-400/30 to-amber-400/30 rounded-full blur-2xl animate-pulse"></div>
                  <div className="absolute bottom-0 -right-4 w-32 h-32 bg-gradient-to-br from-amber-400/20 to-yellow-500/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
                </div>
                
                <div className="relative z-10">
                  <div className="text-center mb-4">
                    <h2 className="text-xl font-bold mb-1 bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                      Round {currentQuestion + 1} Complete!
                    </h2>
                    <p className="text-white/70 text-sm">points earned</p>
                  </div>

                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold mb-1">
                      <span className={`bg-gradient-to-r ${
                        (currentAnswer?.score || 0) >= 4000 ? 'from-emerald-400 to-green-400' :
                        (currentAnswer?.score || 0) >= 2000 ? 'from-yellow-400 to-amber-400' :
                        (currentAnswer?.score || 0) >= 1000 ? 'from-amber-400 to-red-400' :
                        'from-red-400 to-red-500'
                      } bg-clip-text text-transparent`}>
                        {(currentAnswer?.score || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-xl blur-sm" />
                      <div className="relative text-center p-3 bg-gradient-to-br from-white/20 via-white/10 to-white/5 rounded-xl border border-white/30 backdrop-blur-sm flex flex-col justify-center min-h-[80px]">
                        <div className="text-md font-bold">
                          <span className={getDistanceColor(currentAnswer?.distance || null)}>
                            {formatDistance(currentAnswer?.distance || null)}
                          </span>
                        </div>
                        <p className="text-xs text-white/70">distance off</p>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-xl blur-sm" />
                      <div className="relative text-center p-3 bg-gradient-to-br from-white/20 via-white/10 to-white/5 rounded-xl border border-white/30 backdrop-blur-sm flex flex-col justify-center min-h-[80px]">
                        <div className="text-sm font-bold mb-1 text-yellow-300 leading-tight">
                          {question.answer_city}, {question.answer_country}
                        </div>
                        <p className="text-xs text-white/70">target location</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleNextRound}
                    className="w-full relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/60 to-yellow-300/60 rounded-xl blur-sm opacity-75 group-hover:opacity-100 transition-opacity" />
                    <div className="relative bg-gradient-to-r from-yellow-500/65 to-yellow-400/65  text-white py-3 px-4 rounded-xl 'hover:from-yellow-400/60 hover:to-yellow-300/60  transition-all duration-300 font-bold flex items-center justify-center gap-2 shadow-lg hover:scale-105 border border-yellow-400/30">
                      {currentQuestion < totalQuestions - 1 ? (
                        <>
                          Next Round
                          <ArrowRight className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          View Final Results
                          <Award className="w-4 h-4" />
                        </>
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Context Box */}
          <div className="fixed bottom-8 right-8 z-10 w-80 max-w-[calc(100vw-2rem)]">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/30 to-amber-400/30 rounded-2xl blur-lg" />
              <div className="absolute inset-0 bg-gradient-to-tl from-amber-500/20 to-yellow-400/20 rounded-2xl blur-xl opacity-50" />
              
              <div className="relative bg-gradient-to-br from-black/95 via-gray-900/85 to-black/90 backdrop-blur-xl rounded-2xl border border-yellow-500/40 shadow-2xl p-5 text-white overflow-hidden">
                <div className="absolute inset-0 opacity-15">
                  <div className="absolute top-2 right-2 w-16 h-16 bg-gradient-to-br from-yellow-400/40 to-transparent rounded-full blur-xl animate-pulse"></div>
                  <div className="absolute bottom-2 left-2 w-20 h-20 bg-gradient-to-tr from-amber-400/30 to-transparent rounded-full blur-2xl animate-pulse delay-700"></div>
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="relative">
                        <div className="absolute inset-0 bg-yellow-500/40 rounded-lg blur-sm animate-pulse" />
                        <div className="relative w-8 h-8 bg-gradient-to-br from-yellow-500/30 via-amber-500/20 to-yellow-600/30 border border-yellow-500/50 rounded-lg flex items-center justify-center backdrop-blur-sm">
                          <MapPin className="w-4 h-4 text-yellow-300" />
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold mb-2 text-yellow-300 text-sm">
                        Location Info
                      </h3>
                      <p className="text-sm text-white/90 leading-relaxed">
                        {question.context ||
                          question.fun_fact ||
                          `${question.answer_city} is located in ${question.answer_country}.`}
                      </p>
                    </div>
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