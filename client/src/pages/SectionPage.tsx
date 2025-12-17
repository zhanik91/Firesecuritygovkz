import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, FileText, Folder } from "lucide-react";

interface Section {
  id: string;
  title: string;
  slug: string;
  description?: string;
}

interface Subsection {
  id: string;
  sectionId: string;
  title: string;
  slug: string;
  description?: string;
}

export default function SectionPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: section, isLoading: sectionLoading, error: sectionError } = useQuery<Section>({
    queryKey: ["/api/sections", slug],
  });

  const { data: subsections = [], isLoading: subsectionsLoading } = useQuery<Subsection[]>({
    queryKey: ["/api/subsections"],
    select: (data) => data.filter((sub) => sub.sectionId === section?.id),
    enabled: !!section?.id,
  });

  if (sectionLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 dark:bg-gray-600 rounded-xl"></div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (sectionError || !section) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Раздел не найден
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Запрашиваемый раздел не существует или был удален
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
        title={`${section.title} | NewsFire`}
        description={section.description || `Раздел ${section.title} - Портал пожарной безопасности Казахстана`}
        keywords={`пожарная безопасность, ${section.title}, Казахстан`}
        canonical={`https://newsfire.kz/sections/${section.slug}`}
      />
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
          <Link href="/">
            <span className="hover:text-kz-blue cursor-pointer">Главная</span>
          </Link>
          <ArrowRight className="w-4 h-4" />
          <span className="font-medium text-gray-900 dark:text-white">{section.title}</span>
        </nav>

        {/* Section Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {section.title}
          </h1>
          {section.description && (
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl">
              {section.description}
            </p>
          )}
        </div>

        {/* Subsections Grid */}
        {subsectionsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-gray-300 dark:bg-gray-600 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : subsections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subsections.map((subsection) => (
              <Link key={subsection.id} href={`/subsections/${subsection.slug}`}>
                <Card className="h-full card-hover cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Folder className="w-8 h-8 text-kz-blue" />
                      <Badge variant="outline">Подраздел</Badge>
                    </div>
                    <CardTitle className="text-lg hover:text-kz-blue transition-colors">
                      {subsection.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      {subsection.description || "Описание раздела"}
                    </CardDescription>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Перейти к материалам
                      </span>
                      <ArrowRight className="w-4 h-4 text-kz-blue" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Подразделы пока не добавлены
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              В этом разделе пока нет подразделов с материалами
            </p>
          </div>
        )}

        {/* Back to Home */}
        <div className="mt-12 text-center">
          <Link href="/">
            <Button variant="outline" size="lg">
              Вернуться на главную
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
