import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { formatINR } from '../../../lib/api';
import { useMerchantConsole } from '../MerchantConsoleContext';

export function DashboardSection() {
  const {
    shopSlug,
    setActiveTab,
    dashboardQuery,
    metrics,
  } = useMerchantConsole();

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Merchant Operations Dashboard · {dashboardQuery.data?.shop?.name}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live Storefront URL:{' '}
              <span className="tnum font-semibold text-blue-600">
                {shopSlug}.platform-domain.com
              </span>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('settings')}
              className="px-3.5 py-2 rounded-lg   bg-white text-xs font-bold text-slate-800 hover:bg-slate-50 cursor-pointer"
            >
              Customize Business Page
            </button>
            <Link
              to={`/store/${shopSlug}`}
              className="px-3.5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 flex items-center gap-1.5"
            >
              <span>Open Live Merchant Business Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl  ">
            <div className="text-xs text-slate-500">Gross Wholesale Revenue</div>
            <div className="text-xl font-extrabold text-slate-900 mt-1">
              {formatINR(metrics?.total_revenue)}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl  ">
            <div className="text-xs text-slate-500">Total B2B Orders</div>
            <div className="text-xl font-extrabold text-slate-900 mt-1">{metrics?.total_orders || 0}</div>
          </div>
          <div className="bg-white p-4 rounded-xl  ">
            <div className="text-xs text-slate-500">Pending Retailer Approvals</div>
            <div className="text-xl font-extrabold text-amber-600 mt-1">
              {metrics?.pending_customers_count || 0}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl  ">
            <div className="text-xs text-slate-500">Active SKUs</div>
            <div className="text-xl font-extrabold text-slate-900 mt-1">{metrics?.products_count || 0}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl   space-y-3">
          <h2 className="font-bold text-sm text-slate-900">Recent Wholesale Orders</h2>
          <div className="overflow-x-auto"><table className="w-full text-xs text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-2">Order #</th>
                <th className="p-2">Buyer</th>
                <th className="p-2">Status</th>
                <th className="p-2">Payment</th>
                <th className="p-2">Grand Total</th>
              </tr>
            </thead>
            <tbody className=" divide-slate-100">
              {(dashboardQuery.data?.recent_orders || []).map((o: any) => (
                <tr key={o.id}>
                  <td className="p-2 font-bold">{o.order_number}</td>
                  <td className="p-2">{o.customer?.business_name}</td>
                  <td className="p-2">{o.status}</td>
                  <td className="p-2">{o.payment_status}</td>
                  <td className="p-2 font-bold">{formatINR(o.grand_total)}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      </div>
    </>
  );
}
