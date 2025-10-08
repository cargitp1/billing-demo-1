import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, FileText, FileCheck, LogOut, Package, BookOpen, Book } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageToggle from '../components/LanguageToggle';
import ClientCard from '../components/ClientCard';
import { supabase } from '../utils/supabase';
import { fetchClientTransactions, calculateCurrentBalance } from '../utils/ledgerHelpers';

interface ClientData {
  id: string;
  client_name: string;
  client_nic_name: string;
  site: string;
  primary_phone_number: string;
  transactions: any[];
  currentBalance: number;
  transactionCount: number;
}

const NewClientLedger: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { t } = useLanguage();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const [clients, setClients] = useState<ClientData[]>([]);
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientsData();
  }, []);

  const fetchClientsData = async () => {
    setLoading(true);
    try {
      const { data: clientsData, error } = await supabase
        .from('clients')
        .select('*')
        .order('client_name', { ascending: true });

      if (error) throw error;

      if (clientsData) {
        const clientsWithData = await Promise.all(
          clientsData.map(async (client) => {
            const transactions = await fetchClientTransactions(client.id);
            const balance = calculateCurrentBalance(transactions);

            return {
              ...client,
              transactions,
              currentBalance: balance,
              transactionCount: transactions.length
            };
          })
        );

        setClients(clientsWithData);
      }
    } catch (error) {
      console.error('Error fetching clients data:', error);
      alert('Error loading clients data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (clientId: string) => {
    setExpandedClientId(expandedClientId === clientId ? null : clientId);
  };

  const handleDownloadLedger = (client: ClientData) => {
    alert(`Download ledger for ${client.client_name} - Coming soon!`);
  };

  const filteredClients = clients.filter(client => {
    const query = searchQuery.toLowerCase();
    return (
      client.client_name.toLowerCase().includes(query) ||
      client.client_nic_name.toLowerCase().includes(query) ||
      client.site.toLowerCase().includes(query) ||
      client.id.toLowerCase().includes(query)
    );
  });

  const totalClients = clients.length;
  const totalBalance = clients.reduce((sum, c) => sum + c.currentBalance, 0);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-gray-900">{t('appName')}</h1>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <span>{t('dashboard')}</span>
            </button>
            <button
              onClick={() => navigate('/clients')}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
            >
              <UserPlus size={20} />
              <span>{t('addClient')}</span>
            </button>
            <button
              onClick={() => navigate('/udhar-challan')}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
            >
              <FileText size={20} />
              <span>{t('udharChallan')}</span>
            </button>
            <button
              onClick={() => navigate('/jama-challan')}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
            >
              <FileCheck size={20} />
              <span>{t('jamaChallan')}</span>
            </button>
            <button
              onClick={() => navigate('/challan-book')}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <BookOpen size={20} />
              <span>{t('challanBook')}</span>
            </button>
            <button
              onClick={() => navigate('/client-ledger')}
              className="w-full flex items-center gap-3 px-4 py-3 bg-purple-50 text-purple-600 border-l-4 border-purple-600 rounded-lg"
            >
              <Book size={20} />
              <span>{t('clientLedger')}</span>
            </button>
            <button
              onClick={() => navigate('/stock')}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Package size={20} />
              <span>{t('stockManagement')}</span>
            </button>
          </div>
        </nav>

        <div className="p-4 border-t space-y-4">
          <div className="flex justify-center">
            <LanguageToggle />
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut size={20} />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto bg-gray-100 min-h-screen">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
            <div className="flex items-center justify-center mb-2">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <span className="text-4xl">📖</span>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-center mb-2">ખાતાવહી</h1>
            <p className="text-center text-blue-100 text-lg">ગ્રાહક ભાડા ઇતિહાસ</p>

            <div className="flex justify-between mt-6 gap-4">
              <div className="flex-1 bg-blue-400 bg-opacity-30 px-4 py-3 rounded-lg text-center">
                <div className="text-sm opacity-80">કુલ ગ્રાહકો</div>
                <div className="text-2xl font-bold">{totalClients}</div>
              </div>
              <div className="flex-1 bg-blue-400 bg-opacity-30 px-4 py-3 rounded-lg text-center">
                <div className="text-sm opacity-80">કુલ બાકી</div>
                <div className="text-2xl font-bold">{totalBalance}</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 shadow-md sticky top-0 z-10">
            <div className="relative">
              <input
                type="text"
                placeholder="નામ, ID અથવા સાઇટથી શોધો..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
              />
              <span className="absolute left-4 top-3 text-2xl">🔍</span>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {loading ? (
              <div className="text-center py-12">
                <div className="text-xl text-gray-600">Loading...</div>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">કોઈ ગ્રાહક મળ્યો નહીં</p>
              </div>
            ) : (
              filteredClients.map(client => (
                <ClientCard
                  key={client.id}
                  client={client}
                  isExpanded={expandedClientId === client.id}
                  onToggle={() => handleToggle(client.id)}
                  onDownloadLedger={handleDownloadLedger}
                />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default NewClientLedger;
