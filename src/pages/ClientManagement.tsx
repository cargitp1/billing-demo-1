import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  UserPlus, 
  Search, 
  RefreshCw,
  TrendingUp,
  MapPin,
  Phone
} from 'lucide-react';
import ClientForm, { ClientFormData } from '../components/ClientForm';
import ClientList from '../components/ClientList';
import { useLanguage } from '../contexts/LanguageContext';
import Navbar from '../components/Navbar';
import { supabase } from '../utils/supabase';
import toast, { Toaster } from 'react-hot-toast';

const ClientManagement: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [clients, setClients] = useState<ClientFormData[]>([]);
  const [editingClient, setEditingClient] = useState<ClientFormData | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async (showRefreshToast = false) => {
    if (showRefreshToast) setRefreshing(true);
    else setLoading(true);

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('client_nic_name');

    if (error) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to load clients');
    } else {
      setClients(data || []);
      if (showRefreshToast) {
        toast.success('Clients refreshed successfully');
      }
    }

    setLoading(false);
    setRefreshing(false);
  };

  const handleSubmit = async (data: ClientFormData) => {
    const loadingToast = toast.loading(editingClient?.id ? 'Updating client...' : 'Creating client...');

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

      toast.dismiss(loadingToast);

      if (error) {
        console.error('Error updating client:', error);
        toast.error('Failed to update client');
      } else {
        toast.success('Client updated successfully');
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

      toast.dismiss(loadingToast);

      if (error) {
        console.error('Error creating client:', error);
        toast.error('Failed to create client');
      } else {
        toast.success('Client created successfully');
        setShowForm(false);
        fetchClients();
      }
    }
  };

  const handleEdit = (client: ClientFormData) => {
    setEditingClient(client);
    setShowForm(true);
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    const client = clients.find(c => c.id === id);
    const confirmed = window.confirm(
      `Are you sure you want to delete client "${client?.client_nic_name}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    const loadingToast = toast.loading('Deleting client...');

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    toast.dismiss(loadingToast);

    if (error) {
      console.error('Error deleting client:', error);
      toast.error('Failed to delete client');
    } else {
      toast.success('Client deleted successfully');
      fetchClients();
    }
  };

  const handleCancel = () => {
    setEditingClient(undefined);
    setShowForm(false);
  };

  const statistics = useMemo(() => {
    const totalClients = clients.length;
    const uniqueSites = new Set(clients.map(c => c.site)).size;
    const recentClients = clients.filter(c => {
      const createdAt = new Date(c.created_at || '');
      const daysSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceCreation <= 30;
    }).length;
    return { totalClients, uniqueSites, recentClients };
  }, [clients]);

  const SkeletonCard = () => (
    <div className="p-5 bg-white border border-gray-200 shadow-sm rounded-xl animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="w-32 h-5 mb-2 bg-gray-200 rounded"></div>
          <div className="w-48 h-4 bg-gray-200 rounded"></div>
        </div>
        <div className="w-24 h-8 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

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
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{t('clientManagement')}</h2>
              <p className="mt-2 text-gray-600">Manage all your clients and their information</p>
            </div>
            <button
              onClick={() => fetchClients(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          {/* Statistics Cards */}
          {!loading && (
            <div className="grid gap-6 mb-8 md:grid-cols-3">
              <div className="relative overflow-hidden transition-shadow bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md">
                <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-50 bg-blue-50"></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{t('totalClients') || 'Total Clients'}</p>
                      <p className="mt-2 text-3xl font-bold text-blue-600">{statistics.totalClients}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Users size={28} className="text-blue-600" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden transition-shadow bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md">
                <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-50 bg-purple-50"></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{t('uniqueSites') || 'Unique Sites'}</p>
                      <p className="mt-2 text-3xl font-bold text-purple-600">{statistics.uniqueSites}</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <MapPin size={28} className="text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden transition-shadow bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md">
                <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-50 bg-green-50"></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{t('recentClients') || 'New This Month'}</p>
                      <p className="mt-2 text-3xl font-bold text-green-600">{statistics.recentClients}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <TrendingUp size={28} className="text-green-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Client Form Section */}
          <div className="p-6 mb-8 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${editingClient ? 'bg-yellow-100' : 'bg-blue-100'}`}>
                  <UserPlus size={20} className={editingClient ? 'text-yellow-600' : 'text-blue-600'} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {editingClient ? t('edit') + ' Client' : t('addNewClient')}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {editingClient 
                      ? 'Update client information below' 
                      : 'Fill in the details to add a new client'}
                  </p>
                </div>
              </div>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md"
                >
                  <UserPlus size={18} />
                  {t('addNewClient')}
                </button>
              )}
            </div>

            {showForm ? (
              <div className="pt-6 border-t border-gray-200">
                <ClientForm
                  initialData={editingClient}
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                />
              </div>
            ) : (
              <div className="py-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 rounded-full">
                  <UserPlus size={32} className="text-gray-400" />
                </div>
                <p className="text-gray-500">Click "Add New Client" to get started</p>
              </div>
            )}
          </div>

          {/* Client List Section */}
          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{t('clientList')}</h3>
                <p className="text-sm text-gray-500">
                  Showing {clients.length} client{clients.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : clients.length === 0 ? (
              <div className="py-16 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 rounded-full">
                  <Users size={32} className="text-gray-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">No clients yet</h3>
                <p className="mb-6 text-gray-500">Get started by adding your first client</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md"
                >
                  <UserPlus size={18} />
                  Add Your First Client
                </button>
              </div>
            ) : (
              <ClientList clients={clients} onEdit={handleEdit} onDelete={handleDelete} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientManagement;
