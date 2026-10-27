import { api } from '../../../lib/api';
import { useMerchantConsole } from '../MerchantConsoleContext';

export function NotificationsSection() {
  const {
    queryClient,
    showToast,
    runSafely,
    notificationsQuery,
  } = useMerchantConsole();

  return (
    <>
      <div className="bg-white p-5 rounded-xl   space-y-4 text-xs">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-base">Live Storefront Notifications Inbox (Orders, RFQs & Buyer Signups)</h2>
          <button
            onClick={() =>
  runSafely(async () => {
              await api.post('/merchant/notifications/read-all');
              queryClient.invalidateQueries({ queryKey: ['merchant-notifications'] });
              showToast('success', 'All notifications marked as read.');
            }, 'Action failed. Please try again.')
}
            className="px-3 py-1.5 rounded bg-slate-900 text-white font-bold cursor-pointer"
          >
            Mark All Read
          </button>
        </div>
        <div className="space-y-2">
          {(notificationsQuery.data?.notifications || []).map((n: any) => (
            <div key={n.id} className={`p-3 rounded-lg  flex justify-between items-center ${n.is_read || n.read_at ? 'bg-white ' : 'bg-blue-50 '}`}>
              <div>
                <div className="font-bold text-slate-900">{n.title}</div>
                <div className="text-slate-600">{n.body}</div>
              </div>
              {!(n.is_read || n.read_at) && (
                <button
                  onClick={() =>
  runSafely(async () => {
                    await api.patch(`/merchant/notifications/${n.id}/read`);
                    queryClient.invalidateQueries({ queryKey: ['merchant-notifications'] });
                  }, 'Action failed. Please try again.')
}
                  className="px-2.5 py-1 rounded bg-blue-600 text-white font-semibold cursor-pointer"
                >
                  Mark Read
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
