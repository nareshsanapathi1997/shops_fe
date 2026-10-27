import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

/** Shown in place of an empty list or table, with an optional next step. */
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="py-10 px-4 text-center space-y-2 border border-dashed border-slate-200 rounded-xl">
      <p className="font-semibold text-slate-800 text-sm">{title}</p>
      {description && <p className="text-xs text-slate-500 max-w-md mx-auto">{description}</p>}
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
