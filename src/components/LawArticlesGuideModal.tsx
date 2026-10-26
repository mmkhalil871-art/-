import React from 'react';
import { X, BookOpen, ExternalLink, ArrowRight, CheckCircle2, Scale, Layers } from 'lucide-react';

interface LawArticlesGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategoryFilter: (categoryName: string) => void;
}

const LAW_CHAPTERS = [
  {
    chapter: 'مواد الإصدار',
    title: 'نطاق العمل والإلغاء وتوفيق الأوضاع وتفويض القرارات',
    articlesRange: 'المواد من 1 إلى 7 من مواد الإصدار',
    executiveScope: 'إلغاء قانون العمل رقم 12 لسنة 2003، استمرار العمل باللوائح مؤقتاً، توفيق أوضاع المنشآت، وتفويض وزير العمل بإصدار القرارات المنفذة.',
    relatedCategory: 'جميع التصنيفات',
    executingDecisions: [
      { num: 'قرار 1 لسنة 2025', title: 'توثيق عقود العمل بالمنصة الرقمية' },
      { num: 'القرارات 148 إلى 162 لسنة 2025', title: 'المنظومة الوزارية التنفيذية الكاملة' }
    ]
  },
  {
    chapter: 'الباب الأول',
    title: 'التعاريف والأحكام العامة',
    articlesRange: 'المواد من 1 إلى 14',
    executiveScope: 'المفاهيم الجوهرية (العامل، صاحب العمل، الأجر الأساسي والمتغير والشامل، المنشأة)، حظر التمييز بكافة أشكاله، حظر العمل الجبري والسخرة، وإعفاء الدعاوى العمالية من الرسوم.',
    relatedCategory: 'عقود العمل والتشغيل',
    executingDecisions: [
      { num: 'قرار 1 لسنة 2025', title: 'ضوابط تعريفات وبيانات عقود العمل' }
    ]
  },
  {
    chapter: 'الباب الثاني',
    title: 'التدريب والتشغيل والتدرج المهني وتنظيم تشغيل الأجانب',
    articlesRange: 'المواد من 15 إلى 71',
    executiveScope: 'صندوق تمويل التدريب والتأهيل (المواد 19-20)، شركات إلحاق العمالة (المواد 39-41)، تشغيل النساء والأمومة (المواد 50-54)، تشغيل وتدريب الأحداث (المواد 58-64)، التدرج المهني (المادتان 65-66)، وتراخيص عمل الأجانب (المواد 67-71).',
    relatedCategory: 'تشغيل الفئات الأولى بالرعاية',
    executingDecisions: [
      { num: 'قرار 148 لسنة 2025', title: 'تنظيم تشغيل النساء والمهن المحظورة ورعاية الأمومة (المواد 50-54)' },
      { num: 'قرار 149 لسنة 2025', title: 'تشغيل وتدريب الأحداث وقائمة المهن الخطرة وبطاقات التفتيش (المواد 58-64)' },
      { num: 'قرار 150 لسنة 2025', title: 'التدرج المهني وعقوده ومكافآته التدرجية والمهن الحرفية (المادتان 65-66)' },
      { num: 'قرار 151 لسنة 2025', title: 'قواعد وترخيص عمل الأجانب ونسبة الـ 10% والمهن المحظورة (المواد 67-71)' },
      { num: 'قرار 159 لسنة 2025', title: 'ترخيص شركات إلحاق العمالة بالداخل والخارج وحظر العمولات (المواد 39-41)' },
      { num: 'قرار 160 لسنة 2025', title: 'صندوق تمويل التدريب والتأهيل ونسب اشتراك المنشآت (المادتان 19-20)' },
      { num: 'قرار 161 لسنة 2025', title: 'تراخيص مراكز التدريب المهني الخاصة واعتماد البرامج (المادتان 22-23)' }
    ]
  },
  {
    chapter: 'الباب الثالث',
    title: 'علاقات العمل الفردية (الأجور، ساعات العمل، الإجازات، الجزاءات)',
    articlesRange: 'المواد من 72 إلى 140',
    executiveScope: 'توثيق العقد إلكترونياً (المادة 72)، ساعات العمل والراحات والمناوبة (المواد 80-85)، الحد الأدنى للأجور وحماية الأجور WPS (المواد 88-90)، الإجازات والأعياد الرسمية (المادة 99)، ولائحة الجزاءات والتحقيق (المادتان 110-111).',
    relatedCategory: 'الأجور والبدلات',
    executingDecisions: [
      { num: 'قرار 152 لسنة 2025', title: 'اللائحة النموذجية للجزاءات وضمانات التحقيق التأديبي (المادتان 110-111)' },
      { num: 'قرار 153 لسنة 2025', title: 'جدول الأعياد والمناسبات الرسمية مدفوعة الأجر ومضاعفة الأجر (المادة 99)' },
      { num: 'قرار 154 لسنة 2025', title: 'مواعيد العمل وفترات الراحة ونظام المناوبة والورديات (المواد 80-85)' },
      { num: 'قرار 3 لسنة 2025', title: 'تطبيق الحد الأدنى للأجور والربط بنظام حماية الأجور WPS (المواد 82، 88، 90)' },
      { num: 'قرار 1 لسنة 2025', title: 'توثيق عقد العمل الفردي بالمنصة الرقمية الموحدة (المواد 14، 72، 74)' }
    ]
  },
  {
    chapter: 'الباب الرابع',
    title: 'علاقات العمل الجماعية والمفاوضة وفض المنازعات والتحكيم',
    articlesRange: 'المواد من 141 إلى 195',
    executiveScope: 'المفاوضة الجماعية واتفاقيات العمل المشتركة، إجراءات لجان الوساطة والتوفيق الإقليمية (المادة 168)، هيئات التحكيم القضائية العمالية الملزمة (المادة 170)، وضوابط ممارسة الإضراب السلمي والمنشآت المحظورة (المادة 180).',
    relatedCategory: 'منازعات العمل والتوفيق',
    executingDecisions: [
      { num: 'قرار 162 لسنة 2025', title: 'قواعد الوساطة والتحكيم العمالي ولجان التوفيق بالمحافظات (المواد 168، 170، 180)' }
    ]
  },
  {
    chapter: 'الباب الخامس',
    title: 'السلامة والصحة المهنية وتأمين بيئة العمل',
    articlesRange: 'المواد من 196 إلى 235',
    executiveScope: 'تقييم المخاطر وتوفير مهمات الوقاية مجاناً (المادة 208)، الفحص الطبي الابتدائي والدوري للعمال (المادة 216)، أجهزة ولجان السلامة بالمنشآت (المادتان 227-228)، ومكاتب تفتيش السلامة والوقف الإداري للخطر الداهم (المادتان 232-233).',
    relatedCategory: 'السلامة والصحة المهنية',
    executingDecisions: [
      { num: 'قرار 155 لسنة 2025', title: 'معايير الفحص الطبي الابتدائي والدوري وتأمين بيئة العمل (المادتان 208، 216)' },
      { num: 'قرار 156 لسنة 2025', title: 'شروط إنشاء أجهزة ولجان السلامة والصحة المهنية وتدريبها (المادتان 227، 228)' },
      { num: 'قرار 157 لسنة 2025', title: 'تنظيم تفتيش السلامة والقياسات البيئية وقرارات الوقف الفوري (المادتان 232، 233)' }
    ]
  },
  {
    chapter: 'الباب السادس',
    title: 'تفتيش العمل والضبطية القضائية والعقوبات والتصالح',
    articlesRange: 'المواد من 236 إلى 265+',
    executiveScope: 'صلاحيات مأموري الضبط القضائي وحق دخول المنشآت (المادة 245)، منظومة التفتيش الذكي ومنح مهل توفيق الأوضاع (المادة 246)، وتطبيق الغرامات المالية والتصالح الفوري بنسبة 50% وإسقاط الدعاوى (المادة 260).',
    relatedCategory: 'تفتيش العمل والرقابة',
    executingDecisions: [
      { num: 'قرار 158 لسنة 2025', title: 'تنظيم تفتيش العمل الميداني والضبطية القضائية والتفتيش الذكي والصلح (المواد 245، 246، 260)' }
    ]
  }
];

