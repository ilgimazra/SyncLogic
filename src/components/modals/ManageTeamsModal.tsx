import React, { useState } from 'react';
import { useSyncLogic } from '../../context/SyncLogicContext';
import { X, Plus, Trash2, Edit3, Check, UserPlus } from 'lucide-react';
import { Team, User } from '../../types';
import ConfirmationModal from './ConfirmationModal';

export default function ManageTeamsModal({ onClose }: { onClose: () => void }) {
  const { state, addTeam, updateTeam, deleteTeam, deleteMember, setCurrentTeam, getRandomAvatar } = useSyncLogic();
  const [newTeamName, setNewTeamName] = useState('');
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editingTeamName, setEditingTeamName] = useState('');

  // Member editing state
  const [addingMemberToTeamId, setAddingMemberToTeamId] = useState<string | null>(null);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberCapacity, setNewMemberCapacity] = useState<number>(40);
  
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editingMemberName, setEditingMemberName] = useState('');
  const [editingMemberCapacity, setEditingMemberCapacity] = useState<number>(40);

  const [confirmDeleteTeamId, setConfirmDeleteTeamId] = useState<string | null>(null);
  const [confirmDeleteMember, setConfirmDeleteMember] = useState<{ teamId: string, memberId: string } | null>(null);

  const handleAddTeam = () => {
    if (!newTeamName.trim()) return;
    const newTeam = {
      id: `t-${Date.now()}`,
      name: newTeamName,
      members: []
    };
    addTeam(newTeam);
    setCurrentTeam(newTeam.id);
    setNewTeamName('');
  };

  const startEditTeam = (team: Team) => {
    setEditingTeamId(team.id);
    setEditingTeamName(team.name);
  };

  const saveEditTeam = (team: Team) => {
    if (editingTeamName.trim() && editingTeamName !== team.name) {
      updateTeam({ ...team, name: editingTeamName });
    }
    setEditingTeamId(null);
  };

  const handleDeleteTeam = (id: string) => {
    deleteTeam(id);
  };

  const handleAddMember = (team: Team) => {
    if (!newMemberName.trim()) return;
    const memberId = `u-${Date.now()}`;
    const newMember: User = {
      id: memberId,
      name: newMemberName,
      avatar: getRandomAvatar(memberId),
      capacity: newMemberCapacity
    };
    updateTeam({
      ...team,
      members: [...team.members, newMember]
    });
    setAddingMemberToTeamId(null);
    setNewMemberName('');
    setNewMemberCapacity(40);
  };

  const startEditMember = (member: User) => {
    setEditingMemberId(member.id);
    setEditingMemberName(member.name);
    setEditingMemberCapacity(member.capacity);
  };

  const saveEditMember = (team: Team, memberId: string) => {
    if (!editingMemberName.trim()) return;
    updateTeam({
      ...team,
      members: team.members.map(m => 
        m.id === memberId 
          ? { ...m, name: editingMemberName, capacity: editingMemberCapacity }
          : m
      )
    });
    setEditingMemberId(null);
  };

  const handleDeleteMember = (teamId: string, memberId: string) => {
    deleteMember(teamId, memberId);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-emerald-100 flex items-center justify-between bg-emerald-50">
          <h2 className="text-xl font-bold text-emerald-950">Manage Teams</h2>
          <button onClick={onClose} className="text-emerald-600 hover:text-emerald-900 bg-emerald-100/50 hover:bg-emerald-200 p-2 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          <div className="mb-8">
            <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wider mb-3">Create New Team</h3>
            <div className="flex gap-3">
              <input 
                type="text" 
                value={newTeamName}
                onChange={e => setNewTeamName(e.target.value)}
                placeholder="Enter team name..."
                className="flex-1 border border-emerald-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button 
                onClick={handleAddTeam}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors"
              >
                <Plus size={18} /> Add Team
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wider mb-3">Existing Teams</h3>
            <div className="space-y-4">
              {state.teams.map(team => (
                <div key={team.id} className="border border-emerald-100 rounded-xl p-4 bg-emerald-50/30">
                  <div className="flex items-center justify-between mb-4">
                    {editingTeamId === team.id ? (
                      <div className="flex items-center gap-2 flex-1 mr-4">
                        <input
                          autoFocus
                          type="text"
                          value={editingTeamName}
                          onChange={(e) => setEditingTeamName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && saveEditTeam(team)}
                          className="flex-1 border border-emerald-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <button onClick={() => saveEditTeam(team)} className="text-emerald-600 hover:bg-emerald-100 p-1.5 rounded-lg">
                          <Check size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-emerald-950 text-lg">{team.name}</h4>
                        <button onClick={(e) => { e.stopPropagation(); startEditTeam(team); }} className="text-gray-400 hover:text-emerald-600 p-1.5 rounded-lg hover:bg-emerald-100">
                          <Edit3 size={16} />
                        </button>
                      </div>
                    )}
                    
                    {state.teams.length > 1 && (
                      <Trash2 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setConfirmDeleteTeamId(team.id);
                        }} 
                        className="cursor-pointer text-red-500"
                        size={18}
                      />
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Members ({team.members.length})</div>
                      <button 
                        onClick={() => setAddingMemberToTeamId(team.id)}
                        className="text-xs font-medium text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
                      >
                        <UserPlus size={14} /> Add Member
                      </button>
                    </div>

                    {addingMemberToTeamId === team.id && (
                      <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-emerald-200 shadow-sm">
                        <input 
                          type="text" 
                          autoFocus
                          value={newMemberName}
                          onChange={e => setNewMemberName(e.target.value)}
                          placeholder="Name"
                          className="flex-1 text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        <input 
                          type="number" 
                          value={newMemberCapacity}
                          onChange={e => setNewMemberCapacity(Number(e.target.value))}
                          placeholder="Hrs"
                          className="w-16 text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        <button onClick={() => handleAddMember(team)} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded">
                          <Check size={16} />
                        </button>
                        <button onClick={() => setAddingMemberToTeamId(null)} className="text-gray-400 hover:bg-gray-50 p-1 rounded">
                          <X size={16} />
                        </button>
                      </div>
                    )}

                    {team.members.map(member => (
                      <div key={member.id} className="flex items-center justify-between bg-white p-2 rounded-lg border border-emerald-100 group">
                        {editingMemberId === member.id ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input 
                              type="text" 
                              autoFocus
                              value={editingMemberName}
                              onChange={e => setEditingMemberName(e.target.value)}
                              className="flex-1 text-sm border border-emerald-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                            <input 
                              type="number" 
                              value={editingMemberCapacity}
                              onChange={e => setEditingMemberCapacity(Number(e.target.value))}
                              className="w-16 text-sm border border-emerald-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                            <button onClick={() => saveEditMember(team, member.id)} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded">
                              <Check size={16} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-3">
                              <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full" />
                              <span className="font-medium text-sm">{member.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-sm text-emerald-600 font-medium">
                                {member.capacity}h / week
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={(e) => { e.stopPropagation(); startEditMember(member); }} className="text-gray-400 hover:text-emerald-600 p-1 rounded hover:bg-emerald-50">
                                  <Edit3 size={14} />
                                </button>
                                 <button 
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    setConfirmDeleteMember({ teamId: team.id, memberId: member.id });
                                  }} 
                                  className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                    {team.members.length === 0 && !addingMemberToTeamId && (
                      <div className="text-sm text-gray-500 italic">No members yet.</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <ConfirmationModal 
        isOpen={!!confirmDeleteTeamId}
        onClose={() => setConfirmDeleteTeamId(null)}
        onConfirm={() => confirmDeleteTeamId && handleDeleteTeam(confirmDeleteTeamId)}
        title="Delete Team"
        message="Are you sure you want to delete this team? All associated tasks, sprints, and data will be permanently removed."
      />

      <ConfirmationModal 
        isOpen={!!confirmDeleteMember}
        onClose={() => setConfirmDeleteMember(null)}
        onConfirm={() => confirmDeleteMember && handleDeleteMember(confirmDeleteMember.teamId, confirmDeleteMember.memberId)}
        title="Remove Member"
        message="Are you sure you want to remove this member from the team? Their assigned tasks will become unassigned."
      />
    </div>
  );
}
