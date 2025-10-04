import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit2, Trash2, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../utils/translations';
import Header from '../components/Header';
import { ChallanDetailsModal } from '../components/ChallanDetailsModal';
import { DeleteConfirmDialog } from '../components/DeleteConfirmDialog';
import { SearchFilter } from '../components/SearchFilter';
import { ChallanCard } from '../components/ChallanCard';
import {
  fetchUdharChallans,
  fetchJamaChallans,
  deleteUdharChallan,
  deleteJamaChallan,
  calculateTotalItems,
} from '../utils/challanOperations';
import { format } from 'date-fns';

type TabType = 'udhar' | 'jama';

export const ChallanBook: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<TabType>('udhar');
  const [udharChallans, setUdharChallans] = useState<any[]>([]);
  const [jamaChallans, setJamaChallans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState<'date-asc' | 'date-desc' | 'challan-asc' | 'client-asc'>('date-asc');
  const [showFilters, setShowFilters] = useState(false);

  const [selectedChallan, setSelectedChallan] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingChallan, setDeletingChallan] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadChallans();
  }, []);

  const loadChallans = async () => {
    setLoading(true);
    setError(null);

    try {
      const [udharResult, jamaResult] = await Promise.all([
        fetchUdharChallans(),
        fetchJamaChallans(),
      ]);

      if (udharResult.error) throw udharResult.error;
      if (jamaResult.error) throw jamaResult.error;

      setUdharChallans(udharResult.data || []);
      setJamaChallans(jamaResult.data || []);
    } catch (err: any) {
      console.error('Error loading challans:', err);
      setError(err.message || 'Failed to load challans');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortChallans = (challans: any[], type: 'udhar' | 'jama') => {
    let filtered = [...challans];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((challan) => {
        const challanNumber = type === 'udhar'
          ? challan.udhar_challan_number
          : challan.jama_challan_number;
        const clientName = challan.client?.client_nic_name?.toLowerCase() || '';
        const fullClientName = challan.client?.client_name?.toLowerCase() || '';
        const site = (challan.alternative_site || challan.client?.site || '').toLowerCase();
        const driver = (challan.driver_name || '').toLowerCase();

        return (
          challanNumber.toLowerCase().includes(term) ||
          clientName.includes(term) ||
          fullClientName.includes(term) ||
          site.includes(term) ||
          driver.includes(term)
        );
      });
    }

    if (dateFrom) {
      filtered = filtered.filter((challan) => {
        const challanDate = type === 'udhar' ? challan.udhar_date : challan.jama_date;
        return new Date(challanDate) >= new Date(dateFrom);
      });
    }

    if (dateTo) {
      filtered = filtered.filter((challan) => {
        const challanDate = type === 'udhar' ? challan.udhar_date : challan.jama_date;
        return new Date(challanDate) <= new Date(dateTo);
      });
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc': {
          const dateA = new Date(type === 'udhar' ? a.udhar_date : a.jama_date);
          const dateB = new Date(type === 'udhar' ? b.udhar_date : b.jama_date);
          return dateA.getTime() - dateB.getTime();
        }
        case 'date-desc': {
          const dateA = new Date(type === 'udhar' ? a.udhar_date : a.jama_date);
          const dateB = new Date(type === 'udhar' ? b.udhar_date : b.jama_date);
          return dateB.getTime() - dateA.getTime();
        }
        case 'challan-asc': {
          const numA = type === 'udhar' ? a.udhar_challan_number : a.jama_challan_number;
          const numB = type === 'udhar' ? b.udhar_challan_number : b.jama_challan_number;
          return numA.localeCompare(numB);
        }
        case 'client-asc': {
          const nameA = a.client?.client_nic_name || '';
          const nameB = b.client?.client_nic_name || '';
          return nameA.localeCompare(nameB);
        }
        default:
          return 0;
      }
    });

    return filtered;
  };

  const handleViewDetails = (challan: any) => {
    setSelectedChallan(challan);
    setShowDetailsModal(true);
  };

  const handleEdit = (challan: any) => {
    const challanNumber = activeTab === 'udhar'
      ? challan.udhar_challan_number
      : challan.jama_challan_number;

    navigate(`/${activeTab}-challan?edit=${challanNumber}`);
  };

  const handleDeleteClick = (challan: any) => {
    setDeletingChallan(challan);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingChallan) return;

    setIsDeleting(true);
    try {
      const items = deletingChallan.items?.[0] || {};
      const challanNumber = activeTab === 'udhar'
        ? deletingChallan.udhar_challan_number
        : deletingChallan.jama_challan_number;

      const result = activeTab === 'udhar'
        ? await deleteUdharChallan(challanNumber, items)
        : await deleteJamaChallan(challanNumber, items);

      if (result.success) {
        alert(t.challanDeleted);
        setShowDeleteDialog(false);
        setDeletingChallan(null);
        await loadChallans();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (err: any) {
      console.error('Error deleting challan:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const currentChallans = activeTab === 'udhar' ? udharChallans : jamaChallans;
  const filteredChallans = filterAndSortChallans(currentChallans, activeTab);

  const calculateTotalStockAdjustment = (challan: any) => {
    const items = challan.items?.[0] || {};
    let totalQty = 0;
    let totalBorrowed = 0;

    for (let size = 1; size <= 9; size++) {
      totalQty += items[`size_${size}_qty`] || 0;
      totalBorrowed += items[`size_${size}_borrowed`] || 0;
    }

    return { totalQty, totalBorrowed };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">
            {language === 'gu' ? 'લોડ થઈ રહ્યું છે...' : 'Loading...'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} />
          {t.backToDashboard}
        </button>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              {t.challanBook}
            </h1>
          </div>

          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('udhar')}
                className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                  activeTab === 'udhar'
                    ? 'bg-orange-50 text-orange-700 border-b-2 border-orange-600'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {t.udharChallans}
              </button>
              <button
                onClick={() => setActiveTab('jama')}
                className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                  activeTab === 'jama'
                    ? 'bg-green-50 text-green-700 border-b-2 border-green-600'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {t.jamaChallans}
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <SearchFilter
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              dateFrom={dateFrom}
              onDateFromChange={setDateFrom}
              dateTo={dateTo}
              onDateToChange={setDateTo}
              sortBy={sortBy}
              onSortChange={setSortBy}
              showFilters={showFilters}
              onToggleFilters={() => setShowFilters(!showFilters)}
            />

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {filteredChallans.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {t.noChallansFound}
              </div>
            ) : (
              <>
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                          {t.challanNumber}
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                          {t.date}
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                          {t.clientName}
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                          {t.site}
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                          {t.totalItems}
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                          {t.actions}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredChallans.map((challan) => {
                        const challanNumber = activeTab === 'udhar'
                          ? challan.udhar_challan_number
                          : challan.jama_challan_number;
                        const date = activeTab === 'udhar'
                          ? challan.udhar_date
                          : challan.jama_date;
                        const items = challan.items?.[0] || {};
                        const totalItems = calculateTotalItems(items);
                        const site = challan.alternative_site || challan.client?.site || '';

                        return (
                          <tr key={challanNumber} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-900 border-b">
                              {challanNumber}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 border-b">
                              {format(new Date(date), 'dd/MM/yyyy')}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 border-b">
                              {challan.client?.client_nic_name}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 border-b">
                              {site}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 border-b">
                              {totalItems} {t.pieces}
                            </td>
                            <td className="px-6 py-4 text-sm border-b">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleViewDetails(challan)}
                                  className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                                  title={t.viewDetails}
                                >
                                  <Eye size={16} />
                                  <span className="hidden lg:inline">{t.viewDetails}</span>
                                </button>
                                <button
                                  onClick={() => handleEdit(challan)}
                                  className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                                  title={t.edit}
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(challan)}
                                  className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                                  title={t.delete}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="md:hidden space-y-4">
                  {filteredChallans.map((challan) => (
                    <ChallanCard
                      key={activeTab === 'udhar' ? challan.udhar_challan_number : challan.jama_challan_number}
                      challan={challan}
                      type={activeTab}
                      onView={() => handleViewDetails(challan)}
                      onEdit={() => handleEdit(challan)}
                      onDelete={() => handleDeleteClick(challan)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <ChallanDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedChallan(null);
        }}
        onEdit={() => {
          setShowDetailsModal(false);
          handleEdit(selectedChallan);
        }}
        challan={selectedChallan}
        type={activeTab}
      />

      {deletingChallan && (
        <DeleteConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setDeletingChallan(null);
          }}
          onConfirm={handleDeleteConfirm}
          challanNumber={
            activeTab === 'udhar'
              ? deletingChallan.udhar_challan_number
              : deletingChallan.jama_challan_number
          }
          totalQty={calculateTotalStockAdjustment(deletingChallan).totalQty}
          totalBorrowed={calculateTotalStockAdjustment(deletingChallan).totalBorrowed}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};
