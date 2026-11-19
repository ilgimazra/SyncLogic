import React, { useState, useEffect } from 'react';
import { useSyncLogic } from '../../context/SyncLogicContext';
import { X } from 'lucide-react';
import { Sprint } from '../../types';

interface SprintModalProps {
  onClose: () => void;
  sprintToEdit?: Sprint;
}

export default function SprintModal({ onClose, sprintToEdit }: SprintModalProps) {
  const { addSprint, updateSprint } = useSyncLogic();
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [goal, setGoal] = useState('');

  useEffect(() => {
    if (sprintToEdit) {
      setName(sprintToEdit.name);
      setStartDate(sprintToEdit.startDate);
      setEndDate(sprintToEdit.endDate);
      setGoal(sprintToEdit.goal);
    }
  }, [sprintToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !startDate || !endDate) return;

    if (sprintToEdit) {
      updateSprint({
        ...sprintToEdit,
        name,
        startDate,
        endDate,
        goal
      });
    } else {
      addSprint({
        id: `SPRINT-${Date.now()}`,
        name,
        startDate,
        endDate,
        goal,
        isActive: true
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-emerald-100 flex items-center justify-between bg-emerald-50">
          <h2 className="text-xl font-bold text-emerald-950">{sprintToEdit ? 'Edit Sprint' : 'Create New Sprint'}</h2>
          <button onClick={onClose} className="text-emerald-600 hover:text-emerald-900 bg-emerald-100/50 hover:bg-emerald-200 p-2 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-emerald-900 mb-1">Sprint Name</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border border-emerald-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g., Sprint 43"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-emerald-900 mb-1">Start Date</label>
              <input 
                type="date" 
                required
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full border border-emerald-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-emerald-900 mb-1">End Date</label>
              <input 
                type="date" 
                required
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full border border-emerald-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-emerald-900 mb-1">Sprint Goal</label>
            <textarea 
              value={goal}
              onChange={e => setGoal(e.target.value)}
              className="w-full border border-emerald-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[80px]"
              placeholder="What is the main objective of this sprint?"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl font-medium text-emerald-700 hover:bg-emerald-50 transition-colors">
              Cancel
            </button>
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl font-medium transition-colors shadow-sm">
              {sprintToEdit ? 'Save Changes' : 'Start Sprint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
