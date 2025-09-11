"use client"

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Location, GameAnswer, Player, Question } from '@typesFolder/index';
import { haversineDistance, calculateScore, generateRoomCode, loadGoogleMapsScript } from '@utils/gameUtils';
import GameLobby from '@components/game/GameLobby';
import GameQuestion from '@components/game/GameQuestion';
import RoundResult from '@components/RoundResult';
import GameResult from '@components/game/GameResult';
import LoadingScreen from '@components/LoadingScreen';

const GOOGLE_MAPS_API_KEY = "AIzaSyCNwD45N6q_OTQhA7I6wZTEg-UQYsM8RHo";

const GamePage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const mode = params?.mode as string;

  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [answers, setAnswers] = useState<GameAnswer[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [gameComplete, setGameComplete] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  
  // Question state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState<boolean>(false);
  const [questionsError, setQuestionsError] = useState<string | null>(null);
  
  // Multiplayer state
  const [roomCode, setRoomCode] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [isHost, setIsHost] = useState<boolean>(false);
  const [roomPlayers, setRoomPlayers] = useState<Player[]>([]);
  
  // UI state
  const [isMapFullscreen, setIsMapFullscreen] = useState<boolean>(false);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState<boolean>(false);
  const [apiKeyMissing, setApiKeyMissing] = useState<boolean>(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Redirect invalid modes
  useEffect(() => {
    if (!['daily', 'infinite', 'multiplayer'].includes(mode)) {
      router.push('/');
      return;
    }
  }, [mode, router]);

  // Load Google Maps API
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.google) {
      loadGoogleMapsScript(GOOGLE_MAPS_API_KEY)
        .then(() => setGoogleMapsLoaded(true))
        .catch(() => setApiKeyMissing(true));
    } else if (window.google) {
      setGoogleMapsLoaded(true);
    }
  }, []);

 // --- changed/added comments mark what I modified/added ---
