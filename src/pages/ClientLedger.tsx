import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../utils/translations';
import { supabase } from '../utils/supabase';
import { fetchClientTransactions, calculateTotalFromItems } from '../utils/challanFetching';
import Header from '../components/Header';
import ClientLedgerCard from '../components/ClientLedgerCard';

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

export interface ClientLedgerData {
  clientId: string;
  clientNicName: string;
  clientFullName: string;
  clientSite: string;
  clientPhone: string;
  totalUdhar: SizeBalance;
  totalJama: SizeBalance;
  currentBalance: SizeBalance;
  udharCount: number;
  jamaCount: number;
}

export default function ClientLedger() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];

  const [ledgers, setLedgers] = useState<ClientLedgerData[]>([]);
  const [loading, setLoading] = useState(true);
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
        const transactions = await fetchClientTransactions(client.id);

        const udharChallans = transactions.filter(t => t.type === 'udhar');
        const jamaChallans = transactions.filter(t => t.type === 'jama');

        const udharTotals = calculateTotalsFromChallans(udharChallans);
        const jamaTotals = calculateTotalsFromChallans(jamaChallans);

        const currentBalance: SizeBalance = {
          size_1: udharTotals.size_1 - jamaTotals.size_1,
          size_2: udharTotals.size_2 - jamaTotals.size_2,
          size_3: udharTotals.size_3 - jamaTotals.size_3,
          size_4: udharTotals.size_4 - jamaTotals.size_4,
          size_5: udharTotals.size_5 - jamaTotals.size_5,
          size_6: udharTotals.size_6 - jamaTotals.size_6,
          size_7: udharTotals.size_7 - jamaTotals.size_7,
          size_8: udharTotals.size_8 - jamaTotals.size_8,
          size_9: udharTotals.size_9 - jamaTotals.size_9,
          grandTotal: 0
        };

        currentBalance.grandTotal =
          currentBalance.size_1 + currentBalance.size_2 + currentBalance.size_3 +
          currentBalance.size_4 + currentBalance.size_5 + currentBalance.size_6 +
          currentBalance.size_7 + currentBalance.size_8 + currentBalance.size_9;

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
          jamaCount: jamaChallans.length
        };
      })
    );

    return results;
  };

  const loadLedgers = async () => {
    setLoading(true);
    try {
      const rawData = await fetchClientsWithChallans();
      const transformedLedgers = await transformToLedgerData(rawData);
      console.debug('Transformed ledgers:', transformedLedgers.length);
      setLedgers(transformedLedgers);
    } catch (error) {
      console.error('Error loading ledgers:', error);
      alert('Error loading client ledgers. Please try again.');
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 mb-4 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-5 h-5" />
            {t.backToDashboard}
          </button>

          <h1 className="text-3xl font-bold text-gray-900">
            {t.clientLedger}
          </h1>
          <p className="mt-1 text-gray-600">{t.rentalHistory}</p>
        </div>

        {/* Search and Filter Section */}
        <div className="p-4 mb-6 bg-white rounded-lg shadow-md">
          <div className="flex flex-col gap-4 sm:flex-row">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                placeholder={t.searchClients}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="w-5 h-5" />
                <span>{getSortLabel(sortOption)}</span>
              </button>

              {showSortMenu && (
                <div className="absolute right-0 z-10 w-56 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                  <div className="py-2">
                    {(['nameAZ', 'nameZA', 'balanceHighLow', 'balanceLowHigh'] as SortOption[]).map(option => (
                      <button
                        key={option}
                        onClick={() => {
                          setSortOption(option);
                          setShowSortMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${
                          sortOption === option ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                        }`}
                      >
                        {getSortLabel(option)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ledger Cards / Loading / Empty State */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-5 bg-white rounded-lg shadow-md animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="w-1/4 h-5 mb-2 bg-gray-200 rounded"></div>
                    <div className="w-1/3 h-4 bg-gray-200 rounded"></div>
                  </div>
                  <div className="w-24 h-16 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredAndSortedLedgers.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-lg shadow-md">
            <p className="text-lg text-gray-500">
              {searchQuery ? t.noMatchingClients : t.noClients}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedLedgers.map(ledger => (
              <ClientLedgerCard key={ledger.clientId} ledger={ledger} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
