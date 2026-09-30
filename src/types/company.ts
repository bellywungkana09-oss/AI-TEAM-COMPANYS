export type EmployeeStatus =
  | "idle"
  | "assigned"
  | "working"
  | "meeting"
  | "review"
  | "completed"
  | "failed";

export type CompanyEventType =
  | "employee_status_changed"
  | "task_assigned"
  | "task_completed"
  | "meeting_started"
  | "project_phase_changed"
  | "company_status_changed";

export type CompanyEvent = {
  id: string;
  seq: number;
  /** World epoch this event belongs to. Missing on the connection hello only. */
  epoch?: number;
  type: CompanyEventType | string;
  occurred_at: string;
  data: Record<string, unknown>;
};

export type Employee = {
  id: string;
  name: string;
  role: string;
  department: string;
  status: EmployeeStatus;
  current_task: string | null;
  skills: string[];
};

export type Project = {
  id: string;
  name: string;
  status: string;
  progress: number;
  created_at: string;
};

export type Task = {
  id: string;
  title: string;
  status: string;
  priority: string;
  progress: number;
  assigned_employee: string | null;
  project_id: string;
};

export type Activity = {
  id: string;
  event: string;
  description: string;
  timestamp: string;
};

export type CompanyStatus = {
  employees_total: number;
  projects_total: number;
  active_projects: number;
  active_tasks: number;
  activities_today: number;
  system_status: string;
};

export type FounderCommandResult = {
  project: string;
  strategy: {
    project_name: string;
    objective: string;
    target_user: string;
    features: string[];
    departments_required: string[];
    priority: string;
    risk: string;
    timeline: string;
  };
  tasks: { title: string; description: string; priority: string; assigned_employee?: string }[];
  status: string;
};
