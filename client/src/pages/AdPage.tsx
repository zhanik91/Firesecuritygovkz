import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  ArrowRight, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Eye, 
  MessageSquare, 
  Clock,
  Building,
  Zap,
  User,
  Briefcase,
  Plus,
  Send
} from "lucide-react";
import BidManagement from "@/components/BidManagement";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

interface Ad {
  id: string;
  title: string;
  slug: string;
  description: string;
  requirements?: string;
  budget?: string;
  budgetCurrency: string;
  deadline?: string;
  city?: string;
  isUrgent: boolean;
  status: string;
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
  bids?: Bid[];
}

interface Bid {
  id: string;
  amount: string;
  currency: string;
  proposedDeadline?: string;
  message?: string;
  status: string;
  isSelected: boolean;
  createdAt: string;
  supplier?: {
    firstName?: string;
    lastName?: string;
    companyName?: string;
  };
}

const bidSchema = z.object({
  amount: z.string().min(1, "Укажите сумму"),
  proposedDeadline: z.string().optional(),
  message: z.string().min(10, "Сообщение должно содержать минимум 10 символов"),
});

export default function AdPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isBidDialogOpen, setIsBidDialogOpen] = useState(false);

  const { data: ad, isLoading, error } = useQuery<Ad>({
    queryKey: ["/api/marketplace/ads", slug],
  });

  const form = useForm<z.infer<typeof bidSchema>>({
    resolver: zodResolver(bidSchema),
    defaultValues: {
      amount: "",
      proposedDeadline: "",
      message: "",
    },
  });

  const bidMutation = useMutation({
    mutationFn: async (bidData: z.infer<typeof bidSchema>) => {
      if (!ad?.id) throw new Error("Ad not found");
      return await apiRequest("POST", `/api/marketplace/ads/${ad.id}/bids`, bidData);
    },
    onSuccess: () => {
      toast({
        title: "Отклик отправлен",
        description: "Ваш отклик успешно отправлен заказчику",
      });
      setIsBidDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace/ads", slug] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Необходима авторизация",
          description: "Войдите в систему для отправки отклика",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Ошибка",
        description: "Не удалось отправить отклик. Попробуйте еще раз.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof bidSchema>) => {
    bidMutation.mutate(data);
  };

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
      return `через ${days} дней`;
    } catch {
      return null;
    }
  };

  const canBid = isAuthenticated && (user as any)?.role === 'supplier' && ad?.status === 'open';
  const isOwner = isAuthenticated && (user as any)?.id === (ad?.user as any)?.id;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-300 dark:bg-gray-600 rounded-xl"></div>
                <div className="h-48 bg-gray-300 dark:bg-gray-600 rounded-xl"></div>
              </div>
              <div className="h-96 bg-gray-300 dark:bg-gray-600 rounded-xl"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !ad) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Заказ не найден
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Запрашиваемый заказ не существует или был удален
            </p>
            <Link href="/marketplace">
              <Button>Вернуться к заказам</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SEOHead 
        title={`${ad.title} | Маркетплейс NewsFire`}
        description={ad.description}
        keywords={`пожарная безопасность, заказ, ${ad.category?.title || ''}, Казахстан`}
        canonical={`https://newsfire.kz/marketplace/ads/${ad.slug}`}
      />
      <Header />
      
      <div className="marketplace-section">
        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
            <Link href="/">
              <span className="hover:text-blue-600 cursor-pointer">Главная</span>
            </Link>
            <ArrowRight className="w-4 h-4" />
            <Link href="/marketplace">
              <span className="hover:text-blue-600 cursor-pointer">Маркетплейс</span>
            </Link>
            <ArrowRight className="w-4 h-4" />
            <span className="font-medium text-gray-900 dark:text-white">Заказ</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Ad Header */}
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {ad.isUrgent && (
                        <Badge variant="destructive" className="flex items-center">
                          <Zap className="w-3 h-3 mr-1" />
                          СРОЧНО
                        </Badge>
                      )}
                      {ad.category && (
                        <Badge variant="outline">{ad.category.title}</Badge>
                      )}
                      <Badge variant={ad.status === 'active' ? 'default' : 'secondary'}>
                        {ad.status === 'active' ? 'Активен' : 'Закрыт'}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(ad.createdAt)}
                    </div>
                  </div>

                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    {ad.title}
                  </h1>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {ad.city && (
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4 mr-2" />
                        {ad.city}
                      </div>
                    )}
                    
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <DollarSign className="w-4 h-4 mr-2" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatBudget(ad.budget, ad.budgetCurrency)}
                      </span>
                    </div>
                    
                    {ad.deadline && formatDeadline(ad.deadline) && (
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4 mr-2" />
                        <span className={formatDeadline(ad.deadline) === "Просрочен" ? "text-red-600" : ""}>
                          {formatDeadline(ad.deadline)}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Eye className="w-4 h-4 mr-2" />
                      {ad.views} просмотров
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {ad.user?.companyName && (
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <Building className="w-4 h-4 mr-2" />
                          {ad.user.companyName}
                        </div>
                      )}
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        {ad.bidCount} откликов
                      </div>
                    </div>

                    {canBid && (
                      <Dialog open={isBidDialogOpen} onOpenChange={setIsBidDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Откликнуться
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Отправить отклик</DialogTitle>
                          </DialogHeader>
                          <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                              <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Ваша цена (KZT)</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        placeholder="Укажите стоимость"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="proposedDeadline"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Предлагаемый срок</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="date"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      Когда вы сможете выполнить заказ
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="message"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Сообщение заказчику</FormLabel>
                                    <FormControl>
                                      <Textarea
                                        placeholder="Расскажите о своем опыте и преимуществах..."
                                        rows={4}
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <Button 
                                type="submit" 
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                disabled={bidMutation.isPending}
                              >
                                {bidMutation.isPending ? (
                                  "Отправка..."
                                ) : (
                                  <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Отправить отклик
                                  </>
                                )}
                              </Button>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>
                    )}

                    {!isAuthenticated && ad.status === 'open' && (
                      <Button 
                        onClick={() => window.location.href = "/api/login"}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Войти для отклика
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Описание заказа</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap">{ad.description}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Requirements */}
              {ad.requirements && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Требования</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose dark:prose-invert max-w-none">
                      <p className="whitespace-pre-wrap">{ad.requirements}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Bid Management */}
              <BidManagement 
                ad={ad} 
                bids={ad.bids || []} 
                isOwner={isOwner} 
              />
            </div>

            {/* Sidebar */}
            <div>
              {/* Contact Info */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 w-5 h-5" />
                    Заказчик
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {ad.user?.companyName && (
                    <div className="mb-3">
                      <div className="flex items-center text-gray-600 dark:text-gray-400 mb-1">
                        <Building className="w-4 h-4 mr-2" />
                        Компания
                      </div>
                      <div className="font-medium">{ad.user.companyName}</div>
                    </div>
                  )}
                  
                  {(ad.user?.firstName || ad.user?.lastName) && (
                    <div>
                      <div className="flex items-center text-gray-600 dark:text-gray-400 mb-1">
                        <User className="w-4 h-4 mr-2" />
                        Контактное лицо
                      </div>
                      <div className="font-medium">
                        {ad.user.firstName} {ad.user.lastName}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Статистика</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>Просмотры:</span>
                      <span className="font-medium">{ad.views}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Отклики:</span>
                      <span className="font-medium">{ad.bidCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Статус:</span>
                      <Badge variant={ad.status === 'active' ? 'default' : 'secondary'}>
                        {ad.status === 'active' ? 'Активен' : 'Закрыт'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Размещен:</span>
                      <span className="font-medium">{formatDate(ad.createdAt)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
