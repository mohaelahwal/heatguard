'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, Bot, User, Loader2, Minimize2 } from 'lucide-react'
import { cn } from '@/lib/utils'

/* ── Types ──────────────────────────────────────────────────────── */
type Role = 'assistant' | 'user'

interface Message {
  id:        string
  role:      Role
  content:   string
  time:      string   // static display string — avoids SSR/client hydration mismatch
}

/* ── Mock seed messages ─────────────────────────────────────────── */
const SEED_MESSAGES: Message[] = [
  {
    id:      '1',
    role:    'assistant',
    content: 'Hello Mohaned! I\'m your HeatGuard AI Assistant. I can help you monitor worker safety, analyze heat stress data, and flag compliance risks. How can I help you today?',
    time:    '9:07 AM',
  },
  {
    id:      '2',
    role:    'user',
    content: 'Are there any workers currently at risk?',
    time:    '9:08 AM',
  },
  {
    id:      '3',
    role:    'assistant',
    content: '⚠️ Yes — 3 workers currently have elevated heat stress readings:\n\n• **Tarek Haddad** — WBGT 41.2°C (Zone B), last reading 4 min ago\n• **Rajesh Iyer** — Reported dizziness, heat index critical\n• **Khaled Saeed** — No check-in for 22 minutes\n\nI recommend initiating a welfare check immediately.',
    time:    '9:08 AM',
  },
]

/* ── Format time ────────────────────────────────────────────────── */
function formatTime(): string {
  return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

/* ── Message bubble ─────────────────────────────────────────────── */
function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'
  return (
    <div className={cn('flex gap-2.5 items-end', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      <div
        className={cn(
          'w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-white',
          isUser ? 'bg-[#00D15A]' : 'bg-[#0C2A1F]'
        )}
      >
        {isUser
          ? <User className="w-3.5 h-3.5" />
          : <Bot  className="w-3.5 h-3.5" />}
      </div>

      {/* Bubble */}
      <div className={cn('max-w-[78%] flex flex-col gap-1', isUser && 'items-end')}>
        <div
          className={cn(
            'px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap',
            isUser
              ? 'bg-[#00D15A] text-white rounded-br-sm'
              : 'bg-[#F7F9F8] text-[#0E1B18] rounded-bl-sm border border-gray-100'
          )}
          dangerouslySetInnerHTML={{
            __html: msg.content
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/\n/g, '<br />'),
          }}
        />
        <span suppressHydrationWarning className="text-[10px] text-gray-400 px-1">{msg.time}</span>
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
  const [open,      setOpen]      = useState(false)
  const [messages,  setMessages]  = useState<Message[]>(SEED_MESSAGES)
  const [input,     setInput]     = useState('')
  const [isTyping,  setIsTyping]  = useState(false)
  const [unread,    setUnread]    = useState(1)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setUnread(0)
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [open])

  function handleSend() {
    const text = input.trim()
    if (!text) return

    const now = formatTime()
    const userMsg: Message = {
      id:      Date.now().toString(),
      role:    'user',
      content: text,
      time:    now,
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    // Simulate AI response after delay
    setTimeout(() => {
      setIsTyping(false)
      const reply: Message = {
        id:      (Date.now() + 1).toString(),
        role:    'assistant',
        content: getMockReply(text),
        time:    formatTime(),
      }
      setMessages(prev => [...prev, reply])
    }, 1400)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* ── Floating window ───────────────────────────────────────── */}
      <div
        className={cn(
          'fixed bottom-20 right-5 z-50 w-[360px] bg-white rounded-3xl shadow-2xl border border-gray-100',
          'flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right',
          open
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none'
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
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4 scrollbar-light">
          {messages.map(msg => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Suggested prompts (show only when no user messages yet) */}
        {messages.filter(m => m.role === 'user').length === 0 && (
          <div className="px-4 pb-2 flex gap-2 flex-wrap">
            {['Any workers at risk?', 'Show compliance gaps', 'Summarize today'].map(p => (
              <button
                key={p}
                onClick={() => { setInput(p); inputRef.current?.focus() }}
                className="px-3 py-1.5 bg-[#F7F9F8] hover:bg-gray-100 border border-gray-100 rounded-full text-[11px] text-gray-600 font-medium transition-colors"
              >
                {p}
              </button>
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
              disabled={!input.trim() || isTyping}
              aria-label="Send message"
              className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors',
                input.trim() && !isTyping
                  ? 'bg-[#00D15A] text-white hover:bg-[#00b84f]'
                  : 'bg-gray-100 text-gray-300'
              )}
            >
              {isTyping
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Send className="w-3.5 h-3.5" />}
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
          'fixed bottom-5 right-5 z-50 w-13 h-13 rounded-2xl shadow-lg',
          'flex items-center justify-center transition-all duration-200',
          'hover:scale-105 active:scale-95',
          open ? 'bg-[#0C2A1F]' : 'bg-[#00D15A]'
        )}
        style={{ width: 52, height: 52 }}
      >
        {open
          ? <X className="w-5 h-5 text-white" />
          : <MessageSquare className="w-5 h-5 text-white" />}

        {/* Unread badge */}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>
    </>
  )
}

/* ── Mock reply generator ───────────────────────────────────────── */
function getMockReply(input: string): string {
  const q = input.toLowerCase()

  if (q.includes('risk') || q.includes('danger') || q.includes('alert'))
    return 'Based on current readings, Zone B has the highest heat index at 43.1°C. I recommend rotating workers every 45 minutes and ensuring water stations are restocked. 3 workers are currently flagged for monitoring.'

  if (q.includes('compliance'))
    return 'Current compliance score is **86%**. The 14% gap is primarily in Zone C — 4 workers missed their morning hydration check-in. I can generate a compliance report if needed.'

  if (q.includes('summary') || q.includes('today'))
    return 'Today\'s summary:\n\n• **250 / 276** workers on shift\n• **3** open incidents\n• **86%** compliance score\n• Peak WBGT: 40.5°C at 13:00\n• No critical emergencies in the last 2 hours ✓'

  if (q.includes('weather') || q.includes('forecast') || q.includes('temperature'))
    return 'Today\'s forecast shows temperatures peaking at ~43°C around 14:00–15:00 Dubai time. Expected worker efficiency will drop to ~55% during peak hours. Consider shifting heavy work to early morning.'

  if (q.includes('water') || q.includes('hydration'))
    return 'Hydration check: 18 workers have not logged a water break in the past 90 minutes. Under UAE heat safety guidelines, breaks are required every 45 minutes above 35°C. Should I send an automated reminder?'

  return 'I\'m processing that request. In a live deployment, I\'d query your Supabase data in real-time to give you an accurate answer. For now, I\'m running on mock data — but the interface is fully wired for LLM integration!'
}
