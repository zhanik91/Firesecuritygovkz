import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Eye, MessageSquare, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featuredImageUrl?: string;
  publishedAt: string;
  views: number;
  tags?: string[];
  author?: {
    firstName?: string;
    lastName?: string;
  };
}

interface ArticleCardProps {
  post: Post;
  variant?: "default" | "compact";
}

export default function ArticleCard({ post, variant = "default" }: ArticleCardProps) {
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

  const getTagVariant = (tag: string) => {
    const tagLower = tag.toLowerCase();
    if (tagLower.includes("важно") || tagLower.includes("срочно")) return "destructive";
    if (tagLower.includes("технологии") || tagLower.includes("новинки")) return "default";
    if (tagLower.includes("обучение") || tagLower.includes("курсы")) return "secondary";
    return "outline";
  };

  if (variant === "compact") {
    return (
      <Link href={`/posts/${post.slug}`}>
        <div className="group cursor-pointer">
          <div className="flex space-x-3">
            {post.featuredImageUrl && (
              <img 
                src={post.featuredImageUrl} 
                alt={post.title}
                className="w-16 h-12 object-cover rounded-lg flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium group-hover:text-kz-blue transition-colors line-clamp-2">
                {post.title}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formatDate(post.publishedAt)}
              </p>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <article className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow card-hover">
      <div className="md:flex">
        {post.featuredImageUrl && (
          <div className="md:w-1/3">
            <Link href={`/posts/${post.slug}`}>
              <img 
                src={post.featuredImageUrl} 
                alt={post.title}
                className="w-full h-48 md:h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
              />
            </Link>
          </div>
        )}
        
        <div className={`p-6 ${post.featuredImageUrl ? 'md:w-2/3' : 'w-full'}`}>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2 flex-wrap gap-2">
            {post.tags && post.tags.length > 0 && (
              <Badge variant={getTagVariant(post.tags[0])} className="text-xs">
                {post.tags[0].toUpperCase()}
              </Badge>
            )}
            <span className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {formatDate(post.publishedAt)}
            </span>
            <span>•</span>
            <span>5 мин чтения</span>
          </div>
          
          <Link href={`/posts/${post.slug}`}>
            <h3 className="text-xl font-semibold mb-3 hover:text-kz-blue transition-colors cursor-pointer line-clamp-2">
              {post.title}
            </h3>
          </Link>
          
          {post.excerpt && (
            <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
              {post.excerpt}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
              <span className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {post.views.toLocaleString()}
              </span>
              <span className="flex items-center">
                <MessageSquare className="w-4 h-4 mr-1" />
                0
              </span>
            </div>
            
            <Link href={`/posts/${post.slug}`}>
              <span className="text-kz-blue hover:text-kz-blue-light font-medium text-sm cursor-pointer">
                Читать далее
              </span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
