import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard,
  FolderOpen,
  Folder,
  FileText,
  File,
  Megaphone,
  MessageSquare,
  Users,
  Shield,
  Image,
  Bell,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Settings
} from 'lucide-react';

interface AdminSidebarProps {
  className?: string;
}

interface MenuItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    name: 'Обзор',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Контент',
    href: '/admin/content',
    icon: FileText,
    children: [
      { name: 'Секции', href: '/admin/sections', icon: FolderOpen },
      { name: 'Подсекции', href: '/admin/subsections', icon: Folder },
      { name: 'Посты', href: '/admin/posts', icon: FileText },
      { name: 'Документы', href: '/admin/documents', icon: File },
    ]
  },
  {
    name: 'Маркетплейс',
    href: '/admin/marketplace',
    icon: Megaphone,
    children: [
      { name: 'Объявления', href: '/admin/ads', icon: Megaphone },
      { name: 'Заявки', href: '/admin/bids', icon: MessageSquare },
    ]
  },
  {
    name: 'Пользователи',
    href: '/admin/users',
    icon: Users,
  },
  {
    name: 'Модерация',
    href: '/admin/moderation',
    icon: Shield,
    badge: '3',
  },
  {
    name: 'Медиа',
    href: '/admin/media',
    icon: Image,
  },
  {
    name: 'Уведомления',
    href: '/admin/notifications',
    icon: Bell,
    badge: '12',
  },
  {
    name: 'Аналитика',
    href: '/admin/analytics',
    icon: BarChart3,
  },
];

export default function AdminSidebar({ className = "" }: AdminSidebarProps) {
  const [location] = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(['content', 'marketplace']);

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const isActive = (href: string) => {
    if (href === '/admin') {
      return location === '/admin';
    }
    return location.startsWith(href);
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.name.toLowerCase());
    const active = isActive(item.href);

    return (
      <div key={item.name}>
        <div className={`flex items-center ${level > 0 ? 'pl-6' : ''}`}>
          {hasChildren ? (
            <Button
              variant="ghost"
              className={`w-full justify-start text-left h-10 mb-1 ${
                active ? 'bg-primary/10 text-primary' : 'text-gray-700 dark:text-gray-300'
              }`}
              onClick={() => toggleExpanded(item.name.toLowerCase())}
            >
              <item.icon className="w-4 h-4 mr-3" />
              <span className="flex-1">{item.name}</span>
              {item.badge && (
                <Badge variant="secondary" className="mr-2 text-xs">
                  {item.badge}
                </Badge>
              )}
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          ) : (
            <Link href={item.href} className="w-full">
              <Button
                variant="ghost"
                className={`w-full justify-start text-left h-10 mb-1 ${
                  active ? 'bg-primary/10 text-primary' : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <item.icon className="w-4 h-4 mr-3" />
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            </Link>
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div className="ml-4 border-l border-gray-200 dark:border-gray-700 pl-2">
            {item.children?.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full ${className}`}>
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Админ-панель
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              NewsFire
            </p>
          </div>
        </div>

        <nav className="space-y-1">
          {menuItems.map(item => renderMenuItem(item))}
        </nav>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
        <Link href="/">
          <Button variant="outline" className="w-full">
            Вернуться на сайт
          </Button>
        </Link>
      </div>
    </div>
  );
}