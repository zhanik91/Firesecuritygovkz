import React from 'react';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'ru' ? 'kz' : 'ru');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-1 text-sm font-medium text-white hover:text-kz-yellow hover:bg-white/10 transition-colors"
      data-testid="language-switcher"
      title={language === 'ru' ? 'Переключить на казахский' : 'Орысшаға ауысу'}
    >
      <Languages className="w-4 h-4" />
      <span className="font-bold">
        {language === 'ru' ? 'RU' : 'ҚЗ'}
      </span>
    </Button>
  );
}