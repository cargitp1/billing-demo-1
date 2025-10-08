import React from 'react';
import { Search } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Client {
  id: string;
  client_nic_name: string;
  client_name: string;
  site: string;
}

interface ClientSearchSelectProps {
  clients: Client[];
  selectedClient: Client | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClientSelect: (client: Client) => void;
}

const ClientSearchSelect: React.FC<ClientSearchSelectProps> = ({
  clients,
  selectedClient,
  searchQuery,
  onSearchChange,
  onClientSelect,
}) => {
  const { t } = useLanguage();

  const filteredClients = clients.filter(client =>
    client.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.client_nic_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {t('selectClient')} / ક્લાયન્ટ પસંદ કરો
      </label>

      <div className="relative mb-3 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search clients..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <select
        onChange={(e) => {
          const client = clients.find(c => c.id === e.target.value);
          if (client) onClientSelect(client);
        }}
        value={selectedClient?.id || ''}
        className="max-w-md w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">-- {t('selectClient')} --</option>
        {filteredClients.map(client => (
          <option key={client.id} value={client.id}>
            {client.client_name} ({client.client_nic_name})
          </option>
        ))}
      </select>
    </div>
  );
};

export default ClientSearchSelect;
