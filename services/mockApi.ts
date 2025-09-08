import { Company, Document, Project, Role, Timesheet, TimesheetStatus, Todo, User, ProjectAssignment, DocumentAcknowledgement, Site, DocumentStatus, CompanySettings, DocumentCategory, AuditLog, AuditLogAction, TodoPriority, SafetyIncident, IncidentStatus, IncidentSeverity, IncidentType, SubTask, Comment, ProjectHealth, TodoStatus, DailyLog, CostEstimate, Equipment, EquipmentStatus, ResourceAssignment, WorkType, Break, RFI, RFIStatus, AISearchResult, Photo } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

let companies: Company[] = [
  { id: 1, name: 'BuildRight Inc.' },
  { id: 2, name: 'Apex Constructions' },
];

let users: User[] = [
  { id: 1, name: 'Alice Admin', email: 'alice@buildright.com', role: Role.ADMIN, companyId: 1, createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
  { id: 2, name: 'Bob Manager', email: 'bob@buildright.com', role: Role.PM, companyId: 1, createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
  { id: 3, name: 'Charlie Operator', email: 'charlie@buildright.com', role: Role.OPERATIVE, companyId: 1, createdAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000) },
  { id: 4, name: 'Diana Operator', email: 'diana@buildright.com', role: Role.OPERATIVE, companyId: 1, createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000) },
  { id: 5, name: 'Eve Admin', email: 'eve@apex.com', role: Role.ADMIN, companyId: 2, createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
  { id: 6, name: 'Frank Manager', email: 'frank@apex.com', role: Role.PM, companyId: 2, createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
  { id: 7, name: 'Gary Foreman', email: 'gary@buildright.com', role: Role.FOREMAN, companyId: 1, createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
  { id: 8, name: 'Heidi Safety', email: 'heidi@buildright.com', role: Role.SAFETY_OFFICER, companyId: 1, createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
];

let sites: Site[] = [
  { id: 1, name: 'Metro Gateway Site', location: { lat: 34.0522, lng: -118.2437 }, radius: 250, companyId: 1, createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000) },
  { id: 2, name: 'Valley Commercial Park', location: { lat: 34.1522, lng: -118.3437 }, radius: 500, companyId: 1, createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000) },
  { id: 3, name: 'Coastal Residences Site', location: { lat: 33.7701, lng: -118.1937 }, radius: 300, companyId: 2, createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000) },
];

let companySettings: CompanySettings[] = [
    { id: 1, companyId: 1, timesheetRetentionDays: 90, theme: 'light', notificationPreferences: { taskDueDate: true, newDocumentAssigned: true, timesheetFlagged: false } },
    { id: 2, companyId: 2, timesheetRetentionDays: 180, theme: 'dark', notificationPreferences: { taskDueDate: true, newDocumentAssigned: true, timesheetFlagged: true } },
];

interface RawProject {
  id: number;
  name: string;
  siteId: number;
  companyId: number;
  managerId: number;
  createdAt: Date;
}

let rawProjects: RawProject[] = [
  { id: 1, name: 'Downtown Tower Foundation', siteId: 1, companyId: 1, managerId: 2, createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) },
  { id: 2, name: 'Suburban Mall Parking Structure', siteId: 2, companyId: 1, managerId: 2, createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000) },
  { id: 3, name: 'Ocean View Condos - Phase 1', siteId: 3, companyId: 2, managerId: 6, createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
];


let timesheets: Timesheet[] = [
  { id: 1, userId: 3, projectId: 1, clockIn: new Date(Date.now() - 8 * 60 * 60 * 1000), clockOut: new Date(), status: TimesheetStatus.FLAGGED, trustScore: 0.7, trustReasons: { geofence: 'Outside by 55m' }, workType: WorkType.EQUIPMENT_OPERATION, breaks: [{ startTime: new Date(Date.now() - 4 * 60 * 60 * 1000), endTime: new Date(Date.now() - 3.5 * 60 * 60 * 1000) }], comment: 'Excavator was running slow.' },
  { id: 2, userId: 4, projectId: 1, clockIn: new Date(Date.now() - 9 * 60 * 60 * 1000), clockOut: new Date(Date.now() - 1 * 60 * 60 * 1000), status: TimesheetStatus.APPROVED, trustScore: 1.0, workType: WorkType.GENERAL_LABOR, breaks: [], comment: 'Standard day, productive.' },
  { id: 3, userId: 3, projectId: 2, clockIn: new Date(Date.now() - 24 * 60 * 60 * 1000), clockOut: new Date(Date.now() - 16 * 60 * 60 * 1000), status: TimesheetStatus.REJECTED, trustScore: 0.9, trustReasons: { accuracy: 'low' }, workType: WorkType.SITE_PREP, breaks: [], comment: '' },
];

let documents: Document[] = [
  // Safety Manual group (ID 1)
  { id: 1, name: 'Safety Manual v1.2.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', projectId: 1, status: DocumentStatus.APPROVED, uploadedAt: new Date(), category: DocumentCategory.HS, indexedContent: 'This document contains important safety procedures. All personnel must read and acknowledge section 4 regarding fire extinguisher usage. Hazard identification is crucial.', version: 2, documentGroupId: 1, relatedDocumentIds: [4], creatorId: 2 },
  { id: 5, name: 'Safety Manual v1.1.pdf', url: '#', projectId: 1, status: DocumentStatus.QUARANTINED, uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), category: DocumentCategory.HS, indexedContent: 'Older version. Contains outdated fire safety protocols.', version: 1, documentGroupId: 1, creatorId: 2 },

  // Blueprints group (ID 2)
  { id: 2, name: 'Building Blueprints Rev C.png', url: 'https://placehold.co/800x600.png', projectId: 1, status: DocumentStatus.APPROVED, uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), category: DocumentCategory.BLUEPRINT, indexedContent: 'Floor plan for level 3. Structural support beams noted in red. Electrical wiring diagram included. HVAC system layout. The blueprint specifies a 1/2" rebar.', version: 3, documentGroupId: 2, creatorId: 2 },
  { id: 6, name: 'Building Blueprints Rev B.png', url: '#', projectId: 1, status: DocumentStatus.APPROVED, uploadedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), category: DocumentCategory.BLUEPRINT, indexedContent: 'Revision B. Changes to restroom layout on level 2.', version: 2, documentGroupId: 2, creatorId: 2 },
  { id: 7, name: 'Building Blueprints Rev A.png', url: '#', projectId: 1, status: DocumentStatus.APPROVED, uploadedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), category: DocumentCategory.BLUEPRINT, indexedContent: 'Initial draft of blueprints.', version: 1, documentGroupId: 2, creatorId: 2 },
  
  // Single version documents
  { id: 3, name: 'Unsupported File.docx', url: '#', projectId: 1, status: DocumentStatus.APPROVED, uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), category: DocumentCategory.GENERAL, indexedContent: 'Meeting notes from the weekly sync. Action items for the concrete pour schedule.', version: 1, documentGroupId: 3, creatorId: 7 },
  { id: 4, name: 'General Safety Guidelines.pdf', url: '#', projectId: 2, status: DocumentStatus.APPROVED, uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), category: DocumentCategory.POLICY, indexedContent: 'Company-wide policy on personal protective equipment (PPE). Hard hats are mandatory on site at all times. All incidents must be reported.', version: 1, documentGroupId: 4, relatedDocumentIds: [1], creatorId: 6 },
];

let todos: Todo[] = [
  { id: 1, text: 'Inspect foundation rebar', status: TodoStatus.DONE, projectId: 1, priority: TodoPriority.HIGH, dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), creatorId: 2 },
  { id: 2, text: 'Schedule concrete pour', status: TodoStatus.IN_PROGRESS, projectId: 1, priority: TodoPriority.HIGH, dependsOn: 1, dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), subTasks: [
      { id: 1, text: 'Confirm rebar inspection sign-off', completed: true },
      { id: 2, text: 'Check weather forecast for pour day', completed: false },
      { id: 3, text: 'Book concrete pump', completed: false },
    ], comments: [
        { id: 1, text: 'Weather is looking good for next week, let\'s target Tuesday.', creatorId: 2, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
        { id: 2, text: 'Pump is on standby. Just need the final word.', creatorId: 7, createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) }
    ], createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), creatorId: 2 
  },
  { id: 3, text: 'Order drywall materials', status: TodoStatus.TODO, projectId: 1, priority: TodoPriority.HIGH, dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), reminderAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), creatorId: 7 },
  { id: 4, text: 'Final site cleanup', status: TodoStatus.TODO, projectId: 1, priority: TodoPriority.LOW, createdAt: new Date(), creatorId: 7 },
];

