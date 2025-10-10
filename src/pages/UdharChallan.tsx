import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  Search, 
  ArrowLeft, 
  UserPlus, 
  FileText, 
  Calendar,
  MapPin,
  Phone,
  User,
  CheckCircle,
  Package
} from 'lucide-react';
import ClientForm, { ClientFormData } from '../components/ClientForm';
import ItemsTable, { ItemsData } from '../components/ItemsTable';
import ReceiptTemplate from '../components/ReceiptTemplate';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../utils/supabase';
import { generateJPEG } from '../utils/generateJPEG';
import Navbar from '../components/Navbar';
import toast, { Toaster } from 'react-hot-toast';

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
      {/* Header with Action */}
      <div className="flex items-center justify-between p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{t('selectClient')}</h3>
          <p className="mt-1 text-sm text-gray-500">Choose a client to create udhar challan</p>
        </div>
        <button
          onClick={onAddNewClick}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm hover:shadow-md"
        >
          <UserPlus size={18} />
          {t('addNewClient')}
        </button>
      </div>

      {/* Search Box */}
      <div className="relative">
        <Search className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" size={18} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('searchClients')}
          className="w-full py-3 pl-10 pr-4 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Results Count */}
      {searchQuery && (
        <div className="px-4 py-2 border border-blue-200 rounded-lg bg-blue-50">
          <p className="text-sm text-blue-700">
            Found <span className="font-semibold">{filteredClients.length}</span> matching client{filteredClients.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Client Grid */}
      {filteredClients.length === 0 ? (
        <div className="p-16 text-center bg-white border border-gray-200 shadow-sm rounded-xl">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 rounded-full">
            <User size={32} className="text-gray-400" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">No clients found</h3>
          <p className="mb-4 text-gray-500">
            {searchQuery ? 'Try adjusting your search criteria' : 'Add your first client to get started'}
          </p>
          <button
            onClick={searchQuery ? () => onSearchChange('') : onAddNewClick}
            className="px-4 py-2 text-sm font-medium text-blue-600 transition-colors rounded-lg hover:text-blue-700 hover:bg-blue-50"
          >
            {searchQuery ? 'Clear search' : 'Add New Client'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client) => (
            <button
              key={client.id}
              onClick={() => onClientSelect(client.id)}
              className="p-5 text-left transition-all bg-white border border-gray-200 shadow-sm group rounded-xl hover:shadow-md hover:border-blue-500"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 transition-colors bg-blue-100 rounded-lg group-hover:bg-blue-200">
                    <User size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
                      {client.client_nic_name}
                    </h4>
                    <p className="text-sm text-gray-600">{client.client_name}</p>
                  </div>
                </div>
              </div>
              <div className="pt-3 mt-3 space-y-2 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={14} className="text-gray-400" />
                  <span className="truncate">{client.site}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone size={14} className="text-gray-400" />
                  <span>{client.primary_phone_number}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
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
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
        <button
          onClick={onBack}
          className="p-2 text-gray-600 transition-colors rounded-lg hover:text-gray-900 hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900">{t('challanDetails')}</h3>
          <p className="mt-1 text-sm text-gray-500">Complete the challan information below</p>
        </div>
      </div>

      {/* Selected Client Info */}
      <div className="relative p-6 overflow-hidden border border-blue-200 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-bl-full opacity-30"></div>
        <div className="relative flex items-start gap-4">
          <div className="p-3 bg-blue-600 rounded-lg">
            <User size={28} className="text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-gray-900">{selectedClient.client_nic_name}</h4>
            <p className="text-gray-700">{selectedClient.client_name}</p>
            <div className="grid grid-cols-1 gap-2 mt-3 md:grid-cols-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin size={14} className="text-blue-600" />
                <span>{selectedClient.site}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone size={14} className="text-blue-600" />
                <span>{selectedClient.primary_phone_number}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Override Details */}
        <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FileText size={18} className="text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{t('overrideDetails')}</h3>
          </div>
          <p className="mb-4 text-sm text-gray-500">Optional: Override default site or phone for this challan</p>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                <MapPin size={14} />
                {t('alternativeSite')}
              </label>
              <input
                type="text"
                value={alternativeSite}
                onChange={(e) => setAlternativeSite(e.target.value)}
                placeholder="Leave blank to use default site"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                <Phone size={14} />
                {t('secondaryPhone')}
              </label>
              <input
                type="text"
                value={secondaryPhone}
                onChange={(e) => setSecondaryPhone(e.target.value)}
                placeholder="Leave blank to use primary phone"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Basic Challan Details */}
        <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText size={18} className="text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{t('basicDetails')}</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                <FileText size={14} />
                {t('challanNumber')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={challanNumber}
                onChange={(e) => setChallanNumber(e.target.value)}
                placeholder="Enter challan number"
                className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.challanNumber ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.challanNumber && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <span className="text-red-500">•</span> {errors.challanNumber}
                </p>
              )}
            </div>
            <div>
              <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                <Calendar size={14} />
                {t('date')} <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.date && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <span className="text-red-500">•</span> {errors.date}
                </p>
              )}
            </div>
            <div>
              <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                <User size={14} />
                {t('driverName')}
              </label>
              <input
                type="text"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                placeholder="Optional driver name"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Package size={18} className="text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{t('itemsDetails')}</h3>
          </div>
          {errors.items && (
            <div className="p-3 mb-4 border border-red-200 rounded-lg bg-red-50">
              <p className="flex items-center gap-2 text-sm text-red-600">
                <span className="text-red-500">⚠</span> {errors.items}
              </p>
            </div>
          )}
          <ItemsTable items={items} onChange={setItems} />
        </div>

        {/* Save or Success State */}
        {showSuccess ? (
          <div className="space-y-6">
            <div className="relative p-8 overflow-hidden text-center border border-green-200 shadow-sm bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-100 rounded-bl-full opacity-30"></div>
              <div className="relative">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-green-600 rounded-full">
                  <CheckCircle size={32} className="text-white" />
                </div>
                <h3 className="mb-2 text-2xl font-bold text-gray-900">{t('challanSaved')}</h3>
                <p className="text-gray-600">Challan has been created and JPEG is being generated</p>
              </div>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-white transition-colors bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg"
              >
                <ArrowLeft size={20} />
                {t('backToDashboard')}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={onSave}
              className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-white transition-colors bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg"
            >
              <CheckCircle size={20} />
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
      toast.error('Failed to load clients');
    } else {
      setClients(data || []);
    }
  };

  const handleQuickAddClient = async (clientData: ClientFormData) => {
    const loadingToast = toast.loading('Creating client...');

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

    toast.dismiss(loadingToast);

    if (error) {
      console.error('Error creating client:', error);
      toast.error('Failed to create client');
    } else {
      toast.success('Client created successfully');
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
    if (!validate()) {
      toast.error('Please fill all required fields');
      return;
    }

    const { data: existingChallan } = await supabase
      .from('udhar_challans')
      .select('udhar_challan_number')
      .eq('udhar_challan_number', challanNumber)
      .maybeSingle();

    if (existingChallan) {
      toast.error(t('duplicateChallan'));
      return;
    }

    const loadingToast = toast.loading('Creating challan...');

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
      toast.dismiss(loadingToast);
      console.error('Error creating challan:', challanError);
      toast.error('Failed to create challan');
      return;
    }

    const { error: itemsError } = await supabase
      .from('udhar_items')
      .insert({
        udhar_challan_number: challanNumber,
        ...items,
      });

    if (itemsError) {
      toast.dismiss(loadingToast);
      console.error('Error creating items:', itemsError);
      toast.error('Failed to create items');
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
      toast.dismiss(loadingToast);
      console.error('Error updating stock:', error);
      toast.warning('Challan saved but stock update failed. Please update manually.');
    }

    toast.dismiss(loadingToast);
    toast.success('Challan created successfully');
    setShowSuccess(true);

    setTimeout(async () => {
      try {
        await generateJPEG('udhar', challanNumber, date);
        toast.success('JPEG generated successfully');
      } catch (error) {
        console.error('Error generating JPEG:', error);
        toast.error('Failed to generate JPEG');
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
    <div className="flex min-h-screen bg-gray-50">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
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
      <main className="flex-1 ml-64 overflow-auto">
        <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {currentStep === 'client-selection' ? (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900">{t('udharChallanTitle')}</h2>
                <p className="mt-2 text-gray-600">Create a new udhar challan for rental items</p>
              </div>
              {showQuickAdd ? (
                <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
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
  );
};

export default UdharChallan;
