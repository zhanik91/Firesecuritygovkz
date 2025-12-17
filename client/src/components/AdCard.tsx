import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Eye, 
  MessageSquare, 
  Clock,
  Building,
  Zap
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

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
    title: string;
  };
  user?: {
    firstName?: string;
    lastName?: string;
    companyName?: string;
  };
}

interface AdCardProps {
  ad: Ad;
  viewMode?: "grid" | "list";
}

export default function AdCard({ ad, viewMode = "grid" }: AdCardProps) {
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: ru 
      });
    } catch {
      return "недавно";
    }
  };

  const formatBudget = (budget?: string, currency = "KZT") => {
    if (!budget) return "Договорная";
    const amount = parseFloat(budget);
    return `${amount.toLocaleString()} ${currency}`;
  };

  const formatDeadline = (deadline?: string) => {
    if (!deadline) return null;
    try {
      const date = new Date(deadline);
      const days = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (days < 0) return "Просрочен";
      if (days === 0) return "Сегодня";
      if (days === 1) return "Завтра";
      return `${days} дней`;
    } catch {
      return null;
    }
  };

  if (viewMode === "list") {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              {ad.isUrgent && (
                <Badge variant="destructive" className="flex items-center animate-pulse">
                  <Zap className="w-3 h-3 mr-1" />
                  СРОЧНО
                </Badge>
              )}
              {ad.category && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700">
                  {ad.category.title}
                </Badge>
              )}
              <Badge variant="secondary" className="text-xs">
                ID: {ad.id.slice(0, 8)}
              </Badge>
            </div>
            
            <Link href={`/marketplace/${ad.slug}`}>
              <h3 className="text-xl font-semibold hover:text-blue-600 transition-colors cursor-pointer line-clamp-2 mb-3 leading-tight">
                {ad.title}
              </h3>
            </Link>
            
            <p className="text-gray-600 dark:text-gray-400 line-clamp-3 mb-4 leading-relaxed">
              {ad.description}
            </p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              {ad.city && (
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                  <span className="font-medium">{ad.city}</span>
                </div>
              )}
              
              <div className="flex items-center text-green-600 dark:text-green-400 font-semibold">
                <DollarSign className="w-4 h-4 mr-2" />
                {formatBudget(ad.budget, ad.budgetCurrency)}
              </div>
              
              {ad.deadline && formatDeadline(ad.deadline) && (
                <div className="flex items-center text-orange-600 dark:text-orange-400">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="font-medium">{formatDeadline(ad.deadline)}</span>
                </div>
              )}
              
              {ad.user?.companyName && (
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Building className="w-4 h-4 mr-2 text-gray-500" />
                  <span>{ad.user.companyName}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="text-right ml-4">
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
              <span className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {ad.views}
              </span>
              <span className="flex items-center">
                <MessageSquare className="w-4 h-4 mr-1" />
                {ad.bidCount}
              </span>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              {formatDate(ad.createdAt)}
            </p>
            
            <div className="flex flex-col gap-2">
              <Link href={`/marketplace/${ad.slug}`}>
                <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium" data-testid={`button-respond-ad-${ad.id.slice(0, 8)}`}>
                  Откликнуться
                </Button>
              </Link>
              <Link href={`/marketplace/${ad.slug}`}>
                <Button variant="outline" size="sm" className="w-full" data-testid={`button-details-ad-${ad.id.slice(0, 8)}`}>
                  Подробнее
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600 card-hover">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          {ad.isUrgent && (
            <Badge variant="destructive" className="flex items-center animate-pulse">
              <Zap className="w-3 h-3 mr-1" />
              СРОЧНО
            </Badge>
          )}
          {ad.category && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700">
              {ad.category.title}
            </Badge>
          )}
          <Badge variant="secondary" className="text-xs">
            {ad.bidCount} откликов
          </Badge>
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          {formatDate(ad.createdAt)}
        </div>
      </div>

      {/* Title */}
      <Link href={`/marketplace/${ad.slug}`}>
        <h3 className="text-lg font-semibold hover:text-blue-600 transition-colors cursor-pointer line-clamp-2 mb-3 leading-tight">
          {ad.title}
        </h3>
      </Link>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4">
        {ad.description}
      </p>

      {/* Meta Information */}
      <div className="space-y-2 mb-4">
        {ad.city && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="w-4 h-4 mr-2" />
            {ad.city}
          </div>
        )}
        
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <DollarSign className="w-4 h-4 mr-2" />
          <span className="font-medium text-gray-900 dark:text-white">
            {formatBudget(ad.budget, ad.budgetCurrency)}
          </span>
        </div>
        
        {ad.deadline && formatDeadline(ad.deadline) && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4 mr-2" />
            <span className={formatDeadline(ad.deadline) === "Просрочен" ? "text-red-600" : ""}>
              {formatDeadline(ad.deadline)}
            </span>
          </div>
        )}
        
        {ad.user?.companyName && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Building className="w-4 h-4 mr-2" />
            {ad.user.companyName}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {ad.user?.firstName && ad.user?.lastName ? (
              <span className="font-medium">{ad.user.firstName} {ad.user.lastName}</span>
            ) : (
              <span>Заказчик</span>
            )}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {ad.views} просмотров
          </div>
        </div>
        
        <div className="flex gap-2">
          <Link href={`/marketplace/${ad.slug}`} className="flex-1">
            <Button 
              size="sm" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
              data-testid={`button-respond-grid-${ad.id.slice(0, 8)}`}
            >
              Откликнуться
            </Button>
          </Link>
          <Link href={`/marketplace/${ad.slug}`}>
            <Button 
              variant="outline" 
              size="sm" 
              className="px-4"
              data-testid={`button-details-grid-${ad.id.slice(0, 8)}`}
            >
              Детали
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
