import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ArticleCard from "./ArticleCard";
import { 
  Flame, 
  Tags, 
  Calculator, 
  Mail, 
  TrendingUp,
  Building,
  Users,
  AlertTriangle,
  Phone,
  FileText,
  Gamepad2,
  Shield
} from "lucide-react";
import { useState } from "react";
import FireSafetyNews from "./FireSafetyNews";

interface Post {
  id: string;
  title: string;
  slug: string;
  featuredImageUrl?: string;
  publishedAt: string;
  views: number;
  tags?: string[];
}

export default function Sidebar() {
  const [email, setEmail] = useState("");

  const { data: popularPosts = [] } = useQuery<Post[]>({
    queryKey: ["/api/posts/popular"],
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      alert("Спасибо за подписку!");
      setEmail("");
    }
  };

  const popularTags = [
    "пожаротушение",
    "сигнализация", 
    "эвакуация",
    "нормативы",
    "обучение",
    "инспекция",
    "оборудование",
    "безопасность",
    "автоматика",
    "проектирование"
  ];

  return (
    <div className="space-y-6">
      {/* Fire Safety News */}
      <FireSafetyNews />

      {/* Экстренные контакты */}
      <Card className="border-l-4 border-l-red-600">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-red-600">
            <Phone className="h-5 w-5" />
            Экстренные службы
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Служба спасения</span>
            <Badge variant="destructive" className="font-mono">112</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Пожарная служба</span>
            <Badge variant="destructive" className="font-mono">101</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Газовая служба</span>
            <Badge variant="outline" className="font-mono">104</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Быстрые действия */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Быстрые действия
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Link href="/calculators/fire-extinguishers">
            <Button variant="outline" size="sm" className="w-full justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Расчет огнетушителей
            </Button>
          </Link>
          <Link href="/calculators/ngps">
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Shield className="h-4 w-4 mr-2" />
              Проверка НГПС
            </Button>
          </Link>
          <Link href="/games">
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Gamepad2 className="h-4 w-4 mr-2" />
              Обучающие игры
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Важные предупреждения */}
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-orange-600">
            <AlertTriangle className="h-5 w-5" />
            Важно знать
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2">
            <p className="font-medium">🔥 При пожаре:</p>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>• Немедленно покиньте помещение</li>
              <li>• Вызовите службу спасения 112</li>
              <li>• Не пользуйтесь лифтом</li>
              <li>• Закройте двери за собой</li>
            </ul>
          </div>
          <div className="text-sm space-y-2">
            <p className="font-medium">⚠️ Профилактика:</p>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>• Проверяйте датчики дыма</li>
              <li>• Обслуживайте огнетушители</li>
              <li>• Планируйте пути эвакуации</li>
            </ul>
          </div>
        </CardContent>
      </Card>


      {/* Popular Posts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Flame className="text-red-500 mr-2 w-5 h-5" />
            Популярные статьи
          </CardTitle>
        </CardHeader>
        <CardContent>
          {popularPosts.length > 0 ? (
            <div className="space-y-4">
              {popularPosts.slice(0, 5).map((post) => (
                <ArticleCard key={post.id} post={post} variant="compact" />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Популярные статьи пока не добавлены
            </p>
          )}
        </CardContent>
      </Card>

      {/* Tags Cloud */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Tags className="text-kz-blue mr-2 w-5 h-5" />
            Популярные теги
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {popularTags.map((tag) => (
              <Badge 
                key={tag}
                variant="secondary"
                className="cursor-pointer hover:bg-kz-blue hover:text-white transition-colors"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Newsletter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Mail className="text-kz-blue mr-2 w-5 h-5" />
            Подписка на новости
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Получайте последние новости и обновления по пожарной безопасности
          </p>
          <form onSubmit={handleSubscribe} className="space-y-3">
            <Input
              type="email"
              placeholder="Ваш email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button 
              type="submit"
              className="w-full bg-kz-blue text-white hover:bg-kz-blue-light"
            >
              Подписаться
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <TrendingUp className="text-green-500 mr-2 w-5 h-5" />
            Быстрые ссылки
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Link href="/marketplace">
              <Button variant="ghost" className="w-full justify-start text-left">
                <Building className="mr-2 w-4 h-4" />
                Маркетплейс услуг
              </Button>
            </Link>
            <Link href="/sections/documents">
              <Button variant="ghost" className="w-full justify-start text-left">
                📋 Нормативная база
              </Button>
            </Link>
            <Link href="/sections/literature">
              <Button variant="ghost" className="w-full justify-start text-left">
                📚 Обучающие материалы
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost" className="w-full justify-start text-left">
                <Users className="mr-2 w-4 h-4" />
                Личный кабинет
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}