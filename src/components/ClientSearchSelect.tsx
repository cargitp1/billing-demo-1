import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../utils/supabase';

interface Client {
  id: string;
  client_nic_name: string;
  client_full_name: string;
  primary_phone: string;
  site: string;
}

interface ClientSearchSelectProps {
  onClientSelect: (client: Client | null) => void;
}

export default function ClientSearchSelect({ onClientSelect }: ClientSearchSelectProps) {
  const { t } = useLanguage();
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = clients.filter((client) =>
        client.client_nic_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.client_full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.primary_phone.includes(searchTerm)
      );
      setFilteredClients(filtered);
      setShowDropdown(true);
    } else {
      setFilteredClients(clients);
      setShowDropdown(false);
    }
  }, [searchTerm, clients]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchClients = async () => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('client_nic_name');

    if (error) {
      console.error('Error fetching clients:', error);
      return;
    }

    setClients(data || []);
  };

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setSearchTerm(`${client.client_nic_name} (${client.client_full_name})`);
    setShowDropdown(false);
    onClientSelect(client);
  };

  const handleClearSelection = () => {
    setSelectedClient(null);
    setSearchTerm('');
    setShowDropdown(false);
    onClientSelect(null);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => searchTerm && setShowDropdown(true)}
          placeholder={t('searchClient')}
          className="w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        {selectedClient && (
          <button
            onClick={handleClearSelection}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-red-600 hover:text-red-700 font-medium"
          >
            {t('cancel')}
          </button>
        )}
      </div>

      {showDropdown && filteredClients.length > 0 && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {filteredClients.map((client) => (
            <button
              key={client.id}
              onClick={() => handleClientSelect(client)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="font-medium text-gray-900">
                {client.client_nic_name} ({client.client_full_name})
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {client.primary_phone} • {client.site}
              </div>
            </button>
          ))}
        </div>
      )}

      {showDropdown && searchTerm && filteredClients.length === 0 && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500">
          {t('noClients')}
        </div>
      )}
    </div>
  );
}
