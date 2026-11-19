import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AppState, Team, Task, Sprint, RetroSession, RetroNote, User, TaskStatus, Activity, MeetingNote, MeetingSummary } from '../types';

interface SyncLogicContextType {
  state: AppState;
  setCurrentTeam: (id: string | null) => void;
  updateProjectName: (name: string) => void;
  updateTheme: (theme: string) => void;
  addTeam: (team: Team) => void;
  updateTeam: (team: Team) => void;
  deleteTeam: (id: string) => void;
  deleteMember: (teamId: string, memberId: string) => void;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, newStatus: TaskStatus) => void;
  setWipLimit: (limit: number) => void;
  addSprint: (sprint: Sprint) => void;
  updateSprint: (sprint: Sprint) => void;
  deleteSprint: (id: string) => void;
  completeSprint: (id: string) => void;
  addRetro: (retro: RetroSession) => void;
  addRetroNote: (note: RetroNote) => void;
  updateRetroNote: (note: RetroNote) => void;
  deleteRetroNote: (id: string) => void;
  upvoteRetroNote: (noteId: string) => void;
  convertNoteToTask: (noteId: string, task: Task) => void;
  addMeetingNote: (note: MeetingNote) => void;
  addMeetingSummary: (summary: MeetingSummary) => void;
  clearMeetingNotes: (teamId: string) => void;
  clearNotifications: () => void;
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp' | 'teamId'>) => void;
  undoAction: () => void;
  hardResetDatabase: () => void;
  getRandomAvatar: (id: string) => string;
  toastMessage: string | null;
}

const DB_KEY = 'SYNCLOGIC_PROFESSIONAL_V8';

