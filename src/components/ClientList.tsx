import React, { useState } from 'react';
import { CreditCard as Edit, Trash2, Search } from 'lucide-react';
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

  const filteredClients = clients.filter(client =>
    client.client_nic_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.site.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (window.confirm(t('deleteConfirm'))) {
      onDelete(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('search')}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {filteredClients.length === 0 ? (
        <p className="text-center text-gray-500 py-8">{t('noClients')}</p>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('clientNicName')}</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('clientName')}</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('site')}</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('primaryPhone')}</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3">{client.client_nic_name}</td>
                    <td className="px-4 py-3">{client.client_name}</td>
                    <td className="px-4 py-3">{client.site}</td>
                    <td className="px-4 py-3">{client.primary_phone_number}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onEdit(client)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title={t('edit')}
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(client.id!)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
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

          <div className="md:hidden space-y-3">
            {filteredClients.map((client) => (
              <div key={client.id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-semibold text-gray-600">{t('clientNicName')}:</span>
                    <p className="text-gray-900">{client.client_nic_name}</p>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-600">{t('clientName')}:</span>
                    <p className="text-gray-900">{client.client_name}</p>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-600">{t('site')}:</span>
                    <p className="text-gray-900">{client.site}</p>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-600">{t('primaryPhone')}:</span>
                    <p className="text-gray-900">{client.primary_phone_number}</p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => onEdit(client)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Edit size={18} />
                      {t('edit')}
                    </button>
                    <button
                      onClick={() => handleDelete(client.id!)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 size={18} />
                      {t('delete')}
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
