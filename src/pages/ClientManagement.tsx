import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  UserPlus, 
  Search, 
  RefreshCw,
  TrendingUp,
  MapPin,
  Phone,
  Plus
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
    <div className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm sm:p-3 lg:p-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="w-20 h-3 mb-1.5 bg-gray-200 rounded sm:w-24 sm:h-4 sm:mb-2"></div>
          <div className="w-24 h-2.5 bg-gray-200 rounded sm:w-32 sm:h-3"></div>
        </div>
        <div className="w-12 h-5 bg-gray-200 rounded sm:w-16 sm:h-6"></div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            fontSize: '13px',
            padding: '10px 14px',
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

      <main className="relative flex-1 w-full overflow-auto lg:ml-64" style={{ marginTop: '56px', backgroundColor: '#f9fafb' }}>
        <div className="lg:mt-0"></div>
        <div className="w-full px-4 py-6 mx-auto lg:px-8 lg:py-8 max-w-7xl">
          {/* Header Section */}
          <div className="flex flex-col items-start justify-between gap-3 mb-6 sm:flex-row sm:items-center lg:mb-8" style={{ padding: '24px 0' }}>
            <div>
              <h2 className="font-bold text-gray-900" style={{ fontSize: '24px' }}>{t('clientManagement')}</h2>
              <p className="mt-1 text-sm text-gray-600">Manage all your clients and their information</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => fetchClients(true)}
                disabled={refreshing}
                className="btn-secondary inline-flex items-center gap-2"
                style={{ minHeight: '44px' }}
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary hidden lg:inline-flex items-center gap-2"
                style={{ minHeight: '44px' }}
              >
                <UserPlus size={20} />
                {t('addNewClient')}
              </button>
            </div>
          </div>

          {/* Statistics Cards - Ultra Compact Mobile */}
          {!loading && (
            <div className="grid grid-cols-3 gap-1.5 mb-3 sm:gap-3 sm:mb-5 lg:gap-6 lg:mb-8">
              <div className="relative overflow-hidden transition-shadow bg-white border border-gray-200 rounded-md shadow-sm sm:rounded-lg lg:rounded-xl hover:shadow-md">
                <div className="absolute top-0 right-0 w-8 h-8 rounded-bl-full opacity-50 sm:w-12 sm:h-12 lg:w-20 lg:h-20 bg-blue-50"></div>
                <div className="relative p-2 sm:p-3 lg:p-6">
                  <div className="flex flex-col gap-1 sm:gap-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] sm:text-[10px] lg:text-sm font-medium text-gray-600 leading-tight">Clients</p>
                      <div className="p-1 sm:p-1.5 lg:p-3 bg-blue-100 rounded sm:rounded-md lg:rounded-lg">
                        <Users className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 lg:w-7 lg:h-7 text-blue-600" />
                      </div>
                    </div>
                    <p className="text-lg font-bold text-blue-600 sm:text-xl lg:text-3xl">{statistics.totalClients}</p>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden transition-shadow bg-white border border-gray-200 rounded-md shadow-sm sm:rounded-lg lg:rounded-xl hover:shadow-md">
                <div className="absolute top-0 right-0 w-8 h-8 rounded-bl-full opacity-50 sm:w-12 sm:h-12 lg:w-20 lg:h-20 bg-orange-50"></div>
                <div className="relative p-2 sm:p-3 lg:p-6">
                  <div className="flex flex-col gap-1 sm:gap-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] sm:text-[10px] lg:text-sm font-medium text-gray-600 leading-tight">Sites</p>
                      <div className="p-1 sm:p-1.5 lg:p-3 bg-orange-100 rounded sm:rounded-md lg:rounded-lg">
                        <MapPin className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 lg:w-7 lg:h-7 text-orange-600" />
                      </div>
                    </div>
                    <p className="text-lg font-bold text-orange-600 sm:text-xl lg:text-3xl">{statistics.uniqueSites}</p>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden transition-shadow bg-white border border-gray-200 rounded-md shadow-sm sm:rounded-lg lg:rounded-xl hover:shadow-md">
                <div className="absolute top-0 right-0 w-8 h-8 rounded-bl-full opacity-50 sm:w-12 sm:h-12 lg:w-20 lg:h-20 bg-green-50"></div>
                <div className="relative p-2 sm:p-3 lg:p-6">
                  <div className="flex flex-col gap-1 sm:gap-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] sm:text-[10px] lg:text-sm font-medium text-gray-600 leading-tight">New</p>
                      <div className="p-1 sm:p-1.5 lg:p-3 bg-green-100 rounded sm:rounded-md lg:rounded-lg">
                        <TrendingUp className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 lg:w-7 lg:h-7 text-green-600" />
                      </div>
                    </div>
                    <p className="text-lg font-bold text-green-600 sm:text-xl lg:text-3xl">{statistics.recentClients}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Client Form Section - Hidden on Mobile, Show on Desktop */}
          <div className="hidden p-4 mb-6 bg-white border border-gray-200 shadow-sm lg:block lg:p-6 lg:mb-8 rounded-xl">
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
                    {editingClient ? 'Update client information' : 'Add a new client'}
                  </p>
                </div>
              </div>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm hover:shadow-md"
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
                <p className="text-sm text-gray-500">Click "Add New Client" to get started</p>
              </div>
            )}
          </div>

          {/* Client List Section - Compact */}
          <div className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm sm:p-3 lg:p-6 sm:rounded-xl">
            <div className="flex items-center gap-1.5 mb-3 sm:gap-2 sm:mb-4 lg:mb-6">
              <div className="p-1 sm:p-1.5 lg:p-2 bg-blue-100 rounded sm:rounded-md lg:rounded-lg">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 sm:text-base lg:text-xl">{t('clientList')}</h3>
                <p className="text-[9px] sm:text-[10px] lg:text-sm text-gray-500 leading-tight">
                  {clients.length} client{clients.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="space-y-1.5 sm:space-y-2 lg:space-y-4">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : clients.length === 0 ? (
              <div className="py-6 text-center sm:py-8 lg:py-16">
                <div className="inline-flex items-center justify-center w-10 h-10 mb-2 bg-gray-100 rounded-full sm:w-12 sm:h-12 sm:mb-3 lg:w-16 lg:h-16 lg:mb-4">
                  <Users className="w-5 h-5 text-gray-400 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
                </div>
                <h3 className="mb-1.5 text-sm font-semibold text-gray-900 sm:text-base sm:mb-2 lg:text-lg">No clients yet</h3>
                <p className="mb-3 text-[10px] sm:text-xs text-gray-500 sm:mb-4 lg:text-sm lg:mb-6">Get started by adding your first client</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="hidden lg:inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm hover:shadow-md"
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

        {/* Floating Action Button (FAB) - Mobile Only */}
        <button
          onClick={() => {
            setShowForm(true);
            setEditingClient(undefined);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="fixed z-50 flex items-center justify-center transition-all shadow-lg lg:hidden bottom-6 right-4 w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl hover:shadow-2xl active:scale-90 touch-manipulation"
          aria-label="Add new client"
        >
          <Plus className="text-white w-7 h-7" strokeWidth={2.5} />
        </button>

        {/* Mobile Form Modal/Sheet */}
        {showForm && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div 
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={handleCancel}
            ></div>
            <div className="absolute inset-x-0 bottom-0 overflow-y-auto bg-white rounded-t-2xl max-h-[90vh] animate-slide-up">
              <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${editingClient ? 'bg-yellow-100' : 'bg-blue-100'}`}>
                    <UserPlus className={`w-5 h-5 ${editingClient ? 'text-yellow-600' : 'text-blue-600'}`} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      {editingClient ? 'Edit Client' : 'Add New Client'}
                    </h3>
                    <p className="text-[10px] text-gray-500">
                      {editingClient ? 'Update information' : 'Fill in the details'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCancel}
                  className="p-2 text-gray-400 transition-colors rounded-lg hover:bg-gray-100 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <ClientForm
                  initialData={editingClient}
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add custom CSS for slide-up animation */}
      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ClientManagement;
