import React from 'react';
import {
  FileText,
  Search,
  Star,
  FolderOpen,
  Palette,
  Plus,
  Smartphone,
  Layers,
  Sparkles
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface MobileBottomDockProps {
  onOpenSearch: () => void;
  onToggleFavorites: () => void;
  showOnlyFavorites: boolean;
  onOpenLibrary: () => void;
  onOpenTheme: () => void;
  onAddNew: () => void;
  onOpenApkModal: () => void;
  totalCount: number;
}

export const MobileBottomDock: React.FC<MobileBottomDockProps> = ({
  onOpenSearch,
  onToggleFavorites,
  showOnlyFavorites,
  onOpenLibrary,
  onOpenTheme,
  onAddNew,
  onOpenApkModal,
  totalCount,
}) => {
  const { activeTheme, activeAccent } = useTheme();

  return (
    <nav
      aria-label="شريط الوصول السريع للهواتف"
      className={`md:hidden fixed bottom-0 inset-x-0 z-40 border-t backdrop-blur-md px-2 py-1.5 shadow-2xl transition-colors duration-200 no-print ${
        activeTheme.isDark
          ? 'bg-zinc-950/95 border-zinc-800 text-zinc-300'
          : activeTheme.id === 'parchment'
          ? 'bg-[#faf5ec]/95 border-[#e4d7c5] text-[#2c2016]'
          : 'bg-white/95 border-stone-200 text-stone-700'
      }`}
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6px)' }}
    >
      <div className="max-w-md mx-auto grid grid-cols-6 gap-1 items-center">
        {/* All Legislations / Home */}
        <button
          type="button"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex flex-col items-center justify-center p-1 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all text-center cursor-pointer"
          title="دليل التشريعات"
        >
          <Layers className="w-4 h-4 mb-0.5" style={{ color: activeAccent.colorHex }} />
          <span className="text-[10px] font-bold leading-tight">التشريعات</span>
        </button>

        {/* Quick Search */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex flex-col items-center justify-center p-1 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all text-center cursor-pointer"
          title="بحث فوري في المواد"
        >
          <Search className="w-4 h-4 mb-0.5 opacity-80" />
          <span className="text-[10px] font-medium leading-tight">بحث</span>
        </button>

        {/* Favorites */}
        <button
          type="button"
          onClick={onToggleFavorites}
          className={`flex flex-col items-center justify-center p-1 rounded-xl transition-all text-center cursor-pointer ${
            showOnlyFavorites
              ? 'bg-amber-500/15 text-amber-500 font-bold'
              : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-80'
          }`}
          title="المفضلة"
        >
          <Star className={`w-4 h-4 mb-0.5 ${showOnlyFavorites ? 'fill-amber-500 text-amber-500' : ''}`} />
          <span className="text-[10px] font-medium leading-tight">المفضلة</span>
        </button>

        {/* PDF Library */}
        <button
          type="button"
          onClick={onOpenLibrary}
          className="flex flex-col items-center justify-center p-1 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all text-center cursor-pointer text-emerald-600 dark:text-emerald-400"
          title="مكتبة وثائق PDF الرسمية"
        >
          <FolderOpen className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] font-bold leading-tight">المكتبة</span>
        </button>

        {/* Night / Reading Theme */}
        <button
          type="button"
          onClick={onOpenTheme}
          className="flex flex-col items-center justify-center p-1 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all text-center cursor-pointer"
          title="المظهر والقراءة الليلية"
        >
          <Palette className="w-4 h-4 mb-0.5 opacity-80" />
          <span className="text-[10px] font-medium leading-tight">القراءة</span>
        </button>

        {/* APK App / Install */}
        <button
          type="button"
          onClick={onOpenApkModal}
          className="flex flex-col items-center justify-center p-1 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all text-center cursor-pointer text-sky-600 dark:text-sky-400 font-bold"
          title="تطبيق الهاتف APK"
        >
          <Smartphone className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] leading-tight">APK</span>
        </button>
      </div>
    </nav>
  );
};
