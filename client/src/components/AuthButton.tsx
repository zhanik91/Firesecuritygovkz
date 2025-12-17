import { Button } from "@/components/ui/button";
import { UserCircle, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function AuthButton() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      toast({
        title: "Выход выполнен",
        description: "Вы успешно вышли из системы",
      });
      window.location.href = "/";
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось выйти из системы",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="w-8 h-8 animate-pulse bg-gray-200 rounded-full" />;
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          Привет, {user.firstName || user.email || user.phone}
        </span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleLogout}
          className="flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Выйти
        </Button>
      </div>
    );
  }

  return (
    <Button 
      onClick={() => window.location.href = "/auth"}
      className="flex items-center gap-2"
    >
      <UserCircle className="w-4 h-4" />
      Войти
    </Button>
  );
}