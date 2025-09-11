// data/mockData.ts
import { Question, Player } from '../types';

export const mockQuestions: Question[] = [
  {
    id: 1,
    type: "image",
    prompt: "Where was this photo taken?",
    asset_url: "https://images.unsplash.com/photo-1549144511-f099e773c147?w=600&h=400&fit=crop",
    answer_type: "location",
    correct_answer: "Paris, France",
    correct_coordinates: { lat: 48.8566, lng: 2.3522 }
  },
  {
    id: 2,
    type: "image",
    prompt: "What city is this landmark in?",
    asset_url: "https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?w=600&h=400&fit=crop",
    answer_type: "location",
    correct_answer: "Sydney, Australia",
    correct_coordinates: { lat: -33.8568, lng: 151.2153 }
  },
  {
    id: 3,
    type: "image",
    prompt: "Where is this ancient structure located?",
    asset_url: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&h=400&fit=crop",
    answer_type: "location",
    correct_answer: "Rome, Italy",
    correct_coordinates: { lat: 41.8902, lng: 12.4922 }
  },
  {
    id: 4,
    type: "text",
    prompt: "In which city would you find the Christ the Redeemer statue?",
    asset_url: null,
    answer_type: "location",
    correct_answer: "Rio de Janeiro, Brazil",
    correct_coordinates: { lat: -22.9519, lng: -43.2105 }
  },
  {
    id: 5,
    type: "image",
    prompt: "What country is this traditional architecture from?",
    asset_url: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=600&h=400&fit=crop",
    answer_type: "location",
    correct_answer: "Kyoto, Japan",
    correct_coordinates: { lat: 35.0116, lng: 135.7681 }
  }
];

export const dailyLeaderboard: Player[] = [
  { name: "GeoMaster", score: 23750, rank: 1 },
  { name: "WorldExplorer", score: 21890, rank: 2 },
  { name: "MapQueen", score: 19654, rank: 3 },
  { name: "GlobeWalker", score: 18201, rank: 4 },
  { name: "PinDropper", score: 16987, rank: 5 },
  { name: "AHAHH", score: 12, rank: 6 }
];