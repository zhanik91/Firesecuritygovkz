import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Search, 
  Filter, 
  MapPin, 
  DollarSign, 
  Tag, 
  Star, 
  Clock,
  User,
  X,
  Check,
  ChevronsUpDown
} from 'lucide-react';

interface SearchFilters {
  query: string;
  category: string;
  city: string;
  minBudget: number;
  maxBudget: number;
  currency: string;
  tags: string[];
  skills: string[];
  minRating: number;
  isUrgent: boolean;
  dateRange: 'all' | 'today' | 'week' | 'month';
  sortBy: 'newest' | 'oldest' | 'budget_asc' | 'budget_desc' | 'rating' | 'relevance';
  supplierFilters: {
    isOnline: boolean;
    hasPortfolio: boolean;
    minExperience: number;
    verified: boolean;
  };
}

interface AdvancedSearchProps {
  onFiltersChange: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
  showSupplierFilters?: boolean;
}

const popularTags = [
  'пожарная сигнализация', 'системы пожаротушения', 'эвакуационные планы',
  'пожарный аудит', 'монтаж оборудования', 'техническое обслуживание',
  'проектирование', 'экспертиза', 'обучение персонала', 'аварийное освещение'
];

const popularSkills = [
  'проектирование ПБ', 'монтаж систем', 'наладка оборудования', 
  'пожарный аудит', 'экспертная оценка', 'обучение сотрудников',
  'техническое обслуживание', 'аварийные работы', 'консультации'
];

const cities = [
  'Алматы', 'Астана', 'Шымкент', 'Караганда', 'Актобе', 
  'Тараз', 'Павлодар', 'Усть-Каменогорск', 'Семей', 'Атырау',
  'Костанай', 'Кызылорда', 'Уральск', 'Петропавловск', 'Актау'
];

