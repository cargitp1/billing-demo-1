import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Users, 
  TrendingUp, 
  TrendingDown,
  FileText,
  ChevronDown
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../utils/translations';
import { supabase } from '../utils/supabase';
import { fetchClientTransactions} from '../utils/challanFetching';
import Navbar from '../components/Navbar';
import ClientLedgerCard from '../components/ClientLedgerCard';
import toast, { Toaster } from 'react-hot-toast';

type SortOption = 'nameAZ' | 'nameZA' | 'balanceHighLow' | 'balanceLowHigh';

interface ItemsData {
  size_1_qty: number;
  size_2_qty: number;
  size_3_qty: number;
  size_4_qty: number;
  size_5_qty: number;
  size_6_qty: number;
  size_7_qty: number;
  size_8_qty: number;
  size_9_qty: number;
}

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
}

export default function ClientLedger() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];

  const [ledgers, setLedgers] = useState<ClientLedgerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('nameAZ');
  const [showSortMenu, setShowSortMenu] = useState(false);

  useEffect(() => {
    loadLedgers();
  }, []);

  const fetchClientsWithChallans = async () => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('client_nic_name', { ascending: true });

    if (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }

    console.debug('Fetched clients:', data?.length || 0);
    return data || [];
  };

  const calculateTotalsFromChallans = (challans: any[]): SizeBalance => {
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
  };

  const transformToLedgerData = async (clients: any[]): Promise<ClientLedgerData[]> => {
    const results = await Promise.all(
      clients.map(async (client) => {
        const rawTransactions = await fetchClientTransactions(client.id);

        console.log(`Client ${client.client_nic_name} transactions:`, rawTransactions.length);

        const transactions: Transaction[] = rawTransactions.map((t: any) => {
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

        const udharTotals = calculateTotalsFromChallans(udharChallans);
        const jamaTotals = calculateTotalsFromChallans(jamaChallans);

        const currentBalance: ClientBalance = {
          grandTotal: 0,
          sizes: {}
        };

        for (let i = 1; i <= 9; i++) {
          currentBalance.sizes[i] = { main: 0, borrowed: 0, total: 0 };
        }

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

        return {
          clientId: client.id,
          clientNicName: client.client_nic_name,
          clientFullName: client.client_name,
          clientSite: client.site,
          clientPhone: client.primary_phone_number,
          totalUdhar: udharTotals,
          totalJama: jamaTotals,
          currentBalance: currentBalance,
          udharCount: udharChallans.length,
          jamaCount: jamaChallans.length,
          transactions: transactions
        };
      })
    );

    return results;
  };

  const loadLedgers = async (showRefreshToast = false) => {
    if (showRefreshToast) setRefreshing(true);
    else setLoading(true);

    try {
      const rawData = await fetchClientsWithChallans();
      const transformedLedgers = await transformToLedgerData(rawData);
      console.debug('Transformed ledgers:', transformedLedgers.length);
      setLedgers(transformedLedgers);
      
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
  };

  // Memoized filtering and sorting
  const filteredAndSortedLedgers = useMemo(() => {
    let filtered = ledgers;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = ledgers.filter(ledger =>
        ledger.clientNicName.toLowerCase().includes(query) ||
        ledger.clientFullName.toLowerCase().includes(query) ||
        ledger.clientSite.toLowerCase().includes(query)
      );
    }

    // Apply sorting
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
  }, [ledgers, searchQuery, sortOption]);

  const getSortLabel = (option: SortOption) => {
    switch (option) {
      case 'nameAZ': return t.nameAZ;
      case 'nameZA': return t.nameZA;
      case 'balanceHighLow': return t.balanceHighLow;
      case 'balanceLowHigh': return t.balanceLowHigh;
      default: return '';
    }
  };

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalClients = ledgers.length;
    const clientsWithBalance = ledgers.filter(l => l.currentBalance.grandTotal > 0).length;
    const totalOutstanding = ledgers.reduce((sum, l) => sum + l.currentBalance.grandTotal, 0);
    const totalUdharChallans = ledgers.reduce((sum, l) => sum + l.udharCount, 0);
    const totalJamaChallans = ledgers.reduce((sum, l) => sum + l.jamaCount, 0);

    return {
      totalClients,
      clientsWithBalance,
      totalOutstanding,
      totalUdharChallans,
      totalJamaChallans
    };
  }, [ledgers]);

  const SkeletonCard = () => (
    <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex items-center flex-1 gap-4">
          <div className="bg-gray-200 rounded-full w-14 h-14"></div>
          <div className="flex-1">
            <div className="w-48 h-6 mb-2 bg-gray-200 rounded"></div>
            <div className="w-64 h-4 mb-1 bg-gray-200 rounded"></div>
            <div className="w-40 h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="text-right">
          <div className="w-24 h-8 mb-2 bg-gray-200 rounded"></div>
          <div className="w-32 h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
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

      <main className="flex-1 ml-64 overflow-auto">
        <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t.clientLedger}</h1>
              <p className="mt-1 text-gray-600">{t.rentalHistory}</p>
            </div>
            <button
              onClick={() => loadLedgers(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          {/* Summary Statistics Cards */}
          {!loading && (
            <div className="grid gap-6 mb-8 md:grid-cols-4">
              <div className="relative overflow-hidden transition-shadow bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md">
                <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-50 bg-blue-50"></div>
                <div className="relative p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600 uppercase">{t.totalClients || 'Total Clients'}</p>
                      <p className="mt-2 text-2xl font-bold text-blue-600">{summaryStats.totalClients}</p>
                    </div>
                    <div className="p-2.5 bg-blue-100 rounded-lg">
                      <Users size={24} className="text-blue-600" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden transition-shadow bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md">
                <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-50 bg-orange-50"></div>
                <div className="relative p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600 uppercase">{t.withBalance || 'With Balance'}</p>
                      <p className="mt-2 text-2xl font-bold text-orange-600">{summaryStats.clientsWithBalance}</p>
                    </div>
                    <div className="p-2.5 bg-orange-100 rounded-lg">
                      <TrendingUp size={24} className="text-orange-600" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden transition-shadow bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md">
                <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-50 bg-red-50"></div>
                <div className="relative p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600 uppercase">{t.udharChallans || 'Udhar'}</p>
                      <p className="mt-2 text-2xl font-bold text-red-600">{summaryStats.totalUdharChallans}</p>
                    </div>
                    <div className="p-2.5 bg-red-100 rounded-lg">
                      <FileText size={24} className="text-red-600" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden transition-shadow bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md">
                <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-50 bg-green-50"></div>
                <div className="relative p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600 uppercase">{t.jamaChallans || 'Jama'}</p>
                      <p className="mt-2 text-2xl font-bold text-green-600">{summaryStats.totalJamaChallans}</p>
                    </div>
                    <div className="p-2.5 bg-green-100 rounded-lg">
                      <FileText size={24} className="text-green-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search and Filter Section */}
          <div className="p-6 mb-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" size={18} />
                <input
                  type="text"
                  placeholder={t.searchClients}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Filter size={18} />
                  <span>{getSortLabel(sortOption)}</span>
                  <ChevronDown size={16} className={`transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
                </button>

                {showSortMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowSortMenu(false)}
                    ></div>
                    <div className="absolute right-0 z-20 w-64 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                      <div className="py-2">
                        {(['nameAZ', 'nameZA', 'balanceHighLow', 'balanceLowHigh'] as SortOption[]).map(option => (
                          <button
                            key={option}
                            onClick={() => {
                              setSortOption(option);
                              setShowSortMenu(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
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

            {/* Results Count */}
            {!loading && (
              <div className="pt-4 mt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-semibold text-gray-900">{filteredAndSortedLedgers.length}</span> of{' '}
                  <span className="font-semibold text-gray-900">{ledgers.length}</span> clients
                  {searchQuery && (
                    <span className="ml-2 text-gray-500">
                      • Filtered by: <span className="font-medium text-gray-700">"{searchQuery}"</span>
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Ledger Cards / Loading / Empty State */}
          {loading ? (
            <div className="space-y-4">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : filteredAndSortedLedgers.length === 0 ? (
            <div className="p-16 text-center bg-white border border-gray-200 shadow-sm rounded-xl">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 rounded-full">
                <Users size={32} className="text-gray-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                {searchQuery ? t.noMatchingClients : t.noClients}
              </h3>
              <p className="text-gray-500">
                {searchQuery 
                  ? 'Try adjusting your search criteria' 
                  : 'Add clients to start tracking their rental history'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 mt-4 text-sm font-medium text-blue-600 transition-colors rounded-lg hover:text-blue-700 hover:bg-blue-50"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedLedgers.map(ledger => (
                <ClientLedgerCard key={ledger.clientId} ledger={ledger} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
