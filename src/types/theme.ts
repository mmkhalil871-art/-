export type ThemeId = 'classic' | 'dark' | 'navy' | 'emerald' | 'parchment';

export type AccentColorId = 'amber' | 'blue' | 'emerald' | 'ruby' | 'violet' | 'teal';

export type FontSizeScale = 'normal' | 'comfortable' | 'large';

export interface ThemeConfig {
  id: ThemeId;
  nameAr: string;
  subtitleAr: string;
  descriptionAr: string;
  isDark: boolean;
  headerBgClass: string;
  headerTextClass: string;
  bodyBgClass: string;
  cardBgClass: string;
  cardBorderClass: string;
  textPrimaryClass: string;
  textMutedClass: string;
  previewColorPrimary: string;
  previewColorSecondary: string;
  previewHeader: string;
}

export interface AccentConfig {
  id: AccentColorId;
  nameAr: string;
  colorHex: string;
  twBadge: string;
  twButton: string;
  twText: string;
  twBorder: string;
  twRing: string;
  twActiveBg: string;
}

export interface ThemeSettings {
  themeId: ThemeId;
  accentId: AccentColorId;
  fontScale: FontSizeScale;
}

export const THEMES_LIST: ThemeConfig[] = [
  {
    id: 'classic',
    nameAr: 'الكلاسيكي الوقاري',
    subtitleAr: 'المظهر الافتراضي لقوانين العمل',
    descriptionAr: 'خلفيات حجرية دافئة مع ترويسة فحمية ودرجات ذهبية توثيقية رصينة.',
    isDark: false,
    headerBgClass: 'bg-stone-900',
    headerTextClass: 'text-stone-100',
    bodyBgClass: 'bg-stone-100/70',
    cardBgClass: 'bg-white',
    cardBorderClass: 'border-stone-200/80',
    textPrimaryClass: 'text-stone-900',
    textMutedClass: 'text-stone-600',
    previewColorPrimary: '#1c1917',
    previewColorSecondary: '#f5f5f4',
    previewHeader: '#292524',
  },
  {
    id: 'dark',
    nameAr: 'الوضع الليلي الفاخر',
    subtitleAr: 'حماية العين أثناء المطالعة المطولة',
    descriptionAr: 'خلفية داكنة فحمية أنيقة تريح النظر، متباينة بدقة عالية مع النصوص والمستندات.',
    isDark: true,
    headerBgClass: 'bg-zinc-950',
    headerTextClass: 'text-zinc-100',
    bodyBgClass: 'bg-zinc-900',
    cardBgClass: 'bg-zinc-800/90',
    cardBorderClass: 'border-zinc-700/80',
    textPrimaryClass: 'text-zinc-100',
    textMutedClass: 'text-zinc-400',
    previewColorPrimary: '#09090b',
    previewColorSecondary: '#18181b',
    previewHeader: '#141416',
  },
  {
    id: 'navy',
    nameAr: 'الأزرق الدبلوماسي',
    subtitleAr: 'الطابع الرئاسي والمؤسسي الحديث',
    descriptionAr: 'ترويسة باللون الكحلي الدبلوماسي مع لمسات ياقوتية وخلفيات بيضاء ناصعة عصرية.',
    isDark: false,
    headerBgClass: 'bg-slate-950',
    headerTextClass: 'text-slate-100',
    bodyBgClass: 'bg-slate-100/75',
    cardBgClass: 'bg-white',
    cardBorderClass: 'border-slate-200/80',
    textPrimaryClass: 'text-slate-900',
    textMutedClass: 'text-slate-600',
    previewColorPrimary: '#0f172a',
    previewColorSecondary: '#f1f5f9',
    previewHeader: '#1e293b',
  },
  {
    id: 'emerald',
    nameAr: 'الأخضر الحكومي الزمردي',
    subtitleAr: 'شعار الدولة والجريدة الرسمية',
    descriptionAr: 'ترويسة خضراء زمردية مستوحاة من ألوان السجلات الرسمية والوقائع المصرية العريقة.',
    isDark: false,
    headerBgClass: 'bg-emerald-950',
    headerTextClass: 'text-emerald-50',
    bodyBgClass: 'bg-emerald-50/50',
    cardBgClass: 'bg-white',
    cardBorderClass: 'border-emerald-200/60',
    textPrimaryClass: 'text-stone-900',
    textMutedClass: 'text-emerald-950/70',
    previewColorPrimary: '#064e3b',
    previewColorSecondary: '#f0fdf4',
    previewHeader: '#065f46',
  },
  {
    id: 'parchment',
    nameAr: 'البردي والتراث القضائي',
    subtitleAr: 'أوراق المخطوطات والوثائق الأصيلة',
    descriptionAr: 'خلفية دافئة بلون ورق البردي العتيق، تمنح تجربة قراءة فريدة تشبه المراجع المطبوعة.',
    isDark: false,
    headerBgClass: 'bg-[#2b2118]',
    headerTextClass: 'text-amber-50',
    bodyBgClass: 'bg-[#faf6ee]',
    cardBgClass: 'bg-[#fffefb]',
    cardBorderClass: 'border-[#e8decb]',
    textPrimaryClass: 'text-[#2e2319]',
    textMutedClass: 'text-[#6e5845]',
    previewColorPrimary: '#2b2118',
    previewColorSecondary: '#f4ede0',
    previewHeader: '#382b20',
  },
];

