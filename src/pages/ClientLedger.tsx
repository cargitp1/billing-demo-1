import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { PLATE_SIZES } from '../components/ItemsTable';

import {
  Search,
  Filter,
  RefreshCw,
  ChevronDown,
  Users,
  Loader2
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../utils/translations';
import { supabase } from '../utils/supabase';
import { fetchClientTransactions} from '../utils/challanFetching';
import Navbar from '../components/Navbar';
import ClientLedgerCard from '../components/ClientLedgerCard';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import toast, { Toaster } from 'react-hot-toast';


type SortOption = 'nameAZ' | 'nameZA' | 'balanceHighLow' | 'balanceLowHigh';




interface SizeBalance {
  size_1: number;
  size_2: number;
  size_3: number;
  size_4: number;
  size_5: number;
  size_6: number;
  size_7: number;
  size_8: number;
  size_9: number;
  grandTotal: number;
}


export interface ClientBalance {
  grandTotal: number;
  sizes: { [key: string]: { main: number; borrowed: number; total: number } };
}


export interface Transaction {
  type: 'udhar' | 'jama';
  challanNumber: string;
  challanId: string;
  date: string;
  grandTotal: number;
  sizes: { [key: string]: { qty: number; borrowed: number } };
  site: string;
  driverName: string;
  items: any;
}


export interface ClientLedgerData {
  clientId: string;
  clientNicName: string;
  clientFullName: string;
  clientSite: string;
  clientPhone: string;
  totalUdhar: SizeBalance;
  totalJama: SizeBalance;
  currentBalance: ClientBalance;
  udharCount: number;
  jamaCount: number;
  transactions: Transaction[];
  transactionsLoaded?: boolean;
}

const ITEMS_PER_PAGE = 10;

const SkeletonCard = memo(() => (
  <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm sm:p-4 lg:p-6 sm:rounded-xl animate-pulse">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-center flex-1 gap-3 sm:gap-4">
        <div className="w-10 h-10 bg-gray-200 rounded-full sm:w-12 sm:h-12 lg:w-14 lg:h-14"></div>
        <div className="flex-1">
          <div className="w-32 h-4 mb-2 bg-gray-200 rounded sm:w-48 sm:h-5 lg:h-6"></div>
          <div className="w-40 h-3 mb-1 bg-gray-200 rounded sm:w-56 sm:h-4 lg:w-64"></div>
          <div className="w-24 h-3 bg-gray-200 rounded sm:w-32 sm:h-4 lg:w-40"></div>
        </div>
      </div>
      <div className="text-right">
        <div className="w-16 h-6 mb-2 ml-auto bg-gray-200 rounded sm:w-20 sm:h-7 lg:w-24 lg:h-8"></div>
        <div className="w-20 h-3 ml-auto bg-gray-200 rounded sm:w-24 sm:h-4 lg:w-32"></div>
      </div>
    </div>
  </div>
));

SkeletonCard.displayName = 'SkeletonCard';

export default function ClientLedger() {

  const { language } = useLanguage();
  const t = translations[language];


  const [allClients, setAllClients] = useState<any[]>([]);
  const [ledgers, setLedgers] = useState<ClientLedgerData[]>([]);
  const [displayedLedgers, setDisplayedLedgers] = useState<ClientLedgerData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('nameAZ');
  const [showSortMenu, setShowSortMenu] = useState(false);


  const calculateTotalsFromChallans = useCallback((challans: any[]): SizeBalance => {
    const totals: SizeBalance = {
      size_1: 0,
      size_2: 0,
      size_3: 0,
      size_4: 0,
      size_5: 0,
      size_6: 0,
      size_7: 0,
      size_8: 0,
      size_9: 0,
      grandTotal: 0
    };


    if (!challans || challans.length === 0) return totals;


    challans.forEach((challan: any) => {
      const items = challan.items;
      if (items) {
        for (let size = 1; size <= 9; size++) {
          const key = `size_${size}` as keyof SizeBalance;
          const qtyKey = `size_${size}_qty`;
          const borrowedKey = `size_${size}_borrowed`;
          const qty = (items[qtyKey] || 0) + (items[borrowedKey] || 0);
          totals[key] += qty;
          totals.grandTotal += qty;
        }
      }
    });


    return totals;
  }, []);


  const transformClientToLedgerData = useCallback(async (client: any, loadTransactions = false): Promise<ClientLedgerData> => {
    let transactions: Transaction[] = [];
    let udharTotals: SizeBalance = {
      size_1: 0, size_2: 0, size_3: 0, size_4: 0, size_5: 0,
      size_6: 0, size_7: 0, size_8: 0, size_9: 0, grandTotal: 0
    };
    let jamaTotals: SizeBalance = { ...udharTotals };
    let currentBalance: ClientBalance = {
      grandTotal: 0,
      sizes: {}
    };

    for (let i = 1; i <= 9; i++) {
      currentBalance.sizes[i] = { main: 0, borrowed: 0, total: 0 };
    }

    if (loadTransactions) {
      const rawTransactions = await fetchClientTransactions(client.id);

      transactions = rawTransactions.map((t: any) => {
        const sizes: { [key: string]: { qty: number; borrowed: number } } = {};
        let grandTotal = 0;

        for (let i = 1; i <= 9; i++) {
          const qty = t.items[`size_${i}_qty`] || 0;
          const borrowed = t.items[`size_${i}_borrowed`] || 0;
          sizes[i] = { qty, borrowed };
          grandTotal += qty + borrowed;
        }

        return {
          type: t.type,
          challanNumber: t.challanNumber,
          challanId: t.challanNumber,
          date: t.date,
          grandTotal,
          sizes,
          site: t.site,
          driverName: t.driverName || '',
          items: t.items
        };
      });

      const udharChallans = transactions.filter(t => t.type === 'udhar');
      const jamaChallans = transactions.filter(t => t.type === 'jama');

      udharTotals = calculateTotalsFromChallans(udharChallans);
      jamaTotals = calculateTotalsFromChallans(jamaChallans);

      transactions.forEach(transaction => {
        for (let i = 1; i <= 9; i++) {
          const size = transaction.sizes[i];
          if (transaction.type === 'udhar') {
            currentBalance.sizes[i].main += size.qty;
            currentBalance.sizes[i].borrowed += size.borrowed;
          } else {
            currentBalance.sizes[i].main -= size.qty;
            currentBalance.sizes[i].borrowed -= size.borrowed;
          }
          currentBalance.sizes[i].total = currentBalance.sizes[i].main + currentBalance.sizes[i].borrowed;
        }
      });

      currentBalance.grandTotal = Object.values(currentBalance.sizes).reduce((sum, size) => sum + size.total, 0);
    }

    return {
      clientId: client.id,
      clientNicName: client.client_nic_name,
      clientFullName: client.client_name,
      clientSite: client.site,
      clientPhone: client.primary_phone_number,
      totalUdhar: udharTotals,
      totalJama: jamaTotals,
      currentBalance: currentBalance,
      udharCount: transactions.filter(t => t.type === 'udhar').length,
      jamaCount: transactions.filter(t => t.type === 'jama').length,
      transactions: transactions,
      transactionsLoaded: loadTransactions
    };
  }, [calculateTotalsFromChallans]);


  const fetchClients = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('client_nic_name', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  }, []);


  const loadInitialData = useCallback(async (showRefreshToast = false) => {
    if (showRefreshToast) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const clients = await fetchClients();
      setAllClients(clients);

      const initialBatch = clients.slice(0, ITEMS_PER_PAGE);
      const ledgerData = await Promise.all(
        initialBatch.map(client => transformClientToLedgerData(client, true))
      );

      setLedgers(ledgerData);
      setDisplayedLedgers(ledgerData);
      setCurrentPage(1);

      if (showRefreshToast) {
        toast.success('Ledger data refreshed successfully');
      }
    } catch (error) {
      console.error('Error loading ledgers:', error);
      toast.error('Failed to load client ledgers');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchClients, transformClientToLedgerData]);


  const loadMoreLedgers = useCallback(async () => {
    if (loadingMore || currentPage * ITEMS_PER_PAGE >= allClients.length) return;

    setLoadingMore(true);

    try {
      const start = currentPage * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      const nextBatch = allClients.slice(start, end);

      const newLedgerData = await Promise.all(
        nextBatch.map(client => transformClientToLedgerData(client, true))
      );

      setLedgers(prev => [...prev, ...newLedgerData]);
      setDisplayedLedgers(prev => [...prev, ...newLedgerData]);
      setCurrentPage(prev => prev + 1);
    } catch (error) {
      console.error('Error loading more ledgers:', error);
      toast.error('Failed to load more clients');
    } finally {
      setLoadingMore(false);
    }
  }, [allClients, currentPage, loadingMore, transformClientToLedgerData]);


  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);


  const filteredAndSortedLedgers = useMemo(() => {
    let filtered = displayedLedgers;


    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = displayedLedgers.filter(ledger =>
        ledger.clientNicName.toLowerCase().includes(query) ||
        ledger.clientFullName.toLowerCase().includes(query) ||
        ledger.clientSite.toLowerCase().includes(query)
      );
    }


    const sorted = [...filtered].sort((a, b) => {
      switch (sortOption) {
        case 'nameAZ':
          return a.clientNicName.localeCompare(b.clientNicName);
        case 'nameZA':
          return b.clientNicName.localeCompare(a.clientNicName);
        case 'balanceHighLow':
          return b.currentBalance.grandTotal - a.currentBalance.grandTotal;
        case 'balanceLowHigh':
          return a.currentBalance.grandTotal - b.currentBalance.grandTotal;
        default:
          return 0;
      }
    });


    return sorted;
  }, [displayedLedgers, searchQuery, sortOption]);


  const hasMore = useMemo(() => {
    return currentPage * ITEMS_PER_PAGE < allClients.length;
  }, [currentPage, allClients.length]);


  const observerTarget = useInfiniteScroll({
    loading: loadingMore,
    hasMore,
    onLoadMore: loadMoreLedgers
  });


  const getSortLabel = (option: SortOption) => {
    switch (option) {
      case 'nameAZ': return t.nameAZ;
      case 'nameZA': return t.nameZA;
      case 'balanceHighLow': return t.balanceHighLow;
      case 'balanceLowHigh': return t.balanceLowHigh;
      default: return '';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            fontSize: '13px',
            padding: '10px 14px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Navbar />


      <main className="flex-1 w-full ml-0 overflow-auto pt-14 sm:pt-0 lg:ml-64">
        <div className="w-full px-3 py-3 pb-20 mx-auto sm:px-4 sm:py-5 lg:px-8 lg:py-12 lg:pb-12 max-w-7xl">
          {/* Header - Desktop Only */}
          <div className="items-center justify-between hidden mb-6 sm:flex lg:mb-8">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">{t.clientLedger}</h1>
              <p className="mt-1 text-xs text-gray-600">{t.rentalHistory}</p>
            </div>
            <button
              onClick={() => loadInitialData(true)}
              disabled={refreshing}
              title="Refresh"
              className="p-2 text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 touch-manipulation active:scale-95"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>


          {/* Search and Filter Section */}
          <div className="flex items-center gap-2 mb-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute text-gray-400 transform -translate-y-1/2 left-2.5 top-1/2 w-3.5 h-3.5" />
              <input
                type="text"
                placeholder={t.searchClients}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs min-h-[36px]"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50 touch-manipulation active:scale-95 min-h-[36px]"
              >
                <Filter className="w-3.5 h-3.5" />
                <span className="truncate">{getSortLabel(sortOption)}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
              </button>

              {showSortMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowSortMenu(false)}
                  ></div>
                  <div className="absolute right-0 z-20 w-56 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                    <div className="py-2">
                      {(['nameAZ', 'nameZA', 'balanceHighLow', 'balanceLowHigh'] as SortOption[]).map(option => (
                        <button
                          key={option}
                          onClick={() => {
                            setSortOption(option);
                            setShowSortMenu(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs transition-colors touch-manipulation active:scale-[0.98] ${
                            sortOption === option
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {getSortLabel(option)}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>


          {/* Ledger Cards / Loading / Empty State */}
          {loading ? (
            <div className="space-y-3 sm:space-y-4">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : filteredAndSortedLedgers.length === 0 ? (
            <div className="p-8 text-center bg-white border border-gray-200 rounded-lg shadow-sm sm:p-12 lg:p-16 sm:rounded-xl">
              <div className="inline-flex items-center justify-center w-12 h-12 mb-3 bg-gray-100 rounded-full sm:w-14 sm:h-14 sm:mb-4 lg:w-16 lg:h-16">
                <Users className="w-6 h-6 text-gray-400 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
              </div>
              <h3 className="mb-2 text-sm font-semibold text-gray-900 sm:text-base lg:text-lg">
                {searchQuery ? t.noMatchingClients : t.noClients}
              </h3>
              <p className="text-[10px] sm:text-xs lg:text-sm text-gray-500">
                {searchQuery
                  ? 'Try adjusting your search criteria'
                  : 'Add clients to start tracking their rental history'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-3 py-2 mt-3 text-xs font-medium text-blue-600 transition-colors rounded-lg sm:px-4 sm:py-2 sm:mt-4 sm:text-sm hover:text-blue-700 hover:bg-blue-50 touch-manipulation active:scale-95"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-3 sm:space-y-4">
                {filteredAndSortedLedgers.map(ledger => (
                  <ClientLedgerCard key={ledger.clientId} ledger={ledger} />
                ))}
              </div>

              {/* Infinite Scroll Trigger */}
              {hasMore && (
                <div ref={observerTarget} className="flex justify-center py-8">
                  {loadingMore && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Loading more clients...</span>
                    </div>
                  )}
                </div>
              )}

              {/* End of List Message */}
              {!hasMore && displayedLedgers.length > ITEMS_PER_PAGE && (
                <div className="py-6 text-center">
                  <p className="text-sm text-gray-500">
                    You've reached the end of the list
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
