import React, { useState } from 'react';
import {
  FileText,
  FileDown,
  Star,
  Eye,
  Calendar,
  Layers,
  Printer,
  ChevronDown,
  Edit3,
  Trash2,
  Share2,
  Scale
} from 'lucide-react';
import { MinisterialDecision } from '../types/decision';
import { exportDecisionAsWord, exportDecisionAsText } from '../utils/exportUtils';
import { useTheme } from '../context/ThemeContext';
import { useUserAccess } from '../context/UserAccessContext';

interface MobileDecisionCardProps {
  decision: MinisterialDecision;
  onView: (decision: MinisterialDecision, initialTab?: 'scanned_pdf' | 'written_text' | 'summary') => void;
  onPrint: (decision: MinisterialDecision) => void;
  onEdit: (decision: MinisterialDecision) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export const MobileDecisionCard: React.FC<MobileDecisionCardProps> = ({
  decision,
  onView,
  onPrint,
  onEdit,
  onDelete,
  onToggleFavorite,
}) => {
  const { activeTheme, activeAccent } = useTheme();
  const { canEditTexts, canDelete } = useUserAccess();
  const [showMenu, setShowMenu] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'نافذ':
      case 'سارٍ':
        return 'text-emerald-600 dark:text-emerald-400 font-semibold';
      case 'معدل':
        return 'text-amber-600 dark:text-amber-400 font-semibold';
      case 'ملغى':
        return 'text-rose-600 dark:text-rose-400 font-semibold';
      default:
        return 'opacity-75';
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${decision.legislationType || 'قرار وزاري'} رقم ${decision.decisionNumber} لسنة ${decision.year}`,
          text: decision.title,
          url: window.location.href,
        });
      } catch (err) {
        // user cancelled
      }
    } else {
      onView(decision, 'summary');
    }
  };

  return (
    <article
      onClick={() => onView(decision, 'summary')}
      className={`relative overflow-hidden specular-border-t rounded-2xl border p-4 transition-all active:scale-[0.99] cursor-pointer shadow-xs ${
        activeTheme.isDark
          ? 'bg-zinc-850/95 border-zinc-800 text-zinc-100 active:bg-zinc-800'
          : activeTheme.id === 'parchment'
          ? 'bg-[#fffdf9] border-[#e6dbc9] text-[#281d14] active:bg-[#f8f1e3]'
          : 'bg-white border-stone-200 text-stone-900 active:bg-stone-50'
      }`}
    >
      {/* Subtle watermark in corner */}
      <div className="absolute -left-4 -bottom-4 pointer-events-none opacity-[0.03] text-current">
        <Scale className="w-24 h-24 transform -rotate-12" strokeWidth={1.2} />
      </div>
      {/* Top Header Row */}
      <div className="flex items-center justify-between text-xs mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
            {decision.legislationType || 'قرار وزاري'}
          </span>
          <span className="font-mono font-bold">
            رقم {decision.decisionNumber} / {decision.year}
          </span>
          <span className={`text-[11px] flex items-center gap-1 ${getStatusColor(decision.status)}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span>{decision.status}</span>
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(decision.id);
          }}
          className="p-1.5 rounded-lg opacity-60 hover:opacity-100 active:scale-125 transition-all"
        >
          <Star
            className={`w-4 h-4 ${
              decision.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-stone-400'
            }`}
          />
        </button>
      </div>

      {/* Title */}
      <h3 className="text-sm font-bold leading-snug line-clamp-2 mb-2 text-right">
        {decision.title}
      </h3>

      {/* Enacted Law Articles (clean pill tags) */}
      {decision.relatedLawArticles && decision.relatedLawArticles.length > 0 && (
        <div className="flex items-center gap-1 overflow-x-auto py-1 mb-3 scrollbar-none">
          <span className="text-[10px] opacity-60 shrink-0 font-medium">مواد القانون:</span>
          {decision.relatedLawArticles.slice(0, 3).map((art, idx) => (
            <span
              key={idx}
              className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 shrink-0"
              style={{ color: activeAccent.colorHex }}
            >
              {art}
            </span>
          ))}
          {decision.relatedLawArticles.length > 3 && (
            <span className="text-[10px] opacity-50 shrink-0">
              +{decision.relatedLawArticles.length - 3} مواد
            </span>
          )}
        </div>
      )}

      {/* Bottom Quick-Action Buttons (Large touch targets for Mobile) */}
      <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-black/5 dark:border-white/5">
        {/* Open Reader */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onView(decision, 'summary');
          }}
          className="flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          style={{
            backgroundColor: `${activeAccent.colorHex}20`,
            color: activeAccent.colorHex,
          }}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>مطالعة التشريع</span>
        </button>

        {/* Official PDF */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onView(decision, 'scanned_pdf');
          }}
          className="py-2 px-3 rounded-xl font-bold text-xs flex items-center gap-1 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60"
          title="استعراض نسخة PDF الرسمية"
        >
          <FileDown className="w-3.5 h-3.5 text-rose-600" />
          <span>PDF</span>
        </button>

        {/* Word Document */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            exportDecisionAsWord(decision);
          }}
          className="py-2 px-3 rounded-xl font-bold text-xs flex items-center gap-1 bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-200 dark:border-sky-900/60"
          title="تحميل Word مكتوب"
        >
          <FileText className="w-3.5 h-3.5 text-sky-600" />
          <span>Word</span>
        </button>

        {/* Share Button on Mobile */}
        <button
          type="button"
          onClick={handleShare}
          className="p-2 rounded-xl border border-stone-200 dark:border-zinc-700 opacity-70 hover:opacity-100"
          title="مشاركة"
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </article>
  );
};
