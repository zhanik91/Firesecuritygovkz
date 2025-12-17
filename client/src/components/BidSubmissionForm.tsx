import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Calendar, FileText, Send, Clock, Star } from 'lucide-react';

const bidSchema = z.object({
  amount: z.string().min(1, "Укажите стоимость"),
  proposedDeadline: z.string().optional(),
  message: z.string().min(10, "Опишите ваше предложение (минимум 10 символов)"),
  experienceDescription: z.string().optional(),
  guaranteeOffered: z.string().optional(),
});

interface BidSubmissionFormProps {
  adId: string;
  adTitle: string;
  adBudget?: string;
  adCurrency?: string;
  onSuccess?: () => void;
}

export default function BidSubmissionForm({ 
  adId, 
  adTitle, 
  adBudget, 
  adCurrency = "KZT",
  onSuccess 
}: BidSubmissionFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof bidSchema>>({
    resolver: zodResolver(bidSchema),
    defaultValues: {
      amount: adBudget || "",
      proposedDeadline: "",
      message: "",
      experienceDescription: "",
      guaranteeOffered: "",
    },
  });

  const submitBidMutation = useMutation({
    mutationFn: async (bidData: z.infer<typeof bidSchema>) => {
      const response = await apiRequest('POST', `/api/marketplace/ads/${adId}/bids`, {
        ...bidData,
        amount: parseFloat(bidData.amount),
        currency: adCurrency,
        proposedDeadline: bidData.proposedDeadline ? new Date(bidData.proposedDeadline).toISOString() : undefined,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/marketplace/ads/${adId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/ads'] });
      toast({
        title: "Отклик отправлен",
        description: "Ваш отклик успешно отправлен заказчику",
      });
      form.reset();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось отправить отклик",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof bidSchema>) => {
    submitBidMutation.mutate(values);
  };

  if (!user || user.role !== 'supplier') {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Только поставщики могут отправлять отклики</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5" />
          Отправить отклик
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Заказ: {adTitle}
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Предложенная стоимость */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Ваша стоимость ({adCurrency})
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="50000"
                      {...field}
                      data-testid="input-bid-amount"
                    />
                  </FormControl>
                  {adBudget && (
                    <FormDescription>
                      Бюджет заказчика: {parseFloat(adBudget).toLocaleString()} {adCurrency}
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Предложенный срок */}
            <FormField
              control={form.control}
              name="proposedDeadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Предложенный срок выполнения
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      min={new Date().toISOString().split('T')[0]}
                      data-testid="input-proposed-deadline"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Основное сообщение */}
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Ваше предложение
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Опишите как вы планируете выполнить этот заказ, ваш подход и преимущества..."
                      className="min-h-[120px]"
                      {...field}
                      data-testid="textarea-bid-message"
                    />
                  </FormControl>
                  <FormDescription>
                    Расскажите о своем опыте и подходе к выполнению заказа
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Описание опыта */}
            <FormField
              control={form.control}
              name="experienceDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Релевантный опыт
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Опишите ваш опыт в похожих проектах..."
                      {...field}
                      data-testid="textarea-experience-description"
                    />
                  </FormControl>
                  <FormDescription>
                    Укажите примеры похожих работ, которые вы выполняли
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Гарантии */}
            <FormField
              control={form.control}
              name="guaranteeOffered"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Предлагаемые гарантии
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Какие гарантии качества вы предоставляете?"
                      {...field}
                      data-testid="textarea-guarantee-offered"
                    />
                  </FormControl>
                  <FormDescription>
                    Укажите гарантийные обязательства по результатам работы
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4 pt-6 border-t">
              <Button
                type="submit"
                disabled={submitBidMutation.isPending}
                className="flex-1"
                data-testid="button-submit-bid"
              >
                {submitBidMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Отправляем...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Отправить отклик
                  </div>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}