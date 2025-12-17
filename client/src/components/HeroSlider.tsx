import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featuredImageUrl?: string;
  publishedAt: string;
  tags?: string[];
}

interface HeroSliderProps {
  posts: Post[];
  isLoading: boolean;
}

export default function HeroSlider({ posts, isLoading }: HeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (posts.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % posts.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [posts.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % posts.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + posts.length) % posts.length);
  };

  if (isLoading) {
    return (
      <section className="mb-8">
        <div className="relative bg-gradient-to-r from-kz-blue to-kz-blue-light rounded-xl overflow-hidden">
          <div className="h-96 bg-gray-300 dark:bg-gray-600 animate-pulse"></div>
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return (
      <section className="mb-8">
        <div className="relative bg-gradient-to-r from-kz-blue to-kz-blue-light rounded-xl overflow-hidden">
          <div className="h-96 flex items-center justify-center">
            <div className="text-center text-white">
              <h2 className="text-3xl font-bold mb-4">Добро пожаловать в Fire Safety KZ</h2>
              <p className="text-xl text-gray-200">Ведущий портал по пожарной безопасности в Казахстане</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const currentPost = posts[currentSlide];

  return (
    <section className="mb-8">
      <div className="relative bg-gradient-to-r from-kz-blue to-kz-blue-light rounded-xl overflow-hidden group">
        {/* Background Image */}
        {currentPost.featuredImageUrl && (
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${currentPost.featuredImageUrl})` }}
          >
            <div className="absolute inset-0 bg-black/50"></div>
          </div>
        )}
        
        <div className="relative z-10 p-8 h-96 flex flex-col justify-end">
          {currentPost.tags && currentPost.tags.length > 0 && (
            <Badge className="inline-block bg-kz-yellow text-kz-blue text-sm font-medium w-fit mb-4">
              {currentPost.tags[0].toUpperCase()}
            </Badge>
          )}
          
          <h2 className="text-3xl font-bold text-white mb-4 line-clamp-2">
            {currentPost.title}
          </h2>
          
          {currentPost.excerpt && (
            <p className="text-gray-200 mb-6 max-w-2xl line-clamp-2">
              {currentPost.excerpt}
            </p>
          )}
          
          <Link href={`/posts/${currentPost.slug}`}>
            <Button className="bg-kz-yellow text-kz-blue hover:bg-kz-yellow-warm w-fit">
              Читать подробнее
            </Button>
          </Link>
        </div>
        
        {/* Navigation Arrows */}
        {posts.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
        
        {/* Slider Navigation Dots */}
        {posts.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {posts.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
