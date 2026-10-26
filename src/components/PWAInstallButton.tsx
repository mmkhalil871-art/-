import React, { useState } from 'react';
import { Download, Laptop, Check, WifiOff } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';
import { MinisterialDecision } from '../types/decision';
import { LaborLawInfo } from '../data/laborLawData';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'header' | 'banner' | 'card';
  decisions?: MinisterialDecision[];
  law?: LaborLawInfo;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'header',
  decisions = [],
  law,
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = async () => {
    // Open the comprehensive options modal so user can choose portable offline app or PWA install
    setIsModalOpen(true);
  };

  if (variant === 'banner') {
    return (
      <>
        <div className="bg-stone-850 text-stone-200 border-b border-stone-700 py-2.5 px-4 text-xs no-print">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span>
                <strong>تشغيل كبرنامج دون إنترنت:</strong> يمكنك تحميل المنظومة بضغطة زر كبرنامج حاسب مكتبي مستقل يعمل في أي وقت دون الحاجة للإنترنت.
              </span>
            </div>
            <button
              type="button"
              onClick={handleClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-stone-950 font-bold rounded-lg transition-colors cursor-pointer text-xs shrink-0 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تحميل وتشغيل بدون إنترنت</span>
            </button>
          </div>
        </div>

        <PWAInstallModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          decisions={decisions}
          law={law}
        />
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shadow-xs ${
          isInstalled
            ? 'bg-stone-800 text-stone-300 border border-stone-700'
            : 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/50 hover:border-emerald-400'
        } ${className}`}
        title="خيارات تشغيل وتحميل المنظومة كبرنامج حاسب آلي بدون إنترنت"
      >
        <WifiOff className="w-3.5 h-3.5 text-emerald-400" />
        <Laptop className="w-3.5 h-3.5 text-amber-400" />
        <span>تشغيل كبرنامج بدون إنترنت</span>
      </button>

      <PWAInstallModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        decisions={decisions}
        law={law}
      />
    </>
  );
};
