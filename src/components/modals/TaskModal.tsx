import React, { useState, useEffect } from 'react';
import { useSyncLogic } from '../../context/SyncLogicContext';
import { X } from 'lucide-react';
import { Priority, TaskStatus, Task } from '../../types';

export default function TaskModal({ onClose, defaultStatus = 'New', editingTask }: { onClose: () => void, defaultStatus?: TaskStatus, editingTask?: Task | null }) {
  const { state, addTask, updateTask } = useSyncLogic();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [effort, setEffort] = useState<number>(1);
  const [type, setType] = useState('Feature');

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description);
      setPriority(editingTask.priority);
      setAssigneeId(editingTask.assigneeId || '');
      setEffort(editingTask.effort);
      setType(editingTask.type);
    }
  }, [editingTask]);

  const currentTeam = state.teams.find(t => t.id === state.currentTeamId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingTask) {
      updateTask({
        ...editingTask,
        title,
        description,
        priority,
        assigneeId: assigneeId || null,
        effort,
        type
      });
    } else {
      addTask({
        id: `TASK-${Math.floor(Math.random() * 10000)}`,
        title,
        description,
        priority,
        assigneeId: assigneeId || null,
        status: defaultStatus,
        effort,
        sprintId: null,
        type
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-emerald-100 flex items-center justify-between bg-emerald-50">
          <h2 className="text-xl font-bold text-emerald-950">{editingTask ? 'Edit Task' : 'Add New Task'}</h2>
          <button onClick={onClose} className="text-emerald-600 hover:text-emerald-900 bg-emerald-100/50 hover:bg-emerald-200 p-2 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-emerald-900 mb-1">Title</label>
            <input 
              type="text" 
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full border border-emerald-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Task title..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-emerald-900 mb-1">Description</label>
            <textarea 
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full border border-emerald-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[80px]"
              placeholder="Task description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-emerald-900 mb-1">Priority</label>
              <select 
                value={priority}
                onChange={e => setPriority(e.target.value as Priority)}
                className="w-full border border-emerald-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-emerald-900 mb-1">Type</label>
              <select 
                value={type}
                onChange={e => setType(e.target.value)}
                className="w-full border border-emerald-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="Feature">Feature</option>
                <option value="Emergency">Emergency</option>
                <option value="Bug">Bug</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-emerald-900 mb-1">Assignee</label>
              <select 
                value={assigneeId}
                onChange={e => setAssigneeId(e.target.value)}
                className="w-full border border-emerald-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="">Unassigned</option>
                {currentTeam?.members.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-emerald-900 mb-1">Effort (Hours/Points)</label>
              <input 
                type="number" 
                min="1"
                value={effort}
                onChange={e => setEffort(Number(e.target.value))}
                className="w-full border border-emerald-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl font-medium text-emerald-700 hover:bg-emerald-50 transition-colors">
              Cancel
            </button>
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl font-medium transition-colors shadow-sm">
              {editingTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
