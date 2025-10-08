import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, FileText, FileCheck, LogOut, Package, BookOpen, Eye, Trash2, CreditCard as Edit, Download, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageToggle from '../components/LanguageToggle';
import ChallanDetailsModal from '../components/ChallanDetailsModal';
import ChallanEditModal from '../components/ChallanEditModal';
import { supabase } from '../utils/supabase';
import { generateJPEG } from '../utils/generateJPEG';
import { format } from 'date-fns';

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
}

type TabType = 'udhar' | 'jama';

const ChallanBook: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { t } = useLanguage();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const [activeTab, setActiveTab] = useState<TabType>('udhar');
  const [udharChallans, setUdharChallans] = useState<ChallanData[]>([]);
  const [jamaChallans, setJamaChallans] = useState<ChallanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChallan, setSelectedChallan] = useState<ChallanData | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadChallans();
  }, []);

  const calculateTotalItems = (items?: ItemsData | null): number => {
    const safeItems = items || emptyItems;
    let total = 0;
    for (let size = 1; size <= 9; size++) {
      const val = (safeItems[`size_${size}_qty` as keyof ItemsData] as unknown) as number;
      total += (val || 0);
    }
    return total;
  };

  const loadChallans = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchUdharChallans(), fetchJamaChallans()]);
    } catch (error) {
      console.error('Error loading challans:', error);
      alert('Error loading challans');
    } finally {
      setLoading(false);
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
          size_1_qty,
          size_2_qty,
          size_3_qty,
          size_4_qty,
          size_5_qty,
          size_6_qty,
          size_7_qty,
          size_8_qty,
          size_9_qty,
          size_1_borrowed,
          size_2_borrowed,
          size_3_borrowed,
          size_4_borrowed,
          size_5_borrowed,
          size_6_borrowed,
          size_7_borrowed,
          size_8_borrowed,
          size_9_borrowed,
          size_1_note,
          size_2_note,
          size_3_note,
          size_4_note,
          size_5_note,
          size_6_note,
          size_7_note,
          size_8_note,
          size_9_note,
          main_note
        )
      `)
      .order('udhar_date', { ascending: false });

    if (error) {
      console.error('Error fetching udhar challans:', error);
      return;
    }

  // Debug: show raw data returned by Supabase for troubleshooting
  console.debug('udhar raw data length:', (data || []).length, data);

  const transformedData = (data || []).map((challan: any) => {
    // allow items to be returned either as an array (items[0]) or a single object
    const rawItems = challan.items;
    const itemRow = Array.isArray(rawItems) ? (rawItems[0] || emptyItems) : (rawItems || emptyItems);
    // debug sample: show which shape we used for the first challan
    // console.debug('udhar item shape for', challan.udhar_challan_number, { isArray: Array.isArray(rawItems), itemRow });
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

  // Debug: show a preview of transformed data (first 3 items)
  console.debug('udhar transformed preview:', transformedData.slice(0, 3));

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
          size_1_qty,
          size_2_qty,
          size_3_qty,
          size_4_qty,
          size_5_qty,
          size_6_qty,
          size_7_qty,
          size_8_qty,
          size_9_qty,
          size_1_borrowed,
          size_2_borrowed,
          size_3_borrowed,
          size_4_borrowed,
          size_5_borrowed,
          size_6_borrowed,
          size_7_borrowed,
          size_8_borrowed,
          size_9_borrowed,
          size_1_note,
          size_2_note,
          size_3_note,
          size_4_note,
          size_5_note,
          size_6_note,
          size_7_note,
          size_8_note,
          size_9_note,
          main_note
        )
      `)
      .order('jama_date', { ascending: false });

    if (error) {
      console.error('Error fetching jama challans:', error);
      return;
    }

  // Debug: show raw data returned by Supabase for troubleshooting
  console.debug('jama raw data length:', (data || []).length, data);

  const transformedData = (data || []).map((challan: any) => {
    const rawItems = challan.items;
    const itemRow = Array.isArray(rawItems) ? (rawItems[0] || emptyItems) : (rawItems || emptyItems);
    // console.debug('jama item shape for', challan.jama_challan_number, { isArray: Array.isArray(rawItems), itemRow });
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

  // Debug: show a preview of transformed data (first 3 items)
  console.debug('jama transformed preview:', transformedData.slice(0, 3));

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
  };

  const handleDownloadJPEG = async (challan: ChallanData) => {
    try {
      await generateJPEG(activeTab, challan.challanNumber, challan.date);
    } catch (error) {
      console.error('Error generating JPEG:', error);
      alert('Error generating JPEG');
    }
  };

  const handleDelete = async (challan: ChallanData) => {
    const confirmed = window.confirm(
      `${t('confirmDelete')}\n\n${t('challanNumber')}: ${challan.challanNumber}\n${t('totalItems')}: ${challan.totalItems} ${t('pieces')}\n\n${t('deleteWarning')}`
    );

    if (!confirmed) return;

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

      if (error) throw error;

      if (data && typeof data === 'object' && 'success' in data) {
        if (data.success) {
          alert(t('challanDeleted'));
          loadChallans();
        } else {
          alert(`Error: ${data.message}`);
        }
      } else {
        alert(t('challanDeleted'));
        loadChallans();
      }
    } catch (error) {
      console.error('Error deleting challan:', error);
      alert('Error deleting challan');
    }
  };

  const currentChallans = activeTab === 'udhar' ? udharChallans : jamaChallans;
  const filteredChallans = currentChallans.filter((challan) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      challan.challanNumber.toLowerCase().includes(searchLower) ||
      challan.clientNicName.toLowerCase().includes(searchLower) ||
      challan.clientFullName.toLowerCase().includes(searchLower) ||
      challan.site.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="flex flex-col w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-gray-900">{t('appName')}</h1>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center w-full gap-3 px-4 py-3 text-gray-700 transition-colors rounded-lg hover:bg-gray-50"
            >
              <span>{t('dashboard')}</span>
            </button>
            <button
              onClick={() => navigate('/clients')}
              className="flex items-center w-full gap-3 px-4 py-3 text-gray-700 transition-colors rounded-lg hover:bg-blue-50 hover:text-blue-600"
            >
              <UserPlus size={20} />
              <span>{t('addClient')}</span>
            </button>
            <button
              onClick={() => navigate('/udhar-challan')}
              className="flex items-center w-full gap-3 px-4 py-3 text-gray-700 transition-colors rounded-lg hover:bg-red-50 hover:text-red-600"
            >
              <FileText size={20} />
              <span>{t('udharChallan')}</span>
            </button>
            <button
              onClick={() => navigate('/jama-challan')}
              className="flex items-center w-full gap-3 px-4 py-3 text-gray-700 transition-colors rounded-lg hover:bg-green-50 hover:text-green-600"
            >
              <FileCheck size={20} />
              <span>{t('jamaChallan')}</span>
            </button>
            <button
              onClick={() => navigate('/challan-book')}
              className="flex items-center w-full gap-3 px-4 py-3 text-gray-900 bg-gray-100 border-l-4 border-gray-600 rounded-lg"
            >
              <BookOpen size={20} />
              <span>{t('challanBook')}</span>
            </button>
            <button
              onClick={() => navigate('/stock')}
              className="flex items-center w-full gap-3 px-4 py-3 text-gray-700 transition-colors rounded-lg hover:bg-gray-50 hover:text-gray-600"
            >
              <Package size={20} />
              <span>{t('stockManagement')}</span>
            </button>
            <button
              onClick={() => navigate('/client-ledger')}
              className="flex items-center w-full gap-3 px-4 py-3 transition-colors rounded-lg bg-amber-50 text-amber-600"
            >
              <Users size={20} />
              <span>{t('clientLedger')}</span>
            </button>
          </div>
        </nav>

        <div className="p-4 space-y-4 border-t">
          <div className="flex justify-center">
            <LanguageToggle />
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full gap-2 px-4 py-3 text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
          >
            <LogOut size={20} />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <h2 className="mb-8 text-3xl font-bold text-gray-900">{t('challanBook')}</h2>

          <div className="mb-6 bg-white rounded-lg shadow-md">
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('udhar')}
                  className={`flex-1 py-4 px-6 text-center font-medium ${
                    activeTab === 'udhar'
                      ? 'border-b-2 border-red-600 text-red-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {t('udharChallans')}
                </button>
                <button
                  onClick={() => setActiveTab('jama')}
                  className={`flex-1 py-4 px-6 text-center font-medium ${
                    activeTab === 'jama'
                      ? 'border-b-2 border-green-600 text-green-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {t('jamaChallans')}
                </button>
              </nav>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <input
                  type="text"
                  placeholder={t('searchChallan')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {loading ? (
                <div className="py-12 text-center">
                  <p className="text-gray-600">Loading challans...</p>
                </div>
              ) : filteredChallans.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-gray-600">{t('noChallansFound')}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          {t('challanNumber')}
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          {t('date')}
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          {t('clientName')}
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          {t('site')}
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          {t('phone')}
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          {t('totalItems')}
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          {t('actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredChallans.map((challan) => (
                        <tr key={challan.challanNumber} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                            {challan.challanNumber}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                            {challan.date ? format(new Date(challan.date), 'dd/MM/yyyy') : 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div>
                              <div className="font-medium">{challan.clientNicName}</div>
                              <div className="text-xs text-gray-500">{challan.clientFullName}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {challan.site}
                            {challan.isAlternativeSite && (
                              <span className="px-2 py-1 ml-2 text-xs text-blue-800 bg-blue-200 rounded">
                                {t('alternative')}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                            {challan.phone}
                            {challan.isSecondaryPhone && (
                              <span className="px-2 py-1 ml-2 text-xs text-blue-800 bg-blue-200 rounded">
                                {t('alternative')}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                            {challan.totalItems} {t('pieces')}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleViewDetails(challan)}
                                className="p-2 text-blue-600 transition-colors rounded hover:bg-blue-50 hover:text-blue-800"
                                title={t('viewDetails')}
                              >
                                <Eye size={18} />
                              </button>
                              <button
                                onClick={() => handleEdit(challan)}
                                className="p-2 text-yellow-600 transition-colors rounded hover:bg-yellow-50 hover:text-yellow-800"
                                title={t('edit')}
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleDownloadJPEG(challan)}
                                className="p-2 text-green-600 transition-colors rounded hover:bg-green-50 hover:text-green-800"
                                title="Download JPEG"
                              >
                                <Download size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(challan)}
                                className="p-2 text-red-600 transition-colors rounded hover:bg-red-50 hover:text-red-800"
                                title={t('delete')}
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
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
