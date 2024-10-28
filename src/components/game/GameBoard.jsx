import React from "react";
import { useGame } from "../../hooks/useGame";
import { PlayerList } from "./PlayerList";
import { ChatBox } from "./ChatBox";
import { VotePanel } from "./VotePanel";
import { RoleCard } from "./RoleCard";
import { GAME_PHASES } from "../../constants";

export function GameBoard() {
  const { state } = useGame();
  const { phase, currentPhase } = state;

  return (
    <div className="h-screen bg-gray-900 text-white p-4">
      <div className="grid grid-cols-12 gap-4 h-full">
        {/* Left sidebar - Player info and role */}
        <div className="col-span-3 space-y-4">
          <RoleCard />
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-xl font-bold mb-2">Game Info</h2>
            <div className="space-y-2">
              <p>Phase: {phase}</p>
              {currentPhase.timeRemaining && (
                <p>Time: {Math.ceil(currentPhase.timeRemaining / 1000)}s</p>
              )}
            </div>
          </div>
        </div>

        {/* Main game area */}
        <div className="col-span-6 space-y-4">
          <PlayerList />
          {phase === GAME_PHASES.DAY_VOTING && <VotePanel />}
        </div>

        {/* Right sidebar - Chat */}
        <div className="col-span-3">
          <ChatBox />
        </div>
      </div>
    </div>
  );
}
