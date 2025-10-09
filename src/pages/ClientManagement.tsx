import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ClientForm, { ClientFormData } from '../components/ClientForm';
import ClientList from '../components/ClientList';
import { useLanguage } from '../contexts/LanguageContext';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import { supabase } from '../utils/supabase';

const ClientManagement: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
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
    <div className="min-h-screen bg-gray-100">
      <Header />
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      </main>
    </div>
  );
};

export default ClientManagement;
