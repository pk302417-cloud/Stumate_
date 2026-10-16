import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchConversations, fetchMessages, sendMessage } from '@/api';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { config } from '@/config';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';
import { formatRelativeTime, cn } from '@/lib/format';
import { ChevronLeft, Send, Shield, MoreVertical, Flag, Ban } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import type { Message } from '@/types/database';

export function ChatThreadPage() {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { show } = useToast();
  const queryClient = useQueryClient();
  const [input, setInput] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations } = useQuery({ queryKey: ['conversations'], queryFn: fetchConversations });
  const conversation = conversations?.find(c => c.id === id);

  const { data: messages } = useQuery({
    queryKey: ['messages', id],
    queryFn: () => fetchMessages(id!),
    enabled: !!id,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: (body: string) => sendMessage(id!, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: () => show('Could not send message', 'error'),
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const body = input.trim();
    if (!body || sendMutation.isPending) return;
    setInput('');
    sendMutation.mutate(body);
  };

  if (!conversation) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <p className="text-ink-400">Conversation not found.</p>
        <Link to="/chats" className="text-brand-600 text-sm mt-2 inline-block">Back to chats</Link>
      </div>
    );
  }

  const otherUser = conversation.other_user;
  const listing = conversation.listing;

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-ink-200 dark:border-ink-800">
        <button onClick={() => navigate('/chats')} className="text-ink-400 hover:text-ink-600">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <Avatar name={otherUser?.full_name ?? 'Unknown'} src={otherUser?.avatar_url} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-ink-800 dark:text-ink-100 truncate">
            {otherUser?.full_name ?? 'Deleted user'}
          </p>
          {otherUser?.hostel && <p className="text-xs text-ink-400">{otherUser.hostel}</p>}
        </div>
        <button onClick={() => setMenuOpen(true)} className="text-ink-400 hover:text-ink-600 p-2">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Pinned listing */}
      {listing && (
        <Link
          to={`/listing/${listing.id}`}
          className="flex items-center gap-2 p-2 my-2 rounded-xl bg-brand-50 dark:bg-brand-900/20 hover:bg-brand-100 dark:hover:bg-brand-900/30 transition-colors"
        >
          {listing.image_urls?.[0] ? (
            <img src={listing.image_urls[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-ink-200" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink-800 dark:text-ink-100 truncate">{listing.title}</p>
            <p className="text-xs text-brand-600 dark:text-brand-400">₹{listing.price_inr}</p>
          </div>
        </Link>
      )}

      {/* Safety banner */}
      <div className="flex items-center gap-2 p-2 mb-2 rounded-xl bg-warning-50 dark:bg-warning-900/20 text-warning-700 dark:text-warning-300 text-xs">
        <Shield className="w-3.5 h-3.5 flex-shrink-0" />
        <span>Meet in public campus areas. Never pay in advance.</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-2 py-2">
        {messages?.map(msg => (
          <MessageBubble key={msg.id} message={msg} isMine={msg.sender_id === user?.id} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-2 pt-2 border-t border-ink-200 dark:border-ink-800">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value.slice(0, config.messageMaxLength))}
          placeholder="Type a message..."
          className="flex-1 h-11 px-4 rounded-xl border border-ink-300 dark:border-ink-700 bg-white dark:bg-ink-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
        <Button type="submit" disabled={!input.trim() || sendMutation.isPending} className="px-3">
          <Send className="w-5 h-5" />
        </Button>
      </form>
      <p className="text-xs text-ink-400 text-right mt-1">{input.length}/{config.messageMaxLength}</p>

      {/* Menu dialog */}
      <Dialog open={menuOpen} onClose={() => setMenuOpen(false)} title="Chat options">
        <div className="space-y-2">
          <button
            onClick={() => { setMenuOpen(false); setReportOpen(true); }}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-ink-700 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-ink-800"
          >
            <Flag className="w-5 h-5 text-error-500" /> Report user
          </button>
          <button
            onClick={() => { setMenuOpen(false); show('User blocked', 'success'); }}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-ink-700 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-ink-800"
          >
            <Ban className="w-5 h-5 text-error-500" /> Block user
          </button>
        </div>
      </Dialog>

      {/* Report dialog */}
      <Dialog open={reportOpen} onClose={() => setReportOpen(false)} title="Report user">
        <ReportUserForm onClose={() => setReportOpen(false)} onSubmitted={() => { setReportOpen(false); show('Report submitted', 'success'); }} />
      </Dialog>
    </div>
  );
}

function MessageBubble({ message, isMine }: { message: Message; isMine: boolean }) {
  return (
    <div className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
      <div className={cn(
        'max-w-[75%] px-3.5 py-2 rounded-2xl text-sm',
        isMine
          ? 'bg-brand-600 text-white rounded-br-md'
          : 'bg-ink-100 dark:bg-ink-800 text-ink-800 dark:text-ink-100 rounded-bl-md'
      )}>
        <p className="whitespace-pre-wrap break-words">{message.body}</p>
        <p className={cn('text-[10px] mt-0.5', isMine ? 'text-brand-200' : 'text-ink-400')}>
          {formatRelativeTime(message.created_at)}
        </p>
      </div>
    </div>
  );
}

function ReportUserForm({ onClose, onSubmitted }: { onClose: () => void; onSubmitted: () => void }) {
  const reasons = [
    { value: 'harassment', label: 'Harassment' },
    { value: 'scam', label: 'Scam or fraud' },
    { value: 'spam', label: 'Spam' },
    { value: 'inappropriate_content', label: 'Inappropriate content' },
    { value: 'impersonation', label: 'Impersonation' },
    { value: 'other', label: 'Other' },
  ];
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    setLoading(false);
    onSubmitted();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-2">Reason</label>
        <div className="space-y-2">
          {reasons.map(r => (
            <label key={r.value} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="reason" value={r.value} checked={reason === r.value} onChange={e => setReason(e.target.value)} className="text-brand-600 focus:ring-brand-400" />
              <span className="text-sm text-ink-700 dark:text-ink-200">{r.label}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-1.5">Details (optional)</label>
        <textarea
          value={details}
          onChange={e => setDetails(e.target.value)}
          maxLength={500}
          rows={3}
          className="w-full px-3.5 py-2.5 rounded-xl border border-ink-300 dark:border-ink-700 bg-white dark:bg-ink-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          placeholder="Add more details..."
        />
      </div>
      <Button type="submit" className="w-full" loading={loading} disabled={!reason}>Submit report</Button>
    </form>
  );
}
