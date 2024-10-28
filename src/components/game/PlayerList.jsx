import React from "react";
import { useGame } from "../../hooks/useGame";
import { GAME_PHASES, PLAYER_STATES } from "../../constants";
import { User, UserX, Shield, Search } from "lucide-react";

export function PlayerList() {
  const { state, performAction } = useGame();
  const { players, phase, currentPhase } = state;

  const getRoleIcon = (role) => {
    switch (role) {
      case "MAFIA":
        return <UserX className="text-red-500" />;
      case "DETECTIVE":
        return <Search className="text-blue-500" />;
      case "DOCTOR":
        return <Shield className="text-green-500" />;
      default:
        return <User className="text-gray-500" />;
    }
  };

  const handlePlayerClick = (targetId) => {
    if (phase === GAME_PHASES.NIGHT_ACTION) {
      performAction(state.currentPlayer.id, state.currentPlayer.role, targetId);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h2 className="text-xl font-bold mb-4">Players</h2>
      <div className="grid grid-cols-2 gap-4">
        {Object.values(players).map((player) => (
          <div
            key={player.id}
            onClick={() => handlePlayerClick(player.id)}
            className={`
              p-4 rounded-lg border-2 transition-all
              ${
                player.state === PLAYER_STATES.DEAD
                  ? "bg-gray-700 opacity-50"
                  : "bg-gray-600"
              }
              ${
                player.state === PLAYER_STATES.ALIVE
                  ? "cursor-pointer hover:border-blue-500"
                  : ""
              }
              ${
                currentPhase.votes[player.id]
                  ? "border-yellow-500"
                  : "border-transparent"
              }
            `}
          >
            <div className="flex items-center space-x-3">
              {getRoleIcon(player.role)}
              <div>
                <p className="font-medium">{player.username}</p>
                {player.state === PLAYER_STATES.DEAD && (
                  <p className="text-red-400 text-sm">Dead</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
