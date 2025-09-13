import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ioClient from "socket.io-client";
import type { Socket } from "socket.io-client";

interface Player {
  id: string;
  name: string;
  score: number;
}

interface Room {
  players: Player[];
  status: "waiting" | "playing" | "finished";
}

let socket: any;

export default function Room() {
  const router = useRouter();
  const { roomId } = router.query;

  const [players, setPlayers] = useState<Player[]>([]);
  const [userName] = useState(() => "Player" + Math.floor(Math.random() * 1000));

  useEffect(() => {
    if (!roomId || typeof roomId !== "string") return;

    socket = ioClient("http://localhost:3001");

    socket.emit("joinRoom", { roomId, userName });

    socket.on("roomData", (room: Room) => {
      setPlayers(room.players);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId, userName]);

  return (
    <div>
      <h1>Room: {roomId}</h1>
      <h2>Players:</h2>
      <ul>
        {players.map((p) => (
          <li key={p.id}>
            {p.name} (Score: {p.score})
          </li>
        ))}
      </ul>
    </div>
  );
}
