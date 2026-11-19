import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { useSyncLogic } from '../../context/SyncLogicContext';

export default function ProjectSettingsModal({ onClose }: { onClose: () => void }) {
  const { state, updateProjectName, updateTheme } = useSyncLogic();
  const [projectName, setProjectName] = useState(state.projectName);
  const [description, setDescription] = useState('A high-fidelity project management tool.');
  const [theme, setTheme] = useState(state.theme);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProjectName(projectName);
    updateTheme(theme);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-emerald-100 flex items-center justify-between bg-emerald-50">
          <h2 className="text-xl font-bold text-emerald-950">Project Settings</h2>
          <button onClick={onClose} className="text-emerald-600 hover:text-emerald-900 bg-emerald-100/50 hover:bg-emerald-200 p-2 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-emerald-900 mb-1">Project Name</label>
            <input 
              type="text" 
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              className="w-full border border-emerald-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-emerald-900 mb-1">Description</label>
            <textarea 
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full border border-emerald-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[80px]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-emerald-900 mb-1">Theme</label>
            <select 
              value={theme}
              onChange={e => setTheme(e.target.value)}
              className="w-full border border-emerald-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="emerald">Emerald Green</option>
              <option value="ocean">Ocean Blue</option>
              <option value="sunset">Sunset Orange</option>
            </select>
          </div>

          <div className="pt-4 flex justify-between items-center border-t border-emerald-100 mt-6">
            <button 
              type="button" 
              onClick={() => {
                if(window.confirm("PERMANENT DELETE: This will wipe all data and reset to defaults. Are you sure?")) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="px-4 py-2 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-colors border border-red-100"
            >
              Hard Reset Database
            </button>
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl font-medium text-emerald-700 hover:bg-emerald-50 transition-colors">
                Cancel
              </button>
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl font-medium transition-colors shadow-sm flex items-center gap-2">
                <Save size={16} /> Save Settings
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
