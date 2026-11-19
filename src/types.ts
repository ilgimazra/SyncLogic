export type User = { id: string; name: string; avatar: string; capacity: number; email?: string; status?: string; };
export type Team = { id: string; name: string; members: User[] };
export type TaskStatus = 'New' | 'Active' | 'Resolved' | 'Closed' | 'Backlog';
export type Priority = 'High' | 'Medium' | 'Low';
export type Task = { 
  id: string; 
  title: string; 
  description: string; 
  priority: Priority; 
  assigneeId: string | null; 
  status: TaskStatus; 
  effort: number; 
  sprintId: string | null; 
  type: string;
  teamId: string;
};
export type Sprint = { id: string; name: string; startDate: string; endDate: string; goal: string; isActive: boolean; teamId: string };
export type RetroNoteType = 'well' | 'not-well' | 'action';
export type RetroNote = { 
  id: string; 
  text: string; 
  column: RetroNoteType; 
  votes: number; 
  retroId?: string; 
  convertedToTaskId?: string; 
  author: string; 
  teamId: string 
};
export type RetroSession = { id: string; name: string; date: string; isActive: boolean; sprintId?: string; teamId: string };

export type Activity = {
  id: string;
  user: string;
  action: string;
  target: string;
  message: string;
  timestamp: string;
  teamId: string;
};

export type MeetingNote = {
  id: string;
  member: string;
  text: string;
  timestamp: string;
  teamId: string;
};

export type MeetingSummary = {
  id: string;
  text: string;
  timestamp: string;
  teamId: string;
};

export type AppState = {
  projectName: string;
  theme: string;
  teams: Team[];
  currentTeamId: string | null;
  tasks: Task[];
  sprints: Sprint[];
  retros: RetroSession[];
  retroNotes: RetroNote[];
  activityLog: Activity[];
  meetingNotes: MeetingNote[];
  meetingSummaries: MeetingSummary[];
  wipLimit: number;
  hasNewNotifications?: boolean;
};

