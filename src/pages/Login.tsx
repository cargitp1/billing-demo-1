import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogIn, 
  Mail, 
  Lock, 
  Sparkles, 
  Shield, 
  TrendingUp, 
  Users,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Zap,
  Target,
  Award
} from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

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
      toast.success('Welcome back!', {
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

  const features = [
    {
      icon: Shield,
      title: 'Bank-Level Security',
      description: 'Your data is encrypted and protected with enterprise-grade security',
      gradient: 'from-blue-500 to-cyan-500',
      bg: 'bg-blue-50'
    },
    {
      icon: TrendingUp,
      title: 'Real-Time Analytics',
      description: 'Track your business performance with live insights and reports',
      gradient: 'from-green-500 to-emerald-500',
      bg: 'bg-green-50'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Work together seamlessly with multi-user access and roles',
      gradient: 'from-purple-500 to-pink-500',
      bg: 'bg-purple-50'
    }
  ];

  const stats = [
    { value: '10K+', label: 'Active Users', icon: Users },
    { value: '99.9%', label: 'Uptime', icon: Zap },
    { value: '4.9★', label: 'Rating', icon: Award }
  ];

  return (
    <div className="relative flex items-center justify-center min-h-screen px-4 py-8 overflow-hidden bg-gradient-to-br from-gray-50 via-white to-blue-50">
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

      {/* Subtle Animated Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-0 right-0 rounded-full w-96 h-96 bg-blue-200/30 mix-blend-multiply filter blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute bottom-0 left-0 rounded-full w-96 h-96 bg-purple-200/30 mix-blend-multiply filter blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute rounded-full top-1/2 left-1/2 w-96 h-96 bg-pink-200/30 mix-blend-multiply filter blur-3xl"
          animate={{
            x: [-50, 50, -50],
            y: [50, -50, 50],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Language Toggle */}
      <motion.div 
        className="absolute z-10 top-6 right-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <LanguageToggle />
      </motion.div>

      <div className="relative z-10 grid items-center w-full max-w-6xl grid-cols-1 gap-8 lg:gap-16 lg:grid-cols-2">
        {/* Left Side - Branding & Features */}
        <motion.div 
          className="hidden space-y-8 lg:block"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Logo & Headline */}
          <div className="space-y-6">
            <motion.div
              className="inline-flex items-center gap-3 px-5 py-3 border border-gray-200 shadow-sm bg-white/80 backdrop-blur-sm rounded-2xl"
              whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)" }}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-bold text-gray-900">Modern Rental Platform</span>
            </motion.div>

            <motion.h1 
              className="text-5xl font-extrabold leading-tight text-gray-900 lg:text-6xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Welcome to
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                {t('appName')}
              </span>
            </motion.h1>

            <motion.p 
              className="text-xl leading-relaxed text-gray-600"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Transform your rental business with intelligent automation, 
              real-time insights, and seamless team collaboration.
            </motion.p>
          </div>

          {/* Stats */}
          <motion.div 
            className="grid grid-cols-3 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="p-5 text-center transition-all border border-gray-200 shadow-sm bg-white/60 backdrop-blur-sm rounded-2xl hover:shadow-md"
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <stat.icon className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <div className="mb-1 text-2xl font-extrabold text-gray-900">{stat.value}</div>
                <div className="text-xs font-medium text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Feature Cards */}
          <motion.div 
            className="space-y-4"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className={`flex items-start gap-4 p-5 transition-all border group rounded-2xl ${feature.bg} border-gray-200 hover:shadow-lg`}
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0 }
                }}
                whileHover={{ x: 10 }}
              >
                <div className={`flex items-center justify-center flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient}`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="mb-1 font-bold text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Mobile Logo */}
          <div className="mb-8 text-center lg:hidden">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 mb-4 bg-white border border-gray-200 shadow-sm rounded-2xl"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900">{t('appName')}</span>
            </motion.div>
          </div>

          {/* Clean White Login Card */}
          <motion.div 
            className="relative p-8 bg-white border border-gray-200 shadow-2xl md:p-10 rounded-3xl"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="relative">
              {/* Header */}
              <motion.div 
                className="mb-8 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div 
                  className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <LogIn className="w-10 h-10 text-white" />
                </motion.div>
                <h2 className="mb-2 text-3xl font-extrabold text-gray-900">{t('login')}</h2>
                <p className="text-gray-600">Sign in to access your dashboard</p>
              </motion.div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-700">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </label>
                  <div className="relative">
                    <motion.input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="your@email.com"
                      className="w-full px-5 py-4 text-gray-900 placeholder-gray-400 transition-all border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-gray-50 focus:bg-white"
                      required
                      disabled={isLoading}
                      whileFocus={{ scale: 1.01 }}
                    />
                    <AnimatePresence>
                      {focusedField === 'email' && (
                        <motion.div
                          className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 -z-10 blur-lg"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* Password Field */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-700">
                    <Lock className="w-4 h-4" />
                    {t('password')}
                  </label>
                  <div className="relative">
                    <motion.input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Enter your password"
                      className="w-full px-5 py-4 pr-12 text-gray-900 placeholder-gray-400 transition-all border border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 bg-gray-50 focus:bg-white"
                      required
                      disabled={isLoading}
                      whileFocus={{ scale: 1.01 }}
                    />
                    <motion.button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute text-gray-400 transition-colors transform -translate-y-1/2 right-4 top-1/2 hover:text-gray-900"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </motion.button>
                    <AnimatePresence>
                      {focusedField === 'password' && (
                        <motion.div
                          className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 -z-10 blur-lg"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-3 p-4 border border-red-200 rounded-xl bg-red-50"
                    >
                      <AlertCircle className="flex-shrink-0 w-5 h-5 text-red-600" />
                      <p className="text-sm text-red-700">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  className="relative w-full px-6 py-4 overflow-hidden text-lg font-bold text-white transition-all border-0 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:shadow-xl hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed group"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <motion.div 
                          className="w-5 h-5 border-2 border-white rounded-full border-t-transparent"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Signing in...
                      </>
                    ) : (
                      <>
                        {t('login')}
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 transition-opacity opacity-0 bg-gradient-to-r from-cyan-600 to-blue-600 group-hover:opacity-100"></div>
                </motion.button>
              </form>

              {/* Footer Info */}
              <motion.div 
                className="pt-6 mt-8 text-center border-t border-gray-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-center justify-center gap-2 mb-3">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <p className="text-sm text-gray-600">
                    Secured with bank-level encryption
                  </p>
                </div>
                <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                  <a href="#" className="transition-colors hover:text-gray-900">Privacy Policy</a>
                  <span>•</span>
                  <a href="#" className="transition-colors hover:text-gray-900">Terms of Service</a>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Bottom CTA */}
          <motion.div 
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <motion.button
                className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start free trial
              </motion.button>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
