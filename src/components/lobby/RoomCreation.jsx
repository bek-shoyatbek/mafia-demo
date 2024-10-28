import React, { useState } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Shield, Search, UserX } from 'lucide-react';

export function RoomCreation() {
  const [settings, setSettings] = useState({
    maxPlayers: 10,
    roles: {
      MAFIA: 2,
      DETECTIVE: 1,
      DOCTOR: 1,
      VILLAGER: 6,
    },
    dayDuration: 120,
    nightDuration: 30,
    discussionTime: 60,
  });

  const [isCreating, setIsCreating] = useState(false);
  const { emit } = useSocket();
  const navigate = useNavigate();

  const handleCreateRoom = async () => {
    setIsCreating(true);
    try {
      const response = await emit('room:create', { settings });
      navigate(`/room/${response.roomCode}`);
    } catch (error) {
      console.error('Failed to create room:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const updateRoles = (role, value) => {
    const newValue = Math.max(0, parseInt(value) || 0);
    setSettings(prev => ({
      ...prev,
      roles: {
        ...prev.roles,
        [role]: newValue,
      }
    }));
  };

  return (
    <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg p-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/lobby')}
          className="p-2 hover:bg-gray-700 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold">Create Room</h2>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Game Settings</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Maximum Players
              </label>
              <input
                type="number"
                value={settings.maxPlayers}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  maxPlayers: Math.max(5, Math.min(15, parseInt(e.target.value) || 5))
                }))}
                className="w-full bg-gray-700 rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Day Duration (seconds)
              </label>
              <input
                type="number"
                value={settings.dayDuration}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  dayDuration: Math.max(60, Math.min(300, parseInt(e.target.value) || 60))
                }))}
                className="w-full bg-gray-700 rounded p-2"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Role Distribution</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3 bg-gray-700 p-3 rounded">
              <UserX className="w-5 h-5 text-red-500" />
              <div className="flex-1">
                <label className="block text-sm font-medium">Mafia</label>
              </div>
              <input
                type="number"
                value={settings.roles.MAFIA}
                onChange={(e) => updateRoles('MAFIA', e.target.value)}
                className="w-20 bg-gray-600 rounded p-2"
              />
            </div>
            <div className="flex items-center gap-3 bg-gray-700 p-3 rounded">
              <Search className="w-5 h-5 text-blue-500" />
              <div className="flex-1">
                <label className="block text-sm font-medium">Detective</label>
              </div>
              <input
                type="number"
                value={settings.roles.DETECTIVE}
                onChange={(e) => updateRoles('DETECTIVE', e.target.value)}
                className="w-20 bg-gray-600 rounded p-2"
              />
            </div>
            <div className="flex items-center gap-3 bg-gray-700 p-3 rounded">
              <Shield className="w-5 h-5 text-green-500" />
              <div className="flex-1">
                <label className="block text-sm font-medium">Doctor</label>
              </div>
              <input
                type="number"
                value={settings.roles.DOCTOR}
                onChange={(e) => updateRoles('DOCTOR', e.target.value)}
                className="w-20 bg-gray-600 rounded p-2"
              />
            </div>
            <div className="flex items-center gap-3 bg-gray-700 p-3 rounded">
              <Users className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <label className="block text-sm font-medium">Villagers</label>
              </div>
              <input
                type="number"
                value={settings.roles.VILLAGER}
                onChange={(e) => updateRoles('VILLAGER', e.target.value)}
                className="w-20 bg-gray-600 rounded p-2"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleCreateRoom}
          disabled={isCreating}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isCreating ? 'Creating Room...' : 'Create Room'}
        </button>
      </div>
    </div>
  );
}