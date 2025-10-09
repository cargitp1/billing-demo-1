import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, FileText, FileCheck, LogOut, Package, BookOpen, BookMarked } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageToggle from '../components/LanguageToggle';
import Navbar from '../components/Navbar';

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
      icon: BookMarked,
      path: '/client-ledger',
      color: 'bg-indigo-600 hover:bg-indigo-700',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex">
        <aside className="flex flex-col w-64 bg-white shadow-lg">
          <div className="p-6 border-b">
            <h1 className="text-xl font-bold text-gray-900">{t('appName')}</h1>
          </div>

          <nav className="flex-1 p-4">
          <div className="space-y-2">
            <button
              onClick={() => navigate('/clients')}
              className="flex items-center w-full gap-3 px-4 py-3 text-gray-700 transition-colors rounded-lg hover:bg-blue-50 hover:text-blue-600"
            >
              <UserPlus size={20} />
              <span>{t('addClient')}</span>
            </button>
            <button
              onClick={() => navigate('/udhar-challan')}
              className="flex items-center w-full gap-3 px-4 py-3 text-gray-700 transition-colors rounded-lg hover:bg-red-50 hover:text-red-600"
            >
              <FileText size={20} />
              <span>{t('udharChallan')}</span>
            </button>
            <button
              onClick={() => navigate('/jama-challan')}
              className="flex items-center w-full gap-3 px-4 py-3 text-gray-700 transition-colors rounded-lg hover:bg-green-50 hover:text-green-600"
            >
              <FileCheck size={20} />
              <span>{t('jamaChallan')}</span>
            </button>
            <button
              onClick={() => navigate('/stock')}
              className="flex items-center w-full gap-3 px-4 py-3 text-gray-700 transition-colors rounded-lg hover:bg-gray-50 hover:text-gray-600"
            >
              <Package size={20} />
              <span>{t('stockManagement')}</span>
            </button>
            <button
              onClick={() => navigate('/challan-book')}
              className="flex items-center w-full gap-3 px-4 py-3 text-gray-700 transition-colors rounded-lg hover:bg-teal-50 hover:text-teal-600"
            >
              <BookOpen size={20} />
              <span>{t('challanBook')}</span>
            </button>
            <button
              onClick={() => navigate('/client-ledger')}
              className="flex items-center w-full gap-3 px-4 py-3 text-gray-700 transition-colors rounded-lg hover:bg-indigo-50 hover:text-indigo-600"
            >
              <BookMarked size={20} />
              <span>{t('clientLedger')}</span>
            </button>
          </div>
        </nav>

        <div className="p-4 space-y-4 border-t">
          <div className="flex justify-center">
            <LanguageToggle />
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full gap-2 px-4 py-3 text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
          >
            <LogOut size={20} />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>

      <main className="flex-1">
        <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <h2 className="mb-8 text-3xl font-bold text-center text-gray-900">{t('dashboard')}</h2>

          <div className="grid max-w-5xl grid-cols-1 gap-6 mx-auto sm:grid-cols-2 lg:grid-cols-3">
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
    </div>
    );
  };

export default Dashboard;