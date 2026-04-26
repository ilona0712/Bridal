import { useCallback, useState } from "react";

export type ToastType = "success" | "error";

export type ToastMessage = {
  id: number;
  type: ToastType;
  message: string;
};

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  return { toasts, showToast };
}
