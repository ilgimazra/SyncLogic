import React from 'react';
import { useSyncLogic } from '../context/SyncLogicContext';
import { Undo2, X } from 'lucide-react';

export default function Toast() {
  const { toastMessage, undoAction } = useSyncLogic();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-emerald-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-4 border border-emerald-700">
        <span className="text-sm font-medium">{toastMessage}</span>
        {toastMessage !== 'Action undone' && (
          <button 
            onClick={undoAction}
            className="flex items-center gap-1.5 text-emerald-200 hover:text-white bg-emerald-800 hover:bg-emerald-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            <Undo2 size={14} /> Undo
          </button>
        )}
      </div>
    </div>
  );
}
