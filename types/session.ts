import { GameAnswer } from "."
import { Question } from "./question";

export interface GameSession {
  id: string;
  userId: string;
  gameMode: string;
  currentQuestion: number;
  score: number;
  answers: GameAnswer[];
  isComplete: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface DailyChallenge {
  id: string;
  date: string;
  questions: Question[];
  isActive: boolean;
}