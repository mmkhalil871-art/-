import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SystemUser, UserPermissions, UserRole } from '../types/userAccess';
import {
  getStoredUsers,
  getCurrentActiveUser,
  setCurrentActiveUser,
  addSystemUser,
  updateSystemUser,
  deleteSystemUser,
  toggleUserActiveStatus,
  FULL_PERMISSIONS,
  saveStoredUsers,
} from '../utils/userAccessStorage';

interface UserAccessContextType {
  currentUser: SystemUser;
  users: SystemUser[];
  permissions: UserPermissions;
  isSuperAdmin: boolean;
  canEditTexts: boolean;
  canAddDocuments: boolean;
  canDelete: boolean;
  canManageUsers: boolean;
  canExportBackup: boolean;
  switchUser: (userId: string) => boolean;
  addUser: (userData: Omit<SystemUser, 'id' | 'createdAt'>) => SystemUser;
  updateUser: (user: SystemUser) => void;
  deleteUser: (userId: string) => boolean;
  toggleUserStatus: (userId: string) => boolean;
  updateUserPermissions: (userId: string, newPerms: Partial<UserPermissions>) => void;
  grantFullPermissionsToUser: (userId: string) => void;
  refreshUsers: () => void;
}

const UserAccessContext = createContext<UserAccessContextType | undefined>(undefined);

export const UserAccessProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<SystemUser[]>(getStoredUsers);
  const [currentUser, setCurrentUserState] = useState<SystemUser>(getCurrentActiveUser);

  const refreshUsers = () => {
    const freshUsers = getStoredUsers();
    setUsers(freshUsers);
    const active = getCurrentActiveUser();
    setCurrentUserState(active);
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  const switchUser = (userId: string): boolean => {
    const success = setCurrentActiveUser(userId);
    if (success) {
      refreshUsers();
    }
    return success;
  };

  const addUser = (userData: Omit<SystemUser, 'id' | 'createdAt'>): SystemUser => {
    const created = addSystemUser(userData);
    refreshUsers();
    return created;
  };

  const updateUser = (user: SystemUser) => {
    updateSystemUser(user);
    refreshUsers();
  };

  const deleteUser = (userId: string): boolean => {
    const success = deleteSystemUser(userId);
    if (success) {
      refreshUsers();
    }
    return success;
  };

  const toggleUserStatus = (userId: string): boolean => {
    const success = toggleUserActiveStatus(userId);
    if (success) {
      refreshUsers();
    }
    return success;
  };

  const updateUserPermissions = (userId: string, newPerms: Partial<UserPermissions>) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    const updated: SystemUser = {
      ...target,
      permissions: {
        ...target.permissions,
        ...newPerms,
      },
    };
    updateSystemUser(updated);
    refreshUsers();
  };

  const grantFullPermissionsToUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    const updated: SystemUser = {
      ...target,
      role: 'super_admin',
      permissions: { ...FULL_PERMISSIONS },
      isActive: true,
    };
    updateSystemUser(updated);
    refreshUsers();
  };

  const permissions = currentUser.permissions || FULL_PERMISSIONS;
  const isSuperAdmin = currentUser.role === 'super_admin';

  return (
    <UserAccessContext.Provider
      value={{
        currentUser,
        users,
        permissions,
        isSuperAdmin,
        canEditTexts: permissions.canEditTexts,
        canAddDocuments: permissions.canAddDocuments,
        canDelete: permissions.canDelete,
        canManageUsers: permissions.canManageUsers,
        canExportBackup: permissions.canExportBackup,
        switchUser,
        addUser,
        updateUser,
        deleteUser,
        toggleUserStatus,
        updateUserPermissions,
        grantFullPermissionsToUser,
        refreshUsers,
      }}
    >
      {children}
    </UserAccessContext.Provider>
  );
};

export const useUserAccess = (): UserAccessContextType => {
  const context = useContext(UserAccessContext);
  if (!context) {
    throw new Error('useUserAccess must be used within a UserAccessProvider');
  }
  return context;
};