export const ACCENTS_LIST: AccentConfig[] = [
  {
    id: 'amber',
    nameAr: 'الذهبي القانوني (عنبر)',
    colorHex: '#d97706',
    twBadge: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-700/50',
    twButton: 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-amber-500/20',
    twText: 'text-amber-600 dark:text-amber-400',
    twBorder: 'border-amber-500',
    twRing: 'focus:ring-amber-500',
    twActiveBg: 'bg-amber-50 dark:bg-amber-950/40',
  },
  {
    id: 'blue',
    nameAr: 'الأزرق الملكي الدبلوماسي',
    colorHex: '#2563eb',
    twBadge: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-700/50',
    twButton: 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20',
    twText: 'text-blue-600 dark:text-blue-400',
    twBorder: 'border-blue-500',
    twRing: 'focus:ring-blue-500',
    twActiveBg: 'bg-blue-50 dark:bg-blue-950/40',
  },
  {
    id: 'emerald',
    nameAr: 'الأخضر الزمردي الرسمي',
    colorHex: '#059669',
    twBadge: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-700/50',
    twButton: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20',
    twText: 'text-emerald-600 dark:text-emerald-400',
    twBorder: 'border-emerald-500',
    twRing: 'focus:ring-emerald-500',
    twActiveBg: 'bg-emerald-50 dark:bg-emerald-950/40',
  },
  {
    id: 'ruby',
    nameAr: 'العقيقي الإمبراطوري (أحمر قاني)',
    colorHex: '#dc2626',
    twBadge: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/70 dark:text-red-300 dark:border-red-700/50',
    twButton: 'bg-red-600 hover:bg-red-500 text-white shadow-red-500/20',
    twText: 'text-red-600 dark:text-red-400',
    twBorder: 'border-red-500',
    twRing: 'focus:ring-red-500',
    twActiveBg: 'bg-red-50 dark:bg-red-950/40',
  },
  {
    id: 'violet',
    nameAr: 'الأرجواني الوقور (بنفسجي)',
    colorHex: '#7c3aed',
    twBadge: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-700/50',
    twButton: 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/20',
    twText: 'text-purple-600 dark:text-purple-400',
    twBorder: 'border-purple-500',
    twRing: 'focus:ring-purple-500',
    twActiveBg: 'bg-purple-50 dark:bg-purple-950/40',
  },
  {
    id: 'teal',
    nameAr: 'الفيروزي الحديث',
    colorHex: '#0d9488',
    twBadge: 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950/70 dark:text-teal-300 dark:border-teal-700/50',
    twButton: 'bg-teal-600 hover:bg-teal-500 text-white shadow-teal-500/20',
    twText: 'text-teal-600 dark:text-teal-400',
    twBorder: 'border-teal-500',
    twRing: 'focus:ring-teal-500',
    twActiveBg: 'bg-teal-50 dark:bg-teal-950/40',
  },
];
