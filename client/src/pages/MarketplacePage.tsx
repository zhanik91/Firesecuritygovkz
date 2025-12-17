import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { apiRequest } from '@/lib/queryClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import Breadcrumbs from '@/components/Breadcrumbs';
import AdCard from '@/components/AdCard';
import VirtualizedMarketplaceList from '@/components/VirtualizedMarketplaceList';
import { MarketplaceCardSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'wouter';
import {
  ShoppingCart,
  Plus,
  Filter,
  Grid3X3,
  List,
  MapPin,
  Calendar,
  DollarSign,
  Search,
  Briefcase,
} from 'lucide-react';

interface AdCategory {
  id: string;
  title: string;
  slug: string;
  description?: string;
}

interface Ad {
  id: string;
  title: string;
  slug: string;
  description: string;
  budget?: string;
  budgetCurrency: string;
  deadline?: string;
  city?: string;
  isUrgent: boolean;
  views: number;
  bidCount: number;
  createdAt: string;
  category?: {
    id: string;
    title: string;
  };
  user?: {
    firstName?: string;
    lastName?: string;
    companyName?: string;
  };
}

export default function MarketplacePage() {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showUrgentOnly, setShowUrgentOnly] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<AdCategory[]>({
    queryKey: ["/api/marketplace/categories"],
  });

  const { data: adsData = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/marketplace/ads', selectedCategory, selectedCity, sortBy],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/marketplace/ads?category=${selectedCategory}&city=${selectedCity}&sortBy=${sortBy}`);
      return await response.json();
    }
  });

  // Transform the joined data to match the Ad interface
  const ads: Ad[] = Array.isArray(adsData) ? adsData.map(item => ({
    ...item.ads,
    category: item.ad_categories,
    user: item.users
  })) : [];

  const cities = [
    'Алматы',
    'Нур-Султан',
    'Шымкент',
    'Караганда',
    'Актобе',
    'Тараз',
    'Павлодар',
    'Усть-Каменогорск',
    'Семей',
    'Атырау',
    // Добавь другие города, если нужно
  ];

  const filteredAds = ads.filter((ad) => {
    const matchesSearch =
      !searchQuery ||
      ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ad.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      !selectedCategory || selectedCategory === 'all' || (ad.category as any)?.id === selectedCategory;
    const matchesCity = !selectedCity || selectedCity === 'all' || ad.city === selectedCity;
    const matchesUrgent = !showUrgentOnly || ad.isUrgent;
    return matchesSearch && matchesCategory && matchesCity && matchesUrgent;
  });

  const sortedAds = [...filteredAds].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'budget_high':
        return parseFloat(String(b.budget || '0')) - parseFloat(String(a.budget || '0'));
      case 'budget_low':
        return parseFloat(String(a.budget || '0')) - parseFloat(String(b.budget || '0'));
      case 'popular':
        return b.views - a.views;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SEOHead 
        title={t('marketplace.title', 'Маркетплейс пожарной безопасности')}
        description={t('marketplace.description', 'Профессиональная площадка для размещения заказов и поиска поставщиков услуг в области пожарной безопасности Казахстана')}
        keywords="маркетплейс, пожарная безопасность, заказы, поставщики, услуги, Казахстан"
        canonical="https://firesafety.kz/marketplace"
      />
      <Header />

      <div className="marketplace-section">
        {/* Breadcrumbs */}
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Breadcrumbs 
            items={[
              { label: t('marketplace.title', 'Маркетплейс') }
            ]} 
          />
        </div>

        {/* Hero Section */}
        <section className="bg-gradient-to-r from-kz-blue to-blue-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-8 h-8" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">{t('marketplace.title', 'Маркетплейс пожарной безопасности')}</h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              {t('marketplace.subtitle', 'Профессиональная площадка для размещения заказов и поиска поставщиков услуг в области пожарной безопасности')}
            </p>
            {isAuthenticated ? (
              <Link href="/marketplace/create">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-4">
                  <Plus className="mr-2 w-5 h-5" /> {t('marketplace.createOrder', 'Разместить заказ')}
                </Button>
              </Link>
            ) : (
              <Button
                size="lg"
                onClick={() => (window.location.href = '/api/login')}
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-4"
              >
{t('marketplace.loginToCreate', 'Войти и разместить заказ')}
              </Button>
            )}
          </div>
        </section>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Filter className="mr-2 w-5 h-5" /> Фильтры
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Search */}
                  <div className="mb-6">
                    <div className="text-center mb-6">
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Найдите исполнителей по пожарной безопасности
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        Более 100+ проверенных специалистов готовы помочь с вашими задачами
                      </p>
                    </div>
                    
                    <div className="relative max-w-2xl mx-auto mb-6">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        placeholder="Например: монтаж пожарной сигнализации, проектирование системы..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 pr-20 py-4 text-lg border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      />
                      <Button 
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 px-6"
                        data-testid="button-search"
                      >
                        Найти
                      </Button>
                    </div>
                    
                    {/* Popular Categories */}
                    <div className="flex flex-wrap gap-2 justify-center max-w-4xl mx-auto">
                      {categories.slice(0, 6).map((category) => (
                        <Badge
                          key={category.id}
                          variant={selectedCategory === category.id ? "default" : "secondary"}
                          className={`cursor-pointer px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                            selectedCategory === category.id
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                          }`}
                          onClick={() => setSelectedCategory(selectedCategory === category.id ? 'all' : category.id)}
                          data-testid={`filter-category-${category.slug}`}
                        >
                          {category.title}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Категория</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Все категории" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все категории</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Город</label>
                    <Select value={selectedCity} onValueChange={setSelectedCity}>
                      <SelectTrigger>
                        <SelectValue placeholder="Все города" />
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

                  {/* Urgent Only */}
                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                      id="urgent"
                      checked={showUrgentOnly}
                      onCheckedChange={(checked) => setShowUrgentOnly(checked as boolean)}
                    />
                    <label htmlFor="urgent" className="text-sm font-medium">
                      Только срочные
                    </label>
                  </div>

                  {/* Stats */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="font-medium mb-3">Статистика</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Всего заказов:</span>
                        <span className="font-medium">{ads.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Срочных:</span>
                        <span className="font-medium text-red-600">
                          {ads.filter((ad) => ad.isUrgent).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>С откликами:</span>
                        <span className="font-medium">
                          {ads.filter((ad) => ad.bidCount > 0).length}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center space-x-4">
                  <h2 className="text-2xl font-bold">Активные заказы ({sortedAds.length})</h2>
                </div>
                <div className="flex items-center space-x-4">
                  {/* Sort */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Сначала новые</SelectItem>
                      <SelectItem value="oldest">Сначала старые</SelectItem>
                      <SelectItem value="budget_high">Бюджет: по убыванию</SelectItem>
                      <SelectItem value="budget_low">Бюджет: по возрастанию</SelectItem>
                      <SelectItem value="popular">По популярности</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* View Mode */}
                  <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="px-3"
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="px-3"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Ads List */}
              {isLoading ? (
                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <MarketplaceCardSkeleton key={i} />
                  ))}
                </div>
              ) : sortedAds.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Заказы не найдены</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Попробуйте изменить параметры фильтрации или{' '}
                    {isAuthenticated ? (
                      <Link href="/marketplace/create">
                        <span className="text-blue-600 hover:text-blue-700 cursor-pointer">разместите первый заказ</span>
                      </Link>
                    ) : (
                      <span
                        onClick={() => (window.location.href = '/api/login')}
                        className="text-blue-600 hover:text-blue-700 cursor-pointer"
                      >
                        войдите, чтобы разместить заказ
                      </span>
                    )}
                  </p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
                  {sortedAds.map((ad) => (
                    <AdCard key={ad.id} ad={ad} viewMode={viewMode} />
                  ))}
                </div>
              ) : (
                <VirtualizedMarketplaceList
                  ads={sortedAds}
                  height={800}
                  itemHeight={280}
                />
              )}

              {/* Load More */}
              {sortedAds.length > 10 && (
                <div className="text-center mt-8">
                  <Button variant="outline" size="lg">
                    Загрузить еще
                  </Button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}