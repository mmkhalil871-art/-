import React, { useState } from 'react';
import {
  X,
  Download,
  Smartphone,
  Laptop,
  CheckCircle2,
  ExternalLink,
  Zap,
  ShieldCheck,
  FileCode,
  HardDrive,
  WifiOff,
  Layers,
  Sparkles,
  Printer
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  downloadWindowsDesktopLauncher,
  downloadWindowsShortcut,
  downloadPortableOfflineApp
} from '../utils/desktopAppLauncher';
import { MinisterialDecision } from '../types/decision';
import { LaborLawInfo } from '../data/laborLawData';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  decisions?: MinisterialDecision[];
  law?: LaborLawInfo;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  decisions = [],
  law,
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const showSuccess = (msg: string) => {
    setDownloadSuccessMessage(msg);
    setTimeout(() => setDownloadSuccessMessage(null), 5000);
  };

  const handleDirectInstall = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  const handleDownloadPortable = () => {
    downloadPortableOfflineApp(decisions, law);
    showSuccess('تم تحميل النسخة المحمولة المستقلة للكمبيوتر! يمكنك فتحها بالنقر المزدوج في أي وقت دون اتصال بالإنترنت.');
  };

  const handleDownloadLauncher = () => {
    downloadWindowsDesktopLauncher();
    showSuccess('تم تحميل مشغل سطح المكتب (Windows Launcher). اضغط عليه مرتين لفتح التطبيق كنافذة كمبيوتر مستقلة!');
  };

  const handleDownloadShortcut = () => {
    downloadWindowsShortcut();
    showSuccess('تم تحميل اختصار سطح المكتب. ضعه على سطح مكتبك للوصول الفوري!');
  };

  const handleOpenDirectWindow = () => {
    const targetUrl = window.location.href.split('?')[0];
    window.open(targetUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 no-print">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full flex flex-col border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="bg-stone-900 text-stone-100 px-6 py-4 flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>خيارات تحميل وتشغيل المنظومة كبرنامج حاسب آلي</span>
                <span className="text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  خيارات بدون إنترنت (Offline)
                </span>
              </h2>
              <p className="text-xs text-stone-400">
                تشغيل المنظومة كبرنامج مكتبي كامل على جهازك بضغطة زر واحدة دون الحاجة إلى اتصال بالإنترنت
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

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-sm overflow-y-auto max-h-[80vh]">
          {downloadSuccessMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs flex items-center gap-2.5 animate-fade-in shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-semibold">{downloadSuccessMessage}</span>
            </div>
          )}

          {/* Option 1: Standalone Portable Offline Application (Hero Card) */}
          <div className="relative bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 text-white rounded-2xl p-5 border-2 border-amber-500/50 shadow-md space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-400 text-stone-950">
                    <Sparkles className="w-3.5 h-3.5" />
                    الخيار الأسهل · تشغيل فوري بدون إنترنت 100%
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-900/80 text-emerald-300 border border-emerald-600/40">
                    <WifiOff className="w-3 h-3" />
                    لا يتطلب أي اتصال بالإنترنت
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  تحميل تطبيق الحاسب المحمول الشامل (All-in-One Portable App)
                </h3>
                <p className="text-xs text-stone-300 mt-1.5 leading-relaxed">
                  ملف تطبيقي مستقل واحد (.html) يُحفظ على حاسوبك، يفتح بنقرة مزدوجة (Double-Click) في أي وقت دون الحاجة إلى إنترنت، أو تثبيت، أو سيرفر.
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0 hidden sm:flex">
                <HardDrive className="w-6 h-6" />
              </div>
            </div>

            {/* Inclusions checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-stone-950/60 p-3 rounded-xl border border-stone-800">
              <div className="flex items-center gap-2 text-stone-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>مدمج به كافة القرارات الوزارية الـ 17 المعتمدة بكامل نصوصها</span>
              </div>
              <div className="flex items-center gap-2 text-stone-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>متن قانون العمل 14 لسنة 2025 كاملاً (7 مواد إصدار + 6 أبواب)</span>
              </div>
              <div className="flex items-center gap-2 text-stone-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>محرك بحث سريع داخلي وتصفية للمواضيع دون الحاجة لشبكة</span>
              </div>
              <div className="flex items-center gap-2 text-stone-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>تصميم ذاتي مدمج وطباعة فورية للقرارات ومواد القانون</span>
              </div>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={handleDownloadPortable}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-stone-950 font-bold rounded-xl text-sm shadow-md transition-all cursor-pointer hover:scale-[1.01]"
              >
                <Download className="w-4 h-4" />
                <span>تحميل البرنامج للعمل بدون إنترنت (ملف محمول)</span>
              </button>
            </div>
          </div>

          {/* Option 2: Browser PWA Installation (Desktop App Integration) */}
          <div className="p-4 sm:p-5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                <Zap className="w-4 h-4 text-amber-600" />
                <span>تثبيت كتطبيق مكتبي رسمي عبر المتصفح (PWA Desktop App)</span>
              </div>
              {isInstalled && (
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                  التطبيق مثبت على جهازك
                </span>
              )}
            </div>

            <p className="text-xs text-stone-700 leading-relaxed">
              إذا كنت تستخدم متصفح <strong>Google Chrome</strong> أو <strong>Microsoft Edge</strong>، يمكنك تثبيت التطبيق ليظهر كأيقونة برنامج مستقل في <strong>قائمة ابدأ (Start Menu)</strong> وسطح المكتب. يعمل أيضاً بدون إنترنت بالكامل عبر تقنية التخزين المؤقت المحلي (Service Worker Cache).
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              {isInstallable ? (
                <button
                  type="button"
                  onClick={handleDirectInstall}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>تثبيت فوري كبرنامج مكتبي (بضغطة واحدة)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleOpenDirectWindow}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                  <span>فتح في نافذة مستقلة لتفعيل زر التثبيت</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleDownloadLauncher}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-stone-300 hover:bg-stone-100 text-stone-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                title="مشغل سريع يفتح التطبيق في نافذة مستقلة بدون أشرطة متصفح"
              >
                <FileCode className="w-3.5 h-3.5 text-amber-600" />
                <span>تحميل مشغل ويندوز التلقائي (.bat)</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadShortcut}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <span>اختصار سطح المكتب (.url)</span>
              </button>
            </div>
          </div>

          {/* Option 3: Mobile Devices */}
          <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2.5">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-xs sm:text-sm">
              <Smartphone className="w-4 h-4 text-amber-600" />
              <span>على الهاتف المحمول واللوحي (Android و iOS)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-600 leading-relaxed">
              <div className="bg-white p-3 rounded-lg border border-stone-200">
                <span className="font-bold text-stone-800 block mb-1">
                  📱 هواتف أندرويد (Chrome):
                </span>
                اضغط على القائمة (⋮) ثم اختر <strong>"تثبيت التطبيق"</strong> أو <strong>"الإضافة للشاشة الرئيسية"</strong> وسيعمل كبرنامج هاتف دون الحاجة لمتجر تطبيقات.
              </div>
              <div className="bg-white p-3 rounded-lg border border-stone-200">
                <span className="font-bold text-stone-800 block mb-1">
                  🍏 آيفون / آيباد (Safari):
                </span>
                اضغط على زر المشاركة <strong>📤</strong> أسفل شاشة Safari ثم اختر <strong>"إضافة إلى الشاشة الرئيسية" 📲</strong>.
              </div>
            </div>
          </div>

          {/* Offline Guarantees */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs text-stone-600 pt-1">
            <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
              <WifiOff className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <div className="font-bold text-stone-800">بدون اتصال نهائياً</div>
              <div className="text-[11px] text-stone-500">يعمل بدون شبكة إنترنت</div>
            </div>
            <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
              <Layers className="w-4 h-4 text-amber-600 mx-auto mb-1" />
              <div className="font-bold text-stone-800">بيانات تشريعية كاملة</div>
              <div className="text-[11px] text-stone-500">القرارات والقانون مدمجة</div>
            </div>
            <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
              <Printer className="w-4 h-4 text-sky-600 mx-auto mb-1" />
              <div className="font-bold text-stone-800">طباعة محلية</div>
              <div className="text-[11px] text-stone-500">تصدير وطباعة في أي وقت</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-stone-200 px-6 py-3.5 bg-stone-50 flex items-center justify-between">
          <span className="text-[11px] text-stone-500">
            قاعدة القرارات الوزارية المنفذة لقانون العمل 14 لسنة 2025 · تشغيل مكتبي بدون إنترنت
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-300 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
