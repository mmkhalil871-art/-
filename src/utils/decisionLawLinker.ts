import { MinisterialDecision } from '../types/decision';
import { LaborLawInfo } from '../data/laborLawData';
import { getAllLawArticlesFlattened } from './lawStorage';
import { normalizeArticleName, generateLegalBasisSummary } from './lawArticlesHelper';

/**
 * Normalizes text for keyword matching
 */
function cleanText(str: string): string {
  if (!str) return '';
  return str
    .replace(/[إأآا]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\u064B-\u065F]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Domain topic dictionaries for matching decisions to law articles
 */
const TOPIC_MATCHERS: {
  keywords: string[];
  lawKeywords: string[];
}[] = [
  // تشغيل النساء والأمومة
  {
    keywords: ['نساء', 'المراه', 'امومه', 'حضانه', 'وضع', 'رضاعه', 'الحوامل'],
    lawKeywords: ['النساء', 'المراه', 'الوضع', 'الحمل', 'الرضاعه', 'دور الحضانه', 'حضانه'],
  },
  // تشغيل وتدريب الأحداث والأطفال
  {
    keywords: ['احداث', 'اطفال', 'حدث', 'طفل', 'تلمذه', 'السن الادني'],
    lawKeywords: ['الطفل', 'الحدث', 'الاطفال', 'الاحداث', 'سن الخامسه عشره', 'سن الرابعه عشره'],
  },
  // التدرج المهني
  {
    keywords: ['تدرج مهني', 'متدرج', 'تلمذه حرفيه', 'تلمذه صناعيه'],
    lawKeywords: ['التدرج المهني', 'المتدرج', 'عقد التدرج'],
  },
  // ترخيص وتشغيل الأجانب
  {
    keywords: ['اجانب', 'اجنبي', 'ترخيص عمل الاجانب', 'غير المصريين'],
    lawKeywords: ['الاجانب', 'ترخيص عمل', 'استقدام الاجانب', 'مساعد مصري'],
  },
  // لوائح تنظيم العمل والجزاءات التأديبية
  {
    keywords: ['جزاءات', 'تاديب', 'لائحه تنظيم العمل', 'تحقيق', 'مساءله', 'خصم'],
    lawKeywords: ['الجزاءات', 'التحقيق', 'لائحه تنظيم العمل', 'المساءله التاديبيه'],
  },
  // ساعات العمل والراحات والمناوبة
  {
    keywords: ['ساعات العمل', 'فترات الراحه', 'مناوبه', 'ورديات', 'العمل الاضافي', 'راحه اسبوعيه'],
    lawKeywords: ['ساعات العمل', 'ساعات الراحه', 'المناوبه', 'العمل الاضافي', 'ثماني ساعات'],
  },
  // الأجور والحد الأدنى وحماية الأجور
  {
    keywords: ['اجور', 'اجر', 'الحد الادني للاجور', 'حمايه الاجور', 'wps', 'المرتبات'],
    lawKeywords: ['الاجر', 'الاجور', 'الحد الادني', 'حمايه الاجور', 'علاوه'],
  },
  // الأعياد والمناسبات الرسمية
  {
    keywords: ['اعياد', 'اجازات رسميه', 'مناسبات رسميه', 'عطلات'],
    lawKeywords: ['الاعياد', 'الاجازات الرسميه', 'اجر كامل في الاعياد'],
  },
  // عقود العمل الفردية والتوثيق الرقمي وفترة الاختبار
  {
    keywords: ['عقود العمل', 'عقد العمل', 'توثيق الكتروني', 'فتره الاختبار', 'منصه رقميه'],
    lawKeywords: ['عقد العمل الفردي', 'توثيق', 'فتره الاختبار', 'استماره 6'],
  },
  // السلامة والصحة المهنية وتأمين بيئة العمل
  {
    keywords: ['سلامه وصحه مهنيه', 'بيئه العمل', 'مخاطر', 'فحص طبي', 'امراض مهنيه', 'مهمات الوقايه'],
    lawKeywords: ['السلامه والصحه المهنيه', 'بيئه العمل', 'المخاطر', 'الفحص الطبي', 'الوقايه الشخصيه'],
  },
  // أجهزة ولجان السلامة والصحة المهنية
  {
    keywords: ['اجهزه السلامه', 'لجان السلامه', 'اخصائي سلامه', 'لجنه السلامه'],
    lawKeywords: ['جهاز السلامه', 'لجنه السلامه والصحه المهنيه', 'اخصائي'],
  },
  // تفتيش السلامة والوقف الإداري للخطر الداهم
  {
    keywords: ['تفتيش السلامه', 'خطر داهم', 'وقف اداري', 'غلق اداري'],
    lawKeywords: ['تفتيش السلامه', 'الخطر الداهم', 'وقف العمل كليا او جزئيا'],
  },
  // تفتيش العمل الميداني والضبطية القضائية والتصالح
  {
    keywords: ['تفتيش العمل', 'ضبطيه قضائيه', 'تفتيش ذكي', 'انذار مبكر', 'تصالح', 'صلح'],
    lawKeywords: ['مفتشي العمل', 'الضبطيه القضائيه', 'التصالح', 'انقضاء الدعوي'],
  },
  // وكالات التشغيل وإلحاق العمالة بالداخل والخارج
  {
    keywords: ['الحاق العماله', 'وكالات التشغيل', 'خطاب ضمان', 'عقود العمل بالخارج'],
    lawKeywords: ['الحاق العماله', 'شركات مساهمه', 'خطاب ضمان', 'عمولات'],
  },
  // صندوق تمويل التدريب والتأهيل ومراكز التدريب
  {
    keywords: ['صندوق التدريب', 'تمويل التدريب', 'مراكز التدريب', 'اشتراك المنشات'],
    lawKeywords: ['صندوق تمويل التدريب', 'مراكز التدريب المهني', 'نسبه سنويه'],
  },
  // منازعات العمل الجماعية والوساطة والتحكيم والإضراب
  {
    keywords: ['منازعات جماعيه', 'وساطه', 'تحكيم عمالي', 'اضراب', 'توفيق'],
    lawKeywords: ['منازعات العمل الجماعيه', 'الوساطه', 'هيئه التحكيم', 'الاضراب'],
  },
];

/**
 * Automatically maps and links ministerial decisions to the newly uploaded labor law
 */
export function autoLinkDecisionsToUploadedLaw(
  decisions: MinisterialDecision[],
  law: LaborLawInfo
): MinisterialDecision[] {
  const flattenedArticles = getAllLawArticlesFlattened(law);

  if (flattenedArticles.length === 0) {
    return decisions;
  }

  return decisions.map((decision) => {
    const matchedArticlesSet = new Set<string>();
    const matchedDetails: { articleNumber: string; topic: string; mandate: string }[] = [];

    const decSearchText = cleanText(
      `${decision.title} ${decision.executingSubject || ''} ${decision.category} ${(decision.tags || []).join(' ')} ${decision.preamble}`
    );

    // 1. Check if the decision already has explicit article numbers that exist in the uploaded law
    if (decision.relatedLawArticles && decision.relatedLawArticles.length > 0) {
      decision.relatedLawArticles.forEach((existingArtNum) => {
        const norm = normalizeArticleName(existingArtNum);
        const found = flattenedArticles.find(
          (a) => normalizeArticleName(a.number) === norm
        );
        if (found) {
          matchedArticlesSet.add(norm);
          matchedDetails.push({
            articleNumber: norm,
            topic: found.title || found.chapterTitle,
            mandate: found.text.slice(0, 150) + (found.text.length > 150 ? '...' : ''),
          });
        }
      });
    }

    // 2. Perform intelligent semantic matching across uploaded law articles
    for (const matcher of TOPIC_MATCHERS) {
      const isDecisionRelevant = matcher.keywords.some((k) =>
        decSearchText.includes(cleanText(k))
      );

      if (isDecisionRelevant) {
        for (const lawArt of flattenedArticles) {
          const artTextClean = cleanText(`${lawArt.number} ${lawArt.title || ''} ${lawArt.text}`);
          const isArtRelevant = matcher.lawKeywords.some((lk) =>
            artTextClean.includes(cleanText(lk))
          );

          if (isArtRelevant) {
            const normNum = normalizeArticleName(lawArt.number);
            if (!matchedArticlesSet.has(normNum)) {
              matchedArticlesSet.add(normNum);
              matchedDetails.push({
                articleNumber: normNum,
                topic: lawArt.title || lawArt.chapterTitle,
                mandate: lawArt.text.slice(0, 150) + (lawArt.text.length > 150 ? '...' : ''),
              });
            }
          }
        }
      }
    }

    // Sort article numbers numerically if possible
    const sortedArticles = Array.from(matchedArticlesSet).sort((a, b) => {
      const numA = parseInt(a.replace(/[^\d]/g, ''), 10) || 0;
      const numB = parseInt(b.replace(/[^\d]/g, ''), 10) || 0;
      return numA - numB;
    });

    const finalArticles =
      sortedArticles.length > 0 ? sortedArticles : decision.relatedLawArticles || [];

    const updatedLegalBasis = generateLegalBasisSummary(finalArticles);

    return {
      ...decision,
      relatedLawArticles: finalArticles,
      legalBasisSummary: updatedLegalBasis,
      enactedLawArticlesDetail:
        matchedDetails.length > 0 ? matchedDetails : decision.enactedLawArticlesDetail,
      updatedAt: new Date().toISOString(),
    };
  });
}
