'use client'

import { useRef, useEffect, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { MessageSquare, X, Send, Bot, User, Loader2, Minimize2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UIMessage } from 'ai'

/* ── Initial greeting ───────────────────────────────────────────── */
const INITIAL_MESSAGES: UIMessage[] = [
  {
    id:    'seed-1',
    role:  'assistant',
    parts: [{ type: 'text', text: "Hello! I'm your HeatGuard AI Assistant. I can help you monitor worker safety, analyze heat stress data, and flag compliance risks. How can I help you today?" }],
  },
]

/* ── Helpers ────────────────────────────────────────────────────── */
function getMessageText(msg: UIMessage): string {
  return msg.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map(p => p.text)
    .join('')
}

function renderContent(content: string) {
  return {
    __html: content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br />'),
  }
}

/* ── Message bubble ─────────────────────────────────────────────── */
function MessageBubble({ msg }: { msg: UIMessage }) {
  const isUser = msg.role === 'user'
  const text   = getMessageText(msg)
  if (!text) return null

  return (
    <div className={cn('flex gap-2.5 items-end', isUser && 'flex-row-reverse')}>
      <div className={cn(
        'w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-white',
        isUser ? 'bg-[#00D15A]' : 'bg-[#0C2A1F]',
      )}>
        {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
      </div>

      <div className={cn('max-w-[78%]', isUser && 'flex justify-end')}>
        <div
          className={cn(
            'px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap',
            isUser
              ? 'bg-[#00D15A] text-white rounded-br-sm'
              : 'bg-[#F7F9F8] text-[#0E1B18] rounded-bl-sm border border-gray-100',
          )}
          dangerouslySetInnerHTML={renderContent(text)}
        />
      </div>
    </div>
  )
}

/* ── Typing indicator ───────────────────────────────────────────── */
function TypingIndicator() {
  return (
    <div className="flex gap-2.5 items-end">
      <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center bg-[#0C2A1F] text-white">
        <Bot className="w-3.5 h-3.5" />
      </div>
      <div className="bg-[#F7F9F8] border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]"   />
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  )
}

/* ── Main component ─────────────────────────────────────────────── */
export function AIChatbot() {
  const [open,   setOpen]   = useState(false)
  const [unread, setUnread] = useState(1)
  const [input,  setInput]  = useState('')

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)

  const { messages, sendMessage, status } = useChat({
    messages: INITIAL_MESSAGES,
  })

  const isLoading = status === 'submitted' || status === 'streaming'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  useEffect(() => {
    if (open) {
      setUnread(0)
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [open])

  function handleSend() {
    const text = input?.trim()
    if (!text || isLoading) return
    setInput('')
    sendMessage({ text })
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const hasUserMessages = messages.some(m => m.role === 'user')

  return (
    <>
      {/* ── Floating window ───────────────────────────────────────── */}
      <div
        className={cn(
          'fixed bottom-20 right-5 z-50 w-[360px] bg-white rounded-3xl shadow-2xl border border-gray-100',
          'flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right',
          open
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none',
        )}
        style={{ maxHeight: 'calc(100vh - 120px)', height: 520 }}
        aria-hidden={!open}
        role="dialog"
        aria-label="HeatGuard AI Assistant"
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-4 py-3.5 shrink-0"
          style={{ backgroundColor: '#0C2A1F' }}
        >
          <div className="w-8 h-8 rounded-full bg-[#00D15A] flex items-center justify-center shrink-0">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-white leading-none">HeatGuard AI</p>
            <p className="text-[11px] text-[#00D15A] mt-0.5 leading-none flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#00D15A] rounded-full animate-pulse inline-block" />
              Online · Safety Assistant
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close chat"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
          {messages.map(msg => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}
          {isLoading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Suggested prompts */}
        {!hasUserMessages && (
          <div className="px-4 pb-2 flex flex-col gap-2">
            {['Any workers at risk?', 'Show compliance gaps', 'Summarize today'].map(p => (
              <div
                key={p}
                className="rounded-full p-[1.5px]"
                style={{ background: 'linear-gradient(135deg, #00D15A, #00b84f, #00D15A)' }}
              >
                <button
                  onClick={() => sendMessage({ text: p })}
                  className="w-full bg-white rounded-full px-4 py-2 text-[12px] text-[#00D15A] font-semibold hover:bg-[#00D15A]/5 transition-colors text-center"
                >
                  {p}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="px-4 pb-4 pt-2 shrink-0 border-t border-gray-50">
          <div className="flex items-center gap-2 bg-[#F7F9F8] rounded-2xl px-3.5 py-2 border border-gray-100">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about workers, alerts, compliance…"
              className="flex-1 bg-transparent text-[13px] text-gray-800 placeholder:text-gray-400 outline-none"
            />
            <button
              onClick={handleSend}
              disabled={!input?.trim() || isLoading}
              aria-label="Send message"
              className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors',
                input?.trim() && !isLoading
                  ? 'bg-[#00D15A] text-white hover:bg-[#00b84f]'
                  : 'bg-gray-100 text-gray-300',
              )}
            >
              {isLoading
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Send    className="w-3.5 h-3.5" />}
            </button>
          </div>
          <p className="text-[10px] text-gray-400 text-center mt-2">
            AI responses are illustrative. Verify critical decisions with live data.
          </p>
        </div>
      </div>

      {/* ── FAB button ─────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close AI Assistant' : 'Open AI Assistant'}
        className={cn(
          'fixed bottom-5 right-5 z-50 rounded-2xl shadow-lg',
          'flex items-center justify-center transition-all duration-200',
          'hover:scale-105 active:scale-95',
          open ? 'bg-[#0C2A1F]' : 'bg-[#00D15A]',
        )}
        style={{ width: 52, height: 52 }}
      >
        {open
          ? <X             className="w-5 h-5 text-white" />
          : <MessageSquare className="w-5 h-5 text-white" />}

        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>
    </>
  )
}