let safetyIncidents: SafetyIncident[] = [
    { id: 1, projectId: 1, reporterId: 7, timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), severity: IncidentSeverity.MEDIUM, type: IncidentType.NEAR_MISS, description: 'A pallet of bricks slipped from the crane but landed in a cordoned-off area. No injuries or damage.', locationOnSite: 'Zone A, Crane Drop Zone', status: IncidentStatus.UNDER_REVIEW, aiSummary: 'A pallet of bricks was dropped by a crane in a secure zone, resulting in no injuries or damage.' },
    { id: 2, projectId: 1, reporterId: 3, timestamp: new Date(Date.now() - 28 * 60 * 60 * 1000), severity: IncidentSeverity.LOW, type: IncidentType.HAZARD_OBSERVATION, description: 'Observed water pooling near the main electrical panel on Level 2 after heavy rain.', locationOnSite: 'Level 2, Electrical Room', correctiveActionTaken: 'Placed warning signs and notified maintenance to clear the water and check for leaks.', status: IncidentStatus.RESOLVED, aiSummary: 'Water pooling was observed and reported near a main electrical panel, and maintenance was notified after signs were placed.' },
];

let rfis: RFI[] = [
    { id: 1, projectId: 1, subject: 'Clarification on Blueprint C, Section 5', question: 'The blueprint specifies a 1/2" rebar, but the structural notes call for 5/8". Please clarify which is correct before we proceed with the foundation pour.', status: RFIStatus.ANSWERED, creatorId: 7, assigneeId: 2, createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), answer: 'Good catch. Please proceed with the 5/8" rebar as specified in the structural notes. The blueprint will be updated in the next revision.', answeredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    { id: 2, projectId: 1, subject: 'Electrical Conduit Pathing', question: 'The planned path for the main electrical conduit on Level 2 appears to conflict with the HVAC ducting. Can we get an alternative pathing diagram?', status: RFIStatus.OPEN, creatorId: 3, assigneeId: 2, createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
];

let projectAssignments: ProjectAssignment[] = [
  { userId: 3, projectId: 1 }, // Charlie on Downtown Tower
  { userId: 4, projectId: 1 }, // Diana on Downtown Tower
  { userId: 3, projectId: 2 }, // Charlie on Suburban Mall
  { userId: 7, projectId: 1 }, // Gary Foreman on Downtown Tower
  { userId: 8, projectId: 1 }, // Heidi Safety on Downtown Tower
];

let documentAcks: DocumentAcknowledgement[] = [
    { id: 1, userId: 3, documentId: 1, acknowledgedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) } // Charlie acknowledged Safety Manual
];

let dailyLogs: DailyLog[] = [
    { id: 1, projectId: 1, authorId: 7, date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), weather: 'Sunny', temperature: 25, notes: 'Foundation rebar inspection completed by city inspector. All clear. Concrete pour scheduled for tomorrow morning. Team B worked on preliminary electrical conduit layout on Level 1.' },
    { id: 2, projectId: 1, authorId: 7, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), weather: 'Cloudy', temperature: 22, notes: 'Continued rebar tying for the main foundation slab. Received delivery of 5 tons of #5 rebar. A minor delay due to a late truck, but we caught up by end of day. Safety meeting held at 8 AM, focused on crane safety.' },
    { id: 3, projectId: 1, authorId: 2, date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), weather: 'Rain', temperature: 18, notes: 'Heavy rain in the morning, work was paused for 2 hours. Site drainage systems checked and are working effectively. Afternoon work focused on indoor tasks and material organization.' },
];

let equipment: Equipment[] = [
    { id: 1, name: 'Excavator CAT 320', type: 'Heavy', status: EquipmentStatus.IN_USE, companyId: 1, projectId: 1 },
    { id: 2, name: 'Bulldozer D6', type: 'Heavy', status: EquipmentStatus.AVAILABLE, companyId: 1 },
    { id: 3, name: 'Concrete Mixer 5-yard', type: 'Light', status: EquipmentStatus.MAINTENANCE, companyId: 1 },
    { id: 4, name: 'Ford F-150', type: 'Vehicle', status: EquipmentStatus.IN_USE, companyId: 1, projectId: 2 },
    { id: 5, name: 'Tower Crane', type: 'Heavy', status: EquipmentStatus.AVAILABLE, companyId: 2 },
];

let resourceAssignments: ResourceAssignment[] = [
    // Project 1: Downtown Tower
    { id: 1, resourceId: 3, resourceType: 'user', projectId: 1, startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) }, // Charlie
    { id: 2, resourceId: 4, resourceType: 'user', projectId: 1, startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) }, // Diana
    { id: 3, resourceId: 1, resourceType: 'equipment', projectId: 1, startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) }, // Excavator
    
    // Project 2: Suburban Mall
    { id: 4, resourceId: 3, resourceType: 'user', projectId: 2, startDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000), endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000) }, // Charlie
    { id: 5, resourceId: 4, resourceType: 'equipment', projectId: 2, startDate: new Date(), endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }, // F-150
];

let photos: Photo[] = [];

const initialAuditLogs: Omit<AuditLog, 'id'>[] = [
    { projectId: 1, actorId: 2, action: AuditLogAction.TIMESHEET_APPROVED, target: { type: 'timesheet', id: 2, name: `for ${users.find(u => u.id === 4)?.name}` }, timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000) },
    { projectId: 1, actorId: 3, action: AuditLogAction.DOCUMENT_ACKNOWLEDGED, target: { type: 'document', id: 1, name: 'Safety Manual v1.2.pdf' }, timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    { projectId: 1, actorId: 2, action: AuditLogAction.USER_ASSIGNED, target: { type: 'user', id: 7, name: `${users.find(u => u.id === 7)?.name}` }, timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
    // New log entries to demonstrate task-related activities
    { 
        projectId: 1, actorId: 2, action: AuditLogAction.TODO_COMMENT_ADDED, 
        target: { type: 'todo', id: 2, name: 'on "Schedule concrete pour"' }, 
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) 
    },
    { 
        projectId: 1, actorId: 7, action: AuditLogAction.SUBTASK_ADDED, 
        target: { type: 'todo', id: 2, name: '"Book concrete pump" to "Schedule concrete pour"' }, 
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) 
    },
    { 
        projectId: 1, actorId: 2, action: AuditLogAction.SUBTASK_COMPLETED, 
        target: { type: 'todo', id: 2, name: '"Confirm rebar inspection sign-off" in "Schedule concrete pour"' }, 
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000) 
    },
    { 
        projectId: 1, actorId: 7, action: AuditLogAction.TODO_PRIORITY_CHANGED, 
        target: { type: 'todo', id: 3, name: `priority for "Order drywall materials" to ${TodoPriority.HIGH}` }, 
        timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000)
    },
    { 
        projectId: 1, actorId: 2, action: AuditLogAction.TODO_DUE_DATE_CHANGED, 
        target: { type: 'todo', id: 2, name: `due date for "Schedule concrete pour" to ${new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString()}` }, 
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000)
    },
    { 
        projectId: 1, actorId: 7, action: AuditLogAction.SUBTASK_DELETED, 
        target: { type: 'todo', id: 2, name: `"Check concrete mix recipe" from "Schedule concrete pour"` }, 
        timestamp: new Date(Date.now() - 9 * 60 * 60 * 1000)
    }
];

// Sort and assign IDs
let auditLogs: AuditLog[] = initialAuditLogs
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .map((log, index) => ({ ...log, id: initialAuditLogs.length - index, ...log }));


