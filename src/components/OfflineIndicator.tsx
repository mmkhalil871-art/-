import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (showReconnected) {
    return (
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xl animate-fade-in no-print">
        <Wifi className="w-4 h-4 text-white" />
        <span>تمت استعادة الاتصال بالإنترنت</span>
      </div>
    );
  }

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-xl bg-stone-900 border border-amber-500/50 px-4 py-2.5 text-xs font-semibold text-amber-300 shadow-2xl animate-fade-in no-print">
      <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
      <span>وضع عدم الاتصال — يمكنك متابعة استعراض وقراءة وطباعة القرارات المخزنة محلياً.</span>
    </div>
  );
};
