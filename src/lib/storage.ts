// Local storage utilities for simulating database
export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'student' | 'staff' | 'admin';
  department: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
}

export interface Issue {
  id: string;
  userId: string;
  type: 'infrastructure' | 'harassment' | 'technical' | 'suggestion';
  title: string;
  description: string;
  location: {
    name: string;
    coordinates?: { lat: number; lng: number };
  };
  priority: 'low' | 'medium' | 'high';
  status: 'new' | 'in-progress' | 'under-review' | 'resolved' | 'closed';
  isAnonymous: boolean;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  comments: Comment[];
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
  issueId?: string;
}

// Sample data
const sampleUsers: User[] = [
  {
    id: '1',
    email: 'admin@campus.edu',
    password: 'admin123',
    name: 'Dr. Sarah Johnson',
    role: 'admin',
    department: 'Campus Administration',
    phone: '+1 555-0100',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    email: 'student@campus.edu',
    password: 'student123',
    name: 'Alex Thompson',
    role: 'student',
    department: 'Computer Science',
    phone: '+1 555-0101',
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: '3',
    email: 'staff@campus.edu',
    password: 'staff123',
    name: 'Michael Chen',
    role: 'staff',
    department: 'Engineering',
    phone: '+1 555-0102',
    createdAt: '2024-02-01T00:00:00Z',
  },
];

const sampleIssues: Issue[] = [
  {
    id: '1',
    userId: '2',
    type: 'infrastructure',
    title: 'Broken Water Fountain in Science Building',
    description: 'The water fountain on the 3rd floor of the Science Building has been leaking for the past week. It creates a slippery hazard for students.',
    location: { name: 'Science Building, Floor 3', coordinates: { lat: 40.7128, lng: -74.006 } },
    priority: 'medium',
    status: 'in-progress',
    isAnonymous: false,
    attachments: [],
    createdAt: '2024-12-28T10:30:00Z',
    updatedAt: '2024-12-29T14:00:00Z',
    assignedTo: '1',
    comments: [
      {
        id: 'c1',
        userId: '1',
        userName: 'Dr. Sarah Johnson',
        content: 'Maintenance team has been notified. Expected fix within 48 hours.',
        isInternal: false,
        createdAt: '2024-12-29T14:00:00Z',
      },
    ],
  },
  {
    id: '2',
    userId: '2',
    type: 'technical',
    title: 'WiFi connectivity issues in Library',
    description: 'Students are experiencing frequent WiFi disconnections in the main library reading area. This is affecting study sessions and online research.',
    location: { name: 'Main Library, Ground Floor', coordinates: { lat: 40.7138, lng: -74.005 } },
    priority: 'high',
    status: 'new',
    isAnonymous: false,
    attachments: [],
    createdAt: '2024-12-30T09:15:00Z',
    updatedAt: '2024-12-30T09:15:00Z',
    comments: [],
  },
  {
    id: '3',
    userId: '3',
    type: 'suggestion',
    title: 'Add more charging stations in Student Center',
    description: 'With increasing reliance on electronic devices, it would be beneficial to install additional USB charging stations throughout the Student Center.',
    location: { name: 'Student Center', coordinates: { lat: 40.7148, lng: -74.004 } },
    priority: 'low',
    status: 'under-review',
    isAnonymous: false,
    attachments: [],
    createdAt: '2024-12-25T16:45:00Z',
    updatedAt: '2024-12-27T11:30:00Z',
    assignedTo: '1',
    comments: [],
  },
  {
    id: '4',
    userId: '2',
    type: 'harassment',
    title: 'Concerning behavior reported near parking lot',
    description: 'An individual has been observed making inappropriate comments to students near Parking Lot B during evening hours.',
    location: { name: 'Parking Lot B', coordinates: { lat: 40.7118, lng: -74.007 } },
    priority: 'high',
    status: 'resolved',
    isAnonymous: true,
    attachments: [],
    createdAt: '2024-12-20T18:00:00Z',
    updatedAt: '2024-12-22T10:00:00Z',
    assignedTo: '1',
    comments: [
      {
        id: 'c2',
        userId: '1',
        userName: 'Dr. Sarah Johnson',
        content: 'Campus security has increased patrols in this area. Thank you for reporting.',
        isInternal: false,
        createdAt: '2024-12-21T09:00:00Z',
      },
    ],
  },
  {
    id: '5',
    userId: '3',
    type: 'infrastructure',
    title: 'Elevator out of service in Engineering Building',
    description: 'The main elevator in the Engineering Building has been non-functional for 3 days. This is causing accessibility issues for students with disabilities.',
    location: { name: 'Engineering Building', coordinates: { lat: 40.7158, lng: -74.003 } },
    priority: 'high',
    status: 'in-progress',
    isAnonymous: false,
    attachments: [],
    createdAt: '2024-12-29T08:00:00Z',
    updatedAt: '2024-12-30T10:00:00Z',
    assignedTo: '1',
    comments: [],
  },
];

