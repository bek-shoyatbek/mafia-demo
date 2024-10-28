import React from 'react';
import { useGame } from '../../hooks/useGame';
import { useAuth } from '../../hooks/useAuth';

export function VotePanel() {
  const { state, castVote } = useGame();
  const { user } = useAuth();
  const { currentPhase, players } = state;

  const handleVote = (targetId) => {
    castVote(user.id, targetId);
  };

  // Count votes for each player
  const voteCount = Object.values(currentPhase.votes).reduce((acc, targetId) => {
    acc[targetId] = (acc[targetId] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h2 className="text-xl font-bold mb-4">Vote</h2>
      <div className="space-y-2">
        {Object.values(players)
          .filter(player => player.state === 'ALIVE')
          .map(player => (
            <button
              key={player.id}
              onClick={() => handleVote(player.id)}
              className={`
                w-full p-3 rounded-lg flex justify-between items-center
                ${currentPhase.votes[user.id] === player.id 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-gray-700 hover:bg-gray-600'}
              `}
            >
              <span>{player.username}</span>
              <span className="bg-gray-800 px-2 py-1 rounded">
                {voteCount[player.id] || 0} votes
              </span>
            </button>
          ))}
      </div>
    </div>
  );
}