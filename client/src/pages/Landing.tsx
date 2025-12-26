import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { 
  Shield, 
  Users, 
  BookOpen, 
  Award,
  Play,
  FileText,
  Building,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe
} from "lucide-react";
import Hero3D from "@/components/landing/Hero3D";
import { Suspense } from "react";

export default function Landing() {
  const [, setLocation] = useLocation();

  const handleLogin = () => {
    setLocation("/auth");
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col font-sans text-slate-900 dark:text-slate-50">
      <SEOHead
        title="Главная"
        description="Fire Safety KZ - ведущий портал по пожарной безопасности в Казахстане. Нормативная база, обучение, маркетплейс."
      />
      <Header />
      
      {/* Hero Section - Split Layout */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="z-10"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium text-sm mb-6 border border-blue-100 dark:border-blue-800">
                <ShieldCheck className="w-4 h-4" />
                <span>Официальный портал безопасности</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-6">
                Пожарная безопасность <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                  в одном клике
                </span>
              </h1>

              <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 leading-relaxed max-w-lg">
                Единая экосистема для обучения, документации и поиска услуг.
                Всё, что нужно для защиты вашего бизнеса и дома.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={handleLogin}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 h-14 text-lg rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:scale-105"
                >
                  Начать работу
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-lg rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Play className="mr-2 w-4 h-4" />
                  Демо видео
                </Button>
              </div>

              {/* Trust badges */}
              <div className="mt-10 flex items-center gap-6 text-sm font-medium text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>ГОСТ РК</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Сертифицировано</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>24/7 Доступ</span>
                </div>
              </div>
            </motion.div>

            {/* Right Content - 3D Scene */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative h-[500px] w-full lg:h-[600px] flex items-center justify-center"
            >
              {/* Decorative gradients */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] dark:bg-blue-500/20"></div>

              <div className="w-full h-full relative z-10">
                <Suspense fallback={
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                }>
                   <Hero3D />
                </Suspense>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Demo Access Section - Redesigned for Contrast */}
      <section className="py-12 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Демонстрационный доступ</h2>
              <p className="text-slate-500 dark:text-slate-400">Попробуйте платформу в разных ролях без регистрации</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400 bg-white dark:bg-slate-800 px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span>Пароль для всех: 123456</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { role: 'Пользователь', email: 'user@test.kz', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300', icon: Users, desc: 'Доступ к обучению и тестам' },
              { role: 'Поставщик', email: 'supplier@test.kz', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300', icon: Building, desc: 'Управление услугами и заказами' },
              { role: 'Администратор', email: 'admin@test.kz', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300', icon: Shield, desc: 'Полный контроль системы' }
            ].map((acc, i) => (
              <div key={i} className="group relative bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity`}>
                   <acc.icon className="w-24 h-24" />
                </div>

                <div className="relative z-10">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-bold mb-4 ${acc.color}`}>
                    <acc.icon className="w-4 h-4" />
                    {acc.role}
                  </div>
                  <div className="text-lg font-mono text-slate-900 dark:text-slate-200 font-semibold mb-1">
                    {acc.email}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {acc.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              Всё необходимое в одном месте
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Инструменты, знания и специалисты, чтобы сделать безопасность доступной и понятной.
            </p>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              { title: 'Нормативная база', icon: FileText, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', desc: 'Актуальные ГОСТы, СНиПы и приказы РК' },
              { title: 'Обучение и 3D', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', desc: 'Интерактивные курсы и симуляторы' },
              { title: 'Маркетплейс', icon: Globe, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', desc: 'Поиск проверенных поставщиков услуг' },
              { title: 'Экспертиза', icon: Award, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20', desc: 'Консультации и аудит безопасности' },
            ].map((feature, idx) => (
              <motion.div key={idx} variants={item}>
                <div className="h-full p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 hover:bg-white dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 hover:border-slate-200 hover:shadow-xl transition-all duration-300 group">
                  <div className={`w-16 h-16 ${feature.bg} rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`w-8 h-8 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-t border-slate-100 dark:border-slate-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center divide-x divide-slate-100 dark:divide-slate-800">
            {[
              { val: '1000+', label: 'Документов' },
              { val: '500+', label: 'Пользователей' },
              { val: '200+', label: 'Поставщиков' },
              { val: '50+', label: 'Городов' }
            ].map((stat, i) => (
              <div key={i} className="p-4">
                <div className="text-4xl md:text-5xl font-extrabold text-blue-600 dark:text-blue-500 mb-2">{stat.val}</div>
                <div className="text-slate-500 font-medium uppercase tracking-widest text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-slate-900 dark:bg-slate-900 text-white rounded-[2.5rem] p-8 md:p-16 relative overflow-hidden shadow-2xl">
            {/* Background effects */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-[100px] -ml-32 -mb-32"></div>

            <div className="relative z-10 text-center">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
                Готовы обеспечить безопасность?
              </h2>

              <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                Присоединяйтесь к профессиональному сообществу. Регистрируйтесь сейчас и получите полный доступ к платформе.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={handleLogin}
                  className="bg-white text-slate-900 hover:bg-slate-100 font-bold px-12 py-6 text-lg rounded-xl shadow-lg border-2 border-transparent"
                >
                  Создать аккаунт
                </Button>
                <Button
                   size="lg"
                   variant="outline"
                   className="border-slate-700 text-white hover:bg-slate-800 hover:text-white font-bold px-12 py-6 text-lg rounded-xl bg-transparent"
                   onClick={() => window.location.href = 'mailto:info@firesafety.kz'}
                >
                  Связаться с нами
                </Button>
              </div>
              <p className="mt-6 text-sm text-slate-400 opacity-80">
                Бесплатная регистрация для всех типов пользователей
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
