import React, { useState } from 'react';
import { useSyncLogic } from '../context/SyncLogicContext';
import { Users, Infinity, Plus, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Team } from '../types';

export default function WorkspaceSelection() {
  const { state, setCurrentTeam, addTeam, getRandomAvatar } = useSyncLogic();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    
    const adminId = `u-${Date.now()}`;
    const newTeam: Team = {
      id: `t-${Date.now()}`,
      name: newTeamName,
      members: [
        { id: adminId, name: 'Admin User', avatar: getRandomAvatar(adminId), capacity: 40 }
      ]
    };
    
    addTeam(newTeam);
    setCurrentTeam(newTeam.id);
    setNewTeamName('');
    setShowCreateModal(false);
  };

  const getTeamStats = (teamId: string) => {
    const teamTasks = state.tasks.filter(t => t.teamId === teamId);
    
    const activeTasks = teamTasks.filter(t => t.status === 'Active' || t.status === 'New').length;
    const completedTasks = teamTasks.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;
    const totalTasks = teamTasks.length;
    const health = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    return { activeTasks, health };
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex flex-col p-8 md:p-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl" />

      {/* Header */}
      <div className="mb-12 relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-200">
            <Infinity className="text-white" size={28} strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-black text-emerald-950 tracking-tighter">SyncLogic</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col justify-center relative z-10">
        <div className="mb-16 text-center md:text-left">
          <h2 className="text-5xl font-black text-emerald-950 mb-4 tracking-tight">Welcome to SyncLogic</h2>
          <p className="text-xl text-emerald-800/60 font-medium max-w-2xl">An intelligent project management platform with BI-driven insights. Select your workspace to begin syncing your logic.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {state.teams.map(team => {
            const { activeTasks, health } = getTeamStats(team.id);
            return (
              <button
                key={team.id}
                onClick={() => setCurrentTeam(team.id)}
                className="group relative bg-white/40 backdrop-blur-xl border border-white/60 p-8 rounded-[2.5rem] shadow-2xl shadow-emerald-900/5 hover:shadow-emerald-900/10 hover:scale-[1.02] hover:-translate-y-2 transition-all duration-500 text-left overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                  <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200">
                    <ArrowRight className="text-white" size={20} />
                  </div>
                </div>
                
                <div className="flex items-start gap-5 mb-8">
                  <div className="w-16 h-16 bg-emerald-600 rounded-3xl flex items-center justify-center text-white font-black text-3xl shadow-lg shadow-emerald-200 group-hover:rotate-6 transition-transform duration-500">
                    {team.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-emerald-950 mb-1 leading-tight">{team.name}</h3>
                    <div className="flex -space-x-2 overflow-hidden">
                      {team.members.slice(0, 4).map(member => (
                        <img 
                          key={member.id} 
                          src={member.avatar} 
                          alt={member.name} 
                          className="w-8 h-8 rounded-full border-2 border-white ring-2 ring-emerald-50/50"
                          title={member.name}
                        />
                      ))}
                      {team.members.length > 4 && (
                        <div className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-emerald-700">
                          +{team.members.length - 4}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-emerald-900 font-bold">{activeTasks} Active Tasks</span>
                    </div>
                    <span className="text-emerald-900 font-black">{health}% Health</span>
                  </div>
                  <div className="relative h-3 bg-emerald-100/50 rounded-full overflow-hidden border border-emerald-200/20">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                      style={{ width: `${health}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[10px] font-black text-emerald-800/40 uppercase tracking-widest">Project Status</span>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 size={12} className="text-emerald-500" />
                      <span className="text-[10px] font-bold text-emerald-600">Syncing...</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}

          {/* Create New Workspace Card */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="group relative bg-emerald-600/5 backdrop-blur-sm p-8 rounded-[2.5rem] shadow-xl shadow-emerald-900/5 hover:bg-emerald-600 hover:scale-[1.02] hover:-translate-y-2 transition-all duration-500 flex flex-col items-center justify-center text-center border-4 border-dashed border-emerald-600/20 hover:border-emerald-400/40"
          >
            <div className="w-20 h-20 bg-emerald-600 rounded-[2rem] flex items-center justify-center mb-6 group-hover:bg-white group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-xl shadow-emerald-200/20">
              <Plus className="text-white group-hover:text-emerald-600" size={40} />
            </div>
            <h3 className="text-2xl font-black text-emerald-950 group-hover:text-white mb-2 transition-colors">New Workspace</h3>
            <p className="text-emerald-800/40 group-hover:text-emerald-50 text-sm font-bold transition-colors">Launch a fresh project</p>
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-12 text-center text-emerald-600/50 text-sm">
        © 2026 SyncLogic Platform • All rights reserved
      </div>

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300">
            <h3 className="text-2xl font-bold text-emerald-950 mb-2">New Workspace</h3>
            <p className="text-emerald-600 mb-6">Give your team a name to get started.</p>
            
            <form onSubmit={handleCreateTeam}>
              <div className="mb-6">
                <label className="block text-sm font-bold text-emerald-900 mb-2">Workspace Name</label>
                <input
                  autoFocus
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="e.g. Marketing Launch, Q3 Product..."
                  className="w-full px-4 py-3 rounded-xl border border-emerald-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
                >
                  Create & Enter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
