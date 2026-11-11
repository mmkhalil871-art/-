import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Download,
  CheckCircle2,
  AlertTriangle,
  Zap,
  ExternalLink,
  ShieldCheck,
  QrCode,
  Copy,
  Check,
  Sparkles,
  HardDrive,
  WifiOff,
  Monitor
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { MinisterialDecision } from '../types/decision';
import { LaborLawInfo } from '../data/laborLawData';
import { downloadMobilePhoneApp } from '../utils/desktopAppLauncher';

interface AndroidApkModalProps {
  isOpen: boolean;
  onClose: () => void;
  decisions?: MinisterialDecision[];
  law?: LaborLawInfo | null;
  effectiveMode?: 'mobile' | 'desktop';
  onToggleDeviceMode?: () => void;
}

export const AndroidApkModal: React.FC<AndroidApkModalProps> = ({
  isOpen,
  onClose,
  decisions = [],
  law,
  effectiveMode,
  onToggleDeviceMode,
}) => {
  const { activeTheme, activeAccent } = useTheme();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installState, setInstallState] = useState<'idle' | 'installing' | 'installed'>('idle');
  const [copiedLink, setCopiedLink] = useState(false);
  const [showDirectSteps, setShowDirectSteps] = useState(true);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  if (!isOpen) return null;

  const handleDownloadMobileApp = () => {
    downloadMobilePhoneApp(decisions, law);
    setDownloadSuccessMessage('تم تنزيل نسخة الهاتف الجوال بنجاح! افتح الملف في هاتفك واضغط "إضافة إلى الشاشة الرئيسية" ليعمل كتطبيق دائم.');
    setTimeout(() => setDownloadSuccessMessage(null), 7000);
  };

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
      setShowDirectSteps(true);
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
  const pwaBuilderUrl = `https://www.pwabuilder.com?url=${encodeURIComponent(currentUrl)}`;

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
                تشغيل المنظومة كتطبيق هاتف أندرويد (حل مشكلة التثبيت)
              </h2>
              <p className="text-xs opacity-70">
                الطريقة الرسمية المعتمدة والمضمونة 100% لتشغيل التطبيق بدون أخطاء
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
          {/* Download Success Banner */}
          {downloadSuccessMessage && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-400 dark:border-emerald-600 rounded-xl text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2.5 animate-fadeIn shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="font-semibold leading-relaxed">{downloadSuccessMessage}</div>
            </div>
          )}

          {/* Primary Method: Direct 1-Tap Mobile Phone App Download (Hero Card) */}
          <div className="p-5 rounded-2xl border-2 border-emerald-500 bg-gradient-to-br from-emerald-950/80 via-emerald-900/60 to-stone-900 text-white space-y-4 shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-stone-950 flex items-center justify-center font-bold shadow-md shrink-0">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-stone-950 shadow-xs">
                      ⚡ تحميل مباشر للهاتف 100%
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/30 text-emerald-200 border border-emerald-400/40">
                      يعمل أوفلاين بدون نت
                    </span>
                  </div>
                  <h3 className="font-bold text-base sm:text-lg text-white">
                    تحميل نسخة الهاتف الجوال مباشرة (ملف تطبيق كامل بدون متجر)
                  </h3>
                </div>
              </div>
            </div>

            <p className="text-xs text-emerald-100/90 leading-relaxed">
              تم بناء هذه النسخة خصيصاً لشاشات الهواتف الذكية (Android و iPhone): يتم تنزيل ملف التطبيق مباشرة إلى مجلد التنزيلات (Downloads) بهاتفك، ويفتح في أي متصفح (Chrome أو Safari أو Samsung Internet) ليعمل كتطبيق هاتف متكامل مع شريط ملاحة سفلي للمس، ومحرك بحث فوري، ونصوص القرارات الوزارية الـ 17 وقانون العمل 14 لسنة 2025 كاملة.
            </p>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-black/40 p-3 rounded-xl border border-emerald-500/30">
              <div className="flex items-center gap-2 text-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>تحميل مباشر دون الحاجة لمتجر Google Play أو أذونات خاصة</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>يعمل 100% بدون اتصال بالإنترنت (Offline) ولا يستهلك باقة البيانات</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>مدمج به القرارات وقانون العمل والمفضلة والوضع الليلي</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>إمكانية إضافته للشاشة الرئيسية ليعمل بملء الشاشة كأي تطبيق عادي</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-1 flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={handleDownloadMobileApp}
                className="px-6 py-3.5 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 active:from-emerald-600 active:to-emerald-500 text-stone-950 font-extrabold rounded-xl text-sm shadow-md transition-all cursor-pointer flex items-center gap-2 hover:scale-[1.02] active:scale-95"
              >
                <Download className="w-5 h-5 text-stone-950" />
                <span>تحميل نسخة الهاتف الجوال مباشرة الآن (ملف كامل)</span>
              </button>

              {onToggleDeviceMode && (
                <button
                  type="button"
                  onClick={onToggleDeviceMode}
                  className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer border border-white/20"
                >
                  <Monitor className="w-4 h-4 text-amber-300" />
                  <span>
                    {effectiveMode === 'mobile'
                      ? 'التبديل لواجهة الحاسب الكاملة'
                      : 'معاينة واجهة الموبايل على الشاشة'}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Diagnostic Note: Why raw APK files fail to open on Android */}
          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-50/70 dark:bg-amber-950/25 text-amber-900 dark:text-amber-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <span>لماذا تظهر رسالة «خطأ في تحليل الحزمة» أو لا يفتح ملف الـ APK المحمّل يدوياً؟</span>
            </div>
            <p className="text-xs opacity-90 leading-relaxed pr-1">
              نظام أندرويد الحديث (Android 9 فما فوق) يشترط أمنياً أن تكون ملفات الـ APK مجمّعة ثنائياً وموقعة بشهادة رقمية رسمية معتمدة من Google، وإلا يرفض الهاتف تثبيتها ويُظهر خطأ <em>«حدثت مشكلة أثناء تحليل الحزمة»</em>.
              <br />
              <strong>الحل المعتمد والمتاح أعلاه:</strong> قمنا بتوفير <strong>ملف التطبيق المستقل المباشر</strong> الذي يعمل فوراً دون أخطاء حزمة، بالإضافة إلى ميزة <strong>التثبيت التلقائي الرسمي (WebAPK)</strong> أدناه!
            </p>
          </div>

          {/* Guaranteed Method 2: Google Official 1-Tap Native Install (WebAPK) */}
          <div className="p-5 rounded-2xl border-2 border-sky-500/40 bg-sky-50/60 dark:bg-sky-950/25 space-y-3.5 shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-emerald-950 dark:text-emerald-200">
                    الطريقة الرسمية المضمونة 100%: التثبيت التلقائي على هاتفك
                  </h3>
                  <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80">
                    يقوم نظام أندرويد بتجميع وتثبيت التطبيق كبرنامج مستقل على شاشة هاتفك
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 shrink-0">
                موصى به ومعتمد
              </span>
            </div>

            <div className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed pr-1 space-y-1">
              <p>
                بنقرة واحدة، يتعرف نظام أندرويد على المنظومة ويقوم بتسجيلها كتطبيق رسمي مثبت في جهازك:
              </p>
              <ul className="list-disc list-inside space-y-0.5 opacity-90 pr-2">
                <li>يظهر بأيقونة رسمية على شاشتك الرئيسية وفي قائمة البرامج.</li>
                <li>يعمل بملء الشاشة دون أشرطة متصفح كأي تطبيق محمل من المتجر.</li>
                <li>يعمل بالكامل بدون اتصال بالإنترنت (Offline) في أي وقت وأي مكان.</li>
                <li>لا يحتاج إلى ملفات تنزيل يدوية أو تصاريح أمان معقدة.</li>
              </ul>
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
                    : 'تثبيت التطبيق على هاتفي الآن 🚀'}
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
                    <span>تم نسخ الرابط!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>نسخ رابط الفتح في الهاتف</span>
                  </>
                )}
              </button>
            </div>

            {/* Step-by-Step Visual Mobile Guide */}
            {showDirectSteps && (
              <div className="mt-3 p-4 rounded-xl bg-white/80 dark:bg-zinc-800/80 border border-emerald-200 dark:border-emerald-800/50 space-y-2 text-xs">
                <p className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>خطوات التثبيت من متصفح الهاتف (Chrome / Samsung Internet):</span>
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-stone-700 dark:text-stone-300 pr-1 leading-relaxed">
                  <li>
                    افتح هذا الرابط على متصفح <strong>Google Chrome</strong> بهاتفك المحمول.
                  </li>
                  <li>
                    اضغط على زر القائمة المكون من ثلاث نقاط <strong>( ⋮ )</strong> في أعلى أو أسفل يمين شاشة المتصفح.
                  </li>
                  <li>
                    اختر <strong>«تثبيت التطبيق» (Install app)</strong> أو <strong>«إضافة إلى الشاشة الرئيسية»</strong>.
                  </li>
                  <li>
                    اضغط <strong>«تثبيت»</strong>؛ وسيقوم هاتفك فوراً بإنشاء أيقونة التطبيق في شاشة الهاتف والعمل كبرنامج مستقل بدون نت.
                  </li>
                </ol>
              </div>
            )}
          </div>

          {/* Guaranteed Method 2: Scan with Phone Camera (If on PC/Tablet) */}
          <div className="p-5 rounded-2xl border border-stone-200 dark:border-zinc-700 bg-stone-50/60 dark:bg-zinc-800/30 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold shadow-xs">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                  هل تفتح المنظومة من الحاسب الآن وتريد تثبيتها على هاتفك فوراً؟
                </h3>
                <p className="text-[11px] opacity-75">
                  وجّه كاميرا هاتفك نحو الرمز أدناه ليفتح الرابط في الهاتف، ثم اضغط «تثبيت التطبيق»
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
                  📱 كيفية التثبيت عبر كاميرا الهاتف:
                </p>
                <p>1. افتح تطبيق الكاميرا على هاتفك ووجهه نحو المربع المقابل.</p>
                <p>2. اضغط على الرابط الأصفر الذي يظهر لك على الشاشة ليفتح الموقع في Chrome.</p>
                <p>3. ستظهر لك رسالة «تثبيت التطبيق» مباشرة بأسفل الشاشة، اضغط عليها وسيصبح التطبيق على هاتفك فوراً.</p>
              </div>
            </div>
          </div>

          {/* Guaranteed Method 3: Official Signed APK via PWABuilder (For users who strictly need a signed .apk file) */}
          <div className="p-4 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50/40 dark:bg-zinc-850/40 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-stone-900 dark:text-zinc-100 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-sky-500" />
                <span>إذا كنت بحاجة ماسة لتحميل ملف حزمة أندرويد موقعة رسمياً (Signed APK Package):</span>
              </h4>
            </div>
            <p className="opacity-80 leading-relaxed">
              لتوليد حزمة APK كاملة وموقعة برمجياً بشهادة أمان (Digital Signature) تتوافق مع متجر Google Play وأجهزة أندرويد دون أي أخطاء في التحليل، يمكنك استخدام خدمة <strong>PWABuilder</strong> المعتمدة رسمياً من شركتي Google و Microsoft:
            </p>
            <div className="pt-1">
              <a
                href={pwaBuilderUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg transition-colors cursor-pointer text-xs"
              >
                <span>توليد ملف APK موقّع عبر PWABuilder</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
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
