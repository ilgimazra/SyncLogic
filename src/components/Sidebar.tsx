import React, { useState } from 'react';
import { 
  Infinity, 
  LayoutDashboard, 
  KanbanSquare, 
  RotateCcw, 
  Settings, 
  Search,
  ChevronDown,
  Bell
} from 'lucide-react';
import { useSyncLogic } from '../context/SyncLogicContext';
import ManageTeamsModal from './modals/ManageTeamsModal';
import ProjectSettingsModal from './modals/ProjectSettingsModal';
import UserProfileModal from './modals/UserProfileModal';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { state, setCurrentTeam, getRandomAvatar } = useSyncLogic();
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showManageTeams, setShowManageTeams] = useState(false);
  const [showProjectSettings, setShowProjectSettings] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  
  const selectedTeam = state.teams.find(t => t.id === state.currentTeamId) || state.teams[0];
  const currentUser = selectedTeam?.members[0] || { id: 'guest', name: 'Guest', avatar: getRandomAvatar('guest'), capacity: 40 };

  const filteredTeams = state.teams.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const navItems = [
    { id: 'boards', label: 'Boards', icon: KanbanSquare },
    { id: 'sprints', label: 'Sprints', icon: LayoutDashboard },
    { id: 'retrospectives', label: 'Retrospectives', icon: RotateCcw },
  ];

  return (
    <>
      <div className="w-64 bg-emerald-900 text-emerald-50 h-screen flex flex-col">
        {/* Logo */}
        <div 
          onClick={() => setCurrentTeam(null)}
          className="p-6 flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="flex items-center gap-3">
            <div className="bg-emerald-400 p-2 rounded-lg text-emerald-950">
              <Infinity size={24} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold tracking-tight">{state.projectName}</span>
          </div>
          <div className="relative">
            <Bell size={20} className={`cursor-pointer transition-colors ${state.hasNewNotifications ? 'text-yellow-400 animate-pulse' : 'text-emerald-300 hover:text-white'}`} />
            {state.hasNewNotifications && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-emerald-900"></span>
            )}
          </div>
        </div>

        {/* Team Selection */}
        <div className="px-4 mb-6 relative">
          <div 
            className="bg-emerald-800/50 hover:bg-emerald-800 rounded-xl p-3 flex items-center justify-between cursor-pointer transition-colors border border-emerald-700/50"
            onClick={() => setIsTeamDropdownOpen(!isTeamDropdownOpen)}
          >
            <div className="flex flex-col">
              <span className="text-xs text-emerald-300 font-medium uppercase tracking-wider">Current Team</span>
              <span className="font-semibold truncate w-40">{selectedTeam?.name}</span>
            </div>
            <ChevronDown size={16} className={`text-emerald-300 transition-transform ${isTeamDropdownOpen ? 'rotate-180' : ''}`} />
          </div>

          {isTeamDropdownOpen && (
            <div className="absolute top-full left-4 right-4 mt-2 bg-white text-emerald-950 rounded-xl shadow-xl z-50 overflow-hidden border border-emerald-100">
              <div className="p-2 border-b border-emerald-100 flex items-center gap-2">
                <Search size={14} className="text-emerald-500" />
                <input 
                  type="text" 
                  placeholder="Search teams..." 
                  className="w-full text-sm outline-none placeholder:text-emerald-300"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="max-h-48 overflow-y-auto">
                {filteredTeams.map(team => (
                  <div 
                    key={team.id} 
                    className="px-4 py-2 hover:bg-emerald-50 cursor-pointer text-sm font-medium"
                    onClick={() => {
                      setCurrentTeam(team.id);
                      setIsTeamDropdownOpen(false);
                      setSearchQuery('');
                    }}
                  >
                    {team.name}
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-emerald-100">
                <button 
                  onClick={() => {
                    setIsTeamDropdownOpen(false);
                    setCurrentTeam(null);
                  }}
                  className="w-full flex items-center justify-center gap-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 py-2 rounded-lg transition-colors"
                >
                  <RotateCcw size={16} />
                  Switch Workspace
                </button>
                <button 
                  onClick={() => {
                    setIsTeamDropdownOpen(false);
                    setShowManageTeams(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 py-2 rounded-lg transition-colors mt-1"
                >
                  <Settings size={16} />
                  Manage Teams
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                  isActive 
                    ? 'bg-emerald-100 text-emerald-900 shadow-sm' 
                    : 'text-emerald-100 hover:bg-emerald-800/50 hover:text-white'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-emerald-700' : 'text-emerald-300'} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-emerald-800/50 space-y-2">
          <button 
            onClick={() => setShowProjectSettings(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-emerald-100 hover:bg-emerald-800/50 hover:text-white transition-colors font-medium"
          >
            <Settings size={20} className="text-emerald-300" />
            Project Settings
          </button>
          
          <div 
            className="mt-4 flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-emerald-800/50 rounded-xl transition-colors"
            onClick={() => setShowUserProfile(true)}
          >
            <div className="relative">
              <img src={currentUser.avatar} alt={currentUser.name} className="w-10 h-10 rounded-full border-2 border-emerald-700 object-cover" />
              <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-emerald-900 ${
                currentUser.status === 'Away' ? 'bg-yellow-400' :
                currentUser.status === 'Do Not Disturb' ? 'bg-red-500' :
                currentUser.status === 'Offline' ? 'bg-gray-400' :
                'bg-green-400'
              }`}></div>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm">{currentUser.name}</span>
              <span className="text-xs text-emerald-300 capitalize">{currentUser.status || 'Online'}</span>
            </div>
          </div>
        </div>
      </div>
      
      {showManageTeams && <ManageTeamsModal onClose={() => setShowManageTeams(false)} />}
      {showProjectSettings && <ProjectSettingsModal onClose={() => setShowProjectSettings(false)} />}
      {showUserProfile && <UserProfileModal onClose={() => setShowUserProfile(false)} user={currentUser} />}
    </>
  );
}