export default function AdvancedSearchNew({ 
  onFiltersChange, 
  initialFilters = {},
  showSupplierFilters = false 
}: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: 'all',
    city: 'all',
    minBudget: 0,
    maxBudget: 1000000,
    currency: 'KZT',
    tags: [],
    skills: [],
    minRating: 0,
    isUrgent: false,
    dateRange: 'all',
    sortBy: 'newest',
    supplierFilters: {
      isOnline: false,
      hasPortfolio: false,
      minExperience: 0,
      verified: false,
    },
    ...initialFilters,
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [isTagsOpen, setIsTagsOpen] = useState(false);
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);

  // Загрузка категорий
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/marketplace/categories'],
  });

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const updateFilters = (updates: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  const updateSupplierFilters = (updates: Partial<SearchFilters['supplierFilters']>) => {
    setFilters(prev => ({ 
      ...prev, 
      supplierFilters: { ...prev.supplierFilters, ...updates } 
    }));
  };

  const addTag = (tag: string) => {
    if (tag && !filters.tags.includes(tag)) {
      updateFilters({ tags: [...filters.tags, tag] });
    }
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    updateFilters({ tags: filters.tags.filter(tag => tag !== tagToRemove) });
  };

  const addSkill = (skill: string) => {
    if (skill && !filters.skills.includes(skill)) {
      updateFilters({ skills: [...filters.skills, skill] });
    }
    setSkillInput('');
  };

  const removeSkill = (skillToRemove: string) => {
    updateFilters({ skills: filters.skills.filter(skill => skill !== skillToRemove) });
  };

  const clearAllFilters = () => {
    setFilters({
      query: '',
      category: 'all',
      city: 'all',
      minBudget: 0,
      maxBudget: 1000000,
      currency: 'KZT',
      tags: [],
      skills: [],
      minRating: 0,
      isUrgent: false,
      dateRange: 'all',
      sortBy: 'newest',
      supplierFilters: {
        isOnline: false,
        hasPortfolio: false,
        minExperience: 0,
        verified: false,
      },
    });
  };

  const hasActiveFilters = () => {
    return filters.query !== '' ||
           filters.category !== 'all' ||
           filters.city !== 'all' ||
           filters.minBudget > 0 ||
           filters.maxBudget < 1000000 ||
           filters.tags.length > 0 ||
           filters.skills.length > 0 ||
           filters.minRating > 0 ||
           filters.isUrgent ||
           filters.dateRange !== 'all' ||
           filters.supplierFilters.isOnline ||
           filters.supplierFilters.hasPortfolio ||
           filters.supplierFilters.minExperience > 0 ||
           filters.supplierFilters.verified;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Поиск заказов
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters() && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                data-testid="button-clear-filters"
              >
                <X className="w-4 h-4 mr-2" />
                Очистить
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              data-testid="button-toggle-filters"
            >
              <Filter className="w-4 h-4 mr-2" />
              {isExpanded ? 'Скрыть фильтры' : 'Больше фильтров'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Основная строка поиска */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Поиск по названию, описанию, требованиям..."
              value={filters.query}
              onChange={(e) => updateFilters({ query: e.target.value })}
              className="pl-10"
              data-testid="input-search-query"
            />
          </div>
          <Select value={filters.sortBy} onValueChange={(value: any) => updateFilters({ sortBy: value })}>
            <SelectTrigger className="w-[180px]" data-testid="select-sort-by">
              <SelectValue placeholder="Сортировка" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Сначала новые</SelectItem>
              <SelectItem value="oldest">Сначала старые</SelectItem>
              <SelectItem value="budget_desc">Бюджет ↓</SelectItem>
              <SelectItem value="budget_asc">Бюджет ↑</SelectItem>
              <SelectItem value="rating">По рейтингу</SelectItem>
              <SelectItem value="relevance">По релевантности</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Быстрые фильтры */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium flex items-center gap-1 mb-2">
              <Tag className="w-4 h-4" />
              Категория
            </label>
            <Select value={filters.category} onValueChange={(value) => updateFilters({ category: value })}>
              <SelectTrigger data-testid="select-category">
                <SelectValue placeholder="Все категории" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все категории</SelectItem>
                {categories.map((category: any) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium flex items-center gap-1 mb-2">
              <MapPin className="w-4 h-4" />
              Город
            </label>
            <Select value={filters.city} onValueChange={(value) => updateFilters({ city: value })}>
              <SelectTrigger data-testid="select-city">
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

          <div>
            <label className="text-sm font-medium flex items-center gap-1 mb-2">
              <Clock className="w-4 h-4" />
              Период
            </label>
            <Select value={filters.dateRange} onValueChange={(value: any) => updateFilters({ dateRange: value })}>
              <SelectTrigger data-testid="select-date-range">
                <SelectValue placeholder="Все время" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все время</SelectItem>
                <SelectItem value="today">Сегодня</SelectItem>
                <SelectItem value="week">Неделя</SelectItem>
                <SelectItem value="month">Месяц</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Расширенные фильтры */}
        {isExpanded && (
          <div className="space-y-6 pt-4 border-t">
            {/* Бюджет */}
            <div>
              <label className="text-sm font-medium flex items-center gap-1 mb-3">
                <DollarSign className="w-4 h-4" />
                Бюджет ({filters.currency})
              </label>
              <div className="space-y-4">
                <div className="px-3">
                  <Slider
                    min={0}
                    max={1000000}
                    step={10000}
                    value={[filters.minBudget, filters.maxBudget]}
                    onValueChange={([min, max]) => updateFilters({ minBudget: min, maxBudget: max })}
                    className="w-full"
                    data-testid="slider-budget-range"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">От:</span>
                    <Input
                      type="number"
                      value={filters.minBudget}
                      onChange={(e) => updateFilters({ minBudget: parseInt(e.target.value) || 0 })}
                      className="w-24"
                      data-testid="input-min-budget"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">До:</span>
                    <Input
                      type="number"
                      value={filters.maxBudget}
                      onChange={(e) => updateFilters({ maxBudget: parseInt(e.target.value) || 1000000 })}
                      className="w-24"
                      data-testid="input-max-budget"
                    />
                  </div>
                  <Select value={filters.currency} onValueChange={(value) => updateFilters({ currency: value })}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KZT">KZT</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Теги */}
            <div>
              <label className="text-sm font-medium flex items-center gap-1 mb-3">
                <Tag className="w-4 h-4" />
                Теги
              </label>
              <div className="space-y-3">
                <Popover open={isTagsOpen} onOpenChange={setIsTagsOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={isTagsOpen}
                      className="w-full justify-between"
                      data-testid="button-select-tags"
                    >
                      Выберите теги...
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput 
                        placeholder="Поиск тегов..." 
                        value={tagInput}
                        onValueChange={setTagInput}
                      />
                      <CommandList>
                        <CommandEmpty>
                          <Button
                            variant="ghost"
                            className="w-full"
                            onClick={() => {
                              if (tagInput.trim()) {
                                addTag(tagInput.trim());
                                setIsTagsOpen(false);
                              }
                            }}
                          >
                            Добавить "{tagInput}"
                          </Button>
                        </CommandEmpty>
                        <CommandGroup>
                          {popularTags
                            .filter(tag => !filters.tags.includes(tag))
                            .map((tag) => (
                              <CommandItem
                                key={tag}
                                value={tag}
                                onSelect={() => {
                                  addTag(tag);
                                  setIsTagsOpen(false);
                                }}
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${
                                    filters.tags.includes(tag) ? 'opacity-100' : 'opacity-0'
                                  }`}
                                />
                                {tag}
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                
                {filters.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {filters.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {tag}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Дополнительные фильтры */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium flex items-center gap-1 mb-3">
                  <Star className="w-4 h-4" />
                  Минимальный рейтинг
                </label>
                <Select 
                  value={filters.minRating.toString()} 
                  onValueChange={(value) => updateFilters({ minRating: parseFloat(value) })}
                >
                  <SelectTrigger data-testid="select-min-rating">
                    <SelectValue placeholder="Любой рейтинг" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Любой рейтинг</SelectItem>
                    <SelectItem value="3">3+ звезды</SelectItem>
                    <SelectItem value="4">4+ звезды</SelectItem>
                    <SelectItem value="4.5">4.5+ звезды</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Дополнительные фильтры</label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="urgent"
                    checked={filters.isUrgent}
                    onCheckedChange={(checked) => updateFilters({ isUrgent: !!checked })}
                    data-testid="checkbox-urgent"
                  />
                  <label htmlFor="urgent" className="text-sm">
                    Только срочные заказы
                  </label>
                </div>
              </div>
            </div>

            {/* Фильтры по поставщикам */}
            {showSupplierFilters && (
              <div className="border-t pt-6">
                <h4 className="text-sm font-medium flex items-center gap-1 mb-4">
                  <User className="w-4 h-4" />
                  Фильтры по исполнителям
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="online"
                        checked={filters.supplierFilters.isOnline}
                        onCheckedChange={(checked) => updateSupplierFilters({ isOnline: !!checked })}
                        data-testid="checkbox-online"
                      />
                      <label htmlFor="online" className="text-sm">
                        Только онлайн
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="portfolio"
                        checked={filters.supplierFilters.hasPortfolio}
                        onCheckedChange={(checked) => updateSupplierFilters({ hasPortfolio: !!checked })}
                        data-testid="checkbox-portfolio"
                      />
                      <label htmlFor="portfolio" className="text-sm">
                        С портфолио
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="verified"
                        checked={filters.supplierFilters.verified}
                        onCheckedChange={(checked) => updateSupplierFilters({ verified: !!checked })}
                        data-testid="checkbox-verified"
                      />
                      <label htmlFor="verified" className="text-sm">
                        Только проверенные
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Минимальный опыт (лет)
                    </label>
                    <Select 
                      value={filters.supplierFilters.minExperience.toString()} 
                      onValueChange={(value) => updateSupplierFilters({ minExperience: parseInt(value) })}
                    >
                      <SelectTrigger data-testid="select-min-experience">
                        <SelectValue placeholder="Любой опыт" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Любой опыт</SelectItem>
                        <SelectItem value="1">1+ лет</SelectItem>
                        <SelectItem value="3">3+ лет</SelectItem>
                        <SelectItem value="5">5+ лет</SelectItem>
                        <SelectItem value="10">10+ лет</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Активные фильтры */}
        {hasActiveFilters() && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Filter className="w-4 h-4" />
              <span>Активные фильтры:</span>
              <div className="flex flex-wrap gap-1">
                {filters.query && (
                  <Badge variant="outline">Поиск: {filters.query}</Badge>
                )}
                {filters.category !== 'all' && (
                  <Badge variant="outline">
                    Категория: {categories.find((c: any) => c.id === filters.category)?.title}
                  </Badge>
                )}
                {filters.city !== 'all' && (
                  <Badge variant="outline">Город: {filters.city}</Badge>
                )}
                {(filters.minBudget > 0 || filters.maxBudget < 1000000) && (
                  <Badge variant="outline">
                    Бюджет: {filters.minBudget.toLocaleString()}-{filters.maxBudget.toLocaleString()} {filters.currency}
                  </Badge>
                )}
                {filters.tags.map(tag => (
                  <Badge key={tag} variant="outline">Тег: {tag}</Badge>
                ))}
                {filters.minRating > 0 && (
                  <Badge variant="outline">Рейтинг: {filters.minRating}+</Badge>
                )}
                {filters.isUrgent && (
                  <Badge variant="outline">Срочные</Badge>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}