import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Download,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Zap,
  Layers,
  ArrowRight,
  Sparkles,
  WifiOff,
  Copy,
  Check
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface AndroidApkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidApkModal: React.FC<AndroidApkModalProps> = ({ isOpen, onClose }) => {
  const { activeTheme, activeAccent } = useTheme();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installState, setInstallState] = useState<'idle' | 'installing' | 'installed'>('idle');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const [showManualGuide, setShowManualGuide] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      setInstallState('installing');
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setInstallState('installed');
        } else {
          setInstallState('idle');
        }
      } catch (err) {
        console.error('Install prompt error:', err);
        setInstallState('idle');
      }
    } else {
      setShowManualGuide(true);
    }
  };

  const handleCopyAppUrl = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const pwaBuilderUrl = `https://www.pwabuilder.com?url=${encodeURIComponent(currentUrl)}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 no-print">
      <div
        className={`w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden transition-colors flex flex-col max-h-[92vh] ${
          activeTheme.isDark
            ? 'bg-zinc-900 border-zinc-700 text-zinc-100'
            : 'bg-white border-stone-200 text-stone-900'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            activeTheme.isDark ? 'bg-zinc-950/80 border-zinc-800' : 'bg-stone-50 border-stone-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs"
              style={{ backgroundColor: activeAccent.colorHex }}
            >
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                تشغيل المنظومة كتطبيق هاتف (Android APK)
              </h2>
              <p className="text-xs opacity-70">
                تثبيت محلي فوري على هواتف أندرويد أو توليد ملف حزمة APK كاملة
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
          {/* Card 1: Direct WebAPK Android Install */}
          <div className="p-5 rounded-2xl border-2 border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-emerald-950 dark:text-emerald-200">
                    الخيار الأول: التثبيت التلقائي الفوري (Android WebAPK)
                  </h3>
                  <p className="text-xs text-stone-600 dark:text-stone-300">
                    يقوم نظام Android Chrome تلقائياً بتجميع وتثبيت حزمة تطبيق حقيقية بهاتفك
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40">
                موصى به للأندرويد
              </span>
            </div>

            <div className="text-xs space-y-2 text-stone-700 dark:text-stone-300 leading-relaxed pr-2">
              <p>
                💡 <strong>كيف يعمل؟</strong> بنقرة واحدة، يقوم محرك أندرويد بتحويل الموقع إلى تطبيق
                مستقل مسجل في نظام الهاتف (يظهر في قائمة التطبيقات، يعمل بشاشة كاملة دون أشرطة متصفح،
                ويعمل بدون إنترنت تماماً كأي تطبيق محمل من المتجر).
              </p>
            </div>

            <div className="pt-2 flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={handleInstallClick}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>
                  {installState === 'installed'
                    ? 'تم التثبيت بنجاح على الهاتف ✓'
                    : 'تثبيت التطبيق على هاتفي الآن 🚀'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleCopyAppUrl}
                className="px-3.5 py-2.5 border rounded-xl font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>تم نسخ الرابط!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>نسخ رابط الفتح في هاتف أندرويد</span>
                  </>
                )}
              </button>
            </div>

            {showManualGuide && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs space-y-1.5 animate-fadeIn">
                <p className="font-bold flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>خطوات التثبيت المباشر على هاتفك (أندرويد / Chrome):</span>
                </p>
                <ol className="list-decimal list-inside space-y-1 pr-1 opacity-90 leading-relaxed">
                  <li>افتح قائمة المتصفح بالضغط على النقاط الثلاث <strong>(⋮)</strong> بأعلى أو أسفل الشاشة.</li>
                  <li>اختر <strong>«تثبيت التطبيق» (Install App)</strong> أو <strong>«إضافة إلى الشاشة الرئيسية»</strong>.</li>
                  <li>سيقوم نظام أندرويد تلقائياً بإنشاء حزمة WebAPK وتثبيتها كأيقونة تطبيق كامل على جهازك.</li>
                </ol>
              </div>
            )}
          </div>

          {/* Card 2: Generate Signed APK file */}
          <div className="p-5 rounded-2xl border border-stone-200 dark:border-zinc-700 bg-stone-50/50 dark:bg-zinc-800/40 space-y-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base">
                    الخيار الثاني: استخراج وتنزيل ملف APK مستقل (.apk Package)
                  </h3>
                  <p className="text-xs opacity-75">
                    توليد ملف تثبيت أندرويد خام بصيغة APK لنشره وتثبيته يدوياً (Sideload)
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/40">
                حزمة APK
              </span>
            </div>

            <div className="text-xs space-y-2 opacity-85 leading-relaxed">
              <p>
                إذا كنت ترغب في الحصول على ملف التثبيت المباشر <strong>.apk</strong> لتثبيته دون متصفح
                أو إرساله بالبلوتوث / الواتساب:
              </p>
              <ol className="list-decimal list-inside space-y-1.5 font-medium pr-1">
                <li>
                  استخدم منصة <strong>PWABuilder</strong> الرسمية (المدعومة من Google و Microsoft)
                  التي تقوم بحزم كود المنظومة تلقائياً إلى ملف APK معتمد وموقع رقمياً (Signed APK).
                </li>
                <li>
                  قم بالنقر على زر التوليد بالأسفل، وسيتم فحص شهادة الأمان وبيانات المنظومة فورياً.
                </li>
                <li>
                  انقر على <strong>Package for Android</strong> لتحميل ملف الـ APK وتثبيته على أي جهاز.
                </li>
              </ol>
            </div>

            <div className="pt-2 flex items-center gap-3 flex-wrap">
              <a
                href={pwaBuilderUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                <span>توليد وتحميل ملف الـ APK عبر PWABuilder</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Advantages of the Mobile APK Version */}
          <div className="p-4 rounded-xl border border-black/5 dark:border-white/5 space-y-2 bg-stone-100/50 dark:bg-zinc-800/20">
            <h4 className="font-bold text-xs flex items-center gap-1.5 text-stone-900 dark:text-zinc-100">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>مزايا التطبيق على هواتف أندرويد المحمولة:</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs opacity-80">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>تشغيل فوري وسريع دون الحاجة لاتصال بالإنترنت</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>استعراض النسخ الممسوحة الرسمية (PDF) بضغطة زر</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>النسخ السريع لمواد القرارات المنفذة للاقتباس</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>شاشة كاملة وتصميم ميسر مخصص لحركة الإبهام</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-3 border-t flex items-center justify-end ${
            activeTheme.isDark ? 'bg-zinc-950/80 border-zinc-800' : 'bg-stone-50 border-stone-200'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl border text-xs font-semibold cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
