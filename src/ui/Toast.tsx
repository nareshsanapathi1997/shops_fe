export interface ToastMessage {
  type: 'success' | 'error';
  text: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
  /** `light` suits the back-office consoles, `dark` the storefront. */
  tone?: 'light' | 'dark';
  position?: 'top' | 'bottom';
}

/** Fixed, screen-reader-announced notification shared by the storefront and consoles. */
export function Toast({ toast, onDismiss, tone = 'light', position = 'top' }: ToastProps) {
  if (!toast) return null;
  const palette =
    tone === 'dark'
      ? toast.type === 'success'
        ? 'bg-emerald-950 text-emerald-100'
        : 'bg-rose-950 text-rose-100'
      : toast.type === 'success'
        ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
        : 'bg-rose-50 text-rose-900 border border-rose-200';
  const placement = position === 'top' ? 'top-4 right-4 left-4' : 'bottom-6 right-6 left-6';

  return (
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      aria-live="polite"
      className={`fixed ${placement} sm:left-auto sm:max-w-md z-50 shadow-lg px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-3 ${palette}`}
    >
      <span>{toast.text}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="ml-auto cursor-pointer px-1 opacity-80 hover:opacity-100"
      >
        ×
      </button>
    </div>
  );
}
