import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { 
  Star, 
  MessageSquare, 
  ThumbsUp, 
  Clock, 
  Award, 
  User,
  CheckCircle,
  AlertCircle,
  Send
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

const reviewSchema = z.object({
  rating: z.number().min(1, "Выберите оценку").max(5, "Максимальная оценка 5"),
  comment: z.string().min(10, "Комментарий должен содержать минимум 10 символов"),
  serviceQuality: z.number().min(1).max(5),
  communication: z.number().min(1).max(5),
  punctuality: z.number().min(1).max(5),
  valueForMoney: z.number().min(1).max(5),
  wouldRecommend: z.boolean().default(true),
  isPublic: z.boolean().default(true),
});

interface Review {
  id: string;
  rating: number;
  comment: string;
  serviceQuality: number;
  communication: number;
  punctuality: number;
  valueForMoney: number;
  wouldRecommend: boolean;
  isPublic: boolean;
  response?: string;
  responseDate?: string;
  createdAt: string;
  reviewer: {
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
  ad?: {
    title: string;
  };
}

interface ReviewSystemProps {
  adId?: string;
  supplierId: string;
  canLeaveReview?: boolean;
  showReviewForm?: boolean;
}

const StarRating: React.FC<{
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}> = ({ rating, onRatingChange, readonly = false, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClasses[size]} cursor-pointer transition-colors ${
            star <= rating 
              ? 'text-yellow-500 fill-current' 
              : 'text-gray-300 dark:text-gray-600'
          }`}
          onClick={() => !readonly && onRatingChange?.(star)}
        />
      ))}
    </div>
  );
};

export default function ReviewSystem({ 
  adId, 
  supplierId, 
  canLeaveReview = false,
  showReviewForm = true 
}: ReviewSystemProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const form = useForm<z.infer<typeof reviewSchema>>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      comment: "",
      serviceQuality: 5,
      communication: 5,
      punctuality: 5,
      valueForMoney: 5,
      wouldRecommend: true,
      isPublic: true,
    },
  });

  // Загрузка отзывов
  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey: [`/api/reviews/supplier/${supplierId}`],
  });

  // Создание отзыва
  const createReviewMutation = useMutation({
    mutationFn: async (reviewData: z.infer<typeof reviewSchema>) => {
      const response = await apiRequest('POST', '/api/reviews', {
        ...reviewData,
        adId,
        revieweeId: supplierId,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/reviews/supplier/${supplierId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${supplierId}`] });
      toast({
        title: "Отзыв отправлен",
        description: "Спасибо за ваш отзыв!",
      });
      form.reset();
      setIsFormOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось отправить отзыв",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof reviewSchema>) => {
    createReviewMutation.mutate(values);
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: ru 
      });
    } catch {
      return "недавно";
    }
  };

  const calculateAverageRating = () => {
    if (!reviews.length) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length);
  };

  const getDetailedRatings = () => {
    if (!reviews.length) return null;
    
    const totals = reviews.reduce((acc, review) => ({
      serviceQuality: acc.serviceQuality + review.serviceQuality,
      communication: acc.communication + review.communication,
      punctuality: acc.punctuality + review.punctuality,
      valueForMoney: acc.valueForMoney + review.valueForMoney,
    }), { serviceQuality: 0, communication: 0, punctuality: 0, valueForMoney: 0 });

    const count = reviews.length;
    return {
      serviceQuality: totals.serviceQuality / count,
      communication: totals.communication / count,
      punctuality: totals.punctuality / count,
      valueForMoney: totals.valueForMoney / count,
    };
  };

  const averageRating = calculateAverageRating();
  const detailedRatings = getDetailedRatings();
  const recommendationRate = reviews.length > 0 
    ? (reviews.filter(r => r.wouldRecommend).length / reviews.length) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Общая статистика */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Рейтинг и отзывы
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {averageRating.toFixed(1)}
              </div>
              <StarRating rating={Math.round(averageRating)} readonly size="md" />
              <div className="text-sm text-gray-500 mt-1">
                {reviews.length} отзывов
              </div>
            </div>
            
            <div className="flex-1 space-y-2">
              {detailedRatings && (
                <>
                  <div className="flex justify-between text-sm">
                    <span>Качество услуг</span>
                    <div className="flex items-center gap-2">
                      <StarRating rating={Math.round(detailedRatings.serviceQuality)} readonly size="sm" />
                      <span className="font-medium">{detailedRatings.serviceQuality.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Коммуникация</span>
                    <div className="flex items-center gap-2">
                      <StarRating rating={Math.round(detailedRatings.communication)} readonly size="sm" />
                      <span className="font-medium">{detailedRatings.communication.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Пунктуальность</span>
                    <div className="flex items-center gap-2">
                      <StarRating rating={Math.round(detailedRatings.punctuality)} readonly size="sm" />
                      <span className="font-medium">{detailedRatings.punctuality.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Цена/качество</span>
                    <div className="flex items-center gap-2">
                      <StarRating rating={Math.round(detailedRatings.valueForMoney)} readonly size="sm" />
                      <span className="font-medium">{detailedRatings.valueForMoney.toFixed(1)}</span>
                    </div>
                  </div>
                </>
              )}
              
              {recommendationRate > 0 && (
                <div className="flex items-center gap-2 text-sm pt-2 border-t">
                  <ThumbsUp className="w-4 h-4 text-green-600" />
                  <span>{recommendationRate.toFixed(0)}% клиентов рекомендуют</span>
                </div>
              )}
            </div>
          </div>

          {/* Форма отзыва */}
          {canLeaveReview && showReviewForm && (
            <div className="pt-4 border-t">
              <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-open-review-form">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Оставить отзыв
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Оставить отзыв</DialogTitle>
                    <DialogDescription>
                      Поделитесь своим опытом сотрудничества с этим поставщиком
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      {/* Общая оценка */}
                      <FormField
                        control={form.control}
                        name="rating"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Общая оценка</FormLabel>
                            <FormControl>
                              <StarRating 
                                rating={field.value} 
                                onRatingChange={field.onChange}
                                size="lg"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Детальные оценки */}
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="serviceQuality"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Качество услуг</FormLabel>
                              <FormControl>
                                <StarRating 
                                  rating={field.value} 
                                  onRatingChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="communication"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Коммуникация</FormLabel>
                              <FormControl>
                                <StarRating 
                                  rating={field.value} 
                                  onRatingChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="punctuality"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Пунктуальность</FormLabel>
                              <FormControl>
                                <StarRating 
                                  rating={field.value} 
                                  onRatingChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="valueForMoney"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Цена/качество</FormLabel>
                              <FormControl>
                                <StarRating 
                                  rating={field.value} 
                                  onRatingChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Комментарий */}
                      <FormField
                        control={form.control}
                        name="comment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ваш отзыв</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Расскажите о своем опыте сотрудничества..."
                                className="min-h-[100px]"
                                {...field}
                                data-testid="textarea-review-comment"
                              />
                            </FormControl>
                            <FormDescription>
                              Опишите качество работы, сроки выполнения, общение с исполнителем
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Рекомендация */}
                      <FormField
                        control={form.control}
                        name="wouldRecommend"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Рекомендую этого исполнителя
                              </FormLabel>
                              <FormDescription>
                                Порекомендовали бы вы этого поставщика другим клиентам?
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="switch-would-recommend"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {/* Публичность */}
                      <FormField
                        control={form.control}
                        name="isPublic"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Публичный отзыв
                              </FormLabel>
                              <FormDescription>
                                Отзыв будет виден другим пользователям
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="switch-is-public"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        disabled={createReviewMutation.isPending}
                        className="w-full"
                        data-testid="button-submit-review"
                      >
                        {createReviewMutation.isPending ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Отправляем...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Send className="w-4 h-4" />
                            Отправить отзыв
                          </div>
                        )}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Список отзывов */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Загрузка отзывов...</p>
          </div>
        ) : reviews.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Пока нет отзывов</p>
                <p className="text-sm mt-2">Станьте первым, кто оставит отзыв!</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage 
                      src={review.reviewer.profileImageUrl} 
                      alt={`${review.reviewer.firstName} ${review.reviewer.lastName}`} 
                    />
                    <AvatarFallback>
                      {review.reviewer.firstName[0]}{review.reviewer.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium">
                          {review.reviewer.firstName} {review.reviewer.lastName}
                        </h4>
                        {review.ad && (
                          <p className="text-sm text-gray-500">
                            Заказ: {review.ad.title}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <StarRating rating={review.rating} readonly />
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTimeAgo(review.createdAt)}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      {review.comment}
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <span>Качество:</span>
                        <StarRating rating={review.serviceQuality} readonly size="sm" />
                      </div>
                      <div className="flex items-center gap-1">
                        <span>Общение:</span>
                        <StarRating rating={review.communication} readonly size="sm" />
                      </div>
                      <div className="flex items-center gap-1">
                        <span>Сроки:</span>
                        <StarRating rating={review.punctuality} readonly size="sm" />
                      </div>
                      <div className="flex items-center gap-1">
                        <span>Цена:</span>
                        <StarRating rating={review.valueForMoney} readonly size="sm" />
                      </div>
                    </div>
                    
                    {review.wouldRecommend && (
                      <div className="flex items-center gap-1 mt-2 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">Рекомендует</span>
                      </div>
                    )}
                    
                    {review.response && (
                      <div className="mt-4 bg-blue-50 dark:bg-blue-950 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                            Ответ исполнителя
                          </span>
                          {review.responseDate && (
                            <span className="text-xs text-gray-500">
                              {formatTimeAgo(review.responseDate)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          {review.response}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}