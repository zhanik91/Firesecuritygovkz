import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  FileText, 
  BookOpen, 
  Library, 
  Newspaper, 
  Presentation, 
  Images, 
  Video, 
  Calculator, 
  ShoppingCart,
  ChevronDown,
  Search
} from "lucide-react";

interface Section {
  id: string;
  title: string;
  slug: string;
  description?: string;
  icon?: string;
}

interface Subsection {
  id: string;
  sectionId: string;
  title: string;
  slug: string;
  description?: string;
}

export default function MegaMenu() {
  const { data: sectionsData, isLoading: sectionsLoading } = useQuery<Section[]>({
    queryKey: ["/api/sections"],
  });

  const { data: subsectionsData, isLoading: subsectionsLoading } = useQuery<Subsection[]>({
    queryKey: ["/api/subsections"],
  });

  // Ensure we have arrays, not error objects
  const sections = Array.isArray(sectionsData) ? sectionsData : [];
  const subsections = Array.isArray(subsectionsData) ? subsectionsData : [];

  const getSubsectionsForSection = (sectionId: string) => {
    return subsections.filter(sub => sub.sectionId === sectionId);
  };

  const getIconComponent = (iconName?: string) => {
    switch (iconName) {
      case "fas fa-file-text": return <FileText className="w-4 h-4 mr-2" />;
      case "fas fa-book": return <BookOpen className="w-4 h-4 mr-2" />;
      case "fas fa-books": return <Library className="w-4 h-4 mr-2" />;
      case "fas fa-newspaper": return <Newspaper className="w-4 h-4 mr-2" />;
      case "fas fa-presentation-screen": return <Presentation className="w-4 h-4 mr-2" />;
      case "fas fa-images": return <Images className="w-4 h-4 mr-2" />;
      case "fas fa-video": return <Video className="w-4 h-4 mr-2" />;
      case "fas fa-book-open": return <BookOpen className="w-4 h-4 mr-2" />;
      default: return <FileText className="w-4 h-4 mr-2" />;
    }
  };

  if (sectionsLoading || subsectionsLoading) {
    return (
      <nav className="bg-gradient-to-r from-kz-blue to-kz-blue-light">
        <div className="max-w-7xl mx-auto">
          <div className="flex overflow-x-auto">
            <div className="flex space-x-0 min-w-max">
              <div className="mega-menu-item">Loading...</div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-gradient-to-r from-kz-blue to-kz-blue-light">
      <div className="max-w-7xl mx-auto">
        <div className="flex overflow-x-auto">
          <div className="flex space-x-0 min-w-max">
            {/* Main content sections */}
            {sections.map((section) => {
              const sectionSubsections = getSubsectionsForSection(section.id);
              
              return (
                <div key={section.id} className="group relative">
                  <Link href={`/sections/${section.slug}`}>
                    <button className="mega-menu-item flex items-center">
                      {getIconComponent(section.icon)}
                      {section.title.toUpperCase()}
                      {sectionSubsections.length > 0 && (
                        <ChevronDown className="ml-2 w-3 h-3" />
                      )}
                    </button>
                  </Link>
                  
                  {/* Mega Menu Dropdown */}
                  {sectionSubsections.length > 0 && (
                    <div className="mega-menu-dropdown">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-8">
                        {sectionSubsections.map((subsection) => (
                          <div key={subsection.id}>
                            <Link href={`/subsections/${subsection.slug}`}>
                              <h3 className="font-semibold text-kz-blue dark:text-kz-blue-light mb-2 hover:text-kz-blue-light transition-colors cursor-pointer">
                                {subsection.title}
                              </h3>
                            </Link>
                            {subsection.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {subsection.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Calculators - static menu item */}
            <div className="group relative">
              <Link href="/calculators">
                <button className="mega-menu-item flex items-center">
                  <Calculator className="w-4 h-4 mr-2" />
                  КАЛЬКУЛЯТОРЫ
                </button>
              </Link>
            </div>

            {/* Marketplace - static menu item */}
            <div className="group relative">
              <Link href="/marketplace">
                <button className="mega-menu-item flex items-center">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  МАРКЕТПЛЕЙС
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
