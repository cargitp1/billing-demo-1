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


  const filteredAndSortedLedgers = useMemo(() => {
    let filtered = ledgers;


    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = ledgers.filter(ledger =>
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
  );


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


      <main className="flex-1 w-full ml-0 overflow-auto lg:ml-64">
        <div className="w-full px-3 py-3 pb-20 mx-auto sm:px-4 sm:py-5 lg:px-8 lg:py-12 lg:pb-12 max-w-7xl">
          {/* Header */}
          <div className="flex flex-col items-start justify-between gap-3 mb-4 sm:flex-row sm:items-center sm:gap-0 sm:mb-6 lg:mb-8">
            <div>
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl">{t.clientLedger}</h1>
              <p className="mt-0.5 text-[10px] sm:text-xs text-gray-600">{t.rentalHistory}</p>
            </div>
            <button
              onClick={() => loadLedgers(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 touch-manipulation active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>


          {/* Summary Statistics Cards */}
          {!loading && (
            <div className="grid gap-3 mb-4 sm:gap-4 md:grid-cols-2 lg:grid-cols-4 sm:mb-6 lg:mb-8 lg:gap-6">
              <div className="relative overflow-hidden transition-shadow bg-white border border-gray-200 rounded-lg shadow-sm sm:rounded-xl hover:shadow-md">
                <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-full opacity-50 sm:w-20 sm:h-20 bg-blue-50"></div>
                <div className="relative p-3 sm:p-4 lg:p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] sm:text-xs font-medium text-gray-600 uppercase">{t.totalClients || 'Total Clients'}</p>
                      <p className="mt-1 text-xl font-bold text-blue-600 sm:mt-2 sm:text-2xl">{summaryStats.totalClients}</p>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-md sm:p-2.5 sm:rounded-lg">
                      <Users className="w-5 h-5 text-blue-600 sm:w-6 sm:h-6" />
                    </div>
                  </div>
                </div>
              </div>


              <div className="relative overflow-hidden transition-shadow bg-white border border-gray-200 rounded-lg shadow-sm sm:rounded-xl hover:shadow-md">
                <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-full opacity-50 sm:w-20 sm:h-20 bg-orange-50"></div>
                <div className="relative p-3 sm:p-4 lg:p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] sm:text-xs font-medium text-gray-600 uppercase">{t.withBalance || 'With Balance'}</p>
                      <p className="mt-1 text-xl font-bold text-orange-600 sm:mt-2 sm:text-2xl">{summaryStats.clientsWithBalance}</p>
                    </div>
                    <div className="p-2 bg-orange-100 rounded-md sm:p-2.5 sm:rounded-lg">
                      <TrendingUp className="w-5 h-5 text-orange-600 sm:w-6 sm:h-6" />
                    </div>
                  </div>
                </div>
              </div>


              <div className="relative overflow-hidden transition-shadow bg-white border border-gray-200 rounded-lg shadow-sm sm:rounded-xl hover:shadow-md">
                <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-full opacity-50 sm:w-20 sm:h-20 bg-red-50"></div>
                <div className="relative p-3 sm:p-4 lg:p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] sm:text-xs font-medium text-gray-600 uppercase">{t.udharChallans || 'Udhar'}</p>
                      <p className="mt-1 text-xl font-bold text-red-600 sm:mt-2 sm:text-2xl">{summaryStats.totalUdharChallans}</p>
                    </div>
                    <div className="p-2 bg-red-100 rounded-md sm:p-2.5 sm:rounded-lg">
                      <FileText className="w-5 h-5 text-red-600 sm:w-6 sm:h-6" />
                    </div>
                  </div>
                </div>
              </div>


              <div className="relative overflow-hidden transition-shadow bg-white border border-gray-200 rounded-lg shadow-sm sm:rounded-xl hover:shadow-md">
                <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-full opacity-50 sm:w-20 sm:h-20 bg-green-50"></div>
                <div className="relative p-3 sm:p-4 lg:p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] sm:text-xs font-medium text-gray-600 uppercase">{t.jamaChallans || 'Jama'}</p>
                      <p className="mt-1 text-xl font-bold text-green-600 sm:mt-2 sm:text-2xl">{summaryStats.totalJamaChallans}</p>
                    </div>
                    <div className="p-2 bg-green-100 rounded-md sm:p-2.5 sm:rounded-lg">
                      <FileText className="w-5 h-5 text-green-600 sm:w-6 sm:h-6" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* Search and Filter Section */}
          <div className="p-3 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:p-4 lg:p-6 sm:mb-6 sm:rounded-xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute text-gray-400 transform -translate-y-1/2 left-2.5 sm:left-3 top-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <input
                  type="text"
                  placeholder={t.searchClients}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm min-h-[36px]"
                />
              </div>


              {/* Sort Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className="inline-flex items-center justify-center w-full gap-2 px-3 py-2 text-xs font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg sm:w-auto sm:px-4 sm:py-2.5 sm:text-sm hover:bg-gray-50 touch-manipulation active:scale-95 min-h-[36px]"
                >
                  <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="truncate">{getSortLabel(sortOption)}</span>
                  <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
                </button>


                {showSortMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowSortMenu(false)}
                    ></div>
                    <div className="absolute right-0 z-20 w-56 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg sm:w-64">
                      <div className="py-2">
                        {(['nameAZ', 'nameZA', 'balanceHighLow', 'balanceLowHigh'] as SortOption[]).map(option => (
                          <button
                            key={option}
                            onClick={() => {
                              setSortOption(option);
                              setShowSortMenu(false);
                            }}
                            className={`w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm transition-colors touch-manipulation active:scale-[0.98] ${
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
              <div className="pt-3 mt-3 border-t border-gray-200 sm:pt-4 sm:mt-4">
                <p className="text-[10px] sm:text-xs lg:text-sm text-gray-600">
                  Showing <span className="font-semibold text-gray-900">{filteredAndSortedLedgers.length}</span> of{' '}
                  <span className="font-semibold text-gray-900">{ledgers.length}</span> clients
                  {searchQuery && (
                    <span className="block mt-1 text-gray-500 sm:inline sm:ml-2 sm:mt-0">
                      • Filtered by: <span className="font-medium text-gray-700">"{searchQuery}"</span>
                    </span>
                  )}
                </p>
              </div>
            )}
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
            <div className="space-y-3 sm:space-y-4">
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