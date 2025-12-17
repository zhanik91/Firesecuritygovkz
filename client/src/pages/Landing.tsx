import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  Shield, 
  Users, 
  BookOpen, 
  Award,
  ChevronRight,
  Play,
  FileText,
  Building,
  Flame
} from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const handleGitHubLogin = () => {
    window.location.href = "/auth/github";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-kz-blue to-kz-blue-light text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-kz-yellow rounded-full flex items-center justify-center">
              <Flame className="w-10 h-10 text-kz-blue" />
            </div>
          </div>
          
          <h1 className="text-5xl font-bold mb-6">
            Добро пожаловать в <br />
            <span className="text-kz-yellow">Fire Safety KZ</span>
          </h1>
          
          <p className="text-xl mb-8 max-w-3xl mx-auto text-gray-200">
            Ведущий портал по пожарной безопасности в Казахстане. 
            Получите доступ к нормативной базе, обучающим материалам и профессиональному маркетплейсу.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => window.location.href = "/auth"}
              className="bg-kz-yellow text-kz-blue hover:bg-kz-yellow-warm font-semibold px-8 py-4 text-lg"
            >
              Войти в систему
              <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-kz-blue font-semibold px-8 py-4 text-lg"
            >
              <Play className="mr-2 w-5 h-5" />
              Обзор платформы
            </Button>
          </div>
          
          {/* Тестовые аккаунты для демонстрации */}
          <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold text-white mb-4">Тестовые аккаунты для демонстрации:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white/20 rounded-lg p-3">
                <div className="font-semibold text-kz-yellow mb-2">👤 Пользователь</div>
                <div className="text-white">Email: user@test.kz</div>
                <div className="text-white">Пароль: 123456</div>
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <div className="font-semibold text-green-400 mb-2">🛠️ Поставщик</div>
                <div className="text-white">Email: supplier@test.kz</div>
                <div className="text-white">Пароль: 123456</div>
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <div className="font-semibold text-red-400 mb-2">⚡ Администратор</div>
                <div className="text-white">Email: admin@test.kz</div>
                <div className="text-white">Пароль: admin123</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Комплексное решение для пожарной безопасности
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Все необходимые инструменты и ресурсы для обеспечения пожарной безопасности 
              в одной интегрированной платформе
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="card-hover">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-red-600" />
                </div>
                <CardTitle className="text-xl">Нормативная база</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Полная коллекция ГОСТов, НПБ, приказов и постановлений по пожарной безопасности РК
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Обучение</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Образовательные материалы, презентации, видеокурсы и практические руководства
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Маркетплейс</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Профессиональная площадка для поиска подрядчиков и размещения заказов
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-yellow-600" />
                </div>
                <CardTitle className="text-xl">Экспертиза</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Консультации специалистов, аудит безопасности и сертификационные услуги
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-100 dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-kz-blue dark:text-kz-blue-light mb-2">1000+</div>
              <div className="text-gray-600 dark:text-gray-400">Документов</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-kz-blue dark:text-kz-blue-light mb-2">500+</div>
              <div className="text-gray-600 dark:text-gray-400">Пользователей</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-kz-blue dark:text-kz-blue-light mb-2">200+</div>
              <div className="text-gray-600 dark:text-gray-400">Поставщиков</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-kz-blue dark:text-kz-blue-light mb-2">50+</div>
              <div className="text-gray-600 dark:text-gray-400">Городов</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Building className="w-16 h-16 text-kz-blue mx-auto mb-8" />
          
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Готовы обеспечить безопасность вашего объекта?
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Присоединяйтесь к профессиональному сообществу специалистов по пожарной безопасности
          </p>
          
          <Button 
            size="lg" 
            onClick={handleLogin}
            className="bg-kz-blue text-white hover:bg-kz-blue-light font-semibold px-12 py-4 text-lg"
          >
            Начать работу
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
