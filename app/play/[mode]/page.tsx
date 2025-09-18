"use client";

import React, { useState, useEffect, useRef } from "react";
import { Users, Play, UserPlus } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { GameAnswer, Player } from "@typesFolder/index";
import { Question } from "@typesFolder/question";
import { loadGoogleMapsScript } from "@utils/gameUtils";
import GameQuestion from "@components/game/GameQuestion";
import GameResult from "@components/game/GameResult";
import LoadingScreen from "@components/LoadingScreen";
import io, { Socket } from "socket.io-client";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

const GamePage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const mode = params?.mode as string;
  const socketRef = useRef<typeof Socket | null>(null);

  const [hasPlayedDailyGame, setHasPlayedDailyGame] = useState<boolean>(false);
  const [dailyGameData, setDailyGameData] = useState<{score: number, answers: GameAnswer[]} | null>(null);

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
  const [roomData, setRoomData] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Dailys
  const [showNamePopup, setShowNamePopup] = useState<boolean>(false);
  const [leaderboardName, setLeaderboardName] = useState<string>("");
  const [submittingScore, setSubmittingScore] = useState<boolean>(false);

  // Daily challenge localStorage functions
  const getDailyGameKey = () => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    return `daily_game_${today}`;
  };

  const checkDailyGameStatus = () => {
    if (typeof window !== 'undefined') {
      const dailyKey = getDailyGameKey();
      const savedData = localStorage.getItem(dailyKey);
      
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setHasPlayedDailyGame(true);
          setDailyGameData(parsed);
          setScore(parsed.score);
          setAnswers(parsed.answers);
          setGameComplete(true);
          return true;
        } catch (error) {
          console.error("Error parsing daily game data:", error);
          localStorage.removeItem(dailyKey);
        }
      }
    }
    return false;
  };

  const saveDailyGameResult = (finalScore: number, gameAnswers: GameAnswer[]) => {
    if (typeof window !== 'undefined') {
      const dailyKey = getDailyGameKey();
      const gameData = {
        score: finalScore,
        answers: gameAnswers,
        completedAt: new Date().toISOString(),
        hasPlayed: true
      };
      
      localStorage.setItem(dailyKey, JSON.stringify(gameData));
      setHasPlayedDailyGame(true);
      setDailyGameData(gameData);
    }
  };

  // Initialize socket connection
  useEffect(() => {
    if (mode !== "multiplayer") return;

    // Create socket connection if it doesn't exist
    if (!socketRef.current) {
      socketRef.current = io("http://localhost:3001", {
        transports: ["websocket"],
        autoConnect: true,
      });

      // Connection status listeners
      socketRef.current.on("connect", () => {
        console.log("✅ Connected to server");
        setIsConnected(true);
      });

      socketRef.current.on("disconnect", () => {
        console.log("❌ Disconnected from server");
        setIsConnected(false);
      });
    }

    return () => {
      // Don't disconnect here, we'll do it in cleanup
    };
  }, [mode]);

  // Setup socket listeners
  useEffect(() => {
    if (mode !== "multiplayer" || !socketRef.current) return;

    const socket = socketRef.current;

    // Handle room created response from server
    const handleRoomCreated = ({ roomId }: { roomId: string }) => {
      setRoomCode(roomId);
      console.log("✅ Room created:", roomId);
    };

    // Handle room data updates
    const handleRoomData = (data: any) => {
      setRoomData(data);
      setRoomPlayers(data.players || []);
      console.log("📡 Room data updated:", data);

      // Check if this is the first time receiving room data after creating/joining
      const currentPlayer = data.players?.find(
        (p: any) => p.name === playerName
      );
      setIsHost(currentPlayer?.isHost || false);
    };

    // Handle player joined notifications
    const handlePlayerJoined = ({
      playerName: joinedPlayerName,
    }: {
      playerName: string;
      playerId: string;
    }) => {
      console.log(`🎮 Player joined: ${joinedPlayerName}`);
    };

    // Handle player left notifications
    const handlePlayerLeft = ({
      playerName: leftPlayerName,
    }: {
      playerName: string;
      playerId: string;
    }) => {
      console.log(`👋 Player left: ${leftPlayerName}`);
    };

    // Handle game started
    const handleGameStarted = ({ roomId }: { roomId: string }) => {
      console.log(`🎯 Game started in room: ${roomId}`);
    };

    // Handle errors
    const handleError = (message: string) => {
      console.error("Socket error:", message);
      alert(message);
    };

    // Add event listeners
    socket.on("roomCreated", handleRoomCreated);
    socket.on("roomData", handleRoomData);
    socket.on("playerJoined", handlePlayerJoined);
    socket.on("playerLeft", handlePlayerLeft);
    socket.on("gameStarted", handleGameStarted);
    socket.on("error", handleError);

    // Cleanup listeners
    return () => {
      socket.off("roomCreated", handleRoomCreated);
      socket.off("roomData", handleRoomData);
      socket.off("playerJoined", handlePlayerJoined);
      socket.off("playerLeft", handlePlayerLeft);
      socket.off("gameStarted", handleGameStarted);
      socket.off("error", handleError);
    };
  }, [mode, playerName]);

  // Socket actions
  const handleCreateRoom = () => {
    if (!playerName.trim() || !socketRef.current) return;

    console.log(`Creating room with player name: ${playerName}`);
    socketRef.current.emit("createRoom", { userName: playerName });
  };

  const handleJoinRoom = () => {
    if (!playerName.trim() || !roomCode.trim() || !socketRef.current) return;

    console.log(`Joining room ${roomCode} with player name: ${playerName}`);
    socketRef.current.emit("joinRoom", {
      roomId: roomCode,
      userName: playerName,
    });
  };

  // Redirect invalid modes
  useEffect(() => {
    if (!["daily", "casual", "multiplayer"].includes(mode)) {
      router.push("/");
      return;
    }
  }, [mode, router]);

  // Check daily game status on mount
  useEffect(() => {
    if (mode === "daily") {
      const hasPlayed = checkDailyGameStatus();
      if (hasPlayed) {
        console.log("Daily challenge already completed today");
        return; // Skip game initialization, go straight to results
      }
    }
  }, [mode]);

  // Load Google Maps API
  useEffect(() => {
    if (mapsLoadAttempted) return;

    const loadMapsAPI = async () => {
      setMapsLoadAttempted(true);

      if (typeof window !== "undefined" && window.google?.maps) {
        console.log("Google Maps already loaded");
        setGoogleMapsLoaded(true);
        return;
      }

      const existingScript = document.querySelector(
        'script[src*="maps.googleapis.com"]'
      );
      if (existingScript) {
        console.log("Google Maps script already exists, waiting for load...");

        existingScript.addEventListener("load", () => {
          setGoogleMapsLoaded(true);
        });

        existingScript.addEventListener("error", () => {
          setApiKeyMissing(true);
        });

        return;
      }

      try {
        await loadGoogleMapsScript(GOOGLE_MAPS_API_KEY);
        setGoogleMapsLoaded(true);
      } catch (error) {
        console.error("Failed to load Google Maps:", error);
        setApiKeyMissing(true);
      }
    };

    loadMapsAPI();
  }, []);

  // Server integration function
  const fetchQuestions = async (
    gameMode: string,
    offset: number = 0
  ): Promise<Question[]> => {
    setQuestionsLoading(true);
    setQuestionsError(null);

    try {
      let endpoint = "";

      switch (gameMode) {
        case "daily":
          endpoint = "/api/daily_challenge?action=all";
          break;
        case "casual":
          endpoint = `/api/questions?action=random&limit=10&offset=${offset}`;
          break;
        case "multiplayer":
          endpoint = "/api/questions?action=random&limit=10";
          break;
        default:
          throw new Error("Invalid game mode");
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
      } else if (
        (parsed as any)?.questions &&
        Array.isArray((parsed as any).questions)
      ) {
        questions = (parsed as any).questions as Question[];
      }

      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error("No questions received from server");
      }

      return questions;
    } catch (error) {
      console.error("Error fetching questions:", error);
      setQuestionsError(
        error instanceof Error ? error.message : "Failed to load questions"
      );
      return [];
    } finally {
      setQuestionsLoading(false);
    }
  };

  // Initialize game based on mode
  useEffect(() => {
    if (!googleMapsLoaded) return;

    // Skip initialization if daily game was already played
    if (mode === "daily" && hasPlayedDailyGame) {
      return;
    }

    if (mode === "daily" || mode === "casual") {
      initializeGame();
    }
    // For multiplayer, we wait for room setup
  }, [googleMapsLoaded, mode, hasPlayedDailyGame]);

  // Initialize game with question fetching
  const initializeGame = async (): Promise<void> => {
    try {
      const fetchedQuestions = await fetchQuestions(mode);
      console.log("Loaded questions:", fetchedQuestions);
      setQuestions(fetchedQuestions);
      startGame();
    } catch (error) {
      console.error("Failed to initialize game:", error);
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
      const fetchedQuestions = await fetchQuestions("multiplayer");
      setQuestions(fetchedQuestions);
      startGame();
    } catch (error) {
      console.error("Failed to start multiplayer game:", error);
      startGame();
    }
  };

  // Handle answer submission from GameQuestion
  const handleAnswerSubmitted = (answer: GameAnswer): void => {
    setAnswers((prev) => [...prev, answer]);
    setScore((prev) => prev + answer.score);
  };

  const handleDailyGameCompletion = async (
    finalScore: number,
    name: string
  ) => {
    setSubmittingScore(true);

    try {
      const response = await fetch("/api/game", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          player_name: name || "Anonymous Player",
          total_score: finalScore,
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log("✅ Daily score submitted successfully:", result.data);
      } else {
        console.error("❌ Failed to submit daily score:", result.error);
        // You might want to show an error message here
      }
    } catch (error) {
      console.error("❌ Error submitting daily score:", error);
    } finally {
      setSubmittingScore(false);
      setShowNamePopup(false);
    }
  };

  const NamePopup = () => (
    <div className="fixed inset-0 min-h-screen bg-[url('/bg.jpg')] bg-cover bg-center overflow-x-hidden overflow-y-auto md:overflow-hidden backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-primary-800/95 to-secondary-800/95 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full border border-white/20 shadow-2xl">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🏆</div>
          <h2 className="text-2xl font-bold text-white mb-2">Game Complete</h2>
            <p className="text-white/80">
              Enter your name for the daily leaderboard
            </p>
            <p className="text-secondary-300 font-semibold mt-2">
              Score: {score}
            </p>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Enter your name"
            value={leaderboardName}
            onChange={(e) => setLeaderboardName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleNameSubmit()}
            className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/50 border border-white/20 focus:border-secondary-400/60 focus:outline-none focus:ring-2 focus:ring-secondary-400/20 transition-all duration-200"
            disabled={submittingScore}
            autoFocus
          />

          <div className="flex gap-3">
            <button
              onClick={handleNameSubmit}
              disabled={!leaderboardName.trim() || submittingScore}
              className="flex-1 py-3 bg-secondary-500 hover:bg-secondary-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 font-semibold flex items-center justify-center gap-2"
            >
              {submittingScore ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : (
                "Submit Score"
              )}
            </button>

            <button
              onClick={handleSkipName}
              disabled={submittingScore}
              className="px-4 py-3 bg-white/10 hover:bg-white/20 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 font-medium"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const handleNextRound = async (): Promise<void> => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      // Game is completing
      setGameComplete(true);

      // Save daily game result to localStorage if it's a daily game
      if (mode === "daily") {
        saveDailyGameResult(score, answers);
        setShowNamePopup(true);
      }
    }
  };

  // Handle name submission
  const handleNameSubmit = async () => {
    if (!leaderboardName.trim()) return;
    await handleDailyGameCompletion(score, leaderboardName);
  };

  // Handle skipping name entry - FIXED: Don't submit anything to leaderboard
  const handleSkipName = async () => {
    setShowNamePopup(false);
  };

  const handleGameEnd = (): void => {
    // Clean up socket connection
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    router.push("/");
  };

  // Get player name from URL params if coming from home page
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const nameFromUrl = urlParams.get("playerName");
    const codeFromUrl = urlParams.get("roomCode");

    if (nameFromUrl) setPlayerName(nameFromUrl);
    if (codeFromUrl) setRoomCode(codeFromUrl);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
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
          <h2 className="text-3xl font-bold text-white mb-6">
            Google Maps Integration
          </h2>
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 mb-6">
            <h3 className="text-red-300 font-semibold mb-3">API Key Error</h3>
            <p className="text-white/90 mb-4">
              There was an issue loading Google Maps. Please check your API key
              and ensure:
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
  if (questionsError && questions.length === 0 && mode !== "multiplayer") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-secondary-900 to-primary-800 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white/10 backdrop-blur-md rounded-xl p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-3xl font-bold text-white mb-6">
            Questions Loading Error
          </h2>
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 mb-6">
            <h3 className="text-red-300 font-semibold mb-3">
              Failed to Load Questions
            </h3>
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

  // Render game complete screen for daily challenge already played
  if (mode === "daily" && hasPlayedDailyGame && dailyGameData && googleMapsLoaded) {
    return (
      <GameResult 
        score={dailyGameData.score} 
        answers={dailyGameData.answers} 
        onPlayAgain={handleGameEnd}
        isDailyReplay={true}
      />
    );
  }

  // Render game complete screen
  if (showNamePopup && mode === "daily") {
    return <NamePopup />;
  }

  // Render game complete screen
  if (gameComplete && (!showNamePopup || mode !== "daily")) {
    return (
      <GameResult score={score} answers={answers} onPlayAgain={handleGameEnd} />
    );
  }

  // MAIN GAME RENDERING
  if (
    gameStarted &&
    questions.length > 0 &&
    currentQuestion < questions.length
  ) {
    return (
      <GameQuestion
        question={questions[currentQuestion]}
        currentQuestion={currentQuestion}
        totalQuestions={mode === "casual" ? 10 : questions.length}
        score={score}
        onAnswerSubmitted={handleAnswerSubmitted}
        onNextRound={handleNextRound}
      />
    );
  }

  // Multiplayer setup screen
  if (mode === "multiplayer") {
    return (
      <div className="space-y-4">
        <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-white/10 hover:border-secondary-400/30 transition-all duration-300">
          <h3 className="text-white text-lg font-bold flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-secondary-500/20 rounded-lg">
              <Users className="w-5 h-5 text-secondary-300" />
            </div>
            Multiplayer Mode
            {!isConnected && (
              <span className="text-yellow-400 text-sm">(Connecting...)</span>
            )}
            {isConnected && (
              <span className="text-green-400 text-sm">(Connected)</span>
            )}
          </h3>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-xl bg-white/10 text-white placeholder-white/50 border border-white/20 focus:border-secondary-400/60 focus:outline-none focus:ring-2 focus:ring-secondary-400/20 transition-all duration-200 backdrop-blur-sm"
            />

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Room Code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="flex-1 px-3 py-2.5 text-sm rounded-xl bg-white/10 text-white placeholder-white/50 border border-white/20 focus:border-primary-400/60 focus:outline-none focus:ring-2 focus:ring-primary-400/20 transition-all duration-200 backdrop-blur-sm"
              />
              <button
                onClick={handleJoinRoom}
                disabled={
                  !playerName.trim() || !roomCode.trim() || !isConnected
                }
                className="px-4 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 font-semibold shadow-primary hover:shadow-lg hover:scale-105 flex items-center gap-1 text-sm"
              >
                <Play className="w-3 h-3" />
                Join
              </button>
            </div>

            <button
              onClick={handleCreateRoom}
              disabled={!playerName.trim() || !isConnected}
              className="w-full py-3 bg-secondary-500 hover:bg-secondary-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 font-semibold shadow-secondary hover:shadow-lg hover:scale-105 flex items-center justify-center gap-2 text-sm"
            >
              <UserPlus className="w-4 h-4" />
              Create Room
            </button>

            {roomData && isHost && (
              <button
                onClick={startMultiplayerGame}
                className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:scale-105 flex items-center justify-center gap-2 text-sm"
              >
                <Play className="w-4 h-4" />
                Start Game
              </button>
            )}
          </div>
        </div>

        {roomData && (
          <div className="bg-black/10 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
            <h4 className="text-white font-bold mb-2 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Room {roomCode} ({roomPlayers.length} player
              {roomPlayers.length !== 1 ? "s" : ""})
            </h4>
            <div className="space-y-2">
              {roomPlayers.map((player: any) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between bg-white/5 rounded-lg p-2"
                >
                  <span className="text-white/90 flex items-center gap-2">
                    {player.name}
                    {player.isHost && (
                      <span className="text-yellow-400">👑</span>
                    )}
                    {player.name === playerName && (
                      <span className="text-blue-400">(You)</span>
                    )}
                  </span>
                  <span className="text-white/70 text-sm">
                    Score: {player.score}
                  </span>
                </div>
              ))}
            </div>

            {roomPlayers.length > 1 && !isHost && (
              <div className="mt-3 text-center text-white/60 text-sm">
                Waiting for host to start the game...
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Fallback loading
  return <LoadingScreen />;
};

export default GamePage;