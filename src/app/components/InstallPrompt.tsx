import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

// Extend the Window interface to include the beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if the user already dismissed it recently
    const hasDismissed = sessionStorage.getItem('pwa-prompt-dismissed');

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Update UI notify the user they can install the PWA
      if (!hasDismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-primary/10 p-4 z-50 animate-in slide-in-from-bottom-5">
      <button 
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 transition-colors p-1"
        aria-label="Close"
      >
        <X size={16} />
      </button>
      
      <div className="flex items-start gap-4 pr-6">
        <div className="bg-primary/10 p-3 rounded-xl flex-shrink-0">
          <img src="/icon.svg" alt="App Icon" className="w-10 h-10 object-contain" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-[0.95rem]">Instalar Sistema TAG</h3>
          <p className="text-sm text-slate-600 mt-1 mb-3 leading-relaxed">
            Instale o nosso aplicativo para acesso mais rápido e recursos offline.
          </p>
          <div className="flex gap-2">
            <button 
              onClick={handleInstallClick}
              className="flex-1 bg-primary text-primary-foreground text-sm font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <Download size={16} />
              Instalar Agora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
