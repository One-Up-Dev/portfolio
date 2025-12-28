"use client";

import {
  useEffect,
  useState,
  createContext,
  useContext,
  useCallback,
} from "react";

// Toast types
type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Hook to use toast
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

// Toast Provider component
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (message: string, type: ToastType = "info", duration = 4000) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newToast: Toast = { id, message, type, duration };
      setToasts((prev) => [...prev, newToast]);
    },
    [],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

// Individual Toast item
function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: () => void;
}) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(onRemove, 300); // Wait for exit animation
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.duration, onRemove]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onRemove, 300);
  };

  // Icon and colors based on toast type
  const getTypeStyles = () => {
    switch (toast.type) {
      case "success":
        return {
          icon: "✓",
          bgColor: "bg-green-900/90",
          borderColor: "border-green-500",
          textColor: "text-green-400",
          iconBg: "bg-green-500/20",
        };
      case "error":
        return {
          icon: "✕",
          bgColor: "bg-red-900/90",
          borderColor: "border-red-500",
          textColor: "text-red-400",
          iconBg: "bg-red-500/20",
        };
      case "warning":
        return {
          icon: "⚠",
          bgColor: "bg-yellow-900/90",
          borderColor: "border-yellow-500",
          textColor: "text-yellow-400",
          iconBg: "bg-yellow-500/20",
        };
      case "info":
      default:
        return {
          icon: "ℹ",
          bgColor: "bg-cyan-900/90",
          borderColor: "border-cyan-500",
          textColor: "text-cyan-400",
          iconBg: "bg-cyan-500/20",
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`
        relative flex items-center gap-3 px-4 py-3
        ${styles.bgColor} ${styles.borderColor}
        border-4 backdrop-blur-sm
        transition-all duration-300 ease-out
        ${isExiting ? "opacity-0 translate-x-full" : "opacity-100 translate-x-0"}
        animate-slide-in-right
      `}
      style={{
        boxShadow: "4px 4px 0 rgba(0, 0, 0, 0.5)",
        borderRadius: 0, // Pixel art style - no rounded corners
      }}
    >
      {/* Pixel art icon container */}
      <div
        className={`
          flex items-center justify-center w-8 h-8
          ${styles.iconBg} ${styles.textColor}
          border-2 ${styles.borderColor}
          text-lg font-bold
        `}
        style={{ borderRadius: 0 }}
      >
        {styles.icon}
      </div>

      {/* Message */}
      <span className={`flex-1 text-sm font-medium ${styles.textColor}`}>
        {toast.message}
      </span>

      {/* Close button */}
      <button
        onClick={handleClose}
        className={`
          flex items-center justify-center w-6 h-6
          ${styles.textColor} hover:bg-white/10
          transition-colors text-xs font-bold
        `}
        style={{ borderRadius: 0 }}
        aria-label="Fermer la notification"
      >
        ✕
      </button>

      {/* Progress bar for duration */}
      {toast.duration && toast.duration > 0 && (
        <div
          className={`
            absolute bottom-0 left-0 h-1 ${styles.borderColor.replace("border-", "bg-")}
            animate-shrink-width
          `}
          style={{
            animationDuration: `${toast.duration}ms`,
            transformOrigin: "left",
          }}
        />
      )}
    </div>
  );
}

// Toast Container
function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: Toast[];
  removeToast: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onRemove={() => removeToast(toast.id)} />
        </div>
      ))}
    </div>
  );
}

export default ToastProvider;
