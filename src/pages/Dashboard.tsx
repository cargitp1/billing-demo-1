import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, FileText, FileCheck, LogOut, Package, BookOpen, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageToggle from '../components/LanguageToggle';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { t } = useLanguage();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const cards = [
    {
      title: t('addClient'),
      icon: UserPlus,
      path: '/clients',
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      title: t('udharChallan'),
      icon: FileText,
      path: '/udhar-challan',
      color: 'bg-orange-600 hover:bg-orange-700',
    },
    {
      title: t('jamaChallan'),
      icon: FileCheck,
      path: '/jama-challan',
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      title: t('stockManagement'),
      icon: Package,
      path: '/stock',
      color: 'bg-gray-600 hover:bg-gray-700',
    },
    {
      title: t('challanBook'),
      icon: BookOpen,
      path: '/challan-book',
      color: 'bg-teal-600 hover:bg-teal-700',
    },
    {
      title: t('clientLedger'),
      icon: Users,
      path: '/client-ledger',
      color: 'bg-amber-600 hover:bg-amber-700',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-gray-900">{t('appName')}</h1>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-2">
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
              onClick={() => navigate('/stock')}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-gray-600 rounded-lg transition-colors"
            >
              <Package size={20} />
              <span>{t('stockManagement')}</span>
            </button>
            <button
              onClick={() => navigate('/challan-book')}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-teal-50 hover:text-teal-600 rounded-lg transition-colors"
            >
              <BookOpen size={20} />
              <span>{t('challanBook')}</span>
            </button>
            <button
              onClick={() => navigate('/client-ledger')}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-colors"
            >
              <Users size={20} />
              <span>{t('clientLedger')}</span>
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

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{t('dashboard')}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {cards.map((card) => (
              <button
                key={card.path}
                onClick={() => navigate(card.path)}
                className={`${card.color} text-white p-8 rounded-lg shadow-lg transition-all transform hover:scale-105`}
              >
                <card.icon className="mx-auto mb-4" size={64} />
                <h3 className="text-2xl font-semibold text-center">{card.title}</h3>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
