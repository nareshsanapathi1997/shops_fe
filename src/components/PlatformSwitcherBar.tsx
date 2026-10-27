import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Globe, Store, LayoutDashboard, ShieldCheck, Layers } from 'lucide-react';
import { api, getActiveShopSlug, setActiveShopSlug } from '../lib/api';
import type { DirectoryShop } from '../types/api';

export const PlatformSwitcherBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentShopSlug = getActiveShopSlug();

  const directoryQuery = useQuery({
    queryKey: ['directory-shops'],
    queryFn: async () => {
      const res = await api.get('/directory/shops');
      return (res.data?.shops || []) as DirectoryShop[];
    },
  });

  const shops: DirectoryShop[] =
    directoryQuery.data && directoryQuery.data.length > 0
      ? directoryQuery.data
      : [
          { id: 1, name: 'Acme Industrial & Electrical Supplies', slug: 'acme', city: 'Hyderabad', state_code: 'TG' },
          { id: 2, name: 'FreshFoods Agro & HoReCa Wholesale', slug: 'freshfoods', city: 'Navi Mumbai', state_code: 'MH' },
        ];

  const isPlatformPage = location.pathname === '/platform' || location.pathname === '/';
  const isMerchantConsole = location.pathname.startsWith('/merchant');
  const isAdminConsole = location.pathname.startsWith('/admin');
  const isStorefront = location.pathname.startsWith('/store');

  const openMerchantBusinessPage = (slug: string) => {
    setActiveShopSlug(slug);
    queryClient.invalidateQueries();
    navigate(`/store/${slug}`);
  };

  return (
    <div data-ui="switcher-bar" className="bg-[#181817] text-[#f3f3f1] px-4 py-2 text-xs sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#262624] text-[#a1ffcb] font-semibold">
            <Layers className="w-3.5 h-3.5" />
            BharatWholesale Cloud SaaS
          </span>

          <button
            onClick={() => navigate('/platform')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 font-medium cursor-pointer ${
              isPlatformPage ? 'bg-[#a1ffcb] text-[#181817]' : 'bg-[#262624] text-[#d4d4d0] hover:bg-[#32322f]'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Application Business Page</span>
          </button>

          <div className="inline-flex items-center gap-1 bg-[#262624] p-0.5">
            <span className="px-2 py-0.5 text-[#a3a39e] font-medium hidden sm:inline-flex items-center gap-1">
              <Store className="w-3 h-3 text-[#a1ffcb]" />
              Merchant Storefronts:
            </span>
            {shops.map((s) => {
              const activeThisShop =
                isStorefront && (location.pathname === `/store/${s.slug}` || currentShopSlug === s.slug);
              return (
                <button
                  key={s.slug}
                  onClick={() => openMerchantBusinessPage(s.slug)}
                  className={`px-2.5 py-1 font-medium cursor-pointer ${
                    activeThisShop ? 'bg-[#a1ffcb] text-[#181817]' : 'text-[#d4d4d0] hover:bg-[#32322f]'
                  }`}
                >
                  {s.slug}.platform-domain.com
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/merchant')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 font-medium cursor-pointer ${
              isMerchantConsole ? 'bg-[#a1ffcb] text-[#181817]' : 'bg-[#262624] text-[#d4d4d0] hover:bg-[#32322f]'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Merchant Console</span>
          </button>

          <button
            onClick={() => navigate('/admin')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 font-medium cursor-pointer ${
              isAdminConsole ? 'bg-[#a1ffcb] text-[#181817]' : 'bg-[#262624] text-[#d4d4d0] hover:bg-[#32322f]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SaaS Super-Admin</span>
          </button>
        </div>
      </div>
    </div>
  );
};
