import React from 'react';
import {
  X,
  Palette,
  Check,
  Moon,
  Sun,
  RotateCcw,
  Sparkles,
  Type,
  Eye,
  Scale
} from 'lucide-react';
import {
  THEMES_LIST,
  ACCENTS_LIST,
  ThemeId,
  AccentColorId,
  FontSizeScale,
} from '../types/theme';
import { useTheme } from '../context/ThemeContext';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    settings,
    activeTheme,
    activeAccent,
    setTheme,
    setAccent,
    setFontScale,
    resetTheme,
    toggleDarkMode,
  } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className={`w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden transition-colors ${
          activeTheme.isDark
            ? 'bg-zinc-900 border-zinc-700 text-zinc-100'
            : 'bg-white border-stone-200 text-stone-900'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4.5 border-b ${
            activeTheme.isDark
              ? 'bg-zinc-950/80 border-zinc-800'
              : 'bg-stone-50 border-stone-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-xs"
              style={{ backgroundColor: activeAccent.colorHex, color: '#ffffff' }}
            >
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                تخصيص المظهر والألوان
              </h2>
              <p
                className={`text-xs ${
                  activeTheme.isDark ? 'text-zinc-400' : 'text-stone-500'
                }`}
              >
                اختر طراز العرض، ألوان التمييز، وحجم الخط المناسب لمطالعة القرارات
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Dark Toggle */}
            <button
              type="button"
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg border transition-colors cursor-pointer text-xs flex items-center gap-1.5 ${
                activeTheme.isDark
                  ? 'bg-zinc-800 border-zinc-700 text-amber-400 hover:bg-zinc-750'
                  : 'bg-stone-100 border-stone-300 text-stone-700 hover:bg-stone-200'
              }`}
              title={activeTheme.isDark ? 'التحويل للوضع النهاري' : 'التحويل للوضع الليلي'}
            >
              {activeTheme.isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">نهاري</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-stone-600" />
                  <span className="hidden sm:inline">ليلي</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                activeTheme.isDark
                  ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
              }`}
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Themes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>طراز المظهر العام (5 سمات قانونية متقنة)</span>
              </label>
              <span
                className={`text-xs ${
                  activeTheme.isDark ? 'text-zinc-400' : 'text-stone-500'
                }`}
              >
                المحدد حالياً: {activeTheme.nameAr}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {THEMES_LIST.map((theme) => {
                const isSelected = settings.themeId === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setTheme(theme.id)}
                    className={`relative p-3.5 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between group ${
                      isSelected
                        ? activeTheme.isDark
                          ? 'border-amber-500 bg-zinc-800/90 ring-2 ring-amber-500/30'
                          : 'border-amber-600 bg-amber-50/40 ring-2 ring-amber-500/20'
                        : activeTheme.isDark
                        ? 'border-zinc-800 bg-zinc-800/40 hover:bg-zinc-800 hover:border-zinc-700'
                        : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/60'
                    }`}
                  >
                    {/* Visual Mini Preview Bar */}
                    <div className="w-full h-11 rounded-lg overflow-hidden border border-black/10 mb-2.5 flex flex-col">
                      <div
                        className="h-4 w-full flex items-center px-1.5 justify-between"
                        style={{ backgroundColor: theme.previewHeader }}
                      >
                        <div className="w-8 h-1 rounded-full bg-white/40" />
                        <div className="w-2 h-2 rounded-full bg-amber-400" />
                      </div>
                      <div
                        className="flex-1 flex items-center justify-center p-1"
                        style={{ backgroundColor: theme.previewColorSecondary }}
                      >
                        <div
                          className="w-4/5 h-2 rounded-xs opacity-75 shadow-2xs"
                          style={{
                            backgroundColor: theme.isDark ? '#27272a' : '#ffffff',
                            border: `1px solid ${theme.isDark ? '#3f3f46' : '#e2e8f0'}`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm tracking-tight">
                          {theme.nameAr}
                        </span>
                        {isSelected && (
                          <span
                            className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
                            style={{ backgroundColor: activeAccent.colorHex }}
                          >
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <div
                        className={`text-[11px] font-medium mt-0.5 ${
                          activeTheme.isDark ? 'text-zinc-400' : 'text-stone-500'
                        }`}
                      >
                        {theme.subtitleAr}
                      </div>
                      <p
                        className={`text-[11px] mt-1.5 line-clamp-2 leading-relaxed ${
                          activeTheme.isDark ? 'text-zinc-500' : 'text-stone-500'
                        }`}
                      >
                        {theme.descriptionAr}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Accent Colors */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold flex items-center gap-2">
                <Palette className="w-4 h-4 text-blue-500" />
                <span>لون التمييز والأزرار النشطة (Accent Color)</span>
              </label>
              <span
                className={`text-xs ${
                  activeTheme.isDark ? 'text-zinc-400' : 'text-stone-500'
                }`}
              >
                {activeAccent.nameAr}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              {ACCENTS_LIST.map((accent) => {
                const isSelected = settings.accentId === accent.id;
                return (
                  <button
                    key={accent.id}
                    type="button"
                    onClick={() => setAccent(accent.id)}
                    className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? activeTheme.isDark
                          ? 'border-zinc-500 bg-zinc-800 ring-2 ring-white/20'
                          : 'border-stone-400 bg-stone-100/90 ring-2 ring-black/10'
                        : activeTheme.isDark
                        ? 'border-zinc-800 bg-zinc-850 hover:bg-zinc-800 hover:border-zinc-700'
                        : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50'
                    }`}
                  >
                    <div
                      className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center shadow-xs"
                      style={{ backgroundColor: accent.colorHex }}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                    </div>
                    <span className="text-xs font-semibold truncate">
                      {accent.nameAr.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Font Size Scale */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold flex items-center gap-2">
                <Type className="w-4 h-4 text-emerald-500" />
                <span>حجم خط القراءة والمطالعة</span>
              </label>
              <span
                className={`text-xs ${
                  activeTheme.isDark ? 'text-zinc-400' : 'text-stone-500'
                }`}
              >
                {settings.fontScale === 'normal'
                  ? 'عادي (100%)'
                  : settings.fontScale === 'comfortable'
                  ? 'مريح للعين (+6%)'
                  : 'كبير وموسع (+12%)'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'normal', label: 'عادي قياسي', sub: '100% مناسب للشاشات الكبيرة' },
                { id: 'comfortable', label: 'مريح للعين', sub: '106% توازن مثالي للقراءة' },
                { id: 'large', label: 'كبير للمطالعة', sub: '112% وضوح تام للنصوص القانونية' },
              ].map((scale) => {
                const isSelected = settings.fontScale === scale.id;
                return (
                  <button
                    key={scale.id}
                    type="button"
                    onClick={() => setFontScale(scale.id as FontSizeScale)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? activeTheme.isDark
                          ? 'border-amber-500 bg-zinc-800 ring-2 ring-amber-500/20'
                          : 'border-amber-600 bg-amber-50/60 ring-2 ring-amber-500/20'
                        : activeTheme.isDark
                        ? 'border-zinc-800 bg-zinc-800/40 hover:bg-zinc-800'
                        : 'border-stone-200 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <div className="font-bold text-xs sm:text-sm">{scale.label}</div>
                    <div
                      className={`text-[10px] mt-0.5 ${
                        activeTheme.isDark ? 'text-zinc-400' : 'text-stone-500'
                      }`}
                    >
                      {scale.sub}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Live Preview Box */}
          <div
            className={`p-4 rounded-xl border ${
              activeTheme.isDark
                ? 'bg-zinc-950/50 border-zinc-800'
                : 'bg-stone-50 border-stone-200'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold mb-2.5">
              <Eye className="w-3.5 h-3.5 text-stone-400" />
              <span>معاينة حية للمظهر المختار:</span>
            </div>

            <div
              className={`p-4 rounded-xl border shadow-xs transition-colors ${
                activeTheme.isDark
                  ? 'bg-zinc-800/90 border-zinc-700 text-zinc-100'
                  : 'bg-white border-stone-200 text-stone-900'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: activeAccent.colorHex }}
                  >
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">
                      قرار وزير العمل رقم (14) لسنة 2025
                    </div>
                    <div
                      className={`text-[11px] ${
                        activeTheme.isDark ? 'text-zinc-400' : 'text-stone-500'
                      }`}
                    >
                      تنفيذاً لأحكام المواد (12، 13) من قانون العمل
                    </div>
                  </div>
                </div>

                <span
                  className="px-2 py-0.5 rounded-md text-[11px] font-semibold border"
                  style={{
                    backgroundColor: `${activeAccent.colorHex}18`,
                    color: activeAccent.colorHex,
                    borderColor: `${activeAccent.colorHex}40`,
                  }}
                >
                  سارٍ ونافذ
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5">
                <span
                  className={`text-[11px] ${
                    activeTheme.isDark ? 'text-zinc-400' : 'text-stone-500'
                  }`}
                >
                  النسخة الرسمية (PDF) + النسخة المكتوبة (Word)
                </span>
                <button
                  type="button"
                  className="px-3 py-1 rounded-md text-xs font-semibold text-white shadow-xs cursor-pointer"
                  style={{ backgroundColor: activeAccent.colorHex }}
                >
                  استعراض القرار
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-t ${
            activeTheme.isDark
              ? 'bg-zinc-950 border-zinc-800'
              : 'bg-stone-50 border-stone-200'
          }`}
        >
          <button
            type="button"
            onClick={resetTheme}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-colors cursor-pointer ${
              activeTheme.isDark
                ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/70'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>استعادة الإعدادات الافتراضية</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white shadow-sm cursor-pointer transition-transform active:scale-95"
            style={{ backgroundColor: activeAccent.colorHex }}
          >
            حفظ وإغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
