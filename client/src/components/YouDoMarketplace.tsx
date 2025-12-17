import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'wouter';
import { 
  Search, Star, MapPin, Clock, Users, TrendingUp, 
  Filter, Grid, List, Plus, MessageCircle, Phone,
  Shield, Award, CheckCircle, Zap, Eye, ChevronDown
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface MarketplaceAd {
  id: string;
  title: string;
  slug: string;
  description: string;
  budget?: number;
  budgetCurrency: string;
  deadline?: string;
  city?: string;
  isUrgent: boolean;
  views: number;
  bidCount: number;
  status: string;
  createdAt: string;
  category?: {
    id: string;
    title: string;
    icon?: string;
  };
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    rating?: number;
    reviewCount?: number;
    isVerified: boolean;
    isOnline?: boolean;
    profileImageUrl?: string;
  };
}

interface Supplier {
  id: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  isOnline: boolean;
  specializations?: string[];
  city?: string;
  profileImageUrl?: string;
  workExperience?: number;
  portfolioItems?: any[];
}

export default function YouDoMarketplace() {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<'tasks' | 'suppliers'>('tasks');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    city: 'all',
    budget: 'all',
    sortBy: 'newest'
  });

  // Fetch tasks/ads
  const { data: ads = [], isLoading: adsLoading } = useQuery({
    queryKey: ['/api/marketplace/ads', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.append('q', filters.search);
      if (filters.category !== 'all') params.append('category', filters.category);
      if (filters.city !== 'all') params.append('city', filters.city);
      params.append('sortBy', filters.sortBy);
      
      const response = await fetch(`/api/marketplace/ads?${params}`);
      return response.json();
    }
  });

  // Fetch suppliers
  const { data: suppliers = [], isLoading: suppliersLoading, error: suppliersError } = useQuery({
    queryKey: ['/api/marketplace/suppliers', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.append('q', filters.search);
      if (filters.city !== 'all') params.append('city', filters.city);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      
      const response = await fetch(`/api/marketplace/suppliers?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    enabled: activeView === 'suppliers',
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 минут
  });

  // Fetch categories
  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ['/api/marketplace/categories']
  });

  const kazakhstanCities = [
    'Алматы', 'Нур-Султан', 'Шымкент', 'Караганда', 'Актобе', 
    'Тараз', 'Павлодар', 'Усть-Каменогорск', 'Семей', 'Атырау',
    'Костанай', 'Кызылорда', 'Уральск', 'Петропавловск', 'Актау'
  ];

  const formatBudget = (budget?: number, currency = "KZT") => {
    if (!budget) return "Договорная";
    return `${budget.toLocaleString()} ${currency}`;
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: ru 
      });
    } catch {
      return "недавно";
    }
  };

  const getUserDisplayName = (user: any) => {
    return user?.companyName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Пользователь';
  };

  const TaskCard = ({ ad }: { ad: MarketplaceAd }) => (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {ad.isUrgent && (
                <Badge variant="destructive" className="flex items-center">
                  <Zap className="w-3 h-3 mr-1" />
                  СРОЧНО
                </Badge>
              )}
              {ad.category && (
                <Badge variant="outline">{ad.category.title}</Badge>
              )}
              <Badge variant="secondary" className="flex items-center">
                <Eye className="w-3 h-3 mr-1" />
                {ad.views}
              </Badge>
            </div>
            
            <Link href={`/marketplace/task/${ad.slug}`}>
              <CardTitle className="text-lg hover:text-blue-600 cursor-pointer line-clamp-2 mb-2">
                {ad.title}
              </CardTitle>
            </Link>
            
            <p className="text-gray-600 dark:text-gray-400 line-clamp-2 text-sm mb-3">
              {ad.description}
            </p>
          </div>
          
          <div className="text-right ml-4">
            <div className="text-lg font-bold text-green-600">
              {formatBudget(ad.budget, ad.budgetCurrency)}
            </div>
            <div className="text-sm text-gray-500">
              {ad.bidCount} откликов
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={ad.user?.profileImageUrl} />
              <AvatarFallback className="text-xs">
                {getUserDisplayName(ad.user).charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium">{getUserDisplayName(ad.user)}</span>
                {ad.user?.isVerified && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {ad.user?.rating && (
                  <div className="flex items-center">
                    <Star className="w-3 h-3 text-yellow-400 mr-1" fill="currentColor" />
                    <span>{ad.user.rating.toFixed(1)}</span>
                    <span>({ad.user.reviewCount})</span>
                  </div>
                )}
                {ad.city && (
                  <div className="flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {ad.city}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {formatDate(ad.createdAt)}
            </span>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              Откликнуться
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const SupplierCard = ({ supplier }: { supplier: Supplier }) => (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="relative">
            <Avatar className="w-16 h-16">
              <AvatarImage src={supplier.profileImageUrl} />
              <AvatarFallback className="text-lg">
                {getUserDisplayName(supplier).charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {supplier.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white" />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">{getUserDisplayName(supplier)}</h3>
              {supplier.isVerified && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
              <span className="text-sm font-medium">{supplier.rating.toFixed(1)}</span>
              <span className="text-sm text-gray-500">({supplier.reviewCount} отзывов)</span>
            </div>
            
            {supplier.workExperience && (
              <div className="text-sm text-gray-600 mb-2">
                Опыт работы: {supplier.workExperience} лет
              </div>
            )}
            
            {supplier.specializations && supplier.specializations.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {supplier.specializations.slice(0, 3).map((spec, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {spec}
                  </Badge>
                ))}
                {supplier.specializations.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{supplier.specializations.length - 3}
                  </Badge>
                )}
              </div>
            )}
            
            {supplier.city && (
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="w-3 h-3 mr-1" />
                {supplier.city}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {supplier.portfolioItems && supplier.portfolioItems.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {supplier.portfolioItems.length} работ в портфолио
              </Badge>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <MessageCircle className="w-4 h-4 mr-1" />
              Написать
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              Профиль
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Маркетплейс пожарной безопасности
            </h1>
            <p className="text-blue-100">
              Найдите надежных исполнителей или предложите свои услуги
            </p>
          </div>
          
          {user && (
            <Link href="/marketplace/create">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                <Plus className="w-5 h-5 mr-2" />
                Разместить задачу
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {ads.length}
            </div>
            <div className="text-sm text-gray-600">Активных задач</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {suppliers.filter((s: Supplier) => s.isOnline).length}
            </div>
            <div className="text-sm text-gray-600">Исполнителей онлайн</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {categories.length}
            </div>
            <div className="text-sm text-gray-600">Категорий услуг</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {ads.filter((ad: MarketplaceAd) => ad.isUrgent).length}
            </div>
            <div className="text-sm text-gray-600">Срочных задач</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Поиск задач или исполнителей..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">Все категории</option>
                {categories.map((category: any) => (
                  <option key={category.id} value={category.id}>
                    {category.title}
                  </option>
                ))}
              </select>
              
              <select
                value={filters.city}
                onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">Все города</option>
                {kazakhstanCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                className="px-3 py-2 border rounded-md"
              >
                <option value="newest">Сначала новые</option>
                <option value="budget_high">Сначала дорогие</option>
                <option value="budget_low">Сначала дешевые</option>
                <option value="popular">Популярные</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeView} onValueChange={(value: any) => setActiveView(value)}>
        <div className="flex justify-between items-center">
          <TabsList className="grid w-64 grid-cols-2">
            <TabsTrigger value="tasks">Задачи</TabsTrigger>
            <TabsTrigger value="suppliers">Исполнители</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="tasks" className="space-y-4">
          {adsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
          ) : ads.length > 0 ? (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 lg:grid-cols-2 gap-4" 
              : "space-y-4"
            }>
              {ads.map((ad: MarketplaceAd) => (
                <TaskCard key={ad.id} ad={ad} />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <h3 className="text-lg font-semibold mb-2">Задач не найдено</h3>
              <p className="text-gray-600 mb-4">
                Попробуйте изменить фильтры или создать новую задачу
              </p>
              {user && (
                <Link href="/marketplace/create">
                  <Button>Создать задачу</Button>
                </Link>
              )}
            </Card>
          )}
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          {suppliersLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
          ) : suppliersError ? (
            <Card className="p-8 text-center">
              <h3 className="text-lg font-semibold mb-2 text-red-600">Ошибка загрузки</h3>
              <p className="text-gray-600 mb-4">
                Не удалось загрузить список исполнителей. Попробуйте обновить страницу.
              </p>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
              >
                Обновить
              </Button>
            </Card>
          ) : suppliers.length > 0 ? (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4" 
              : "space-y-4"
            }>
              {suppliers.map((supplier: Supplier) => (
                <SupplierCard key={supplier.id} supplier={supplier} />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <h3 className="text-lg font-semibold mb-2">Исполнители не найдены</h3>
              <p className="text-gray-600">
                Попробуйте изменить фильтры поиска
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}