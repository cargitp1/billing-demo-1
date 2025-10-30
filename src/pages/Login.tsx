import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogIn, 
  Mail, 
  Lock, 
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageToggle from '../components/LanguageToggle';
import toast, { Toaster } from 'react-hot-toast';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading } = useAuth();
  const { t, language } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

    const loadingToast = toast.loading(language === 'gu' ? 'સાઇન ઇન થઈ રહ્યું છે...' : 'Signing in...');

    const result = await login(email, password);

    toast.dismiss(loadingToast);

    if (result.success) {
      toast.success(t('greeting'), {
        icon: '🎉',
      });
      navigate('/dashboard');
    } else {
      const errorMsg = result.error || t('invalidCredentials');
      setError(errorMsg);
      toast.error(errorMsg);
    }

    setIsLoading(false);
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen px-4 py-8 bg-gradient-to-br from-slate-50 to-slate-100 sm:px-6 lg:px-8">
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#1f2937',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          },
        }}
      />

      {/* Subtle Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 rounded-full w-72 h-72 bg-blue-100/40 blur-3xl" />
        <div className="absolute bottom-0 left-0 rounded-full w-72 h-72 bg-purple-100/40 blur-3xl" />
      </div>

      {/* Language Toggle */}
      <div className="absolute z-10 top-4 right-4 sm:top-6 sm:right-6">
        <LanguageToggle />
      </div>

      {/* Login Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo/Brand */}
          <motion.div 
          className="mb-6 text-center sm:mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 sm:w-20 sm:h-20">
            <LogIn className="w-8 h-8 text-white sm:w-10 sm:h-10" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{t('appName')}</h1>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">{t('login')}</p>
        </motion.div>        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 bg-white shadow-xl sm:p-8 rounded-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                {t('username')}
              </label>
              <div className="relative">
                <Mail className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('username')}
                  className="w-full py-3 pl-10 pr-4 text-gray-900 placeholder-gray-400 transition-all border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  required
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                {t('password')}
              </label>
              <div className="relative">
                <Lock className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('password')}
                  className="w-full py-3 pl-10 pr-12 text-gray-900 placeholder-gray-400 transition-all border border-gray-300 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute text-gray-400 transition-colors transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 p-3 border border-red-200 rounded-xl bg-red-50"
                >
                  <AlertCircle className="flex-shrink-0 w-5 h-5 text-red-600" />
                  <p className="text-sm text-red-700">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              type="submit"
              className="flex items-center justify-center w-full gap-2 py-3 text-base font-semibold text-white transition-all rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {isLoading ? (
                <>
                  <motion.div 
                    className="w-5 h-5 border-2 border-white rounded-full border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <span>{language === 'gu' ? 'સાઇન ઇન થઈ રહ્યું છે...' : 'Signing in...'}</span>
                </>
              ) : (
                <>
                  <span>{t('login')}</span>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </motion.button>

          </form>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 pt-6 mt-6 text-sm text-gray-500 border-t border-gray-200">
            <Shield className="w-4 h-4" />
            <span>{language === 'gu' ? 'એન્ક્રિપ્શન સાથે સુરક્ષિત' : 'Secured with encryption'}</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
