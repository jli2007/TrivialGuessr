// data/mockData.ts
import { Question } from '../types/question';
import { Player } from '../types';

export const mockQuestions: Question[] = [
  {
    id: "1",
    question: "In which city would you find the famous Eiffel Tower?",
    context: "This iron lattice tower was built as the entrance arch to the 1889 World's Fair and has become a global cultural icon.",
    answer_city: "Paris",
    answer_country: "France",
    answer_lat: 48.8566,
    answer_lng: 2.3522,
    difficulty: 3,
    category: "Landmarks",
    time_period: "1889",
    fun_fact: "The Eiffel Tower was initially criticized by many of Paris's leading artists and intellectuals for its design!",
    created_at: "2024-01-15T10:30:00Z"
  },
  {
    id: "2",
    question: "Where would you find the iconic Sydney Opera House?",
    context: "This multi-venue performing arts center is famous for its unique shell-like design and harbourside location.",
    answer_city: "Sydney",
    answer_country: "Australia",
    answer_lat: -33.8568,
    answer_lng: 151.2153,
    difficulty: 4,
    category: "Architecture",
    time_period: "1973",
    fun_fact: "The Opera House took 14 years to build and cost 15 times the original budget!"
  },
  {
    id: "3",
    question: "In which ancient city can you visit the Colosseum?",
    context: "This ancient amphitheater was the largest ever built and could hold up to 80,000 spectators for gladiatorial contests.",
    answer_city: "Rome",
    answer_country: "Italy",
    answer_lat: 41.8902,
    answer_lng: 12.4922,
    difficulty: 2,
    category: "Ancient History",
    time_period: "72-80 AD",
    fun_fact: "The Colosseum had a complex underground area called the 'hypogeum' where gladiators and animals were kept!"
  },
  {
    id: "4",
    question: "Where is the Christ the Redeemer statue located?",
    context: "This 30-meter tall statue stands atop Corcovado mountain, overlooking a famous Brazilian city.",
    answer_city: "Rio de Janeiro",
    answer_country: "Brazil",
    answer_lat: -22.9519,
    answer_lng: -43.2105,
    difficulty: 5,
    category: "Religious Monuments",
    time_period: "1931",
    fun_fact: "The statue was struck by lightning multiple times, but it has lightning rods to protect it!"
  },
  {
    id: "5",
    question: "In which Japanese city would you find the famous Fushimi Inari Shrine?",
    context: "This Shinto shrine is famous for its thousands of vermillion torii gates that wind up the mountainside.",
    answer_city: "Kyoto",
    answer_country: "Japan",
    answer_lat: 35.0116,
    answer_lng: 135.7681,
    difficulty: 7,
    category: "Religious Sites",
    time_period: "711 AD",
    fun_fact: "There are over 10,000 torii gates at this shrine, each donated by individuals and businesses!"
  },
  {
    id: "6",
    question: "Which city is home to the ancient Petra archaeological site?",
    context: "This ancient city was carved directly into rose-red sandstone cliffs and was once a major trading hub.",
    answer_city: "Wadi Musa",
    answer_country: "Jordan",
    answer_lat: 30.3285,
    answer_lng: 35.4444,
    difficulty: 8,
    category: "Archaeological Sites",
    time_period: "4th century BC",
    fun_fact: "Petra was completely lost to the Western world for over 1000 years until it was rediscovered in 1812!"
  },
  {
    id: "7",
    question: "Where can you visit Machu Picchu, the ancient Incan citadel?",
    context: "This 15th-century Inca citadel sits high in the Andes Mountains and was never discovered by Spanish conquistadors.",
    answer_city: "Cusco",
    answer_country: "Peru",
    answer_lat: -13.1631,
    answer_lng: -72.5450,
    difficulty: 6,
    category: "Ancient Civilizations",
    time_period: "1450 AD",
    fun_fact: "Machu Picchu was built without using wheels, iron tools, or mortar, yet the stones fit together perfectly!"
  },
  {
    id: "8",
    question: "In which city stands the iconic Statue of Liberty?",
    context: "This copper statue was a gift from France to celebrate America's centennial and freedom.",
    answer_city: "New York",
    answer_country: "United States",
    answer_lat: 40.6892,
    answer_lng: -74.0445,
    difficulty: 2,
    category: "National Monuments",
    time_period: "1886",
    fun_fact: "The statue was originally brown! It turned green due to oxidation of the copper over time."
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