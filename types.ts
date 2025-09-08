



export type View = 'dashboard' | 'users' | 'projects' | 'timesheets' | 'documents' | 'tools' | 'equipment' | 'settings';

export enum Role {
  ADMIN = 'Company Admin',
  PM = 'Project Manager',
  FOREMAN = 'Foreman',
  SAFETY_OFFICER = 'Safety Officer',
  OPERATIVE = 'Operative'
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  companyId: number;
  createdAt: Date;
}

export interface Company {
  id: number;
  name: string;
}

export interface Site {
  id: number;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  radius: number; // in meters
  companyId: number;
  createdAt: Date;
}

export interface Project {
  id: number;
  name: string;
  location: {
    address: string; // Will be the site's name
    lat: number;
    lng: number;
  };
  companyId: number;
  managerId: number;
  radius: number; // in meters, from the site
  siteId: number;
  createdAt: Date;
}

export enum TimesheetStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  FLAGGED = 'Flagged',
}

export interface Break {
    startTime: Date;
    endTime: Date | null;
}

export enum WorkType {
    GENERAL_LABOR = 'General Labor',
    EQUIPMENT_OPERATION = 'Equipment Operation',
    SUPERVISION = 'Supervision',
    SITE_PREP = 'Site Preparation',
    FINISHING = 'Finishing Work',
}

export interface Timesheet {
  id: number;
  userId: number;
  projectId: number;
  clockIn: Date;
  clockOut: Date | null;
  status: TimesheetStatus;
  location?: {
    lat: number;
    lng: number;
  };
  trustScore?: number;
  trustReasons?: Record<string, any>;
  breaks?: Break[];
  workType?: WorkType;
  comment?: string;
}

export enum DocumentStatus {
    UPLOADING = 'Uploading',
    SCANNING = 'Scanning',
    APPROVED = 'Approved',
    QUARANTINED = 'Quarantined',
}

export enum DocumentCategory {
    RAMS = 'Risk Assessment / Method Statement',
    HS = 'Health & Safety',
    POLICY = 'Company Policy',
    BLUEPRINT = 'Blueprint / Drawing',
    GENERAL = 'General',
    OTHER = 'Other',
}

export interface Document {
  id: number;
  name: string;
  url: string;
  projectId: number;
  status: DocumentStatus;
  uploadedAt: Date;
  category: DocumentCategory;
  indexedContent?: string;
  version: number;
  documentGroupId: number; // To link versions of the same document
  relatedDocumentIds?: number[];
  creatorId: number;
}

export enum TodoPriority {
    LOW = 'Low',
    MEDIUM = 'Medium',
    HIGH = 'High',
}

export enum TodoStatus {
    TODO = 'To Do',
    IN_PROGRESS = 'In Progress',
    DONE = 'Done',
}

export interface SubTask {
  id: number;
  text: string;
  completed: boolean;
}

export interface Comment {
    id: number;
    text: string;
    creatorId: number;
    createdAt: Date;
}

export interface Todo {
  id: number;
  text: string;
  status: TodoStatus;
  projectId: number;
  priority: TodoPriority;
  dueDate?: Date;
  reminderAt?: Date;
  dependsOn?: number; // ID of the prerequisite task
  subTasks?: SubTask[];
  comments?: Comment[];
  createdAt: Date;
  creatorId: number;
}

export interface ProjectAssignment {
  userId: number;
  projectId: number;
}

export interface DocumentAcknowledgement {
  id: number;
  userId: number;
  documentId: number;
  acknowledgedAt: Date;
}
export interface NotificationPreferences {
    taskDueDate: boolean;
    newDocumentAssigned: boolean;
    timesheetFlagged: boolean;
}

export interface CompanySettings {
    id: number;
    companyId: number;
    timesheetRetentionDays: number;
    theme?: 'light' | 'dark';
    notificationPreferences?: Partial<NotificationPreferences>;
}

export enum IncidentSeverity {
    LOW = 'Low',
    MEDIUM = 'Medium',
    HIGH = 'High',
    CRITICAL = 'Critical'
}

export enum IncidentType {
    INJURY = 'Injury',
    NEAR_MISS = 'Near Miss',
    PROPERTY_DAMAGE = 'Property Damage',
    HAZARD_OBSERVATION = 'Hazard Observation'
}

export enum IncidentStatus {
    REPORTED = 'Reported',
    UNDER_REVIEW = 'Under Review',
    RESOLVED = 'Resolved'
}

export interface SafetyIncident {
    id: number;
    projectId: number;
    reporterId: number;
    timestamp: Date;
    severity: IncidentSeverity;
    type: IncidentType;
    description: string;
    locationOnSite: string;
    correctiveActionTaken?: string;
    status: IncidentStatus;
    photoUrl?: string; // Simulated
    aiSummary?: string;
}

export interface DailyLog {
    id: number;
    projectId: number;
    authorId: number;
    date: Date;
    weather: 'Sunny' | 'Cloudy' | 'Rain' | 'Windy' | 'Snow';
    temperature: number; // in Celsius
    notes: string;
}

