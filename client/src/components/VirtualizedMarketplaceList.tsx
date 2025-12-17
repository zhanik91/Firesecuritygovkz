import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  AlertTriangle, 
  Briefcase,
  User,
  Eye
} from 'lucide-react';
import { Link } from 'wouter';

interface MarketplaceAd {
  id: string;
  title: string;
  slug: string;
  description: string;
  budget?: string;
  budgetCurrency: string;
  city?: string;
  deadline?: string;
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

interface VirtualizedMarketplaceListProps {
  ads: MarketplaceAd[];
  height?: number;
  itemHeight?: number;
}

const MarketplaceListItem = memo(({ ad }: { ad: MarketplaceAd }) => {
  const formatBudget = (budget?: string, currency?: string) => {
    if (!budget) return 'Договорная';
    const currencySymbol = currency === 'KZT' ? '₸' : 
                          currency === 'USD' ? '$' : 
                          currency === 'EUR' ? '€' : 
                          currency === 'RUB' ? '₽' : currency || '';
    return `${parseFloat(budget).toLocaleString('ru')} ${currencySymbol}`;
  };

  const getAuthorName = (user?: MarketplaceAd['user']) => {
    if (user?.companyName) return user.companyName;
    if (user?.firstName && user?.lastName) return `${user.firstName} ${user.lastName}`;
    if (user?.firstName) return user.firstName;
    return 'Анонимный пользователь';
  };

  return (
    <Card className="mb-4 hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg leading-tight">
                <Link href={`/marketplace/${ad.slug}`} className="hover:text-blue-600">
                  {ad.title}
                </Link>
              </CardTitle>
              {ad.isUrgent && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Срочно
                </Badge>
              )}
            </div>
            {ad.category && (
              <Badge variant="secondary" className="text-xs mb-2">
                <Briefcase className="w-3 h-3 mr-1" />
                {ad.category.title}
              </Badge>
            )}
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-green-600 mb-1">
              <DollarSign className="w-4 h-4 inline mr-1" />
              {formatBudget(ad.budget, ad.budgetCurrency)}
            </div>
            <div className="text-xs text-gray-500">
              <Eye className="w-3 h-3 inline mr-1" />
              {ad.views} просмотров
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
          {ad.description}
        </p>
        <div className="flex justify-between items-center text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center">
              <User className="w-3 h-3 mr-1" />
              {getAuthorName(ad.user)}
            </span>
            {ad.city && (
              <span className="flex items-center">
                <MapPin className="w-3 h-3 mr-1" />
                {ad.city}
              </span>
            )}
          </div>
          <span className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {formatDistanceToNow(new Date(ad.createdAt), { 
              addSuffix: true, 
              locale: ru 
            })}
          </span>
        </div>
        <div className="flex justify-between items-center mt-3">
          <div className="text-sm text-blue-600">
            {ad.bidCount} откликов
          </div>
          <Link href={`/marketplace/${ad.slug}`}>
            <Button size="sm" variant="outline">
              Подробнее
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
});

export default function VirtualizedMarketplaceList({ ads }: VirtualizedMarketplaceListProps) {
  return (
    <div className="space-y-4">
      {ads.map((ad) => (
        <MarketplaceListItem key={ad.id} ad={ad} />
      ))}
    </div>
  );
}