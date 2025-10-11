import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  UserPlus, 
  FileText, 
  FileCheck, 
  Package, 
  BookOpen, 
  BookMarked, 
  LogOut,
  LayoutDashboard,
  Sparkles,
  ChevronRight,
  Settings,
  User
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import LanguageToggle from './LanguageToggle';
import toast from 'react-hot-toast';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { logout } = useAuth();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  const navItems = [
    { 
      path: '/dashboard', 
      label: t('dashboard'), 
      icon: LayoutDashboard,
      colorClass: 'blue'
    },
    { 
      path: '/clients', 
      label: t('addClient'), 
      icon: UserPlus,
      colorClass: 'blue'
    },
    { 
      path: '/udhar-challan', 
      label: t('udharChallan'), 
      icon: FileText,
      colorClass: 'red'
    },
    { 
      path: '/jama-challan', 
      label: t('jamaChallan'), 
      icon: FileCheck,
      colorClass: 'green'
    },
    { 
      path: '/stock', 
      label: t('stockManagement'), 
      icon: Package,
      colorClass: 'purple'
    },
    { 
      path: '/challan-book', 
      label: t('challanBook'), 
      icon: BookOpen,
      colorClass: 'teal'
    },
    { 
      path: '/client-ledger', 
      label: t('clientLedger'), 
      icon: BookMarked,
      colorClass: 'indigo'
    },
  ];

  const getColorClasses = (colorClass: string) => {
    const colors = {
      blue: {
        gradient: 'from-blue-500 to-blue-600',
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        hoverBg: 'hover:bg-blue-50',
        hoverText: 'hover:text-blue-600',
        iconBg: 'bg-blue-50',
        iconHoverBg: 'group-hover:bg-blue-100'
      },
      red: {
        gradient: 'from-red-500 to-red-600',
        bg: 'bg-red-50',
        text: 'text-red-600',
        hoverBg: 'hover:bg-red-50',
        hoverText: 'hover:text-red-600',
        iconBg: 'bg-red-50',
        iconHoverBg: 'group-hover:bg-red-100'
      },
      green: {
        gradient: 'from-green-500 to-green-600',
        bg: 'bg-green-50',
        text: 'text-green-600',
        hoverBg: 'hover:bg-green-50',
        hoverText: 'hover:text-green-600',
        iconBg: 'bg-green-50',
        iconHoverBg: 'group-hover:bg-green-100'
      },
      purple: {
        gradient: 'from-purple-500 to-purple-600',
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        hoverBg: 'hover:bg-purple-50',
        hoverText: 'hover:text-purple-600',
        iconBg: 'bg-purple-50',
        iconHoverBg: 'group-hover:bg-purple-100'
      },
      teal: {
        gradient: 'from-teal-500 to-teal-600',
        bg: 'bg-teal-50',
        text: 'text-teal-600',
        hoverBg: 'hover:bg-teal-50',
        hoverText: 'hover:text-teal-600',
        iconBg: 'bg-teal-50',
        iconHoverBg: 'group-hover:bg-teal-100'
      },
      indigo: {
        gradient: 'from-indigo-500 to-indigo-600',
        bg: 'bg-indigo-50',
        text: 'text-indigo-600',
        hoverBg: 'hover:bg-indigo-50',
        hoverText: 'hover:text-indigo-600',
        iconBg: 'bg-indigo-50',
        iconHoverBg: 'group-hover:bg-indigo-100'
      }
    };
    return colors[colorClass as keyof typeof colors];
  };

  return (
    <nav className="fixed top-0 left-0 z-50 flex flex-col w-64 h-screen bg-white border-r border-gray-100 shadow-xl">
      {/* Header with App Name */}
      <div className="relative p-6 overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="absolute top-0 right-0 w-32 h-32 -mt-16 -mr-16 bg-white rounded-full opacity-10"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 -mb-12 -ml-12 bg-white rounded-full opacity-10"></div>
        <div className="relative flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg bg-opacity-20 backdrop-blur-sm">
            <Sparkles size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{t('appName')}</h1>
            <p className="text-xs text-blue-100">Rental Management</p>
          </div>
        </div>
      </div>



      {/* Navigation Items */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map(({ path, label, icon: Icon, colorClass }) => {
            const isActive = location.pathname === path;
            const isHovered = hoveredItem === path;
            const colors = getColorClasses(colorClass);
            
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                onMouseEnter={() => setHoveredItem(path)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`group relative flex items-center w-full gap-3 px-4 py-3 transition-all duration-200 rounded-xl font-medium ${
                  isActive
                    ? `bg-gradient-to-r ${colors.gradient} text-white shadow-lg transform scale-105`
                    : `text-gray-600 ${colors.hoverBg} ${colors.hoverText} ${isHovered ? 'translate-x-1' : ''}`
                }`}
              >
                <div className={`p-2 rounded-lg transition-colors duration-200 ${
                  isActive 
                    ? 'bg-white bg-opacity-20 backdrop-blur-sm' 
                    : `${colors.iconBg} ${colors.iconHoverBg}`
                }`}>
                  <Icon size={20} className={isActive ? 'text-white' : ''} />
                </div>
                <span className="flex-1 text-left">{label}</span>
                {isActive && (
                  <ChevronRight size={18} className="text-white animate-pulse" />
                )}
                {!isActive && isHovered && (
                  <ChevronRight size={18} className={colors.text} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer with Language Toggle and Logout */}
      <div className="p-4 space-y-3 border-t border-gray-100 bg-gray-50">
        {/* Settings Button */}
        <button
          className="flex items-center justify-center w-full gap-2 px-4 py-2.5 text-gray-600 transition-all duration-200 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 hover:text-gray-900 hover:border-gray-300"
        >
          <Settings size={18} />
          <span className="text-sm font-medium">Settings</span>
        </button>

        {/* Language Toggle */}
        <div className="flex justify-center">
          <LanguageToggle />
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-full gap-2 px-4 py-3 text-white transition-all duration-200 transform shadow-lg bg-gradient-to-r from-red-500 to-red-600 rounded-xl hover:from-red-600 hover:to-red-700 hover:shadow-xl hover:scale-105"
        >
          <LogOut size={20} />
          <span className="font-medium">{t('logout')}</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
