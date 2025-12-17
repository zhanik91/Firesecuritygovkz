import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  DollarSign, 
  Eye, 
  MessageSquare, 
  Calendar,
  MapPin,
  Briefcase,
  Settings,
  User as UserIcon,
  Building,
  Mail,
  Phone,
  Check,
  X,
  Clock,
  TrendingUp,
  Award,
  Send
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  companyName?: string;
  phone?: string;
  city?: string;
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
  ad?: {
    title: string;
    slug: string;
    city?: string;
    user?: {
      companyName?: string;
      firstName?: string;
      lastName?: string;
    };
  };
}

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
}

const profileSchema = z.object({
  firstName: z.string().min(1, "Укажите имя"),
  lastName: z.string().min(1, "Укажите фамилию"),
  companyName: z.string().min(1, "Укажите название компании"),
  phone: z.string().optional(),
  city: z.string().optional(),
});

const bidSchema = z.object({
  amount: z.string().min(1, "Укажите сумму"),
  proposedDeadline: z.string().optional(),
  message: z.string().min(10, "Сообщение должно содержать минимум 10 символов"),
});

export default function SupplierDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [isBidDialogOpen, setIsBidDialogOpen] = useState(false);

  // Type assertion for user
  const typedUser = user as User | undefined;

  const { data: userBids = [], isLoading: bidsLoading } = useQuery<Bid[]>({
    queryKey: ["/api/dashboard/bids"],
    retry: false,
  });

  const { data: availableAds = [], isLoading: adsLoading } = useQuery<Ad[]>({
    queryKey: ["/api/marketplace/ads"],
    select: (data) => data.filter(ad => ad.status === 'open'),
  });

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: typedUser?.firstName || "",
      lastName: typedUser?.lastName || "",
      companyName: typedUser?.companyName || "",
      phone: typedUser?.phone || "",
      city: typedUser?.city || "",
    },
  });

  const bidForm = useForm<z.infer<typeof bidSchema>>({
    resolver: zodResolver(bidSchema),
    defaultValues: {
      amount: "",
      proposedDeadline: "",
      message: "",
    },
  });

  // Update profile form when user data loads
  useEffect(() => {
    if (typedUser) {
      profileForm.reset({
        firstName: typedUser.firstName || "",
        lastName: typedUser.lastName || "",
        companyName: typedUser.companyName || "",
        phone: typedUser.phone || "",
        city: typedUser.city || "",
      });
    }
  }, [typedUser, profileForm]);

  // Redirect if not authenticated or wrong role
  useEffect(() => {
    if (!authLoading && (!typedUser || typedUser.role !== 'supplier')) {
      toast({
        title: "Доступ запрещен",
        description: "У вас нет прав для доступа к этой странице",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [user, authLoading, toast]);

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: z.infer<typeof profileSchema>) => {
      return await apiRequest("PUT", "/api/auth/user", profileData);
    },
    onSuccess: () => {
      toast({
        title: "Профиль обновлен",
        description: "Ваши данные успешно сохранены",
      });
      setIsProfileDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Необходима авторизация",
          description: "Войдите в систему для изменения профиля",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Ошибка",
        description: "Не удалось обновить профиль. Попробуйте еще раз.",
        variant: "destructive",
      });
    },
  });

  const createBidMutation = useMutation({
    mutationFn: async (bidData: z.infer<typeof bidSchema>) => {
      if (!selectedAd?.id) throw new Error("Ad not found");
      return await apiRequest("POST", `/api/marketplace/ads/${selectedAd.id}/bids`, bidData);
    },
    onSuccess: () => {
      toast({
        title: "Отклик отправлен",
        description: "Ваш отклик успешно отправлен заказчику",
      });
      setIsBidDialogOpen(false);
      setSelectedAd(null);
      bidForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/bids"] });
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

  const onSubmitProfile = (data: z.infer<typeof profileSchema>) => {
    updateProfileMutation.mutate(data);
  };

  const onSubmitBid = (data: z.infer<typeof bidSchema>) => {
    createBidMutation.mutate(data);
  };

  const handleBidOnAd = (ad: Ad) => {
    setSelectedAd(ad);
    setIsBidDialogOpen(true);
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

  const cities = [
    "Алматы", "Нур-Султан", "Шымкент", "Караганда", "Актобе", 
    "Тараз", "Павлодар", "Усть-Каменогорск", "Семей", "Атырау"
  ];

  const getBidStatusBadge = (status: string, isSelected: boolean) => {
    if (isSelected) return <Badge variant="default">Выбран</Badge>;
    
    switch (status) {
      case 'pending': return <Badge variant="outline">Ожидает</Badge>;
      case 'accepted': return <Badge variant="default">Принят</Badge>;
      case 'rejected': return <Badge variant="destructive">Отклонен</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const stats = {
    totalBids: userBids.length,
    pendingBids: userBids.filter(bid => bid.status === 'pending').length,
    acceptedBids: userBids.filter(bid => bid.isSelected).length,
    avgBidAmount: userBids.length > 0 
      ? userBids.reduce((sum, bid) => sum + parseFloat(bid.amount), 0) / userBids.length 
      : 0
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-8"></div>
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 dark:bg-gray-600 rounded-xl"></div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!typedUser || typedUser.role !== 'supplier') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Кабинет поставщика
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Добро пожаловать, {typedUser.companyName || typedUser.firstName || typedUser.email}!
            </p>
          </div>
          
          <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Настройки профиля
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Редактировать профиль</DialogTitle>
              </DialogHeader>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={profileForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Имя</FormLabel>
                          <FormControl>
                            <Input placeholder="Ваше имя" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Фамилия</FormLabel>
                          <FormControl>
                            <Input placeholder="Ваша фамилия" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={profileForm.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Компания</FormLabel>
                        <FormControl>
                          <Input placeholder="Название компании" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Телефон</FormLabel>
                        <FormControl>
                          <Input placeholder="+7 (777) 123-45-67" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Город</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите город" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {cities.map((city) => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? "Сохранение..." : "Сохранить"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Всего откликов</h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalBids}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Ожидают</h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingBids}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Выбранных</h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.acceptedBids}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Средняя цена</h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.avgBidAmount > 0 ? `${Math.round(stats.avgBidAmount).toLocaleString()} ₸` : '0 ₸'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar with user info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserIcon className="mr-2 w-5 h-5" />
                  Профиль
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  {typedUser.companyName && (
                    <div className="flex items-center">
                      <Building className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{typedUser.companyName}</span>
                    </div>
                  )}
                  
                  {typedUser.email && (
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{typedUser.email}</span>
                    </div>
                  )}
                  
                  {typedUser.phone && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{typedUser.phone}</span>
                    </div>
                  )}
                  
                  {typedUser.city && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{typedUser.city}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="bids" className="w-full">
              <TabsList>
                <TabsTrigger value="bids">Мои отклики</TabsTrigger>
                <TabsTrigger value="opportunities">Новые заказы</TabsTrigger>
              </TabsList>

              <TabsContent value="bids" className="mt-6">
                {bidsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-32 bg-gray-300 dark:bg-gray-600 rounded-xl animate-pulse"></div>
                    ))}
                  </div>
                ) : userBids.length > 0 ? (
                  <div className="space-y-4">
                    {userBids.map((bid) => (
                      <Card key={bid.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {getBidStatusBadge(bid.status, bid.isSelected)}
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {formatDate(bid.createdAt)}
                                </span>
                              </div>
                              
                              {bid.ad && (
                                <Link href={`/marketplace/${bid.ad.slug}`}>
                                  <h3 className="text-lg font-semibold hover:text-blue-600 transition-colors cursor-pointer line-clamp-2 mb-2">
                                    {bid.ad.title}
                                  </h3>
                                </Link>
                              )}
                              
                              {bid.message && (
                                <p className="text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                                  {bid.message}
                                </p>
                              )}
                              
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                {bid.ad?.city && (
                                  <span className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    {bid.ad.city}
                                  </span>
                                )}
                                
                                {bid.proposedDeadline && (
                                  <span className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    До {new Date(bid.proposedDeadline).toLocaleDateString()}
                                  </span>
                                )}
                                
                                {bid.ad?.user?.companyName && (
                                  <span className="flex items-center">
                                    <Building className="w-4 h-4 mr-1" />
                                    {bid.ad.user.companyName}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-right ml-4">
                              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                {formatBudget(bid.amount, bid.currency)}
                              </div>
                              {bid.ad && (
                                <Link href={`/marketplace/${bid.ad.slug}`}>
                                  <Button size="sm" variant="outline">
                                    Перейти к заказу
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      У вас пока нет откликов
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Просмотрите доступные заказы и отправьте свои предложения
                    </p>
                    <Link href="/marketplace">
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        Найти заказы
                      </Button>
                    </Link>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="opportunities" className="mt-6">
                {adsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-32 bg-gray-300 dark:bg-gray-600 rounded-xl animate-pulse"></div>
                    ))}
                  </div>
                ) : availableAds.length > 0 ? (
                  <div className="space-y-4">
                    {availableAds.slice(0, 10).map((ad) => (
                      <Card key={ad.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {ad.category && (
                                  <Badge variant="outline">{ad.category.title}</Badge>
                                )}
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {formatDate(ad.createdAt)}
                                </span>
                              </div>
                              
                              <Link href={`/marketplace/${ad.slug}`}>
                                <h3 className="text-lg font-semibold hover:text-blue-600 transition-colors cursor-pointer line-clamp-2 mb-2">
                                  {ad.title}
                                </h3>
                              </Link>
                              
                              <p className="text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                                {ad.description}
                              </p>
                              
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                {ad.city && (
                                  <span className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    {ad.city}
                                  </span>
                                )}
                                
                                <span className="flex items-center">
                                  <DollarSign className="w-4 h-4 mr-1" />
                                  {formatBudget(ad.budget, ad.budgetCurrency)}
                                </span>
                                
                                <span className="flex items-center">
                                  <MessageSquare className="w-4 h-4 mr-1" />
                                  {ad.bidCount} откликов
                                </span>
                                
                                {ad.user?.companyName && (
                                  <span className="flex items-center">
                                    <Building className="w-4 h-4 mr-1" />
                                    {ad.user.companyName}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-right ml-4">
                              <Button 
                                onClick={() => handleBidOnAd(ad)}
                                className="bg-blue-600 hover:bg-blue-700 text-white mb-2"
                              >
                                Откликнуться
                              </Button>
                              <Link href={`/marketplace/${ad.slug}`}>
                                <Button size="sm" variant="outline" className="w-full">
                                  Подробнее
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    <div className="text-center mt-8">
                      <Link href="/marketplace">
                        <Button variant="outline" size="lg">
                          Показать все заказы
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Нет доступных заказов
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      В данный момент нет новых заказов для отклика
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Bid Dialog */}
        <Dialog open={isBidDialogOpen} onOpenChange={setIsBidDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Отправить отклик</DialogTitle>
            </DialogHeader>
            {selectedAd && (
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium text-sm mb-1">{selectedAd.title}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                  {selectedAd.description}
                </p>
              </div>
            )}
            <Form {...bidForm}>
              <form onSubmit={bidForm.handleSubmit(onSubmitBid)} className="space-y-4">
                <FormField
                  control={bidForm.control}
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
                  control={bidForm.control}
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
                  control={bidForm.control}
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
                  disabled={createBidMutation.isPending}
                >
                  {createBidMutation.isPending ? (
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
      </main>

      <Footer />
    </div>
  );
}
