import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Flame, ArrowRight, Clock, TrendingUp } from 'lucide-react';

const emergencyNews = [
  {
    id: 1,
    title: 'Новые требования к системам пожаротушения в жилых домах',
    summary: 'Обновлены нормативы установки автоматических систем пожаротушения...',
    date: '2025-01-03',
    category: 'Нормативы',
    urgent: true,
    link: '/posts/new-fire-system-requirements'
  },
  {
    id: 2,
    title: 'Сезонные проверки пожарного оборудования',
    summary: 'Рекомендации по проведению зимних проверок систем безопасности...',
    date: '2025-01-02',
    category: 'Обслуживание',
    urgent: false,
    link: '/posts/seasonal-fire-equipment-checks'
  },
  {
    id: 3,
    title: 'Изменения в процедуре получения лицензий МЧС',
    summary: 'Упрощена процедура получения лицензий на деятельность в области пожарной безопасности...',
    date: '2025-01-01',
    category: 'Лицензирование',
    urgent: false,
    link: '/posts/license-procedure-changes'
  }
];

const statistics = [
  { label: 'Предотвращено пожаров', value: '1,247', trend: '+8%' },
  { label: 'Объектов под защитой', value: '45,623', trend: '+12%' },
  { label: 'Специалистов сертифицировано', value: '2,891', trend: '+15%' }
];

const popularTopics = [
  { title: 'Огнетушители', count: 156, href: '/sections/documents?topic=extinguishers' },
  { title: 'Эвакуация', count: 89, href: '/sections/documents?topic=evacuation' },
  { title: 'Пожарная сигнализация', count: 124, href: '/sections/documents?topic=alarms' },
  { title: 'НГПС', count: 67, href: '/calculators/ngps' },
  { title: 'Первая помощь', count: 45, href: '/sections/literature?topic=first-aid' }
];

export default function FireSafetyNews() {
  return (
    <div className="space-y-6">
      {/* Popular Topics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Популярные темы
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {popularTopics.map((topic) => (
              <div key={topic.title} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <a href={topic.href} className="text-sm hover:text-primary transition-colors">
                  {topic.title}
                </a>
                <Badge variant="secondary" className="text-xs">
                  {topic.count}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Alerts */}
      <Card className="border-l-4 border-l-red-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Flame className="h-5 w-5" />
            Важные уведомления
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {emergencyNews.filter(news => news.urgent).map((news) => (
              <div key={news.id} className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{news.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{news.summary}</p>
                  </div>
                  <Badge variant="destructive" className="ml-2">СРОЧНО</Badge>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">
                    {new Date(news.date).toLocaleDateString('ru-RU')}
                  </span>
                  <Link href={news.link}>
                    <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                      Подробнее <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Latest News */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Последние новости
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {emergencyNews.filter(news => !news.urgent).map((news) => (
              <div key={news.id} className="border-b last:border-b-0 pb-4 last:pb-0">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <Link href={news.link}>
                      <h4 className="font-medium text-sm hover:text-blue-600 cursor-pointer">
                        {news.title}
                      </h4>
                    </Link>
                    <p className="text-xs text-muted-foreground mt-1">{news.summary}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge variant="outline" className="text-xs">{news.category}</Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(news.date).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Статистика безопасности</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {statistics.map((stat, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-green-600">{stat.value}</p>
                </div>
                <Badge variant="outline" className="text-green-600">
                  {stat.trend}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Быстрые действия</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link href="/marketplace">
            <Button variant="outline" className="w-full justify-start">
              Найти подрядчика
            </Button>
          </Link>
          <Link href="/calculators">
            <Button variant="outline" className="w-full justify-start">
              Рассчитать нормативы
            </Button>
          </Link>
          <Link href="/search">
            <Button variant="outline" className="w-full justify-start">
              Поиск документов
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}