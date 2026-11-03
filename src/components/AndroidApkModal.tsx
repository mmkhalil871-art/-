import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Download,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Layers,
  Sparkles,
  WifiOff,
  Copy,
  Check,
  QrCode,
  FileCheck2,
  ArrowDownToLine,
  HelpCircle
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
  const [showManualGuide, setShowManualGuide] = useState(false);
  const [downloadTriggered, setDownloadTriggered] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  if (!isOpen) return null;

  const handleNativeInstall = async () => {
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
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    currentUrl
  )}&margin=8`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 no-print animate-fadeIn">
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
                تحميل وتثبيت التطبيق على الهاتف المحمول (Android APK)
              </h2>
              <p className="text-xs opacity-70">
                طرق مباشرة وميسرة جداً لتحميل ملف APK أو تثبيت التطبيق بنقرة واحدة
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
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {/* Method 1: Direct 1-Click APK Download (What the user explicitly asked for!) */}
          <div className="p-5 rounded-2xl border-2 border-sky-500/40 bg-sky-50/60 dark:bg-sky-950/25 space-y-3.5 shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <ArrowDownToLine className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-sky-950 dark:text-sky-200">
                    الطريقة الأولى: تحميل ملف التطبيق المباشر (LaborLaw-Egypt-2025.apk)
                  </h3>
                  <p className="text-xs text-sky-800/80 dark:text-sky-300/80">
                    تنزيل فوري بنقرة واحدة لملف APK دون مغادرة المنظومة أو الدخول في أي مواقع أخرى
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/40 shrink-0">
                تحميل مباشر 1-Click
              </span>
            </div>

            <div className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed pr-1">
              <p>
                ملف حزمة تطبيق أندرويد <strong>(.apk)</strong> مدمج به نصوص مواد قانون العمل رقم 14 لسنة 2025
                وكافة القرارات الوزارية المنفذة مع نسخ الـ PDF الممسوحة ضوئياً والقدرة على العمل أوفلاين.
              </p>
            </div>

            {/* Direct 1-Click APK Download Button */}
            <div className="pt-1 flex items-center gap-3 flex-wrap">
              <a
                href="/LaborLaw-Egypt-2025.apk"
                download="LaborLaw-Egypt-2025.apk"
                onClick={() => setDownloadTriggered(true)}
                className="px-5 py-3 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center gap-2 hover:scale-[1.02]"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>تحميل ملف APK مباشرة الآن (حجم خفيف)</span>
              </a>

              {downloadTriggered && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>بدأ التحميل بنجاح! راجع قائمة تنزيلات هاتفك.</span>
                </div>
              )}
            </div>

            {/* Simple 3-step guide for APK */}
            <div className="mt-3 p-3.5 rounded-xl bg-white/70 dark:bg-zinc-800/60 border border-sky-200 dark:border-sky-900/60 space-y-1.5 text-xs">
              <h4 className="font-bold text-sky-900 dark:text-sky-300 flex items-center gap-1.5">
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>خطوات التثبيت السهلة على هاتفك بعد التحميل:</span>
              </h4>
              <ol className="list-decimal list-inside space-y-1 text-stone-700 dark:text-stone-300 pr-1 leading-relaxed">
                <li>
                  انقر على الملف بعد انتهاء تحميله من شريط الإشعارات أو من مجلد <strong>Downloads (التنزيلات)</strong>.
                </li>
                <li>
                  اضغط على زر <strong>تثبيت (Install)</strong>.
                </li>
                <li>
                  في حال ظهر لك تنبيه أمان أندرويد للمصادر غير المعروفة، اختر <strong>«السماح من هذا المصدر»</strong> أو <strong>«التثبيت على أي حال»</strong>.
                </li>
              </ol>
            </div>
          </div>

          {/* Method 2: Instant 1-Tap Native Android WebAPK (The smoothest zero-effort way) */}
          <div className="p-5 rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-3.5 shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-emerald-950 dark:text-emerald-200">
                    الطريقة الثانية: التثبيت الفوري التلقائي (الأسهل بدون تنزيل ملفات)
                  </h3>
                  <p className="text-xs text-stone-600 dark:text-stone-300">
                    يقوم نظام Android Chrome تلقائياً بتثبيت التطبيق على الشاشة الرئيسية بدون أي ملفات يدوية
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 shrink-0">
                أسهل طريقة للهاتف
              </span>
            </div>

            <div className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed pr-1">
              <p>
                💡 <strong>الميزة الذهبية:</strong> لا تحتاج لتنزيل ملفات أو فتح مدير الملفات؛ سيقوم أندرويد بوضع أيقونة
                التطبيق مباشرة في قائمة برامج هاتفك ليعمل بشاشة كاملة وبدون إنترنت تماماً.
              </p>
            </div>

            <div className="pt-1 flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={handleNativeInstall}
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center gap-2 hover:scale-[1.02]"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>
                  {installState === 'installed'
                    ? 'تم التثبيت بنجاح على هاتفك ✓'
                    : 'تثبيت التطبيق على هاتفي بلمسة واحدة 🚀'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleCopyAppUrl}
                className="px-3.5 py-3 border rounded-xl font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>تم نسخ رابط التطبيق!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>نسخ رابط الفتح في الهاتف</span>
                  </>
                )}
              </button>
            </div>

            {showManualGuide && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs space-y-1.5 animate-fadeIn">
                <p className="font-bold flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>خطوات التثبيت التلقائي السريعة من قائمة المتصفح:</span>
                </p>
                <ol className="list-decimal list-inside space-y-1 pr-1 opacity-95 leading-relaxed">
                  <li>افتح قائمة المتصفح بالضغط على زر النقاط الثلاث <strong>(⋮)</strong> بأعلى أو أسفل الشاشة.</li>
                  <li>اختر <strong>«تثبيت التطبيق» (Install App)</strong> أو <strong>«إضافة إلى الشاشة الرئيسية»</strong>.</li>
                  <li>سيظهر التطبيق فوراً كبرنامج مستقل في قائمة تطبيقات الهاتف.</li>
                </ol>
              </div>
            )}
          </div>

          {/* Method 3: Instant Phone Camera QR Code Scan */}
          <div className="p-5 rounded-2xl border border-stone-200 dark:border-zinc-700 bg-stone-50/60 dark:bg-zinc-800/30 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold shadow-xs">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                  هل تفتح المنظومة من الكمبيوتر أو التابلت الآن وتريد نقلها لهاتفك؟
                </h3>
                <p className="text-[11px] opacity-75">
                  وجّه كاميرا هاتفك نحو الرمز أدناه ليفتح التطبيق فوراً على الموبايل وتثبته في ثانيتين
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
              <div className="p-2.5 bg-white rounded-xl shadow-xs border border-stone-200 shrink-0">
                <img
                  src={qrCodeUrl}
                  alt="رمز QR لفتح التطبيق على الهاتف"
                  className="w-28 h-28 object-contain"
                  loading="lazy"
                />
              </div>
              <div className="space-y-1.5 text-xs text-stone-600 dark:text-stone-300">
                <p className="font-bold text-stone-800 dark:text-stone-100">
                  📷 طريقة المسح السريعة:
                </p>
                <p>1. افتح تطبيق الكاميرا بهاتفك ووجهه نحو المربع المقابل.</p>
                <p>2. اضغط على الرابط الأصفر الذي يظهر على الشاشة.</p>
                <p>3. ستفتح المنظومة كاملة، واضغط على «تثبيت التطبيق» ليصبح معك دائماً بدون إنترنت.</p>
              </div>
            </div>
          </div>

          {/* Offline & Legal Benefits */}
          <div className="p-4 rounded-xl border border-black/5 dark:border-white/5 space-y-2 bg-stone-100/50 dark:bg-zinc-800/20">
            <h4 className="font-bold text-xs flex items-center gap-1.5 text-stone-900 dark:text-zinc-100">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>مزايا التطبيق على هاتفك المحمول:</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs opacity-80">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>يعمل بالكامل بدون إنترنت (Offline) في المحكمة والعمل الميداني</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>الوصول الفوري للنسخ الممسوحة ضوئياً (PDF) بلمسة واحدة</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>النسخ السريع لنصوص مواد القرارات وقانون العمل 14 للاقتباس</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>شاشة كاملة وتصميم ميسر مخصص لحركة الإبهام والوضع الليلي</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-3 border-t flex items-center justify-between ${
            activeTheme.isDark ? 'bg-zinc-950/80 border-zinc-800' : 'bg-stone-50 border-stone-200'
          }`}
        >
          <span className="text-[11px] opacity-65 hidden sm:inline">
            المنظومة الوطنية للتشريعات وقانون العمل رقم 14 لسنة 2025
          </span>
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
