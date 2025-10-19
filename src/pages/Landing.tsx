import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { 
  Building2, 
  Truck, 
  Award, 
  Phone, 
  ArrowRight,
  CheckCircle,
  Users,
  Package,
  FileText,
  BarChart3,
  Shield,
  Zap,
  Clock,
  Star,
  Mail,
  MapPin,
  Sparkles,
  TrendingUp,
  Globe,
  MessageSquare,
  Check,
  X,
  Menu,
  PlayCircle,
  Layers,
  Target,
  Rocket
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageToggle from '../components/LanguageToggle';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: Users,
      title: 'Client Management',
      description: 'Centralized hub for all client data, contacts, and interactions',
      color: 'from-blue-500 to-cyan-500',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-600'
    },
    {
      icon: FileText,
      title: 'Smart Challans',
      description: 'Digital udhar & jama challans with instant generation and tracking',
      color: 'from-pink-500 to-rose-500',
      iconBg: 'bg-pink-500/10',
      iconColor: 'text-pink-600'
    },
    {
      icon: Package,
      title: 'Inventory Control',
      description: 'Real-time stock tracking with automated alerts and insights',
      color: 'from-green-500 to-emerald-500',
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-600'
    },
    {
      icon: BarChart3,
      title: 'Financial Ledger',
      description: 'Complete transaction history with balance tracking and reports',
      color: 'from-purple-500 to-violet-500',
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-600'
    },
    {
      icon: Shield,
      title: 'Bank-Level Security',
      description: 'Enterprise-grade encryption protecting your business data',
      color: 'from-orange-500 to-amber-500',
      iconBg: 'bg-orange-500/10',
      iconColor: 'text-orange-600'
    },
    {
      icon: Zap,
      title: 'Lightning Speed',
      description: 'Optimized performance for instant operations and workflow',
      color: 'from-indigo-500 to-blue-500',
      iconBg: 'bg-indigo-500/10',
      iconColor: 'text-indigo-600'
    }
  ];

  const benefits = [
    { icon: Target, title: '10x Faster', description: 'Complete tasks in seconds, not hours' },
    { icon: TrendingUp, title: '50% Cost Savings', description: 'Reduce operational expenses significantly' },
    { icon: Rocket, title: '99.9% Uptime', description: 'Always available when you need it' },
    { icon: Shield, title: 'SOC 2 Certified', description: 'Enterprise security standards' }
  ];

  const stats = [
    { value: '10K+', label: 'Active Users', color: 'from-blue-500 to-cyan-500' },
    { value: '1M+', label: 'Challans Processed', color: 'from-purple-500 to-pink-500' },
    { value: '₹500Cr+', label: 'Transactions Managed', color: 'from-green-500 to-emerald-500' },
    { value: '4.9/5', label: 'User Rating', color: 'from-orange-500 to-red-500' }
  ];

  const pricingTiers = [
    {
      name: 'Starter',
      price: '₹999',
      period: '/month',
      description: 'Perfect for small businesses',
      features: [
        'Up to 50 clients',
        'Unlimited challans',
        'Basic reports',
        'Email support',
        'Mobile app access'
      ],
      cta: 'Start Free Trial',
      popular: false,
      gradient: 'from-gray-50 to-gray-100'
    },
    {
      name: 'Professional',
      price: '₹1,999',
      period: '/month',
      description: 'For growing businesses',
      features: [
        'Unlimited clients',
        'Unlimited challans',
        'Advanced analytics',
        'Priority support',
        'Custom branding',
        'API access',
        'Multi-user accounts',
        'Export to Excel/PDF'
      ],
      cta: 'Get Started',
      popular: true,
      gradient: 'from-blue-50 to-indigo-50'
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For large organizations',
      features: [
        'Everything in Pro',
        'Dedicated manager',
        'Custom integrations',
        'On-premise option',
        'SLA guarantee',
        'Training sessions',
        'White-label solution'
      ],
      cta: 'Contact Sales',
      popular: false,
      gradient: 'from-purple-50 to-pink-50'
    }
  ];

  const testimonials = [
    {
      name: 'Rajesh Patel',
      role: 'CEO, Construction Co.',
      content: 'This platform revolutionized our rental operations. We saved 15 hours per week on paperwork.',
      avatar: 'R',
      rating: 5,
      company: 'BuildTech Industries'
    },
    {
      name: 'Priya Sharma',
      role: 'Operations Head',
      content: 'The real-time tracking feature is incredible. We always know exactly what equipment is where.',
      avatar: 'P',
      rating: 5,
      company: 'Equipment Solutions'
    },
    {
      name: 'Amit Kumar',
      role: 'Finance Manager',
      content: 'Client ledger automation reduced our billing errors to zero. The ROI was immediate.',
      avatar: 'A',
      rating: 5,
      company: 'Rental Express'
    }
  ];

  return (
    <div ref={containerRef} className="relative min-h-screen bg-white">
      {/* Floating Navigation - Glassmorphism */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`fixed top-4 left-4 right-4 z-50 transition-all duration-500 ${
          scrolled 
            ? 'bg-white/80 backdrop-blur-xl shadow-lg shadow-black/5 border border-gray-200/50' 
            : 'bg-white/60 backdrop-blur-md border border-white/20'
        } rounded-2xl`}
      >
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 blur-lg opacity-60"></div>
                <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              </div>
              <span className="text-xl font-bold text-gray-900">{t('appName')}</span>
            </motion.div>

            {/* Desktop Menu */}
            <div className="items-center hidden gap-8 md:flex">
              {['Features', 'Pricing', 'About'].map((item) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-sm font-medium text-gray-700 transition-colors hover:text-blue-600"
                  whileHover={{ y: -2 }}
                >
                  {item}
                </motion.a>
              ))}
              <LanguageToggle />
              <motion.button
                onClick={() => navigate('/login')}
                className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:shadow-blue-500/50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t('login')}
              </motion.button>
            </div>

            {/* Mobile Menu */}
            <div className="flex items-center gap-3 md:hidden">
              <LanguageToggle />
              <motion.button whileTap={{ scale: 0.9 }}>
                <Menu className="w-6 h-6 text-gray-900" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section - Gradient Mesh Background */}
      <section className="relative pt-32 pb-20 overflow-hidden sm:pt-40 sm:pb-32">
        {/* Animated Gradient Mesh */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 rounded-full w-96 h-96 bg-blue-400/30 mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute bottom-0 left-0 rounded-full w-96 h-96 bg-purple-400/30 mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full top-1/2 left-1/2 w-96 h-96 bg-pink-400/30 mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <motion.div 
          className="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          <div className="text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 mb-8 border rounded-full bg-white/60 backdrop-blur-sm border-gray-200/50"
            >
              <span className="relative flex w-2 h-2">
                <span className="absolute inline-flex w-full h-full bg-green-400 rounded-full opacity-75 animate-ping"></span>
                <span className="relative inline-flex w-2 h-2 bg-green-500 rounded-full"></span>
              </span>
              <span className="text-sm font-medium text-gray-900">Trusted by 10,000+ businesses across India</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-6 text-5xl font-extrabold leading-tight text-gray-900 sm:text-6xl lg:text-7xl"
            >
              Rental Management
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                Reimagined
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="max-w-3xl mx-auto mb-10 text-xl leading-relaxed text-gray-600 sm:text-2xl"
            >
              The all-in-one platform that brings clarity to your rental operations. 
              Track inventory, manage clients, and grow revenue—all in one place.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <motion.button
                onClick={() => navigate('/login')}
                className="relative px-8 py-4 text-lg font-semibold text-white group rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-2xl hover:shadow-blue-500/50"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 transition-opacity opacity-0 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 group-hover:opacity-100 blur"></div>
              </motion.button>

              <motion.button
                className="flex items-center gap-2 px-8 py-4 text-lg font-semibold text-gray-900 transition-all border-2 border-gray-300 rounded-2xl hover:border-gray-400 hover:bg-gray-50"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <PlayCircle className="w-5 h-5" />
                Watch Demo
              </motion.button>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-gray-600"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Cancel anytime</span>
              </div>
            </motion.div>
          </div>

          {/* Floating Product Preview */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
            className="relative max-w-5xl mx-auto mt-20"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl"></div>
            <div className="relative p-2 border shadow-2xl bg-white/80 backdrop-blur-sm rounded-3xl border-gray-200/50">
              <div className="overflow-hidden aspect-video rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200">
                {/* Placeholder for dashboard preview */}
                <div className="flex items-center justify-center w-full h-full">
                  <div className="text-center">
                    <Layers className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium text-gray-500">Dashboard Preview</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section - Glassmorphism Cards */}
      <section className="relative py-16 overflow-hidden">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <motion.div 
            className="grid grid-cols-2 gap-4 md:grid-cols-4 sm:gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="relative p-6 overflow-hidden border shadow-lg bg-white/80 backdrop-blur-sm rounded-2xl border-gray-200/50 sm:p-8"
              >
                <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.color} opacity-10 rounded-full blur-2xl`}></div>
                <div className="relative text-center">
                  <div className={`mb-2 text-3xl font-extrabold sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-gray-600 sm:text-base">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section - Bento Grid */}
      <section id="features" className="py-20 sm:py-32">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            className="mb-16 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 border rounded-full bg-blue-50/50 border-blue-200/50">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-blue-600">FEATURES</span>
            </div>
            <h2 className="mb-4 text-4xl font-extrabold text-gray-900 sm:text-5xl lg:text-6xl">
              Everything you need,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                nothing you don't
              </span>
            </h2>
            <p className="max-w-3xl mx-auto text-xl text-gray-600">
              Powerful features that simplify complex workflows and help you focus on growth
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.03, y: -5 }}
                className="relative p-8 overflow-hidden transition-all border group bg-white/50 backdrop-blur-sm rounded-3xl border-gray-200/50 hover:shadow-xl hover:border-gray-300/50"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500`}></div>
                
                <div className="relative">
                  <div className={`inline-flex p-4 mb-5 ${feature.iconBg} rounded-2xl`}>
                    <feature.icon className={`w-8 h-8 ${feature.iconColor}`} />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-gray-900">{feature.title}</h3>
                  <p className="text-base leading-relaxed text-gray-600">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section - Split Layout */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50 sm:py-32">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 border rounded-full bg-purple-50/50 border-purple-200/50">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-semibold text-purple-600">WHY CHOOSE US</span>
              </div>
              <h2 className="mb-6 text-4xl font-extrabold text-gray-900 sm:text-5xl">
                Built for businesses that
                <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                  demand excellence
                </span>
              </h2>
              <p className="mb-8 text-lg leading-relaxed text-gray-600">
                Join thousands of businesses transforming their operations with our platform. 
                Experience the difference of truly modern rental management.
              </p>

              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 10 }}
                    className="flex items-start gap-4 p-4 transition-all border rounded-2xl bg-white/50 backdrop-blur-sm border-gray-200/50 hover:shadow-lg"
                  >
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                      <benefit.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="mb-1 text-lg font-bold text-gray-900">{benefit.title}</h4>
                      <p className="text-gray-600">{benefit.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl"></div>
              <div className="relative p-8 border shadow-2xl bg-white/80 backdrop-blur-sm rounded-3xl border-gray-200/50">
                <div className="space-y-6">
                  <div className="p-6 transition-all border rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200/50 hover:shadow-lg">
                    <div className="flex items-center gap-4 mb-4">
                      <Building2 className="w-10 h-10 text-blue-600" />
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">{t('ourServices')}</h4>
                        <p className="text-sm text-gray-600">Complete rental ecosystem</p>
                      </div>
                    </div>
                    <p className="text-gray-700">{t('servicesText')}</p>
                  </div>

                  <div className="p-6 transition-all border rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/50 hover:shadow-lg">
                    <div className="flex items-center gap-4 mb-4">
                      <Award className="w-10 h-10 text-purple-600" />
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">{t('whyChooseUs')}</h4>
                        <p className="text-sm text-gray-600">Industry-leading platform</p>
                      </div>
                    </div>
                    <p className="text-gray-700">{t('whyChooseText')}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials - Carousel */}
      <section className="py-20 sm:py-32">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 border rounded-full bg-green-50/50 border-green-200/50">
              <Star className="w-5 h-5 text-green-600" />
              <span className="text-sm font-semibold text-green-600">TESTIMONIALS</span>
            </div>
            <h2 className="mb-4 text-4xl font-extrabold text-gray-900 sm:text-5xl">
              Loved by thousands of businesses
            </h2>
            <p className="max-w-2xl mx-auto text-xl text-gray-600">
              See what our customers have to say about their experience
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="relative p-8 overflow-hidden transition-all border group bg-white/80 backdrop-blur-sm rounded-3xl border-gray-200/50 hover:shadow-xl"
              >
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400/20 to-orange-400/20 blur-2xl"></div>
                
                <div className="relative">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="mb-6 text-base leading-relaxed text-gray-700">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 text-lg font-bold text-white rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                      <div className="text-xs text-gray-500">{testimonial.company}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section - Modern Cards */}
      <section id="pricing" className="py-20 bg-gradient-to-b from-gray-50 to-white sm:py-32">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 border rounded-full bg-blue-50/50 border-blue-200/50">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-blue-600">PRICING</span>
            </div>
            <h2 className="mb-4 text-4xl font-extrabold text-gray-900 sm:text-5xl">
              Simple, transparent pricing
            </h2>
            <p className="max-w-2xl mx-auto text-xl text-gray-600">
              Choose the perfect plan for your business. Start free, upgrade anytime.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: tier.popular ? 1.05 : 1.03, y: -10 }}
                className={`relative p-8 overflow-hidden border rounded-3xl ${
                  tier.popular 
                    ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300 shadow-2xl shadow-blue-500/20 ring-2 ring-blue-500' 
                    : 'bg-white/80 backdrop-blur-sm border-gray-200/50'
                }`}
              >
                {tier.popular && (
                  <div className="absolute top-0 right-0 px-4 py-1 text-xs font-bold text-white rounded-bl-2xl bg-gradient-to-r from-blue-600 to-indigo-600">
                    MOST POPULAR
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="mb-2 text-2xl font-bold text-gray-900">{tier.name}</h3>
                  <p className="text-sm text-gray-600">{tier.description}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-extrabold text-gray-900">{tier.price}</span>
                    {tier.period && <span className="text-gray-600">{tier.period}</span>}
                  </div>
                </div>

                <motion.button
                  onClick={() => navigate('/login')}
                  className={`w-full py-4 mb-8 text-base font-semibold rounded-xl transition-all ${
                    tier.popular
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/50'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {tier.cta}
                </motion.button>

                <ul className="space-y-4">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="flex-shrink-0 w-5 h-5 mt-0.5 text-green-600" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Gradient */}
      <section className="relative py-20 overflow-hidden sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600"></div>
        <div className="absolute inset-0 opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative max-w-4xl px-4 mx-auto text-center sm:px-6 lg:px-8"
        >
          <h2 className="mb-6 text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl">
            Ready to transform your business?
          </h2>
          <p className="mb-10 text-xl text-white/90 sm:text-2xl">
            Join 10,000+ businesses already using our platform
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <motion.button
              onClick={() => navigate('/login')}
              className="px-10 py-5 text-lg font-bold text-blue-600 transition-all bg-white shadow-2xl rounded-2xl hover:shadow-white/50"
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Free Trial
            </motion.button>
            <motion.button
              className="px-10 py-5 text-lg font-bold text-white transition-all border-2 border-white rounded-2xl hover:bg-white/10"
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              Contact Sales
            </motion.button>
          </div>
          <p className="mt-8 text-sm text-white/80">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </motion.div>
      </section>

      {/* Footer - Minimal */}
      <footer className="py-12 border-t bg-gray-50 border-gray-200/50">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">{t('appName')}</span>
            </div>
            <div className="flex gap-8 text-sm text-gray-600">
              <a href="#" className="transition-colors hover:text-gray-900">Privacy</a>
              <a href="#" className="transition-colors hover:text-gray-900">Terms</a>
              <a href="#" className="transition-colors hover:text-gray-900">Contact</a>
            </div>
          </div>
          <div className="pt-6 mt-6 text-sm text-center text-gray-500 border-t border-gray-200/50">
            © 2025 {t('appName')}. All rights reserved.
          </div>
        </div>
      </footer>

      {/* CSS Animations */}
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

export default Landing;
