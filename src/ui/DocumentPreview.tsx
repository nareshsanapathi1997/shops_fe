import { sanitizeHtml } from '../lib/sanitize';

interface DocumentPreviewProps {
  title: string;
  html: string;
  onClose: () => void;
}

/** Printable server-rendered document (GST invoice, credit note), always sanitised before injection. */
export function DocumentPreview({ title, html, onClose }: DocumentPreviewProps) {
  return (
    <div className="mt-4 p-4 rounded-xl border-2 border-slate-200 bg-white space-y-3">
      <div className="flex justify-between items-center pb-2">
        <span className="font-bold">{title}</span>
        <div className="flex gap-3">
          <button type="button" onClick={() => window.print()} className="font-bold text-slate-700 cursor-pointer">
            Print
          </button>
          <button type="button" onClick={onClose} className="text-rose-600 font-bold cursor-pointer">
            Close
          </button>
        </div>
      </div>
      <div className="overflow-x-auto" dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} />
    </div>
  );
}