const fetchQuestions = async (gameMode: string): Promise<Question[]> => {
  setQuestionsLoading(true);
  setQuestionsError(null);

  try {
    let endpoint = '';

    switch (gameMode) {
      case 'daily':
        endpoint = '/api/daily_challenge?action=all';
        break;
      case 'infinite':
        endpoint = '/api/questions?action=random&limit=100';
        break;
      case 'multiplayer':
        endpoint = '/api/questions?action=random';
        break;
      default:
        throw new Error('Invalid game mode');
    }

    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error(`Failed to fetch questions: ${response.statusText}`);
    }

    // <-- changed: allow either an array or an object with .questions
    const parsed = (await response.json()) as unknown; // <-- added
    console.log("FRICKIN PARSED", parsed); // <-- added: inspect raw parsed payload

    // <-- added: normalize to an array whether the server returned Question[] or { questions: Question[] }
    let questions: Question[] = [];
    if (Array.isArray(parsed)) {
      questions = parsed as Question[];
    } else if ((parsed as any)?.questions && Array.isArray((parsed as any).questions)) {
      questions = (parsed as any).questions as Question[];
    }

    // <-- changed: validate the normalized questions array (not `data` object)
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('No questions received from server');
    }

    return questions; // <-- unchanged: return normalized array
  } catch (error) {
    console.error('Error fetching questions:', error);
    setQuestionsError(error instanceof Error ? error.message : 'Failed to load questions');
    return [];
  } finally {
    setQuestionsLoading(false);
  }
};


  // Initialize game based on mode
  useEffect(() => {
    if (googleMapsLoaded) {
      if (mode === 'daily' || mode === 'infinite') {
        initializeGame();
      } else if (mode === 'multiplayer') {
        // For multiplayer, we need lobby setup first
        setGameStarted(false);
      }
    }
  }, [googleMapsLoaded, mode]);

  // Initialize game with question fetching
  const initializeGame = async (): Promise<void> => {
    try {
      const fetchedQuestions = await fetchQuestions(mode);
      console.log(fetchedQuestions);
      setQuestions(fetchedQuestions);
      startGame();
    } catch (error) {
      console.error('Failed to initialize game:', error);
      startGame();
    }
  };

  // Timer effect
  useEffect(() => {
    if (gameStarted && !showResult && !gameComplete && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleAnswer();
            return 60;
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
  }, [gameStarted, showResult, gameComplete, timeLeft]);

  const startGame = (): void => {
    setCurrentQuestion(0);
    setScore(0);
    setAnswers([]);
    setGameComplete(false);
    setTimeLeft(60);
    setSelectedLocation(null);
    setShowResult(false);
    setGameStarted(true);
  };

  const createRoom = (): void => {
    if (playerName.trim()) {
      const code = generateRoomCode();
      setRoomCode(code);
      setIsHost(true);
      setRoomPlayers([{ name: playerName, score: 0, isHost: true }]);
    }
  };

  const joinRoom = (): void => {
    if (playerName.trim() && roomCode.trim()) {
      setRoomPlayers([
        { name: "Host Player", score: 0, isHost: true },
        { name: playerName, score: 0, isHost: false }
      ]);
    }
  };

  const startMultiplayerGame = async (): Promise<void> => {
    try {
      const fetchedQuestions = await fetchQuestions('multiplayer');
      setQuestions(fetchedQuestions);
      startGame();
    } catch (error) {
      console.error('Failed to start multiplayer game:', error);
      startGame();
    }
  };

  const handleLocationSelect = (location: Location): void => {
    setSelectedLocation(location);
  };

  const handleAnswer = (): void => {
    const question = questions[currentQuestion];
    let distance: number | null = null;
    let questionScore = 0;
    
    if (selectedLocation) {
      distance = haversineDistance(
        selectedLocation.lat,
        selectedLocation.lng,
        question.correct_coordinates.lat,
        question.correct_coordinates.lng
      );
      questionScore = calculateScore(distance);
    }
    
    const newAnswer: GameAnswer = {
      question: question.prompt,
      userGuess: selectedLocation,
      correctLocation: question.correct_coordinates,
      correctAnswer: question.correct_answer,
      distance,
      score: questionScore
    };

    setAnswers(prev => [...prev, newAnswer]);
    setScore(prev => prev + questionScore);
    setShowResult(true);
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setTimeout(() => {
      setShowResult(false);
      setSelectedLocation(null);
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setTimeLeft(60);
      } else {
        // Handle end of questions
        if (mode === 'infinite') {
          // For infinite mode, fetch new random questions
          fetchNewQuestionsForInfinite();
        } else {
          setGameComplete(true);
        }
      }
    }, 6000);
  };

  // Fetch new questions for infinite mode
  const fetchNewQuestionsForInfinite = async (): Promise<void> => {
    try {
      const newQuestions = await fetchQuestions('infinite');
      setQuestions(newQuestions);
      setCurrentQuestion(0);
      setTimeLeft(60);
    } catch (error) {
      console.error('Failed to fetch new questions for infinite mode:', error);
      // Loop back to current questions
      setCurrentQuestion(0);
      setTimeLeft(60);
    }
  };

  const handleGameEnd = (): void => {
    router.push('/');
  };

  const toggleFullscreen = (): void => {
    setIsMapFullscreen(prev => !prev);
  };

  // Render loading screen if Google Maps is not loaded or questions are loading
  if ((!googleMapsLoaded && !apiKeyMissing) || questionsLoading) {
    return <LoadingScreen />;
  }

  // Render API key error if needed
  if (apiKeyMissing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white/10 backdrop-blur-md rounded-xl p-8 text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <h2 className="text-3xl font-bold text-white mb-6">Google Maps Integration</h2>
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 mb-6">
            <h3 className="text-red-300 font-semibold mb-3">API Key Error</h3>
            <p className="text-white/90 mb-4">
              There was an issue loading Google Maps. Please check your API key and ensure:
            </p>
            <ol className="text-left text-white/80 space-y-2">
              <li>1. The API key is valid and active</li>
              <li>2. Maps JavaScript API is enabled</li>
              <li>3. Billing is set up in Google Cloud Console</li>
              <li>4. API key restrictions allow this domain</li>
            </ol>
          </div>
          <button
            onClick={handleGameEnd}
            className="bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  // Render questions error if needed
  if (questionsError && questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white/10 backdrop-blur-md rounded-xl p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-3xl font-bold text-white mb-6">Questions Loading Error</h2>
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 mb-6">
            <h3 className="text-red-300 font-semibold mb-3">Failed to Load Questions</h3>
            <p className="text-white/90 mb-4">{questionsError}</p>
          </div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => initializeGame()}
              className="bg-green-600 text-white py-3 px-8 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Try Again
            </button>
            <button
              onClick={handleGameEnd}
              className="bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render game complete screen
  if (gameComplete) {
    return (
      <GameResult
        score={score}
        answers={answers}
        onPlayAgain={handleGameEnd}
      />
    );
  }

  // Render round result screen
  if (showResult && answers.length > 0) {
    return (
      <RoundResult
        lastAnswer={answers[answers.length - 1]}
        score={score}
      />
    );
  }

  // Render multiplayer lobby if not started
  if (mode === 'multiplayer' && !gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white/10 backdrop-blur-md rounded-xl p-8">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Join Multiplayer Game</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-white/90 mb-2 font-medium">Your Name</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-white/90 mb-2 font-medium">Room Code</label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="Enter room code"
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={createRoom}
                disabled={!playerName.trim()}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Create Room
              </button>
              <button
                onClick={joinRoom}
                disabled={!playerName.trim() || !roomCode.trim()}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Join Room
              </button>
            </div>
            
            <button
              onClick={handleGameEnd}
              className="w-full bg-white/10 text-white py-3 px-6 rounded-lg hover:bg-white/20 transition-colors font-medium"
            >
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show lobby if we have room setup
  if (mode === 'multiplayer' && roomPlayers.length > 0 && !gameStarted) {
    return (
      <GameLobby
        roomCode={roomCode}
        roomPlayers={roomPlayers}
        isHost={isHost}
        onStartGame={startMultiplayerGame}
        onLeaveRoom={handleGameEnd}
      />
    );
  }

  // Render main game (only if we have questions loaded)
  if (gameStarted && questions.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <GameQuestion
          question={questions[currentQuestion]}
          currentQuestion={currentQuestion}
          totalQuestions={mode === 'infinite' ? 0 : questions.length}
          score={score}
          timeLeft={timeLeft}
          selectedLocation={selectedLocation}
          isMapFullscreen={isMapFullscreen}
          onLocationSelect={handleLocationSelect}
          onSubmitGuess={handleAnswer}
          onToggleFullscreen={toggleFullscreen}
        />
      </div>
    );
  }

  // Fallback loading
  return <LoadingScreen />;
};

export default GamePage;