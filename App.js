import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("https://your-backend-url.onrender.com"); // TODO: Replace with your backend

const App = () => {
  const [roomId, setRoomId] = useState("default-room");
  const [playerId, setPlayerId] = useState("");
  const [players, setPlayers] = useState([]);
  const [turn, setTurn] = useState("");

  useEffect(() => {
    socket.on("connect", () => {
      setPlayerId(socket.id);
      socket.emit("join_room", roomId);
    });

    socket.on("players_update", (updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    socket.on("turn_update", (currentTurn) => {
      setTurn(currentTurn);
    });

    return () => {
      socket.off("connect");
      socket.off("players_update");
      socket.off("turn_update");
    };
  }, [roomId]);

  const makeMove = () => {
    if (turn === playerId) {
      socket.emit("make_move", { roomId, x: Math.floor(Math.random() * 6), y: Math.floor(Math.random() * 6) });
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Chain Reaction Multiplayer</h1>
      <p><b>Room ID:</b> {roomId}</p>
      <p><b>Your ID:</b> {playerId}</p>
      <p><b>Players:</b> {players.join(", ")}</p>
      <p><b>Current Turn:</b> {turn === playerId ? "Your Turn" : "Wait..."}</p>
      <button onClick={makeMove}>Make Random Move</button>
    </div>
  );
};

export default App;