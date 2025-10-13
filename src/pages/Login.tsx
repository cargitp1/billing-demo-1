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
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      icon: TrendingUp,
      title: 'Efficient',
      description: 'Streamline operations',
      gradient: 'from-green-500 to-green-600'
    },
    {
      icon: Users,
      title: 'Client Management',
      description: 'Track everything easily',
      gradient: 'from-purple-500 to-purple-600'
    }
  ];

  return (
    <div className="relative flex items-center justify-center min-h-screen px-4 py-8 overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
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

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bg-blue-300 rounded-full top-20 left-10 w-72 h-72 mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute bg-purple-300 rounded-full top-40 right-10 w-72 h-72 mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bg-pink-300 rounded-full -bottom-8 left-20 w-72 h-72 mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

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
              <span className="text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
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
                <div className={`p-3 bg-gradient-to-br ${feature.gradient} rounded-lg text-white group-hover:scale-110 transition-transform`}>
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
          <div className="absolute inset-0 transform bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-2xl opacity-20 rotate-6"></div>
          
          <div className="relative p-8 bg-white border border-gray-100 shadow-2xl md:p-10 rounded-2xl">
            {/* Mobile Logo */}
            <div className="mb-6 text-center lg:hidden">
              <h1 className="text-2xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                {t('appName')}
              </h1>
            </div>

            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 shadow-lg bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
                <LogIn className="text-white" size={32} />
              </div>
              <h2 className="mb-2 text-3xl font-bold text-gray-900">{t('login')}</h2>
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
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
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

      {/* CSS for animations */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Login;
