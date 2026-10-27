import { useMerchantConsole } from '../MerchantConsoleContext';

export function StaffSection() {
  const {
    staffInvite,
    setStaffInvite,
    staffForm,
    setStaffForm,
    showToast,
    runSafely,
    staffQuery,
    inviteStaffMutation,
  } = useMerchantConsole();

  return (
    <>
      <div className="bg-white p-5 rounded-xl   space-y-4 text-xs">
        <h2 className="font-bold text-base">Staff Accounts & Role-Based Permissions</h2>
        {staffInvite && (
          <div role="status" className="p-3 rounded-lg bg-emerald-50 border border-emerald-300 space-y-2">
            <div className="font-bold text-emerald-900">
              {staffInvite.sent
                ? `Invitation email sent to ${staffInvite.email}`
                : `${staffInvite.email} was added to this shop`}
            </div>
            <p className="text-emerald-900">
              {staffInvite.sent
                ? 'They will set their own password from the link in the email. The link expires after 60 minutes; invite again to resend.'
                : 'They already had an account and can sign in with their existing password.'}
            </p>
            {staffInvite.url && (
              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-emerald-900">Development only — invitation link:</div>
                <div className="flex flex-wrap items-center gap-2">
                  <code className="tnum bg-white border border-emerald-200 rounded px-2 py-1 break-all">{staffInvite.url}</code>
                  <button
                    type="button"
                    onClick={() =>
                      runSafely(async () => {
                        await navigator.clipboard.writeText(staffInvite.url!);
                        showToast('success', 'Invitation link copied.');
                      }, 'Could not copy to clipboard.')
                    }
                    className="px-2 py-1 rounded border border-emerald-300 font-semibold cursor-pointer"
                  >
                    Copy link
                  </button>
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={() => setStaffInvite(null)}
              className="px-2 py-1 rounded font-semibold text-emerald-900 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Staff Name"
            value={staffForm.name}
            onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
            className="  rounded px-3 py-2"
          />
          <input
            type="email"
            placeholder="Staff Email"
            value={staffForm.email}
            onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
            className="  rounded px-3 py-2"
          />
          <select
            value={staffForm.role_slug}
            onChange={(e) => setStaffForm({ ...staffForm, role_slug: e.target.value })}
            className="  rounded px-3 py-2"
          >
            <option value="merchant_manager">Store Manager</option>
            <option value="merchant_staff">Fulfillment Staff</option>
          </select>
          <button
            onClick={() => inviteStaffMutation.mutate()}
            className="px-4 py-2 rounded bg-slate-900 text-white font-bold cursor-pointer"
          >
            Add Staff Member
          </button>
        </div>
        <ul className=" divide-slate-200">
          {(staffQuery.data?.staff || []).map((m: any) => (
            <li key={m.id} className="py-2 flex justify-between">
              <span>{m.user?.name} ({m.user?.email})</span>
              <span className="font-bold">{m.role?.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
