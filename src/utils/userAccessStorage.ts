import { SystemUser, UserRole, UserPermissions } from '../types/userAccess';

const USERS_STORAGE_KEY = 'labor_law_system_users_v1';
const CURRENT_USER_ID_KEY = 'labor_law_current_user_id_v1';

export const FULL_PERMISSIONS: UserPermissions = {
  canEditTexts: true,
  canAddDocuments: true,
  canDelete: true,
  canManageUsers: true,
  canExportBackup: true,
};

export const EDITOR_PERMISSIONS: UserPermissions = {
  canEditTexts: true,
  canAddDocuments: true,
  canDelete: false,
  canManageUsers: false,
  canExportBackup: true,
};

export const VIEWER_PERMISSIONS: UserPermissions = {
  canEditTexts: false,
  canAddDocuments: false,
  canDelete: false,
  canManageUsers: false,
  canExportBackup: false,
};

// Initial Seed Users with the User as Super Admin
export const SEED_USERS: SystemUser[] = [
  {
    id: 'user-super-admin',
    name: 'المسؤول العام (صلاحيات كاملة)',
    email: 'm.mkhalil871@gmail.com',
    role: 'super_admin',
    permissions: { ...FULL_PERMISSIONS },
    isActive: true,
    accessPin: '1234',
    title: 'المستشار القانوني ومدير المنظومة',
    department: 'الإدارة العليا والشؤون القانونية',
    avatarColor: '#d97706',
    createdAt: '2025-01-01T08:00:00Z',
    lastLogin: new Date().toISOString(),
  },
  {
    id: 'user-legal-editor',
    name: 'أحمد محمود (محرر قانوني)',
    email: 'editor@labor-law.org',
    role: 'editor',
    permissions: { ...EDITOR_PERMISSIONS },
    isActive: true,
    accessPin: '2222',
    title: 'باحث تشريعات عمالية أول',
    department: 'التشريع وبحوث العمل',
    avatarColor: '#0284c7',
    createdAt: '2025-01-15T10:00:00Z',
  },
  {
    id: 'user-hr-viewer',
    name: 'سارة خالد (مستعرض موارد بشرية)',
    email: 'viewer@labor-law.org',
    role: 'viewer',
    permissions: { ...VIEWER_PERMISSIONS },
    isActive: true,
    accessPin: '3333',
    title: 'مسؤولة الامتثال العمالي بالشركات',
    department: 'الموارد البشرية والامتثال',
    avatarColor: '#10b981',
    createdAt: '2025-02-01T09:30:00Z',
  },
];

/**
 * Retrieves all stored system users
 */
export function getStoredUsers(): SystemUser[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(SEED_USERS));
      return SEED_USERS;
    }
    const parsed: SystemUser[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(SEED_USERS));
      return SEED_USERS;
    }
    // Ensure Super Admin always has full permissions
    const superAdminIndex = parsed.findIndex((u) => u.role === 'super_admin' || u.email === 'm.mkhalil871@gmail.com');
    if (superAdminIndex >= 0) {
      parsed[superAdminIndex].permissions = { ...FULL_PERMISSIONS };
      parsed[superAdminIndex].isActive = true;
    }
    return parsed;
  } catch (err) {
    console.error('Error reading stored users:', err);
    return SEED_USERS;
  }
}

/**
 * Saves users list to storage
 */
export function saveStoredUsers(users: SystemUser[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Error saving users:', err);
  }
}

/**
 * Gets the currently active logged-in user
 */
export function getCurrentActiveUser(): SystemUser {
  const users = getStoredUsers();
  try {
    const currentId = localStorage.getItem(CURRENT_USER_ID_KEY);
    if (currentId) {
      const found = users.find((u) => u.id === currentId && u.isActive);
      if (found) return found;
    }
  } catch (err) {
    console.error('Error reading current active user:', err);
  }

  // Default to Super Admin (full permissions)
  const superAdmin = users.find((u) => u.role === 'super_admin') || users[0];
  if (superAdmin) {
    localStorage.setItem(CURRENT_USER_ID_KEY, superAdmin.id);
    return superAdmin;
  }
  return SEED_USERS[0];
}

/**
 * Switches the active logged-in user
 */
export function setCurrentActiveUser(userId: string): boolean {
  try {
    const users = getStoredUsers();
    const target = users.find((u) => u.id === userId);
    if (!target) return false;
    if (!target.isActive) return false; // Inactive user cannot log in
    localStorage.setItem(CURRENT_USER_ID_KEY, userId);
    
    // Update lastLogin
    const updatedUsers = users.map((u) =>
      u.id === userId ? { ...u, lastLogin: new Date().toISOString() } : u
    );
    saveStoredUsers(updatedUsers);
    return true;
  } catch (err) {
    console.error('Error setting current active user:', err);
    return false;
  }
}

/**
 * Adds a new user to the system
 */
export function addSystemUser(newUser: Omit<SystemUser, 'id' | 'createdAt'>): SystemUser {
  const users = getStoredUsers();
  const user: SystemUser = {
    ...newUser,
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    createdAt: new Date().toISOString(),
  };
  const updated = [...users, user];
  saveStoredUsers(updated);
  return user;
}

/**
 * Updates an existing user
 */
export function updateSystemUser(updatedUser: SystemUser): void {
  const users = getStoredUsers();
  const updated = users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
  saveStoredUsers(updated);
}

/**
 * Deletes a user (cannot delete the primary super admin)
 */
export function deleteSystemUser(userId: string): boolean {
  const users = getStoredUsers();
  const target = users.find((u) => u.id === userId);
  if (!target || target.role === 'super_admin' || target.email === 'm.mkhalil871@gmail.com') {
    return false; // Prevent deleting super admin
  }
  const updated = users.filter((u) => u.id !== userId);
  saveStoredUsers(updated);

  // If deleted user was active, switch to super admin
  const currentId = localStorage.getItem(CURRENT_USER_ID_KEY);
  if (currentId === userId) {
    const superAdmin = updated.find((u) => u.role === 'super_admin') || updated[0];
    if (superAdmin) {
      localStorage.setItem(CURRENT_USER_ID_KEY, superAdmin.id);
    }
  }
  return true;
}

/**
 * Toggles a user's active status (enables or blocks access)
 */
export function toggleUserActiveStatus(userId: string): boolean {
  const users = getStoredUsers();
  const target = users.find((u) => u.id === userId);
  if (!target || target.role === 'super_admin') {
    return false; // Cannot disable super admin
  }
  const updated = users.map((u) =>
    u.id === userId ? { ...u, isActive: !u.isActive } : u
  );
  saveStoredUsers(updated);
  return true;
}

/**
 * Resets all users back to seed defaults
 */
export function resetSystemUsersToDefault(): SystemUser[] {
  saveStoredUsers(SEED_USERS);
  localStorage.setItem(CURRENT_USER_ID_KEY, SEED_USERS[0].id);
  return SEED_USERS;
}
