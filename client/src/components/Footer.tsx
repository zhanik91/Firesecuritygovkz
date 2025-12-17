import { Link } from "wouter";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Flame,
  Facebook,
  Twitter,
  Linkedin,
  Send,
  MessageCircle,
  Calculator,
  Shield,
  BookOpen,
  Gamepad2,
  Store,
  Search,
  HelpCircle,
  Code
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <Flame className="h-8 w-8 text-red-500 mr-2" />
              <span className="text-2xl font-bold">FireSafety KZ</span>
            </div>
            <p className="text-gray-400 mb-6">
              Официальная цифровая платформа пожарной безопасности Республики Казахстан. 
              Актуальные НПА, точные калькуляторы, интерактивное обучение и профессиональный маркетплейс услуг.
            </p>

            {/* Контактная информация */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center text-gray-400">
                <Phone className="h-4 w-4 mr-2" />
                <span>+7 (727) 123-45-67</span>
              </div>
              <div className="flex items-center text-gray-400">
                <Mail className="h-4 w-4 mr-2" />
                <span>info@firesafety.kz</span>
              </div>
              <div className="flex items-center text-gray-400">
                <MapPin className="h-4 w-4 mr-2" />
                <span>г. Алматы, ул. Абая, 150</span>
              </div>
            </div>

            {/* Социальные сети */}
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Telegram</span>
                <MessageCircle className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">WhatsApp</span>
                <Phone className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987c6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297L3.851 16.66l.708-1.297c.708.708 1.691 1.136 2.798 1.136c1.297 0 2.356-.49 3.173-1.297c.817-.708 1.225-1.691 1.225-2.891c0-1.2-.408-2.183-1.225-2.891C9.713 8.712 8.654 8.223 7.357 8.223c-1.107 0-2.09.428-2.798 1.136L3.851 8.062l1.275-.968c.875-.708 2.026-1.297 3.323-1.297c1.798 0 3.323.708 4.62 2.004c1.297 1.297 1.946 2.823 1.946 4.621c0 1.798-.649 3.324-1.946 4.621C11.772 18.34 10.247 18.989 8.449 18.989z"/>
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-red-400">Инструменты</h3>
            <ul className="space-y-3">
              <li><a href="/calculators/fire-extinguishers" className="text-gray-400 hover:text-white transition-colors flex items-center"><Calculator className="h-4 w-4 mr-2"/>Огнетушители</a></li>
              <li><a href="/calculators/ngps" className="text-gray-400 hover:text-white transition-colors flex items-center"><Shield className="h-4 w-4 mr-2"/>НГПС</a></li>
              <li><a href="/calculators/methodology" className="text-gray-400 hover:text-white transition-colors flex items-center"><BookOpen className="h-4 w-4 mr-2"/>Методичка</a></li>
              <li><a href="/games" className="text-gray-400 hover:text-white transition-colors flex items-center"><Gamepad2 className="h-4 w-4 mr-2"/>Обучающие игры</a></li>
              <li><a href="/marketplace" className="text-gray-400 hover:text-white transition-colors flex items-center"><Store className="h-4 w-4 mr-2"/>Маркетплейс</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-red-400">Поддержка</h3>
            <ul className="space-y-3">
              <li><a href="/search" className="text-gray-400 hover:text-white transition-colors flex items-center"><Search className="h-4 w-4 mr-2"/>Поиск НПА</a></li>
              <li><a href="/help" className="text-gray-400 hover:text-white transition-colors flex items-center"><HelpCircle className="h-4 w-4 mr-2"/>Справка</a></li>
              <li><a href="/contact" className="text-gray-400 hover:text-white transition-colors flex items-center"><Mail className="h-4 w-4 mr-2"/>Обратная связь</a></li>
              <li><a href="/updates" className="text-gray-400 hover:text-white transition-colors flex items-center"><Clock className="h-4 w-4 mr-2"/>Обновления</a></li>
              <li><a href="/api" className="text-gray-400 hover:text-white transition-colors flex items-center"><Code className="h-4 w-4 mr-2"/>API</a></li>
            </ul>
          </div>
        </div>

        {/* Дополнительная информация */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h4 className="font-semibold text-red-400 mb-2">Актуальность данных</h4>
              <p className="text-sm text-gray-400">
                Все нормативы и расчёты соответствуют действующему законодательству РК на {new Date().toLocaleDateString('ru-RU')}.
                Обновления проводятся еженедельно.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-red-400 mb-2">Сертификация</h4>
              <p className="text-sm text-gray-400">
                Платформа разработана в соответствии с требованиями МЧС РК и сертифицирована 
                Комитетом по чрезвычайным ситуациям.
              </p>
            </div>
          </div>

          <div className="text-center border-t border-gray-800 pt-6">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} FireSafety KZ — Официальная платформа пожарной безопасности Республики Казахстан. 
              Все права защищены. Лицензия №FS-2024-001
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}