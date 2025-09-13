"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { GameAnswer, Player} from '@typesFolder/index';
import {Question} from '@typesFolder/question';
import { generateRoomCode, loadGoogleMapsScript } from '@utils/gameUtils';
import GameLobby from '@components/game/GameLobby';
import GameQuestion from '@components/game/GameQuestion';
import GameResult from '@components/game/GameResult';
import LoadingScreen from '@components/LoadingScreen';
import io from "socket.io-client";

const SOCKET_SERVER_URL = "http://localhost:3001";
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
  
  // UI state
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState<boolean>(false);
  const [apiKeyMissing, setApiKeyMissing] = useState<boolean>(false);
  const [mapsLoadAttempted, setMapsLoadAttempted] = useState<boolean>(false);

  // Multiplayer state
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [roomPlayers, setRoomPlayers] = useState<Player[]>([]);
  const [showLobby, setShowLobby] = useState(false);

  const socketRef = useRef<any>(null);

  // Define callback functions before useEffect
  const onRoomJoined = useCallback((roomId: string, players: Player[], hostStatus: boolean) => {
    setRoomCode(roomId);
    setRoomPlayers(players);
    setIsHost(hostStatus);
    setShowLobby(true);
  }, []);

  const createMultiplayerRoom = useCallback(() => {
    if (!playerName.trim()) {
      alert("Please enter your name first");
      return;
    }
    socketRef.current?.emit("createRoom", { userName: playerName });
  }, [playerName]);

  const joinMultiplayerRoom = useCallback(() => {
    if (!playerName.trim() || !roomCode.trim()) {
      alert("Please enter both your name and room code");
      return;
    }
    socketRef.current?.emit("joinRoom", {
      roomId: roomCode.toUpperCase(),
      userName: playerName,
    });
  }, [playerName, roomCode]);

  // Socket setup
  useEffect(() => {
    if (mode !== 'multiplayer') return;

    // Connect socket
    socketRef.current = io(SOCKET_SERVER_URL);

    // Handle room created response from server
    socketRef.current.on("roomCreated", (data: { roomId: string }) => {
      console.log("Room created:", data);
      // We'll get the room data separately
    });

    // Handle room data updates
    socketRef.current.on("roomData", (room: { players: Player[] }) => {
      console.log("Room data received:", room);
      setRoomPlayers(room.players);
      
      // Check if this is the first time receiving room data after creating/joining
      if (!showLobby) {
        const currentPlayer = room.players.find(p => p.name === playerName);
        setIsHost(currentPlayer?.isHost || false);
        setShowLobby(true);
      }
    });

    // Handle errors
    socketRef.current.on("error", (message: string) => {
      console.error("Socket error:", message);
      alert(message);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [mode, playerName, showLobby]);

  // Redirect invalid modes
  useEffect(() => {
    if (!['daily', 'casual', 'multiplayer'].includes(mode)) {
      router.push('/');
      return;
    }
  }, [mode, router]);

  // Load Google Maps API
  useEffect(() => {
    if (mapsLoadAttempted) return;

    const loadMapsAPI = async () => {
      setMapsLoadAttempted(true);

      if (typeof window !== 'undefined' && window.google?.maps) {
        console.log('Google Maps already loaded');
        setGoogleMapsLoaded(true);
        return;
      }

      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        console.log('Google Maps script already exists, waiting for load...');
        
        existingScript.addEventListener('load', () => {
          setGoogleMapsLoaded(true);
        });
        
        existingScript.addEventListener('error', () => {
          setApiKeyMissing(true);
        });
        
        return;
      }

      try {
        await loadGoogleMapsScript(GOOGLE_MAPS_API_KEY);
        setGoogleMapsLoaded(true);
      } catch (error) {
        console.error('Failed to load Google Maps:', error);
        setApiKeyMissing(true);
      }
    };

    loadMapsAPI();
  }, []);

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
        case 'casual':
          endpoint = `/api/questions?action=random&limit=10&offset=${offset}`;
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
    if (!googleMapsLoaded) return;
    
    if (mode === 'daily' || mode === 'casual') {
      initializeGame();
    }
    // For multiplayer, we wait for the lobby
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
  };

  const startMultiplayerGame = async (): Promise<void> => {
    try {
      const fetchedQuestions = await fetchQuestions('multiplayer');
      setQuestions(fetchedQuestions);
      startGame();
      setShowLobby(false); // Hide lobby when game starts
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

  // Handle moving to next round from GameQuestion
  const handleNextRound = async (): Promise<void> => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setGameComplete(true);
    }
  };

  const handleGameEnd = (): void => {
    // Clean up socket connection
    socketRef.current?.disconnect();
    router.push('/');
  };

  const handleLeaveRoom = (): void => {
    socketRef.current?.disconnect();
    router.push('/');
  };

  // Get player name from URL params if coming from home page
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const nameFromUrl = urlParams.get('playerName');
    const codeFromUrl = urlParams.get('roomCode');
    
    if (nameFromUrl) setPlayerName(nameFromUrl);
    if (codeFromUrl) setRoomCode(codeFromUrl);
  }, []);

  // Render loading screen if Google Maps is not loaded or questions are loading
  if ((!googleMapsLoaded && !apiKeyMissing) || questionsLoading) {
    return <LoadingScreen />;
  }

  // Render API key error if needed
  if (apiKeyMissing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-secondary-900 to-primary-800 flex items-center justify-center p-4">
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
  if (questionsError && questions.length === 0 && mode !== 'multiplayer') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-secondary-900 to-primary-800 flex items-center justify-center p-4">
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

  // MAIN GAME RENDERING
  if (gameStarted && questions.length > 0 && currentQuestion < questions.length) {
    return (
      <GameQuestion
        question={questions[currentQuestion]}
        currentQuestion={currentQuestion}
        totalQuestions={mode === 'casual' ? 10 : questions.length}
        score={score}
        onAnswerSubmitted={handleAnswerSubmitted}
        onNextRound={handleNextRound}
      />
    );
  }

  // Show lobby for multiplayer mode
  if (mode === 'multiplayer' && showLobby && !gameStarted) {
    return (
      <GameLobby
        roomCode={roomCode}
        roomPlayers={roomPlayers}
        isHost={isHost}
        onStartGame={startMultiplayerGame}
        onLeaveRoom={handleLeaveRoom}
      />
    );
  }

  // Show multiplayer setup screen
  if (mode === 'multiplayer' && !showLobby) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-secondary-900 to-primary-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-black/20 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/10">
          <h2 className="text-white text-2xl font-bold text-center mb-6">Multiplayer Setup</h2>
          
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/50 border border-white/20 focus:border-secondary-400/60 focus:outline-none focus:ring-2 focus:ring-secondary-400/20 transition-all duration-200"
            />

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Room Code (optional)"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/50 border border-white/20 focus:border-primary-400/60 focus:outline-none focus:ring-2 focus:ring-primary-400/20 transition-all duration-200"
              />
              <button
                onClick={joinMultiplayerRoom}
                disabled={!playerName.trim() || !roomCode.trim()}
                className="px-6 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 font-semibold"
              >
                Join
              </button>
            </div>

            <button
              onClick={createMultiplayerRoom}
              disabled={!playerName.trim()}
              className="w-full py-3 bg-secondary-500 hover:bg-secondary-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 font-semibold"
            >
              Create Room
            </button>

            <button
              onClick={handleGameEnd}
              className="w-full py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-all duration-200 font-semibold"
            >
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Fallback loading
  return <LoadingScreen />;
};

export default GamePage;