export interface CostEstimate {
    category: 'Materials' | 'Labor' | 'Equipment' | 'Permits' | 'Other';
    item: string;
    quantity: string;
    unitCost: number;
    totalCost: number;
    justification: string;
}

export enum EquipmentStatus {
    AVAILABLE = 'Available',
    IN_USE = 'In Use',
    MAINTENANCE = 'Maintenance',
}

export interface Equipment {
    id: number;
    name: string;
    type: 'Heavy' | 'Light' | 'Power Tool' | 'Vehicle';
    status: EquipmentStatus;
    companyId: number;
    projectId?: number; // Which project it's currently assigned to
}

export interface ResourceAssignment {
    id: number;
    resourceId: number; // Can be a User ID or Equipment ID
    resourceType: 'user' | 'equipment';
    projectId: number;
    startDate: Date;
    endDate: Date;
}

export enum RFIStatus {
    OPEN = 'Open',
    ANSWERED = 'Answered',
    CLOSED = 'Closed',
}

export interface RFI {
    id: number;
    projectId: number;
    subject: string;
    question: string;
    answer?: string;
    status: RFIStatus;
    creatorId: number;
    assigneeId?: number;
    createdAt: Date;
    answeredAt?: Date;
}

export enum AuditLogAction {
  TIMESHEET_APPROVED = 'Timesheet Approved',
  TIMESHEET_REJECTED = 'Timesheet Rejected',
  TIMESHEET_FLAGGED_FOR_REVIEW = 'Timesheet Flagged for Review',
  TIMESHEET_FLAG_APPROVED = 'Flagged Timesheet Approved',
  TIMESHEET_FLAG_REJECTED = 'Flagged Timesheet Rejected',
  USER_ASSIGNED = 'User Assigned to Project',
  USER_UNASSIGNED = 'User Unassigned from Project',
  PROJECT_MANAGER_CHANGED = 'Project Manager Changed',
  DOCUMENT_UPLOADED = 'Document Uploaded',
  DOCUMENT_ACKNOWLEDGED = 'Document Acknowledged',
  DOCUMENT_VERSION_REVERTED = 'Document Version Reverted',
  DOCUMENT_LINK_ADDED = 'Document Link Added',
  DOCUMENT_LINK_REMOVED = 'Document Link Removed',
  DOCUMENT_AI_QUERY = 'Document AI Query',
  TODO_ADDED = 'To-Do Added',
  TODO_COMPLETED = 'To-Do Completed',
  TODO_TEXT_CHANGED = 'To-Do Text Changed',
  TODO_PRIORITY_CHANGED = 'To-Do Priority Changed',
  TODO_DUE_DATE_CHANGED = 'To-Do Due Date Changed',
  TODO_STATUS_CHANGED = 'To-Do Status Changed',
  TODO_REMINDER_SET = 'To-Do Reminder Set',
  TODO_DEPENDENCY_ADDED = 'To-Do Dependency Added',
  TODO_DEPENDENCY_REMOVED = 'To-Do Dependency Removed',
  TODO_COMMENT_ADDED = 'Comment Added to To-Do',
  SUBTASK_ADDED = 'Sub-task Added',
  SUBTASK_COMPLETED = 'Sub-task Completed',
  SUBTASK_UPDATED = 'Sub-task Updated',
  SUBTASK_DELETED = 'Sub-task Deleted',
  CATEGORY_SUGGESTED = 'Category Suggested',
  SAFETY_INCIDENT_REPORTED = 'Safety Incident Reported',
  SAFETY_INCIDENT_STATUS_UPDATED = 'Safety Incident Status Updated',
  DAILY_LOG_ADDED = 'Daily Log Added',
  COST_ESTIMATE_GENERATED = 'Cost Estimate Generated',
  EQUIPMENT_ASSIGNED = 'Equipment Assigned to Project',
  EQUIPMENT_UNASSIGNED = 'Equipment Unassigned from Project',
  EQUIPMENT_STATUS_UPDATED = 'Equipment Status Updated',
  RESOURCE_SCHEDULED = 'Resource Scheduled',
  SAFETY_ANALYSIS_GENERATED = 'Safety Analysis Generated',
  RFI_CREATED = 'RFI Created',
  RFI_ANSWERED = 'RFI Answered',
  RFI_ASSIGNEE_CHANGED = 'RFI Assignee Changed',
  AI_PROJECT_SEARCH = 'AI Project Search',
}

export interface AuditLog {
  id: number;
  projectId?: number;
  actorId: number; // The user who performed the action
  action: AuditLogAction;
  target?: {
    type: 'user' | 'document' | 'timesheet' | 'todo' | 'safetyIncident' | 'rfi' | 'project';
    id: number;
    name: string;
  };
  timestamp: Date;
}

export interface ProjectHealth {
    score: number;
    summary: string;
    risks: string[];
    positives: string[];
}

export interface AISearchResult {
    summary: string;
    sources: {
        documentId: number;
        snippet: string;
    }[];
}