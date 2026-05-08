'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status } = useChat()
  const isLoading = status === 'submitted' || status === 'streaming'

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || isLoading) return
    sendMessage({ text })
    setInput('')
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#00D26A] rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors z-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 w-[350px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 z-50">

      {/* Header */}
      <div className="bg-[#0B3B24] text-white p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#00D26A] rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" />
              <path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-sm">HeatGuard AI</h3>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-[#00D26A] rounded-full" />
              <p className="text-xs text-gray-300">Online • Safety Assistant</p>
            </div>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 h-[380px] p-4 overflow-y-auto flex flex-col gap-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center text-sm text-gray-500 mt-4 px-4">
            Hello! I&apos;m your HeatGuard AI Assistant. I can help you monitor worker safety, analyze heat stress data, and flag compliance risks. How can I help you today?
          </div>
        )}

        {messages.map(m => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 text-sm shadow-sm ${
              m.role === 'user'
                ? 'bg-[#00D26A] text-white rounded-2xl rounded-br-sm'
                : 'bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-bl-sm'
            }`}>
              {m.parts
                .filter(p => p.type === 'text')
                .map((p, i) => <span key={i}>{(p as { type: 'text'; text: string }).text}</span>)
              }
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm p-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-100">
        <div className="relative flex items-center">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about workers, alerts, compliance..."
            className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-[#00D26A] focus:ring-1 focus:ring-[#00D26A] transition-all"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 p-2 text-gray-400 hover:text-[#00D26A] disabled:opacity-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <div className="text-[10px] text-center text-gray-400 mt-2">
          AI responses are illustrative. Verify critical decisions with live data.
        </div>
      </form>

    </div>
  )
}

export default AIChatbot
