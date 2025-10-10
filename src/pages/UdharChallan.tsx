import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ClientForm, { ClientFormData } from '../components/ClientForm';
import ItemsTable, { ItemsData } from '../components/ItemsTable';
import ReceiptTemplate from '../components/ReceiptTemplate';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../utils/supabase';
import { generateJPEG } from '../utils/generateJPEG';
import Navbar from '../components/Navbar';

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
          placeholder={t('searchClients')}
          className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Client Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredClients.map((client) => (
          <button
            key={client.id}
            onClick={() => onClientSelect(client.id)}
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
    </div>
  );
};

interface ChallanDetailsStepProps {
  selectedClient: ClientFormData;
  onBack: () => void;
  onSave: () => void;
  challanNumber: string;
  setChallanNumber: (value: string) => void;
  date: string;
  setDate: (value: string) => void;
  driverName: string;
  setDriverName: (value: string) => void;
  alternativeSite: string;
  setAlternativeSite: (value: string) => void;
  secondaryPhone: string;
  setSecondaryPhone: (value: string) => void;
  items: ItemsData;
  setItems: (items: ItemsData) => void;
  errors: { [key: string]: string };
  showSuccess: boolean;
}

const ChallanDetailsStep: React.FC<ChallanDetailsStepProps> = ({
  selectedClient,
  onBack,
  onSave,
  challanNumber,
  setChallanNumber,
  date,
  setDate,
  driverName,
  setDriverName,
  alternativeSite,
  setAlternativeSite,
  secondaryPhone,
  setSecondaryPhone,
  items,
  setItems,
  errors,
  showSuccess
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Client Info Display */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-600 hover:text-gray-900"
        >
          ← {t('back')}
        </button>
        <h3 className="text-xl font-semibold text-gray-900">{t('challanDetails')}</h3>
      </div>

      <div className="p-4 rounded-lg bg-gray-50">
        <h4 className="font-medium text-gray-900">{selectedClient.client_nic_name}</h4>
        <p className="text-gray-600">{selectedClient.client_name}</p>
        <div className="mt-2 text-sm text-gray-500">
          <p>{t('site')}: {selectedClient.site}</p>
          <p>{t('phone')}: {selectedClient.primary_phone_number}</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Alternative Site and Secondary Phone */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">{t('overrideDetails')}</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                {t('alternativeSite')}
              </label>
              <input
                type="text"
                value={alternativeSite}
                onChange={(e) => setAlternativeSite(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                {t('secondaryPhone')}
              </label>
              <input
                type="text"
                value={secondaryPhone}
                onChange={(e) => setSecondaryPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Challan Details */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">{t('basicDetails')}</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                {t('challanNumber')} *
              </label>
              <input
                type="text"
                value={challanNumber}
                onChange={(e) => setChallanNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.challanNumber && <p className="mt-1 text-sm text-red-600">{errors.challanNumber}</p>}
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                {t('date')} *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">{t('itemsDetails')}</h3>
          {errors.items && <p className="mb-4 text-sm text-red-600">{errors.items}</p>}
          <ItemsTable items={items} onChange={setItems} />
        </div>

        {/* Save or Success */}
        {showSuccess ? (
          <div className="space-y-6">
            <div className="px-6 py-4 text-center text-green-700 bg-green-100 border border-green-400 rounded-lg">
              <p className="text-lg font-semibold">{t('challanSaved')}</p>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-8 py-4 text-lg font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                {t('backToDashboard')}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={onSave}
              className="px-8 py-4 text-lg font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              {t('save')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const UdharChallan: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Step management
  const [currentStep, setCurrentStep] = useState<Step>('client-selection');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Client management
  const [clients, setClients] = useState<ClientFormData[]>([]);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  
  // Challan details
  const [challanNumber, setChallanNumber] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [driverName, setDriverName] = useState('');
  const [alternativeSite, setAlternativeSite] = useState('');
  const [secondaryPhone, setSecondaryPhone] = useState('');
  const [items, setItems] = useState<ItemsData>({
    size_1_qty: 0, size_2_qty: 0, size_3_qty: 0, size_4_qty: 0, size_5_qty: 0,
    size_6_qty: 0, size_7_qty: 0, size_8_qty: 0, size_9_qty: 0,
    size_1_borrowed: 0, size_2_borrowed: 0, size_3_borrowed: 0, size_4_borrowed: 0, size_5_borrowed: 0,
    size_6_borrowed: 0, size_7_borrowed: 0, size_8_borrowed: 0, size_9_borrowed: 0,
    size_1_note: '', size_2_note: '', size_3_note: '', size_4_note: '', size_5_note: '',
    size_6_note: '', size_7_note: '', size_8_note: '', size_9_note: '',
    main_note: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showSuccess, setShowSuccess] = useState(false);

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

  const handleQuickAddClient = async (clientData: ClientFormData) => {
    const { data, error } = await supabase
      .from('clients')
      .insert({
        client_nic_name: clientData.client_nic_name,
        client_name: clientData.client_name,
        site: clientData.site,
        primary_phone_number: clientData.primary_phone_number,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating client:', error);
      alert('Error creating client');
    } else {
      alert(t('saveSuccess'));
      setShowQuickAdd(false);
      await fetchClients();
      if (data) {
        setSelectedClientId(data.id);
      }
    }
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!challanNumber) {
      newErrors.challanNumber = t('requiredField');
    }
    if (!date) {
      newErrors.date = t('requiredField');
    }
    if (!selectedClientId) {
      newErrors.client = t('requiredField');
    }

    const hasItems = Object.keys(items).some(key => {
      if (key.includes('qty') || key.includes('borrowed')) {
        const val = items[key as keyof ItemsData];
        return typeof val === 'number' && val > 0;
      }
      return false;
    });

    if (!hasItems) {
      newErrors.items = 'At least one item quantity or borrowed stock must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const { data: existingChallan } = await supabase
      .from('udhar_challans')
      .select('udhar_challan_number')
      .eq('udhar_challan_number', challanNumber)
      .maybeSingle();

    if (existingChallan) {
      alert(t('duplicateChallan'));
      return;
    }

    const { error: challanError } = await supabase
      .from('udhar_challans')
      .insert({
        udhar_challan_number: challanNumber,
        client_id: selectedClientId,
        alternative_site: alternativeSite || null,
        secondary_phone_number: secondaryPhone || null,
        udhar_date: date,
        driver_name: driverName || null,
      });

    if (challanError) {
      console.error('Error creating challan:', challanError);
      alert('Error creating challan');
      return;
    }

    const { error: itemsError } = await supabase
      .from('udhar_items')
      .insert({
        udhar_challan_number: challanNumber,
        ...items,
      });

    if (itemsError) {
      console.error('Error creating items:', itemsError);
      alert('Error creating items');
      return;
    }

    try {
      for (let size = 1; size <= 9; size++) {
        const onRentQty = items[`size_${size}_qty` as keyof ItemsData] as number;
        const borrowedQty = items[`size_${size}_borrowed` as keyof ItemsData] as number;

        if (onRentQty > 0 || borrowedQty > 0) {
          console.log(`Incrementing stock for size ${size}: on_rent=${onRentQty}, borrowed=${borrowedQty}`);

          const { error: stockError } = await supabase.rpc('increment_stock', {
            p_size: size,
            p_on_rent_increment: onRentQty,
            p_borrowed_increment: borrowedQty,
          });

          if (stockError) {
            console.error(`Error updating stock for size ${size}:`, stockError);
            throw stockError;
          }
        }
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Challan saved but error updating stock. Please update stock manually.');
    }

    setShowSuccess(true);

    setTimeout(async () => {
      try {
        await generateJPEG('udhar', challanNumber, date);
      } catch (error) {
        console.error('Error generating JPEG:', error);
      }
    }, 500);
  };

  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    setCurrentStep('challan-details');
  };

  const handleBack = () => {
    setCurrentStep('client-selection');
  };

  const selectedClient = clients.find(c => c.id === selectedClientId);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex">
        <div className="w-64" /> {/* Spacer for navbar */}
        <main className="flex-1 p-8">
          <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            {currentStep === 'client-selection' ? (
              <>
                <h2 className="mb-8 text-3xl font-bold text-gray-900">{t('udharChallanTitle')}</h2>
                {showQuickAdd ? (
                  <div className="p-6 bg-white rounded-lg shadow">
                    <ClientForm
                      onSubmit={handleQuickAddClient}
                      onCancel={() => setShowQuickAdd(false)}
                      isQuickAdd={true}
                    />
                  </div>
                ) : (
                  <ClientSelectionStep
                    clients={clients}
                    onClientSelect={handleClientSelect}
                    onAddNewClick={() => setShowQuickAdd(true)}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                  />
                )}
              </>
            ) : (
              selectedClient && (
                <ChallanDetailsStep
                  selectedClient={selectedClient}
                  onBack={handleBack}
                  onSave={handleSave}
                  challanNumber={challanNumber}
                  setChallanNumber={setChallanNumber}
                  date={date}
                  setDate={setDate}
                  driverName={driverName}
                  setDriverName={setDriverName}
                  alternativeSite={alternativeSite}
                  setAlternativeSite={setAlternativeSite}
                  secondaryPhone={secondaryPhone}
                  setSecondaryPhone={setSecondaryPhone}
                  items={items}
                  setItems={setItems}
                  errors={errors}
                  showSuccess={showSuccess}
                />
              )
            )}
            
            <div style={{ position: 'absolute', left: '-9999px' }}>
              {selectedClient && (
                <ReceiptTemplate
                  challanType="udhar"
                  challanNumber={challanNumber}
                  date={date}
                  clientName={selectedClient.client_name}
                  site={alternativeSite || selectedClient.site}
                  phone={secondaryPhone || selectedClient.primary_phone_number}
                  driverName={driverName}
                  items={items}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UdharChallan;