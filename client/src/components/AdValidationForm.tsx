
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, AlertCircle, Info } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import RegionCitySelector from './RegionCitySelector';

const adFormSchema = z.object({
  title: z.string()
    .min(10, 'Заголовок должен содержать минимум 10 символов')
    .max(100, 'Заголовок не должен превышать 100 символов'),
  description: z.string()
    .min(50, 'Описание должно содержать минимум 50 символов')
    .max(2000, 'Описание не должно превышать 2000 символов'),
  categoryId: z.string().min(1, 'Выберите категорию'),
  region: z.string().min(1, 'Выберите регион'),
  city: z.string().min(1, 'Выберите город'),
  budget: z.coerce.number()
    .min(5000, 'Минимальный бюджет 5000 тенге')
    .max(50000000, 'Максимальный бюджет 50 млн тенге')
    .optional(),
  deadline: z.date().optional(),
  isUrgent: z.boolean().default(false),
  requirements: z.string().max(1000, 'Требования не должны превышать 1000 символов').optional(),
  contactPhone: z.string()
    .regex(/^\+7\d{10}$/, 'Телефон должен быть в формате +7XXXXXXXXXX')
    .optional(),
  contactEmail: z.string().email('Неверный формат email').optional(),
});

type AdFormData = z.infer<typeof adFormSchema>;

interface AdValidationFormProps {
  categories: any[];
  onSubmit: (data: AdFormData) => void;
  isLoading?: boolean;
}

export default function AdValidationForm({ categories, onSubmit, isLoading }: AdValidationFormProps) {
  const form = useForm<AdFormData>({
    resolver: zodResolver(adFormSchema),
    defaultValues: {
      title: '',
      description: '',
      categoryId: '',
      region: 'all',
      city: 'all',
      isUrgent: false,
      requirements: '',
    },
  });

  const handleSubmit = (data: AdFormData) => {
    onSubmit(data);
  };

  const watchedBudget = form.watch('budget');
  const watchedTitle = form.watch('title');
  const watchedDescription = form.watch('description');

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Создание заказа
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Основная информация */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Заголовок заказа *
                        <span className="text-sm text-gray-500 ml-2">
                          ({watchedTitle.length}/100)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Например: Монтаж пожарной сигнализации в офисе" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Категория *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите категорию" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Бюджет (тенге)
                      {watchedBudget && (
                        <span className="text-sm text-green-600 ml-2">
                          {watchedBudget.toLocaleString()} ₸
                        </span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="100000" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Описание */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Описание заказа *
                    <span className="text-sm text-gray-500 ml-2">
                      ({watchedDescription.length}/2000)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Подробно опишите что нужно сделать, требования к исполнителю, сроки и другие важные детали..."
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Местоположение */}
            <div>
              <label className="text-sm font-medium mb-4 block">Местоположение *</label>
              <RegionCitySelector
                selectedRegion={form.watch('region')}
                selectedCity={form.watch('city')}
                onRegionChange={(region) => form.setValue('region', region)}
                onCityChange={(city) => form.setValue('city', city)}
              />
              {form.formState.errors.region && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.region.message}</p>
              )}
              {form.formState.errors.city && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.city.message}</p>
              )}
            </div>

            {/* Дополнительные параметры */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Крайний срок</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                          >
                            {field.value ? (
                              format(field.value, "dd MMMM yyyy", { locale: ru })
                            ) : (
                              <span>Выберите дату</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isUrgent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        Срочный заказ
                      </FormLabel>
                      <div className="text-sm text-gray-500">
                        Заказ будет отмечен как срочный
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Контактная информация */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Телефон для связи</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="+77771234567" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email для связи</FormLabel>
                    <FormControl>
                      <Input 
                        type="email"
                        placeholder="example@email.com" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Дополнительные требования */}
            <FormField
              control={form.control}
              name="requirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Дополнительные требования</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Лицензии, сертификаты, опыт работы и другие требования к исполнителю..."
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline">
                Сохранить как черновик
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? 'Создание...' : 'Опубликовать заказ'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