export const LawArticlesGuideModal: React.FC<LawArticlesGuideModalProps> = ({
  isOpen,
  onClose,
  onSelectCategoryFilter,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 no-print">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col border border-stone-200 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-stone-900 text-stone-100 px-6 py-4 flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>التقسيم الموضوعي لقانون العمل رقم 14 لسنة 2025 والقرارات المنفذة له</span>
                <span className="px-2 py-0.5 text-[11px] font-normal bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30">
                  خريطة تشريعية ملزمة
                </span>
              </h2>
              <p className="text-xs text-stone-400">
                مراجعة شاملة للأبواب ومواد الإصدار ومطابقة القرارات الوزارية الصادرة تنفيذاً لمواد القانون
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
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-950 leading-relaxed flex items-start gap-3">
            <Scale className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm text-stone-900 mb-1">
                دليل المطابقة التشريعية: أي من القرارات جاءت تنفيذاً لمواد القانون؟
              </div>
              <p className="text-stone-700">
                قانون العمل رقم 14 لسنة 2025 ينقسم إلى <strong>7 مواد إصدار</strong> و<strong>6 أبواب تشريعية كبرى</strong> تشمل أكثر من 265 مادة. وتفوض نصوص القانون وزير العمل صراحةً في إصدار قرارات ولوائح وزارية لوضع القواعد التنفيذية والتفصيلية. تم تدقيق وربط كل قرار وزاري في التطبيق بالمواد المحددة المنفذة له.
              </p>
            </div>
          </div>

          {/* Chapters Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {LAW_CHAPTERS.map((ch, idx) => (
              <div
                key={idx}
                className="bg-stone-50 border border-stone-200 rounded-xl p-5 hover:border-amber-400 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                    <span className="font-bold text-amber-900 bg-amber-100/70 border border-amber-300/60 px-2 py-0.5 rounded font-mono">
                      {ch.chapter}
                    </span>
                    <span className="font-mono tabular-nums text-stone-700 bg-white px-2.5 py-0.5 rounded border border-stone-200 font-medium">
                      {ch.articlesRange}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-stone-900 mb-2 leading-snug">
                    {ch.title}
                  </h3>

                  <p className="text-xs text-stone-600 leading-relaxed mb-3">
                    {ch.executiveScope}
                  </p>

                  {/* Executing Decisions List */}
                  {ch.executingDecisions && ch.executingDecisions.length > 0 && (
                    <div className="mb-4 bg-white border border-stone-200 rounded-lg p-2.5 space-y-1.5">
                      <div className="text-[11px] font-bold text-stone-700 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>القرارات الوزارية الصادرة تنفيذاً لمواد هذا الباب:</span>
                      </div>
                      <div className="space-y-1">
                        {ch.executingDecisions.map((dec, dIdx) => (
                          <div
                            key={dIdx}
                            className="text-[11px] text-stone-600 flex items-start gap-1.5 leading-tight"
                          >
                            <span className="font-bold text-amber-800 shrink-0 font-mono">
                              • {dec.num}:
                            </span>
                            <span className="text-stone-700">{dec.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-stone-200 pt-3 flex items-center justify-between">
                  <span className="text-[11px] text-stone-500">
                    التصنيف: {ch.relatedCategory}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectCategoryFilter(ch.relatedCategory);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-950 hover:underline cursor-pointer bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded transition-colors"
                  >
                    <span>استعراض قرارات هذا الباب</span>
                    <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-stone-200 px-6 py-3.5 bg-stone-50 flex items-center justify-between">
          <div className="text-xs text-stone-500">
            تمت مراجعة التقسيم ومطابقة القرارات مع أحدث الجرائد الرسمية وقانون العمل رقم 14 لسنة 2025.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-300 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
          >
            إغلاق الدليل
          </button>
        </div>
      </div>
    </div>
  );
};
