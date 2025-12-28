"use client";

import { ToastProvider } from "@/components/ui/retro-toast";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <PageViewTracker />
      {children}
    </ToastProvider>
  );
}
