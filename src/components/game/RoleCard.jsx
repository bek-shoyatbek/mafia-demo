import React from 'react';
import { useGame } from '../../hooks/useGame';
import { useAuth } from '../../hooks/useAuth';
import { User, UserX, Shield, Search } from 'lucide-react';

export function RoleCard() {
  const { state } = useGame();
  const { user } = useAuth();
  const playerInfo = state.players[user.id];

  const getRoleInfo = (role) => {
    switch (role) {
      case 'MAFIA':
        return {
          icon: <UserX className="w-8 h-8 text-red-500" />,
          color: 'text-red-500',
          description: 'Choose a player to eliminate each night. Work with other mafia members to outnumber the villagers.'
        };
      case 'DETECTIVE':
        return {
          icon: <Search className="w-8 h-8 text-blue-500" />,
          color: 'text-blue-500',
          description: 'Investigate one player each night to learn their role. Use this information to help the village.'
        };
      case 'DOCTOR':
        return {
          icon: <Shield className="w-8 h-8 text-green-500" />,
          color: 'text-green-500',
          description: 'Choose a player to protect each night. They will survive if targeted by the mafia.'
        };
      default:
        return {
          icon: <User className="w-8 h-8 text-gray-500" />,
          color: 'text-gray-500',
          description: 'Work with other villagers to identify and eliminate the mafia during the day.'
        };
    }
  };

  const roleInfo = getRoleInfo(playerInfo?.role);

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center space-x-3 mb-4">
        {roleInfo.icon}
        <div>
          <h2 className="text-xl font-bold">Your Role</h2>
          <p className={`font-medium ${roleInfo.color}`}>
            {playerInfo?.role || 'Unassigned'}
          </p>
        </div>
      </div>
      <p className="text-gray-300">{roleInfo.description}</p>
    </div>
  );

}