import { Server, Socket } from "socket.io";
import { createServer } from "http";

const httpServer = createServer();

interface Player {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
}

interface Room {
  players: Player[];
  status: "waiting" | "playing" | "finished";
}

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const rooms = new Map<string, Room>();

io.on("connection", (socket: Socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("createRoom", ({ userName }: { userName: string }) => {
    try {
      const roomId = generateUniqueRoomId(rooms);
      const room: Room = {
        players: [{ id: socket.id, name: userName, score: 0, isHost: true }],
        status: "waiting",
      };
      
      rooms.set(roomId, room);
      socket.join(roomId);
      
      console.log(`Room created: ${roomId} by ${userName}`);
      
      socket.emit("roomCreated", { roomId });
      
      io.to(roomId).emit("roomData", room);
    } catch (error) {
      console.error("Error creating room:", error);
      socket.emit("error", "Failed to create room");
    }
  });

  socket.on(
    "joinRoom",
    ({ roomId, userName }: { roomId: string; userName: string }) => {
      try {
        const room = rooms.get(roomId);
        if (!room) {
          socket.emit("error", "Room not found");
          return;
        }

        if (room.players.length >= 8) {
          socket.emit("error", "Room is full");
          return;
        }

        const nameExists = room.players.some(player => player.name === userName);
        if (nameExists) {
          socket.emit("error", "Name already taken in this room");
          return;
        }

        room.players.push({ // add player to room
          id: socket.id, 
          name: userName, 
          score: 0, 
          isHost: false 
        });
    
        socket.join(roomId); // join the socket to the room
        
        console.log(`${userName} joined room: ${roomId}`);
        
        io.to(roomId).emit("roomData", room);
        
        socket.to(roomId).emit("playerJoined", {
          playerName: userName,
          playerId: socket.id
        });
        
      } catch (error) {
        console.error("Error joining room:", error);
        socket.emit("error", "Failed to join room");
      }
    }
  );

  socket.on("startGame", ({ roomId }: { roomId: string }) => {
    try {
      const room = rooms.get(roomId);
      if (!room) {
        socket.emit("error", "Room not found");
        return;
      }

      const player = room.players.find(p => p.id === socket.id);
      if (!player || !player.isHost) {
        socket.emit("error", "Only the host can start the game");
        return;
      }

      room.status = "playing";
      console.log(`Game started in room: ${roomId}`);
      
      io.to(roomId).emit("gameStarted", { roomId });
    } catch (error) {
      console.error("Error starting game:", error);
      socket.emit("error", "Failed to start game");
    }
  });

  socket.on("playerAnswer", ({ roomId, answer, score }: { 
    roomId: string; 
    answer: any; 
    score: number; 
  }) => {
    try {
      const room = rooms.get(roomId);
      if (!room) {
        socket.emit("error", "Room not found");
        return;
      }

      const player = room.players.find(p => p.id === socket.id);
      if (!player) {
        socket.emit("error", "Player not found in room");
        return;
      }

      player.score += score;
      
      io.to(roomId).emit("roomData", room); // emit updated room data to all players
      
      socket.to(roomId).emit("playerAnswered", { // emit player answer to other players (not including the answering player)
        playerName: player.name,
        answer,
        score
      });
    } catch (error) {
      console.error("Error handling player answer:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  
    rooms.forEach((room, roomId) => {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        const removedPlayer = room.players[playerIndex];
        room.players.splice(playerIndex, 1);
        
        console.log(`${removedPlayer.name} left room: ${roomId}`);
        
        if (room.players.length === 0) {
          rooms.delete(roomId);
          console.log(`Room deleted: ${roomId}`);
        } else {
          if (removedPlayer.isHost && room.players.length > 0) {  // assign new host if needed
            room.players[0].isHost = true;
            console.log(`New host in room ${roomId}: ${room.players[0].name}`);
          }
          
          io.to(roomId).emit("roomData", room); // emit updated room data to remaining players
          
          io.to(roomId).emit("playerLeft", { // emit specific "playerLeft" event
            playerName: removedPlayer.name,
            playerId: removedPlayer.id
          });
        }
      }
    });
  });
});

httpServer.listen(3001, () => {
  console.log("Socket.IO server listening on port 3001");
});

function generateUniqueRoomId(existingRooms: Map<string, Room>, length = 6): string {
  let id = generateRandomRoomId(length);
  while (existingRooms.has(id)) {
    id = generateRandomRoomId(length);
  }
  return id;
}

function generateRandomRoomId(length = 6): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}