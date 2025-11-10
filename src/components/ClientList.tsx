import React from 'react';
import { Edit, Trash2, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { ClientFormData } from './ClientForm';

interface ClientListProps {
  clients: ClientFormData[];
  onEdit: (client: ClientFormData) => void;
  onDelete: (id: string) => void;
}

const ClientList: React.FC<ClientListProps> = ({ clients, onEdit, onDelete }) => {
  const { t } = useLanguage();

  const handleDelete = React.useCallback((id: string, name: string) => {
    if (window.confirm(`Delete "${name}"?`)) {
      onDelete(id);
    }
  }, [onDelete]);

  return (
    <div className="space-y-3 sm:space-y-4">
      {clients.length === 0 ? (
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
                {clients.map((client: ClientFormData) => (
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
            {clients.map((client: ClientFormData) => (
              <div 
                key={client.id} 
                className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-[11px] font-semibold text-gray-900 truncate">
                        {client.client_nic_name}
                      </h4>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-blue-50 text-blue-700">
                        {t('challanInfo')}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex items-center gap-1 text-[9px] text-gray-600">
                        <MapPin className="w-2.5 h-2.5 text-gray-400" />
                        <span className="truncate max-w-[100px]">{client.site}</span>
                      </div>
                      <a 
                        href={`tel:${client.primary_phone_number}`}
                        className="flex items-center gap-1 text-[9px] text-blue-600"
                      >
                        <Phone className="w-2.5 h-2.5" />
                        <span>{client.primary_phone_number}</span>
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEdit(client)}
                      className="p-1 text-[9px] font-medium text-gray-600 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded transition-colors touch-manipulation active:scale-95 flex items-center gap-0.5"
                      aria-label={t('clientInfo')}
                    >
                      {t('clientInfo')}
                    </button>
                    <button
                      onClick={() => handleDelete(client.id!, client.client_nic_name)}
                      className="p-1 text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors touch-manipulation active:scale-95"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
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
