import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Search } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../utils/supabase';
import { format } from 'date-fns';
import ReceiptTemplate from '../components/ReceiptTemplate';
import { generateJPEG } from '../utils/generateJPEG';

interface Client {
  id: string;
  client_nic_name: string;
  client_name: string;
  site: string;
}

interface LedgerEntry {
  date: string;
  challanNumber: string;
  type: 'udhar' | 'jama';
  site: string;
  driver: string;
  items: {
    size_1_qty: number;
    size_1_borrowed: number;
    size_2_qty: number;
    size_2_borrowed: number;
    size_3_qty: number;
    size_3_borrowed: number;
    size_4_qty: number;
    size_4_borrowed: number;
    size_5_qty: number;
    size_5_borrowed: number;
    size_6_qty: number;
    size_6_borrowed: number;
    size_7_qty: number;
    size_7_borrowed: number;
    size_8_qty: number;
    size_8_borrowed: number;
    size_9_qty: number;
    size_9_borrowed: number;
    main_note?: string;
  };
  client: {
    client_nic_name: string;
    client_name: string;
    site: string;
    primary_phone?: string;
  };
}

const calculateGrandTotal = (items: LedgerEntry['items']) => {
  let totalQty = 0;
  let totalBorrowed = 0;

  for (let size = 1; size <= 9; size++) {
    totalQty += items[`size_${size}_qty` as keyof typeof items] || 0;
    totalBorrowed += items[`size_${size}_borrowed` as keyof typeof items] || 0;
  }

  return {
    qty: totalQty,
    borrowed: totalBorrowed,
    total: totalQty + totalBorrowed
  };
};

const formatSizeDisplay = (qty: number, borrowed: number) => {
  if (qty === 0 && borrowed === 0) {
    return '-';
  }
  return `${qty}+${borrowed}`;
};

