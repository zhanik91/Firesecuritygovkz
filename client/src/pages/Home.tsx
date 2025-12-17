import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { NetworkStatus, InstallPWAPrompt, OfflineIndicator } from '@/components/PWAFeatures';
import { useLanguage } from '@/hooks/useLanguage';
import HeroSlider from "@/components/HeroSlider";
import Sidebar from "@/components/Sidebar";
import ArticleCard from "@/components/ArticleCard";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Shield,
  Clipboard,
  Users,
  Calculator,
  ArrowRight,
  TrendingUp,
  Flame,
  BookOpen,
  Store,
  Zap,
  Target,
  Gamepad2,
  Bot,
} from "lucide-react";
// 1. Импортируем motion из framer-motion
import { motion } from "framer-motion";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featuredImageUrl?: string;
  publishedAt: string;
  views: number;
  tags?: string[];
  author?: {
    firstName?: string;
    lastName?: string;
  };
}

export default function Home() {
  const { t } = useLanguage();
  
  const { data: featuredPosts = [], isLoading: featuredLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts/featured"],
  });

  const { data: latestPosts = [], isLoading: latestLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* PWA компоненты */}
      <OfflineIndicator />
      <NetworkStatus />
      <InstallPWAPrompt />
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Красивый градиентный фон */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-red-900 dark:from-slate-900 dark:via-blue-950 dark:to-red-950"></div>
        
        {/* Анимированные геометрические фигуры */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-full blur-3xl"
            animate={{ 
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"
            animate={{ 
              x: [0, -80, 0],
              y: [0, 60, 0],
              scale: [1, 0.9, 1]
            }}
            transition={{ 
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute bottom-20 left-1/3 w-64 h-64 bg-gradient-to-r from-yellow-500/20 to-red-500/20 rounded-full blur-3xl"
            animate={{ 
              x: [0, 50, -25, 0],
              y: [0, -30, 20, 0],
            }}
            transition={{ 
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        {/* Сетка паттерна */}
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center bg-gradient-to-r from-red-500/20 to-orange-500/20 backdrop-blur-sm border border-red-300/30 rounded-full px-6 py-3 mb-8">
              <Flame className="w-5 h-5 mr-2 text-orange-400" />
              <span className="text-sm font-medium text-white">🏆 Официальная платформа пожарной безопасности РК</span>
            </div>
          </motion.div>

          <motion.h1 
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
              Пожарная безопасность
            </span>
            <br/>
            <span className="bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
              Казахстана
            </span>
          </motion.h1>

          <motion.p 
            className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto leading-relaxed text-blue-100"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            Единая цифровая экосистема для специалистов: актуальные НПА, точные калькуляторы, 
            интерактивное обучение и профессиональный маркетплейс услуг
          </motion.p>

          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto mb-16"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <Link href="/calculators">
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="group"
              >
                <Button size="lg" className="w-full h-20 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold text-lg shadow-2xl shadow-red-500/25 border-0 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-400/0 via-white/10 to-red-400/0 -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <Calculator className="mr-3 h-6 w-6" />
                  <span className="relative z-10">Калькуляторы ПБ</span>
                </Button>
              </motion.div>
            </Link>

            <Link href="/ai-assistant">
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="group"
              >
                <Button size="lg" className="w-full h-20 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white font-semibold text-lg shadow-2xl shadow-purple-500/25 border-0 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-white/10 to-purple-400/0 -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <Bot className="mr-3 h-6 w-6" />
                  <span className="relative z-10">ИИ-Ассистент</span>
                </Button>
              </motion.div>
            </Link>

            <Link href="/games">
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="group"
              >
                <Button size="lg" className="w-full h-20 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold text-lg shadow-2xl shadow-green-500/25 border-0 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400/0 via-white/10 to-green-400/0 -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <Gamepad2 className="mr-3 h-6 w-6" />
                  <span className="relative z-10">Интерактивные игры</span>
                </Button>
              </motion.div>
            </Link>

            <Link href="/marketplace">
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="group"
              >
                <Button size="lg" className="w-full h-20 bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white font-semibold text-lg shadow-2xl shadow-orange-500/25 border-0 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400/0 via-white/10 to-orange-400/0 -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <Store className="mr-3 h-6 w-6" />
                  <span className="relative z-10">Маркетплейс услуг</span>
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {/* Статистика */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            <motion.div 
              className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-4xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">15,000+</div>
              <div className="text-blue-100 mt-2">Специалистов используют</div>
            </motion.div>
            <motion.div 
              className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">98%</div>
              <div className="text-blue-100 mt-2">Точность расчётов</div>
            </motion.div>
            <motion.div 
              className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">24/7</div>
              <div className="text-blue-100 mt-2">Доступность сервиса</div>
            </motion.div>
          </motion.div>
        </div>

        {/* Плавающие иконки */}
        <motion.div
          className="absolute top-20 right-20 text-white/20"
          animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
        >
          <Shield className="w-12 h-12" />
        </motion.div>
        <motion.div
          className="absolute bottom-20 left-20 text-white/20"
          animate={{ y: [0, 15, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        >
          <Flame className="w-10 h-10" />
        </motion.div>
        <motion.div
          className="absolute top-1/3 left-10 text-white/20"
          animate={{ x: [0, 10, 0], y: [0, -10, 0] }}
          transition={{ duration: 7, repeat: Infinity }}
        >
          <Calculator className="w-8 h-8" />
        </motion.div>
      </section>

      {/* Main Sections - Like fireman.club */}
      <section className="relative bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-950 py-20">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.02' fill-rule='evenodd'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-slate-800 dark:from-white dark:via-blue-200 dark:to-white bg-clip-text text-transparent mb-6">
              Основные разделы
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Профессиональные инструменты для специалистов пожарной безопасности
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Пожарная безопасность */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-gradient-to-br from-white to-red-50 dark:from-gray-800 dark:to-red-950 hover:shadow-2xl hover:shadow-red-500/20 transition-all duration-500 group border-0 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="pb-3 relative z-10">
                  <motion.div 
                    className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Shield className="w-8 h-8 text-white" />
                  </motion.div>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Пожарная безопасность</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">Комплексные решения для обеспечения безопасности объектов</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 relative z-10">
                  <div className="grid grid-cols-1 gap-3">
                    <Link href="/sections/documents">
                      <Button variant="ghost" className="w-full justify-start text-sm h-12 hover:bg-red-50 dark:hover:bg-red-950">
                        📋 Нормативная база
                      </Button>
                    </Link>
                    <Link href="/calculators">
                      <Button variant="ghost" className="w-full justify-start text-sm h-12 hover:bg-red-50 dark:hover:bg-red-950">
                        🧮 Калькуляторы расчетов
                      </Button>
                    </Link>
                    <Link href="/sections/literature">
                      <Button variant="ghost" className="w-full justify-start text-sm h-12 hover:bg-red-50 dark:hover:bg-red-950">
                        📚 Обучающие материалы
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Пожарная техника */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-950 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 group border-0 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="pb-3 relative z-10">
                  <motion.div 
                    className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Flame className="w-8 h-8 text-white" />
                  </motion.div>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Пожарная техника</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">Современное оборудование и системы пожаротушения</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 relative z-10">
                  <div className="grid grid-cols-1 gap-3">
                    <Link href="/marketplace?category=equipment">
                      <Button variant="ghost" className="w-full justify-start text-sm h-12 hover:bg-blue-50 dark:hover:bg-blue-950">
                        🚒 Пожарные автомобили
                      </Button>
                    </Link>
                    <Link href="/marketplace?category=pumps">
                      <Button variant="ghost" className="w-full justify-start text-sm h-12 hover:bg-blue-50 dark:hover:bg-blue-950">
                        ⚙️ Пожарные насосы
                      </Button>
                    </Link>
                    <Link href="/marketplace?category=extinguishers">
                      <Button variant="ghost" className="w-full justify-start text-sm h-12 hover:bg-blue-50 dark:hover:bg-blue-950">
                        🧯 Огнетушители
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Обучение и тренировки */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-green-950 hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-500 group border-0 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="pb-3 relative z-10">
                  <motion.div 
                    className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Users className="w-8 h-8 text-white" />
                  </motion.div>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Обучение и подготовка</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">Профессиональное развитие специалистов</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 relative z-10">
                  <div className="grid grid-cols-1 gap-3">
                    <Link href="/games">
                      <Button variant="ghost" className="w-full justify-start text-sm h-12 hover:bg-green-50 dark:hover:bg-green-950">
                        🎮 Интерактивные игры
                      </Button>
                    </Link>
                    <Link href="/marketplace?category=training">
                      <Button variant="ghost" className="w-full justify-start text-sm h-12 hover:bg-green-50 dark:hover:bg-green-950">
                        🎓 Курсы обучения
                      </Button>
                    </Link>
                    <Link href="/sections/literature?topic=first-aid">
                      <Button variant="ghost" className="w-full justify-start text-sm h-12 hover:bg-green-50 dark:hover:bg-green-950">
                        🏥 Первая помощь
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Content Area */}
          <div className="lg:col-span-2">
            {/* Hero Slider */}
            <HeroSlider posts={featuredPosts} isLoading={featuredLoading} />

            {/* Professional Sections */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <BookOpen className="mr-3 w-6 h-6 text-red-600" />
                Профессиональные разделы
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Пожарная автоматика */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <Zap className="mr-2 w-5 h-5 text-yellow-600" />
                      Пожарная автоматика
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>• Пожарные извещатели</div>
                      <div>• Системы оповещения и управления эвакуацией</div>
                      <div>• Приборы приемно-контрольные пожарные</div>
                      <div>• Приборы управления пожаротушением</div>
                    </div>
                    <Link href="/sections/documents?category=automation">
                      <Button variant="outline" size="sm" className="mt-3">
                        Подробнее <ArrowRight className="ml-1 w-3 h-3" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Средства пожаротушения */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <Shield className="mr-2 w-5 h-5 text-blue-600" />
                      Средства пожаротушения
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>• Огнетушители</div>
                      <div>• Установки и системы пожаротушения</div>
                      <div>• Огнетушащие вещества</div>
                      <div>• Противопожарное водоснабжение</div>
                    </div>
                    <Link href="/calculators/fire-extinguishers">
                      <Button variant="outline" size="sm" className="mt-3">
                        Рассчитать <Calculator className="ml-1 w-3 h-3" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Снаряжение и защита */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <Users className="mr-2 w-5 h-5 text-green-600" />
                      Снаряжение пожарных
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>• Дыхательные аппараты СИЗОД</div>
                      <div>• Средства защиты пожарных</div>
                      <div>• Технические средства пожарных</div>
                      <div>• Пожарно-техническое оборудование</div>
                    </div>
                    <Link href="/marketplace?category=equipment">
                      <Button variant="outline" size="sm" className="mt-3">
                        В каталог <Store className="ml-1 w-3 h-3" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Основы безопасности */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <Target className="mr-2 w-5 h-5 text-purple-600" />
                      Основы безопасности
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>• Действия при пожаре или возгорании</div>
                      <div>• Правила эвакуации при пожаре</div>
                      <div>• Действия в чрезвычайных ситуациях</div>
                      <div>• Гражданская оборона</div>
                    </div>
                    <Link href="/games">
                      <Button variant="outline" size="sm" className="mt-3">
                        Тренажер <Gamepad2 className="ml-1 w-3 h-3" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Latest News */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center">
                  <TrendingUp className="mr-2 w-6 h-6 text-kz-blue" />
                  Последние обновления
                </h2>
                <Link href="/sections/articles">
                  <Button variant="ghost" className="text-kz-blue hover:text-kz-blue-light">
                    Все материалы <ArrowRight className="ml-1 w-4 h-4" />
                  </Button>
                </Link>
              </div>

              {latestLoading ? (
                <div className="space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                      <div className="animate-pulse">
                        <div className="flex space-x-4">
                          <div className="bg-gray-300 dark:bg-gray-600 rounded-lg w-48 h-32"></div>
                          <div className="flex-1 space-y-3">
                            <div className="bg-gray-300 dark:bg-gray-600 h-4 rounded w-3/4"></div>
                            <div className="bg-gray-300 dark:bg-gray-600 h-4 rounded w-1/2"></div>
                            <div className="bg-gray-300 dark:bg-gray-600 h-3 rounded w-full"></div>
                            <div className="bg-gray-300 dark:bg-gray-600 h-3 rounded w-2/3"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : latestPosts.length > 0 ? (
                <div className="space-y-6">
                  {latestPosts.slice(0, 5).map((post) => (
                    <ArticleCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <p className="text-gray-500 dark:text-gray-400">Новости пока не добавлены</p>
                </div>
              )}

              {/* Load More Button */}
              {latestPosts.length > 5 && (
                <div className="text-center mt-8">
                  <Button className="bg-kz-blue text-white hover:bg-kz-blue-light">
                    Загрузить еще
                  </Button>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Sidebar />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}