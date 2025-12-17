import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

export function LoadingSpinner({ 
  size = "md", 
  className,
  text 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <Loader2 className={cn("animate-spin", sizeClasses[size])} />
      {text && <span className="text-muted-foreground">{text}</span>}
    </div>
  );
}

// Полноэкранный спиннер для загрузки страниц
export function PageLoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <div className="text-center">
          <p className="text-lg font-medium">Загрузка...</p>
          <p className="text-sm text-muted-foreground">Подождите немного</p>
        </div>
      </div>
    </div>
  );
}

// Компактный спиннер для кнопок
export function ButtonSpinner() {
  return <Loader2 className="h-4 w-4 animate-spin" />;
}

// Спиннер для таблиц
export function TableLoadingSpinner() {
  return (
    <div className="py-12 text-center">
      <LoadingSpinner size="lg" text="Загрузка данных..." />
    </div>
  );
}

// Спиннер для карточек
export function CardLoadingSpinner() {
  return (
    <div className="py-8 text-center">
      <LoadingSpinner text="Загружаем контент..." />
    </div>
  );
}