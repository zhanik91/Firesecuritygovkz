import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, FileText, Video, Image, Calendar, Eye, Download } from 'lucide-react';

interface AdvancedSearchFilters {
  query: string;
  contentType: string;
  section: string;
  dateRange: string;
  author: string;
  tags: string[];
  sortBy: string;
}

export default function AdvancedSearch() {
  const [filters, setFilters] = useState<AdvancedSearchFilters>({
    query: '',
    contentType: 'all',
    section: 'all',
    dateRange: 'all',
    author: '',
    tags: [],
    sortBy: 'relevance'
  });

  const { data: results = [], isLoading } = useQuery({
    queryKey: ['/api/search/advanced', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all' && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else {
            params.append(key, value);
          }
        }
      });
      
      const response = await fetch(`/api/search/advanced?${params}`);
      return response.json();
    },
    enabled: filters.query.length > 0
  });

  const { data: sections = [] } = useQuery({
    queryKey: ['/api/sections']
  });

  const updateFilter = (key: keyof AdvancedSearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'post': return <FileText className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'photo': return <Image className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const groupedResults = results.reduce((acc: any, item: any) => {
    const type = item.type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Advanced Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Расширенный поиск
          </CardTitle>
          <CardDescription>
            Найдите именно то, что ищете, используя дополнительные фильтры
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="query">Поисковый запрос</Label>
              <Input
                id="query"
                placeholder="Введите ключевые слова..."
                value={filters.query}
                onChange={(e) => updateFilter('query', e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <Label>Тип контента</Label>
              <Select value={filters.contentType} onValueChange={(value) => updateFilter('contentType', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все типы</SelectItem>
                  <SelectItem value="post">Статьи</SelectItem>
                  <SelectItem value="document">Документы</SelectItem>
                  <SelectItem value="video">Видео</SelectItem>
                  <SelectItem value="photo">Фотографии</SelectItem>
                  <SelectItem value="presentation">Презентации</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Раздел</Label>
              <Select value={filters.section} onValueChange={(value) => updateFilter('section', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все разделы</SelectItem>
                  {(sections as any[]).map((section: any) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Период публикации</Label>
              <Select value={filters.dateRange} onValueChange={(value) => updateFilter('dateRange', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Любое время</SelectItem>
                  <SelectItem value="week">За неделю</SelectItem>
                  <SelectItem value="month">За месяц</SelectItem>
                  <SelectItem value="quarter">За квартал</SelectItem>
                  <SelectItem value="year">За год</SelectItem>
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
                  <SelectItem value="relevance">По релевантности</SelectItem>
                  <SelectItem value="date">По дате</SelectItem>
                  <SelectItem value="popularity">По популярности</SelectItem>
                  <SelectItem value="title">По названию</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {filters.query && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Результаты поиска: {results.length} найдено
            </h3>
            {results.length > 0 && (
              <div className="flex gap-2">
                {Object.keys(groupedResults).map((type) => (
                  <Badge key={type} variant="outline">
                    {type} ({groupedResults[type].length})
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {isLoading ? (
            <Card>
              <CardContent className="py-8 text-center">
                Поиск...
              </CardContent>
            </Card>
          ) : results.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">По вашему запросу ничего не найдено</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Попробуйте изменить условия поиска или использовать другие ключевые слова
                </p>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">Все ({results.length})</TabsTrigger>
                {Object.entries(groupedResults).map(([type, items]) => (
                  <TabsTrigger key={type} value={type}>
                    {type === 'post' ? 'Статьи' :
                     type === 'document' ? 'Документы' :
                     type === 'video' ? 'Видео' :
                     type === 'photo' ? 'Фото' : type} ({(items as any[]).length})
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="all">
                <div className="space-y-4">
                  {results.map((item: any, index: number) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-muted rounded-lg">
                            {getContentTypeIcon(item.type)}
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between">
                              <h4 className="font-medium line-clamp-2">
                                {item.title}
                              </h4>
                              <Badge variant="outline">{item.type}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {item.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              {item.publishedAt && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(item.publishedAt).toLocaleDateString('ru-RU')}
                                </span>
                              )}
                              {item.views && (
                                <span className="flex items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  {item.views} просмотров
                                </span>
                              )}
                              {item.downloads && (
                                <span className="flex items-center gap-1">
                                  <Download className="h-3 w-3" />
                                  {item.downloads} скачиваний
                                </span>
                              )}
                            </div>
                            <Button size="sm" variant="outline">
                              Перейти к материалу
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {Object.entries(groupedResults).map(([type, items]) => (
                <TabsContent key={type} value={type}>
                  <div className="space-y-4">
                    {(items as any[]).map((item: any, index: number) => (
                      <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <div className="p-2 bg-muted rounded-lg">
                              {getContentTypeIcon(item.type)}
                            </div>
                            <div className="flex-1 space-y-2">
                              <h4 className="font-medium line-clamp-2">
                                {item.title}
                              </h4>
                              <p className="text-sm text-muted-foreground line-clamp-3">
                                {item.description}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                {item.publishedAt && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(item.publishedAt).toLocaleDateString('ru-RU')}
                                  </span>
                                )}
                                {item.views && (
                                  <span className="flex items-center gap-1">
                                    <Eye className="h-3 w-3" />
                                    {item.views} просмотров
                                  </span>
                                )}
                              </div>
                              <Button size="sm" variant="outline">
                                Перейти к материалу
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      )}
    </div>
  );
}