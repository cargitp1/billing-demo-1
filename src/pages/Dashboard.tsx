import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, 
  FileText, 
  FileCheck, 
  LogOut, 
  Package, 
  BookOpen, 
  BookMarked,
  TrendingUp,
  Users,
  Activity,
  Calendar,
  ArrowUpRight,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageToggle from '../components/LanguageToggle';
import Navbar from '../components/Navbar';
import { supabase } from '../utils/supabase';
import toast, { Toaster } from 'react-hot-toast';
import { format, startOfMonth, endOfMonth } from 'date-fns';

interface DashboardStats {
  totalClients: number;
  totalUdharChallans: number;
  totalJamaChallans: number;
  availableStock: number;
  monthlyUdhar: number;
  monthlyJama: number;
  clientsWithBalance: number;
  lowStockItems: number;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    totalUdharChallans: 0,
    totalJamaChallans: 0,
    availableStock: 0,
    monthlyUdhar: 0,
    monthlyJama: 0,
    clientsWithBalance: 0,
    lowStockItems: 0,
  });
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    fetchDashboardStats();
    setGreeting(getGreeting());
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(new Date()), 'yyyy-MM-dd');

      // Fetch all stats in parallel
      const [
        clientsData,
        udharData,
        jamaData,
        stockData,
        monthlyUdharData,
        monthlyJamaData,
      ] = await Promise.all([
        supabase.from('clients').select('id', { count: 'exact', head: true }),
        supabase.from('udhar_challans').select('udhar_challan_number', { count: 'exact', head: true }),
        supabase.from('jama_challans').select('jama_challan_number', { count: 'exact', head: true }),
        supabase.from('stock').select('available_stock'),
        supabase.from('udhar_challans').select('udhar_challan_number', { count: 'exact', head: true })
          .gte('udhar_date', monthStart).lte('udhar_date', monthEnd),
        supabase.from('jama_challans').select('jama_challan_number', { count: 'exact', head: true })
          .gte('jama_date', monthStart).lte('jama_date', monthEnd),
      ]);

      const totalAvailableStock = stockData.data?.reduce((sum, item) => sum + (item.available_stock || 0), 0) || 0;
      const lowStock = stockData.data?.filter(item => item.available_stock > 0 && item.available_stock < 10).length || 0;

      setStats({
        totalClients: clientsData.count || 0,
        totalUdharChallans: udharData.count || 0,
        totalJamaChallans: jamaData.count || 0,
        availableStock: totalAvailableStock,
        monthlyUdhar: monthlyUdharData.count || 0,
        monthlyJama: monthlyJamaData.count || 0,
        clientsWithBalance: 0, // This would require complex calculation
        lowStockItems: lowStock,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  const quickActions = [
    {
      title: t('addClient'),
      description: 'Add new clients to your system',
      icon: UserPlus,
      path: '/clients',
      gradient: 'from-blue-500 to-blue-700',
      hoverGradient: 'hover:from-blue-600 hover:to-blue-800',
    },
    {
      title: t('udharChallan'),
      description: 'Create rental challan',
      icon: FileText,
      path: '/udhar-challan',
      gradient: 'from-red-500 to-red-700',
      hoverGradient: 'hover:from-red-600 hover:to-red-800',
    },
    {
      title: t('jamaChallan'),
      description: 'Record returned items',
      icon: FileCheck,
      path: '/jama-challan',
      gradient: 'from-green-500 to-green-700',
      hoverGradient: 'hover:from-green-600 hover:to-green-800',
    },
    {
      title: t('stockManagement'),
      description: 'Manage inventory levels',
      icon: Package,
      path: '/stock',
      gradient: 'from-purple-500 to-purple-700',
      hoverGradient: 'hover:from-purple-600 hover:to-purple-800',
    },
    {
      title: t('challanBook'),
      description: 'View all challans',
      icon: BookOpen,
      path: '/challan-book',
      gradient: 'from-teal-500 to-teal-700',
      hoverGradient: 'hover:from-teal-600 hover:to-teal-800',
    },
    {
      title: t('clientLedger'),
      description: 'Track client balances',
      icon: BookMarked,
      path: '/client-ledger',
      gradient: 'from-indigo-500 to-indigo-700',
      hoverGradient: 'hover:from-indigo-600 hover:to-indigo-800',
    },
  ];

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    trendValue,
    gradient,
    loading 
  }: { 
    title: string; 
    value: number | string; 
    icon: any; 
    trend?: 'up' | 'down';
    trendValue?: string;
    gradient: string;
    loading?: boolean;
  }) => (
    <div className={`relative overflow-hidden bg-gradient-to-br ${gradient} rounded-xl shadow-lg p-6 text-white group hover:shadow-xl transition-all`}>
      <div className="absolute top-0 right-0 w-32 h-32 transition-transform transform bg-white rounded-bl-full opacity-10 group-hover:scale-110"></div>
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-white rounded-lg bg-opacity-20 backdrop-blur-sm">
            <Icon size={24} />
          </div>
          {trend && trendValue && (
            <div className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full ${
              trend === 'up' ? 'bg-green-500 bg-opacity-30' : 'bg-red-500 bg-opacity-30'
            }`}>
              <TrendingUp size={14} className={trend === 'down' ? 'rotate-180' : ''} />
              {trendValue}
            </div>
          )}
        </div>
        <p className="mb-1 text-sm font-medium text-white text-opacity-90">{title}</p>
        {loading ? (
          <div className="w-20 h-8 bg-white rounded bg-opacity-20 animate-pulse"></div>
        ) : (
          <p className="text-3xl font-bold">{value}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
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
      
      <main className="flex-1 ml-64 overflow-auto">
        <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="relative p-8 mb-8 overflow-hidden text-white shadow-xl bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 -mt-32 -mr-32 bg-white rounded-full opacity-5"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 -mb-24 -ml-24 bg-white rounded-full opacity-5"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={24} className="text-yellow-300" />
                  <p className="text-lg font-medium text-blue-100">{greeting}!</p>
                </div>
                <h1 className="mb-2 text-4xl font-bold">Welcome to {t('appName')}</h1>
                <p className="text-lg text-blue-100">Manage your rentals efficiently with powerful tools</p>
              </div>
              <div className="items-center hidden gap-4 lg:flex">
                <div className="text-right">
                  <p className="mb-1 text-sm text-blue-100">Today's Date</p>
                  <p className="text-xl font-semibold">{format(new Date(), 'dd MMM yyyy')}</p>
                </div>
                <Calendar size={48} className="text-blue-200" />
              </div>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 size={24} className="text-gray-700" />
              <h2 className="text-2xl font-bold text-gray-900">Business Overview</h2>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <StatCard 
                title="Total Clients"
                value={stats.totalClients}
                icon={Users}
                gradient="from-blue-500 to-blue-700"
                loading={loading}
              />
              <StatCard 
                title="Available Stock"
                value={stats.availableStock}
                icon={Package}
                trend={stats.lowStockItems > 0 ? 'down' : 'up'}
                trendValue={stats.lowStockItems > 0 ? `${stats.lowStockItems} low` : 'Good'}
                gradient="from-green-500 to-green-700"
                loading={loading}
              />
              <StatCard 
                title="Udhar Challans"
                value={stats.totalUdharChallans}
                icon={FileText}
                trend="up"
                trendValue={`${stats.monthlyUdhar} this month`}
                gradient="from-red-500 to-red-700"
                loading={loading}
              />
              <StatCard 
                title="Jama Challans"
                value={stats.totalJamaChallans}
                icon={FileCheck}
                trend="up"
                trendValue={`${stats.monthlyJama} this month`}
                gradient="from-purple-500 to-purple-700"
                loading={loading}
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <Activity size={24} className="text-gray-700" />
              <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {quickActions.map((action) => (
                <button
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  className={`group relative overflow-hidden bg-gradient-to-br ${action.gradient} ${action.hoverGradient} rounded-xl shadow-lg p-6 text-white transition-all transform hover:scale-105 hover:shadow-2xl`}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 transition-transform transform bg-white rounded-bl-full opacity-10 group-hover:scale-110"></div>
                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-white rounded-lg bg-opacity-20 backdrop-blur-sm">
                        <action.icon size={28} />
                      </div>
                      <ArrowUpRight size={20} className="transition-opacity opacity-0 group-hover:opacity-100" />
                    </div>
                    <h3 className="mb-2 text-xl font-bold">{action.title}</h3>
                    <p className="text-sm text-white text-opacity-90">{action.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Activity Placeholder */}
          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Activity size={24} className="text-gray-700" />
                <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
              </div>
              <button 
                onClick={() => navigate('/challan-book')}
                className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                View All
                <ArrowUpRight size={16} />
              </button>
            </div>
            <div className="py-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 rounded-full">
                <Activity size={32} className="text-gray-400" />
              </div>
              <p className="mb-4 text-gray-500">Your recent challans will appear here</p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => navigate('/udhar-challan')}
                  className="px-4 py-2 text-sm font-medium text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
                >
                  Create Udhar
                </button>
                <button
                  onClick={() => navigate('/jama-challan')}
                  className="px-4 py-2 text-sm font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
                >
                  Create Jama
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
