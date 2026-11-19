import React, { useState } from 'react';
import { useSyncLogic } from '../../context/SyncLogicContext';
import { X, Search, Plus, Edit3, Trash2 } from 'lucide-react';
import { Task } from '../../types';
import TaskModal from './TaskModal';

interface BacklogModalProps {
  onClose: () => void;
}

export default function BacklogModal({ onClose }: BacklogModalProps) {
  const { state, moveTask, deleteTask } = useSyncLogic();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);

  const backlogTasks = state.tasks.filter(t => t.status === 'Backlog' && t.teamId === state.currentTeamId);
  const filteredTasks = backlogTasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleAddToSprint = (taskId: string) => {
    moveTask(taskId, 'New');
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(taskId);
    }
  };

  const openEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-emerald-100 flex items-center justify-between bg-emerald-50">
          <h2 className="text-xl font-bold text-emerald-950">Product Backlog ({backlogTasks.length})</h2>
          <button onClick={onClose} className="text-emerald-600 hover:text-emerald-900 bg-emerald-100/50 hover:bg-emerald-200 p-2 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 flex flex-col">
          <div className="mb-6 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
            <input 
              type="text" 
              placeholder="Search backlog items..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-emerald-200 rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12 text-emerald-600/70 border-2 border-dashed border-emerald-100 rounded-xl">
                {searchQuery ? 'No items match your search.' : 'No items in backlog.'}
              </div>
            ) : (
              filteredTasks.map(task => (
                <div key={task.id} className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm hover:border-emerald-300 transition-colors flex items-center justify-between group">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{task.id}</span>
                      <span className="bg-gray-100 text-gray-600 text-xs font-bold px-1.5 py-0.5 rounded">
                        {task.effort} pts
                      </span>
                    </div>
                    <p className="text-sm font-medium text-emerald-950">{task.title}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleAddToSprint(task.id)}
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 border border-emerald-200"
                    >
                      <Plus size={14} /> Add to Sprint
                    </button>
                    <div className="flex items-center gap-1 ml-2 border-l border-emerald-100 pl-2">
                      <button onClick={(e) => { e.stopPropagation(); openEditTask(task); }} className="text-gray-400 hover:text-emerald-600 p-1.5 rounded-lg hover:bg-emerald-50 transition-colors">
                        <Edit3 size={16} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }} className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {showTaskModal && <TaskModal onClose={() => setShowTaskModal(false)} editingTask={editingTask} defaultStatus="Backlog" />}
    </div>
  );
}
