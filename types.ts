
export type UserRole = 'admin' | 'member' | 'finisher';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt?: any;
}

export interface Workspace {
  id: string;
  type: 'agenda' | 'campaign';
  name: string;
  columns: string[];
  description?: string;
  startDate?: string;
  endDate?: string;
  active: boolean;
  createdAt?: any;
  createdBy?: string;
}

export interface Task {
  id: string;
  workspaceId: string;
  type: 'agenda' | 'campaign';
  column: string;
  specKey: string;
  description?: string;
  assigneeUid?: string;
  assigneeName?: string;
  status?: string;
  links?: { title: string; url: string }[];
  doneAt?: any;
  createdAt?: any;
  montageDetailsYN?: string;
  usedColors?: { extColor: string; intColor: string }[];
}

export interface DailyTask {
  id: string;
  monthKey: string;
  weekIndex: number;
  dayIndex: number;
  title: string;
  desc?: string;
  status: 'todo' | 'done';
  richNoteHtml?: string;
  createdAt?: any;
}

export interface StockTaskMeta {
  specKey: string;
  photo?: string;
  montage?: string;
  montageDetails?: string;
  inAgenda?: string;
  agendaMonth?: string;
  agendaYear?: string;
  updatedAt?: any;
}
