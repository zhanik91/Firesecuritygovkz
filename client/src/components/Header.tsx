import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { 
  Phone, 
  Mail, 
  Sun, 
  Moon, 
  User, 
  Menu,
  X,
  Flame,
  LogOut,
  MessageSquare
} from "lucide-react";
import MegaMenu from "./MegaMenu";
import GlobalSearch, { useGlobalSearch } from "@/components/GlobalSearch";
import NotificationSystem from "@/components/NotificationSystem";
import AIAssistant from "@/components/AIAssistant";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/hooks/useLanguage";

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [isAIMinimized, setIsAIMinimized] = useState(false);
  const { SearchButton } = useGlobalSearch();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback to old logout
      window.location.href = "/api/logout";
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-kz-blue text-white py-2">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-sm">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <Phone className="w-4 h-4 mr-2" />
              +7 (727) 123-45-67
            </span>
            <span className="flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              info@firesafety.kz
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="text-white hover:text-kz-yellow hover:bg-white/10"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm">
                  {t('header.hello', 'Привет')}, {(user as any)?.firstName || (user as any)?.email || t('header.user', 'Пользователь')}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-white hover:text-kz-yellow hover:bg-white/10"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => window.location.href = "/auth"}
                variant="ghost"
                size="sm"
                className="text-white hover:text-kz-yellow hover:bg-white/10"
              >
                <User className="w-4 h-4 mr-2" />
                Войти
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-kz-blue to-kz-yellow p-2 rounded-lg">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                FireSafety KZ
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Портал пожарной безопасности
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <MegaMenu />
          </div>

          {/* Search and Mobile Menu */}
          <div className="flex items-center space-x-4">
            <SearchButton />
            
            {/* AI Assistant Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAIAssistant(!showAIAssistant)}
              className="hidden md:flex items-center space-x-2"
            >
              <MessageSquare className="w-4 h-4" />
              ИИ Помощник
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="px-4 py-4">
            <MegaMenu />
            
            {/* Mobile AI Assistant */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => setShowAIAssistant(!showAIAssistant)}
                className="w-full flex items-center justify-center space-x-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>ИИ Помощник</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Global Search - Hidden for now */}
      {/* <GlobalSearch /> */}

      {/* AI Assistant */}
      {showAIAssistant && (
        <AIAssistant 
          isMinimized={isAIMinimized}
          onToggleMinimize={() => setIsAIMinimized(!isAIMinimized)}
          onClose={() => setShowAIAssistant(false)}
        />
      )}

      {/* Notification System */}
      {isAuthenticated && (
        <NotificationSystem userId={(user as any)?.id} />
      )}
    </header>
  );
}