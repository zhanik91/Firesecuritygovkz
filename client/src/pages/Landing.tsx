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
  ChevronRight,
  Play,
  FileText,
  Building,
  Flame,
  CheckCircle,
  ArrowRight
} from "lucide-react";

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <SEOHead
        title="Главная"
        description="Fire Safety KZ - ведущий портал по пожарной безопасности в Казахстане. Нормативная база, обучение, маркетплейс."
      />
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-kz-blue to-blue-900 text-white py-24 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-kz-yellow/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 -left-24 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 text-center z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-8"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-kz-yellow to-orange-500 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-6 transition-transform">
              <Flame className="w-12 h-12 text-white" />
            </div>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight"
          >
            Безопасность <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-kz-yellow to-orange-400">
              превыше всего
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-blue-100 leading-relaxed"
          >
            Fire Safety KZ — это единая экосистема для профессионалов пожарной безопасности.
            Обучение, документы и заказы в одном месте.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button 
              size="lg" 
              onClick={handleLogin}
              className="bg-kz-yellow text-kz-blue hover:bg-white hover:text-kz-blue font-bold px-8 py-6 text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1"
            >
              Начать бесплатно
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm font-semibold px-8 py-6 text-lg rounded-xl"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Play className="mr-2 w-5 h-5 fill-current" />
              Как это работает
            </Button>
          </motion.div>
          
          {/* Demo Accounts */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-16 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 max-w-4xl mx-auto"
          >
            <h3 className="text-lg font-medium text-blue-200 mb-6 uppercase tracking-wider text-center">Демонстрационный доступ</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              {[
                { role: 'Пользователь', email: 'user@test.kz', color: 'text-kz-yellow', icon: Users },
                { role: 'Поставщик', email: 'supplier@test.kz', color: 'text-green-400', icon: Building },
                { role: 'Администратор', email: 'admin@test.kz', color: 'text-red-400', icon: Shield }
              ].map((acc, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors border border-white/5">
                  <div className={`flex items-center gap-2 font-bold ${acc.color} mb-2`}>
                    <acc.icon className="w-4 h-4" />
                    {acc.role}
                  </div>
                  <div className="text-sm text-gray-300 font-mono bg-black/20 p-2 rounded mb-1">
                    {acc.email}
                  </div>
                  <div className="text-xs text-gray-400">Пароль: <span className="text-white">123456</span></div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto text-gray-50 dark:text-gray-900 fill-current">
            <path fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200 border-none px-4 py-1">Возможности</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Всё необходимое в одном месте
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Мы объединили инструменты, знания и специалистов, чтобы сделать пожарную безопасность доступной и понятной.
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
              { title: 'Маркетплейс', icon: Users, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', desc: 'Поиск проверенных поставщиков услуг' },
              { title: 'Экспертиза', icon: Award, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20', desc: 'Консультации и аудит безопасности' },
            ].map((feature, idx) => (
              <motion.div key={idx} variants={item}>
                <Card className="h-full border-none shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-gray-800">
                  <CardHeader className="text-center pb-2">
                    <div className={`w-20 h-20 ${feature.bg} rounded-2xl flex items-center justify-center mx-auto mb-6 transform transition-transform hover:scale-110 duration-300`}>
                      <feature.icon className={`w-10 h-10 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center text-base">
                      {feature.desc}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { val: '1000+', label: 'Документов' },
              { val: '500+', label: 'Пользователей' },
              { val: '200+', label: 'Поставщиков' },
              { val: '50+', label: 'Городов' }
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-5xl font-bold text-kz-yellow mb-2">{stat.val}</div>
                <div className="text-gray-400 font-medium uppercase tracking-widest text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <Card className="bg-gradient-to-r from-kz-blue to-blue-800 text-white border-none p-12 rounded-3xl relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-kz-yellow/10 rounded-full blur-3xl -ml-32 -mb-32"></div>

            <div className="relative z-10">
              <Building className="w-20 h-20 text-kz-yellow mx-auto mb-8" />

              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Готовы обеспечить безопасность?
              </h2>

              <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                Присоединяйтесь к профессиональному сообществу. Регистрируйтесь сейчас и получите полный доступ к платформе.
              </p>

              <Button
                size="lg"
                onClick={handleLogin}
                className="bg-white text-kz-blue hover:bg-gray-100 font-bold px-12 py-6 text-lg rounded-xl shadow-lg"
              >
                Создать аккаунт
              </Button>
              <p className="mt-4 text-sm text-blue-200 opacity-80">Это займет не более 2 минут</p>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
    return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>{children}</span>
}
