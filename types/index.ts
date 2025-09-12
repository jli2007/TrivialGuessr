export interface Location {
  lat: number;
  lng: number;
}

export interface GameAnswer {
  question: string;
  userGuess: Location | null;
  correctLocation: Location;
  correctAnswer: string;
  distance: number | null;
  score: number;
}
export interface Player {
  name: string;
  score: number;
  isHost?: boolean;
  rank?: number;
}
export interface GoogleMapProps {
  onLocationSelect: (location: Location) => void;
  selectedLocation: Location | null;
  correctLocation: Location | null;
  showAnswer: boolean;
  isFullscreen?: boolean;
}

// Extend the global Window interface for Google Maps
declare global {
  interface Window {
    google: typeof google;
  }
}

export interface GameState {
  gameMode: 'menu' | 'lobby' | 'daily' | 'multiplayer';
  currentQuestion: number;
  score: number;
  answers: GameAnswer[];
  selectedLocation: Location | null;
  showResult: boolean;
  timeLeft: number;
  gameComplete: boolean;
  roomCode: string;
  playerName: string;
  isHost: boolean;
  roomPlayers: Player[];
  isMapFullscreen: boolean;
  googleMapsLoaded: boolean;
  apiKeyMissing: boolean;
}