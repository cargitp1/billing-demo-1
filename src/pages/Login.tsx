import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, Sparkles, Shield, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageToggle from '../components/LanguageToggle';
import toast, { Toaster } from 'react-hot-toast';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const loadingToast = toast.loading('Signing in...');

    const result = await login(email, password);

    toast.dismiss(loadingToast);

    if (result.success) {
      toast.success('Welcome back!');
      navigate('/dashboard');
    } else {
      const errorMsg = result.error || t('invalidCredentials');
      setError(errorMsg);
      toast.error(errorMsg);
    }

    setIsLoading(false);
  };

  const features = [
    {
      icon: Shield,
      title: 'Secure',
      description: 'Your data is protected',
      color: '#2563eb'
    },
    {
      icon: TrendingUp,
      title: 'Efficient',
      description: 'Streamline operations',
      color: '#16a34a'
    },
    {
      icon: Users,
      title: 'Client Management',
      description: 'Track everything easily',
      color: '#0891b2'
    }
  ];

  return (
    <div className="relative flex items-center justify-center min-h-screen px-4 py-8" style={{ backgroundColor: '#f9fafb' }}>
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
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />


      {/* Language Toggle */}
      <div className="absolute z-10 top-6 right-6">
        <LanguageToggle />
      </div>

      <div className="relative z-10 grid items-center w-full max-w-6xl grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left Side - Branding & Features */}
        <div className="hidden space-y-8 lg:block">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm bg-opacity-80 backdrop-blur-sm">
              <Sparkles size={20} className="text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">Modern Rental Management</span>
            </div>
            <h1 className="text-5xl font-bold leading-tight text-gray-900">
              Welcome to<br />
              <span style={{ color: '#2563eb' }}>
                {t('appName')}
              </span>
            </h1>
            <p className="text-xl text-gray-600">
              Streamline your rental business with powerful tools for inventory, clients, and challan management
            </p>
          </div>

          {/* Feature Cards */}
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 transition-all bg-white shadow-sm bg-opacity-60 backdrop-blur-sm rounded-xl hover:shadow-md group"
              >
                <div className="p-3 rounded-lg text-white" style={{ backgroundColor: feature.color }}>
                  <feature.icon size={24} />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="relative">
          
          <div className="relative p-8 bg-white border border-gray-100 shadow-2xl md:p-10 rounded-2xl">
            {/* Mobile Logo */}
            <div className="mb-6 text-center lg:hidden">
              <h1 className="text-2xl font-bold" style={{ color: '#2563eb' }}>
                {t('appName')}
              </h1>
            </div>

            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-full" style={{ backgroundColor: '#2563eb' }}>
                <LogIn className="text-white" size={40} />
              </div>
              <h2 className="mb-2 font-bold text-gray-900" style={{ fontSize: '24px' }}>{t('login')}</h2>
              <p className="text-gray-600">Enter your credentials to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                  <Mail size={16} />
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                  <Lock size={16} />
                  {t('password')}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                  required
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="p-4 border border-red-200 bg-red-50 rounded-xl">
                  <p className="flex items-center gap-2 text-sm text-red-600">
                    <span className="text-red-500">⚠</span>
                    {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="btn-primary w-full flex items-center justify-center gap-2"
                style={{ minHeight: '48px' }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn size={20} />
                    {t('login')}
                  </>
                )}
              </button>
            </form>

            {/* Additional Info */}
            <div className="pt-6 mt-8 border-t border-gray-200">
              <p className="text-sm text-center text-gray-500">
                Secure login powered by modern authentication
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Login;
