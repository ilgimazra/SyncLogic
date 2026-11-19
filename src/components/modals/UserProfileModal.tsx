import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { User } from '../../types';
import { useSyncLogic } from '../../context/SyncLogicContext';

interface UserProfileModalProps {
  onClose: () => void;
  user: User;
}

export default function UserProfileModal({ onClose, user }: UserProfileModalProps) {
  const { state, updateTeam } = useSyncLogic();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email || `${user.name.toLowerCase().replace(' ', '.')}@synclogic.com`);
  const [status, setStatus] = useState(user.status || 'Online');
  const [avatar, setAvatar] = useState(user.avatar);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Find the current team
    const currentTeam = state.teams.find(t => t.id === state.currentTeamId);
    if (currentTeam) {
      // Update the user in the team's members array
      const updatedMembers = currentTeam.members.map(m => 
        m.id === user.id ? { ...m, name, email, status } : m
      );
      
      updateTeam({
        ...currentTeam,
        members: updatedMembers
      });
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-emerald-100 flex items-center justify-between bg-emerald-50">
          <h2 className="text-xl font-bold text-emerald-950">User Profile</h2>
          <button onClick={onClose} className="text-emerald-600 hover:text-emerald-900 bg-emerald-100/50 hover:bg-emerald-200 p-2 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSave} className="p-6 space-y-6">
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <img src={avatar} alt={name} className="w-24 h-24 rounded-full border-4 border-emerald-100 object-cover" />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-emerald-900 mb-1">Full Name</label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full border border-emerald-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-emerald-900 mb-1">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-emerald-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-emerald-900 mb-1">Status</label>
              <select 
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full border border-emerald-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="Online">🟢 Online</option>
                <option value="Away">🟡 Away</option>
                <option value="Do Not Disturb">🔴 Do Not Disturb</option>
                <option value="Offline">⚫ Offline</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-emerald-100">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl font-medium text-emerald-700 hover:bg-emerald-50 transition-colors">
              Cancel
            </button>
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl font-medium transition-colors shadow-sm flex items-center gap-2">
              <Save size={16} /> Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
