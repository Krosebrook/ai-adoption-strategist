import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { X, Download, Smartphone } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Smartphone className="h-6 w-6 text-orange-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900">Install App</h3>
            <p className="text-sm text-slate-600 mt-1">
              Add to your home screen for quick access
            </p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowPrompt(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2 mt-3">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => setShowPrompt(false)}>
            Not now
          </Button>
          <Button size="sm" className="flex-1 bg-orange-500 hover:bg-orange-600" onClick={handleInstall}>
            <Download className="h-4 w-4 mr-1" />
            Install
          </Button>
        </div>
      </div>
    </div>
  );
}