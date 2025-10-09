import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, FileText, FileCheck, LogOut, Package, BookOpen } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ClientForm, { ClientFormData } from '../components/ClientForm';
import ClientList from '../components/ClientList';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageToggle from '../components/LanguageToggle';
import { supabase } from '../utils/supabase';

const ClientManagement: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { t } = useLanguage();

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  const [clients, setClients] = useState<ClientFormData[]>([]);
  const [editingClient, setEditingClient] = useState<ClientFormData | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);

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

  const handleSubmit = async (data: ClientFormData) => {
    if (editingClient?.id) {
      const { error } = await supabase
        .from('clients')
        .update({
          client_nic_name: data.client_nic_name,
          client_name: data.client_name,
          site: data.site,
          primary_phone_number: data.primary_phone_number,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingClient.id);

      if (error) {
        console.error('Error updating client:', error);
        alert('Error updating client');
      } else {
        alert(t('saveSuccess'));
        setEditingClient(undefined);
        setShowForm(false);
        fetchClients();
      }
    } else {
      const { error } = await supabase
        .from('clients')
        .insert({
          client_nic_name: data.client_nic_name,
          client_name: data.client_name,
          site: data.site,
          primary_phone_number: data.primary_phone_number,
        });

      if (error) {
        console.error('Error creating client:', error);
        alert('Error creating client');
      } else {
        alert(t('saveSuccess'));
        setShowForm(false);
        fetchClients();
      }
    }
  };

  const handleEdit = (client: ClientFormData) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting client:', error);
      alert('Error deleting client');
    } else {
      fetchClients();
    }
  };

  const handleCancel = () => {
    setEditingClient(undefined);
    setShowForm(false);
  };

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
              className="flex items-center w-full gap-3 px-4 py-3 text-blue-600 border-l-4 border-blue-600 rounded-lg bg-blue-50"
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
        <h2 className="mb-8 text-3xl font-bold text-gray-900">{t('clientManagement')}</h2>

        <div className="p-6 mb-8 bg-white rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">
              {editingClient ? t('edit') : t('addNewClient')}
            </h3>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium min-h-[44px]"
              >
                {t('addNewClient')}
              </button>
            )}
          </div>

          {showForm && (
            <ClientForm
              initialData={editingClient}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          )}
        </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="mb-4 text-xl font-semibold text-gray-900">{t('clientList')}</h3>
            <ClientList clients={clients} onEdit={handleEdit} onDelete={handleDelete} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientManagement;
