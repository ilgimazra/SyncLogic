import React, { useState } from 'react';
import { useSyncLogic } from '../context/SyncLogicContext';
import { GripVertical, ChevronRight, CheckCircle2, Circle, Clock, Plus, History, Trash2, Edit3, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import SprintModal from './modals/SprintModal';
import BacklogModal from './modals/BacklogModal';
import ConfirmationModal from './modals/ConfirmationModal';
import { TaskStatus, Sprint } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function Sprints() {
  const { state, moveTask, completeSprint, deleteSprint } = useSyncLogic();
  const [showSprintModal, setShowSprintModal] = useState(false);
  const [isBacklogModalOpen, setIsBacklogModalOpen] = useState(false);
  const [sprintToEdit, setSprintToEdit] = useState<Sprint | undefined>(undefined);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [viewHistory, setViewHistory] = useState(false);
  const [showInsights, setShowInsights] = useState(false);

  const [confirmDeleteSprintId, setConfirmDeleteSprintId] = useState<string | null>(null);
  const [confirmCompleteSprintId, setConfirmCompleteSprintId] = useState<string | null>(null);

  const filteredSprints = (state.sprints || []).filter(s => s.teamId === state.currentTeamId);
  const filteredTasks = (state.tasks || []).filter(t => t.teamId === state.currentTeamId);

  const activeSprint = filteredSprints.find(s => s.isActive);
  const completedSprints = filteredSprints.filter(s => !s.isActive);
  const backlogTasks = filteredTasks.filter(t => t.status === 'Backlog');
  const sprintTasks = filteredTasks.filter(t => t.status !== 'Backlog');

  const currentTeam = state.teams.find(t => t.id === state.currentTeamId);

  // Velocity Data (Mocked based on completed sprints)
  const velocityData = completedSprints.map(s => {
    const points = filteredTasks
      .filter(t => t.sprintId === s.id && (t.status === 'Resolved' || t.status === 'Closed'))
      .reduce((acc, t) => acc + t.effort, 0);
    return { name: s.name.split(' ')[1] || s.name, points };
  }).slice(-5);

  // Priority Distribution Data
  const priorityData = [
    { name: 'High', value: filteredTasks.filter(t => t.priority === 'High').length, color: '#ef4444' },
    { name: 'Medium', value: filteredTasks.filter(t => t.priority === 'Medium').length, color: '#f59e0b' },
    { name: 'Low', value: filteredTasks.filter(t => t.priority === 'Low').length, color: '#10b981' },
  ];

  // Calculate capacity
  const teamCapacity = currentTeam?.members.map(member => {
    const usedHours = sprintTasks
      .filter(t => t.assigneeId === member.id && t.status !== 'Closed' && t.status !== 'Resolved')
      .reduce((acc, t) => acc + t.effort, 0);
    return {
      user: member,
      usedHours,
      totalHours: member.capacity
    };
  }) || [];

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropToSprint = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedTaskId) {
      moveTask(draggedTaskId, 'New');
      setDraggedTaskId(null);
    }
  };

  const handleDropToBacklog = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedTaskId) {
      moveTask(draggedTaskId, 'Backlog');
      setDraggedTaskId(null);
    }
  };

  const handleCompleteSprint = () => {
    if (activeSprint) {
      setConfirmCompleteSprintId(activeSprint.id);
    }
  };

  const handleDeleteSprint = (id: string) => {
    deleteSprint(id);
  };

  const handleEditSprint = (sprint: Sprint) => {
    setSprintToEdit(sprint);
    setShowSprintModal(true);
  };

  const handleAddSprint = () => {
    setSprintToEdit(undefined);
    setShowSprintModal(true);
  };

  return (
    <>
      <div className="h-full flex flex-col bg-white">
        {/* Header */}
        <div className="px-8 py-6 border-b border-emerald-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-emerald-950">
                {showInsights ? 'Dashboard Insights' : (viewHistory ? 'Sprint History' : (activeSprint ? activeSprint.name : 'No Active Sprint'))}
              </h1>
              {!viewHistory && !showInsights && activeSprint && (
                <button 
                  onClick={() => handleEditSprint(activeSprint)}
                  className="text-emerald-500 hover:text-emerald-700 p-1 rounded-md hover:bg-emerald-50 transition-colors"
                >
                  <Edit3 size={18} />
                </button>
              )}
            </div>
            <p className="text-emerald-600 text-sm mt-1">
              {showInsights ? 'Visualizing team performance and metrics' : (viewHistory ? 'View completed sprints' : (activeSprint ? `${activeSprint.startDate} to ${activeSprint.endDate}` : 'Create a sprint to get started'))}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => { setShowInsights(!showInsights); setViewHistory(false); }}
              className={`px-4 py-2 rounded-xl font-medium text-sm transition-colors border flex items-center gap-2 ${showInsights ? 'bg-emerald-600 text-white border-emerald-600' : 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'}`}
            >
              <BarChart3 size={16} /> {showInsights ? 'Back to Sprint' : 'Insights'}
            </button>
            {!showInsights && (
              <button 
                onClick={() => { setViewHistory(!viewHistory); setShowInsights(false); }}
                className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl font-medium text-sm transition-colors border border-emerald-200 flex items-center gap-2"
              >
                <History size={16} /> {viewHistory ? 'Current Sprint' : 'History'}
              </button>
            )}
            {!viewHistory && !showInsights && (
              !activeSprint ? (
                <button 
                  onClick={handleAddSprint}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-medium text-sm transition-colors shadow-sm shadow-emerald-200 flex items-center gap-2"
                >
                  <Plus size={16} /> New Sprint
                </button>
              ) : (
                <button 
                  onClick={handleCompleteSprint}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-medium text-sm transition-colors shadow-sm shadow-emerald-200 flex items-center gap-2"
                >
                  <CheckCircle2 size={16} /> Complete Sprint
                </button>
              )
            )}
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Main Content */}
          <div 
            className="flex-1 overflow-y-auto p-8 border-r border-emerald-100"
            onDragOver={(!viewHistory && !showInsights) ? handleDragOver : undefined}
            onDrop={(!viewHistory && !showInsights) ? handleDropToSprint : undefined}
          >
            {showInsights ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Velocity Chart */}
                  <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                      <BarChart3 className="text-emerald-600" size={20} />
                      <h3 className="font-bold text-emerald-950">Weekly Completion Velocity</h3>
                    </div>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={velocityData.length > 0 ? velocityData : [{name: 'S1', points: 15}, {name: 'S2', points: 22}, {name: 'S3', points: 18}]}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0fdf4" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#065f46', fontSize: 12}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#065f46', fontSize: 12}} />
                          <Tooltip 
                            contentStyle={{backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #d1fae5', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                            cursor={{fill: '#f0fdf4'}}
                          />
                          <Bar dataKey="points" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Priority Distribution */}
                  <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                      <PieChartIcon className="text-emerald-600" size={20} />
                      <h3 className="font-bold text-emerald-950">Task Priority Distribution</h3>
                    </div>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={priorityData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {priorityData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #d1fae5'}}
                          />
                          <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: 'Total Tasks', value: filteredTasks.length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Completion Rate', value: `${Math.round((filteredTasks.filter(t => t.status === 'Closed' || t.status === 'Resolved').length / (filteredTasks.length || 1)) * 100)}%`, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Active Sprints', value: filteredSprints.filter(s => s.isActive).length, color: 'text-amber-600', bg: 'bg-amber-50' },
                  ].map((metric, i) => (
                    <div key={i} className={`${metric.bg} p-6 rounded-3xl border border-white shadow-sm`}>
                      <p className="text-sm font-bold text-gray-500 mb-1 uppercase tracking-wider">{metric.label}</p>
                      <p className={`text-3xl font-black ${metric.color}`}>{metric.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : viewHistory ? (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-emerald-900 mb-4">Completed Sprints</h2>
                {completedSprints.length === 0 ? (
                  <div className="text-center py-12 text-emerald-600/70">No completed sprints yet.</div>
                ) : (
                  completedSprints.map(sprint => (
                    <div key={sprint.id} className="border border-emerald-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                      <div className="bg-emerald-50/50 px-6 py-4 border-b border-emerald-100 flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-emerald-950 text-lg">{sprint.name}</h3>
                          <div className="text-sm text-emerald-600 mt-1">{sprint.startDate} to {sprint.endDate}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={(e) => { e.stopPropagation(); handleEditSprint(sprint); }} className="text-emerald-600 hover:bg-emerald-50 p-2 rounded-lg transition-colors">
                            <Edit3 size={18} />
                          </button>
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setConfirmDeleteSprintId(sprint.id);
                            }} 
                            className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                      <div className="p-6">
                        <p className="text-sm text-gray-700"><span className="font-semibold">Goal:</span> {sprint.goal}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-emerald-900">Sprint Tasks</h2>
                  <div className="flex gap-4 text-sm font-medium text-emerald-600">
                    <div className="flex items-center gap-1"><Circle size={14} /> To Do</div>
                    <div className="flex items-center gap-1"><Clock size={14} /> In Progress</div>
                    <div className="flex items-center gap-1"><CheckCircle2 size={14} /> Done</div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="border border-emerald-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                    <div className="bg-emerald-50/50 px-6 py-4 border-b border-emerald-100 flex items-start gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-emerald-950 text-lg">All Sprint Items</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-emerald-600">
                          <span>Total Effort: {sprintTasks.reduce((acc, t) => acc + t.effort, 0)} pts</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 grid grid-cols-3 gap-6 bg-emerald-50/20 min-h-[200px]">
                      {['New', 'Active', 'Resolved'].map(status => (
                        <div key={status} className="space-y-3">
                          <h4 className="text-sm font-bold text-emerald-800 mb-2">{status}</h4>
                          {sprintTasks.filter(t => t.status === status).map(task => (
                            <div 
                              key={task.id} 
                              draggable
                              onDragStart={(e) => handleDragStart(e, task.id)}
                              className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-mono text-emerald-50">{task.id}</span>
                                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full">
                                  {task.effort}
                                </span>
                              </div>
                              <p className="text-sm font-medium text-gray-800">{task.title}</p>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Sidebar - Backlog & Capacity */}
          <div className="w-80 bg-emerald-50/30 flex flex-col overflow-y-auto">
            {/* Capacity Tracker */}
            <div className="p-6 border-b border-emerald-100">
              <h3 className="font-bold text-emerald-900 mb-4">Team Capacity</h3>
              <div className="space-y-4">
                {teamCapacity.map(cap => {
                  const percentage = (cap.usedHours / cap.totalHours) * 100;
                  const isOverloaded = percentage > 100;
                  return (
                    <div key={cap.user.id} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <img src={cap.user.avatar} alt={cap.user.name} className="w-6 h-6 rounded-full" />
                          <span className="font-medium text-emerald-950">{cap.user.name}</span>
                        </div>
                        <span className={`font-semibold ${isOverloaded ? 'text-red-600' : 'text-emerald-600'}`}>
                          {cap.usedHours}/{cap.totalHours}h
                        </span>
                      </div>
                      <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${isOverloaded ? 'bg-red-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Backlog Refinement */}
            <div 
              className="p-6 flex-1"
              onDragOver={handleDragOver}
              onDrop={handleDropToBacklog}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-emerald-900">Product Backlog</h3>
                <button 
                  onClick={() => setIsBacklogModalOpen(true)} 
                  className="text-emerald-600 hover:underline text-sm font-medium flex items-center"
                >
                  View All <ChevronRight size={16} />
                </button>
              </div>
              <p className="text-xs text-emerald-600 mb-4">Drag items to add to current sprint</p>
              <div className="space-y-3 min-h-[200px]">
                {backlogTasks.map(item => (
                  <div 
                    key={item.id} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.id)}
                    className="bg-white p-3 rounded-xl border border-emerald-200 shadow-sm flex items-start gap-3 cursor-grab active:cursor-grabbing hover:border-emerald-400 transition-colors"
                  >
                    <GripVertical size={16} className="text-emerald-300 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-mono text-emerald-500">{item.id}</span>
                        <span className="bg-gray-100 text-gray-600 text-xs font-bold px-1.5 py-0.5 rounded">
                          {item.effort} pts
                        </span>
                      </div>
                      <p className="text-sm font-medium text-emerald-950 leading-tight">{item.title}</p>
                    </div>
                  </div>
                ))}
                {backlogTasks.length === 0 && (
                  <div className="text-sm text-emerald-500/70 text-center py-8 border-2 border-dashed border-emerald-200 rounded-xl">
                    Backlog is empty
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {showSprintModal && <SprintModal onClose={() => setShowSprintModal(false)} sprintToEdit={sprintToEdit} />}
      {isBacklogModalOpen && <BacklogModal onClose={() => setIsBacklogModalOpen(false)} />}
      
      <ConfirmationModal 
        isOpen={!!confirmDeleteSprintId}
        onClose={() => setConfirmDeleteSprintId(null)}
        onConfirm={() => confirmDeleteSprintId && handleDeleteSprint(confirmDeleteSprintId)}
        title="Delete Sprint"
        message="Are you sure you want to delete this sprint? This will remove the sprint record but keep the tasks in the backlog."
      />

      <ConfirmationModal 
        isOpen={!!confirmCompleteSprintId}
        onClose={() => setConfirmCompleteSprintId(null)}
        onConfirm={() => confirmCompleteSprintId && completeSprint(confirmCompleteSprintId)}
        title="Complete Sprint"
        message="Are you sure you want to complete this sprint? All remaining tasks will be moved to the next sprint or backlog."
        type="warning"
        confirmText="Complete"
      />
    </>
  );
}
