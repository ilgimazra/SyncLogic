import React, { useState } from 'react';
import { useSyncLogic } from '../context/SyncLogicContext';
import { Heart, Plus, ArrowRightCircle, Edit3, Trash2, Check, Activity as ActivityIcon, Clock } from 'lucide-react';
import { RetroNoteType, RetroNote } from '../types';
import ConfirmationModal from './modals/ConfirmationModal';

const COLUMNS: { id: RetroNoteType; title: string; color: string; headerColor: string }[] = [
  { id: 'well', title: 'What went well?', color: 'bg-emerald-50 border-emerald-200 text-emerald-900', headerColor: 'bg-emerald-100 text-emerald-800' },
  { id: 'not-well', title: "What didn't go well?", color: 'bg-red-50 border-red-200 text-red-900', headerColor: 'bg-red-100 text-red-800' },
  { id: 'action', title: 'Action Items', color: 'bg-blue-50 border-blue-200 text-blue-900', headerColor: 'bg-blue-100 text-blue-800' },
];

export default function Retrospectives() {
  const { state, addRetro, addRetroNote, updateRetroNote, deleteRetroNote, upvoteRetroNote, convertNoteToTask } = useSyncLogic();
  const [newNoteText, setNewNoteText] = useState('');
  const [addingToColumn, setAddingToColumn] = useState<RetroNoteType | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState('');
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [confirmDeleteNoteId, setConfirmDeleteNoteId] = useState<string | null>(null);

  const filteredRetros = (state.retros || []).filter(r => r.teamId === state.currentTeamId);
  const filteredRetroNotes = (state.retroNotes || []).filter(n => n.teamId === state.currentTeamId);

  const activeRetro = filteredRetros.find(r => r.isActive);

  const handleStartRetro = () => {
    addRetro({
      id: `RETRO-${Date.now()}`,
      name: `Sprint Retrospective ${new Date().toLocaleDateString()}`,
      date: new Date().toISOString(),
      isActive: true
    });
  };

  const handleAddNote = (column: RetroNoteType) => {
    if (!newNoteText.trim() || !activeRetro) return;
    addRetroNote({
      id: `NOTE-${Date.now()}`,
      text: newNoteText,
      column,
      votes: 0,
      retroId: activeRetro.id,
      author: 'User', // Default author for new notes
      teamId: state.currentTeamId || ''
    });
    setNewNoteText('');
    setAddingToColumn(null);
  };

  const startEditNote = (note: RetroNote) => {
    setEditingNoteId(note.id);
    setEditingNoteText(note.text);
  };

  const saveEditNote = (note: RetroNote) => {
    if (editingNoteText.trim() && editingNoteText !== note.text) {
      updateRetroNote({ ...note, text: editingNoteText });
    }
    setEditingNoteId(null);
  };

  const handleDeleteRetroNote = (id: string) => {
    deleteRetroNote(id);
  };

  const handleConvertToTask = (note: RetroNote) => {
    if (note.convertedToTaskId) return;
    convertNoteToTask(note.id, {
      id: `TASK-${Math.floor(Math.random() * 10000)}`,
      title: note.text,
      description: 'Converted from retrospective action item.',
      priority: 'Medium',
      assigneeId: null,
      status: 'Backlog',
      effort: 3,
      sprintId: null,
      type: 'Feature',
      teamId: state.currentTeamId || ''
    });
  };

  if (!activeRetro) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white p-8">
        <div className="text-center max-w-md">
          <RotateCcwIcon className="w-16 h-16 text-emerald-200 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-emerald-950 mb-2">No Active Retrospective</h2>
          <p className="text-emerald-600 mb-8">Start a new retrospective session to gather feedback and action items from your team.</p>
          <button 
            onClick={handleStartRetro}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-sm shadow-emerald-200"
          >
            Start Retrospective
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-8 py-6 border-b border-emerald-100 flex items-center justify-between bg-white sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold text-emerald-950">{activeRetro.name}</h1>
          <p className="text-emerald-600 text-sm mt-1">Focus: Continuous Improvement</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowActivityLog(!showActivityLog)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-colors border ${showActivityLog ? 'bg-emerald-600 text-white border-emerald-600' : 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'}`}
          >
            <ActivityIcon size={16} />
            Activity Log
          </button>
        </div>
      </div>

      {/* Board Content */}
      <div className="flex-1 overflow-hidden flex">
        <div className="flex-1 overflow-x-auto overflow-y-auto p-8">
          <div className="flex gap-6 h-full min-w-max">
            {COLUMNS.map(col => {
              const colItems = filteredRetroNotes
                .filter(item => item.column === col.id)
                .sort((a, b) => b.votes - a.votes);
              
              return (
                <div key={col.id} className={`flex-1 min-w-[320px] rounded-2xl flex flex-col border ${col.color}`}>
                  <div className={`px-5 py-4 rounded-t-2xl border-b border-inherit flex items-center justify-between ${col.headerColor}`}>
                    <h3 className="font-bold">{col.title}</h3>
                    <span className="bg-white/50 px-2 py-0.5 rounded-full text-xs font-bold">
                      {colItems.length}
                    </span>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {colItems.map(item => (
                      <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-inherit relative group">
                        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); startEditNote(item); }} className="text-gray-400 hover:text-emerald-600 p-1 rounded hover:bg-emerald-50">
                            <Edit3 size={14} />
                          </button>
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setConfirmDeleteNoteId(item.id);
                            }} 
                            className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {editingNoteId === item.id ? (
                          <div className="mb-4">
                            <textarea
                              autoFocus
                              value={editingNoteText}
                              onChange={(e) => setEditingNoteText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  saveEditNote(item);
                                } else if (e.key === 'Escape') {
                                  setEditingNoteId(null);
                                }
                              }}
                              className="w-full text-sm resize-none outline-none border border-emerald-300 rounded p-2 min-h-[60px] focus:ring-2 focus:ring-emerald-500"
                            />
                            <div className="flex justify-end gap-2 mt-2">
                              <button onClick={() => setEditingNoteId(null)} className="text-xs text-gray-500 hover:text-gray-700">Cancel</button>
                              <button onClick={() => saveEditNote(item)} className="text-xs bg-emerald-600 text-white px-2 py-1 rounded">Save</button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm font-medium mb-4 pr-12 whitespace-pre-wrap">{item.text}</p>
                        )}
                        
                        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
                          <span className="text-xs text-gray-400 font-medium italic">{item.author}</span>
                          
                          <div className="flex items-center gap-2">
                            {col.id === 'action' && (
                              <button 
                                onClick={() => handleConvertToTask(item)}
                                disabled={!!item.convertedToTaskId}
                                className={`text-xs flex items-center gap-1 font-medium px-2 py-1 rounded-lg transition-colors ${item.convertedToTaskId ? 'text-gray-400 bg-gray-50 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800 bg-blue-50 opacity-0 group-hover:opacity-100'}`}
                              >
                                {item.convertedToTaskId ? <Check size={14} /> : <ArrowRightCircle size={14} />}
                                {item.convertedToTaskId ? 'Converted' : 'Convert to Task'}
                              </button>
                            )}
                            <button 
                              onClick={() => upvoteRetroNote(item.id)}
                              className="flex items-center gap-1.5 text-gray-500 hover:text-rose-500 transition-colors bg-gray-50 hover:bg-rose-50 px-2 py-1 rounded-lg"
                            >
                              <Heart size={14} className={item.votes > 0 ? 'fill-rose-500 text-rose-500' : ''} />
                              <span className="text-xs font-bold">{item.votes}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {addingToColumn === col.id ? (
                      <div className="bg-white p-3 rounded-xl shadow-sm border border-inherit">
                        <textarea 
                          autoFocus
                          value={newNoteText}
                          onChange={e => setNewNoteText(e.target.value)}
                          placeholder="Type your thought..."
                          className="w-full text-sm resize-none outline-none min-h-[60px]"
                          onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleAddNote(col.id);
                            }
                          }}
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <button 
                            onClick={() => setAddingToColumn(null)}
                            className="text-xs font-medium text-gray-500 hover:text-gray-700 px-2 py-1"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={() => handleAddNote(col.id)}
                            className={`text-xs font-medium px-3 py-1 rounded-lg text-white ${col.id === 'well' ? 'bg-emerald-600' : col.id === 'not-well' ? 'bg-red-600' : 'bg-blue-600'}`}
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setAddingToColumn(col.id)}
                        className="w-full py-3 border-2 border-dashed border-inherit rounded-xl flex items-center justify-center gap-2 text-sm font-medium opacity-60 hover:opacity-100 transition-opacity"
                      >
                        <Plus size={16} /> Add Item
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity Log Sidebar */}
        {showActivityLog && (
          <div className="w-80 border-l border-emerald-100 bg-emerald-50/30 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-emerald-100 flex items-center justify-between bg-white/50 backdrop-blur-sm">
              <h3 className="font-bold text-emerald-950 flex items-center gap-2">
                <ActivityIcon size={18} className="text-emerald-600" />
                Activity Log
              </h3>
              <button 
                onClick={() => setShowActivityLog(false)}
                className="text-emerald-400 hover:text-emerald-600"
              >
                <Plus size={20} className="rotate-45" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {state.activityLog.length === 0 ? (
                <div className="text-center py-12 text-emerald-600/50 text-sm">No activity recorded yet.</div>
              ) : (
                [...state.activityLog].reverse().map(activity => (
                  <div key={activity.id} className="bg-white p-4 rounded-2xl shadow-sm border border-emerald-100 hover:border-emerald-300 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                        <Clock size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-emerald-950 leading-tight mb-1">{activity.message}</p>
                        <div className="flex items-center justify-between text-[10px] text-emerald-600/60 font-bold uppercase tracking-wider">
                          <span>{activity.action}</span>
                          <span>{new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      {activeRetro && (
        <ConfirmationModal 
          isOpen={!!confirmDeleteNoteId}
          onClose={() => setConfirmDeleteNoteId(null)}
          onConfirm={() => confirmDeleteNoteId && handleDeleteRetroNote(confirmDeleteNoteId)}
          title="Delete Retro Note"
          message="Are you sure you want to delete this note? This action cannot be undone."
        />
      )}
    </div>
  );
}

function RotateCcwIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  )
}
