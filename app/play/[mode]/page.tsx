"use client"

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { GameMode, Location, GameAnswer, Player} from '@typesFolder/index';
import {Question} from '@typesFolder/question';
import { generateRoomCode, loadGoogleMapsScript } from '@utils/gameUtils';
import GameLobby from '@components/game/GameLobby';
import GameQuestion from '@components/game/GameQuestion';
import RoundResult from '@components/RoundResult';
import GameResult from '@components/game/GameResult';
import LoadingScreen from '@components/LoadingScreen';

// Use your API key implementation
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

const GamePage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const mode = params?.mode as string;

  // Game state
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [answers, setAnswers] = useState<GameAnswer[]>([]);
  const [gameComplete, setGameComplete] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  
  // Question state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState<boolean>(false);
  const [questionsError, setQuestionsError] = useState<string | null>(null);
  
  // Infinite mode specific state
  const [totalQuestionsPlayed, setTotalQuestionsPlayed] = useState<number>(0);
  const [isLoadingNewQuestions, setIsLoadingNewQuestions] = useState<boolean>(false);
  
  // Multiplayer state
  const [roomCode, setRoomCode] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [isHost, setIsHost] = useState<boolean>(false);
  const [roomPlayers, setRoomPlayers] = useState<Player[]>([]);
  
  // UI state
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState<boolean>(false);
  const [apiKeyMissing, setApiKeyMissing] = useState<boolean>(false);
  const [mapsLoadAttempted, setMapsLoadAttempted] = useState<boolean>(false);

  // Redirect invalid modes
  useEffect(() => {
    if (!['daily', 'infinite', 'multiplayer'].includes(mode)) {
      router.push('/');
      return;
    }
  }, [mode, router]);

  // Load Google Maps API - FIXED VERSION
  useEffect(() => {
    // Prevent multiple loading attempts
    if (mapsLoadAttempted) return;

    const loadMapsAPI = async () => {
      setMapsLoadAttempted(true);

      // Check if Google Maps is already loaded
      if (typeof window !== 'undefined' && window.google?.maps) {
        console.log('Google Maps already loaded');
        setGoogleMapsLoaded(true);
        return;
      }

      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        console.log('Google Maps script already exists, waiting for load...');
        
        // Wait for existing script to load
        existingScript.addEventListener('load', () => {
          setGoogleMapsLoaded(true);
        });
        
        existingScript.addEventListener('error', () => {
          setApiKeyMissing(true);
        });
        
        return;
      }

      // Load the script for the first time
      try {
        await loadGoogleMapsScript(GOOGLE_MAPS_API_KEY);
        setGoogleMapsLoaded(true);
      } catch (error) {
        console.error('Failed to load Google Maps:', error);
        setApiKeyMissing(true);
      }
    };

    loadMapsAPI();
  }, []); // Remove dependencies to prevent re-runs

  // Server integration function
  const fetchQuestions = async (gameMode: string, offset: number = 0): Promise<Question[]> => {
    setQuestionsLoading(true);
    setQuestionsError(null);

    try {
      let endpoint = '';

      switch (gameMode) {
        case 'daily':
          endpoint = '/api/daily_challenge?action=all';
          break;
        case 'infinite':
          // For infinite mode, get random questions from questions table
          endpoint = `/api/questions?action=random&limit=20&offset=${offset}`;
          break;
        case 'multiplayer':
          endpoint = '/api/questions?action=random&limit=10';
          break;
        default:
          throw new Error('Invalid game mode');
      }

      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error(`Failed to fetch questions: ${response.statusText}`);
      }

      const parsed = (await response.json()) as unknown;
      console.log("Server response:", parsed);

      let questions: Question[] = [];
      if (Array.isArray(parsed)) {
        questions = parsed as Question[];
      } else if ((parsed as any)?.questions && Array.isArray((parsed as any).questions)) {
        questions = (parsed as any).questions as Question[];
      }

      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('No questions received from server');
      }

      return questions;
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
    if (googleMapsLoaded && !mapsLoadAttempted) return; // Wait for maps to be fully loaded
    
    if (googleMapsLoaded) {
      if (mode === 'daily' || mode === 'infinite') {
        initializeGame();
      } else if (mode === 'multiplayer') {
        setGameStarted(false);
      }
    }
  }, [googleMapsLoaded, mode]);

  // Initialize game with question fetching
  const initializeGame = async (): Promise<void> => {
    try {
      const fetchedQuestions = await fetchQuestions(mode);
      console.log('Loaded questions:', fetchedQuestions);
      setQuestions(fetchedQuestions);
      startGame();
    } catch (error) {
      console.error('Failed to initialize game:', error);
      startGame();
    }
  };

  const startGame = (): void => {
    setCurrentQuestion(0);
    setScore(0);
    setAnswers([]);
    setGameComplete(false);
    setGameStarted(true);
    setTotalQuestionsPlayed(0);
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

  // Handle answer submission from GameQuestion
  const handleAnswerSubmitted = (answer: GameAnswer): void => {
    setAnswers(prev => [...prev, answer]);
    setScore(prev => prev + answer.score);
  };

  // UPDATED: Handle moving to next round from GameQuestion
  const handleNextRound = async (): Promise<void> => {
    if (mode === 'infinite') {
      // For infinite mode, always continue
      const nextQuestionIndex = currentQuestion + 1;
      setTotalQuestionsPlayed(prev => prev + 1);
      
      // If we're at the end of current batch, load more questions
      if (nextQuestionIndex >= questions.length) {
        await fetchNewQuestionsForInfinite();
      } else {
        setCurrentQuestion(nextQuestionIndex);
      }
    } else {
      // For daily/multiplayer modes, check if we're at the end
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        setGameComplete(true);
      }
    }
  };

  // UPDATED: Fetch new questions for infinite mode
  const fetchNewQuestionsForInfinite = async (): Promise<void> => {
    setIsLoadingNewQuestions(true);
    
    try {
      // Get fresh random questions (no offset needed since we're using random function)
      const newQuestions = await fetchQuestions('infinite');
      
      if (newQuestions.length > 0) {
        setQuestions(newQuestions);
        setCurrentQuestion(0);
      } else {
        // If no new questions available, end the game
        setGameComplete(true);
      }
    } catch (error) {
      console.error('Failed to fetch new questions for infinite mode:', error);
      
      // On error, try to continue with existing questions if available
      if (questions.length > 0) {
        // Restart from beginning if we have questions
        setCurrentQuestion(0);
      } else {
        // End game if no questions available
        setGameComplete(true);
      }
    } finally {
      setIsLoadingNewQuestions(false);
    }
  };

  const handleGameEnd = (): void => {
    router.push('/');
  };

  // NEW: Handle user manually ending infinite game
  const handleEndInfiniteGame = (): void => {
    setGameComplete(true);
  };

  // Render loading screen if Google Maps is not loaded or questions are loading
  if ((!googleMapsLoaded && !apiKeyMissing) || questionsLoading || isLoadingNewQuestions) {
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

  // MAIN GAME RENDERING - This is where GameQuestion gets rendered
  if (gameStarted && questions.length > 0 && currentQuestion < questions.length) {
    return (
      <>
        <GameQuestion
          question={questions[currentQuestion]}
          currentQuestion={mode === 'infinite' ? totalQuestionsPlayed : currentQuestion}
          totalQuestions={mode === 'infinite' ? 999 : questions.length} // Use high number for infinite
          score={score}
          onAnswerSubmitted={handleAnswerSubmitted}
          onNextRound={handleNextRound}
        />
        
        {/* NEW: Infinite mode exit button */}
        {mode === 'infinite' && (
          <button
            onClick={handleEndInfiniteGame}
            className="fixed top-4 right-4 z-20 bg-red-600/80 hover:bg-red-700 text-white px-4 py-2 rounded-lg backdrop-blur-sm transition-colors font-medium"
          >
            End Game
          </button>
        )}
      </>
    );
  }

  // Render multiplayer lobby setup if not started
  if (mode === 'multiplayer' && !gameStarted && roomPlayers.length === 0) {
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

  // Fallback loading
  return <LoadingScreen />;
};

export default GamePage;