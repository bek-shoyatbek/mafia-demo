// WaitingRoom.jsx
import React, { useState, useEffect } from 'react';
import { useGame } from '../../hooks/useGame';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Users, Copy, CheckCircle, XCircle, UserX, Shield, Search } from 'lucide-react';

export function WaitingRoom() {
  const { state, setReady, startGame, leaveRoom, sendMessage } = useGame();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [showStartError, setShowStartError] = useState(false);
  const [chatMessage, setChatMessage] = useState('');

  const isHost = state.room.host === user.id;
  const allPlayersReady = Object.values(state.players).every(player => player.isReady);
  const playerCount = Object.keys(state.players).length;
  const minPlayers = state.room.settings.maxPlayers >= 7 ? 7 : 5;
  const hasEnoughPlayers = playerCount >= minPlayers;

  useEffect(() => {
    if (!state.room.id) {
      navigate('/lobby');
    }
  }, [state.room.id, navigate]);

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(state.room.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy room code:', error);
    }
  };

  const handleStartGame = () => {
    if (!hasEnoughPlayers || !allPlayersReady) {
      setShowStartError(true);
      setTimeout(() => setShowStartError(false), 3000);
      return;
    }
    startGame();
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (chatMessage.trim()) {
      sendMessage(chatMessage);
      setChatMessage('');
    }
  };

  const handleLeaveRoom = () => {
    leaveRoom();
    navigate('/lobby');
  };

  return (
    <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Waiting Room</h2>
        <div className="flex items-center justify-center gap-2">
          <span className="text-gray-400">Room Code:</span>
          <button
            onClick={copyRoomCode}
            className="flex items-center gap-2 px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
          >
            {state.room.code}
            {copied ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Players List */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Players ({playerCount}/{state.room.settings.maxPlayers})</h3>
          <div className="space-y-2">
            {Object.values(state.players).map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between bg-gray-600 p-3 rounded"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{player.username}</span>
                  {state.room.host === player.id && (
                    <span className="text-xs bg-blue-600 px-2 py-1 rounded">
                      Host
                    </span>
                  )}
                </div>
                {player.isReady ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Game Settings */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Game Settings</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Max Players</span>
              <span>{state.room.settings.maxPlayers}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Day Duration</span>
              <span>{state.room.settings.dayDuration}s</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Night Duration</span>
              <span>{state.room.settings.nightDuration}s</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Discussion Time</span>
              <span>{state.room.settings.discussionTime}s</span>
            </div>
          </div>
        </div>
      </div>

      {/* Role Distribution */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Role Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-700 p-4 rounded-lg text-center">
            <UserX className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <div className="text-sm text-gray-400">Mafia</div>
            <div className="font-bold">{state.room.settings.roles.MAFIA}</div>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg text-center">
            <Search className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-sm text-gray-400">Detective</div>
            <div className="font-bold">{state.room.settings.roles.DETECTIVE}</div>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg text-center">
            <Shield className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-sm text-gray-400">Doctor</div>
            <div className="font-bold">{state.room.settings.roles.DOCTOR}</div>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg text-center">
            <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <div className="text-sm text-gray-400">Villagers</div>
            <div className="font-bold">{state.room.settings.roles.VILLAGER}</div>
          </div>
        </div>
      </div>

      {/* Game Requirements */}
      <div className="mt-6 bg-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Game Requirements</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div 
              className={`w-4 h-4 rounded-full ${
                hasEnoughPlayers ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span>
              Minimum {minPlayers} players ({playerCount}/{minPlayers})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div 
              className={`w-4 h-4 rounded-full ${
                allPlayersReady ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span>All players ready</span>
          </div>
          <div className="flex items-center gap-2">
            <div 
              className={`w-4 h-4 rounded-full ${
                playerCount <= state.room.settings.maxPlayers 
                  ? 'bg-green-500' 
                  : 'bg-red-500'
              }`}
            />
            <span>
              Maximum {state.room.settings.maxPlayers} players
            </span>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="mt-6 bg-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Chat</h3>
        <div className="h-48 flex flex-col">
          <div className="flex-1 overflow-y-auto mb-4 space-y-2">
            {state.messages
              .filter(msg => !msg.isGameEvent)
              .map((message) => (
                <div key={message.id} className="text-sm">
                  <span className="font-medium text-blue-400">
                    {message.sender}:
                  </span>{' '}
                  <span className="text-gray-300">{message.content}</span>
                </div>
              ))}
          </div>
          <form onSubmit={handleSendMessage} className="mt-auto">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full bg-gray-600 rounded p-2 text-sm"
            />
          </form>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between mt-6">
        <button
          onClick={handleLeaveRoom}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Leave Room
        </button>

        <div className="flex gap-4">
          <button
            onClick={() => setReady(!state.players[user.id]?.isReady)}
            className={`px-4 py-2 rounded transition-colors ${
              state.players[user.id]?.isReady
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-yellow-600 hover:bg-yellow-700'
            }`}
          >
            {state.players[user.id]?.isReady ? 'Ready!' : 'Not Ready'}
          </button>

          {isHost && (
            <button
              onClick={handleStartGame}
              disabled={!hasEnoughPlayers || !allPlayersReady}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Game
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {showStartError && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in">
          {!hasEnoughPlayers 
            ? `Need at least ${minPlayers} players to start` 
            : 'All players must be ready to start'}
        </div>
      )}
    </div>
  );
}