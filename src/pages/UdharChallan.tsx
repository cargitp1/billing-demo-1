import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { UserPlus, FileText, FileCheck, LogOut, Package, BookOpen, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ClientForm, { ClientFormData } from '../components/ClientForm';
import ItemsTable, { ItemsData } from '../components/ItemsTable';
import ReceiptTemplate from '../components/ReceiptTemplate';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageToggle from '../components/LanguageToggle';
import { supabase } from '../utils/supabase';
import { generateJPEG } from '../utils/generateJPEG';

const UdharChallan: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { t } = useLanguage();

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  const [clients, setClients] = useState<ClientFormData[]>([]);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
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
        return items[key as keyof ItemsData] > 0;
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

  const selectedClient = clients.find(c => c.id === selectedClientId);

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
              className="flex items-center w-full gap-3 px-4 py-3 text-red-600 border-l-4 border-red-600 rounded-lg bg-red-50"
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
              className="flex items-center w-full gap-3 px-4 py-3 text-gray-700 transition-colors rounded-lg hover:bg-gray-50"
            >
              <BookOpen size={20} />
              <span>{t('challanBook')}</span>
            </button>
            <button
              onClick={() => navigate('/stock')}
              className="flex items-center w-full gap-3 px-4 py-3 text-gray-700 transition-colors rounded-lg hover:bg-gray-50"
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
        <h2 className="mb-8 text-3xl font-bold text-gray-900">{t('udharChallanTitle')}</h2>

        <div className="space-y-6">
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="mb-4 text-xl font-semibold text-gray-900">{t('clientDetails')}</h3>

            <div className="mb-4">
              <button
                onClick={() => setShowQuickAdd(!showQuickAdd)}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium min-h-[44px]"
              >
                {t('quickAddClient')}
              </button>
            </div>

            {showQuickAdd && (
              <div className="mb-6">
                <ClientForm
                  onSubmit={handleQuickAddClient}
                  onCancel={() => setShowQuickAdd(false)}
                  isQuickAdd={true}
                />
              </div>
            )}

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                {t('selectClient')} *
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
              >
                <option value="">{t('selectClient')}</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.client_nic_name} - {client.client_name}
                  </option>
                ))}
              </select>
              {errors.client && <p className="mt-1 text-sm text-red-600">{errors.client}</p>}
            </div>

            {selectedClient && (
              <div className="p-4 mt-4 rounded-lg bg-gray-50">
                <p><strong>{t('site')}:</strong> {selectedClient.site}</p>
                <p><strong>{t('primaryPhone')}:</strong> {selectedClient.primary_phone_number}</p>
              </div>
            )}

            <div className="mt-6 space-y-4">
              <p className="text-sm italic text-gray-600">{t('overrideNote')}</p>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  {t('alternativeSite')}
                </label>
                <input
                  type="text"
                  value={alternativeSite}
                  onChange={(e) => setAlternativeSite(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
                />
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="mb-4 text-xl font-semibold text-gray-900">{t('challanDetails')}</h3>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  {t('challanNumber')} *
                </label>
                <input
                  type="text"
                  value={challanNumber}
                  onChange={(e) => setChallanNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
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
            <h3 className="mb-4 text-xl font-semibold text-gray-900">{t('itemsDetails')}</h3>
            {errors.items && <p className="mb-4 text-sm text-red-600">{errors.items}</p>}
            <ItemsTable items={items} onChange={setItems} />
          </div>

          {showSuccess ? (
            <div className="space-y-6">
              <div className="px-6 py-4 text-center text-green-700 bg-green-100 border border-green-400 rounded-lg">
                <p className="text-lg font-semibold">Challan saved and receipt downloaded!</p>
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
        </div>

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
