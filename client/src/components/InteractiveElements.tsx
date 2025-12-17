import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Users, 
  Shield, 
  Award,
  CheckCircle,
  Clock,
  Target,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';

interface CounterProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

// Анимированный счетчик
function AnimatedCounter({ end, duration = 2000, prefix = '', suffix = '' }: CounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
}

// Статистические карточки с анимацией
export function StatCards() {
  const { t } = useLanguage();
  
  const stats = [
    {
      title: t('stats.totalUsers', 'Общее количество пользователей'),
      value: 15420,
      suffix: '+',
      icon: Users,
      color: 'text-kz-blue',
      bgColor: 'bg-kz-blue/10'
    },
    {
      title: t('stats.completedOrders', 'Выполненных заказов'),
      value: 2840,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: t('stats.averageRating', 'Средний рейтинг'),
      value: 4.8,
      suffix: '/5',
      icon: Award,
      color: 'text-kz-yellow',
      bgColor: 'bg-kz-yellow/10'
    },
    {
      title: t('stats.responseTime', 'Время ответа'),
      value: 24,
      suffix: 'ч',
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">
                    <AnimatedCounter 
                      end={stat.value} 
                      suffix={stat.suffix || ''} 
                    />
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

// Прогресс бар с анимацией
export function ProgressSection() {
  const { t } = useLanguage();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(85), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Target className="mr-2 w-5 h-5 text-kz-blue" />
          {t('progress.safetyGoals', 'Цели пожарной безопасности 2025')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{t('progress.implementation', 'Внедрение стандартов')}</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-kz-blue">
              <AnimatedCounter end={127} />
            </div>
            <p className="text-sm text-gray-600">{t('progress.inspections', 'Проверки')}</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              <AnimatedCounter end={95} suffix="%" />
            </div>
            <p className="text-sm text-gray-600">{t('progress.compliance', 'Соответствие')}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Интерактивные вкладки с услугами
export function ServicesSection() {
  const { t } = useLanguage();
  
  const services = {
    consulting: {
      title: t('services.consulting', 'Консультирование'),
      description: t('services.consultingDesc', 'Профессиональные консультации по пожарной безопасности'),
      features: [
        t('services.riskAssessment', 'Оценка рисков'),
        t('services.compliance', 'Соответствие требованиям'),
        t('services.documentation', 'Документооборот')
      ]
    },
    equipment: {
      title: t('services.equipment', 'Оборудование'),
      description: t('services.equipmentDesc', 'Поставка и обслуживание противопожарного оборудования'),
      features: [
        t('services.extinguishers', 'Огнетушители'),
        t('services.alarms', 'Системы сигнализации'),
        t('services.sprinklers', 'Спринклерные системы')
      ]
    },
    training: {
      title: t('services.training', 'Обучение'),
      description: t('services.trainingDesc', 'Образовательные программы и сертификация'),
      features: [
        t('services.certification', 'Сертификация'),
        t('services.workshops', 'Мастер-классы'),
        t('services.online', 'Онлайн курсы')
      ]
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="mr-2 w-5 h-5 text-kz-blue" />
          {t('services.title', 'Наши услуги')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="consulting" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="consulting" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              {services.consulting.title}
            </TabsTrigger>
            <TabsTrigger value="equipment" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              {services.equipment.title}
            </TabsTrigger>
            <TabsTrigger value="training" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              {services.training.title}
            </TabsTrigger>
          </TabsList>
          
          {Object.entries(services).map(([key, service]) => (
            <TabsContent key={key} value={key} className="mt-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <p className="text-gray-600 dark:text-gray-400">
                  {service.description}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {service.features.map((feature, index) => (
                    <Badge key={index} variant="outline" className="justify-center p-2">
                      <Zap className="w-4 h-4 mr-1 text-kz-blue" />
                      {feature}
                    </Badge>
                  ))}
                </div>
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}