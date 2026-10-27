import { useMerchantConsole } from '../MerchantConsoleContext';

export function AuditLogsSection() {
  const {
    auditLogsQuery,
    reportsQuery,
  } = useMerchantConsole();

  return (
    <>
      <div className="bg-white p-5 rounded-xl   space-y-4 text-xs">
        <h2 className="font-bold text-base">Immutable Shop Security & Operations Audit Trail</h2>
        <div className="space-y-1.5">
          {(auditLogsQuery.data || reportsQuery.data?.audit_logs || []).map((log: any) => (
            <div key={log.id} className="p-2.5 rounded   flex justify-between items-center">
              <div>
                <span className="tnum font-bold text-blue-700">{log.action ?? log.event}</span>
                <span className="text-slate-600 ml-2">{log.auditable_type} #{log.auditable_id}</span>
              </div>
              <span className="text-slate-500">{log.ip_address || '127.0.0.1'}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
