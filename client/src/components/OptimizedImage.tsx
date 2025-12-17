import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  loading?: "lazy" | "eager";
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 75,
  placeholder = "empty",
  blurDataURL,
  onLoad,
  onError,
  loading = "lazy",
  ...props
}: OptimizedImageProps & React.ImgHTMLAttributes<HTMLImageElement>) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const [currentSrc, setCurrentSrc] = useState<string>("");

  // Intersection Observer для lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "50px", // Начинаем загрузку за 50px до появления в viewport
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  // Генерация оптимизированного URL
  useEffect(() => {
    if (!isInView && !priority) return;

    let optimizedSrc = src;
    
    // Если это локальное изображение, добавляем параметры оптимизации
    if (src.startsWith('/') || src.startsWith('./')) {
      const params = new URLSearchParams();
      
      if (width) params.append('w', width.toString());
      if (height) params.append('h', height.toString());
      if (quality !== 75) params.append('q', quality.toString());
      
      // Добавляем формат WebP если поддерживается
      const supportsWebP = () => {
        const canvas = document.createElement('canvas');
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      };
      
      if (supportsWebP()) {
        params.append('format', 'webp');
      }
      
      if (params.toString()) {
        optimizedSrc = `${src}?${params.toString()}`;
      }
    }
    
    setCurrentSrc(optimizedSrc);
  }, [src, width, height, quality, isInView, priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(false);
    onError?.();
  };

  // Placeholder во время загрузки
  const showPlaceholder = !isLoaded && !hasError && placeholder !== "empty";
  const placeholderSrc = placeholder === "blur" && blurDataURL ? blurDataURL : 
    `data:image/svg+xml;base64,${btoa(`
      <svg width="${width || 400}" height="${height || 300}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="Arial, sans-serif" font-size="14">
          Загрузка...
        </text>
      </svg>
    `)}`;

  return (
    <div 
      className={cn("relative overflow-hidden", className)}
      style={{ width, height }}
    >
      {/* Placeholder */}
      {showPlaceholder && (
        <img
          src={placeholderSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover filter blur-sm"
          aria-hidden="true"
        />
      )}
      
      {/* Основное изображение */}
      <img
        ref={imgRef}
        src={isInView || priority ? currentSrc : undefined}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : loading}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          hasError && "opacity-50"
        )}
        {...props}
      />
      
      {/* Ошибка загрузки */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm">
          <div className="text-center">
            <div className="mb-2">⚠️</div>
            <div>Не удалось загрузить изображение</div>
          </div>
        </div>
      )}
    </div>
  );
}

// Компонент для изображений с поддержкой различных размеров экрана
interface ResponsiveImageProps extends OptimizedImageProps {
  sizes?: string;
  srcSet?: string;
}

export function ResponsiveImage({
  src,
  alt,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  srcSet,
  ...props
}: ResponsiveImageProps) {
  // Генерируем srcSet если не предоставлен
  const generatedSrcSet = srcSet || (() => {
    const widths = [320, 640, 768, 1024, 1280, 1920];
    return widths
      .map(width => {
        const params = new URLSearchParams();
        params.append('w', width.toString());
        if (props.quality) params.append('q', props.quality.toString());
        return `${src}?${params.toString()} ${width}w`;
      })
      .join(', ');
  })();

  return (
    <OptimizedImage
      {...props}
      src={src}
      alt={alt}
      srcSet={generatedSrcSet}
      sizes={sizes}
    />
  );
}