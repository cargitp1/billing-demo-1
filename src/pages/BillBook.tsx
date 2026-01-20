import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FileText, Calendar, User, RefreshCw, Filter, Download, Trash2, Eye, MapPin } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { supabase } from "../utils/supabase";
import Navbar from "../components/Navbar";
import toast, { Toaster } from "react-hot-toast";
import { format } from "date-fns";
import { naturalSort } from "../utils/sortingUtils";

type SortOption = 'dateNewOld' | 'dateOldNew' | 'amountHighLow' | 'amountLowHigh';

interface BillRecord {
  id?: string;
  client_id: string;
  bill_number: string;
  bill_date?: string; // Prefer bill_date over created_at
  created_at: string;
  total_amount?: number; // Some records might use total_rent_amount?
  grand_total?: number;
  status: string;
  client: {
    client_name: string;
    client_nic_name: string;
    site: string;
    primary_phone_number?: string;
  };
}

const BillCard: React.FC<{ bill: BillRecord, t: any }> = ({ bill, t }) => {
  const amount = bill.grand_total || bill.total_amount || 0;
  const date = bill.bill_date || bill.created_at;

  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">
                Bill #{bill.bill_number}
              </h4>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${bill.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                {bill.status || 'Generated'}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-blue-600">
              ₹{amount.toLocaleString("en-IN")}
            </div>
            <div className="text-xs text-gray-500">
              {date ? format(new Date(date), "dd MMM yyyy") : t('noDate')}
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="w-4 h-4 text-gray-400" />
            <span className="font-medium text-gray-900">{bill.client?.client_nic_name || t('unknownClient')}</span>
            <span className="text-gray-400">|</span>
            <span className="truncate">{bill.client?.client_name}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="truncate">{bill.client?.site || 'No Site'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <Eye className="w-4 h-4" />
            View
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <Download className="w-4 h-4" />
            PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default function BillBook() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  // State
  const [bills, setBills] = useState<BillRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>('dateNewOld');
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Load Bills
  const loadBills = async (showRefreshToast = false) => {
    if (showRefreshToast) setRefreshing(true);
    else setLoading(true);

    try {
      const { data, error } = await supabase
        .from("bills")
        .select(`
          *,
          client:clients (
            client_name,
            client_nic_name,
            site,
            primary_phone_number
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBills(data || []);
      if (showRefreshToast) toast.success('Bills refreshed');
    } catch (error) {
      console.error("Error loading bills:", error);
      toast.error('Failed to load bills');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBills();

    // Check for maintenance toast
    const hasShown = sessionStorage.getItem('billMaintenanceReshown');
    if (!hasShown) {
      toast(t('maintenanceMessage'), {
        duration: 5000,
        style: { background: '#363636', color: '#fff', fontSize: '14px', padding: '16px', borderRadius: '8px' },
        id: 'maintenance-message'
      });
      sessionStorage.setItem('billMaintenanceReshown', 'true');
    }
  }, []);

  // Filter & Sort
  const filteredAndSortedBills = useMemo(() => {
    let result = bills.filter((bill) =>
      bill.bill_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.client?.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.client?.client_nic_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.client?.site?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return result.sort((a, b) => {
      const dateA = new Date(a.bill_date || a.created_at).getTime();
      const dateB = new Date(b.bill_date || b.created_at).getTime();
      const amountA = a.grand_total || a.total_amount || 0;
      const amountB = b.grand_total || b.total_amount || 0;

      switch (sortOption) {
        case 'dateNewOld': return dateB - dateA;
        case 'dateOldNew': return dateA - dateB;
        case 'amountHighLow': return amountB - amountA;
        case 'amountLowHigh': return amountA - amountB;
        default: return 0;
      }
    });
  }, [bills, searchQuery, sortOption]);

  const getSortLabel = (option: SortOption) => {
    switch (option) {
      case 'dateNewOld': return 'Date: New to Old';
      case 'dateOldNew': return 'Date: Old to New';
      case 'amountHighLow': return 'Amount: High to Low';
      case 'amountLowHigh': return 'Amount: Low to High';
      default: return '';
    }
  };

  // Click outside sort menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.sort-menu-container')) {
        setShowSortMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-1 w-full ml-0 overflow-y-auto pt-14 sm:pt-0 lg:ml-64 h-[100dvh]">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bill Book</h1>
              <p className="text-sm text-gray-500 mt-1">Manage and view all generated bills</p>
            </div>

            <button
              onClick={() => loadBills(true)}
              className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${refreshing ? 'animate-spin' : ''}`}
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search bills by number, client, or site..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative sort-menu-container sm:w-48">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 truncate">
                    {getSortLabel(sortOption)}
                  </span>
                </div>
              </button>

              {showSortMenu && (
                <div className="absolute right-0 z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg shadow-gray-200/50 py-1">
                  {(['dateNewOld', 'dateOldNew', 'amountHighLow', 'amountLowHigh'] as SortOption[]).map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setSortOption(option);
                        setShowSortMenu(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center gap-2
                        ${sortOption === option ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}
                      `}
                    >
                      {getSortLabel(option)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between text-sm text-gray-500 px-1">
            <span>Showing {filteredAndSortedBills.length} bills</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-blue-600 font-medium hover:underline"
              >
                Clear Search
              </button>
            )}
          </div>

          {/* Content */}
          {loading && !refreshing ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl h-48 animate-pulse" />
              ))}
            </div>
          ) : filteredAndSortedBills.length === 0 ? (
            <div className="text-center py-12 bg-white border border-gray-200 rounded-2xl border-dashed">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No bills found</h3>
              <p className="text-gray-500">
                {searchQuery ? 'Try adjusting your search terms' : 'Generate your first bill to see it here'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pb-20">
              {filteredAndSortedBills.map((bill, index) => (
                <BillCard
                  key={bill.bill_number || `bill-${index}`}
                  bill={bill}
                  t={t}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Toaster />
    </div>
  );
}