const ClientLedger: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [ledgerData, setLedgerData] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [receiptData, setReceiptData] = useState<any>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    const { data, error } = await supabase
      .from('clients')
      .select('id, client_nic_name, client_name, site')
      .order('client_name');

    if (data) setClients(data);
    if (error) console.error('Error fetching clients:', error);
  };

  const fetchClientLedger = async (clientId: string) => {
    try {
      const { data: udharData, error: udharError } = await supabase
        .from('udhar_challans')
        .select(`
          udhar_challan_number,
          udhar_date,
          alternative_site,
          driver_name,
          client:clients!udhar_challans_client_id_fkey (
            client_nic_name,
            client_name,
            site,
            primary_phone
          ),
          items:udhar_items!udhar_items_udhar_challan_number_fkey (
            size_1_qty, size_1_borrowed,
            size_2_qty, size_2_borrowed,
            size_3_qty, size_3_borrowed,
            size_4_qty, size_4_borrowed,
            size_5_qty, size_5_borrowed,
            size_6_qty, size_6_borrowed,
            size_7_qty, size_7_borrowed,
            size_8_qty, size_8_borrowed,
            size_9_qty, size_9_borrowed,
            main_note
          )
        `)
        .eq('client_id', clientId);

      if (udharError) throw udharError;

      const { data: jamaData, error: jamaError } = await supabase
        .from('jama_challans')
        .select(`
          jama_challan_number,
          jama_date,
          alternative_site,
          driver_name,
          client:clients!jama_challans_client_id_fkey (
            client_nic_name,
            client_name,
            site,
            primary_phone
          ),
          items:jama_items!jama_items_jama_challan_number_fkey (
            size_1_qty, size_1_borrowed,
            size_2_qty, size_2_borrowed,
            size_3_qty, size_3_borrowed,
            size_4_qty, size_4_borrowed,
            size_5_qty, size_5_borrowed,
            size_6_qty, size_6_borrowed,
            size_7_qty, size_7_borrowed,
            size_8_qty, size_8_borrowed,
            size_9_qty, size_9_borrowed,
            main_note
          )
        `)
        .eq('client_id', clientId);

      if (jamaError) throw jamaError;

      const udharTransformed: LedgerEntry[] = (udharData || []).map((challan: any) => ({
        date: challan.udhar_date,
        challanNumber: challan.udhar_challan_number,
        type: 'udhar' as const,
        site: challan.alternative_site || challan.client.site,
        driver: challan.driver_name || '-',
        items: challan.items[0] || {},
        client: challan.client
      }));

      const jamaTransformed: LedgerEntry[] = (jamaData || []).map((challan: any) => ({
        date: challan.jama_date,
        challanNumber: challan.jama_challan_number,
        type: 'jama' as const,
        site: challan.alternative_site || challan.client.site,
        driver: challan.driver_name || '-',
        items: challan.items[0] || {},
        client: challan.client
      }));

      const combined = [...udharTransformed, ...jamaTransformed].sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });

      return { data: combined, error: null };
    } catch (error) {
      console.error('Error fetching client ledger:', error);
      return { data: null, error };
    }
  };

  const handleClientSelect = async (client: Client) => {
    setSelectedClient(client);
    setLoading(true);

    const { data, error } = await fetchClientLedger(client.id);

    if (data) {
      setLedgerData(data);
    }
    setLoading(false);
  };

  const handleDownloadChallan = async (entry: LedgerEntry) => {
    setReceiptData({
      challanType: entry.type,
      challanNumber: entry.challanNumber,
      date: entry.date,
      client: entry.client,
      site: entry.site,
      driver: entry.driver,
      items: entry.items
    });

    setTimeout(async () => {
      try {
        await generateJPEG(
          entry.type,
          entry.challanNumber,
          format(new Date(entry.date), 'dd-MM-yyyy')
        );
      } catch (error) {
        console.error('Error generating JPEG:', error);
        alert('Error generating receipt');
      } finally {
        setReceiptData(null);
      }
    }, 100);
  };

  const filteredClients = clients.filter(client =>
    client.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.client_nic_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeBadge = (type: 'udhar' | 'jama') => {
    if (type === 'udhar') {
      return (
        <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-700 font-medium whitespace-nowrap">
          {t('udhar')} / ઉધાર
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700 font-medium whitespace-nowrap">
          {t('jama')} / જમા
        </span>
      );
    }
  };

  const calculateSizeTotal = (size: number): number => {
    return ledgerData.reduce((sum, entry) => {
      const qty = entry.items[`size_${size}_qty` as keyof typeof entry.items] || 0;
      const borrowed = entry.items[`size_${size}_borrowed` as keyof typeof entry.items] || 0;
      return sum + qty + borrowed;
    }, 0);
  };

  const calculateOverallTotal = (): number => {
    return ledgerData.reduce((sum, entry) => {
      const gt = calculateGrandTotal(entry.items);
      return sum + gt.total;
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={20} />
              <span>{t('backToDashboard')}</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900">
              {t('clientLedger')} / ક્લાયન્ટ લેજર
            </h1>
            <div className="w-32"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('selectClient')} / ક્લાયન્ટ પસંદ કરો
          </label>

          <div className="relative mb-3 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            onChange={(e) => {
              const client = clients.find(c => c.id === e.target.value);
              if (client) handleClientSelect(client);
            }}
            value={selectedClient?.id || ''}
            className="max-w-md w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">-- {t('selectClient')} --</option>
            {filteredClients.map(client => (
              <option key={client.id} value={client.id}>
                {client.client_name} ({client.client_nic_name})
              </option>
            ))}
          </select>
        </div>

        {selectedClient && !loading && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h2 className="text-xl font-semibold text-blue-900">
              {selectedClient.client_name} ({selectedClient.client_nic_name})
            </h2>
            <p className="text-sm text-blue-700 mt-1">
              {t('totalTransactions')}: {ledgerData.length}
            </p>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="text-xl text-gray-600">{t('loading')}...</div>
          </div>
        )}

        {!loading && selectedClient && ledgerData.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500 text-lg">{t('noTransactionsFound')}</p>
          </div>
        )}

        {!loading && selectedClient && ledgerData.length > 0 && (
          <>
            <div className="hidden lg:block bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        {t('date')}<br/>તારીખ
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        {t('challanNumber')}<br/>ચલણ નંબર
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        {t('type')}<br/>પ્રકાર
                      </th>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(size => (
                        <th key={size} className="px-2 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Size {size}
                        </th>
                      ))}
                      <th className="px-3 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                        {t('grandTotal')}<br/>કુલ
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        {t('site')}<br/>સાઇટ
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        {t('driver')}<br/>ડ્રાઇવર
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                        {t('download')}<br/>ડાઉનલોડ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {ledgerData.map((entry, index) => {
                      const grandTotal = calculateGrandTotal(entry.items);

                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                            {format(new Date(entry.date), 'dd/MM/yyyy')}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {entry.challanNumber}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm">
                            {getTypeBadge(entry.type)}
                          </td>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(size => (
                            <td key={size} className="px-2 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                              {formatSizeDisplay(
                                entry.items[`size_${size}_qty` as keyof typeof entry.items] || 0,
                                entry.items[`size_${size}_borrowed` as keyof typeof entry.items] || 0
                              )}
                            </td>
                          ))}
                          <td className="px-3 py-4 whitespace-nowrap text-sm font-semibold text-blue-600 text-center">
                            {grandTotal.qty}+{grandTotal.borrowed}={grandTotal.total}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-900">
                            {entry.site}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-900">
                            {entry.driver}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-center">
                            <button
                              onClick={() => handleDownloadChallan(entry)}
                              className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                              title={t('downloadJPEG')}
                            >
                              <Download size={18} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-gray-100 font-bold">
                    <tr>
                      <td colSpan={3} className="px-3 py-4 text-right text-sm text-gray-900">
                        {t('totalTransactions')} / કુલ ટ્રાન્ઝેક્શન:
                      </td>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(size => (
                        <td key={size} className="px-2 py-4 text-center text-sm text-gray-900">
                          {calculateSizeTotal(size)}
                        </td>
                      ))}
                      <td className="px-3 py-4 text-center text-sm text-blue-700">
                        {calculateOverallTotal()}
                      </td>
                      <td colSpan={3}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="lg:hidden space-y-4">
              {ledgerData.map((entry, index) => {
                const grandTotal = calculateGrandTotal(entry.items);

                return (
                  <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {format(new Date(entry.date), 'dd/MM/yyyy')}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">{entry.challanNumber}</div>
                      </div>
                      {getTypeBadge(entry.type)}
                    </div>

                    <div className="px-4 py-3">
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(size => {
                          const display = formatSizeDisplay(
                            entry.items[`size_${size}_qty` as keyof typeof entry.items] || 0,
                            entry.items[`size_${size}_borrowed` as keyof typeof entry.items] || 0
                          );
                          if (display === '-') return null;
                          return (
                            <div key={size} className="text-sm">
                              <span className="text-gray-600">Size {size}:</span>{' '}
                              <span className="font-medium text-gray-900">{display}</span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="border-t pt-3 mb-3">
                        <div className="text-sm font-semibold text-blue-600">
                          {t('grandTotal')}: {grandTotal.qty}+{grandTotal.borrowed} = {grandTotal.total} {t('pieces')}
                        </div>
                      </div>

                      <div className="space-y-1 text-sm mb-3">
                        <div>
                          <span className="text-gray-600">{t('site')}:</span>{' '}
                          <span className="text-gray-900">{entry.site}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">{t('driver')}:</span>{' '}
                          <span className="text-gray-900">{entry.driver}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDownloadChallan(entry)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Download size={18} />
                        {t('downloadJPEG')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {!selectedClient && !loading && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500 text-lg">
              {t('selectClientToViewLedger')}
            </p>
          </div>
        )}
      </div>

      {receiptData && (
        <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
          <ReceiptTemplate
            challanType={receiptData.challanType}
            challanNumber={receiptData.challanNumber}
            date={receiptData.date}
            client={receiptData.client}
            site={receiptData.site}
            driver={receiptData.driver}
            items={receiptData.items}
          />
        </div>
      )}
    </div>
  );
};

export default ClientLedger;
