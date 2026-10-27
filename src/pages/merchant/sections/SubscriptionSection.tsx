import { api, formatINR } from '../../../lib/api';
import { useMerchantConsole } from '../MerchantConsoleContext';

export function SubscriptionSection() {
  const {
    queryClient,
    showToast,
    runSafely,
    subscriptionQuery,
  } = useMerchantConsole();

  return (
    <>
      <div className="bg-white p-5 rounded-xl   space-y-4 text-xs">
        <h2 className="font-bold text-base">SaaS Subscription Plan, Resource Meters & Plan Switching</h2>
        <div className="p-4 rounded-xl bg-slate-50   space-y-1">
          <div>Active Plan: <strong>{subscriptionQuery.data?.subscription?.plan?.name}</strong></div>
          <div>Products Used: <strong>{subscriptionQuery.data?.usage?.products_used} / {subscriptionQuery.data?.subscription?.plan?.max_products}</strong></div>
          <div>Staff Members: <strong>{subscriptionQuery.data?.usage?.staff_used} / {subscriptionQuery.data?.usage?.max_staff}</strong></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(subscriptionQuery.data?.available_plans || []).map((plan: any) => (
            <div key={plan.id} className="p-4 rounded-xl   flex flex-col justify-between gap-3">
              <div>
                <div className="font-extrabold text-sm">{plan.name}</div>
                <div className="text-emerald-700 font-bold mt-0.5">{formatINR(plan.price_monthly ?? plan.monthly_price)} / month</div>
                <div className="text-slate-500 mt-1">Up to {plan.max_products} SKUs • {plan.max_staff_users ?? plan.max_staff} Staff</div>
              </div>
              <button
                onClick={() =>
  runSafely(async () => {
                  await api.post('/merchant/subscription/change-plan', { plan_id: plan.id, billing_cycle: 'monthly' });
                  queryClient.invalidateQueries({ queryKey: ['merchant-subscription'] });
                  queryClient.invalidateQueries({ queryKey: ['merchant-dashboard'] });
                  showToast('success', `Switched shop subscription to ${plan.name}!`);
                }, 'Action failed. Please try again.')
}
                className="w-full py-2 rounded-lg bg-slate-900 text-white font-bold cursor-pointer"
              >
                Switch to {plan.name}
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
