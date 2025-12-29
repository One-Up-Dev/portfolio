"use client";

import { ToastProvider } from "@/components/ui/retro-toast";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { KonamiModal } from "@/components/ui/konami-modal";
import { SoundProvider } from "@/lib/sound-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SoundProvider>
      <ToastProvider>
        <PageViewTracker />
        <KonamiModal />
        {children}
      </ToastProvider>
    </SoundProvider>
  );
}
