import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Slider } from '@/components/ui/slider'; // Component not available
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Search, Filter, MapPin, Clock, Users, Eye, Star, TrendingUp } from 'lucide-react';

interface MarketplaceFilters {
  searchQuery: string;
  category: string;
  city: string;
  budgetRange: [number, number];
  urgent: boolean;
  status: string;
  sortBy: string;
}

export default function AdvancedMarketplace() {
  const [filters, setFilters] = useState<MarketplaceFilters>({
    searchQuery: '',
    category: 'all',
    city: 'all',
    budgetRange: [0, 1000000],
    urgent: false,
    status: 'all',
    sortBy: 'newest'
  });

  const { data: ads = [], isLoading } = useQuery({
    queryKey: ['/api/marketplace/ads', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.searchQuery) params.append('q', filters.searchQuery);
      if (filters.category !== 'all') params.append('category', filters.category);
      if (filters.city !== 'all') params.append('city', filters.city);
      if (filters.urgent) params.append('urgent', 'true');
      if (filters.status !== 'all') params.append('status', filters.status);
      params.append('sortBy', filters.sortBy);
      params.append('minBudget', filters.budgetRange[0].toString());
      params.append('maxBudget', filters.budgetRange[1].toString());
      
      const response = await fetch(`/api/marketplace/ads?${params}`);
      return response.json();
    }
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/marketplace/categories']
  });

  const cities = [
    'Алматы', 'Нур-Султан', 'Шымкент', 'Караганда', 'Актобе', 
    'Тараз', 'Павлодар', 'Усть-Каменогорск', 'Семей', 'Атырау'
  ];

  const updateFilter = (key: keyof MarketplaceFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      category: 'all',
      city: 'all',
      budgetRange: [0, 1000000],
      urgent: false,
      status: 'all',
      sortBy: 'newest'
    });
  };

  const formatBudget = (amount: number) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}М`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
    return amount.toString();
  };

  if (isLoading) {
    return <div className="p-6">Загрузка маркетплейса...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Search and Quick Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Поиск услуг
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Поиск по названию, описанию..."
                value={filters.searchQuery}
                onChange={(e) => updateFilter('searchQuery', e.target.value)}
                className="w-full"
              />
            </div>
            <Button variant="outline" onClick={resetFilters}>
              Сбросить
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Категория</Label>
              <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все категории</SelectItem>
                  {(categories as any[]).map((category: any) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Город</Label>
              <Select value={filters.city} onValueChange={(value) => updateFilter('city', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все города</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Статус</Label>
              <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="open">Открытые</SelectItem>
                  <SelectItem value="in_progress">В работе</SelectItem>
                  <SelectItem value="completed">Завершенные</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Сортировка</Label>
              <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Новые</SelectItem>
                  <SelectItem value="budget_high">Бюджет (убыв.)</SelectItem>
                  <SelectItem value="budget_low">Бюджет (возр.)</SelectItem>
                  <SelectItem value="deadline">По дедлайну</SelectItem>
                  <SelectItem value="popular">Популярные</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Мин. бюджет</Label>
                <Input
                  type="number"
                  value={filters.budgetRange[0]}
                  onChange={(e) => updateFilter('budgetRange', [Number(e.target.value), filters.budgetRange[1]])}
                  placeholder="0"
                />
              </div>
              <div>
                <Label>Макс. бюджет</Label>
                <Input
                  type="number"
                  value={filters.budgetRange[1]}
                  onChange={(e) => updateFilter('budgetRange', [filters.budgetRange[0], Number(e.target.value)])}
                  placeholder="1000000"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="urgent"
                checked={filters.urgent}
                onCheckedChange={(checked) => updateFilter('urgent', checked)}
              />
              <Label htmlFor="urgent">Только срочные</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ads List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Найдено: {ads.length} объявлений
            </h3>
            <div className="flex gap-2">
              <Badge variant="outline">{ads.filter((ad: any) => ad.isUrgent).length} срочных</Badge>
              <Badge variant="outline">{ads.filter((ad: any) => ad.status === 'open').length} открытых</Badge>
            </div>
          </div>

          {ads.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">Объявления не найдены</p>
                <Button variant="outline" onClick={resetFilters} className="mt-4">
                  Сбросить фильтры
                </Button>
              </CardContent>
            </Card>
          ) : (
            ads.map((ad: any) => (
              <Card key={ad.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg line-clamp-2">
                        {ad.title}
                        {ad.isUrgent && (
                          <Badge variant="destructive" className="ml-2">СРОЧНО</Badge>
                        )}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {ad.city || 'Весь Казахстан'}
                        </span>
                        {ad.deadline && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            до {new Date(ad.deadline).toLocaleDateString('ru-RU')}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {ad.views || 0}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      {ad.budget && (
                        <div className="text-xl font-bold text-green-600">
                          {Number(ad.budget).toLocaleString()} ₸
                        </div>
                      )}
                      <Badge variant={
                        ad.status === 'open' ? 'default' :
                        ad.status === 'in_progress' ? 'secondary' : 'outline'
                      }>
                        {ad.status === 'open' ? 'Открыто' :
                         ad.status === 'in_progress' ? 'В работе' : 'Завершено'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {ad.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{ad.bidCount || 0} откликов</Badge>
                      {ad.category && (
                        <Badge variant="secondary">{ad.category}</Badge>
                      )}
                    </div>
                    <Button size="sm">
                      Подробнее
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Популярные категории
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: 'Пожарные системы', count: 45 },
                { name: 'Охранные системы', count: 32 },
                { name: 'Эвакуационные планы', count: 28 },
                { name: 'Обучение персонала', count: 19 },
                { name: 'Аудит безопасности', count: 15 },
              ].map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{category.name}</span>
                  <Badge variant="outline">{category.count}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Топ поставщики
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: 'Fire Safety Pro', rating: 4.9, jobs: 156 },
                { name: 'КазБезопасность', rating: 4.8, jobs: 89 },
                { name: 'Эксперт+', rating: 4.7, jobs: 67 },
              ].map((supplier, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{supplier.name}</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs">{supplier.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {supplier.jobs} выполненных работ
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}