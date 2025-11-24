import React, { useState, useEffect, useMemo } from 'react';
import { Eye, Trash2, Edit as EditIcon, Download, Search, RefreshCw, FileText, Package, Calendar, ChevronLeft, ChevronRight, MapPin, Filter } from 'lucide-react';
import ReceiptTemplate from '../components/ReceiptTemplate';

type SortOption = 'dateNewOld' | 'dateOldNew' | 'numberHighLow' | 'numberLowHigh';
import { useLanguage } from '../contexts/LanguageContext';
import ChallanDetailsModal from '../components/ChallanDetailsModal';
import ChallanEditModal from '../components/ChallanEditModal';
import Navbar from '../components/Navbar';
import { supabase } from '../utils/supabase';
import { generateJPEG } from '../utils/generateJPEG';
import { format } from 'date-fns';
import toast, { Toaster } from 'react-hot-toast';

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
  size_1_borrowed: number;
  size_2_borrowed: number;
  size_3_borrowed: number;
  size_4_borrowed: number;
  size_5_borrowed: number;
  size_6_borrowed: number;
  size_7_borrowed: number;
  size_8_borrowed: number;
  size_9_borrowed: number;
  size_1_note: string | null;
  size_2_note: string | null;
  size_3_note: string | null;
  size_4_note: string | null;
  size_5_note: string | null;
  size_6_note: string | null;
  size_7_note: string | null;
  size_8_note: string | null;
  size_9_note: string | null;
  main_note: string | null;
}

const emptyItems: ItemsData = {
  size_1_qty: 0, size_2_qty: 0, size_3_qty: 0, size_4_qty: 0, size_5_qty: 0,
  size_6_qty: 0, size_7_qty: 0, size_8_qty: 0, size_9_qty: 0,
  size_1_borrowed: 0, size_2_borrowed: 0, size_3_borrowed: 0, size_4_borrowed: 0, size_5_borrowed: 0,
  size_6_borrowed: 0, size_7_borrowed: 0, size_8_borrowed: 0, size_9_borrowed: 0,
  size_1_note: null, size_2_note: null, size_3_note: null, size_4_note: null, size_5_note: null,
  size_6_note: null, size_7_note: null, size_8_note: null, size_9_note: null,
  main_note: null,
};

interface ChallanData {
  challanNumber: string;
  date: string;
  clientNicName: string;
  clientFullName: string;
  site: string;
  phone: string;
  driverName: string | null;
  isAlternativeSite: boolean;
  isSecondaryPhone: boolean;
  items: ItemsData;
  totalItems: number;
  clientId?: string;
}

type TabType = 'udhar' | 'jama';

