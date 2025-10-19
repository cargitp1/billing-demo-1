import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, 
  FileText, 
  FileCheck, 
  Package, 
  BookOpen, 
  BookMarked,
  Activity,
  Calendar,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import Navbar from '../components/Navbar';
import { Toaster } from 'react-hot-toast';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    setGreeting(t('greeting'));
  }, [t]);

  const quickActions = [
    {
      title: t('addClient'),
      description: t('add_new_clients'),
      icon: UserPlus,
      path: '/clients',
      gradient: 'from-blue-500 to-blue-700',
      hoverGradient: 'hover:from-blue-600 hover:to-blue-800',
    },
    {
      title: t('udharChallan'),
      description: t('create_rental'),
      icon: FileText,
      path: '/udhar-challan',
      gradient: 'from-red-500 to-red-700',
      hoverGradient: 'hover:from-red-600 hover:to-red-800',
    },
    {
      title: t('jamaChallan'),
      description: t('record_returns'),
      icon: FileCheck,
      path: '/jama-challan',
      gradient: 'from-green-500 to-green-700',
      hoverGradient: 'hover:from-green-600 hover:to-green-800',
    },
    {
      title: t('stockManagement'),
      description: t('manage_inventory'),
      icon: Package,
      path: '/stock',
      gradient: 'from-purple-500 to-purple-700',
      hoverGradient: 'hover:from-purple-600 hover:to-purple-800',
    },
    {
      title: t('challanBook'),
      description: t('view_all_challans'),
      icon: BookOpen,
      path: '/challan-book',
      gradient: 'from-teal-500 to-teal-700',
      hoverGradient: 'hover:from-teal-600 hover:to-teal-800',
    },
    {
      title: t('clientLedger'),
      description: t('track_balances'),
      icon: BookMarked,
      path: '/client-ledger',
      gradient: 'from-indigo-500 to-indigo-700',
      hoverGradient: 'hover:from-indigo-600 hover:to-indigo-800',
    },
  ];

  return (
    <div className="relative flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            fontSize: '13px',
            padding: '10px 14px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
        }}
      />
      <Navbar />
      
      <main className="flex-1 w-full ml-0 overflow-auto lg:ml-64 pt-[56px] lg:pt-0 pb-safe">
        <div className="w-full px-2.5 py-2.5 mx-auto sm:px-4 sm:py-5 lg:px-8 lg:py-8 max-w-7xl">
          {/* Welcome Section - Compact Mobile */}
          <div className="relative overflow-hidden text-white shadow-md rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 sm:rounded-2xl lg:rounded-3xl">
            <div className="absolute top-0 right-0 w-20 h-20 -mt-10 -mr-10 bg-white rounded-full sm:w-40 sm:h-40 lg:w-64 lg:h-64 sm:-mt-20 sm:-mr-20 lg:-mt-32 lg:-mr-32 opacity-5"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 -mb-8 -ml-8 bg-white rounded-full sm:w-32 sm:h-32 lg:w-48 lg:h-48 sm:-mb-16 sm:-ml-16 lg:-mb-24 lg:-ml-24 opacity-5"></div>
            <div className="relative px-3.5 py-3 sm:p-5 lg:p-8">
              <div className="flex items-center gap-1 sm:gap-1.5 mb-1.5 sm:mb-2">
                <Sparkles className="w-4 h-4 text-yellow-300 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                <p className="text-sm font-medium text-blue-100 sm:text-base lg:text-lg">{greeting}!</p>
              </div>
              <h1 className="mb-1.5 sm:mb-2 text-lg sm:text-2xl lg:text-4xl font-bold leading-tight">
                {t('appName')}
              </h1>
              <p className="mb-2 text-[13px] text-blue-100 sm:text-base lg:text-lg sm:mb-0">{t('Manage_your')}</p>
              
              {/* Unified Date Display */}
              <div className="flex items-center justify-between mt-3 sm:mt-4">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Calendar className="w-4 h-4 text-blue-200 sm:w-5 sm:h-5" />
                  <div>
                    <p className="text-[10px] text-blue-100 mb-0.5 sm:text-xs">{t('Todays_Date')}</p>
                    <p className="text-sm font-medium sm:text-base">{format(new Date(), 'dd MMM yyyy')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions - Enhanced Mobile */}
          <div className="mt-3 mb-3 sm:mt-5 sm:mb-5 lg:mt-8 lg:mb-8">
            <div className="flex items-center gap-2 mb-3 sm:gap-2.5 sm:mb-4 lg:mb-6">
              <div className="p-1.5 bg-gray-100 rounded-lg sm:p-2">
                <Activity className="w-4 h-4 text-gray-700 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 sm:text-xl lg:text-2xl">{t('Quick_Actions')}</h2>
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-3 lg:gap-6">
              {quickActions.map((action) => (
                <button
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  className={`group relative overflow-hidden bg-gradient-to-br ${action.gradient} ${action.hoverGradient} rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg p-3.5 sm:p-4 lg:p-5 text-white transition-all transform active:scale-[0.97] sm:hover:scale-[1.02] hover:shadow-xl touch-manipulation`}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 transition-transform bg-white rounded-bl-full sm:w-28 sm:h-28 lg:w-32 lg:h-32 opacity-10 group-hover:scale-110"></div>
                  <div className="relative">
                    <div className="flex items-start justify-between mb-2.5 sm:mb-3">
                      <div className="p-2 bg-white rounded-lg bg-opacity-20 backdrop-blur-sm sm:p-2.5 lg:p-3">
                        <action.icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
                      </div>
                      <ArrowUpRight className="w-4 h-4 transition-opacity opacity-40 sm:w-5 sm:h-5 group-hover:opacity-100" />
                    </div>
                    <h3 className="mb-1 text-[15px] font-bold leading-tight sm:text-lg lg:text-xl">{action.title}</h3>
                    <p className="text-xs leading-snug text-white text-opacity-90 sm:text-sm">{action.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Activity - Compact Mobile */}
          <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm sm:p-4 lg:p-6 sm:rounded-xl">
            <div className="flex flex-col items-start justify-between gap-2 mb-3 sm:flex-row sm:items-center sm:gap-0 sm:mb-5">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Activity className="w-4 h-4 text-gray-700 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                <h2 className="text-base font-bold text-gray-900 sm:text-lg lg:text-2xl">{t('recentActivity')}</h2>
              </div>
              <button 
                onClick={() => navigate('/challan-book')}
                className="flex items-center gap-0.5 text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700 touch-manipulation active:scale-95"
              >
                {t('viewAll')}
                <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            </div>
            <div className="py-6 text-center sm:py-8 lg:py-12">
              <div className="inline-flex items-center justify-center w-10 h-10 mb-2 bg-gray-100 rounded-full sm:w-12 sm:h-12 sm:mb-3 lg:w-16 lg:h-16 lg:mb-4">
                <Activity className="w-5 h-5 text-gray-400 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
              </div>
              <p className="mb-3 text-xs text-gray-500 sm:text-sm sm:mb-4">{t('recentChallansAppear')}</p>
              <div className="flex flex-col justify-center gap-2 sm:flex-row sm:gap-2.5">
                <button
                  onClick={() => navigate('/udhar-challan')}
                  className="w-full px-3 py-2 text-xs font-medium text-white transition-all bg-red-600 rounded-lg sm:w-auto sm:text-sm sm:px-4 hover:bg-red-700 touch-manipulation active:scale-95"
                >
                  {t('createUdhar')}
                </button>
                <button
                  onClick={() => navigate('/jama-challan')}
                  className="w-full px-3 py-2 text-xs font-medium text-white transition-all bg-green-600 rounded-lg sm:w-auto sm:text-sm sm:px-4 hover:bg-green-700 touch-manipulation active:scale-95"
                >
                  {t('createJama')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
