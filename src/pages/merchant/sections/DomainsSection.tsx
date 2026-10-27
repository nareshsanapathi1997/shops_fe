import { useMerchantConsole } from '../MerchantConsoleContext';

export function DomainsSection() {
  const {
    newDomainHost,
    setNewDomainHost,
    showToast,
    runSafely,
    domainsQuery,
    addDomainMutation,
    verifyDomainMutation,
  } = useMerchantConsole();

  return (
    <>
      <div className="bg-white p-5 rounded-xl   space-y-4 text-xs">
        <h2 className="font-bold text-base">Store Subdomain & Custom Domain DNS Verification</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. wholesale.mycompany.in"
            value={newDomainHost}
            onChange={(e) => setNewDomainHost(e.target.value)}
            className="  rounded px-3 py-2 flex-1"
          />
          <button
            onClick={() => addDomainMutation.mutate()}
            className="px-4 py-2 rounded bg-slate-900 text-white font-bold cursor-pointer"
          >
            Register Custom Domain
          </button>
        </div>
        <div className="space-y-3">
          {(domainsQuery.data || []).map((d: any) => (
            <div key={d.id} className="p-3 rounded-lg   space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm">{d.hostname} ({d.type})</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold">
                  Status: {d.verification_status} • SSL: {d.ssl_status}
                </span>
              </div>
              {d.expected_txt_record && d.verification_status !== 'verified' && (
                <div className="mt-2 p-3 rounded-lg bg-amber-50 border border-amber-200 space-y-1.5">
                  <div className="font-semibold text-amber-900">Add this TXT record at your DNS provider:</div>
                  <div className="flex flex-wrap items-center gap-2">
                    <code className="tnum bg-white border border-amber-200 rounded px-2 py-1 break-all">{d.expected_txt_record}</code>
                    <button
                      type="button"
                      onClick={() =>
                        runSafely(async () => {
                          await navigator.clipboard.writeText(String(d.expected_txt_record));
                          showToast('success', 'TXT record copied.');
                        }, 'Could not copy to clipboard.')
                      }
                      className="px-2 py-1 rounded border border-amber-300 font-semibold cursor-pointer"
                    >
                      Copy
                    </button>
                  </div>
                  {d.failure_reason && <div role="alert" className="text-rose-700">Last check: {d.failure_reason}</div>}
                </div>
              )}
              {d.type === 'custom' && d.verification_status !== 'verified' && (
                <button
                  disabled={verifyDomainMutation.isPending}
                  onClick={() => verifyDomainMutation.mutate({ id: d.id })}
                  className="mt-2 px-3 py-1 rounded bg-blue-600 text-white font-semibold cursor-pointer disabled:opacity-60"
                >
                  {verifyDomainMutation.isPending ? 'Checking DNS…' : 'Verify DNS TXT Ownership Now'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
