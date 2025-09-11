"use client"

import React, { useState, useEffect, useRef } from 'react';
import { GameMode, Location, GameAnswer, Player } from '@typesFolder/index';
import { mockQuestions, dailyLeaderboard } from '@data/mockData';
import { haversineDistance, calculateScore, generateRoomCode, loadGoogleMapsScript } from '@utils/gameUtils';
import GameMenu from '@components/game/GameMenu';
import GameLobby from '@components/game/GameLobby';
import GameQuestion from '@components/game/GameQuestion';
import RoundResult from '@components/RoundResult';
import GameResult from '@components/game/GameResult';
import LoadingScreen from '@components/LoadingScreen';

const GOOGLE_MAPS_API_KEY = 'AIzaSyBqVoP3hJYXwZjQrllmn4IwvG0SZ4z6OKQ';

const TriviaGuessr: React.FC = () => {
  // Game state
  const [gameMode, setGameMode] = useState<GameMode>('menu');
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [answers, setAnswers] = useState<GameAnswer[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [gameComplete, setGameComplete] = useState<boolean>(false);
  
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

  // Timer effect
  useEffect(() => {
    if ((gameMode === 'daily' || gameMode === 'multiplayer') && !showResult && !gameComplete && timeLeft > 0) {
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
  }, [gameMode, showResult, gameComplete, timeLeft]);

  const startDailyMode = (): void => {
    setGameMode('daily');
    setCurrentQuestion(0);
    setScore(0);
    setAnswers([]);
    setGameComplete(false);
    setTimeLeft(60);
    setSelectedLocation(null);
    setShowResult(false);
  };

  const createRoom = (): void => {
    if (playerName.trim()) {
      const code = generateRoomCode();
      setRoomCode(code);
      setIsHost(true);
      setRoomPlayers([{ name: playerName, score: 0, isHost: true }]);
      setGameMode('lobby');
    }
  };

  const joinRoom = (): void => {
    if (playerName.trim() && roomCode.trim()) {
      setRoomPlayers([
        { name: "Host Player", score: 0, isHost: true },
        { name: playerName, score: 0, isHost: false }
      ]);
      setGameMode('lobby');
    }
  };

  const startMultiplayerGame = (): void => {
    setGameMode('multiplayer');
    setCurrentQuestion(0);
    setScore(0);
    setAnswers([]);
    setGameComplete(false);
    setTimeLeft(60);
    setSelectedLocation(null);
    setShowResult(false);
  };

  const handleLocationSelect = (location: Location): void => {
    setSelectedLocation(location);
  };

  const handleAnswer = (): void => {
    const question = mockQuestions[currentQuestion];
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
      if (currentQuestion < mockQuestions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setTimeLeft(60);
      } else {
        setGameComplete(true);
      }
    }, 6000);
  };

  const resetGame = (): void => {
    setGameMode('menu');
    setCurrentQuestion(0);
    setScore(0);
    setAnswers([]);
    setSelectedLocation(null);
    setShowResult(false);
    setGameComplete(false);
    setTimeLeft(60);
    setRoomCode('');
    setPlayerName('');
    setIsHost(false);
    setRoomPlayers([]);
    setIsMapFullscreen(false);
  };

  const toggleFullscreen = (): void => {
    setIsMapFullscreen(prev => !prev);
  };

  // Render loading screen if Google Maps is not loaded
  if (!googleMapsLoaded && !apiKeyMissing) {
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
            onClick={resetGame}
            className="bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Back to Menu
          </button>
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
        onPlayAgain={resetGame}
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

  // Render based on current game mode
  switch (gameMode) {
    case 'menu':
      return (
        <GameMenu
          onStartDaily={startDailyMode}
          onCreateRoom={createRoom}
          onJoinRoom={joinRoom}
          playerName={playerName}
          setPlayerName={setPlayerName}
          roomCode={roomCode}
          setRoomCode={setRoomCode}
          dailyLeaderboard={dailyLeaderboard}
        />
      );

    case 'lobby':
      return (
        <GameLobby
          roomCode={roomCode}
          roomPlayers={roomPlayers}
          isHost={isHost}
          onStartGame={startMultiplayerGame}
          onLeaveRoom={resetGame}
        />
      );

    case 'daily':
    case 'multiplayer':
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
          <GameQuestion
            question={mockQuestions[currentQuestion]}
            currentQuestion={currentQuestion}
            totalQuestions={mockQuestions.length}
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

    default:
      return (
        <GameMenu
          onStartDaily={startDailyMode}
          onCreateRoom={createRoom}
          onJoinRoom={joinRoom}
          playerName={playerName}
          setPlayerName={setPlayerName}
          roomCode={roomCode}
          setRoomCode={setRoomCode}
          dailyLeaderboard={dailyLeaderboard}
        />
      );
  }
};

export default TriviaGuessr;