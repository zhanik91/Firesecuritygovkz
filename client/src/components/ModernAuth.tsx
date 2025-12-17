import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Mail, 
  Phone, 
  Eye, 
  EyeOff, 
  Chrome,
  MessageCircle,
  ArrowRight
} from "lucide-react";

export function ModernAuth() {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [phoneStep, setPhoneStep] = useState<'phone' | 'code'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // Email/Password форма
  const [emailForm, setEmailForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    isRegister: false
  });

  // Телефон форма
  const [phoneForm, setPhoneForm] = useState({
    phone: '',
    code: '',
    firstName: '',
    lastName: ''
  });

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = emailForm.isRegister ? '/api/auth/register' : '/api/auth/login';
      const response = await apiRequest('POST', endpoint, emailForm);
      
      toast({
        title: "Успешно!",
        description: emailForm.isRegister ? "Регистрация завершена" : "Вход выполнен",
      });
      
      // Перенаправляем на главную
      window.location.href = '/';
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Что-то пошло не так",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (phoneStep === 'phone') {
        // Отправляем код
        await apiRequest('POST', '/api/auth/phone/send-code', {
          phone: phoneForm.phone,
          firstName: phoneForm.firstName,
          lastName: phoneForm.lastName
        });
        
        setPhoneNumber(phoneForm.phone);
        setPhoneStep('code');
        
        toast({
          title: "Код отправлен",
          description: `СМС с кодом отправлено на номер ${phoneForm.phone}`,
        });
      } else {
        // Проверяем код
        const response = await apiRequest('POST', '/api/auth/phone/verify-code', {
          phone: phoneNumber,
          code: phoneForm.code
        });
        
        toast({
          title: "Успешно!",
          description: "Вход выполнен",
        });
        
        window.location.href = '/';
      }
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Что-то пошло не так",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    // Показываем информацию о необходимости настройки
    toast({
      title: "Google OAuth",
      description: "Для работы Google авторизации необходимо настроить GOOGLE_CLIENT_ID и GOOGLE_CLIENT_SECRET в настройках проекта. После деплоя это будет работать автоматически.",
    });
    
    // После настройки секретов, это будет работать:
    // window.location.href = '/api/auth/google';
  };

  const handleTelegramAuth = () => {
    // Показываем информацию о Telegram авторизации
    toast({
      title: "Telegram авторизация",
      description: "Telegram авторизация будет доступна после настройки Telegram Bot API. Для этого потребуется создать бота и получить токен.",
    });
    
    // После настройки Telegram Bot API:
    // window.open(`https://t.me/your_bot_name?start=auth_${crypto.randomUUID()}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-kz-blue via-blue-600 to-kz-yellow flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-kz-blue">Вход в систему</CardTitle>
          <CardDescription>
            Выберите удобный способ авторизации
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="social" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="social">Быстрый</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="phone">Телефон</TabsTrigger>
            </TabsList>

            {/* Социальные сети */}
            <TabsContent value="social" className="space-y-4">
              <Button 
                onClick={handleGoogleAuth}
                variant="outline" 
                className="w-full flex items-center gap-3 h-12"
              >
                <Chrome className="w-5 h-5 text-blue-500" />
                Войти через Google
              </Button>
              
              <Button 
                onClick={handleTelegramAuth}
                variant="outline" 
                className="w-full flex items-center gap-3 h-12"
              >
                <MessageCircle className="w-5 h-5 text-blue-400" />
                Войти через Telegram
              </Button>
              
              <div className="text-center text-sm text-muted-foreground">
                <p>Быстрый и безопасный вход</p>
                <p className="text-xs mt-1">
                  * Требуется настройка API ключей для продакшена
                </p>
              </div>
            </TabsContent>

            {/* Email/Пароль */}
            <TabsContent value="email">
              <form onSubmit={handleEmailAuth} className="space-y-4">
                {emailForm.isRegister && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Имя</Label>
                      <Input
                        id="firstName"
                        value={emailForm.firstName}
                        onChange={(e) => setEmailForm({...emailForm, firstName: e.target.value})}
                        required={emailForm.isRegister}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Фамилия</Label>
                      <Input
                        id="lastName"
                        value={emailForm.lastName}
                        onChange={(e) => setEmailForm({...emailForm, lastName: e.target.value})}
                        required={emailForm.isRegister}
                      />
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={emailForm.email}
                      onChange={(e) => setEmailForm({...emailForm, email: e.target.value})}
                      className="pl-10"
                      placeholder="user@example.com"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Пароль</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={emailForm.password}
                      onChange={(e) => setEmailForm({...emailForm, password: e.target.value})}
                      className="pr-10"
                      placeholder="••••••••"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Загрузка..." : emailForm.isRegister ? "Зарегистрироваться" : "Войти"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                
                <Button
                  type="button"
                  variant="link"
                  className="w-full"
                  onClick={() => setEmailForm({...emailForm, isRegister: !emailForm.isRegister})}
                >
                  {emailForm.isRegister ? "Уже есть аккаунт? Войти" : "Нет аккаунта? Зарегистрироваться"}
                </Button>
              </form>
            </TabsContent>

            {/* Телефон */}
            <TabsContent value="phone">
              <form onSubmit={handlePhoneAuth} className="space-y-4">
                {phoneStep === 'phone' ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phoneFirstName">Имя</Label>
                        <Input
                          id="phoneFirstName"
                          value={phoneForm.firstName}
                          onChange={(e) => setPhoneForm({...phoneForm, firstName: e.target.value})}
                          placeholder="Ваше имя"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phoneLastName">Фамилия</Label>
                        <Input
                          id="phoneLastName"
                          value={phoneForm.lastName}
                          onChange={(e) => setPhoneForm({...phoneForm, lastName: e.target.value})}
                          placeholder="Фамилия"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Номер телефона</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          value={phoneForm.phone}
                          onChange={(e) => setPhoneForm({...phoneForm, phone: e.target.value})}
                          className="pl-10"
                          placeholder="+7 (777) 123-45-67"
                          required
                        />
                      </div>
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Отправка..." : "Отправить код"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        Код отправлен на номер<br />
                        <strong>{phoneNumber}</strong>
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="code">6-значный код</Label>
                      <Input
                        id="code"
                        type="text"
                        value={phoneForm.code}
                        onChange={(e) => setPhoneForm({...phoneForm, code: e.target.value})}
                        placeholder="123456"
                        maxLength={6}
                        className="text-center text-lg tracking-widest"
                        required
                      />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Проверка..." : "Подтвердить"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    
                    <Button
                      type="button"
                      variant="link"
                      className="w-full"
                      onClick={() => setPhoneStep('phone')}
                    >
                      Изменить номер телефона
                    </Button>
                  </>
                )}
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 text-center text-xs text-muted-foreground">
            <p>Входя в систему, вы соглашаетесь с</p>
            <p>правилами использования сервиса</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}