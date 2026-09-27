'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Wifi, WifiOff, MessageSquare } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import { useMessages, useSendMessage } from '@/hooks/useMessages';
import { Message } from '@/types';
import { formatRelativeTime, getInitials } from '@/lib/utils';

interface ChatWindowProps {
  projectId: string;
  projectName: string;
}

export function ChatWindow({ projectId, projectName }: ChatWindowProps) {
  const { user } = useAuth();
  const { isConnected, emit, on } = useSocket();
  const { data: initialMessages, isLoading } = useMessages(projectId);
  const sendMessage = useSendMessage();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Set initial messages
  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  // Join project room
  useEffect(() => {
    if (!isConnected) return;

    emit('project:join', { projectId });

    const unsubscribeNew = on('message:new', (message: Message) => {
      setMessages((prev) => {
        if (prev.find((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    });

    const unsubscribeTyping = on(
      'message:typing',
      (data: { userId: string; isTyping: boolean }) => {
        if (data.userId === user?.id) return;

        setTypingUsers((prev) => {
          const next = new Set(prev);
          if (data.isTyping) {
            next.add(data.userId);
          } else {
            next.delete(data.userId);
          }
          return next;
        });
      },
    );

    return () => {
      emit('project:leave', { projectId });
      unsubscribeNew();
      unsubscribeTyping();
    };
  }, [isConnected, projectId, emit, on, user?.id]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !isConnected) return;

    emit('message:send', {
      projectId,
      content: input.trim(),
    });

    // Stop typing
    emit('message:typing', { projectId, isTyping: false });

    setInput('');
  };

  const handleTyping = (value: string) => {
    setInput(value);

    if (!isConnected) return;

    emit('message:typing', { projectId, isTyping: true });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      emit('message:typing', { projectId, isTyping: false });
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{projectName}</h3>
            <p className="text-xs text-slate-500">Team Chat</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <Wifi className="w-4 h-4 text-green-500" />
              <span className="text-xs text-green-600 font-medium">
                Connected
              </span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-red-500" />
              <span className="text-xs text-red-600 font-medium">
                Disconnected
              </span>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-slate-500">No messages yet</p>
            <p className="text-sm text-slate-400 mt-1">
              Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.userId === user?.id;
            return (
              <div
                key={message.id}
                className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 ${
                    isOwn
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                      : 'bg-gradient-to-br from-purple-500 to-pink-500'
                  }`}
                >
                  {getInitials(message.user.name)}
                </div>
                <div
                  className={`flex flex-col ${isOwn ? 'items-end' : ''} max-w-[70%]`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-slate-700">
                      {isOwn ? 'You' : message.user.name}
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatRelativeTime(message.createdAt)}
                    </span>
                  </div>
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      isOwn
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-sm'
                        : 'bg-white border border-slate-200 text-slate-900 rounded-tl-sm'
                    }`}
                  >
                    <p className="text-sm break-words">{message.content}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Typing Indicator */}
        {typingUsers.size > 0 && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></div>
              <div
                className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
                style={{ animationDelay: '0.1s' }}
              ></div>
              <div
                className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
                style={{ animationDelay: '0.2s' }}
              ></div>
            </div>
            <span>Someone is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="p-4 border-t border-slate-200 bg-white"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => handleTyping(e.target.value)}
            placeholder={
              isConnected ? 'Type a message...' : 'Connecting...'
            }
            disabled={!isConnected}
            style={{ color: '#0f172a' }}
            className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition disabled:bg-slate-100"
          />
          <button
            type="submit"
            disabled={!isConnected || !input.trim()}
            className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}