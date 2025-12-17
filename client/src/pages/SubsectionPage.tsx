import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { 
  ArrowRight, 
  FileText, 
  Image, 
  Video, 
  Presentation,
  Download,
  Eye,
  PlayCircle
} from "lucide-react";

interface Subsection {
  id: string;
  title: string;
  slug: string;
  description?: string;
  sectionId: string;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featuredImageUrl?: string;
  publishedAt: string;
  views: number;
  tags?: string[];
}

interface Document {
  id: string;
  title: string;
  slug: string;
  description?: string;
  fileName: string;
  fileType: string;
  downloads: number;
  createdAt: string;
}

interface PhotoAlbum {
  id: string;
  title: string;
  slug: string;
  description?: string;
  coverImageUrl?: string;
  views: number;
  createdAt: string;
}

interface Video {
  id: string;
  title: string;
  slug: string;
  description?: string;
  thumbnailUrl?: string;
  duration?: number;
  views: number;
  createdAt: string;
}

interface PresentationItem {
  id: string;
  title: string;
  slug: string;
  description?: string;
  thumbnailUrl?: string;
  slideCount?: number;
  views: number;
  downloads: number;
  createdAt: string;
}

export default function SubsectionPage() {
  const { slug } = useParams<{ slug: string }>();
  const [activeTab, setActiveTab] = useState("posts");

  const { data: subsection, isLoading: subsectionLoading, error: subsectionError } = useQuery<Subsection>({
    queryKey: ["/api/subsections", slug],
  });

  const { data: posts = [], isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
    select: (data) => data.filter((post) => post.subsectionId === subsection?.id),
    enabled: !!subsection?.id,
  });

  const { data: documents = [], isLoading: documentsLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
    select: (data) => data.filter((doc) => doc.subsectionId === subsection?.id),
    enabled: !!subsection?.id,
  });

  const { data: photoAlbums = [], isLoading: photosLoading } = useQuery<PhotoAlbum[]>({
    queryKey: ["/api/photo-albums"],
    select: (data) => data.filter((album) => album.subsectionId === subsection?.id),
    enabled: !!subsection?.id,
  });

  const { data: videos = [], isLoading: videosLoading } = useQuery<Video[]>({
    queryKey: ["/api/videos"],
    select: (data) => data.filter((video) => video.subsectionId === subsection?.id),
    enabled: !!subsection?.id,
  });

  const { data: presentations = [], isLoading: presentationsLoading } = useQuery<PresentationItem[]>({
    queryKey: ["/api/presentations"],
    select: (data) => data.filter((pres) => pres.subsectionId === subsection?.id),
    enabled: !!subsection?.id,
  });

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "";
    const minutes = Math.floor(seconds / 60);
    return `${minutes} мин`;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} МБ`;
  };

  if (subsectionLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3 mb-8"></div>
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

  if (subsectionError || !subsection) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Подраздел не найден
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Запрашиваемый подраздел не существует или был удален
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
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
          <Link href="/">
            <span className="hover:text-kz-blue cursor-pointer">Главная</span>
          </Link>
          <ArrowRight className="w-4 h-4" />
          <span className="hover:text-kz-blue cursor-pointer">Разделы</span>
          <ArrowRight className="w-4 h-4" />
          <span className="font-medium text-gray-900 dark:text-white">{subsection.title}</span>
        </nav>

        {/* Subsection Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {subsection.title}
          </h1>
          {subsection.description && (
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl">
              {subsection.description}
            </p>
          )}
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="posts" className="flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Статьи ({posts.length})
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Документы ({documents.length})
            </TabsTrigger>
            <TabsTrigger value="photos" className="flex items-center">
              <Image className="w-4 h-4 mr-2" />
              Фото ({photoAlbums.length})
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center">
              <Video className="w-4 h-4 mr-2" />
              Видео ({videos.length})
            </TabsTrigger>
            <TabsTrigger value="presentations" className="flex items-center">
              <Presentation className="w-4 h-4 mr-2" />
              Презентации ({presentations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6">
            {postsLoading ? (
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse h-32 bg-gray-300 dark:bg-gray-600 rounded-xl"></div>
                ))}
              </div>
            ) : posts.length > 0 ? (
              <div className="space-y-6">
                {posts.map((post) => (
                  <ArticleCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Статьи пока не добавлены
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  В этом подразделе пока нет статей
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            {documentsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse h-32 bg-gray-300 dark:bg-gray-600 rounded-xl"></div>
                ))}
              </div>
            ) : documents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {documents.map((document) => (
                  <div key={document.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 card-hover">
                    <div className="flex items-start justify-between mb-4">
                      <FileText className="w-8 h-8 text-blue-600" />
                      <Badge variant="outline">{document.fileType}</Badge>
                    </div>
                    <h3 className="font-semibold mb-2 line-clamp-2">{document.title}</h3>
                    {document.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {document.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center">
                        <Download className="w-4 h-4 mr-1" />
                        {document.downloads}
                      </span>
                      <Link href={`/documents/${document.slug}`}>
                        <Button size="sm" variant="outline">
                          Открыть
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Download className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Документы пока не добавлены
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  В этом подразделе пока нет документов
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="photos" className="mt-6">
            {photosLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse h-48 bg-gray-300 dark:bg-gray-600 rounded-xl"></div>
                ))}
              </div>
            ) : photoAlbums.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {photoAlbums.map((album) => (
                  <Link key={album.id} href={`/photo-albums/${album.slug}`}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 card-hover cursor-pointer">
                      {album.coverImageUrl ? (
                        <img 
                          src={album.coverImageUrl} 
                          alt={album.title}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <Image className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold mb-2 line-clamp-2">{album.title}</h3>
                        {album.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                            {album.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center">
                            <Eye className="w-4 h-4 mr-1" />
                            {album.views}
                          </span>
                          <Badge variant="outline">Альбом</Badge>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Фотоальбомы пока не добавлены
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  В этом подразделе пока нет фотоальбомов
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="videos" className="mt-6">
            {videosLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse h-48 bg-gray-300 dark:bg-gray-600 rounded-xl"></div>
                ))}
              </div>
            ) : videos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video) => (
                  <Link key={video.id} href={`/videos/${video.slug}`}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 card-hover cursor-pointer">
                      <div className="relative">
                        {video.thumbnailUrl ? (
                          <img 
                            src={video.thumbnailUrl} 
                            alt={video.title}
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <Video className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <PlayCircle className="w-12 h-12 text-white bg-black/30 rounded-full" />
                        </div>
                        {video.duration && (
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {formatDuration(video.duration)}
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold mb-2 line-clamp-2">{video.title}</h3>
                        {video.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                            {video.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center">
                            <Eye className="w-4 h-4 mr-1" />
                            {video.views}
                          </span>
                          <Badge variant="outline">Видео</Badge>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Видео пока не добавлены
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  В этом подразделе пока нет видеоматериалов
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="presentations" className="mt-6">
            {presentationsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse h-48 bg-gray-300 dark:bg-gray-600 rounded-xl"></div>
                ))}
              </div>
            ) : presentations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {presentations.map((presentation) => (
                  <Link key={presentation.id} href={`/presentations/${presentation.slug}`}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 card-hover cursor-pointer">
                      {presentation.thumbnailUrl ? (
                        <img 
                          src={presentation.thumbnailUrl} 
                          alt={presentation.title}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <Presentation className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold mb-2 line-clamp-2">{presentation.title}</h3>
                        {presentation.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                            {presentation.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
                          <span className="flex items-center">
                            <Eye className="w-4 h-4 mr-1" />
                            {presentation.views}
                          </span>
                          <span className="flex items-center">
                            <Download className="w-4 h-4 mr-1" />
                            {presentation.downloads}
                          </span>
                        </div>
                        {presentation.slideCount && (
                          <Badge variant="outline">{presentation.slideCount} слайдов</Badge>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Presentation className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Презентации пока не добавлены
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  В этом подразделе пока нет презентаций
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
