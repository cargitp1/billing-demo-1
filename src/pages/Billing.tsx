import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin,
  Phone,
  User,
  ChevronRight,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../utils/supabase';
import Navbar from '../components/Navbar';
import toast, { Toaster } from 'react-hot-toast';
import { ClientFormData } from '../components/ClientForm';

interface ClientCardProps {
  client: ClientFormData;
  onClick: () => void;
}

const ClientCard: React.FC<ClientCardProps> = ({ client, onClick }) => (
  <button
    onClick={onClick}
    className="p-3 text-left transition-all bg-white border border-gray-200 shadow-sm sm:p-4 lg:p-5 group rounded-lg sm:rounded-xl hover:shadow-md hover:border-blue-500 touch-manipulation active:scale-[0.98]"
  >
    <div className="flex items-center gap-2 mb-2 sm:gap-3 sm:mb-3">
      <div className="p-1.5 sm:p-2 transition-colors bg-blue-100 rounded-md sm:rounded-lg group-hover:bg-blue-200">
        <User className="w-4 h-4 text-blue-600 sm:w-5 sm:h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-gray-900 truncate transition-colors sm:text-base lg:text-lg group-hover:text-blue-600">
          {client.client_nic_name}
        </h4>
        <p className="text-[10px] sm:text-xs lg:text-sm text-gray-600 truncate">{client.client_name}</p>
      </div>
      <ChevronRight className="flex-shrink-0 w-4 h-4 text-gray-400 transition-transform sm:w-5 sm:h-5 group-hover:translate-x-1" />
    </div>
    <div className="pt-2 mt-2 space-y-1 border-t border-gray-100 sm:pt-3 sm:mt-3 sm:space-y-1.5 lg:space-y-2">
      <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs lg:text-sm text-gray-600">
        <MapPin className="flex-shrink-0 w-3 h-3 text-gray-400 sm:w-3.5 sm:h-3.5" />
        <span className="truncate">{client.site}</span>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs lg:text-sm text-gray-600">
        <Phone className="flex-shrink-0 w-3 h-3 text-gray-400 sm:w-3.5 sm:h-3.5" />
        <span>{client.primary_phone_number}</span>
      </div>
    </div>
  </button>
);

export default function Billing() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [clients, setClients] = useState<ClientFormData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const { data: clientsData, error } = await supabase
        .from('clients')
        .select('*')
        .order('client_nic_name', { ascending: true });

      if (error) throw error;
      setClients(clientsData || []);
    } catch (error) {
      toast.error('Error fetching clients');
      console.error('Error fetching clients:', error);
    }
  };

  const handleClientSelect = async (clientId: string) => {
    navigate(`/billing/create/${clientId}`);
  };

  const filteredClients = clients.filter(client => 
    client.client_nic_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.site.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.primary_phone_number.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container max-w-6xl px-4 py-4 mx-auto mt-16 sm:px-6 lg:px-8 sm:py-6 lg:py-8">
        <div className="space-y-3 sm:space-y-4 lg:space-y-6">
          {/* Header */}
          <div className="items-center justify-between hidden p-4 mb-4 bg-white border border-gray-200 sm:flex rounded-xl">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 lg:text-xl">{t('selectClient')}</h3>
              <p className="mt-0.5 text-xs text-gray-500 lg:text-sm">Choose client for billing</p>
            </div>
          </div>

          {/* Search Bar - Compact */}
          <div className="relative">
            <Search className="absolute text-gray-400 transform -translate-y-1/2 left-2.5 sm:left-3 top-1/2 w-4 h-4 sm:w-4.5 sm:h-4.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchClients') || 'Search clients...'}
              className="w-full py-2 sm:py-2.5 lg:py-3 pl-8 sm:pl-10 pr-3 sm:pr-4 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
            />
          </div>

          {/* Results Count - Compact */}
          {searchQuery && (
            <div className="px-3 py-1.5 sm:px-4 sm:py-2 border border-blue-200 rounded-lg bg-blue-50">
              <p className="text-[10px] sm:text-xs lg:text-sm text-blue-700">
                Found <span className="font-semibold">{filteredClients.length}</span> client{filteredClients.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          {/* Client Grid */}
          {filteredClients.length === 0 ? (
            <div className="p-8 text-center bg-white border border-gray-200 rounded-lg shadow-sm sm:p-12 lg:p-16 sm:rounded-xl">
              <div className="inline-flex items-center justify-center w-12 h-12 mb-3 bg-gray-100 rounded-full sm:w-14 sm:h-14 sm:mb-4 lg:w-16 lg:h-16">
                <User className="w-6 h-6 text-gray-400 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
              </div>
              <h3 className="mb-2 text-sm font-semibold text-gray-900 sm:text-base lg:text-lg">No clients found</h3>
              <p className="mb-3 text-[10px] sm:text-xs lg:text-sm text-gray-500 sm:mb-4">
                Try adjusting your search
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-blue-600 transition-colors rounded-lg hover:text-blue-700 hover:bg-blue-50 touch-manipulation active:scale-95"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:gap-3 md:grid-cols-2 lg:grid-cols-3 lg:gap-4">
              {filteredClients.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onClick={() => handleClientSelect(client.id || '')}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <Toaster />
    </div>
  );
}