import React, { memo } from 'react';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Eye, Clock, User } from 'lucide-react';
import { Link } from 'wouter';

interface Post {
  id: string;
  title: string;
  slug: string;
  content?: string;
  author?: string;
  featuredImageUrl?: string;
  publishedAt: string;
  views?: number;
  tags?: string[];
  category?: string;
}

interface VirtualizedPostsListProps {
  posts: Post[];
  hasNextPage?: boolean;
  isLoading?: boolean;
  loadMore?: () => void;
  height?: number;
  itemHeight?: number;
}

const PostItem = memo(({ index, style, data }: { 
  index: number; 
  style: React.CSSProperties; 
  data: { posts: Post[]; loadMore?: () => void; hasNextPage?: boolean; isLoading?: boolean; }; 
}) => {
  const { posts, loadMore, hasNextPage, isLoading } = data;
  const post = posts[index];

  // Показываем индикатор загрузки для следующих элементов
  if (!post) {
    if (hasNextPage && loadMore) {
      loadMore();
    }
    return (
      <div style={style} className="p-4 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div style={style} className="p-2">
      <Card className="h-full hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Link href={`/posts/${post.slug}`}>
                <CardTitle className="text-lg hover:text-blue-600 cursor-pointer line-clamp-2">
                  {post.title}
                </CardTitle>
              </Link>
              {post.category && (
                <Badge variant="secondary" className="mt-2">
                  {post.category}
                </Badge>
              )}
            </div>
            {post.featuredImageUrl && (
              <img
                src={post.featuredImageUrl}
                alt={post.title}
                className="w-16 h-16 object-cover rounded-lg ml-4"
                loading="lazy"
              />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {post.content && (
            <p className="text-muted-foreground text-sm line-clamp-3 mb-3">
              {post.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
            </p>
          )}
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              {post.author && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{post.author}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>
                  {formatDistanceToNow(new Date(post.publishedAt), {
                    addSuffix: true,
                    locale: ru
                  })}
                </span>
              </div>
            </div>
            
            {post.views && (
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{post.views}</span>
              </div>
            )}
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {post.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-xs"
                >
                  {tag}
                </Badge>
              ))}
              {post.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{post.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

PostItem.displayName = 'PostItem';

export default function VirtualizedPostsList({
  posts,
  hasNextPage = false,
  isLoading = false,
  loadMore,
  height = 600,
  itemHeight = 200
}: VirtualizedPostsListProps) {
  const itemCount = hasNextPage ? posts.length + 1 : posts.length;
  const isItemLoaded = (index: number) => index < posts.length;

  const itemData = {
    posts,
    loadMore,
    hasNextPage,
    isLoading
  };

  if (posts.length === 0 && !isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Статьи не найдены</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {loadMore ? (
        <InfiniteLoader
          isItemLoaded={isItemLoaded}
          itemCount={itemCount}
          loadMoreItems={loadMore}
        >
          {({ onItemsRendered, ref }: any) => (
            <List
              ref={ref}
              height={height}
              width="100%"
              itemCount={itemCount}
              itemSize={itemHeight}
              itemData={itemData}
              onItemsRendered={onItemsRendered}
              overscanCount={5}
            >
              {PostItem}
            </List>
          )}
        </InfiniteLoader>
      ) : (
        <List
          height={height}
          width="100%"
          itemCount={itemCount}
          itemSize={itemHeight}
          itemData={itemData}
          overscanCount={5}
        >
          {PostItem}
        </List>
      )}
    </div>
  );
}