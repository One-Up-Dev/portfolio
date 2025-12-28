"use client";

import { ToastProvider } from "@/components/ui/retro-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
