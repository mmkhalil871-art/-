import React, { useRef, useState } from 'react';
import {
  X,
  Download,
  Upload,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Database
} from 'lucide-react';
import { MinisterialDecision } from '../types/decision';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  decisions: MinisterialDecision[];
  onImportDecisions: (imported: MinisterialDecision[]) => void;
  onResetToDefault: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  decisions,
  onImportDecisions,
  onResetToDefault,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(decisions, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `قاعدة_قرارات_قانون_العمل_14_2025_${new Date()
        .toISOString()
        .split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setSuccessMsg('تم تصدير نسخة احتياطية من قاعدة القرارات بنجاح.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setErrorMsg('حدث خطأ أثناء تصدير البيانات.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && parsed.length > 0) {
          onImportDecisions(parsed);
          setSuccessMsg(`تم استيراد ${parsed.length} قرار وزاري بنجاح!`);
          setTimeout(() => setSuccessMsg(null), 3500);
        } else {
          setErrorMsg('الملف المحدد لا يحتوي على بنية قرارات صالحة.');
        }
      } catch (err) {
        setErrorMsg('الملف غير صالح (تأكد من اختيار ملف JSON صحيح).');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReset = () => {
    if (
      confirm(
        'هل أنت متأكد من استعادة القرارات الافتراضية الأصلية؟ ستتم إعادة تعيين قاعدة البيانات إلى حالتها المعتمدة الأصلية.'
      )
    ) {
      onResetToDefault();
      setSuccessMsg('تمت استعادة القرارات الوزارية الأصلية بنجاح.');
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 no-print">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full flex flex-col border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="bg-stone-900 text-stone-100 px-6 py-4 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                إدارة البيانات والنسخ الاحتياطي
              </h2>
              <p className="text-xs text-stone-400">
                تصدير واستيراد القرارات للحفاظ على البيانات
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

        {/* Body */}
        <div className="p-6 space-y-5 text-sm">
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Export */}
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-stone-900 text-xs sm:text-sm">
                  تصدير قاعدة القرارات كاملة (JSON)
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  تنزيل ملف يحتوي على كافة القرارات ({decisions.length} قرار) لحفظها على جهازك.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExport}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تصدير الآن</span>
              </button>
            </div>

            {/* Import */}
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-stone-900 text-xs sm:text-sm">
                  استيراد قرارات من ملف احتياطي
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  رفع ملف JSON تم تصديره سابقاً لإضافته لقاعدتك الحالية.
                </p>
              </div>
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-300 hover:bg-stone-100 text-stone-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0"
                >
                  <Upload className="w-3.5 h-3.5 text-stone-600" />
                  <span>اختيار ملف</span>
                </button>
              </div>
            </div>

            {/* Reset */}
            <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-rose-900 text-xs sm:text-sm">
                  استعادة القرارات الوزارية الافتراضية
                </h3>
                <p className="text-xs text-rose-700/80 mt-0.5">
                  إعادة ضبط القرارات إلى القرارات الرسمية المعتمدة لقانون العمل 14 لسنة 2025.
                </p>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>استعادة</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-stone-200 px-6 py-3 bg-stone-50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-300 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
