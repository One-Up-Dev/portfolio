"use client";

import { ToastProvider } from "@/components/ui/retro-toast";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { SpaceInvaders } from "@/components/ui/space-invaders";
import { SoundProvider } from "@/lib/sound-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SoundProvider>
      <ToastProvider>
        <PageViewTracker />
        <SpaceInvaders />
        {children}
      </ToastProvider>
    </SoundProvider>
  );
}
