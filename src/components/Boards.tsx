import React, { useState } from 'react';
import { useSyncLogic } from '../context/SyncLogicContext';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import TaskModal from './modals/TaskModal';
import ConfirmationModal from './modals/ConfirmationModal';
import { TaskStatus, Task } from '../types';

const COLUMNS: { id: TaskStatus; title: string; limit: number | null }[] = [
  { id: 'New', title: 'New', limit: 5 },
  { id: 'Active', title: 'Active', limit: 3 },
  { id: 'Resolved', title: 'Resolved', limit: 5 },
  { id: 'Closed', title: 'Closed', limit: null },
];

export default function Boards() {
  const { state, moveTask, setWipLimit, updateTask, deleteTask } = useSyncLogic();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  
  const [quickEditTaskId, setQuickEditTaskId] = useState<string | null>(null);
  const [quickEditTitle, setQuickEditTitle] = useState('');

  const [confirmDeleteTaskId, setConfirmDeleteTaskId] = useState<string | null>(null);

  const filteredTasks = (state.tasks || []).filter(t => t.teamId === state.currentTeamId);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-700 border-red-200';
      case 'Medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Low': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (draggedTaskId) {
      moveTask(draggedTaskId, status);
      setDraggedTaskId(null);
    }
  };

  const openAddTask = () => {
    setEditingTask(null);
    setShowTaskModal(true);
  };

  const openEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleDeleteTask = (id: string) => {
    deleteTask(id);
  };

  const startQuickEdit = (task: Task) => {
    setQuickEditTaskId(task.id);
    setQuickEditTitle(task.title);
  };

  const saveQuickEdit = (task: Task) => {
    if (quickEditTitle.trim() && quickEditTitle !== task.title) {
      updateTask({ ...task, title: quickEditTitle });
    }
    setQuickEditTaskId(null);
  };

  const handleQuickEditKeyDown = (e: React.KeyboardEvent, task: Task) => {
    if (e.key === 'Enter') {
      saveQuickEdit(task);
    } else if (e.key === 'Escape') {
      setQuickEditTaskId(null);
    }
  };

  const renderTaskCard = (task: Task) => {
    const assignee = state.teams.flatMap(t => t.members).find(m => m.id === task.assigneeId);
    
    return (
      <div 
        key={task.id} 
        draggable
        onDragStart={(e) => handleDragStart(e, task.id)}
        className="bg-white p-4 rounded-xl shadow-sm border border-emerald-100 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing mb-3 group"
      >
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-mono font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{task.id}</span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={(e) => { e.stopPropagation(); openEditTask(task); }} className="text-gray-400 hover:text-emerald-600 p-1 rounded hover:bg-emerald-50">
              <Edit3 size={14} />
            </button>
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                setConfirmDeleteTaskId(task.id);
              }} 
              className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        
        {quickEditTaskId === task.id ? (
          <input
            autoFocus
            type="text"
            value={quickEditTitle}
            onChange={(e) => setQuickEditTitle(e.target.value)}
            onBlur={() => saveQuickEdit(task)}
            onKeyDown={(e) => handleQuickEditKeyDown(e, task)}
            className="w-full text-sm font-semibold text-gray-900 border border-emerald-300 rounded px-2 py-1 mb-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        ) : (
          <h4 
            className="font-medium text-gray-900 mb-3 leading-snug cursor-text hover:bg-emerald-50 rounded px-1 -mx-1"
            onClick={() => startQuickEdit(task)}
          >
            {task.title}
          </h4>
        )}
        
        <div className="flex items-center justify-between mt-auto">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
          {assignee && (
            <div className="flex items-center gap-2">
              <img src={assignee.avatar} alt={assignee.name} className="w-6 h-6 rounded-full border border-gray-200" title={assignee.name} />
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderColumn = (col: any, tasks: Task[]) => {
    const limit = col.id === 'Active' ? state.wipLimit : col.limit;
    const isOverLimit = limit && tasks.length > limit;
    
    return (
      <div 
        key={col.id} 
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, col.id)}
        className={`flex-1 min-w-[280px] rounded-2xl p-4 flex flex-col border ${isOverLimit ? 'bg-red-50/50 border-red-200' : 'bg-emerald-50/50 border-emerald-100/50'}`}
      >
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className={`font-semibold ${isOverLimit ? 'text-red-700' : 'text-emerald-950'}`}>{col.title}</h3>
          {limit && (
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${isOverLimit ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
              {tasks.length} / {limit}
            </span>
          )}
        </div>
        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
          {tasks.map(renderTaskCard)}
          {tasks.length === 0 && (
            <div className="h-24 border-2 border-dashed border-emerald-200/50 rounded-xl flex items-center justify-center text-emerald-400/50 text-sm font-medium">
              Drop tasks here
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="h-full flex flex-col bg-white">
        {/* Header */}
        <div className="px-8 py-6 border-b border-emerald-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold text-emerald-950">Sprint Board</h1>
            <p className="text-emerald-600 text-sm mt-1">Manage and track active work items.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 mr-4">
              <label className="text-sm font-medium text-emerald-800">Active WIP Limit:</label>
              <input 
                type="number" 
                min="1" 
                value={state.wipLimit} 
                onChange={(e) => setWipLimit(Number(e.target.value))}
                className="w-16 border border-emerald-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button 
              onClick={openAddTask}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-medium text-sm transition-colors shadow-sm shadow-emerald-200 flex items-center gap-2"
            >
              <Plus size={16} /> Create Issue
            </button>
          </div>
        </div>

        {/* Board Content */}
        <div className="flex-1 overflow-x-auto overflow-y-auto p-8">
          <div className="flex gap-6 h-full min-w-max">
            {COLUMNS.map(col => renderColumn(col, filteredTasks.filter(t => t.status === col.id && t.status !== 'Backlog')))}
          </div>
        </div>
      </div>
      
      {showTaskModal && <TaskModal onClose={() => setShowTaskModal(false)} editingTask={editingTask} />}
      <ConfirmationModal 
        isOpen={!!confirmDeleteTaskId}
        onClose={() => setConfirmDeleteTaskId(null)}
        onConfirm={() => confirmDeleteTaskId && handleDeleteTask(confirmDeleteTaskId)}
        title="Delete Task"
        message="Are you sure you want to permanently delete this task? This action cannot be undone."
      />
    </>
  );
}
