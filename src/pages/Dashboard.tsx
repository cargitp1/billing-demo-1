import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, FileText, FileCheck } from 'lucide-react';
import Header from '../components/Header';
import { useLanguage } from '../contexts/LanguageContext';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

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
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      title: t('jamaChallan'),
      icon: FileCheck,
      path: '/jama-challan',
      color: 'bg-orange-600 hover:bg-orange-700',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{t('dashboard')}</h2>

        <div className="grid md:grid-cols-3 gap-8">
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
    </div>
  );
};

export default Dashboard;
