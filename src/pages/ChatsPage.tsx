import { useQuery } from '@tanstack/react-query';
import { fetchConversations } from '@/api';
import { Link } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { formatRelativeTime } from '@/lib/format';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/format';

export function ChatsPage() {
  const { data: conversations, isLoading, isError, refetch } = useQuery({
    queryKey: ['conversations'],
    queryFn: fetchConversations,
  });

  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (isLoading) return <div className="max-w-3xl mx-auto px-4 py-4"><div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 skeleton rounded-xl" />)}</div></div>;
  if (!conversations || conversations.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-4">
        <EmptyState
          icon={<MessageCircle className="w-12 h-12" />}
          title="No conversations yet"
          description="Start chatting with a seller from any listing."
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4">
      <h1 className="text-2xl font-bold text-ink-900 dark:text-ink-50 mb-4">Chats</h1>
      <div className="space-y-2">
        {conversations.map(conv => (
          <Link
            key={conv.id}
            to={`/chats/${conv.id}`}
            className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-ink-900 shadow-soft hover:shadow-card-hover transition-all"
          >
            {conv.listing?.image_urls?.[0] ? (
              <img src={conv.listing.image_urls[0]} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
            ) : (
              <div className="w-14 h-14 rounded-lg bg-ink-100 dark:bg-ink-800 flex-shrink-0" />
            )}
            <Avatar name={conv.other_user?.full_name ?? 'Unknown'} src={conv.other_user?.avatar_url} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-ink-800 dark:text-ink-100 truncate">
                  {conv.other_user?.full_name ?? 'Deleted user'}
                </p>
                <span className="text-xs text-ink-400 flex-shrink-0">{formatRelativeTime(conv.last_message_at)}</span>
              </div>
              <p className="text-sm text-ink-400 truncate">{conv.last_message || 'Start a conversation'}</p>
            </div>
            {conv.unread_count && conv.unread_count > 0 ? (
              <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-xs font-medium flex items-center justify-center flex-shrink-0">
                {conv.unread_count}
              </span>
            ) : null}
          </Link>
        ))}
      </div>
    </div>
  );
}
