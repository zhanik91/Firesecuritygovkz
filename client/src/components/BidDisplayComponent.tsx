import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DollarSign, 
  Calendar, 
  User, 
  Star, 
  Clock, 
  Shield, 
  CheckCircle, 
  XCircle,
  MessageCircle,
  Award,
  Briefcase 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface Bid {
  id: string;
  amount: string;
  currency: string;
  proposedDeadline?: string;
  message?: string;
  status: string;
  isSelected: boolean;
  experienceDescription?: string;
  guaranteeOffered?: string;
  createdAt: string;
  supplier: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
    rating: string;
    reviewCount: number;
    companyName?: string;
    workExperience?: number;
    specializations?: string[];
    isOnline: boolean;
  };
}

interface BidDisplayComponentProps {
  bids: Bid[];
  adId: string;
  adStatus: string;
  isOwner: boolean;
  onBidUpdate?: () => void;
}

export default function BidDisplayComponent({ 
  bids, 
  adId, 
  adStatus, 
  isOwner,
  onBidUpdate 
}: BidDisplayComponentProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const acceptBidMutation = useMutation({
    mutationFn: async (bidId: string) => {
      const response = await apiRequest('PUT', `/api/marketplace/bids/${bidId}/accept`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/marketplace/ads/${adId}`] });
      toast({
        title: "Отклик принят",
        description: "Вы выбрали исполнителя для вашего заказа",
      });
      onBidUpdate?.();
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось принять отклик",
        variant: "destructive",
      });
    },
  });

  const rejectBidMutation = useMutation({
    mutationFn: async (bidId: string) => {
      const response = await apiRequest('PUT', `/api/marketplace/bids/${bidId}/reject`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/marketplace/ads/${adId}`] });
      toast({
        title: "Отклик отклонен",
        description: "Отклик был отклонен",
      });
      onBidUpdate?.();
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось отклонить отклик",
        variant: "destructive",
      });
    },
  });

  const formatDeadline = (deadline?: string) => {
    if (!deadline) return null;
    try {
      return formatDistanceToNow(new Date(deadline), { 
        addSuffix: true, 
        locale: ru 
      });
    } catch {
      return null;
    }
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

  const getStatusBadge = (status: string, isSelected: boolean) => {
    if (isSelected) {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Выбран</Badge>;
    }
    
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Принят</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Отклонен</Badge>;
      case 'withdrawn':
        return <Badge variant="secondary">Отозван</Badge>;
      default:
        return <Badge variant="outline">На рассмотрении</Badge>;
    }
  };

  if (!bids || bids.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Пока нет откликов на этот заказ</p>
            <p className="text-sm mt-2">Станьте первым, кто откликнется!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Отклики ({bids.length})
        </h3>
        {isOwner && adStatus === 'open' && (
          <Badge variant="outline" className="text-blue-600">
            Можно выбрать исполнителя
          </Badge>
        )}
      </div>

      <div className="space-y-4">
        {bids.map((bid) => (
          <Card 
            key={bid.id} 
            className={`transition-all duration-200 ${
              bid.isSelected ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-950' : 
              bid.status === 'accepted' ? 'ring-1 ring-green-300' :
              bid.status === 'rejected' ? 'opacity-60' : ''
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage 
                      src={bid.supplier.profileImageUrl} 
                      alt={`${bid.supplier.firstName} ${bid.supplier.lastName}`} 
                    />
                    <AvatarFallback>
                      {bid.supplier.firstName[0]}{bid.supplier.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">
                        {bid.supplier.firstName} {bid.supplier.lastName}
                      </h4>
                      {bid.supplier.isOnline && (
                        <div className="w-2 h-2 bg-green-500 rounded-full" title="Онлайн"></div>
                      )}
                    </div>
                    
                    {bid.supplier.companyName && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {bid.supplier.companyName}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">
                          {parseFloat(bid.supplier.rating).toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({bid.supplier.reviewCount} отзывов)
                        </span>
                      </div>
                      
                      {bid.supplier.workExperience && (
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <Award className="w-3 h-3" />
                          {bid.supplier.workExperience} лет опыта
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  {getStatusBadge(bid.status, bid.isSelected)}
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTimeAgo(bid.createdAt)}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Основная информация по заявке */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="font-semibold text-lg">
                    {parseFloat(bid.amount).toLocaleString()} {bid.currency}
                  </span>
                </div>
                
                {bid.proposedDeadline && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">
                      Срок: {formatDeadline(bid.proposedDeadline)}
                    </span>
                  </div>
                )}
              </div>

              {/* Специализации */}
              {bid.supplier.specializations && bid.supplier.specializations.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {bid.supplier.specializations.slice(0, 3).map((spec, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {spec}
                    </Badge>
                  ))}
                  {bid.supplier.specializations.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{bid.supplier.specializations.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* Сообщение */}
              {bid.message && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-sm whitespace-pre-wrap">{bid.message}</p>
                </div>
              )}

              {/* Опыт */}
              {bid.experienceDescription && (
                <div className="border-l-4 border-blue-200 pl-4">
                  <h5 className="font-medium text-sm text-blue-700 dark:text-blue-300 mb-1 flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    Релевантный опыт
                  </h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {bid.experienceDescription}
                  </p>
                </div>
              )}

              {/* Гарантии */}
              {bid.guaranteeOffered && (
                <div className="border-l-4 border-green-200 pl-4">
                  <h5 className="font-medium text-sm text-green-700 dark:text-green-300 mb-1 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Гарантии
                  </h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {bid.guaranteeOffered}
                  </p>
                </div>
              )}

              {/* Действия для владельца заказа */}
              {isOwner && adStatus === 'open' && bid.status === 'pending' && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={() => acceptBidMutation.mutate(bid.id)}
                    disabled={acceptBidMutation.isPending}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    data-testid={`button-accept-bid-${bid.id.slice(0, 8)}`}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Выбрать исполнителя
                  </Button>
                  <Button
                    onClick={() => rejectBidMutation.mutate(bid.id)}
                    disabled={rejectBidMutation.isPending}
                    variant="outline"
                    data-testid={`button-reject-bid-${bid.id.slice(0, 8)}`}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Отклонить
                  </Button>
                </div>
              )}

              {/* Информация о выбранном исполнителе */}
              {bid.isSelected && (
                <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Выбранный исполнитель</span>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    Этот поставщик был выбран для выполнения заказа
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}