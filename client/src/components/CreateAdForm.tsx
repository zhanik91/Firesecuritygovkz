import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import { Plus, X, MapPin, Calendar, DollarSign, AlertTriangle } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const createAdSchema = z.object({
  title: z.string().min(10, 'Заголовок должен содержать минимум 10 символов').max(100, 'Заголовок не должен превышать 100 символов'),
  description: z.string().min(50, 'Описание должно содержать минимум 50 символов').max(2000, 'Описание не должно превышать 2000 символов'),
  categoryId: z.string().min(1, 'Выберите категорию'),
  city: z.string().min(1, 'Укажите город'),
  budget: z.number().min(1000, 'Минимальный бюджет 1000 тенге').max(50000000, 'Максимальный бюджет 50 млн тенге').optional(),
  deadline: z.string().optional(),
  isUrgent: z.boolean(),
  requirements: z.string().optional(),
  contactInfo: z.object({
    phone: z.string().regex(/^\+7\d{10}$/, 'Неверный формат телефона (+7XXXXXXXXXX)').optional(),
    email: z.string().email('Неверный формат email').optional(),
  }).optional(),
});

interface CreateAdFormProps {
  onSuccess?: () => void;
}

export default function CreateAdForm({ onSuccess }: CreateAdFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    type: 'service' as 'sell' | 'buy' | 'service' | 'other',
    budget: '',
    budgetCurrency: 'KZT',
    city: '',
    region: '',
    deadline: '',
    validUntil: '',
    contactPhone: '',
    contactEmail: '',
    isUrgent: false,
    requirements: '',
    tags: [] as string[],
    deliverables: ''
  });

  const [newTag, setNewTag] = useState('');

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/marketplace/categories']
  });

  const createAdMutation = useMutation({
    mutationFn: async (adData: any) => {
      const response = await apiRequest('POST', '/api/marketplace/ads', adData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/ads'] });
      toast({ title: 'Заказ размещен', description: 'Ваш заказ успешно опубликован' });
      onSuccess?.();
      // Reset form
      setFormData({
        title: '',
        description: '',
        categoryId: '',
        type: 'service',
        budget: '',
        budgetCurrency: 'KZT',
        city: '',
        region: '',
        deadline: '',
        validUntil: '',
        contactPhone: '',
        contactEmail: '',
        isUrgent: false,
        requirements: '',
        tags: [],
        deliverables: ''
      });
    },
    onError: (error) => {
      toast({ 
        title: 'Ошибка', 
        description: 'Не удалось разместить заказ. Попробуйте снова.',
        variant: 'destructive'
      });
    }
  });

  const cities = [
    'Алматы', 'Нур-Султан', 'Шымкент', 'Караганда', 'Актобе', 
    'Тараз', 'Павлодар', 'Усть-Каменогорск', 'Семей', 'Атырау'
  ];

  const regions = [
    'Алматинская область', 'Акмолинская область', 'Актюбинская область',
    'Атырауская область', 'Восточно-Казахстанская область', 'Жамбылская область',
    'Западно-Казахстанская область', 'Карагандинская область', 'Костанайская область',
    'Кызылординская область', 'Мангистауская область', 'Павлодарская область',
    'Северо-Казахстанская область', 'Туркестанская область', 'г. Алматы', 'г. Нур-Султан', 'г. Шымкент'
  ];

  const adTypes = [
    { value: 'sell', label: 'Продам', icon: '💰' },
    { value: 'buy', label: 'Куплю', icon: '🛒' },
    { value: 'service', label: 'Услуга', icon: '🔧' },
    { value: 'other', label: 'Другое', icon: '📋' }
  ];

  const currencies = [
    { value: 'KZT', label: '₸ Тенге' },
    { value: 'USD', label: '$ Доллар' },
    { value: 'EUR', label: '€ Евро' },
    { value: 'RUB', label: '₽ Рубль' }
  ];

  const updateFormData = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      updateFormData('tags', [...formData.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateFormData('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.categoryId) {
      toast({ 
        title: 'Заполните обязательные поля', 
        description: 'Название, описание и категория обязательны для заполнения',
        variant: 'destructive'
      });
      return;
    }

    const adData = {
      ...formData,
      userId: (user as any)?.id,
      budget: formData.budget ? parseFloat(formData.budget) : null,
      deadline: formData.deadline || null,
      validUntil: formData.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      isActive: true,
      isApproved: false // Требует модерации
    };

    createAdMutation.mutate(adData);
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Разместить заказ
        </CardTitle>
        <CardDescription>
          Создайте заказ для поиска поставщиков услуг пожарной безопасности
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Основная информация</h3>

            <div>
              <Label htmlFor="title">Название заказа *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateFormData('title', e.target.value)}
                placeholder="Кратко опишите, что нужно сделать"
                className="mt-1"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Тип объявления *</Label>
                <Select value={formData.type} onValueChange={(value) => updateFormData('type', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Выберите тип" />
                  </SelectTrigger>
                  <SelectContent>
                    {adTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <span className="flex items-center gap-2">
                          <span>{type.icon}</span>
                          {type.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">Категория *</Label>
                <Select value={formData.categoryId} onValueChange={(value) => updateFormData('categoryId', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    {(categories as any[]).map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Подробное описание *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                placeholder="Опишите задачу подробно: что нужно сделать, какие требования, особенности объекта"
                rows={4}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="requirements">Требования к исполнителю</Label>
              <Textarea
                id="requirements"
                value={formData.requirements}
                onChange={(e) => updateFormData('requirements', e.target.value)}
                placeholder="Лицензии, сертификаты, опыт работы, рекомендации"
                rows={3}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="deliverables">Ожидаемый результат</Label>
              <Textarea
                id="deliverables"
                value={formData.deliverables}
                onChange={(e) => updateFormData('deliverables', e.target.value)}
                placeholder="Что должен получить заказчик: документы, оборудование, услуги"
                rows={2}
                className="mt-1"
              />
            </div>
          </div>

          {/* Budget and Timeline */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Бюджет и сроки</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="budget">Бюджет</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="budget"
                    type="number"
                    value={formData.budget}
                    onChange={(e) => updateFormData('budget', e.target.value)}
                    placeholder="0"
                    className="flex-1"
                  />
                  <Select value={formData.budgetCurrency} onValueChange={(value) => updateFormData('budgetCurrency', value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="deadline">Срок выполнения</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => updateFormData('deadline', e.target.value)}
                  className="mt-1"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <Label htmlFor="validUntil">Актуально до</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={formData.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  onChange={(e) => updateFormData('validUntil', e.target.value)}
                  className="mt-1"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="urgent"
                checked={formData.isUrgent}
                onCheckedChange={(checked) => updateFormData('isUrgent', checked)}
              />
              <Label htmlFor="urgent" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Срочный заказ
              </Label>
            </div>
          </div>

          {/* Location and Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Местоположение и контакты</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="region">Область/регион</Label>
                <Select value={formData.region} onValueChange={(value) => updateFormData('region', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Выберите область" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="city">Город</Label>
                <Select value={formData.city} onValueChange={(value) => updateFormData('city', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Выберите город" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactPhone">Телефон для связи</Label>
                <Input
                  id="contactPhone"
                  value={formData.contactPhone}
                  onChange={(e) => updateFormData('contactPhone', e.target.value)}
                  placeholder="+7 (xxx) xxx-xx-xx"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="contactEmail">Email для связи</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => updateFormData('contactEmail', e.target.value)}
                  placeholder="email@example.com"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Теги</h3>

            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Добавить тег"
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} variant="outline">
                Добавить
              </Button>
            </div>

            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-6 border-t">
            <Button 
              type="submit" 
              disabled={createAdMutation.isPending}
              className="flex-1"
            >
              {createAdMutation.isPending ? 'Размещение...' : 'Разместить заказ'}
            </Button>
            <Button type="button" variant="outline" onClick={onSuccess}>
              Отмена
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}