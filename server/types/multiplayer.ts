export interface Player {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
}

export interface Room {
  players: Player[];
  status: "waiting" | "playing" | "finished";
}