const ChallanBook: React.FC = () => {
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<TabType>('udhar');
  const [udharChallans, setUdharChallans] = useState<ChallanData[]>([]);
  const [jamaChallans, setJamaChallans] = useState<ChallanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedChallan, setSelectedChallan] = useState<ChallanData | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortOption, setSortOption] = useState<SortOption>('dateNewOld');
  const [showSortMenu, setShowSortMenu] = useState(false);

  useEffect(() => {
    loadChallans();
  }, []);

  // Click outside handler to close sort menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.sort-menu-container')) {
        setShowSortMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSortLabel = (option: SortOption) => {
    switch (option) {
      case 'dateNewOld': return t('dateNewOld');
      case 'dateOldNew': return t('dateOldNew');
      case 'numberHighLow': return t('numberHighLow');
      case 'numberLowHigh': return t('numberLowHigh');
      default: return '';
    }
  };

  const calculateTotalItems = (items?: ItemsData | null): number => {
    const safeItems = items || emptyItems;
    let total = 0;
    for (let size = 1; size <= 9; size++) {
      const qty = (safeItems[`size_${size}_qty` as keyof ItemsData] as unknown) as number || 0;
      const borrowed = (safeItems[`size_${size}_borrowed` as keyof ItemsData] as unknown) as number || 0;
      total += qty + borrowed;
    }
    return total;
  };

  const loadChallans = async (showRefreshToast = false) => {
    if (showRefreshToast) setRefreshing(true);
    else setLoading(true);

    try {
      await Promise.all([fetchUdharChallans(), fetchJamaChallans()]);
      if (showRefreshToast) {
        toast.success('Challans refreshed successfully');
      }
    } catch (error) {
      console.error('Error loading challans:', error);
      toast.error('Failed to load challans');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

const fetchUdharChallans = async () => {
  const { data, error } = await supabase
    .from('udhar_challans')
    .select(`
      udhar_challan_number,
      udhar_date,
      driver_name,
      alternative_site,
      secondary_phone_number,
      client_id,
      client:clients!udhar_challans_client_id_fkey (
        id,
        client_nic_name,
        client_name,
        site,
        primary_phone_number
      ),
      items:udhar_items!udhar_items_udhar_challan_number_fkey (
        size_1_qty, size_2_qty, size_3_qty, size_4_qty, size_5_qty,
        size_6_qty, size_7_qty, size_8_qty, size_9_qty,
        size_1_borrowed, size_2_borrowed, size_3_borrowed,
        size_4_borrowed, size_5_borrowed, size_6_borrowed,
        size_7_borrowed, size_8_borrowed, size_9_borrowed,
        size_1_note, size_2_note, size_3_note, size_4_note,
        size_5_note, size_6_note, size_7_note, size_8_note,
        size_9_note, main_note
      )
    `)
    .order('udhar_challan_number', { ascending: true });

  if (error) {
    console.error('Error fetching udhar challans:', error);
    return;
  }

  const transformedData = (data || []).map((challan: any) => {
    const rawItems = challan.items;
    // Create a deep copy to prevent mutating the emptyItems constant
    const emptyItemsCopy: ItemsData = JSON.parse(JSON.stringify(emptyItems));
    const itemRow = Array.isArray(rawItems) ? (rawItems[0] || emptyItemsCopy) : (rawItems || emptyItemsCopy);
    return {
      challanNumber: challan.udhar_challan_number,
      date: challan.udhar_date,
      driverName: challan.driver_name,
      clientNicName: challan.client.client_nic_name,
      clientFullName: challan.client.client_name,
      clientId: challan.client_id,
      site: challan.alternative_site || challan.client.site,
      isAlternativeSite: !!challan.alternative_site,
      phone: challan.secondary_phone_number || challan.client.primary_phone_number,
      isSecondaryPhone: !!challan.secondary_phone_number,
      items: itemRow,
      totalItems: calculateTotalItems(itemRow),
    };
  });

  setUdharChallans(transformedData);
};

const fetchJamaChallans = async () => {
  const { data, error } = await supabase
    .from('jama_challans')
    .select(`
      jama_challan_number,
      jama_date,
      driver_name,
      alternative_site,
      secondary_phone_number,
      client_id,
      client:clients!jama_challans_client_id_fkey (
        id,
        client_nic_name,
        client_name,
        site,
        primary_phone_number
      ),
      items:jama_items!jama_items_jama_challan_number_fkey (
        size_1_qty, size_2_qty, size_3_qty, size_4_qty, size_5_qty,
        size_6_qty, size_7_qty, size_8_qty, size_9_qty,
        size_1_borrowed, size_2_borrowed, size_3_borrowed,
        size_4_borrowed, size_5_borrowed, size_6_borrowed,
        size_7_borrowed, size_8_borrowed, size_9_borrowed,
        size_1_note, size_2_note, size_3_note, size_4_note,
        size_5_note, size_6_note, size_7_note, size_8_note,
        size_9_note, main_note
      )
    `)
    .order('jama_challan_number', { ascending: false });

  if (error) {
    console.error('Error fetching jama challans:', error);
    return;
  }

  const transformedData = (data || []).map((challan: any) => {
    const rawItems = challan.items;
    // Create a deep copy to prevent mutating the emptyItems constant
    const emptyItemsCopy: ItemsData = JSON.parse(JSON.stringify(emptyItems));
    const itemRow = Array.isArray(rawItems) ? (rawItems[0] || emptyItemsCopy) : (rawItems || emptyItemsCopy);
    return {
      challanNumber: challan.jama_challan_number,
      date: challan.jama_date,
      driverName: challan.driver_name,
      clientNicName: challan.client.client_nic_name,
      clientFullName: challan.client.client_name,
      clientId: challan.client_id,
      site: challan.alternative_site || challan.client.site,
      isAlternativeSite: !!challan.alternative_site,
      phone: challan.secondary_phone_number || challan.client.primary_phone_number,
      isSecondaryPhone: !!challan.secondary_phone_number,
      items: itemRow,
      totalItems: calculateTotalItems(itemRow),
    };
  });

  setJamaChallans(transformedData);
};

  const handleViewDetails = (challan: ChallanData) => {
    setSelectedChallan(challan);
    setShowDetailsModal(true);
  };

  const handleEdit = (challan: ChallanData) => {
    setSelectedChallan(challan);
    setShowEditModal(true);
  };

  const handleEditSave = () => {
    loadChallans();
    toast.success('Challan updated successfully');
  };

  const transformItems = (items: ItemsData) => {
    return {
      ...items,
      size_1_note: items.size_1_note || '',
      size_2_note: items.size_2_note || '',
      size_3_note: items.size_3_note || '',
      size_4_note: items.size_4_note || '',
      size_5_note: items.size_5_note || '',
      size_6_note: items.size_6_note || '',
      size_7_note: items.size_7_note || '',
      size_8_note: items.size_8_note || '',
      size_9_note: items.size_9_note || '',
      main_note: items.main_note || ''
    };
  };

  const handleDownloadJPEG = async (challan: ChallanData) => {
    const loadingToast = toast.loading('Generating JPEG...');
    try {
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      document.body.appendChild(container);

      const root = await import('react-dom/client');
      const reactRoot = root.createRoot(container);
      
      await new Promise<void>((resolve) => {
        reactRoot.render(
          <ReceiptTemplate
            challanType={activeTab}
            challanNumber={challan.challanNumber}
            date={new Date(challan.date).toLocaleDateString('en-GB')}
            clientName={challan.clientFullName}
            clientSortName={challan.clientNicName}
            site={challan.site}
            phone={challan.phone}
            driverName={challan.driverName || ''}
            items={transformItems(challan.items)}
          />
        );
        setTimeout(resolve, 100);
      });

      await generateJPEG(
        activeTab,
        challan.challanNumber,
        new Date(challan.date).toLocaleDateString('en-GB')
      );

      reactRoot.unmount();
      document.body.removeChild(container);
      
      toast.dismiss(loadingToast);
      toast.success(t('challanDownloadSuccess'));
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Error generating JPEG:', error);
      toast.error(t('challanDownloadError'));
    }
  };

  const handleDelete = async (challan: ChallanData) => {
    const confirmed = window.confirm(
      `${t('confirmDelete')}\n\n${t('challanNumber')}: ${challan.challanNumber}\n${t('totalItems')}: ${challan.totalItems} ${t('pieces')}\n\n${t('deleteWarning')}`
    );

    if (!confirmed) return;

    const loadingToast = toast.loading('Deleting challan...');

    try {
      const rpcFunction = activeTab === 'udhar' ? 'delete_udhar_challan_with_stock' : 'delete_jama_challan_with_stock';

      const { data, error } = await supabase.rpc(rpcFunction, {
        p_challan_number: challan.challanNumber,
        p_size_1_qty: challan.items.size_1_qty,
        p_size_2_qty: challan.items.size_2_qty,
        p_size_3_qty: challan.items.size_3_qty,
        p_size_4_qty: challan.items.size_4_qty,
        p_size_5_qty: challan.items.size_5_qty,
        p_size_6_qty: challan.items.size_6_qty,
        p_size_7_qty: challan.items.size_7_qty,
        p_size_8_qty: challan.items.size_8_qty,
        p_size_9_qty: challan.items.size_9_qty,
        p_size_1_borrowed: challan.items.size_1_borrowed,
        p_size_2_borrowed: challan.items.size_2_borrowed,
        p_size_3_borrowed: challan.items.size_3_borrowed,
        p_size_4_borrowed: challan.items.size_4_borrowed,
        p_size_5_borrowed: challan.items.size_5_borrowed,
        p_size_6_borrowed: challan.items.size_6_borrowed,
        p_size_7_borrowed: challan.items.size_7_borrowed,
        p_size_8_borrowed: challan.items.size_8_borrowed,
        p_size_9_borrowed: challan.items.size_9_borrowed,
      });

      toast.dismiss(loadingToast);

      if (error) throw error;

      if (data && typeof data === 'object' && 'success' in data) {
        if (data.success) {
          toast.success('Challan deleted successfully');
          loadChallans();
        } else {
          toast.error(`Error: ${data.message}`);
        }
      } else {
        toast.success('Challan deleted successfully');
        loadChallans();
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Error deleting challan:', error);
      toast.error('Failed to delete challan');
    }
  };

  const currentChallans = activeTab === 'udhar' ? udharChallans : jamaChallans;
  
  const filteredChallans = useMemo(() => {
    const filtered = currentChallans.filter((challan) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        challan.challanNumber.toLowerCase().includes(searchLower) ||
        challan.clientNicName.toLowerCase().includes(searchLower) ||
        challan.clientFullName.toLowerCase().includes(searchLower) ||
        challan.site.toLowerCase().includes(searchLower)
      );
    });

    return filtered.sort((a, b) => {
      switch (sortOption) {
        case 'dateNewOld':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'dateOldNew':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'numberHighLow':
          return b.challanNumber.localeCompare(a.challanNumber);
        case 'numberLowHigh':
          return a.challanNumber.localeCompare(b.challanNumber);
        default:
          return 0;
      }
    });
  }, [currentChallans, searchTerm, sortOption]);

  const totalPages = Math.ceil(filteredChallans.length / itemsPerPage);
  const paginatedChallans = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredChallans.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredChallans, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab, sortOption]);

  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-4 py-3 sm:px-6 sm:py-4"><div className="w-20 h-4 bg-gray-200 rounded sm:w-24"></div></td>
      <td className="px-4 py-3 sm:px-6 sm:py-4"><div className="w-16 h-4 bg-gray-200 rounded sm:w-20"></div></td>
      <td className="px-4 py-3 sm:px-6 sm:py-4">
        <div className="w-24 h-4 mb-1 bg-gray-200 rounded sm:w-32"></div>
        <div className="w-20 h-3 bg-gray-200 rounded sm:w-24"></div>
      </td>
      <td className="px-4 py-3 sm:px-6 sm:py-4"><div className="w-20 h-4 bg-gray-200 rounded sm:w-28"></div></td>
      <td className="px-4 py-3 sm:px-6 sm:py-4"><div className="w-20 h-4 bg-gray-200 rounded sm:w-24"></div></td>
      <td className="px-4 py-3 sm:px-6 sm:py-4"><div className="w-12 h-4 bg-gray-200 rounded sm:w-16"></div></td>
      <td className="px-4 py-3 sm:px-6 sm:py-4"><div className="w-24 h-8 bg-gray-200 rounded sm:w-32"></div></td>
    </tr>
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
      <main className="flex-1 w-full ml-0 overflow-auto pt-14 sm:pt-0 lg:ml-64">
        <div className="w-full px-3 py-3 pb-20 mx-auto sm:px-4 sm:py-5 lg:px-8 lg:py-12 lg:pb-12 max-w-7xl">
          {/* Header - Desktop Only */}
          <div className="items-center justify-between hidden mb-6 sm:flex lg:mb-8">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 lg:text-3xl">{t('challanBook')}</h2>
              <p className="mt-1 text-xs text-gray-600">View and manage all challans</p>
            </div>
            <button
              onClick={() => loadChallans(true)}
              disabled={refreshing}
              title="Refresh"
              className="p-2 text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 touch-manipulation active:scale-95"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Main Table Container */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm sm:rounded-xl">
            {/* Tabs - Mobile Optimized */}
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('udhar')}
                  className={`flex-1 py-3 sm:py-4 px-3 sm:px-6 text-center font-semibold text-xs sm:text-sm transition-colors touch-manipulation active:scale-[0.98] ${
                    activeTab === 'udhar'
                      ? 'border-b-2 border-red-600 text-red-600 bg-red-50'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                    <FileText className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    <span className="hidden sm:inline">{t('udharChallans')}</span>
                    <span className="sm:hidden">Udhar</span>
                    <span className={`px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs rounded-full ${
                      activeTab === 'udhar' 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {udharChallans.length}
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('jama')}
                  className={`flex-1 py-3 sm:py-4 px-3 sm:px-6 text-center font-semibold text-xs sm:text-sm transition-colors touch-manipulation active:scale-[0.98] ${
                    activeTab === 'jama'
                      ? 'border-b-2 border-green-600 text-green-600 bg-green-50'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                    <Package className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    <span className="hidden sm:inline">{t('jamaChallans')}</span>
                    <span className="sm:hidden">Jama</span>
                    <span className={`px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs rounded-full ${
                      activeTab === 'jama' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {jamaChallans.length}
                    </span>
                  </div>
                </button>
              </nav>
            </div>

            {/* Enhanced Search Bar with Integrated Filter */}
            <div className="p-3 border-b border-gray-200 sm:p-4 lg:p-6 bg-gray-50">
              <div className="relative flex items-center w-full">
                <Search className="absolute w-4 h-4 text-gray-400 left-3" />
                <input
                  type="text"
                  placeholder={t('searchChallan')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-28 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <div className="absolute flex items-center gap-2 right-2">
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <div className="flex items-center justify-center w-4 h-4">×</div>
                    </button>
                  )}
                  <div className="relative sort-menu-container">
                    <button
                      onClick={() => setShowSortMenu(prev => !prev)}
                      className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-gray-600 rounded-md"
                    >
                      <Filter className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{getSortLabel(sortOption)}</span>
                    </button>
                    
                    {showSortMenu && (
                      <div className="absolute right-0 z-10 w-40 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                        {(['dateNewOld', 'dateOldNew', 'numberHighLow', 'numberLowHigh'] as SortOption[]).map((option) => (
                          <button
                            key={option}
                            onClick={() => {
                              setSortOption(option);
                              setShowSortMenu(false);
                            }}
                            className={`w-full px-4 py-2 text-xs text-left transition-colors hover:bg-gray-50 ${
                              sortOption === option ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                            }`}
                          >
                            {getSortLabel(option)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden overflow-x-auto lg:block">
              {loading ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">{t('challanNumber')}</th>
                      <th className="px-6 py-4 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">{t('date')}</th>
                      <th className="px-6 py-4 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">{t('clientName')}</th>
                      <th className="px-6 py-4 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">{t('site')}</th>
                      <th className="px-6 py-4 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">{t('phone')}</th>
                      <th className="px-6 py-4 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">{t('totalItems')}</th>
                      <th className="px-6 py-4 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                  </tbody>
                </table>
              ) : filteredChallans.length === 0 ? (
                <div className="py-16 text-center">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium text-gray-500">{t('noChallansFound')}</p>
                  <p className="mt-1 text-sm text-gray-400">{t('tryAdjustingSearch')}</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">{t('challanNumber')}</th>
                      <th className="px-6 py-4 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                        <div className="flex items-center justify-center gap-2">
                          <Calendar size={14} />
                          {t('date')}
                        </div>
                      </th>
                      <th className="px-6 py-4 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">{t('clientName')}</th>
                      <th className="px-6 py-4 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">{t('site')}</th>
                      <th className="px-6 py-4 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">{t('phone')}</th>
                      <th className="px-6 py-4 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">{t('totalItems')}</th>
                      <th className="px-6 py-4 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {paginatedChallans.map((challan, index) => (
                      <tr 
                        key={challan.challanNumber} 
                        className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}
                      >
                        <td className="px-6 py-4 text-sm font-bold text-center text-gray-900 whitespace-nowrap">
                          {challan.challanNumber}
                        </td>
                        <td className="px-6 py-4 text-sm text-center text-gray-900 whitespace-nowrap">
                          {challan.date ? format(new Date(challan.date), 'dd/MM/yyyy') : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-center text-gray-900">
                          <div>
                            <div className="font-semibold">{challan.clientNicName}</div>
                            <div className="text-xs text-gray-500">{challan.clientFullName}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-center text-gray-900">
                          <div className="flex items-center justify-center gap-2">
                            {challan.site}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-center text-gray-900 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            {challan.phone}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <Package size={12} />
                            {challan.totalItems}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-center text-gray-900 whitespace-nowrap">
                          <div className="flex justify-center gap-1">
                            <button
                              onClick={() => handleViewDetails(challan)}
                              className="p-2 text-blue-600 transition-colors rounded-lg hover:bg-blue-50 hover:text-blue-800 touch-manipulation active:scale-95"
                              title={t('viewDetails')}
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleEdit(challan)}
                              className="p-2 text-yellow-600 transition-colors rounded-lg hover:bg-yellow-50 hover:text-yellow-800 touch-manipulation active:scale-95"
                              title={t('edit')}
                            >
                              <EditIcon size={16} />
                            </button>
                            <button
                              onClick={() => handleDownloadJPEG(challan)}
                              className="p-2 text-blue-600 transition-colors rounded-lg hover:bg-blue-50 hover:text-blue-800 touch-manipulation active:scale-95"
                              title={t('downloadJPEG')}
                            >
                              <Download size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(challan)}
                              className="p-2 text-red-600 transition-colors rounded-lg hover:bg-red-50 hover:text-red-800 touch-manipulation active:scale-95"
                              title={t('delete')}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Mobile Cards - MODIFIED SECTION */}
            <div className="p-3 space-y-3 sm:p-4 sm:space-y-4 lg:hidden">
              {loading ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm sm:p-4 sm:rounded-xl animate-pulse">
                      <div className="w-24 h-5 mb-3 bg-gray-200 rounded sm:w-32 sm:h-6"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  ))}
                </>
              ) : filteredChallans.length === 0 ? (
                <div className="py-12 text-center">
                  <FileText size={40} className="mx-auto mb-3 text-gray-300 sm:w-12 sm:h-12" />
                  <p className="text-sm font-medium text-gray-500 sm:text-base">{t('noChallansFound')}</p>
                </div>
              ) : (
                paginatedChallans.map((challan) => (
                  <div
                    key={challan.challanNumber}
                    className={`p-3 sm:p-4 border shadow-sm rounded-lg sm:rounded-xl ${
                      activeTab === 'udhar'
                        ? 'bg-red-50 border-red-200'
                        : 'bg-green-50 border-green-200'
                    }`}
                  >
                    {/* Header - Date removed from here */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="text-xs font-bold text-gray-900 sm:text-sm">
                          {challan.challanNumber}
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${
                        activeTab === 'udhar'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        <Package className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        {challan.totalItems}
                      </span>
                    </div>

                    {/* Client Info */}
                    <div className="pb-3 mb-3 space-y-2 text-xs border-b border-gray-300 sm:text-sm">
                      {/* Line 1: Client Sort Name and Full Name (Mobile) */}
                      <div className="flex gap-2 sm:hidden">
                        <span className="font-semibold text-gray-900">{challan.clientNicName}</span>
                        <span className="text-gray-600">-</span>
                        <span className="text-gray-600">{challan.clientFullName}</span>
                      </div>

                      {/* Desktop View */}
                      <div className="hidden sm:block">
                        <span className="font-semibold text-gray-900">{challan.clientNicName}</span>
                        <div className="text-[10px] sm:text-xs text-gray-600">{challan.clientFullName}</div>
                      </div>
                      
                      {/* Line 2: Date and Location */}
                      <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-1.5 sm:gap-2 text-gray-700">
                          <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                          <span>{challan.date ? format(new Date(challan.date), 'dd/MM/yyyy') : 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 text-gray-700 min-w-0 flex-1">
                          <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                          <span className="truncate">{challan.site}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                      <button
                        onClick={() => handleViewDetails(challan)}
                        className="flex flex-col items-center justify-center gap-1 px-2 py-2 text-blue-600 transition-colors bg-white rounded-lg hover:bg-blue-50 touch-manipulation active:scale-95"
                      >
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-[9px] sm:text-[10px] font-medium">View</span>
                      </button>
                      <button
                        onClick={() => handleEdit(challan)}
                        className="flex flex-col items-center justify-center gap-1 px-2 py-2 text-yellow-600 transition-colors bg-white rounded-lg hover:bg-yellow-50 touch-manipulation active:scale-95"
                      >
                        <EditIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-[9px] sm:text-[10px] font-medium">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDownloadJPEG(challan)}
                        className="flex flex-col items-center justify-center gap-1 px-2 py-2 text-blue-600 transition-colors bg-white rounded-lg hover:bg-blue-50 touch-manipulation active:scale-95"
                      >
                        <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-[9px] sm:text-[10px] font-medium">Download</span>
                      </button>
                      <button
                        onClick={() => handleDelete(challan)}
                        className="flex flex-col items-center justify-center gap-1 px-2 py-2 text-red-600 transition-colors bg-white rounded-lg hover:bg-red-50 touch-manipulation active:scale-95"
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-[9px] sm:text-[10px] font-medium">Delete</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination - Mobile Optimized */}
            {!loading && filteredChallans.length > 0 && (
              <div className="px-3 py-3 border-t border-gray-200 sm:px-4 sm:py-4 lg:px-6 bg-gray-50">
                <div className="flex flex-col items-center justify-between gap-3 sm:flex-row sm:gap-0">
                  <div className="text-[10px] sm:text-xs lg:text-sm text-gray-600">
                    Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, filteredChallans.length)}
                    </span>{' '}
                    of <span className="font-medium">{filteredChallans.length}</span> challans
                  </div>
                  
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 sm:p-2 text-gray-600 transition-colors border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation active:scale-95"
                    >
                      <ChevronLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    </button>
                    
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs lg:text-sm font-medium rounded-lg transition-colors touch-manipulation active:scale-95 ${
                              currentPage === pageNum
                                ? activeTab === 'udhar'
                                  ? 'bg-red-600 text-white'
                                  : 'bg-green-600 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="p-1.5 sm:p-2 text-gray-600 transition-colors border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation active:scale-95"
                    >
                      <ChevronRight className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <ChallanDetailsModal
        challan={selectedChallan}
        type={activeTab}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        onDownload={handleDownloadJPEG}
      />

      <ChallanEditModal
        challan={selectedChallan}
        type={activeTab}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleEditSave}
      />
    </div>
  );
};

export default ChallanBook;