const sampleNotifications: Notification[] = [
  {
    id: '1',
    userId: '2',
    title: 'Issue Update',
    message: 'Your issue "Broken Water Fountain" has been assigned to maintenance.',
    type: 'info',
    isRead: false,
    createdAt: '2024-12-29T14:00:00Z',
    issueId: '1',
  },
  {
    id: '2',
    userId: '2',
    title: 'Issue Resolved',
    message: 'Your anonymous report has been resolved. Thank you for helping keep our campus safe.',
    type: 'success',
    isRead: true,
    createdAt: '2024-12-22T10:00:00Z',
    issueId: '4',
  },
];

// Initialize storage with sample data
export const initializeStorage = () => {
  if (!localStorage.getItem('campus_users')) {
    localStorage.setItem('campus_users', JSON.stringify(sampleUsers));
  }
  if (!localStorage.getItem('campus_issues')) {
    localStorage.setItem('campus_issues', JSON.stringify(sampleIssues));
  }
  if (!localStorage.getItem('campus_notifications')) {
    localStorage.setItem('campus_notifications', JSON.stringify(sampleNotifications));
  }
};

// User operations
export const getUsers = (): User[] => {
  return JSON.parse(localStorage.getItem('campus_users') || '[]');
};

export const getUserById = (id: string): User | undefined => {
  return getUsers().find(u => u.id === id);
};

export const getUserByEmail = (email: string): User | undefined => {
  return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
};

export const createUser = (user: Omit<User, 'id' | 'createdAt'>): User => {
  const users = getUsers();
  const newUser: User = {
    ...user,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  localStorage.setItem('campus_users', JSON.stringify(users));
  return newUser;
};

export const updateUser = (id: string, updates: Partial<User>): User | undefined => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === id);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    localStorage.setItem('campus_users', JSON.stringify(users));
    return users[index];
  }
  return undefined;
};

// Issue operations
export const getIssues = (): Issue[] => {
  return JSON.parse(localStorage.getItem('campus_issues') || '[]');
};

export const getIssueById = (id: string): Issue | undefined => {
  return getIssues().find(i => i.id === id);
};

export const getIssuesByUserId = (userId: string): Issue[] => {
  return getIssues().filter(i => i.userId === userId);
};

export const createIssue = (issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt' | 'comments'>): Issue => {
  const issues = getIssues();
  const newIssue: Issue = {
    ...issue,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    comments: [],
  };
  issues.push(newIssue);
  localStorage.setItem('campus_issues', JSON.stringify(issues));
  return newIssue;
};

export const updateIssue = (id: string, updates: Partial<Issue>): Issue | undefined => {
  const issues = getIssues();
  const index = issues.findIndex(i => i.id === id);
  if (index !== -1) {
    issues[index] = { ...issues[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem('campus_issues', JSON.stringify(issues));
    return issues[index];
  }
  return undefined;
};

export const deleteIssue = (id: string): boolean => {
  const issues = getIssues();
  const index = issues.findIndex(i => i.id === id);
  if (index !== -1) {
    issues.splice(index, 1);
    localStorage.setItem('campus_issues', JSON.stringify(issues));
    return true;
  }
  return false;
};

export const addComment = (issueId: string, comment: Omit<Comment, 'id' | 'createdAt'>): Issue | undefined => {
  const issues = getIssues();
  const index = issues.findIndex(i => i.id === issueId);
  if (index !== -1) {
    const newComment: Comment = {
      ...comment,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    issues[index].comments.push(newComment);
    issues[index].updatedAt = new Date().toISOString();
    localStorage.setItem('campus_issues', JSON.stringify(issues));
    return issues[index];
  }
  return undefined;
};

// Notification operations
export const getNotifications = (): Notification[] => {
  return JSON.parse(localStorage.getItem('campus_notifications') || '[]');
};

export const getNotificationsByUserId = (userId: string): Notification[] => {
  return getNotifications().filter(n => n.userId === userId);
};

export const createNotification = (notification: Omit<Notification, 'id' | 'createdAt'>): Notification => {
  const notifications = getNotifications();
  const newNotification: Notification = {
    ...notification,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  notifications.push(newNotification);
  localStorage.setItem('campus_notifications', JSON.stringify(notifications));
  return newNotification;
};

export const markNotificationAsRead = (id: string): void => {
  const notifications = getNotifications();
  const index = notifications.findIndex(n => n.id === id);
  if (index !== -1) {
    notifications[index].isRead = true;
    localStorage.setItem('campus_notifications', JSON.stringify(notifications));
  }
};

// Session management
export const getCurrentUser = (): User | null => {
  const session = localStorage.getItem('campus_session');
  if (session) {
    return JSON.parse(session);
  }
  return null;
};

export const setCurrentUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem('campus_session', JSON.stringify(user));
  } else {
    localStorage.removeItem('campus_session');
  }
};

export const logout = (): void => {
  localStorage.removeItem('campus_session');
};
