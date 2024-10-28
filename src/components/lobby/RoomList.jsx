import React, { useState, useEffect } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, RefreshCw } from 'lucide-react';

export function RoomList() {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { emit } = useSocket();
  const navigate = useNavigate();

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const response = await emit('room:list');
      setRooms(response.rooms);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleJoinRoom = async (roomCode) => {
    try {
      await emit('room:join', { roomCode });
      navigate(`/room/${roomCode}`);
    } catch (error) {
      console.error('Failed to join room:', error);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Available Rooms</h2>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/create-room')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Create Room
          </button>
          <button
            onClick={fetchRooms}
            className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2 text-gray-400">Loading rooms...</p>
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No rooms available. Create one to start playing!</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rooms.map((room) => (
            <div
              key={room.code}
              className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Room #{room.code}
                  </h3>
                  <p className="text-sm text-gray-400">
                    Host: {room.hostUsername}
                  </p>
                </div>
                <span className="px-2 py-1 text-sm bg-gray-800 rounded">
                  {room.players.length}/{room.settings.maxPlayers}
                </span>
              </div>
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-400">
                  {room.players.length} players waiting
                </div>
                <button
                  onClick={() => handleJoinRoom(room.code)}
                  disabled={room.players.length >= room.settings.maxPlayers}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Join Room
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}