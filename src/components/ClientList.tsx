import React, { useState, useMemo } from 'react';
import { Edit, Trash2, Search, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { ClientFormData } from './ClientForm';

interface ClientListProps {
  clients: ClientFormData[];
  onEdit: (client: ClientFormData) => void;
  onDelete: (id: string) => void;
}

const ClientList: React.FC<ClientListProps> = ({ clients, onEdit, onDelete }) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = useMemo(() => {
    if (!searchTerm) return clients;
    const searchLower = searchTerm.toLowerCase();
    return clients.filter(client =>
      client.client_nic_name.toLowerCase().includes(searchLower) ||
      client.client_name.toLowerCase().includes(searchLower) ||
      client.site.toLowerCase().includes(searchLower)
    );
  }, [clients, searchTerm]);

  const handleDelete = React.useCallback((id: string, name: string) => {
    if (window.confirm(`Delete "${name}"?`)) {
      onDelete(id);
    }
  }, [onDelete]);

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Search Bar - Compact */}
      <div className="relative">
        <Search className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('search') || 'Search clients...'}
          className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {filteredClients.length === 0 ? (
        <p className="py-6 text-xs text-center text-gray-500 sm:py-8 sm:text-sm">{t('noClients') || 'No clients found'}</p>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full overflow-hidden bg-white border-collapse rounded-lg shadow">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-sm font-semibold text-left text-gray-700">{t('clientNicName')}</th>
                  <th className="px-4 py-3 text-sm font-semibold text-left text-gray-700">{t('clientName')}</th>
                  <th className="px-4 py-3 text-sm font-semibold text-left text-gray-700">{t('site')}</th>
                  <th className="px-4 py-3 text-sm font-semibold text-left text-gray-700">{t('primaryPhone')}</th>
                  <th className="px-4 py-3 text-sm font-semibold text-left text-gray-700">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{client.client_nic_name}</td>
                    <td className="px-4 py-3 text-sm">{client.client_name}</td>
                    <td className="px-4 py-3 text-sm">{client.site}</td>
                    <td className="px-4 py-3 text-sm">{client.primary_phone_number}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onEdit(client)}
                          className="p-2 text-blue-600 transition-colors rounded hover:bg-blue-50 touch-manipulation active:scale-95"
                          title={t('edit')}
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(client.id!, client.client_nic_name)}
                          className="p-2 text-red-600 transition-colors rounded hover:bg-red-50 touch-manipulation active:scale-95"
                          title={t('delete')}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View - Ultra Compact */}
          <div className="space-y-2 lg:hidden">
            {filteredClients.map((client) => (
              <div 
                key={client.id} 
                className="bg-white p-2.5 sm:p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                {/* Header Row - Name and Actions */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 truncate sm:text-base">
                      {client.client_nic_name}
                    </h4>
                    <p className="text-[10px] sm:text-xs text-gray-600 truncate">
                      {client.client_name}
                    </p>
                  </div>
                  <div className="flex flex-shrink-0 gap-1">
                    <button
                      onClick={() => onEdit(client)}
                      className="p-1.5 sm:p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors touch-manipulation active:scale-95"
                      aria-label="Edit"
                    >
                      <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(client.id!, client.client_nic_name)}
                      className="p-1.5 sm:p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors touch-manipulation active:scale-95"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>

                {/* Details Row - Compact Info */}
                <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-gray-600">
                  <div className="flex items-center flex-1 min-w-0 gap-1">
                    <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0 text-gray-400" />
                    <span className="truncate">{client.site}</span>
                  </div>
                  <a 
                    href={`tel:${client.primary_phone_number}`}
                    className="flex items-center flex-shrink-0 gap-1 text-blue-600 hover:text-blue-700 touch-manipulation active:scale-95"
                  >
                    <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span className="font-medium">{client.primary_phone_number}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ClientList;
