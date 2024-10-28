import React, { createContext, useContext, useReducer } from "react";
import { GAME_PHASES } from "../constants";

// Initial game state
const initialGameState = {
  phase: GAME_PHASES.LOBBY,
  players: {},
  room: {
    id: null,
    code: null,
    host: null,
    settings: {
      maxPlayers: 10,
      roles: {
        MAFIA: 2,
        DETECTIVE: 1,
        DOCTOR: 1,
        VILLAGER: 6,
      },
    },
  },
  currentPhase: {
    timeRemaining: null,
    votes: {},
    actions: {},
  },
  messages: [],
  gameLog: [],
  winningSide: null,
};

// Action types
export const GAME_ACTIONS = {
  JOIN_ROOM: "JOIN_ROOM",
  LEAVE_ROOM: "LEAVE_ROOM",
  UPDATE_PLAYER: "UPDATE_PLAYER",
  START_GAME: "START_GAME",
  CHANGE_PHASE: "CHANGE_PHASE",
  CAST_VOTE: "CAST_VOTE",
  PERFORM_ACTION: "PERFORM_ACTION",
  ADD_MESSAGE: "ADD_MESSAGE",
  END_GAME: "END_GAME",
  RESET_GAME: "RESET_GAME",
};

// Game reducer
function gameReducer(state, action) {
  switch (action.type) {
    case GAME_ACTIONS.JOIN_ROOM:
      return {
        ...state,
        room: {
          ...state.room,
          id: action.payload.roomId,
          code: action.payload.roomCode,
          host: action.payload.host,
        },
        players: {
          ...state.players,
          [action.payload.playerId]: {
            id: action.payload.playerId,
            username: action.payload.username,
            isReady: false,
            state: PLAYER_STATES.ALIVE,
            role: null,
          },
        },
      };

    case GAME_ACTIONS.LEAVE_ROOM:
      const { [action.payload.playerId]: removedPlayer, ...remainingPlayers } =
        state.players;
      return {
        ...state,
        players: remainingPlayers,
      };

    case GAME_ACTIONS.UPDATE_PLAYER:
      return {
        ...state,
        players: {
          ...state.players,
          [action.payload.playerId]: {
            ...state.players[action.payload.playerId],
            ...action.payload.updates,
          },
        },
      };

    case GAME_ACTIONS.START_GAME:
      return {
        ...state,
        phase: GAME_PHASES.STARTING,
        players: {
          ...state.players,
          ...action.payload.playerRoles,
        },
      };

    case GAME_ACTIONS.CHANGE_PHASE:
      return {
        ...state,
        phase: action.payload.phase,
        currentPhase: {
          timeRemaining: action.payload.timeLimit,
          votes: {},
          actions: {},
        },
      };

    case GAME_ACTIONS.CAST_VOTE:
      return {
        ...state,
        currentPhase: {
          ...state.currentPhase,
          votes: {
            ...state.currentPhase.votes,
            [action.payload.voterId]: action.payload.targetId,
          },
        },
      };

    case GAME_ACTIONS.PERFORM_ACTION:
      return {
        ...state,
        currentPhase: {
          ...state.currentPhase,
          actions: {
            ...state.currentPhase.actions,
            [action.payload.playerId]: {
              action: action.payload.action,
              target: action.payload.targetId,
            },
          },
        },
      };

    case GAME_ACTIONS.ADD_MESSAGE:
      return {
        ...state,
        messages: [...state.messages, action.payload.message],
        gameLog: action.payload.isGameEvent
          ? [...state.gameLog, action.payload.message]
          : state.gameLog,
      };

    case GAME_ACTIONS.END_GAME:
      return {
        ...state,
        phase: GAME_PHASES.GAME_END,
        winningSide: action.payload.winner,
      };

    case GAME_ACTIONS.RESET_GAME:
      return {
        ...initialGameState,
        room: {
          ...state.room,
          settings: action.payload.settings || state.room.settings,
        },
      };

    default:
      return state;
  }
}

// Create context
export const GameContext = createContext();

// Context provider
export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);

  // Memoized game actions
  const gameActions = React.useMemo(
    () => ({
      joinRoom: (roomData) =>
        dispatch({
          type: GAME_ACTIONS.JOIN_ROOM,
          payload: roomData,
        }),
      leaveRoom: (playerId) =>
        dispatch({
          type: GAME_ACTIONS.LEAVE_ROOM,
          payload: { playerId },
        }),
      updatePlayer: (playerId, updates) =>
        dispatch({
          type: GAME_ACTIONS.UPDATE_PLAYER,
          payload: { playerId, updates },
        }),
      startGame: (playerRoles) =>
        dispatch({
          type: GAME_ACTIONS.START_GAME,
          payload: { playerRoles },
        }),
      changePhase: (phase, timeLimit) =>
        dispatch({
          type: GAME_ACTIONS.CHANGE_PHASE,
          payload: { phase, timeLimit },
        }),
      castVote: (voterId, targetId) =>
        dispatch({
          type: GAME_ACTIONS.CAST_VOTE,
          payload: { voterId, targetId },
        }),
      performAction: (playerId, action, targetId) =>
        dispatch({
          type: GAME_ACTIONS.PERFORM_ACTION,
          payload: { playerId, action, targetId },
        }),
      addMessage: (message, isGameEvent = false) =>
        dispatch({
          type: GAME_ACTIONS.ADD_MESSAGE,
          payload: { message, isGameEvent },
        }),
      endGame: (winner) =>
        dispatch({
          type: GAME_ACTIONS.END_GAME,
          payload: { winner },
        }),
      resetGame: (settings) =>
        dispatch({
          type: GAME_ACTIONS.RESET_GAME,
          payload: { settings },
        }),
    }),
    []
  );

  return (
    <GameContext.Provider value={{ state, ...gameActions }}>
      {children}
    </GameContext.Provider>
  );
}

// Custom hook for using game context
export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
