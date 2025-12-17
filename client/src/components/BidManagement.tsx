import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock, User, Phone, Mail, FileText, Calendar, DollarSign } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface BidManagementProps {
  ad: any;
  bids: any[];
  isOwner: boolean;
}

export default function BidManagement({ ad, bids, isOwner }: BidManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const acceptBidMutation = useMutation({
    mutationFn: (bidId: string) =>
      fetch(`/api/marketplace/bids/${bidId}/accept`, {
        method: 'PUT'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/ads'] });
      toast({ 
        title: 'Заявка принята', 
        description: 'Исполнитель выбран, остальные заявки отклонены' 
      });
    },
    onError: () => {
      toast({ 
        title: 'Ошибка', 
        description: 'Не удалось принять заявку',
        variant: 'destructive'
      });
    }
  });

  const rejectBidMutation = useMutation({
    mutationFn: (bidId: string) =>
      fetch(`/api/marketplace/bids/${bidId}/reject`, {
        method: 'PUT'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/ads'] });
      toast({ title: 'Заявка отклонена' });
    },
    onError: () => {
      toast({ 
        title: 'Ошибка', 
        description: 'Не удалось отклонить заявку',
        variant: 'destructive'
      });
    }
  });

  const closeAdMutation = useMutation({
    mutationFn: () =>
      fetch(`/api/marketplace/ads/${ad.id}/close`, {
        method: 'PUT'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/ads'] });
      toast({ 
        title: 'Объявление закрыто', 
        description: 'Все участники получат уведомления' 
      });
    },
    onError: () => {
      toast({ 
        title: 'Ошибка', 
        description: 'Не удалось закрыть объявление',
        variant: 'destructive'
      });
    }
  });

  const getBidStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
    }
  };

  const getBidStatusText = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'Принято';
      case 'rejected':
        return 'Отклонено';
      default:
        return 'На рассмотрении';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    const symbols = {
      'KZT': '₸',
      'USD': '$',
      'EUR': '€',
      'RUB': '₽'
    };
    return `${amount.toLocaleString()} ${symbols[currency as keyof typeof symbols] || currency}`;
  };

  if (!bids || bids.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Заявки на выполнение
          </CardTitle>
          <CardDescription>
            Пока что заявок нет
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Заявки на выполнение этого заказа пока не поступали
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Заявки на выполнение ({bids.length})
            </CardTitle>
            <CardDescription>
              {isOwner ? 'Управляйте заявками и выберите исполнителя' : 'Заявки от поставщиков услуг'}
            </CardDescription>
          </div>
          
          {isOwner && ad.status === 'active' && bids.some((bid: any) => bid.status === 'pending') && (
            <Button
              variant="outline"
              onClick={() => closeAdMutation.mutate()}
              disabled={closeAdMutation.isPending}
            >
              Закрыть заказ без выбора
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bids.map((bid: any) => (
            <div
              key={bid.id}
              className={`border rounded-lg p-4 ${
                bid.isSelected ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-medium">{bid.supplierName || 'Поставщик услуг'}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(bid.createdAt), { 
                          addSuffix: true, 
                          locale: ru 
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {formatCurrency(bid.amount, bid.currency)}
                      </span>
                    </div>
                    
                    {bid.deliveryTime && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Срок: {bid.deliveryTime}</span>
                      </div>
                    )}
                  </div>

                  {bid.description && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm">Описание предложения:</span>
                      </div>
                      <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                        {bid.description}
                      </p>
                    </div>
                  )}

                  {bid.contactInfo && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm">Контакты:</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {bid.contactInfo}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-3">
                  <Badge className={getBidStatusColor(bid.status)}>
                    {getBidStatusText(bid.status)}
                    {bid.isSelected && ' ✓'}
                  </Badge>

                  {isOwner && bid.status === 'pending' && ad.status === 'active' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => rejectBidMutation.mutate(bid.id)}
                        disabled={rejectBidMutation.isPending}
                        className="text-red-600 hover:text-red-700"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Отклонить
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => acceptBidMutation.mutate(bid.id)}
                        disabled={acceptBidMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Принять
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}