const getRandomAvatar = (id: string) => {
  // Use a deterministic but varied set of professional portraits from randomuser.me
  const genders = ['men', 'women'];
  const gender = genders[Math.abs(id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 2];
  const portraitId = Math.abs(id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 99;
  return `https://randomuser.me/api/portraits/${gender}/${portraitId}.jpg`;
};

const initialState: AppState = {
  projectName: 'SyncLogic',
  theme: 'emerald',
  teams: [
    {
      id: 'nexus-ai',
      name: 'NexusAI Graduation Project',
      members: [
        { id: 'u1', name: 'Ilgım Azra Gündüz', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', capacity: 40 },
        { id: 'u2', name: 'Sude Şimşek', avatar: 'https://randomuser.me/api/portraits/women/68.jpg', capacity: 40 },
      ]
    },
    {
      id: 'marmara-ybs',
      name: 'Marmara YBS Development Team',
      members: [
        { id: 'u3', name: 'Alice Chen', avatar: 'https://randomuser.me/api/portraits/women/26.jpg', capacity: 40 },
        { id: 'u4', name: 'Bob Smith', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', capacity: 40 },
        { id: 'u5', name: 'Charlie Davis', avatar: 'https://randomuser.me/api/portraits/men/85.jpg', capacity: 40 },
      ]
    },
    {
      id: 'logistics',
      name: 'Global Logistics Logic',
      members: [
        { id: 'u6', name: 'David Lee', avatar: 'https://randomuser.me/api/portraits/men/22.jpg', capacity: 40 },
        { id: 'u7', name: 'Emma Watson', avatar: 'https://randomuser.me/api/portraits/women/17.jpg', capacity: 40 },
      ]
    }
  ],
  currentTeamId: null,
  tasks: [
    // TEAM: NexusAI Graduation Project (nexus-ai)
    { id: 'TASK-101', title: 'SQL Query Optimization for Dashboard', description: 'Improve query performance for large datasets in the main analytics view.', priority: 'High', assigneeId: 'u1', status: 'Active', effort: 8, sprintId: 's1', type: 'Feature', teamId: 'nexus-ai' },
    { id: 'TASK-102', title: 'Gemini 1.5 Flash API Integration', description: 'Integrate and test the new Gemini 1.5 Flash API for intelligent task suggestions.', priority: 'High', assigneeId: 'u2', status: 'New', effort: 5, sprintId: 's1', type: 'Feature', teamId: 'nexus-ai' },
    { id: 'TASK-103', title: 'Figma UI Prototyping - High Fidelity', description: 'Finalize the high-fidelity prototypes for the mobile view.', priority: 'Medium', assigneeId: 'u1', status: 'Resolved', effort: 3, sprintId: 's1', type: 'Feature', teamId: 'nexus-ai' },
    { id: 'TASK-104', title: 'Balsamiq Wireframes for Admin Panel', description: 'Create initial low-fidelity wireframes for the admin settings page.', priority: 'Low', assigneeId: 'u2', status: 'Closed', effort: 2, sprintId: 's1', type: 'Feature', teamId: 'nexus-ai' },
    { id: 'TASK-105', title: 'Business Requirements Document (BRD)', description: 'Finalize the BRD with all stakeholders.', priority: 'Medium', assigneeId: 'u1', status: 'New', effort: 5, sprintId: 's1', type: 'Feature', teamId: 'nexus-ai' },
    { id: 'TASK-111', title: 'User Authentication Flow', description: 'Implement the login and signup flows using Firebase Auth.', priority: 'High', assigneeId: 'u2', status: 'New', effort: 8, sprintId: 's1', type: 'Feature', teamId: 'nexus-ai' },
    { id: 'TASK-112', title: 'API Documentation with Swagger', description: 'Generate and host API documentation for the backend services.', priority: 'Medium', assigneeId: 'u1', status: 'Active', effort: 5, sprintId: 's1', type: 'Feature', teamId: 'nexus-ai' },
    { id: 'TASK-113', title: 'Unit Testing for Core Logic', description: 'Write unit tests for the task synchronization engine.', priority: 'Medium', assigneeId: 'u2', status: 'Resolved', effort: 5, sprintId: 's1', type: 'Bug', teamId: 'nexus-ai' },
    { id: 'TASK-114', title: 'Initial Repository Setup', description: 'Setup the monorepo structure and CI/CD pipelines.', priority: 'Low', assigneeId: 'u1', status: 'Closed', effort: 3, sprintId: 's1', type: 'Feature', teamId: 'nexus-ai' },
    
    // Backlog for NexusAI (15+ items)
    { id: 'TASK-B1', title: 'Dark Mode Support', description: 'Implement dark mode across all components.', priority: 'Low', assigneeId: null, status: 'Backlog', effort: 5, sprintId: null, type: 'Feature', teamId: 'nexus-ai' },
    { id: 'TASK-B2', title: 'Mobile App Push Notifications', description: 'Setup FCM for push notifications.', priority: 'Medium', assigneeId: null, status: 'Backlog', effort: 8, sprintId: null, type: 'Feature', teamId: 'nexus-ai' },
    { id: 'TASK-B3', title: 'Export to CSV/PDF', description: 'Add export functionality for reports.', priority: 'Low', assigneeId: null, status: 'Backlog', effort: 3, sprintId: null, type: 'Feature', teamId: 'nexus-ai' },
    { id: 'TASK-B4', title: 'Real-time Chat Integration', description: 'Add a team chat feature using WebSockets.', priority: 'Medium', assigneeId: null, status: 'Backlog', effort: 13, sprintId: null, type: 'Feature', teamId: 'nexus-ai' },
    { id: 'TASK-B5', title: 'Performance Monitoring', description: 'Integrate Sentry for error tracking.', priority: 'Medium', assigneeId: null, status: 'Backlog', effort: 5, sprintId: null, type: 'Feature', teamId: 'nexus-ai' },
    { id: 'TASK-B6', title: 'User Profile Customization', description: 'Allow users to update avatars and bios.', priority: 'Low', assigneeId: null, status: 'Backlog', effort: 3, sprintId: null, type: 'Feature', teamId: 'nexus-ai' },
    { id: 'TASK-B7', title: 'Multi-language Support (i18n)', description: 'Add support for Turkish and German.', priority: 'Medium', assigneeId: null, status: 'Backlog', effort: 8, sprintId: null, type: 'Feature', teamId: 'nexus-ai' },
    { id: 'TASK-B8', title: 'Advanced Search Filters', description: 'Implement complex filtering for tasks.', priority: 'Medium', assigneeId: null, status: 'Backlog', effort: 5, sprintId: null, type: 'Feature', teamId: 'nexus-ai' },
    { id: 'TASK-B9', title: 'Slack Integration', description: 'Send task updates to Slack channels.', priority: 'Low', assigneeId: null, status: 'Backlog', effort: 5, sprintId: null, type: 'Feature', teamId: 'nexus-ai' },
    { id: 'TASK-B10', title: 'Automated Database Backups', description: 'Setup daily backups for the production DB.', priority: 'High', assigneeId: null, status: 'Backlog', effort: 8, sprintId: null, type: 'Feature', teamId: 'nexus-ai' },
    { id: 'TASK-B11', title: 'Onboarding Tutorial', description: 'Create an interactive guide for new users.', priority: 'Medium', assigneeId: null, status: 'Backlog', effort: 5, sprintId: null, type: 'Feature', teamId: 'nexus-ai' },
    { id: 'TASK-B12', title: 'Custom Field Support', description: 'Allow teams to add custom fields to tasks.', priority: 'Low', assigneeId: null, status: 'Backlog', effort: 13, sprintId: null, type: 'Feature', teamId: 'nexus-ai' },
    { id: 'TASK-B13', title: 'Email Notification Templates', description: 'Design responsive email templates.', priority: 'Low', assigneeId: null, status: 'Backlog', effort: 3, sprintId: null, type: 'Feature', teamId: 'nexus-ai' },
    { id: 'TASK-B14', title: 'Third-party Calendar Sync', description: 'Sync deadlines with Google/Outlook calendars.', priority: 'Medium', assigneeId: null, status: 'Backlog', effort: 8, sprintId: null, type: 'Feature', teamId: 'nexus-ai' },
    { id: 'TASK-B15', title: 'Security Audit & Hardening', description: 'Perform a full security review of the app.', priority: 'High', assigneeId: null, status: 'Backlog', effort: 13, sprintId: null, type: 'Emergency', teamId: 'nexus-ai' },
    { id: 'TASK-B16', title: 'Refactor State Management', description: 'Optimize context usage to prevent re-renders.', priority: 'Medium', assigneeId: null, status: 'Backlog', effort: 8, sprintId: null, type: 'Bug', teamId: 'nexus-ai' },

    // TEAM: Marmara YBS Development Team (marmara-ybs)
    { id: 'TASK-201', title: 'Data Mining Algorithm Selection', description: 'Evaluate algorithms for customer segmentation.', priority: 'High', assigneeId: 'u3', status: 'Active', effort: 8, sprintId: 's2', type: 'Feature', teamId: 'marmara-ybs' },
    { id: 'TASK-202', title: 'Supply Chain Logic Mapping', description: 'Map out the current supply chain processes.', priority: 'Medium', assigneeId: 'u4', status: 'New', effort: 5, sprintId: 's2', type: 'Feature', teamId: 'marmara-ybs' },
    { id: 'TASK-203', title: 'Excel Macro Automation', description: 'Automate the weekly sales report generation.', priority: 'Low', assigneeId: 'u5', status: 'Resolved', effort: 3, sprintId: 's2', type: 'Feature', teamId: 'marmara-ybs' },
    { id: 'TASK-204', title: 'Data Cleaning Script', description: 'Write Python script to clean raw data.', priority: 'Medium', assigneeId: 'u3', status: 'Active', effort: 5, sprintId: 's2', type: 'Feature', teamId: 'marmara-ybs' },
    { id: 'TASK-205', title: 'Bottleneck Analysis', description: 'Identify key bottlenecks in delivery.', priority: 'High', assigneeId: 'u4', status: 'New', effort: 8, sprintId: 's2', type: 'Emergency', teamId: 'marmara-ybs' },
    { id: 'TASK-206', title: 'VBA Refactoring', description: 'Refactor legacy VBA code.', priority: 'Medium', assigneeId: 'u5', status: 'Closed', effort: 5, sprintId: 's2', type: 'Bug', teamId: 'marmara-ybs' },
    { id: 'TASK-207', title: 'Predictive Model Training', description: 'Train the model on historical data.', priority: 'High', assigneeId: 'u3', status: 'Backlog', effort: 13, sprintId: null, type: 'Feature', teamId: 'marmara-ybs' },
    { id: 'TASK-208', title: 'Customer Segmentation Analysis', description: 'Analyze customer behavior for targeted marketing.', priority: 'Medium', assigneeId: 'u4', status: 'New', effort: 5, sprintId: 's2', type: 'Feature', teamId: 'marmara-ybs' },
    { id: 'TASK-209', title: 'Inventory Optimization Model', description: 'Develop a model to minimize stockouts.', priority: 'High', assigneeId: 'u5', status: 'Active', effort: 8, sprintId: 's2', type: 'Feature', teamId: 'marmara-ybs' },
    { id: 'TASK-210', title: 'Dashboard Visualization with PowerBI', description: 'Create interactive dashboards for management.', priority: 'Medium', assigneeId: 'u3', status: 'New', effort: 5, sprintId: 's2', type: 'Feature', teamId: 'marmara-ybs' },
    
    // TEAM: Global Logistics Logic (logistics)
    { id: 'TASK-301', title: 'Fleet Tracking GPS Integration', description: 'Integrate with third-party GPS API.', priority: 'High', assigneeId: 'u6', status: 'Active', effort: 8, sprintId: 's3', type: 'Feature', teamId: 'logistics' },
    { id: 'TASK-302', title: 'API Webhooks for Updates', description: 'Implement webhooks for delivery status.', priority: 'Medium', assigneeId: 'u7', status: 'New', effort: 5, sprintId: 's3', type: 'Feature', teamId: 'logistics' },
    { id: 'TASK-303', title: 'Route Optimization Testing', description: 'Write tests for the routing engine.', priority: 'Low', assigneeId: 'u6', status: 'Resolved', effort: 3, sprintId: 's3', type: 'Bug', teamId: 'logistics' },
    { id: 'TASK-304', title: 'Real-time Map Rendering', description: 'Render vehicle locations on the map.', priority: 'High', assigneeId: 'u7', status: 'Active', effort: 8, sprintId: 's3', type: 'Feature', teamId: 'logistics' },
    { id: 'TASK-305', title: 'Webhook Retry Mechanism', description: 'Implement exponential backoff.', priority: 'Medium', assigneeId: 'u6', status: 'New', effort: 5, sprintId: 's3', type: 'Emergency', teamId: 'logistics' },
    { id: 'TASK-306', title: 'Jest Setup', description: 'Configure Jest for frontend testing.', priority: 'Low', assigneeId: 'u7', status: 'Closed', effort: 2, sprintId: 's3', type: 'Feature', teamId: 'logistics' },
  ],
  sprints: [
    { id: 's1', name: 'Sprint 1 - MVP Foundation', startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], goal: 'Establish core MVP features and database schema.', isActive: true, teamId: 'nexus-ai' },
    { id: 's1-old', name: 'Sprint 0 - Initial Setup', startDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], goal: 'Project initialization and environment setup.', isActive: false, teamId: 'nexus-ai' },
    { id: 's2', name: 'Sprint 1 - Data Pipelines', startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], endDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], goal: 'Setup initial data pipelines and macro automation.', isActive: true, teamId: 'marmara-ybs' },
    { id: 's3', name: 'Sprint 1 - Core Logistics', startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], goal: 'Integrate GPS and basic webhook functionality.', isActive: true, teamId: 'logistics' }
  ],
  retros: [
    { id: 'r1', sprintId: 's0', name: 'Sprint 0 Retro', date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), teamId: 'nexus-ai', isActive: false },
    { id: 'r2', sprintId: 's0', name: 'Sprint 0.5 Retro', date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), teamId: 'nexus-ai', isActive: false },
    { id: 'r3', sprintId: 's1', name: 'Sprint 1 Retro', date: new Date().toISOString(), teamId: 'nexus-ai', isActive: true },
    { id: 'r4', name: 'Academic Research Retro', date: new Date().toISOString(), teamId: 'marmara-ybs', isActive: true },
    { id: 'r5', name: 'Logistics Optimization Retro', date: new Date().toISOString(), teamId: 'logistics', isActive: true }
  ],
  retroNotes: [
    // Current Retro (r3) - 5+ notes per column
    { id: 'rn1', column: 'well', text: 'Figma prototype done ahead of schedule.', author: 'Ilgım Azra Gündüz', votes: 4, teamId: 'nexus-ai' },
    { id: 'rn2', column: 'well', text: 'Great collaboration on the database schema design.', author: 'Sude Şimşek', votes: 3, teamId: 'nexus-ai' },
    { id: 'rn3', column: 'well', text: 'Daily standups were kept under 15 minutes.', author: 'Ilgım Azra Gündüz', votes: 2, teamId: 'nexus-ai' },
    { id: 'rn4', column: 'well', text: 'Successfully integrated the first mock API endpoint.', author: 'Sude Şimşek', votes: 5, teamId: 'nexus-ai' },
    { id: 'rn13', column: 'well', text: 'Team spirit is high after the successful demo.', author: 'Ilgım Azra Gündüz', votes: 6, teamId: 'nexus-ai' },
    
    { id: 'rn5', column: 'not-well', text: 'SQL performance issue on large datasets.', author: 'Sude Şimşek', votes: 3, teamId: 'nexus-ai' },
    { id: 'rn6', column: 'not-well', text: 'Figma designs changed mid-sprint causing rework.', author: 'Ilgım Azra Gündüz', votes: 4, teamId: 'nexus-ai' },
    { id: 'rn7', column: 'not-well', text: 'Test environments were unstable for 2 days.', author: 'Sude Şimşek', votes: 2, teamId: 'nexus-ai' },
    { id: 'rn8', column: 'not-well', text: 'Unclear acceptance criteria on the reporting task.', author: 'Ilgım Azra Gündüz', votes: 1, teamId: 'nexus-ai' },
    { id: 'rn14', column: 'not-well', text: 'Communication gap regarding API endpoint changes.', author: 'Sude Şimşek', votes: 3, teamId: 'nexus-ai' },
    
    { id: 'rn9', column: 'action', text: 'Schedule Peer Review for the database schema.', author: 'Ilgım Azra Gündüz', votes: 2, teamId: 'nexus-ai' },
    { id: 'rn10', column: 'action', text: 'Lock Figma designs before sprint planning.', author: 'Sude Şimşek', votes: 4, teamId: 'nexus-ai' },
    { id: 'rn11', column: 'action', text: 'Investigate dedicated staging server options.', author: 'Ilgım Azra Gündüz', votes: 3, teamId: 'nexus-ai' },
    { id: 'rn12', column: 'action', text: 'Add "Definition of Ready" checklist to Jira.', author: 'Sude Şimşek', votes: 5, teamId: 'nexus-ai' },
    { id: 'rn15', column: 'action', text: 'Refactor the SQL queries identified as slow.', author: 'Ilgım Azra Gündüz', votes: 4, teamId: 'nexus-ai' },

    // Marmara YBS Development Team (marmara-ybs)
    { id: 'rn-m1', column: 'well', text: 'Survey data collection reached 500+ valid participants', author: 'Alice Chen', votes: 8, teamId: 'marmara-ybs', retroId: 'r4' },
    { id: 'rn-m2', column: 'well', text: 'Initial SQL database schema for the research project is finalized', author: 'Bob Smith', votes: 5, teamId: 'marmara-ybs', retroId: 'r4' },
    { id: 'rn-m3', column: 'well', text: 'SPSS regression analysis results are consistent', author: 'Alice Chen', votes: 4, teamId: 'marmara-ybs', retroId: 'r4' },
    { id: 'rn-m4', column: 'not-well', text: 'Difficulties in finding recent academic sources for the literature review', author: 'Charlie Davis', votes: 6, teamId: 'marmara-ybs', retroId: 'r4' },
    { id: 'rn-m5', column: 'not-well', text: 'Project report formatting is not yet aligned with APA 7th edition', author: 'Alice Chen', votes: 3, teamId: 'marmara-ybs', retroId: 'r4' },
    { id: 'rn-m6', column: 'action', text: 'Standardize the bibliography section', author: 'Bob Smith', votes: 2, teamId: 'marmara-ybs', retroId: 'r4' },
    { id: 'rn-m7', column: 'action', text: 'Schedule a group meeting to finalize the UI wireframes in Balsamiq', author: 'Alice Chen', votes: 5, teamId: 'marmara-ybs', retroId: 'r4' },

    // Global Logistics Logic (logistics)
    { id: 'rn-l1', column: 'well', text: 'Real-time fleet tracking API successfully integrated with < 100ms latency', author: 'David Lee', votes: 12, teamId: 'logistics', retroId: 'r5' },
    { id: 'rn-l2', column: 'well', text: 'Route optimization algorithm reduced fuel estimation error by 15%', author: 'Emma Watson', votes: 9, teamId: 'logistics', retroId: 'r5' },
    { id: 'rn-l3', column: 'not-well', text: 'Missing documentation for edge-case delivery failure webhooks', author: 'David Lee', votes: 4, teamId: 'logistics', retroId: 'r5' },
    { id: 'rn-l4', column: 'not-well', text: 'Map markers are clustering too tightly on the mobile dashboard view', author: 'Emma Watson', votes: 7, teamId: 'logistics', retroId: 'r5' },
    { id: 'rn-l5', column: 'action', text: 'Implement marker clustering logic for Google Maps API', author: 'David Lee', votes: 6, teamId: 'logistics', retroId: 'r5' },
    { id: 'rn-l6', column: 'action', text: 'Write comprehensive unit tests for the logistics notification service', author: 'Emma Watson', votes: 3, teamId: 'logistics', retroId: 'r5' }
  ],
  activityLog: [
    { id: 'a1', user: 'Ilgım Azra Gündüz', action: 'added', target: 'TASK-101', message: 'Ilgım Azra Gündüz added TASK-101', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), teamId: 'nexus-ai' },
    { id: 'a2', user: 'Sude Şimşek', action: 'completed', target: 'Retro item', message: 'Sude Şimşek completed Retro item', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), teamId: 'nexus-ai' },
  ],
  meetingNotes: [
    // NexusAI Notes
    { id: 'mn1', member: 'Ilgım Azra Gündüz', text: 'We need to finalize the SQL schema by Friday.', timestamp: new Date(Date.now() - 3600000).toISOString(), teamId: 'nexus-ai' },
    { id: 'mn2', member: 'Sude Şimşek', text: 'I will start the Gemini API integration tomorrow.', timestamp: new Date(Date.now() - 3000000).toISOString(), teamId: 'nexus-ai' },
    { id: 'mn3', member: 'Ilgım Azra Gündüz', text: 'Action item: Finalize the BRD by Friday.', timestamp: new Date(Date.now() - 2400000).toISOString(), teamId: 'nexus-ai' },
    { id: 'mn4', member: 'Sude Şimşek', text: 'Need to review the Figma prototypes with the mentor.', timestamp: new Date(Date.now() - 1800000).toISOString(), teamId: 'nexus-ai' },
    
    // Marmara YBS Notes
    { id: 'mn5', member: 'Alice Chen', text: 'Alice presented the initial findings from the customer segmentation analysis.', timestamp: new Date(Date.now() - 7200000).toISOString(), teamId: 'marmara-ybs' },
    { id: 'mn6', member: 'Bob Smith', text: 'Bob highlighted a potential bottleneck in the supply chain logic.', timestamp: new Date(Date.now() - 6600000).toISOString(), teamId: 'marmara-ybs' },
    { id: 'mn7', member: 'Charlie Davis', text: 'Charlie confirmed that the Excel macros are now fully automated.', timestamp: new Date(Date.now() - 6000000).toISOString(), teamId: 'marmara-ybs' },
    { id: 'mn8', member: 'Alice Chen', text: 'Next meeting will focus on the predictive model training results.', timestamp: new Date(Date.now() - 5400000).toISOString(), teamId: 'marmara-ybs' }
  ],
  meetingSummaries: [
    {
      id: 'ms1',
      teamId: 'nexus-ai',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      text: '### Key Decisions\n- Use Gemini 1.5 Flash for AI features.\n- Database schema finalized.\n\n### Action Items\n- [ ] Finalize BRD (Ilgım)\n- [ ] Review Figma prototypes (Sude)\n\n### Next Steps\n- Sprint 2 planning on Monday.'
    },
    {
      id: 'ms2',
      teamId: 'marmara-ybs',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      text: '### Key Decisions\n- Customer segmentation will use K-means clustering.\n- Supply chain logic needs a deep dive.\n\n### Action Items\n- [ ] Map out supply chain processes (Bob)\n- [ ] Train predictive model (Alice)\n\n### Next Steps\n- Presentation to stakeholders next week.'
    }
  ],
  wipLimit: 3,
  hasNewNotifications: false,
};

