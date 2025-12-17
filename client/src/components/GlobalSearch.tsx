import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Search, FileText, BookOpen, ShoppingCart, Users } from 'lucide-react';
import { useLocation } from 'wouter';

interface SearchResult {
  id: string;
  title: string;
  type: 'post' | 'document' | 'ad' | 'user' | 'section';
  description?: string;
  url: string;
}

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [, setLocation] = useLocation();

  const { data: results = [], isLoading } = useQuery({
    queryKey: ['/api/search', query],
    enabled: query.length >= 2 && open,
    queryFn: async (): Promise<SearchResult[]> => {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    }
  });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  const handleSelect = (url: string) => {
    setLocation(url);
    onOpenChange(false);
    setQuery('');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'post': return <FileText className="h-4 w-4" />;
      case 'document': return <BookOpen className="h-4 w-4" />;
      case 'ad': return <ShoppingCart className="h-4 w-4" />;
      case 'user': return <Users className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'post': return 'Публикация';
      case 'document': return 'Документ';
      case 'ad': return 'Объявление';
      case 'user': return 'Пользователь';
      case 'section': return 'Раздел';
      default: return 'Результат';
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Поиск по сайту... (Ctrl+K)"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {query.length < 2 && (
          <CommandEmpty>Введите минимум 2 символа для поиска</CommandEmpty>
        )}
        
        {query.length >= 2 && isLoading && (
          <CommandEmpty>Поиск...</CommandEmpty>
        )}
        
        {query.length >= 2 && !isLoading && results.length === 0 && (
          <CommandEmpty>Ничего не найдено</CommandEmpty>
        )}

        {results.length > 0 && (
          <>
            {['post', 'document', 'ad', 'section', 'user'].map(type => {
              const typeResults = results.filter(r => r.type === type);
              if (typeResults.length === 0) return null;

              return (
                <CommandGroup key={type} heading={getTypeLabel(type)}>
                  {typeResults.map((result) => (
                    <CommandItem
                      key={result.id}
                      value={result.title}
                      onSelect={() => handleSelect(result.url)}
                      className="flex items-center gap-2"
                    >
                      {getIcon(result.type)}
                      <div className="flex-1">
                        <div className="font-medium">{result.title}</div>
                        {result.description && (
                          <div className="text-xs text-muted-foreground truncate">
                            {result.description}
                          </div>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              );
            })}
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}

// Hook for using global search
export function useGlobalSearch() {
  const [open, setOpen] = useState(false);

  return {
    open,
    setOpen,
    SearchButton: () => (
      <Button
        variant="outline"
        className="relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        Поиск...
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
    )
  };
}