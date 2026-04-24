import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { X, BookCheck, Users, AlertTriangle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/useToast";

const icons = {
  success: <BookCheck className="w-[18px] h-[18px] text-orange-500" />,
  error: <AlertCircle className="w-[18px] h-[18px] text-red-500" />,
  warning: <AlertTriangle className="w-[18px] h-[18px] text-amber-500" />,
  info: <Users className="w-[18px] h-[18px] text-orange-400" />,
};

const iconBg = {
  success: "bg-orange-50",
  error: "bg-red-50",
  warning: "bg-amber-50",
  info: "bg-orange-50",
};

const accentBar = {
  success: "from-orange-500 to-orange-400",
  error: "from-red-500 to-red-400",
  warning: "from-amber-500 to-amber-400",
  info: "from-orange-400 to-orange-300",
};

const progressBar = {
  success: "bg-orange-500",
  error: "bg-red-500",
  warning: "bg-amber-500",
  info: "bg-orange-400",
};

interface ToastItemProps {
  id: string;
  title: string;
  description?: string;
  type?: "success" | "error" | "info" | "warning";
  duration?: number;
  onRemove: (id: string) => void;
}

function ToastItem({
  id,
  title,
  description,
  type = "info",
  duration = 4000,
  onRemove,
}: ToastItemProps) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => dismiss(), duration);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setLeaving(true);
    setTimeout(() => onRemove(id), 300);
  };

  return (
    <div
      className={cn(
        "w-[320px] bg-background rounded-[14px] border border-border/50 overflow-hidden flex flex-col transition-all duration-300 ease-out",
        visible && !leaving
          ? "opacity-100 translate-x-0"
          : "opacity-0 translate-x-full",
      )}
    >
      {/* Top accent bar */}
      <div className={cn("h-[3px] w-full bg-gradient-to-r", accentBar[type])} />

      {/* Body */}
      <div className="flex items-start gap-3 px-4 pt-3.5 pb-3">
        {/* Icon */}
        <div
          className={cn(
            "w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 mt-0.5",
            iconBg[type],
          )}
        >
          {icons[type]}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-foreground leading-snug">
            {title}
          </p>
          {description && (
            <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Close */}
        <button
          onClick={dismiss}
          className="w-[22px] h-[22px] rounded-md bg-muted flex items-center justify-center shrink-0 mt-0.5 hover:bg-muted/80 transition-colors"
        >
          <X className="w-3 h-3 text-muted-foreground" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="mx-4 mb-3 h-[2.5px] rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full origin-left", progressBar[type])}
          style={{ animation: `shrink ${duration}ms linear forwards` }}
        />
      </div>
    </div>
  );
}

export function Toaster() {
  const { toasts, removeToast } = useToast();

  return createPortal(
    <>
      <style>{`
        @keyframes shrink {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
      `}</style>
      <div
        style={{ position: "fixed", top: "1rem", right: "1rem", zIndex: 9999 }}
        className="flex flex-col gap-2 items-end"
      >
        {toasts.map(toast => (
          <ToastItem key={toast.id} {...toast} onRemove={removeToast} />
        ))}
      </div>
    </>,
    document.body,
  );
}