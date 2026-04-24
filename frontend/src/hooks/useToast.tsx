import { useContext } from "react";
import { ToastContext, type ToastType } from "@/context/ToastContext";

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");

  const { toasts, removeToast, addToast } = ctx;

  const toast = (title: string, options?: { description?: string; type?: ToastType; duration?: number }) => {
    addToast({ title, ...options });
  };

  // Convenience shorthands
  toast.success = (title: string, description?: string) =>
    addToast({ title, description, type: "success" });

  toast.error = (title: string, description?: string) =>
    addToast({ title, description, type: "error" });

  toast.info = (title: string, description?: string) =>
    addToast({ title, description, type: "info" });

  toast.warning = (title: string, description?: string) =>
    addToast({ title, description, type: "warning" });

  return { toasts, removeToast, toast };
}