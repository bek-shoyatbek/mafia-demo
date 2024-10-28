import { useContext, useCallback } from "react";
import { useSocket } from "./useSocket";
import { GameContext } from "../contexts/GameContext";
import { GAME_PHASES } from "../constants";
import { useAuth } from "./useAuth";

export function useGame() {
  const socket = useSocket();
  const { user } = useAuth();
  const { state, ...gameActions } = useContext(GameContext);

  // Room Management
  const createRoom = useCallback(
    async (settings) => {
      socket.emit("room:create", { settings });
    },
    [socket]
  );

  const joinRoom = useCallback(
    async (roomCode) => {
      socket.emit("room:join", { roomCode, userId: user.id });
    },
    [socket, user]
  );

  const leaveRoom = useCallback(() => {
    socket.emit("room:leave", { userId: user.id, roomId: state.room.id });
    gameActions.leaveRoom(user.id);
  }, [socket, user, state.room.id, gameActions]);

  const setReady = useCallback(
    (isReady) => {
      socket.emit("player:ready", {
        userId: user.id,
        roomId: state.room.id,
        isReady,
      });
      gameActions.updatePlayer(user.id, { isReady });
    },
    [socket, user, state.room.id, gameActions]
  );

  // Game Actions
  const startGame = useCallback(() => {
    if (state.room.host === user.id) {
      socket.emit("game:start", { roomId: state.room.id });
    }
  }, [socket, user, state.room.id]);

  const castVote = useCallback(
    (targetId) => {
      if (state.phase !== GAME_PHASES.DAY_VOTING) return;

      socket.emit("game:vote", {
        voterId: user.id,
        targetId,
        roomId: state.room.id,
      });
      gameActions.castVote(user.id, targetId);
    },
    [socket, user, state.room.id, state.phase, gameActions]
  );

  const performAction = useCallback(
    (action, targetId) => {
      if (state.phase !== GAME_PHASES.NIGHT_ACTION) return;

      const playerRole = state.players[user.id]?.role;
      if (!playerRole) return;

      socket.emit("game:action", {
        playerId: user.id,
        role: playerRole,
        action,
        targetId,
        roomId: state.room.id,
      });
      gameActions.performAction(user.id, action, targetId);
    },
    [socket, user, state.room.id, state.phase, state.players, gameActions]
  );

  const sendMessage = useCallback(
    (content) => {
      const message = {
        id: Date.now(),
        sender: user.username,
        content,
        timestamp: new Date().toISOString(),
        isGameEvent: false,
      };

      socket.emit("chat:message", {
        message,
        roomId: state.room.id,
      });
      gameActions.addMessage(message);
    },
    [socket, user, state.room.id, gameActions]
  );

  // Game State Helpers
  const isAlive = useCallback(() => {
    return state.players[user.id]?.state === "ALIVE";
  }, [state.players, user]);

  const canVote = useCallback(() => {
    return isAlive() && state.phase === GAME_PHASES.DAY_VOTING;
  }, [isAlive, state.phase]);

  const canPerformAction = useCallback(() => {
    const player = state.players[user.id];
    return (
      isAlive() &&
      state.phase === GAME_PHASES.NIGHT_ACTION &&
      ["MAFIA", "DETECTIVE", "DOCTOR"].includes(player?.role)
    );
  }, [isAlive, state.phase, state.players, user]);

  const getRemainingPlayers = useCallback(() => {
    const players = Object.values(state.players);
    return {
      total: players.filter((p) => p.state === "ALIVE").length,
      mafia: players.filter((p) => p.state === "ALIVE" && p.role === "MAFIA")
        .length,
      villagers: players.filter(
        (p) => p.state === "ALIVE" && p.role !== "MAFIA"
      ).length,
    };
  }, [state.players]);

  // Socket Event Handlers
  useCallback(() => {
    if (!socket) return;

    socket.on("room:joined", (data) => {
      gameActions.joinRoom(data);
    });

    socket.on("room:updated", (data) => {
      gameActions.updatePlayer(data.playerId, data.updates);
    });

    socket.on("game:started", (data) => {
      gameActions.startGame(data.playerRoles);
    });

    socket.on("game:phaseChanged", (data) => {
      gameActions.changePhase(data.phase, data.timeLimit);
    });

    socket.on("game:votecast", (data) => {
      gameActions.castVote(data.voterId, data.targetId);
    });

    socket.on("game:action", (data) => {
      gameActions.performAction(data.playerId, data.action, data.targetId);
    });

    socket.on("game:ended", (data) => {
      gameActions.endGame(data.winner);
    });

    socket.on("chat:message", (data) => {
      gameActions.addMessage(data.message);
    });

    return () => {
      socket.off("room:joined");
      socket.off("room:updated");
      socket.off("game:started");
      socket.off("game:phaseChanged");
      socket.off("game:votecast");
      socket.off("game:action");
      socket.off("game:ended");
      socket.off("chat:message");
    };
  }, [socket, gameActions]);

  return {
    // Game State
    state,

    // Room Management
    createRoom,
    joinRoom,
    leaveRoom,
    setReady,

    // Game Actions
    startGame,
    castVote,
    performAction,
    sendMessage,

    // Game State Helpers
    isAlive,
    canVote,
    canPerformAction,
    getRemainingPlayers,

    // Original Context Actions
    ...gameActions,
  };
}
