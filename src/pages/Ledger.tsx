import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../utils/supabase';
import ClientSearchSelect from '../components/ClientSearchSelect';
import LedgerSummary from '../components/LedgerSummary';
import LedgerTable from '../components/LedgerTable';
import ReceiptTemplate from '../components/ReceiptTemplate';
import { generateJPEG } from '../utils/generateJPEG';

interface Client {
  id: string;
  client_nic_name: string;
  client_full_name: string;
  primary_phone: string;
  site: string;
}

interface UdharChallan {
  id: string;
  challan_number: string;
  udhar_date: string;
  driver_name: string;
  alternative_site?: string;
  client_id: string;
  udhar_items: {
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
  }[];
}

interface JamaChallan {
  id: string;
  challan_number: string;
  jama_date: string;
  driver_name: string;
  alternative_site?: string;
  client_id: string;
  jama_items: {
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
  }[];
}

interface LedgerItem {
  id: string;
  challan_number: string;
  date: string;
  type: 'udhar' | 'jama';
  driver_name: string;
  alternative_site?: string;
  site: string;
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
  };
  grandTotal: number;
  fullChallan?: UdharChallan | JamaChallan;
}

export default function Ledger() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(false);
  const [ledgerItems, setLedgerItems] = useState<LedgerItem[]>([]);
  const [totalUdhar, setTotalUdhar] = useState(0);
  const [totalJama, setTotalJama] = useState(0);
  const [netOutstanding, setNetOutstanding] = useState(0);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    if (selectedClient) {
      fetchLedgerData(selectedClient.id);
    } else {
      setLedgerItems([]);
      setTotalUdhar(0);
      setTotalJama(0);
      setNetOutstanding(0);
    }
  }, [selectedClient]);

  const calculateGrandTotal = (items: any): number => {
    let total = 0;
    for (let i = 1; i <= 9; i++) {
      total += (items[`size_${i}_qty`] || 0) + (items[`size_${i}_borrowed`] || 0);
    }
    return total;
  };

  const fetchLedgerData = async (clientId: string) => {
    setLoading(true);
    try {
      const [udharResponse, jamaResponse] = await Promise.all([
        supabase
          .from('udhar_challans')
          .select(`
            *,
            udhar_items(*)
          `)
          .eq('client_id', clientId)
          .order('udhar_date', { ascending: true }),
        supabase
          .from('jama_challans')
          .select(`
            *,
            jama_items(*)
          `)
          .eq('client_id', clientId)
          .order('jama_date', { ascending: true })
      ]);

      if (udharResponse.error) throw udharResponse.error;
      if (jamaResponse.error) throw jamaResponse.error;

      const udharData = udharResponse.data as UdharChallan[];
      const jamaData = jamaResponse.data as JamaChallan[];

      const udharItems: LedgerItem[] = udharData.map((challan) => {
        const items = challan.udhar_items[0];
        return {
          id: challan.id,
          challan_number: challan.challan_number,
          date: challan.udhar_date,
          type: 'udhar' as const,
          driver_name: challan.driver_name,
          alternative_site: challan.alternative_site,
          site: selectedClient!.site,
          items,
          grandTotal: calculateGrandTotal(items),
          fullChallan: challan
        };
      });

      const jamaItems: LedgerItem[] = jamaData.map((challan) => {
        const items = challan.jama_items[0];
        return {
          id: challan.id,
          challan_number: challan.challan_number,
          date: challan.jama_date,
          type: 'jama' as const,
          driver_name: challan.driver_name,
          alternative_site: challan.alternative_site,
          site: selectedClient!.site,
          items,
          grandTotal: calculateGrandTotal(items),
          fullChallan: challan
        };
      });

      const allItems = [...udharItems, ...jamaItems].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      setLedgerItems(allItems);

      const udharTotal = udharItems.reduce((sum, item) => sum + item.grandTotal, 0);
      const jamaTotal = jamaItems.reduce((sum, item) => sum + item.grandTotal, 0);

      setTotalUdhar(udharTotal);
      setTotalJama(jamaTotal);
      setNetOutstanding(udharTotal - jamaTotal);
    } catch (error) {
      console.error('Error fetching ledger data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (item: LedgerItem) => {
    if (!selectedClient) return;

    const challanData = {
      client: {
        client_nic_name: selectedClient.client_nic_name,
        client_full_name: selectedClient.client_full_name,
        primary_phone: selectedClient.primary_phone,
        site: item.alternative_site || selectedClient.site,
      },
      challan: {
        challan_number: item.challan_number,
        date: item.date,
        driver_name: item.driver_name,
      },
      items: [item.items],
    };

    setReceiptData(challanData);
    setShowReceipt(true);

    setTimeout(async () => {
      try {
        await generateJPEG(
          item.type,
          item.challan_number,
          new Date(item.date).toLocaleDateString('en-GB').replace(/\//g, '-')
        );
      } catch (error) {
        console.error('Error downloading receipt:', error);
      } finally {
        setShowReceipt(false);
        setReceiptData(null);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              {t('backToDashboard')}
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{t('clientLedger')}</h1>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <ClientSearchSelect onClientSelect={setSelectedClient} />
        </div>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          </div>
        )}

        {!loading && selectedClient && (
          <>
            <LedgerSummary
              totalUdhar={totalUdhar}
              totalJama={totalJama}
              netOutstanding={netOutstanding}
            />

            <LedgerTable items={ledgerItems} onDownload={handleDownload} />
          </>
        )}

        {!loading && !selectedClient && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500">{t('selectClient')}</p>
          </div>
        )}
      </div>

      {showReceipt && receiptData && (
        <div className="fixed inset-0 pointer-events-none opacity-0">
          <ReceiptTemplate
            clientName={receiptData.client.client_nic_name}
            clientFullName={receiptData.client.client_full_name}
            site={receiptData.client.site}
            phone={receiptData.client.primary_phone}
            challanNumber={receiptData.challan.challan_number}
            date={receiptData.challan.date}
            driverName={receiptData.challan.driver_name}
            items={receiptData.items}
            challanType={ledgerItems.find(i => i.challan_number === receiptData.challan.challan_number)?.type || 'udhar'}
          />
        </div>
      )}
    </div>
  );
}
