import { createPortal } from "react-dom";
import type { ToastMessage } from "../../hooks/useToast";

export function Toast({ toasts }: { toasts: ToastMessage[] }) {
  if (toasts.length === 0) return null;

  return createPortal(
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            px-5 py-3 rounded-2xl shadow-xl text-sm font-medium text-white
            transition-all duration-300 animate-in slide-in-from-bottom-2
            ${toast.type === "success"
              ? "bg-gradient-to-r from-emerald-500 to-green-500"
              : "bg-gradient-to-r from-red-500 to-rose-500"
            }
          `}
        >
          {toast.type === "success" ? "✓ " : "✕ "}
          {toast.message}
        </div>
      ))}
    </div>,
    document.body,
  );
}
