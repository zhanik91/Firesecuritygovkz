import React from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Users, 
  Award, 
  BookOpen,
  Calculator,
  GamepadIcon,
  ArrowRight,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  Star,
  TrendingUp,
  Clock,
  Zap
} from 'lucide-react';
import { StatCards, ProgressSection, ServicesSection } from './InteractiveElements';
import { useLanguage } from '@/hooks/useLanguage';

// Анимационные варианты для Framer Motion
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2
    }
  }
};

// Hero секция с анимацией
function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="bg-gradient-to-br from-kz-blue via-blue-600 to-kz-blue text-white py-20 relative overflow-hidden">
      {/* Фоновая анимация */}
      <div className="absolute inset-0 bg-[url('/images/fire-safety-pattern.svg')] opacity-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="text-center space-y-8"
        >
          <motion.div variants={fadeInUp} className="space-y-6">
            <Badge variant="outline" className="text-white border-white/30 bg-white/10">
              <Shield className="w-4 h-4 mr-2" />
              {t('hero.badge', 'Ведущая платформа пожарной безопасности')}
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              {t('hero.title', 'Fire Safety KZ')}
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
              {t('hero.subtitle', 'Комплексная цифровая платформа для обеспечения пожарной безопасности в Казахстане')}
            </p>
          </motion.div>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/marketplace">
              <Button size="lg" className="bg-white text-kz-blue hover:bg-blue-50 font-semibold px-8 py-4">
                {t('hero.marketplace', 'Перейти в маркетплейс')}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/calculators">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/10 font-semibold px-8 py-4"
              >
                <Calculator className="mr-2 w-5 h-5" />
                {t('hero.calculators', 'Калькуляторы')}
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Анимированные элементы */}
      <motion.div
        className="absolute top-20 left-10 opacity-20"
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 5, 0]
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Shield className="w-12 h-12" />
      </motion.div>
      
      <motion.div
        className="absolute bottom-20 right-10 opacity-20"
        animate={{ 
          y: [0, 20, 0],
          rotate: [0, -5, 0]
        }}
        transition={{ 
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Award className="w-16 h-16" />
      </motion.div>
    </section>
  );
}

// Секция возможностей
function FeaturesSection() {
  const { t } = useLanguage();
  
  const features = [
    {
      icon: Shield,
      title: t('features.marketplace.title', 'Маркетплейс услуг'),
      description: t('features.marketplace.desc', 'Найдите профессиональные услуги по пожарной безопасности'),
      color: 'text-kz-blue',
      bgColor: 'bg-kz-blue/10'
    },
    {
      icon: Calculator,
      title: t('features.calculators.title', 'Инженерные калькуляторы'),
      description: t('features.calculators.desc', 'Точные расчеты для проектирования систем безопасности'),
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: BookOpen,
      title: t('features.documents.title', 'База документов'),
      description: t('features.documents.desc', 'Актуальная нормативно-правовая база и стандарты'),
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      icon: GamepadIcon,
      title: t('features.training.title', 'Интерактивное обучение'),
      description: t('features.training.desc', 'Игры и тренажеры для изучения основ безопасности'),
      color: 'text-kz-yellow',
      bgColor: 'bg-kz-yellow/10'
    },
    {
      icon: Users,
      title: t('features.community.title', 'Профессиональное сообщество'),
      description: t('features.community.desc', 'Общение с экспертами и коллегами по отрасли'),
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      icon: TrendingUp,
      title: t('features.analytics.title', 'Аналитика и отчеты'),
      description: t('features.analytics.desc', 'Детальная статистика и анализ безопасности'),
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    }
  ];

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp}>
            <Badge variant="outline" className="mb-4">
              <Zap className="w-4 h-4 mr-2" />
              {t('features.badge', 'Возможности платформы')}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('features.title', 'Все инструменты в одном месте')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              {t('features.subtitle', 'Современная платформа для решения всех задач пожарной безопасности')}
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={fadeInUp}>
              <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                <CardContent className="p-8">
                  <div className={`w-12 h-12 rounded-full ${feature.bgColor} flex items-center justify-center mb-6`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// Секция отзывов
function TestimonialsSection() {
  const { t } = useLanguage();
  
  const testimonials = [
    {
      name: 'Асхат Нурсултанов',
      role: 'Главный инженер по ПБ',
      company: 'ТОО "КазПромСтрой"',
      content: 'Платформа значительно упростила процесс поиска поставщиков и расчет систем противопожарной защиты.',
      rating: 5
    },
    {
      name: 'Марина Ковалева',
      role: 'Директор по безопасности',
      company: 'АО "Алматы Энерго"',
      content: 'Отличная база нормативных документов. Всегда актуальная информация и удобный поиск.',
      rating: 5
    },
    {
      name: 'Данияр Абишев',
      role: 'Консультант по ПБ',
      company: 'Независимый эксперт',
      content: 'Маркетплейс помог найти множество новых клиентов. Рекомендую всем специалистам отрасли.',
      rating: 5
    }
  ];

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4">
            <Star className="w-4 h-4 mr-2" />
            {t('testimonials.badge', 'Отзывы клиентов')}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('testimonials.title', 'Что говорят о нас')}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {t('testimonials.subtitle', 'Мнения профессионалов отрасли')}
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div key={index} variants={fadeInUp}>
              <Card className="h-full">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-kz-yellow fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 italic">
                    "{testimonial.content}"
                  </p>
                  <div className="border-t pt-4">
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                    <p className="text-sm text-kz-blue">{testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// Основной компонент улучшенной лендинг страницы
export default function EnhancedLanding() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      
      {/* Статистики */}
      <section className="py-16 -mt-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <StatCards />
          </motion.div>
        </div>
      </section>

      <FeaturesSection />
      
      {/* Услуги */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <ServicesSection />
          <ProgressSection />
        </div>
      </section>

      <TestimonialsSection />

      {/* CTA секция */}
      <section className="py-20 bg-gradient-to-r from-kz-blue to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Готовы начать?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Присоединяйтесь к сообществу профессионалов пожарной безопасности уже сегодня
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <Button size="lg" className="bg-white text-kz-blue hover:bg-blue-50 font-semibold px-8 py-4">
                  Регистрация
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/10 font-semibold px-8 py-4"
              >
                <Phone className="mr-2 w-5 h-5" />
                Связаться с нами
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}