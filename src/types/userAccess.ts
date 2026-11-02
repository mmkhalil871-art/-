export type UserRole = 'super_admin' | 'admin' | 'editor' | 'viewer';

export interface UserPermissions {
  canEditTexts: boolean; // تعديل النصوص المتاحة (القرارات، مواد القانون، الديباجة، المواد المنفذة)
  canAddDocuments: boolean; // إضافة المستندات (رفع PDF ممسوح، Word، استيراد جماعي في المكتبة)
  canDelete: boolean; // صلاحيات الحذف (حذف قرارات، حذف مستندات، حذف مواد)
  canManageUsers: boolean; // التحكم في دخول المستخدمين (إضافة مستخدمين، تعيين الأدوار والصلاحيات، تفعيل/تعطيل الحسابات)
  canExportBackup: boolean; // تصدير النسخ الاحتياطية وتنزيل البرامج المكتوبة
}

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: UserPermissions;
  isActive: boolean; // تفعيل أو تعطيل دخول المستخدم
  accessPin: string; // رمز الدخول السريع
  title?: string; // المسمى الوظيفي (مثل: مستشار قانوني، مدير الموارد البشرية)
  department?: string;
  avatarColor?: string;
  createdAt: string;
  lastLogin?: string;
}

export const ROLE_LABELS: Record<UserRole, { label: string; description: string; badgeClass: string }> = {
  super_admin: {
    label: 'المدير العام (صلاحيات كاملة)',
    description: 'صلاحيات مطلقة: تعديل كافة النصوص، إضافة المستندات، الحذف، والتحكم الكامل في دخول وصلاحيات المستخدمين',
    badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  },
  admin: {
    label: 'مدير نظام',
    description: 'صلاحيات إدارة المحتوى والمستندات والتحكم في المستخدمين عدا حذف المدير العام',
    badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  },
  editor: {
    label: 'محرر وباحث قانوني',
    description: 'صلاحية تعديل النصوص وإضافة ورفع المستندات الرسمية دون صلاحيات الحذف أو إدارة المستخدمين',
    badgeClass: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30',
  },
  viewer: {
    label: 'مستعرض وباحث',
    description: 'قراءة واستعراض نصوص القرارات والبحث وتحميل النسخ الرسمية فقط دون أي تعديل',
    badgeClass: 'bg-stone-500/15 text-stone-600 dark:text-stone-400 border-stone-500/30',
  },
};
