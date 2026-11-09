import React, { useState } from 'react';
import {
  X,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Users,
  UserCheck,
  UserX,
  UserPlus,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  Edit3,
  FileUp,
  Trash2,
  Sparkles,
  ArrowRightLeft,
  RotateCcw
} from 'lucide-react';
import { useUserAccess } from '../context/UserAccessContext';
import { useTheme } from '../context/ThemeContext';
import { SystemUser, UserRole, UserPermissions, ROLE_LABELS } from '../types/userAccess';
import { FULL_PERMISSIONS, EDITOR_PERMISSIONS, VIEWER_PERMISSIONS, resetSystemUsersToDefault } from '../utils/userAccessStorage';

interface UserAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (message: string) => void;
}

export const UserAccessModal: React.FC<UserAccessModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const {
    currentUser,
    users,
    permissions,
    isSuperAdmin,
    canManageUsers,
    switchUser,
    addUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    updateUserPermissions,
    grantFullPermissionsToUser,
    refreshUsers,
  } = useUserAccess();

  const { activeTheme, activeAccent } = useTheme();

  const [activeTab, setActiveTab] = useState<'users' | 'new_user' | 'my_permissions'>('users');

  // New User Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newTitle, setNewTitle] = useState('مستشار قانوني');
  const [newDepartment, setNewDepartment] = useState('الشؤون القانونية');
  const [newRole, setNewRole] = useState<UserRole>('editor');
  const [newPin, setNewPin] = useState('1234');
  const [newCanEditTexts, setNewCanEditTexts] = useState(true);
  const [newCanAddDocuments, setNewCanAddDocuments] = useState(true);
  const [newCanDelete, setNewCanDelete] = useState(false);
  const [newCanManageUsers, setNewCanManageUsers] = useState(false);

  // Edit User Modal/Drawer State
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRoleChangeForNewUser = (role: UserRole) => {
    setNewRole(role);
    if (role === 'super_admin') {
      setNewCanEditTexts(true);
      setNewCanAddDocuments(true);
      setNewCanDelete(true);
      setNewCanManageUsers(true);
    } else if (role === 'admin') {
      setNewCanEditTexts(true);
      setNewCanAddDocuments(true);
      setNewCanDelete(true);
      setNewCanManageUsers(true);
    } else if (role === 'editor') {
      setNewCanEditTexts(true);
      setNewCanAddDocuments(true);
      setNewCanDelete(false);
      setNewCanManageUsers(false);
    } else {
      setNewCanEditTexts(false);
      setNewCanAddDocuments(false);
      setNewCanDelete(false);
      setNewCanManageUsers(false);
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) {
      onShowToast('يرجى إدخال اسم المستخدم والبريد الإلكتروني.');
      return;
    }

    const created = addUser({
      name: newName.trim(),
      email: newEmail.trim(),
      title: newTitle.trim(),
      department: newDepartment.trim(),
      role: newRole,
      accessPin: newPin || '1234',
      isActive: true,
      permissions: {
        canEditTexts: newCanEditTexts,
        canAddDocuments: newCanAddDocuments,
        canDelete: newCanDelete,
        canManageUsers: newCanManageUsers,
        canExportBackup: true,
      },
      avatarColor: activeAccent.colorHex,
    });

    onShowToast(`تم إضافة المستخدم (${created.name}) بنجاح وتفعيل دخوله.`);
    setNewName('');
    setNewEmail('');
    setActiveTab('users');
  };

  const handleSwitchUser = (userId: string, userName: string) => {
    const ok = switchUser(userId);
    if (ok) {
      onShowToast(`تم التبديل بنجاح إلى حساب: ${userName}`);
    } else {
      onShowToast('تعذر التبديل: هذا الحساب معطل وممنوع من الدخول.');
    }
  };

  const handleToggleActive = (user: SystemUser) => {
    if (user.role === 'super_admin') {
      onShowToast('لا يمكن تعطيل حساب المدير العام الرئيسي لحماية أمان المنظومة.');
      return;
    }
    const ok = toggleUserStatus(user.id);
    if (ok) {
      onShowToast(user.isActive ? `تم حظر وتعطيل دخول المستخدم (${user.name})` : `تم تفعيل وتنشيط دخول المستخدم (${user.name})`);
    }
  };

  const handleDelete = (user: SystemUser) => {
    if (user.role === 'super_admin' || user.email === 'm.mkhalil871@gmail.com') {
      onShowToast('لا يمكن حذف حساب المسؤول العام الرئيسي.');
      return;
    }
    const ok = deleteUser(user.id);
    if (ok) {
      onShowToast(`تم حذف المستخدم (${user.name}) بنجاح.`);
    }
  };

  const handleGrantFullPermissionsToAll = () => {
    users.forEach((u) => {
      grantFullPermissionsToUser(u.id);
    });
    onShowToast('تم منح صلاحيات كاملة (تعديل، إضافة مستندات، حذف، وتحكم بالمستخدمين) لكافة المستخدمين!');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 no-print">
      <div
        className={`rounded-2xl shadow-2xl max-w-4xl w-full flex flex-col border overflow-hidden max-h-[92vh] ${
          activeTheme.isDark ? 'bg-zinc-900 border-zinc-700 text-zinc-100' : 'bg-white border-stone-200 text-stone-900'
        }`}
      >
        {/* Modal Header */}
        <div className="bg-stone-950 text-white px-6 py-4 flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl border flex items-center justify-center"
              style={{
                backgroundColor: `${activeAccent.colorHex}25`,
                borderColor: `${activeAccent.colorHex}50`,
                color: activeAccent.colorHex,
              }}
            >
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">
                  لوحة التحكم في دخول وصلاحيات المستخدمين (RBAC)
                </h2>
                <span className="text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full">
                  صلاحيات كاملة مفعلة 👑
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                إدارة الصلاحيات: تعديل النصوص المتاحة، رفع وإضافة المستندات، الحذف، والتحكم في حسابات ودخول المستخدمين
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active User Banner Strip */}
        <div
          className={`px-6 py-3 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
            activeTheme.isDark
              ? 'bg-zinc-800/80 border-zinc-700 text-zinc-200'
              : 'bg-amber-50/80 border-amber-200 text-amber-950'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-xs shrink-0"
              style={{ backgroundColor: currentUser.avatarColor || activeAccent.colorHex }}
            >
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <div className="font-bold flex items-center gap-2">
                <span>المستخدم النشط حالياً: {currentUser.name}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    ROLE_LABELS[currentUser.role]?.badgeClass || 'bg-stone-500/20'
                  }`}
                >
                  {ROLE_LABELS[currentUser.role]?.label || currentUser.role}
                </span>
              </div>
              <div className="text-[11px] opacity-75 mt-0.5">
                البريد: {currentUser.email} · الوظيفة: {currentUser.title || 'مسؤول المنظومة'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>صلاحياتك: كاملة (تعديل + إضافة + حذف + تحكم)</span>
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-black/10 dark:border-white/10 shrink-0 text-xs sm:text-sm font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'users'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-bold'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>المستخدمون والدخول ({users.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('new_user')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'new_user'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-bold'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>إضافة مستخدم جديد</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('my_permissions')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'my_permissions'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-bold'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>سجل الصلاحيات والتفويض</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: USERS LIST & ACCESS CONTROLS */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              {/* Quick Actions Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                <div className="text-xs space-y-1">
                  <div className="font-bold text-sm">التحكم في دخول وصلاحيات المستخدمين</div>
                  <p className="opacity-75">
                    يمكنك تفعيل أو حظر دخول أي مستخدم فوراً، ومنح أو حجب صلاحيات تعديل النصوص، إضافة المستندات، أو الحذف.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleGrantFullPermissionsToAll}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs cursor-pointer transition-colors"
                    title="منح كافة الصلاحيات فوراً للجميع"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>منح صلاحيات كاملة للكل</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('new_user')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 transition-colors cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>مستخدم جديد</span>
                  </button>
                </div>
              </div>

              {/* Users Cards / List */}
              <div className="space-y-3">
                {users.map((user) => {
                  const isCurrent = user.id === currentUser.id;
                  const isPrimarySuperAdmin = user.role === 'super_admin' || user.email === 'm.mkhalil871@gmail.com';

                  return (
                    <div
                      key={user.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isCurrent
                          ? 'border-amber-500/60 bg-amber-500/5 shadow-xs ring-1 ring-amber-500/30'
                          : user.isActive
                          ? 'border-black/10 dark:border-white/10 bg-black/2 dark:bg-white/2'
                          : 'border-rose-400/30 bg-rose-500/5 opacity-70'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* User Identity */}
                        <div className="flex items-start gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-xs shrink-0 text-base"
                            style={{ backgroundColor: user.avatarColor || '#64748b' }}
                          >
                            {user.name.charAt(0)}
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm sm:text-base">{user.name}</span>
                              {isCurrent && (
                                <span className="text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full">
                                  أنت (الحساب النشط)
                                </span>
                              )}
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  ROLE_LABELS[user.role]?.badgeClass || 'bg-stone-500/20'
                                }`}
                              >
                                {ROLE_LABELS[user.role]?.label || user.role}
                              </span>
                              {user.isActive ? (
                                <span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <UserCheck className="w-3 h-3" />
                                  <span>مسموح بالدخول (نشط)</span>
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <UserX className="w-3 h-3" />
                                  <span>محظور من الدخول (معطل)</span>
                                </span>
                              )}
                            </div>

                            <div className="text-xs opacity-70 flex items-center gap-3 flex-wrap">
                              <span>البريد: {user.email}</span>
                              {user.title && <span>المسمى: {user.title}</span>}
                              {user.department && <span>القسم: {user.department}</span>}
                              <span>رمز الدخول (PIN): <code className="px-1.5 py-0.5 bg-black/10 dark:bg-white/10 rounded font-mono font-bold">{user.accessPin}</code></span>
                            </div>
                          </div>
                        </div>

                        {/* Quick Switch / Action Buttons */}
                        <div className="flex items-center gap-2 flex-wrap self-end lg:self-center shrink-0">
                          {!isCurrent && user.isActive && (
                            <button
                              type="button"
                              onClick={() => handleSwitchUser(user.id, user.name)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white cursor-pointer transition-colors"
                              title="التبديل واستخدام هذا الحساب"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5" />
                              <span>تبديل الحساب</span>
                            </button>
                          )}

                          {!isPrimarySuperAdmin && (
                            <button
                              type="button"
                              onClick={() => handleToggleActive(user)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                                user.isActive
                                  ? 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-700 dark:text-rose-300 border border-rose-400/30'
                                  : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border border-emerald-400/30'
                              }`}
                              title={user.isActive ? 'تعطيل دخول هذا المستخدم' : 'تفعيل دخول هذا المستخدم'}
                            >
                              {user.isActive ? (
                                <>
                                  <Lock className="w-3.5 h-3.5" />
                                  <span>تعطيل الدخول</span>
                                </>
                              ) : (
                                <>
                                  <Unlock className="w-3.5 h-3.5" />
                                  <span>تفعيل الدخول</span>
                                </>
                              )}
                            </button>
                          )}

                          {!isPrimarySuperAdmin && (
                            <button
                              type="button"
                              onClick={() => handleDelete(user)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/15 cursor-pointer transition-colors"
                              title="حذف المستخدم نهائياً"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Granular Permissions Checkboxes */}
                      <div className="mt-3 pt-3 border-t border-black/10 dark:border-white/10">
                        <div className="text-[11px] font-bold opacity-75 mb-2">
                          صلاحيات هذا المستخدم الدقيقة (انقر للتعديل المباشر):
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          {/* 1. Can Edit Texts */}
                          <label
                            className={`flex items-center gap-2 p-2 rounded-lg border transition-colors cursor-pointer select-none ${
                              user.permissions.canEditTexts
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                                : 'bg-black/5 dark:bg-white/5 border-transparent opacity-60'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={user.permissions.canEditTexts}
                              disabled={isPrimarySuperAdmin}
                              onChange={(e) =>
                                updateUserPermissions(user.id, {
                                  canEditTexts: e.target.checked,
                                })
                              }
                              className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                            />
                            <Edit3 className="w-3.5 h-3.5 shrink-0" />
                            <span className="font-semibold text-[11px]">تعديل النصوص</span>
                          </label>

                          {/* 2. Can Add Documents */}
                          <label
                            className={`flex items-center gap-2 p-2 rounded-lg border transition-colors cursor-pointer select-none ${
                              user.permissions.canAddDocuments
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                                : 'bg-black/5 dark:bg-white/5 border-transparent opacity-60'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={user.permissions.canAddDocuments}
                              disabled={isPrimarySuperAdmin}
                              onChange={(e) =>
                                updateUserPermissions(user.id, {
                                  canAddDocuments: e.target.checked,
                                })
                              }
                              className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                            />
                            <FileUp className="w-3.5 h-3.5 shrink-0" />
                            <span className="font-semibold text-[11px]">إضافة المستندات</span>
                          </label>

                          {/* 3. Can Delete */}
                          <label
                            className={`flex items-center gap-2 p-2 rounded-lg border transition-colors cursor-pointer select-none ${
                              user.permissions.canDelete
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                                : 'bg-black/5 dark:bg-white/5 border-transparent opacity-60'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={user.permissions.canDelete}
                              disabled={isPrimarySuperAdmin}
                              onChange={(e) =>
                                updateUserPermissions(user.id, {
                                  canDelete: e.target.checked,
                                })
                              }
                              className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                            />
                            <Trash2 className="w-3.5 h-3.5 shrink-0" />
                            <span className="font-semibold text-[11px]">صلاحيات الحذف</span>
                          </label>

                          {/* 4. Can Manage Users */}
                          <label
                            className={`flex items-center gap-2 p-2 rounded-lg border transition-colors cursor-pointer select-none ${
                              user.permissions.canManageUsers
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                                : 'bg-black/5 dark:bg-white/5 border-transparent opacity-60'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={user.permissions.canManageUsers}
                              disabled={isPrimarySuperAdmin}
                              onChange={(e) =>
                                updateUserPermissions(user.id, {
                                  canManageUsers: e.target.checked,
                                })
                              }
                              className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                            />
                            <Users className="w-3.5 h-3.5 shrink-0" />
                            <span className="font-semibold text-[11px]">التحكم بالمستخدمين</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: ADD NEW USER */}
          {activeTab === 'new_user' && (
            <form onSubmit={handleCreateUser} className="space-y-4 max-w-2xl mx-auto">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs leading-relaxed">
                <strong>إضافة مستخدم جديد:</strong> يمكنك تزويد الباحثين، المحامين، أو ممثلي الموارد البشرية بحسابات مستقلة
                وتحديد الصلاحيات الممنوحة لهم بدقة (تعديل نصوص، رفع ملفات، حذف، إلخ).
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">اسم المستخدم الكامل *</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="مثال: د. إبراهيم عبد الله"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-black/20 dark:border-white/20 bg-transparent focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">البريد الإلكتروني *</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="name@organization.com"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-black/20 dark:border-white/20 bg-transparent focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">المسمى الوظيفي</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="مثال: مستشار قانوني أول"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-black/20 dark:border-white/20 bg-transparent focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">القسم أو الإدارة</label>
                  <input
                    type="text"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    placeholder="مثال: الإدارة القانونية والتشريع"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-black/20 dark:border-white/20 bg-transparent focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">رمز الدخول السريع (PIN)</label>
                  <input
                    type="text"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="1234"
                    maxLength={8}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-black/20 dark:border-white/20 bg-transparent focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">الدور الوظيفي الأساسي</label>
                  <select
                    value={newRole}
                    onChange={(e) => handleRoleChangeForNewUser(e.target.value as UserRole)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-black/20 dark:border-white/20 bg-transparent focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="editor">محرر وباحث قانوني (تعديل النصوص ورفع الملفات)</option>
                    <option value="admin">مدير نظام (صلاحيات إدارية)</option>
                    <option value="super_admin">المدير العام (صلاحيات كاملة مطلقة)</option>
                    <option value="viewer">مستعرض وباحث (قراءة واستعراض فقط)</option>
                  </select>
                </div>
              </div>

              {/* Granular Permissions Selection */}
              <div className="p-4 rounded-xl border border-black/10 dark:border-white/10 space-y-3">
                <div className="text-xs font-bold">تحديد الصلاحيات الممنوحة لهذا المستخدم:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <label className="flex items-center gap-2 p-2.5 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newCanEditTexts}
                      onChange={(e) => setNewCanEditTexts(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <div className="font-bold">تعديل النصوص المتاحة</div>
                      <div className="text-[11px] opacity-70">إمكانية تحرير مواد القانون والقرارات والديباجة</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newCanAddDocuments}
                      onChange={(e) => setNewCanAddDocuments(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <div className="font-bold">إضافة ورفع المستندات</div>
                      <div className="text-[11px] opacity-70">رفع نسخ PDF ممسوحة وملفات Word والرفع الجماعي</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newCanDelete}
                      onChange={(e) => setNewCanDelete(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <div className="font-bold">صلاحيات الحذف</div>
                      <div className="text-[11px] opacity-70">إمكانية حذف القرارات أو المستندات المرفقة</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newCanManageUsers}
                      onChange={(e) => setNewCanManageUsers(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <div className="font-bold">التحكم في دخول المستخدمين</div>
                      <div className="text-[11px] opacity-70">إضافة مستخدمين والتحكم في صلاحياتهم وحظرهم</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('users')}
                  className="px-4 py-2 rounded-lg text-xs font-semibold border border-black/15 dark:border-white/15 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-xs font-bold text-white shadow-sm cursor-pointer"
                  style={{ backgroundColor: activeAccent.colorHex }}
                >
                  حفظ المستخدم وتفعيل الدخول 🚀
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: PERMISSIONS SUMMARY */}
          {activeTab === 'my_permissions' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-gradient-to-l from-amber-500/15 to-emerald-500/15 border border-amber-500/30 space-y-3">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  <div>
                    <h3 className="font-bold text-base">بيان الصلاحيات الممنوحة لك في المنظومة</h3>
                    <p className="text-xs opacity-80">
                      بصفتك المسؤول العام، تمتلك صلاحيات كاملة غير مقيدة وفق المعايير المعتمدة.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-white/70 dark:bg-zinc-800/80 border border-black/10 dark:border-white/10 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs flex items-center gap-1.5">
                        <Edit3 className="w-4 h-4 text-emerald-600" />
                        تعديل النصوص المتاحة
                      </span>
                      <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                        ممنوحة بالكامل ✓
                      </span>
                    </div>
                    <p className="text-[11px] opacity-75">
                      تعديل الديباجات، أرقام وسنوات القرارات، نصوص المواد، المواد المنفذة، والمذكرات الإيضاحية.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/70 dark:bg-zinc-800/80 border border-black/10 dark:border-white/10 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs flex items-center gap-1.5">
                        <FileUp className="w-4 h-4 text-emerald-600" />
                        إضافة ورفع المستندات
                      </span>
                      <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                        ممنوحة بالكامل ✓
                      </span>
                    </div>
                    <p className="text-[11px] opacity-75">
                      رفع ملفات PDF الرسمية الممسوحة ضوئياً، ملفات Word، والرفع الجماعي الآلي لكافة الوثائق.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/70 dark:bg-zinc-800/80 border border-black/10 dark:border-white/10 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs flex items-center gap-1.5">
                        <Trash2 className="w-4 h-4 text-emerald-600" />
                        صلاحيات الحذف
                      </span>
                      <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                        ممنوحة بالكامل ✓
                      </span>
                    </div>
                    <p className="text-[11px] opacity-75">
                      حذف القرارات غير الموثقة، حذف مستندات، حذف مواد معينة، وحذف القوانين لإعادة رفعها.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/70 dark:bg-zinc-800/80 border border-black/10 dark:border-white/10 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-emerald-600" />
                        التحكم في دخول المستخدمين
                      </span>
                      <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                        ممنوحة بالكامل ✓
                      </span>
                    </div>
                    <p className="text-[11px] opacity-75">
                      إضافة حسابات مستخدمين، تعيين الأدوار، حظر أو تفعيل الدخول، وضبط الصلاحيات الفرعية.
                    </p>
                  </div>
                </div>
              </div>

              {/* Reset to Default Button */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-black/10 dark:border-white/10 text-xs">
                <div>
                  <div className="font-bold">استعادة الضبط الافتراضي لحسابات وصلاحيات المنظومة</div>
                  <div className="opacity-70 mt-0.5">يعيد ضبط قائمة المستخدمين إلى الإعدادات الأولية المعتمدة.</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    resetSystemUsersToDefault();
                    refreshUsers();
                    onShowToast('تمت استعادة الضبط الافتراضي للمستخدمين بنجاح.');
                  }}
                  className="px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-black/5 dark:hover:bg-white/5 font-semibold cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>استعادة الضبط</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-stone-100 dark:bg-zinc-950 px-6 py-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-xs shrink-0">
          <div className="opacity-75 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-amber-500" />
            <span>نظام إدارة الصلاحيات والوصول (RBAC) نشط ومحمي محلياً</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-sm cursor-pointer"
            style={{ backgroundColor: activeAccent.colorHex }}
          >
            إغلاق اللوحة
          </button>
        </div>
      </div>
    </div>
  );
};
