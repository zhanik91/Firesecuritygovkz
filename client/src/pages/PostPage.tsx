import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import DOMPurify from 'dompurify';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import SEOHead from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  ArrowRight, 
  Eye, 
  Clock, 
  User, 
  Calendar,
  FileText,
  Share2,
  Bookmark
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

interface Post {
  id: string;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  featuredImageUrl?: string;
  publishedAt: string;
  views: number;
  tags?: string[];
  author?: {
    firstName?: string;
    lastName?: string;
  };
  subsection?: {
    title: string;
    slug: string;
    section?: {
      title: string;
      slug: string;
    };
  };
}

export default function PostPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading, error } = useQuery<Post>({
    queryKey: ["/api/posts", slug],
  });

  // Increment view count when post loads
  useEffect(() => {
    if (post?.id) {
      // This would be handled by the backend when fetching the post
      // The backend already increments views in the route handler
    }
  }, [post?.id]);

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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        text: post?.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Ссылка скопирована в буфер обмена");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-6"></div>
                <div className="h-64 bg-gray-300 dark:bg-gray-600 rounded-xl mb-8"></div>
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="h-96 bg-gray-300 dark:bg-gray-600 rounded-xl animate-pulse"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Статья не найдена
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Запрашиваемая статья не существует или была удалена
            </p>
            <Link href="/">
              <Button>Вернуться на главную</Button>
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
        title={`${post.title} | NewsFire`}
        description={post.excerpt || `${post.title} - Портал пожарной безопасности Казахстана`}
        keywords={`пожарная безопасность, ${post.tags?.join(', ') || ''}, Казахстан`}
        canonical={`https://newsfire.kz/posts/${post.slug}`}
        ogImage={post.featuredImageUrl}
      />
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Article Content */}
          <div className="lg:col-span-2">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
              <Link href="/">
                <span className="hover:text-kz-blue cursor-pointer">Главная</span>
              </Link>
              <ArrowRight className="w-4 h-4" />
              {post.subsection?.section && (
                <>
                  <Link href={`/sections/${post.subsection.section.slug}`}>
                    <span className="hover:text-kz-blue cursor-pointer">{post.subsection.section.title}</span>
                  </Link>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
              {post.subsection && (
                <>
                  <Link href={`/subsections/${post.subsection.slug}`}>
                    <span className="hover:text-kz-blue cursor-pointer">{post.subsection.title}</span>
                  </Link>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
              <span className="font-medium text-gray-900 dark:text-white">Статья</span>
            </nav>

            {/* Article Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant={getTagVariant(tag)}>
                      {tag.toUpperCase()}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Title */}
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                {post.title}
              </h1>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400 mb-6">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {formatDate(post.publishedAt)}
                </div>
                
                {post.author && (
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    {post.author.firstName} {post.author.lastName}
                  </div>
                )}
                
                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-2" />
                  {post.views.toLocaleString()} просмотров
                </div>
                
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  5 мин чтения
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-4">
                <Button onClick={handleShare} variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Поделиться
                </Button>
                <Button variant="outline" size="sm">
                  <Bookmark className="w-4 h-4 mr-2" />
                  Сохранить
                </Button>
              </div>
            </div>

            {/* Featured Image */}
            {post.featuredImageUrl && (
              <div className="mb-8">
                <img 
                  src={post.featuredImageUrl} 
                  alt={post.title}
                  className="w-full h-96 object-cover rounded-xl"
                />
              </div>
            )}

            {/* Article Content */}
            <article className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
              {post.excerpt && (
                <div className="text-xl text-gray-600 dark:text-gray-300 font-medium mb-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-kz-blue">
                  {post.excerpt}
                </div>
              )}

              {post.content ? (
                <div 
                  className="prose prose-lg dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: DOMPurify.sanitize(post.content.replace(/\n/g, '<br />')) 
                  }}
                />
              ) : (
                <div className="text-gray-600 dark:text-gray-400">
                  <p>Содержимое статьи будет добавлено позже.</p>
                </div>
              )}
            </article>

            {/* Related Articles */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Читайте также
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Placeholder for related articles */}
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-4" />
                  <p>Похожие статьи пока не найдены</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Sidebar />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