const SyncLogicContext = createContext<SyncLogicContextType | undefined>(undefined);

export const SyncLogicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const saveToDB = (newData: AppState) => {
    localStorage.setItem(DB_KEY, JSON.stringify(newData));
  };

  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(DB_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        
        // Migrate branding
        if (parsed.projectName === 'SyncLogic Dashboard') {
          parsed.projectName = 'SyncLogic';
        }

        if (parsed.teams && parsed.teams.length > 0) {
          return {
            ...initialState,
            ...parsed,
            projectName: parsed.projectName || initialState.projectName,
            teams: parsed.teams || initialState.teams,
            tasks: parsed.tasks || initialState.tasks,
            sprints: parsed.sprints || initialState.sprints,
            retros: parsed.retros || initialState.retros,
            retroNotes: parsed.retroNotes || initialState.retroNotes,
            activityLog: parsed.activityLog || initialState.activityLog,
            meetingNotes: parsed.meetingNotes || initialState.meetingNotes,
            meetingSummaries: parsed.meetingSummaries || initialState.meetingSummaries,
          };
        }
      } catch (e) {
        console.error('Failed to parse local storage', e);
      }
    }
    return initialState;
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const undoStack = useRef<AppState[]>([]);
  const toastTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    saveToDB(state);
  }, [state]);

  const hardResetDatabase = () => {
    localStorage.removeItem(DB_KEY);
    window.location.reload();
  };

  const addActivity = (activity: Omit<Activity, 'id' | 'timestamp' | 'teamId' | 'message'>) => {
    const message = `${activity.user} ${activity.action} ${activity.target}`;
    const newActivity: Activity = {
      ...activity,
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      teamId: state.currentTeamId || 'global',
      message,
    };
    setState(s => ({ ...s, activityLog: [newActivity, ...s.activityLog].slice(0, 50) }));
  };

  const saveStateForUndo = (message: string) => {
    undoStack.current.push(state);
    if (undoStack.current.length > 10) undoStack.current.shift(); // keep last 10
    setToastMessage(message);
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    toastTimeout.current = setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  const undoAction = () => {
    if (undoStack.current.length > 0) {
      const previousState = undoStack.current.pop();
      if (previousState) {
        setState(previousState);
        setToastMessage('Action undone');
        if (toastTimeout.current) clearTimeout(toastTimeout.current);
        toastTimeout.current = setTimeout(() => setToastMessage(null), 3000);
      }
    }
  };

  const updateProjectName = (name: string) => setState(s => ({ ...s, projectName: name }));
  const updateTheme = (theme: string) => setState(s => ({ ...s, theme }));
  const setCurrentTeam = (id: string | null) => setState(s => ({ ...s, currentTeamId: id }));
  const addTeam = (team: Team) => {
    const message = `System created team ${team.name}`;
    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      teamId: state.currentTeamId || 'global',
      user: 'System',
      action: 'created',
      target: `team ${team.name}`,
      message,
    };
    setState(s => ({ 
      ...s, 
      teams: [...s.teams, team],
      activityLog: [newActivity, ...s.activityLog].slice(0, 50)
    }));
  };
  const updateTeam = (team: Team) => setState(s => ({ ...s, teams: s.teams.map(t => t.id === team.id ? team : t) }));
  const deleteTeam = (id: string) => {
    saveStateForUndo('Team deleted');
    setState(s => ({
      ...s,
      teams: s.teams.filter(t => t.id !== id),
      currentTeamId: s.currentTeamId === id ? null : s.currentTeamId,
      tasks: s.tasks.filter(t => t.teamId !== id),
      sprints: s.sprints.filter(sp => sp.teamId !== id),
      retroNotes: s.retroNotes.filter(rn => rn.teamId !== id)
    }));
  };

  const deleteMember = (teamId: string, memberId: string) => {
    saveStateForUndo('Member deleted');
    setState(s => ({
      ...s,
      teams: s.teams.map(t => 
        t.id === teamId 
          ? { ...t, members: t.members.filter(m => m.id !== memberId) }
          : t
      ),
      tasks: s.tasks.map(task => 
        task.assigneeId === memberId ? { ...task, assigneeId: undefined } : task
      )
    }));
  };
  
  const addTask = (task: Task) => {
    const message = `User added ${task.id}`;
    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      teamId: state.currentTeamId || 'global',
      user: 'User',
      action: 'added',
      target: task.id,
      message,
    };
    setState(s => ({ 
      ...s, 
      tasks: [...s.tasks, { ...task, teamId: s.currentTeamId || task.teamId }],
      activityLog: [newActivity, ...s.activityLog].slice(0, 50)
    }));
  };
  const updateTask = (task: Task) => {
    const message = `User updated ${task.id}`;
    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      teamId: state.currentTeamId || 'global',
      user: 'User',
      action: 'updated',
      target: task.id,
      message,
    };
    setState(s => ({ 
      ...s, 
      tasks: s.tasks.map(t => t.id === task.id ? task : t),
      activityLog: [newActivity, ...s.activityLog].slice(0, 50)
    }));
  };
  const deleteTask = (id: string) => {
    saveStateForUndo('Task deleted');
    const message = `User deleted ${id}`;
    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      teamId: state.currentTeamId || 'global',
      user: 'User',
      action: 'deleted',
      target: id,
      message,
    };
    setState(s => ({ 
      ...s, 
      tasks: s.tasks.filter(t => t.id !== id),
      activityLog: [newActivity, ...s.activityLog].slice(0, 50)
    }));
  };
  const moveTask = (taskId: string, newStatus: TaskStatus) => {
    const message = `User moved ${taskId}`;
    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      teamId: state.currentTeamId || 'global',
      user: 'User',
      action: 'moved',
      target: taskId,
      message,
    };
    setState(s => ({
      ...s,
      tasks: s.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t),
      activityLog: [newActivity, ...s.activityLog].slice(0, 50)
    }));
  };
  
  const setWipLimit = (limit: number) => setState(s => ({ ...s, wipLimit: limit }));
  
  const addSprint = (sprint: Sprint) => {
    const message = `User created sprint ${sprint.name}`;
    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      teamId: state.currentTeamId || 'global',
      user: 'User',
      action: 'created',
      target: `sprint ${sprint.name}`,
      message,
    };
    setState(s => ({ 
      ...s, 
      sprints: [...s.sprints, { ...sprint, teamId: s.currentTeamId || sprint.teamId }],
      activityLog: [newActivity, ...s.activityLog].slice(0, 50)
    }));
  };
  const updateSprint = (sprint: Sprint) => setState(s => ({ ...s, sprints: s.sprints.map(sp => sp.id === sprint.id ? sprint : sp) }));
  const deleteSprint = (id: string) => {
    saveStateForUndo('Sprint deleted');
    setState(s => ({ ...s, sprints: s.sprints.filter(sp => sp.id !== id) }));
  };
  const completeSprint = (id: string) => {
    const message = `User completed sprint`;
    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      teamId: state.currentTeamId || 'global',
      user: 'User',
      action: 'completed',
      target: 'sprint',
      message,
    };
    setState(s => ({
      ...s,
      sprints: s.sprints.map(sp => sp.id === id ? { ...sp, isActive: false } : sp),
      activityLog: [newActivity, ...s.activityLog].slice(0, 50)
    }));
  };
  
  const addRetro = (retro: RetroSession) => setState(s => ({ ...s, retros: [...s.retros, { ...retro, teamId: s.currentTeamId || retro.teamId }] }));
  const addRetroNote = (note: RetroNote) => {
    const message = `User added retro note`;
    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      teamId: state.currentTeamId || 'global',
      user: 'User',
      action: 'added',
      target: 'retro note',
      message,
    };
    setState(s => ({ 
      ...s, 
      retroNotes: [...s.retroNotes, { ...note, teamId: s.currentTeamId || note.teamId }],
      activityLog: [newActivity, ...s.activityLog].slice(0, 50)
    }));
  };
  const updateRetroNote = (note: RetroNote) => setState(s => ({ ...s, retroNotes: s.retroNotes.map(n => n.id === note.id ? note : n) }));
  const deleteRetroNote = (id: string) => {
    saveStateForUndo('Retro note deleted');
    const message = `User deleted retro note`;
    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      teamId: state.currentTeamId || 'global',
      user: 'User',
      action: 'deleted',
      target: 'retro note',
      message,
    };
    setState(s => ({ 
      ...s, 
      retroNotes: s.retroNotes.filter(n => n.id !== id),
      activityLog: [newActivity, ...s.activityLog].slice(0, 50)
    }));
  };
  const upvoteRetroNote = (noteId: string) => setState(s => ({
    ...s,
    retroNotes: s.retroNotes.map(n => n.id === noteId ? { ...n, votes: n.votes + 1 } : n)
  }));
  const convertNoteToTask = (noteId: string, task: Task) => {
    const message = `User converted note to task`;
    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      teamId: state.currentTeamId || 'global',
      user: 'User',
      action: 'converted',
      target: 'note to task',
      message,
    };
    setState(s => ({
      ...s,
      tasks: [...s.tasks, task],
      retroNotes: s.retroNotes.map(n => n.id === noteId ? { ...n, convertedToTaskId: task.id } : n),
      activityLog: [newActivity, ...s.activityLog].slice(0, 50)
    }));
  };

  const addMeetingNote = (note: MeetingNote) => {
    setState(s => ({ ...s, meetingNotes: [...s.meetingNotes, note] }));
  };

  const addMeetingSummary = (summary: MeetingSummary) => {
    setState(s => ({ ...s, meetingSummaries: [...s.meetingSummaries, summary] }));
  };

  const clearMeetingNotes = (teamId: string) => {
    setState(s => ({ ...s, meetingNotes: s.meetingNotes.filter(n => n.teamId !== teamId) }));
  };

  const clearNotifications = () => setState(s => ({ ...s, hasNewNotifications: false }));

  return (
    <SyncLogicContext.Provider value={{
      state, setCurrentTeam, updateProjectName, updateTheme, addTeam, updateTeam, deleteTeam,
      addTask, updateTask, deleteTask, moveTask, setWipLimit,
      addSprint, updateSprint, deleteSprint, completeSprint,
      addRetro, addRetroNote, updateRetroNote, deleteRetroNote, upvoteRetroNote, convertNoteToTask,
      addMeetingNote, addMeetingSummary, clearMeetingNotes,
      clearNotifications,
      deleteMember,
      addActivity, undoAction, hardResetDatabase, toastMessage,
      getRandomAvatar
    }}>
      {children}
    </SyncLogicContext.Provider>
  );
};

export const useSyncLogic = () => {
  const context = useContext(SyncLogicContext);
  if (!context) throw new Error('useSyncLogic must be used within SyncLogicProvider');
  return context;
};
