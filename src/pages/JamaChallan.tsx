import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Search } from 'lucide-react';
import ClientForm from '../components/ClientForm';
import ItemsTable, { ItemsData } from '../components/ItemsTable';
import ReceiptTemplate from '../components/ReceiptTemplate';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../utils/supabase';
import { generateJPEG } from '../utils/generateJPEG';
import Navbar from '../components/Navbar';

interface ClientFormData {
  id?: string;
  client_nic_name: string;
  client_name: string;
  site: string;
  primary_phone_number: string;
}

type Step = 'client-selection' | 'challan-details';

interface ClientSelectionStepProps {
  clients: ClientFormData[];
  onClientSelect: (clientId: string) => void;
  onAddNewClick: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const ClientSelectionStep: React.FC<ClientSelectionStepProps> = ({
  clients,
  onClientSelect,
  onAddNewClick,
  searchQuery,
  onSearchChange,
}) => {
  const { t } = useLanguage();
  const filteredClients = clients.filter(client => 
    client.client_nic_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.site.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.primary_phone_number.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">{t('selectClient')}</h3>
        <button
          onClick={onAddNewClick}
          className="px-4 py-2 font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
        >
          + {t('addNewClient')}
        </button>
      </div>

      {/* Search Box */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="block w-full py-2 pl-10 pr-3 leading-5 placeholder-gray-500 bg-white border border-gray-300 rounded-md focus:outline-none focus:placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
          placeholder={t('searchClients')}
        />
      </div>

      {/* Clients List */}
      <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
        {filteredClients.length === 0 ? (
          <p className="py-4 text-center text-gray-500">{t('noMatchingClients')}</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredClients.map((client) => (
              <button
                key={client.id}
                onClick={() => onClientSelect(client.id!)}
                className="p-4 text-left transition-shadow bg-white border border-gray-200 rounded-lg shadow hover:shadow-md hover:border-blue-500"
              >
                <h4 className="text-lg font-semibold text-gray-900">{client.client_nic_name}</h4>
                <p className="text-gray-600">{client.client_name}</p>
                <div className="mt-2 text-sm text-gray-500">
                  <p>{t('site')}: {client.site}</p>
                  <p>{t('phone')}: {client.primary_phone_number}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const JamaChallan: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Step management
  const [step, setStep] = useState<Step>('client-selection');
  const [searchQuery, setSearchQuery] = useState('');
  const [clients, setClients] = useState<ClientFormData[]>([]);
  const [showAddClient, setShowAddClient] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientFormData | null>(null);
  
  // Form states
  const [challanNumber, setChallanNumber] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [driverName, setDriverName] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const [items, setItems] = useState<ItemsData>({
    size_1_qty: 0, size_2_qty: 0, size_3_qty: 0, size_4_qty: 0, size_5_qty: 0,
    size_6_qty: 0, size_7_qty: 0, size_8_qty: 0, size_9_qty: 0,
    size_1_borrowed: 0, size_2_borrowed: 0, size_3_borrowed: 0, size_4_borrowed: 0, size_5_borrowed: 0,
    size_6_borrowed: 0, size_7_borrowed: 0, size_8_borrowed: 0, size_9_borrowed: 0,
    size_1_note: '', size_2_note: '', size_3_note: '', size_4_note: '', size_5_note: '',
    size_6_note: '', size_7_note: '', size_8_note: '', size_9_note: '',
    main_note: '',
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('client_nic_name');

    if (error) {
      console.error('Error fetching clients:', error);
    } else {
      setClients(data || []);
    }
  };

  const handleAddNewClick = () => {
    setShowAddClient(true);
  };

  const handleClientSelect = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setSelectedClient(client);
      setStep('challan-details');
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleQuickAddClient = async (clientData: ClientFormData) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([clientData])
        .select()
        .single();

      if (error) throw error;

      alert(t('saveSuccess'));
      setShowAddClient(false);
      await fetchClients();

      if (data) {
        handleClientSelect(data.id!);
      }
    } catch (error) {
      console.error('Error adding client:', error);
      alert(t('requiredField'));
    }
  };

const handleSave = async () => {
    const newErrors: { [key: string]: string } = {};
    let hasErrors = false;

    if (!selectedClient) {
      newErrors.client = t('requiredField');
      hasErrors = true;
    }

    if (!challanNumber) {
      newErrors.challanNumber = t('requiredField');
      hasErrors = true;
    }

    if (!date) {
      newErrors.date = t('requiredField');
      hasErrors = true;
    }

    // Check if any quantities are filled
    const hasQuantities = Object.entries(items)
      .filter(([key]) => key.includes('_qty'))
      .some(([_, value]) => value > 0);

    if (!hasQuantities) {
      newErrors.items = t('requiredField');
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    try {
      if (!selectedClient?.id) return;

      const { error } = await supabase.from('jama_challans').insert([
        {
          challan_number: challanNumber,
          client_id: selectedClient.id,
          jama_date: date,
          driver_name: driverName,
          ...items,
        },
      ]);

      if (error) throw error;

      setShowSuccess(true);
      generateJPEG("jama", challanNumber, date);
    } catch (error) {
      console.error('Error saving challan:', error);
      alert(t('requiredField'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex">
        <div className="w-64" /> {/* Spacer for navbar */}
        <main className="flex-1 p-8">
          <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            <h2 className="mb-8 text-3xl font-bold text-gray-900">{t('jamaChallan')}</h2>

            {step === 'client-selection' ? (
              <>
                {showAddClient ? (
                  <div className="p-6 bg-white rounded-lg shadow">
                    <h3 className="mb-4 text-xl font-semibold text-gray-900">{t('addNewClient')}</h3>
                    <ClientForm 
                      onSubmit={handleQuickAddClient}
                      onCancel={() => setShowAddClient(false)}
                    />
                  </div>
                ) : (
                  <ClientSelectionStep
                    clients={clients}
                    onClientSelect={handleClientSelect}
                    onAddNewClick={handleAddNewClick}
                    searchQuery={searchQuery}
                    onSearchChange={handleSearchChange}
                  />
                )}
              </>
            ) : (
              <div className="space-y-6">
                <div className="p-6 bg-white rounded-lg shadow">
                  <h3 className="mb-4 text-xl font-semibold text-gray-900">{t('clientDetails')}</h3>
                  {selectedClient && (
                    <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">
                      <div>
                        <p className="font-medium">{selectedClient.client_nic_name}</p>
                        <p className="text-gray-600">{selectedClient.site}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">{selectedClient.primary_phone_number}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6 bg-white rounded-lg shadow">
                  <h3 className="mb-4 text-xl font-semibold text-gray-900">{t('challanDetails')}</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        {t('challanNumber')}
                      </label>
                      <input
                        type="text"
                        value={challanNumber}
                        onChange={(e) => setChallanNumber(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
                      />
                      {errors.challanNumber && (
                        <p className="mt-1 text-sm text-red-600">{errors.challanNumber}</p>
                      )}
                    </div>

                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        {t('date')}
                      </label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
                      />
                      {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
                    </div>

                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        {t('driverName')}
                      </label>
                      <input
                        type="text"
                        value={driverName}
                        onChange={(e) => setDriverName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white rounded-lg shadow">
                  <h3 className="mb-4 text-xl font-semibold text-gray-900">{t('items')}</h3>
                  {errors.items && <p className="mb-4 text-sm text-red-600">{errors.items}</p>}
                  <ItemsTable items={items} onChange={setItems} />
                </div>

                {showSuccess ? (
                  <div className="space-y-6">
                    <div className="px-6 py-4 text-center text-green-700 bg-green-100 border border-green-400 rounded-lg">
                      <p className="text-lg font-semibold">{t('challanSaved')}</p>
                    </div>
                    <div className="flex justify-center">
                      <button
                        onClick={() => navigate('/dashboard')}
                        className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg min-h-[44px]"
                      >
                        {t('backToDashboard')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <button
                      onClick={handleSave}
                      className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg min-h-[44px]"
                    >
                      {t('save')}
                    </button>
                  </div>
                )}

                <div style={{ position: 'absolute', left: '-9999px' }}>
                  {selectedClient && (
                    <ReceiptTemplate
                      challanType="jama"
                      challanNumber={challanNumber}
                      date={date}
                      clientName={selectedClient.client_name}
                      site={selectedClient.site}
                      phone={selectedClient.primary_phone_number}
                      driverName={driverName}
                      items={items}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default JamaChallan;