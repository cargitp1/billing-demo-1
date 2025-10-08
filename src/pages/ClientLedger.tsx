import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../utils/supabase';
import { format } from 'date-fns';
import ReceiptTemplate from '../components/ReceiptTemplate';
import { generateJPEG } from '../utils/generateJPEG';
import ClientSearchSelect from '../components/ClientSearchSelect';
import LedgerSummary from '../components/LedgerSummary';
import LedgerTable from '../components/LedgerTable';

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
        <div className="mb-6">
          <ClientSearchSelect
            clients={clients}
            selectedClient={selectedClient}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onClientSelect={handleClientSelect}
          />
        </div>

        {selectedClient && !loading && (
          <div className="mb-6">
            <LedgerSummary client={selectedClient} transactionCount={ledgerData.length} />
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="text-xl text-gray-600">{t('loading')}...</div>
          </div>
        )}

        {!loading && selectedClient && (
          <LedgerTable ledgerData={ledgerData} onDownloadChallan={handleDownloadChallan} />
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
