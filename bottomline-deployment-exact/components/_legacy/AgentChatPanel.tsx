'use client';

import { useState, useRef, useEffect } from 'react';
import { SuggestedAction } from '@/lib/stepsSchema';
import { MessageSquare, User, Send, Info, Play, RefreshCw, HelpCircle, Mail, Wrench } from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface AgentChatPanelProps {
  suggestedActions: SuggestedAction[];
  stepLabel: string;
  stepId?: string;
  onActionClick: (action: SuggestedAction) => void;
  onDraftClarificationEmail?: () => void;
  onApplyFixesRerun?: () => void;
}

const actionIcons: Record<string, React.ReactNode> = {
  primary: <Play className="w-3 h-3" />,
  secondary: <RefreshCw className="w-3 h-3" />,
  warning: <HelpCircle className="w-3 h-3" />,
};

export default function AgentChatPanel({ suggestedActions, stepLabel, stepId, onActionClick, onDraftClarificationEmail, onApplyFixesRerun }: AgentChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: `Welcome to the Deal Workspace. You're currently on the "${stepLabel}" step. Ask a question or choose an action to continue.`,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update welcome message when step changes
  useEffect(() => {
    setMessages(prev => {
      const newMessages = [...prev];
      if (newMessages.length > 0 && newMessages[0].type === 'assistant') {
        newMessages[0] = {
          ...newMessages[0],
          content: `Welcome to the Deal Workspace. You're currently on the "${stepLabel}" step. Ask a question or pick an action below to get started.`,
        };
      }
      return newMessages;
    });
  }, [stepLabel]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Simulate support response
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `For "${inputValue}", the ${stepLabel} controls and available actions are the best place to start.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    }, 1000);
  };

  const handleActionClick = (action: SuggestedAction) => {
    // Add system message
    const systemMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'system',
      content: `Queued: ${action.label} (mock)`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, systemMessage]);
    
    // Trigger the action callback
    onActionClick(action);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white rounded-md border border-slate-200 overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100">
        <div className="w-7 h-7 bg-[#16345e] rounded flex items-center justify-center">
          <MessageSquare className="w-3.5 h-3.5 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-800 tracking-tight">Deal Support</h3>
        </div>
        <span className="ml-auto flex items-center gap-1.5 text-[11px] text-slate-500 font-medium px-2 py-0.5 rounded border border-slate-200">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
          Connected
        </span>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-2 animate-fade-in ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
            {message.type !== 'system' && (
              <div className={`flex-shrink-0 w-7 h-7 rounded flex items-center justify-center ${
                message.type === 'assistant' 
                  ? 'bg-[#16345e]'
                  : 'bg-white border border-slate-200'
              }`}>
                {message.type === 'assistant' ? (
                  <MessageSquare className="w-3.5 h-3.5 text-white" />
                ) : (
                  <User className="w-4 h-4 text-slate-500" />
                )}
              </div>
            )}
            
            <div className={`max-w-[80%] ${message.type === 'system' ? 'w-full' : ''}`}>
              {message.type === 'system' ? (
                <div className="flex items-center justify-center gap-2 py-2 px-3 bg-amber-50 border border-amber-200 rounded">
                  <Info className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-xs text-amber-800 font-medium">{message.content}</span>
                </div>
              ) : (
                <div className={`px-3 py-2.5 rounded-md ${
                  message.type === 'assistant'
                    ? 'bg-slate-50 border border-slate-200 text-slate-700'
                    : 'bg-[#16345e] text-white'
                }`}>
                  <p className="text-[13px] leading-relaxed">{message.content}</p>
                </div>
              )}
              {message.type !== 'system' && (
                <p className={`text-[10px] text-slate-400 mt-1 ${message.type === 'user' ? 'text-right' : ''}`}>
                  {formatTime(message.timestamp)}
                </p>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Intake-specific Action Buttons */}
      {(stepId === 'intake') && (onDraftClarificationEmail || onApplyFixesRerun) && (
        <div className="px-3 py-2 border-t border-slate-200 bg-blue-50/50">
          <p className="text-[10px] text-blue-600 uppercase tracking-wider font-semibold mb-2">Intake Actions</p>
          <div className="flex flex-col gap-1.5">
            {onDraftClarificationEmail && (
              <button
                onClick={onDraftClarificationEmail}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200 transition-colors w-full"
              >
                <Mail className="w-3.5 h-3.5" />
                Draft Clarification Email
              </button>
            )}
            {onApplyFixesRerun && (
              <button
                onClick={onApplyFixesRerun}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200 transition-colors w-full"
              >
                <Wrench className="w-3.5 h-3.5" />
                Apply Fixes &amp; Re-run Checks
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Suggested Actions */}
      {suggestedActions.length > 0 && (
        <div className="px-3 py-2.5 border-t border-slate-100 bg-slate-50/50">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-2">Available Actions</p>
          <div className="flex flex-wrap gap-2">
            {suggestedActions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleActionClick(action)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  action.variant === 'primary'
                    ? 'bg-[#16345e] text-white hover:bg-[#1d4373]'
                    : action.variant === 'warning'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                {actionIcons[action.variant]}
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Input */}
      <div className="p-3 border-t border-slate-100 bg-white">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask about this deal..."
            className="flex-1 bg-white border border-slate-200 rounded px-3.5 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-700 transition-colors"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="p-2.5 bg-[#16345e] text-white rounded hover:bg-[#1d4373] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