let categorySuggestions: { id: number; projectId: number; suggestion: string; actorId: number; timestamp: Date }[] = [];

const addAuditLog = (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const newLog: AuditLog = {
        ...log,
        id: auditLogs.length + 1,
        timestamp: new Date(),
    };
    auditLogs.unshift(newLog); // Add to the beginning
};

const enrichProject = (rawProject: RawProject): Project | undefined => {
    const site = sites.find(s => s.id === rawProject.siteId);
    if (!site) return undefined;
    return {
        ...rawProject,
        location: {
            address: site.name,
            lat: site.location.lat,
            lng: site.location.lng,
        },
        radius: site.radius,
    };
};

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // in metres
}

const simulateDelay = <T,>(data: T, ms = 300): Promise<T> => new Promise(resolve => setTimeout(() => resolve(data), ms));

export const api = {
  getCompanies: () => simulateDelay(companies),
  getUsersByCompany: (companyId: number) => simulateDelay(users.filter(u => u.companyId === companyId)),
  getSitesByCompany: (companyId: number) => simulateDelay(sites.filter(s => s.companyId === companyId)),
  
  getCompanySettings: (companyId: number) => simulateDelay(companySettings.find(s => s.companyId === companyId)),
  updateCompanySettings: (companyId: number, settings: Partial<Omit<CompanySettings, 'id' | 'companyId'>>) => {
      const existing = companySettings.find(s => s.companyId === companyId);
      if (existing) {
          // Deep merge for nested objects like notificationPreferences
          if (settings.notificationPreferences) {
              existing.notificationPreferences = { ...existing.notificationPreferences, ...settings.notificationPreferences };
              delete settings.notificationPreferences; // remove it from top-level assign
          }
          Object.assign(existing, settings);
          return simulateDelay(existing);
      }
      return Promise.reject('Settings not found');
  },

  getProjectsByCompany: (companyId: number) => {
    const projects = rawProjects
      .filter(p => p.companyId === companyId)
      .map(enrichProject)
      .filter((p): p is Project => p !== undefined);
    return simulateDelay(projects);
  },
  getProjectsByManager: (managerId: number) => {
    const projects = rawProjects
      .filter(p => p.managerId === managerId)
      .map(enrichProject)
      .filter((p): p is Project => p !== undefined);
    return simulateDelay(projects);
  },
  getTimesheetsByProject: (projectId: number) => simulateDelay(timesheets.filter(t => t.projectId === projectId)),
  getTimesheetsByUser: (userId: number) => simulateDelay(timesheets.filter(t => t.userId === userId)),
  getDocumentsByProject: (projectId: number) => simulateDelay(documents.filter(d => d.projectId === projectId).sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())),
  getTodosByProject: (projectId: number) => simulateDelay(todos.filter(t => t.projectId === projectId)),
  getIncidentsByProject: (projectId: number) => simulateDelay(safetyIncidents.filter(i => i.projectId === projectId).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())),
  getDailyLogsByProject: (projectId: number) => simulateDelay(dailyLogs.filter(l => l.projectId === projectId).sort((a, b) => b.date.getTime() - a.date.getTime())),
  getRFIsByProject: (projectId: number) => simulateDelay(rfis.filter(r => r.projectId === projectId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())),
  
  getUsersByProject: (projectId: number) => {
    const assignedUserIds = projectAssignments.filter(a => a.projectId === projectId).map(a => a.userId);
    const projectUsers = users.filter(u => assignedUserIds.includes(u.id));
    return simulateDelay(projectUsers);
  },
  
  getProjectsByUser: (userId: number) => {
      const projectIds = [...new Set(projectAssignments.filter(a => a.userId === userId).map(a => a.projectId))];
      const userProjects = rawProjects
        .filter(p => projectIds.includes(p.id))
        .map(enrichProject)
        .filter((p): p is Project => p !== undefined);
      return simulateDelay(userProjects);
  },

  getUnassignedUsers: (projectId: number, companyId: number) => {
    const assignedUserIds = projectAssignments.filter(a => a.projectId === projectId).map(a => a.userId);
    const companyUsers = users.filter(u => u.companyId === companyId && (u.role === Role.OPERATIVE || u.role === Role.FOREMAN || u.role === Role.SAFETY_OFFICER));
    const unassignedUsers = companyUsers.filter(u => !assignedUserIds.includes(u.id));
    return simulateDelay(unassignedUsers);
  },

  assignUserToProject: (userId: number, projectId: number, actorId: number) => {
      if (!projectAssignments.some(pa => pa.userId === userId && pa.projectId === projectId)) {
          projectAssignments.push({ userId, projectId });
          const user = users.find(u => u.id === userId);
          if (user) {
            addAuditLog({
                projectId,
                actorId,
                action: AuditLogAction.USER_ASSIGNED,
                target: { type: 'user', id: userId, name: user.name },
            });
          }
      }
      return simulateDelay({ success: true });
  },

  unassignUserFromProject: (userId: number, projectId: number, actorId: number) => {
      projectAssignments = projectAssignments.filter(pa => !(pa.userId === userId && pa.projectId === projectId));
      const user = users.find(u => u.id === userId);
      if (user) {
        addAuditLog({
            projectId,
            actorId,
            action: AuditLogAction.USER_UNASSIGNED,
            target: { type: 'user', id: userId, name: user.name },
        });
      }
      return simulateDelay({ success: true });
  },

  getUserById: (userId: number) => simulateDelay(users.find(u => u.id === userId)),
  getProjectById: (projectId: number) => {
      const rawProject = rawProjects.find(p => p.id === projectId);
      if (!rawProject) return simulateDelay(undefined);
      return simulateDelay(enrichProject(rawProject));
  },
  
  updateProject: (projectId: number, updates: Partial<{ managerId: number }>, actorId: number) => {
      const project = rawProjects.find(p => p.id === projectId);
      if (project) {
          if (updates.managerId !== undefined && project.managerId !== updates.managerId) {
              const oldManager = users.find(u => u.id === project.managerId);
              const newManager = users.find(u => u.id === updates.managerId);
              project.managerId = updates.managerId;
              addAuditLog({
                  projectId,
                  actorId,
                  action: AuditLogAction.PROJECT_MANAGER_CHANGED,
                  target: { type: 'user', id: updates.managerId, name: `from ${oldManager?.name || 'Unassigned'} to ${newManager?.name || 'Unassigned'}` },
              });
          }
          return simulateDelay(enrichProject(project));
      }
      return Promise.reject('Project not found');
  },

  clockIn: (userId: number, projectId: number, location: { lat: number; lng: number, accuracy: number }, workType: WorkType) => {
    let trustScore = 1.0;
    const trustReasons: Record<string, any> = {};
    const project = enrichProject(rawProjects.find(p => p.id === projectId)!);

    if (project) {
        const distance = getDistance(location.lat, location.lng, project.location.lat, project.location.lng);
        if (distance > project.radius) {
            trustScore -= 0.4;
            trustReasons.geofence = `Outside geofence by ${(distance - project.radius).toFixed(0)}m`;
        }
    }
    
    if (location.accuracy > 50) { // High inaccuracy
        trustScore -= 0.2;
        trustReasons.accuracy = `Low accuracy (${location.accuracy.toFixed(0)}m)`;
    }
    
    const isFlagged = trustScore < 0.8;

    const newTimesheet: Timesheet = {
      id: timesheets.length + 1,
      userId,
      projectId,
      clockIn: new Date(),
      clockOut: null,
      status: isFlagged ? TimesheetStatus.FLAGGED : TimesheetStatus.PENDING,
      location: { lat: location.lat, lng: location.lng },
      trustScore: Math.max(0.1, trustScore),
      trustReasons,
      workType,
      breaks: [],
      comment: '',
    };
    timesheets.push(newTimesheet);

    if(isFlagged) {
        const user = users.find(u => u.id === userId);
        addAuditLog({
            projectId: newTimesheet.projectId,
            actorId: userId,
            action: AuditLogAction.TIMESHEET_FLAGGED_FOR_REVIEW,
            target: { type: 'timesheet', id: newTimesheet.id, name: `for ${user?.name || 'Unknown'}` },
        });
    }

    return simulateDelay(newTimesheet);
  },

  clockOut: (timesheetId: number) => {
    const sheet = timesheets.find(t => t.id === timesheetId);
    if (sheet) {
      sheet.clockOut = new Date();
      // Also end any active break
      const activeBreak = sheet.breaks?.find(b => b.endTime === null);
      if (activeBreak) {
          activeBreak.endTime = new Date();
      }
      return simulateDelay(sheet);
    }
    return Promise.reject('Timesheet not found');
  },
  
  updateTimesheetStatus: (timesheetId: number, status: TimesheetStatus, actorId: number) => {
    const sheet = timesheets.find(t => t.id === timesheetId);
    if (sheet) {
      const originalStatus = sheet.status;
      sheet.status = status;
      const user = users.find(u => u.id === sheet.userId);
      let action: AuditLogAction;

      if (originalStatus === TimesheetStatus.FLAGGED) {
          action = status === TimesheetStatus.APPROVED 
              ? AuditLogAction.TIMESHEET_FLAG_APPROVED 
              : AuditLogAction.TIMESHEET_FLAG_REJECTED;
      } else {
          action = status === TimesheetStatus.APPROVED 
              ? AuditLogAction.TIMESHEET_APPROVED 
              : AuditLogAction.TIMESHEET_REJECTED;
      }

      addAuditLog({
          projectId: sheet.projectId,
          actorId,
          action: action,
          target: { type: 'timesheet', id: timesheetId, name: `for ${user?.name || 'Unknown User'}` },
      });
      return simulateDelay(sheet);
    }
    return Promise.reject('Timesheet not found');
  },

  startBreak: (timesheetId: number) => {
    const sheet = timesheets.find(t => t.id === timesheetId);
    if (sheet && !sheet.clockOut) {
      const activeBreak = sheet.breaks?.find(b => b.endTime === null);
      if (!activeBreak) {
        if (!sheet.breaks) sheet.breaks = [];
        sheet.breaks.push({ startTime: new Date(), endTime: null });
        return simulateDelay(sheet);
      }
      return Promise.reject('A break is already in progress.');
    }
    return Promise.reject('Timesheet not found or is already clocked out.');
  },

  endBreak: (timesheetId: number) => {
    const sheet = timesheets.find(t => t.id === timesheetId);
    if (sheet && !sheet.clockOut) {
      const activeBreak = sheet.breaks?.find(b => b.endTime === null);
      if (activeBreak) {
        activeBreak.endTime = new Date();
        return simulateDelay(sheet);
      }
      return Promise.reject('No active break to end.');
    }
    return Promise.reject('Timesheet not found or is already clocked out.');
  },

  updateTimesheetDetails: (timesheetId: number, updates: { comment?: string; workType?: WorkType }) => {
      const sheet = timesheets.find(t => t.id === timesheetId);
      if (sheet) {
          if (updates.comment !== undefined) {
              sheet.comment = updates.comment;
          }
          if (updates.workType !== undefined) {
              sheet.workType = updates.workType;
          }
          return simulateDelay(sheet);
      }
      return Promise.reject('Timesheet not found');
  },

  updateIncidentStatus: (incidentId: number, status: IncidentStatus, actorId: number) => {
    const incident = safetyIncidents.find(i => i.id === incidentId);
    if (incident) {
      incident.status = status;
      addAuditLog({
          projectId: incident.projectId,
          actorId,
          action: AuditLogAction.SAFETY_INCIDENT_STATUS_UPDATED,
          target: { type: 'safetyIncident', id: incidentId, name: `Incident #${incidentId} to ${status}` },
      });
      return simulateDelay(incident);
    }
    return Promise.reject('Incident not found');
  },
  
  addSite: (site: Omit<Site, 'id' | 'createdAt'>) => {
    const newSite: Site = { ...site, id: sites.length + 1, createdAt: new Date() };
    sites.push(newSite);
    return simulateDelay(newSite);
  },

  addProject: (project: Omit<RawProject, 'id' | 'createdAt'>) => {
    const newRawProject: RawProject = { ...project, id: rawProjects.length + 1, createdAt: new Date() };
    rawProjects.push(newRawProject);
    const newProject = enrichProject(newRawProject);
    return simulateDelay(newProject);
  },

  initiateDocumentUpload: (doc: Omit<Document, 'id' | 'url' | 'status' | 'uploadedAt' | 'version' | 'documentGroupId'>) => {
    const { name, projectId, creatorId } = doc;

    // Find if a document with the same name already exists for this project.
    const existingDoc = documents.find(d => d.projectId === projectId && d.name === name);
    
    const newId = Math.max(...documents.map(d => d.id), 0) + 1;
    let newVersion = 1;
    let docGroupId: number;

    if (existingDoc) {
        // It's a new version of an existing document.
        docGroupId = existingDoc.documentGroupId;
        const allVersions = documents.filter(d => d.documentGroupId === docGroupId);
        const latestVersion = Math.max(...allVersions.map(v => v.version));
        newVersion = latestVersion + 1;
    } else {
        // It's a completely new document. The new documentGroupId will be its own ID.
        docGroupId = newId; 
    }
     
    const newDoc: Document = { 
         ...doc, 
         id: newId, 
         url: '#', 
         status: DocumentStatus.UPLOADING, 
         uploadedAt: new Date(), 
         indexedContent: '',
         version: newVersion,
         documentGroupId: docGroupId,
         creatorId,
    };
    documents.unshift(newDoc);
    return simulateDelay(newDoc, 100);
  },

  performChunkedUpload: (documentId: number, fileSize: number, onProgress: (percent: number) => void) => {
    const doc = documents.find(d => d.id === documentId);
    if (!doc || doc.status !== DocumentStatus.UPLOADING) {
        return Promise.reject('Document not found or not in a valid state for upload.');
    }

    console.log(`Simulating request of presigned URLs for chunked upload of "${doc.name}".`);

    const CHUNK_SIZE = 1 * 1024 * 1024; // 1MB chunks for simulation
    const totalChunks = Math.max(1, Math.ceil(fileSize / CHUNK_SIZE));
    
    // Using an IIFE to create an async context
    return (async () => {
        for (let i = 1; i <= totalChunks; i++) {
            console.log(`Simulating direct client-side upload of chunk ${i}/${totalChunks} for "${doc.name}"...`);
            await simulateDelay(null, 80); // Simulate network latency for each chunk
            onProgress((i / totalChunks) * 100);
        }
        console.log(`Chunked upload simulation for "${doc.name}" complete. Frontend will now notify backend.`);
        return { success: true };
    })();
  },

  finalizeDocumentUpload: async (documentId: number, actorId: number) => {
      const doc = documents.find(d => d.id === documentId);
      if (!doc) {
          return Promise.reject('Document not found');
      }
      
      doc.status = DocumentStatus.SCANNING;
      
      await simulateDelay(null, 1500); // Simulate scanning time

      // Simulate scan result
      const isSafe = Math.random() > 0.1; // 90% chance of being safe
      doc.status = isSafe ? DocumentStatus.APPROVED : DocumentStatus.QUARANTINED;

      if (isSafe) {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          // Enhance with AI-powered content indexing
          try {
              const prompt = `Based on the document title "${doc.name}" and its category "${doc.category}", generate a concise, 2-3 sentence summary of its likely contents for a search index within a construction project management app. Focus on keywords relevant to construction.`;
              const response = await ai.models.generateContent({
                  model: 'gemini-2.5-flash',
                  contents: prompt,
              });
              doc.indexedContent = response.text;
          } catch (error) {
              console.error("AI content indexing failed:", error);
              doc.indexedContent = `Content indexing for ${doc.name}. Category: ${doc.category}.`;
          }

          // AI-powered category suggestion
          if (doc.indexedContent) {
            try {
                const categoryPrompt = `You are an intelligent document classifier for a construction management system. Based on the document's title and content summary, choose the most appropriate category.
Title: "${doc.name}"
Content Summary: "${doc.indexedContent}"
Respond with a JSON object.`;
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: categoryPrompt,
                    config: {
                        responseMimeType: 'application/json',
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                category: {
                                    type: Type.STRING,
                                    enum: Object.values(DocumentCategory)
                                }
                            }
                        }
                    }
                });

                const { category: suggestedCategory } = JSON.parse(response.text);
                if (suggestedCategory && Object.values(DocumentCategory).includes(suggestedCategory)) {
                    doc.category = suggestedCategory;
                     addAuditLog({
                        projectId: doc.projectId,
                        actorId,
                        action: AuditLogAction.AI_DOCUMENT_CATEGORY_SUGGESTED,
                        target: { type: 'document', id: doc.id, name: `for "${doc.name}" to ${suggestedCategory}` },
                    });
                }
            } catch (error) {
                 console.error("AI category suggestion failed:", error);
                 // Fail silently, keep original category
            }
          }
          
          // Simulate giving it a "real" URL after approval
          if (doc.name.endsWith('.pdf')) {
            doc.url = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
          } else if (doc.name.endsWith('.png') || doc.name.endsWith('.jpg')) {
            doc.url = 'https://placehold.co/800x600.png';
          } else {
            doc.url = '#'
          }
          
          addAuditLog({
              projectId: doc.projectId,
              actorId,
              action: AuditLogAction.DOCUMENT_UPLOADED,
              target: { type: 'document', id: doc.id, name: doc.name },
          });

      } else {
        doc.indexedContent = 'File quarantined due to security scan. Content not indexed.';
      }
      
      return simulateDelay(doc);
  },

  revertToDocumentVersion: (documentIdToRevert: number, actorId: number) => {
    const docToRevert = documents.find(d => d.id === documentIdToRevert);
    if (!docToRevert) {
      return Promise.reject('Document version not found.');
    }

    // Find all versions of this document to determine the next version number
    const allVersions = documents.filter(d => d.documentGroupId === docToRevert.documentGroupId);
    const latestVersionNumber = Math.max(...allVersions.map(v => v.version));
    const newVersionNumber = latestVersionNumber + 1;

    // Create a new document object by copying the old one.
    // This creates a new version instead of overwriting history.
    const newDoc: Document = {
      ...docToRevert,
      id: Math.max(...documents.map(d => d.id), 0) + 1,
      version: newVersionNumber,
      uploadedAt: new Date(),
      status: DocumentStatus.APPROVED, // A reverted version is implicitly approved
    };
    
    documents.unshift(newDoc); // Add to the beginning of the array to appear first

    addAuditLog({
        projectId: newDoc.projectId,
        actorId,
        action: AuditLogAction.DOCUMENT_VERSION_REVERTED,
        target: { type: 'document', id: newDoc.id, name: `${newDoc.name} (reverted to v${docToRevert.version})` },
    });

    return simulateDelay(newDoc);
  },

  linkDocuments: (sourceDocId: number, targetDocId: number, actorId: number) => {
      const sourceDoc = documents.find(d => d.id === sourceDocId);
      const targetDoc = documents.find(d => d.id === targetDocId);
      if (!sourceDoc || !targetDoc) {
        return Promise.reject('One or both documents not found.');
      }
      
      // Add link from source to target
      if (!sourceDoc.relatedDocumentIds) sourceDoc.relatedDocumentIds = [];
      if (!sourceDoc.relatedDocumentIds.includes(targetDocId)) {
        sourceDoc.relatedDocumentIds.push(targetDocId);
      }
      
      // Add link from target to source (bidirectional)
      if (!targetDoc.relatedDocumentIds) targetDoc.relatedDocumentIds = [];
      if (!targetDoc.relatedDocumentIds.includes(sourceDocId)) {
        targetDoc.relatedDocumentIds.push(sourceDocId);
      }
      
      addAuditLog({
          projectId: sourceDoc.projectId,
          actorId,
          action: AuditLogAction.DOCUMENT_LINK_ADDED,
          target: { type: 'document', id: sourceDocId, name: `'${sourceDoc.name}' to '${targetDoc.name}'`},
      });

      return simulateDelay({ success: true });
  },

  unlinkDocuments: (sourceDocId: number, targetDocId: number, actorId: number) => {
      const sourceDoc = documents.find(d => d.id === sourceDocId);
      const targetDoc = documents.find(d => d.id === targetDocId);
      if (!sourceDoc || !targetDoc) {
        return Promise.reject('One or both documents not found.');
      }
      
      // Remove link from source
      if (sourceDoc.relatedDocumentIds) {
        sourceDoc.relatedDocumentIds = sourceDoc.relatedDocumentIds.filter(id => id !== targetDocId);
      }

      // Remove link from target
      if (targetDoc.relatedDocumentIds) {
        targetDoc.relatedDocumentIds = targetDoc.relatedDocumentIds.filter(id => id !== sourceDocId);
      }

       addAuditLog({
          projectId: sourceDoc.projectId,
          actorId,
          action: AuditLogAction.DOCUMENT_LINK_REMOVED,
          target: { type: 'document', id: sourceDocId, name: `link between '${sourceDoc.name}' and '${targetDoc.name}'`},
      });

      return simulateDelay({ success: true });
  },

  suggestDocumentLinks: async (sourceDoc: Document, allDocs: Document[]): Promise<{ suggestedIds: number[] }> => {
    const candidateDocs = allDocs.filter(
      d => d.id !== sourceDoc.id &&
           d.status === DocumentStatus.APPROVED &&
           !sourceDoc.relatedDocumentIds?.includes(d.id)
    );

    if (candidateDocs.length === 0) {
      return { suggestedIds: [] };
    }

    const formattedCandidates = candidateDocs.map(d => ({
      id: d.id,
      title: d.name,
      category: d.category,
      content: d.indexedContent?.substring(0, 200) + '...' || 'No content summary.' // Truncate for prompt efficiency
    }));

    const prompt = `You are a document analysis expert for a construction management system.
Your task is to find relevant documents to link together.

Here is the source document:
- Title: "${sourceDoc.name}"
- Category: "${sourceDoc.category}"
- Content Summary: "${sourceDoc.indexedContent}"

Here is a list of other available documents on the project:
${JSON.stringify(formattedCandidates, null, 2)}

Based on content, title, and category similarity, identify up to 3 of the most relevant documents from the list to link to the source document.
Prioritize documents that are complementary (e.g., a Safety Manual and a related Risk Assessment) or directly related (e.g., a blueprint and a structural calculation document).

Return your response as a JSON object.`;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              suggested_ids: {
                type: Type.ARRAY,
                description: "An array of numeric document IDs that are most relevant.",
                items: { type: Type.INTEGER }
              }
            }
          }
        }
      });
      
      const result = JSON.parse(response.text);
      // Ensure the result is in the expected format
      if (result && Array.isArray(result.suggested_ids)) {
        return { suggestedIds: result.suggested_ids };
      }
      return { suggestedIds: [] };

    } catch (error) {
      console.error("AI document link suggestion failed:", error);
      // Don't throw, just return empty so the UI doesn't break
      return { suggestedIds: [] };
    }
  },

  askAiAboutDocument: async (documentId: number, question: string, actorId: number): Promise<{ answer: string }> => {
    const doc = documents.find(d => d.id === documentId);
    if (!doc || !doc.indexedContent) {
      return Promise.reject('Document not found or not indexed.');
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const systemInstruction = `You are a helpful assistant for a construction project management app. Your task is to answer questions based ONLY on the provided document content. If the answer cannot be found in the content, you MUST state "The answer to your question cannot be found in this document." Do not use any external knowledge. Be concise.

DOCUMENT CONTENT:
---
${doc.indexedContent}
---
`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: question,
        config: { systemInstruction },
      });

      addAuditLog({
          projectId: doc.projectId,
          actorId,
          action: AuditLogAction.DOCUMENT_AI_QUERY,
          target: { type: 'document', id: doc.id, name: `on "${doc.name}"` },
      });

      return { answer: response.text };

    } catch (error) {
        console.error("AI query failed:", error);
        throw new Error("Failed to get response from AI assistant.");
    }
  },

  addTodo: (todo: Omit<Todo, 'id' | 'status' | 'createdAt'>, actorId: number) => {
    const newTodo: Todo = {
      ...todo,
      id: Math.max(...todos.map(t => t.id), 0) + 1,
      status: TodoStatus.TODO,
      createdAt: new Date(),
    };
    todos.push(newTodo);
    addAuditLog({
        projectId: newTodo.projectId,
        actorId,
        action: AuditLogAction.TODO_ADDED,
        target: { type: 'todo', id: newTodo.id, name: newTodo.text },
    });
    return simulateDelay(newTodo);
  },

  updateTodo: (todoId: number, updates: Partial<Todo>, actorId: number) => {
    const todo = todos.find(t => t.id === todoId);
    if (todo) {
      if (updates.status && updates.status !== todo.status) {
          addAuditLog({ projectId: todo.projectId, actorId, action: AuditLogAction.TODO_STATUS_CHANGED, target: { type: 'todo', id: todoId, name: `"${todo.text}" to ${updates.status}` }});
      }
       if (updates.priority && updates.priority !== todo.priority) {
          addAuditLog({ projectId: todo.projectId, actorId, action: AuditLogAction.TODO_PRIORITY_CHANGED, target: { type: 'todo', id: todoId, name: `priority for "${todo.text}" to ${updates.priority}` }});
      }
      if (updates.dueDate && new Date(updates.dueDate).getTime() !== new Date(todo.dueDate || '').getTime()) {
          addAuditLog({ projectId: todo.projectId, actorId, action: AuditLogAction.TODO_DUE_DATE_CHANGED, target: { type: 'todo', id: todoId, name: `due date for "${todo.text}"` }});
      }
      Object.assign(todo, updates);
      return simulateDelay(todo);
    }
    return Promise.reject('Todo not found');
  },
  
  updateTodoReminder: (todoId: number, reminderAt: Date | undefined, actorId: number) => {
      const todo = todos.find(t => t.id === todoId);
      if(todo) {
          todo.reminderAt = reminderAt;
          addAuditLog({ projectId: todo.projectId, actorId, action: AuditLogAction.TODO_REMINDER_SET, target: { type: 'todo', id: todoId, name: `for "${todo.text}"` }});
          return simulateDelay(todo);
      }
      return Promise.reject('Todo not found');
  },
  
  deleteTodo: (todoId: number, actorId: number) => {
      const todoIndex = todos.findIndex(t => t.id === todoId);
      if (todoIndex > -1) {
          const todo = todos[todoIndex];
          todos.splice(todoIndex, 1);
          // Simplified audit log - in a real app, you might want more detail
          addAuditLog({ projectId: todo.projectId, actorId, action: AuditLogAction.TODO_COMPLETED, target: { type: 'todo', id: todoId, name: `"${todo.text}" deleted` }});
          return simulateDelay({ success: true });
      }
      return Promise.reject('Todo not found');
  },

  addSubTask: (todoId: number, subTaskText: string, actorId: number) => {
      const todo = todos.find(t => t.id === todoId);
      if (todo) {
          if (!todo.subTasks) todo.subTasks = [];
          const newSubTask: SubTask = { id: Date.now(), text: subTaskText, completed: false };
          todo.subTasks.push(newSubTask);
          addAuditLog({ projectId: todo.projectId, actorId, action: AuditLogAction.SUBTASK_ADDED, target: { type: 'todo', id: todoId, name: `"${subTaskText}" to "${todo.text}"` }});
          return simulateDelay(todo);
      }
      return Promise.reject('Todo not found');
  },
  
  updateSubTask: (todoId: number, subTaskId: number, updates: Partial<SubTask>, actorId: number) => {
       const todo = todos.find(t => t.id === todoId);
       if (todo && todo.subTasks) {
           const subTask = todo.subTasks.find(st => st.id === subTaskId);
           if (subTask) {
               if (updates.completed !== undefined) {
                   addAuditLog({ projectId: todo.projectId, actorId, action: updates.completed ? AuditLogAction.SUBTASK_COMPLETED : AuditLogAction.SUBTASK_UPDATED, target: { type: 'todo', id: todoId, name: `"${subTask.text}" in "${todo.text}"` }});
               }
               Object.assign(subTask, updates);
               return simulateDelay(todo);
           }
       }
       return Promise.reject('SubTask not found');
  },
  
  deleteSubTask: (todoId: number, subTaskId: number, actorId: number) => {
      const todo = todos.find(t => t.id === todoId);
      if (todo && todo.subTasks) {
          const subTaskIndex = todo.subTasks.findIndex(st => st.id === subTaskId);
          if (subTaskIndex > -1) {
              const subTask = todo.subTasks[subTaskIndex];
              todo.subTasks.splice(subTaskIndex, 1);
              addAuditLog({ projectId: todo.projectId, actorId, action: AuditLogAction.SUBTASK_DELETED, target: { type: 'todo', id: todoId, name: `"${subTask.text}" from "${todo.text}"` }});
              return simulateDelay(todo);
          }
      }
      return Promise.reject('SubTask not found');
  },
  
  addComment: (todoId: number, commentText: string, actorId: number) => {
      const todo = todos.find(t => t.id === todoId);
      if (todo) {
          if (!todo.comments) todo.comments = [];
          const newComment: Comment = { id: Date.now(), text: commentText, creatorId: actorId, createdAt: new Date() };
          todo.comments.push(newComment);
          addAuditLog({ projectId: todo.projectId, actorId, action: AuditLogAction.TODO_COMMENT_ADDED, target: { type: 'todo', id: todoId, name: `on "${todo.text}"` }});
          return simulateDelay(todo);
      }
      return Promise.reject('Todo not found');
  },

  generateTasksWithAi: async (projectId: number, goal: string, actorId: number): Promise<Todo[]> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `The high-level goal for this phase of a construction project is: "${goal}". Break this down into a list of actionable tasks.`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        tasks: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    text: { type: Type.STRING },
                                    priority: { type: Type.STRING, enum: Object.values(TodoPriority) },
                                },
                            },
                        },
                    },
                },
            },
        });
        
        const parsedResponse = JSON.parse(response.text);
        const generatedTasks: { text: string; priority: TodoPriority }[] = parsedResponse.tasks || [];
        
        const newTodos: Todo[] = [];
        for (const task of generatedTasks) {
            const newTodo = await api.addTodo({
                text: task.text,
                priority: task.priority || TodoPriority.MEDIUM,
                projectId,
                creatorId: actorId,
            }, actorId);
            newTodos.push(newTodo);
        }
        
        return newTodos;

    } catch (error) {
        console.error("AI task generation failed:", error);
        throw new Error("Failed to generate tasks with AI.");
    }
  },
  
  reportSafetyIncident: async (incidentData: Omit<SafetyIncident, 'id' | 'aiSummary'>): Promise<SafetyIncident> => {
      // Simulate AI summary generation
      let summary = 'No AI summary available.';
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Summarize this construction site safety incident report into one sentence: "${incidentData.description}"`
          });
          summary = response.text;
      } catch (error) {
          console.error("AI summary generation failed:", error);
      }

      const newIncident: SafetyIncident = {
          ...incidentData,
          id: Math.max(...safetyIncidents.map(i => i.id), 0) + 1,
          aiSummary: summary,
      };
      
      safetyIncidents.unshift(newIncident);
      addAuditLog({
          projectId: newIncident.projectId,
          actorId: newIncident.reporterId,
          action: AuditLogAction.SAFETY_INCIDENT_REPORTED,
          target: { type: 'safetyIncident', id: newIncident.id, name: `${newIncident.type} incident` },
      });
      return simulateDelay(newIncident);
  },
  
  getAuditLogsByProject: (projectId: number) => {
    return simulateDelay(auditLogs.filter(log => log.projectId === projectId));
  },
  
  getAcksByDocument: (projectId: number) => {
      const projectDocIds = documents.filter(d => d.projectId === projectId).map(d => d.id);
      return simulateDelay(documentAcks.filter(ack => projectDocIds.includes(ack.documentId)));
  },
  
  getAcksByUser: (userId: number) => {
      return simulateDelay(documentAcks.filter(ack => ack.userId === userId));
  },

  acknowledgeDocument: (userId: number, documentId: number) => {
      if (!documentAcks.some(ack => ack.userId === userId && ack.documentId === documentId)) {
          const newAck: DocumentAcknowledgement = {
              id: documentAcks.length + 1,
              userId,
              documentId,
              acknowledgedAt: new Date(),
          };
          documentAcks.push(newAck);
          
          const doc = documents.find(d => d.id === documentId);
          if (doc) {
              addAuditLog({
                  projectId: doc.projectId,
                  actorId: userId,
                  action: AuditLogAction.DOCUMENT_ACKNOWLEDGED,
                  target: { type: 'document', id: documentId, name: doc.name },
              });
          }
          return simulateDelay(newAck);
      }
      return Promise.reject("Document already acknowledged.");
  },
  
  getPhotosByProject: (projectId: number) => simulateDelay(photos.filter(p => p.projectId === projectId).sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())),

  uploadPhoto: async (projectId: number, uploaderId: number, base64ImageDataWithPrefix: string): Promise<Photo> => {
    const base64Data = base64ImageDataWithPrefix.split(',')[1];
    if (!base64Data) {
        throw new Error("Invalid image data provided.");
    }

    let description = 'Image analysis failed.';
    let tags: string[] = [];
    let safetyHazard: string | null = 'Analysis pending';

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const mimeType = base64ImageDataWithPrefix.match(/data:(.*);base64/)?.[1] || 'image/jpeg';

        const imagePart = {
            inlineData: {
                mimeType,
                data: base64Data,
            },
        };
        const textPart = {
            text: `Analyze this construction site photo. Describe what you see in one sentence. Identify potential safety hazards (e.g., "Improperly stacked materials", "Missing guardrail", "Personnel without PPE"). If no hazards are obvious, respond with "None". Finally, provide a list of relevant tags for searching (e.g., "excavation", "rebar", "concrete pour", "scaffolding").`,
        };
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                 responseMimeType: "application/json",
                 responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        description: { type: Type.STRING },
                        safety_hazard: { type: Type.STRING },
                        tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                    }
                 }
            }
        });

        const parsedResponse = JSON.parse(response.text);
        description = parsedResponse.description;
        tags = parsedResponse.tags;
        safetyHazard = parsedResponse.safety_hazard;

    } catch (error) {
        console.error("AI photo analysis failed:", error);
        // Fallback values are already set
    }

    const newPhoto: Photo = {
        id: photos.length + 1,
        projectId,
        uploaderId,
        uploadedAt: new Date(),
        url: base64ImageDataWithPrefix, // Store the full data URL
        description,
        tags,
        safetyHazard,
    };
    photos.unshift(newPhoto);
    addAuditLog({
        projectId,
        actorId: uploaderId,
        action: AuditLogAction.PHOTO_UPLOADED,
        target: { type: 'photo', id: newPhoto.id, name: newPhoto.description.substring(0, 30) + '...' },
    });
    return simulateDelay(newPhoto);
  },
  
  generateDailyLogSummary: async (logs: DailyLog[]): Promise<string> => {
    if (logs.length === 0) {
      return "No logs provided for summary.";
    }

    const formattedLogs = logs.map(log => 
        `Date: ${new Date(log.date).toLocaleDateString()}\nWeather: ${log.weather}, ${log.temperature}°C\nNotes: ${log.notes}\n`
    ).join('---\n');
    
    const prompt = `You are a helpful assistant for a construction project manager. Your task is to summarize the following daily logs into a professional, concise report. Highlight key progress, any mentioned blockers or delays, and important deliveries or milestones. Use markdown formatting with headings for 'Progress', 'Blockers', and 'Deliveries'.

Here are the logs:
${formattedLogs}`;
    
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("AI daily log summary generation failed:", error);
        throw new Error("Failed to generate AI summary.");
    }
  },

  getFlaggedTimesheetsByCompany: (companyId: number) => {
    const projectIds = rawProjects.filter(p => p.companyId === companyId).map(p => p.id);
    const flagged = timesheets.filter(t => projectIds.includes(t.projectId) && t.status === TimesheetStatus.FLAGGED);
    return simulateDelay(flagged);
  },
  getRecentActivityByCompany: (companyId: number, limit: number) => {
    const projectIds = rawProjects.filter(p => p.companyId === companyId).map(p => p.id);
    const activity = auditLogs.filter(log => log.projectId && projectIds.includes(log.projectId));
    return simulateDelay(activity.slice(0, limit));
  },
  inviteUser: (invite: { email: string, name: string, role: Role, companyId: number }) => {
    const newUser: User = {
        ...invite,
        id: Math.max(...users.map(u => u.id), 0) + 1,
        createdAt: new Date(),
    };
    users.push(newUser);
    return simulateDelay(newUser);
  },
  updateUser: (userId: number, updates: Partial<User>) => {
      const user = users.find(u => u.id === userId);
      if (user) {
          Object.assign(user, updates);
          return simulateDelay(user);
      }
      return Promise.reject('User not found');
  },
  getDocumentsByCompany: (companyId: number) => {
    const projectIds = rawProjects.filter(p => p.companyId === companyId).map(p => p.id);
    return simulateDelay(documents.filter(d => projectIds.includes(d.projectId)));
  },
  getDocumentsByProjectIds: (projectIds: number[]) => {
      return simulateDelay(documents.filter(doc => projectIds.includes(doc.projectId)));
  },
  addDailyLog: (log: Omit<DailyLog, 'id'>, actorId: number) => {
    const newLog: DailyLog = {
      ...log,
      id: Math.max(...dailyLogs.map(l => l.id), 0) + 1,
    };
    dailyLogs.unshift(newLog);
    addAuditLog({
        projectId: newLog.projectId,
        actorId,
        action: AuditLogAction.DAILY_LOG_ADDED,
        target: { type: 'project', id: newLog.projectId, name: `Log for ${new Date(newLog.date).toLocaleDateString()}` },
    });
    return simulateDelay(newLog);
  },
  createRFI: (rfi: Omit<RFI, 'id' | 'status' | 'createdAt'>, actorId: number) => {
    const newRFI: RFI = {
      ...rfi,
      id: Math.max(...rfis.map(r => r.id), 0) + 1,
      status: RFIStatus.OPEN,
      createdAt: new Date(),
    };
    rfis.unshift(newRFI);
    addAuditLog({
        projectId: newRFI.projectId,
        actorId,
        action: AuditLogAction.RFI_CREATED,
        target: { type: 'rfi', id: newRFI.id, name: newRFI.subject },
    });
    return simulateDelay(newRFI);
  },
  updateRFI: (rfiId: number, updates: Partial<RFI>, actorId: number) => {
      const rfi = rfis.find(r => r.id === rfiId);
      if (rfi) {
          if(updates.answer && !rfi.answer) {
              updates.status = RFIStatus.ANSWERED;
              updates.answeredAt = new Date();
              addAuditLog({
                  projectId: rfi.projectId,
                  actorId,
                  action: AuditLogAction.RFI_ANSWERED,
                  target: { type: 'rfi', id: rfiId, name: rfi.subject },
              });
          }
           if (updates.assigneeId && rfi.assigneeId !== updates.assigneeId) {
                addAuditLog({
                  projectId: rfi.projectId,
                  actorId,
                  action: AuditLogAction.RFI_ASSIGNEE_CHANGED,
                  target: { type: 'rfi', id: rfiId, name: rfi.subject },
              });
           }
          Object.assign(rfi, updates);
          return simulateDelay(rfi);
      }
      return Promise.reject("RFI not found.");
  },
  getEquipmentByCompany: (companyId: number) => {
    return simulateDelay(equipment.filter(e => e.companyId === companyId));
  },
  assignEquipmentToProject: (equipmentId: number, projectId: number, actorId: number) => {
      const item = equipment.find(e => e.id === equipmentId);
      if (item) {
          item.projectId = projectId;
          item.status = EquipmentStatus.IN_USE;
           addAuditLog({
              projectId: projectId,
              actorId,
              action: AuditLogAction.EQUIPMENT_ASSIGNED,
              target: { type: 'project', id: projectId, name: `Equipment "${item.name}"` },
          });
          return simulateDelay({ success: true });
      }
      return Promise.reject("Equipment not found.");
  },
  unassignEquipmentFromProject: (equipmentId: number, actorId: number) => {
      const item = equipment.find(e => e.id === equipmentId);
      if (item && item.projectId) {
          const projectId = item.projectId;
          item.projectId = undefined;
          item.status = EquipmentStatus.AVAILABLE;
          addAuditLog({
              projectId: projectId,
              actorId,
              action: AuditLogAction.EQUIPMENT_UNASSIGNED,
              target: { type: 'project', id: projectId, name: `Equipment "${item.name}"` },
          });
          return simulateDelay({ success: true });
      }
      return Promise.reject("Equipment not found or not assigned.");
  },
  getResourceAssignments: (companyId: number) => {
    const projectIds = rawProjects.filter(p => p.companyId === companyId).map(p => p.id);
    const companyAssignments = resourceAssignments.filter(ra => projectIds.includes(ra.projectId));
    return simulateDelay(companyAssignments);
  },
  generateProjectHealthReport: async (project: Project, todos: Todo[], incidents: SafetyIncident[], logs: AuditLog[], personnel: User[], documents: Document[]): Promise<ProjectHealth> => {
      const prompt = `
        Analyze the health of the construction project "${project.name}".
        Data points:
        - Tasks: ${todos.length} total. ${todos.filter(t => t.status === 'Done').length} completed. ${todos.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done').length} overdue.
        - Safety Incidents: ${incidents.length} total. ${incidents.filter(i => i.severity === IncidentSeverity.HIGH || i.severity === IncidentSeverity.CRITICAL).length} are high/critical severity.
        - Team size: ${personnel.length} personnel.
        - Recent Activity: ${logs.slice(0, 5).map(l => l.action).join(', ')}.
        - Documents: ${documents.length} total. ${documents.filter(d => d.status === DocumentStatus.QUARANTINED).length} quarantined.
        Based on this data, provide a project health report. Respond with a JSON object.
      `;
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.INTEGER, description: "An integer from 0 (critical) to 100 (perfect)." },
                        summary: { type: Type.STRING, description: "A concise, one-sentence summary of the project's current state." },
                        risks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 2-3 strings highlighting the most significant risks or negative trends." },
                        positives: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 1-2 strings highlighting positive aspects or progress." },
                    }
                }
            }
        });
        return JSON.parse(response.text);
      } catch (error) {
        console.error("AI health report failed:", error);
        return { score: 40, summary: "AI analysis failed. Manual review required.", risks: ["Could not connect to AI service."], positives: [] };
      }
  },
  getProjectHealthReportsForCompany: async function(companyId: number): Promise<(ProjectHealth & {projectId: number})[]> {
    const companyProjects = rawProjects.filter(p => p.companyId === companyId);
    const reports = await Promise.all(companyProjects.map(async (rawP) => {
        const p = enrichProject(rawP);
        if (!p) return null;
        const [todos, incidents, logs, personnel, documents] = await Promise.all([
            this.getTodosByProject(p.id), this.getIncidentsByProject(p.id),
            this.getAuditLogsByProject(p.id), this.getUsersByProject(p.id),
            this.getDocumentsByProject(p.id),
        ]);
        const health = await this.generateProjectHealthReport(p, todos, incidents, logs, personnel, documents);
        return { ...health, projectId: p.id };
    }));
    return reports.filter((r): r is (ProjectHealth & {projectId: number}) => r !== null);
  },
  suggestRFIAssignee: async (question: string, personnel: User[]): Promise<{ userId: number | null }> => {
    if (personnel.length === 0) return { userId: null };
    const formattedPersonnel = personnel.map(p => ({ id: p.id, name: p.name, role: p.role }));
    const prompt = `You are an expert construction project assistant. Your task is to suggest the best person to answer a Request for Information (RFI) based on their role.
        RFI Question: "${question}"
        Available Personnel: ${JSON.stringify(formattedPersonnel, null, 2)}
        Analyze the question and choose the most appropriate person. Respond with a JSON object.`;
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: { type: Type.OBJECT, properties: { suggested_user_id: { type: Type.INTEGER } } }
            }
        });
        const result = JSON.parse(response.text);
        return { userId: result?.suggested_user_id || null };
    } catch (error) {
        console.error("AI assignee suggestion failed:", error); return { userId: null };
    }
  },
  estimateProjectCostsWithAi: async (project: Project, scope: string, actorId: number): Promise<CostEstimate[]> => {
    const prompt = `You are a cost estimator for a construction company. Project: "${project.name}". Scope of Work: "${scope}". Provide a preliminary cost estimate breakdown. Include categories for Materials, Labor, Equipment, Permits, Other. For each line item provide: category, item, quantity, unitCost, totalCost, and justification. Respond with a JSON object containing an array of cost estimate items.`;
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT, properties: {
                        estimates: { type: Type.ARRAY, items: {
                            type: Type.OBJECT, properties: {
                                category: { type: Type.STRING, enum: ['Materials', 'Labor', 'Equipment', 'Permits', 'Other'] },
                                item: { type: Type.STRING }, quantity: { type: Type.STRING }, unitCost: { type: Type.NUMBER },
                                totalCost: { type: Type.NUMBER }, justification: { type: Type.STRING },
                            }
                        }}
                    }
                }
            }
        });
        addAuditLog({ projectId: project.id, actorId, action: AuditLogAction.COST_ESTIMATE_GENERATED, target: { type: 'project', id: project.id, name: `for scope: "${scope.substring(0, 30)}..."` }, });
        const result = JSON.parse(response.text);
        return result.estimates || [];
    } catch (error) {
        console.error("AI cost estimation failed:", error); throw new Error("Failed to generate AI cost estimate.");
    }
  },
  generateSafetyAnalysis: async (incidents: SafetyIncident[], projectId: number, actorId: number): Promise<{ report: string }> => {
    const formattedIncidents = incidents.map(i => `- ${i.type} (${i.severity}): ${i.description}`).join('\n');
    const prompt = `As a construction safety expert, analyze the following safety incidents: ${formattedIncidents}. Provide a concise report with: 1. Key Trends, 2. Potential Root Causes, 3. Recommendations. Format as markdown.`;
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        addAuditLog({ projectId, actorId, action: AuditLogAction.SAFETY_ANALYSIS_GENERATED, target: { type: 'project', id: projectId, name: `for project` } });
        return { report: response.text };
    } catch (error) {
        console.error("AI safety analysis failed:", error); throw new Error("Failed to generate AI safety analysis.");
    }
  },
  searchAcrossDocuments: async (query: string, projectIds: number[], actorId: number): Promise<AISearchResult> => {
    const relevantDocs = documents.filter(d => projectIds.includes(d.projectId) && d.status === DocumentStatus.APPROVED && d.indexedContent);
    if (relevantDocs.length === 0) return { summary: "No relevant documents were found to search within.", sources: [] };
    const context = relevantDocs.map(d => `--- Document ID: ${d.id}, Name: ${d.name} ---\n${d.indexedContent}\n--- End Document ---`).join('\n\n');
    const prompt = `Answer the user's question based ONLY on the provided document contexts. Question: "${query}". Contexts: ${context}. Task: 1. Provide a concise "summary". 2. Identify "sources", extracting a relevant "snippet" for each. Respond with a JSON object.`;
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT, properties: {
                        summary: { type: Type.STRING },
                        sources: { type: Type.ARRAY, items: {
                            type: Type.OBJECT, properties: { documentId: { type: Type.INTEGER }, snippet: { type: Type.STRING }, }
                        }}
                    }
                }
            }
        });
        if (projectIds.length === 1) {
            addAuditLog({ projectId: projectIds[0], actorId, action: AuditLogAction.AI_PROJECT_SEARCH, target: { type: 'project', id: projectIds[0], name: `query: "${query.substring(0, 30)}..."` } });
        }
        return JSON.parse(response.text);
    } catch (error) {
        console.error("AI search failed:", error); throw new Error("Failed to perform AI search.");
    }
  },
};