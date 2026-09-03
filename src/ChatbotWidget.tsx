import React, { useState, useRef, useEffect } from 'react'
import {
  MessageSquare, X, Send, Bot, Sparkles, AlertCircle,
  CheckCircle2, CornerDownLeft, Minimize2, Wrench, Package, TrendingUp
} from 'lucide-react'

interface Message {
  id: string
  sender: 'bot' | 'user'
  text: string
  timestamp: string
}

const QUICK_PROMPTS = [
  { label: 'Kritik stoktaki parçalar', query: 'Kritik stok seviyesindeki parçaları listeler misin?' },
  { label: 'Bugün bekleyen servisler', query: 'Bugün bekleyen servis ve bakım randevuları nelerdir?' },
  { label: 'Traktör fiyat analizi yap', query: 'Traktör pazar fiyatı ve teklif analizi yap.' }
]

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api'

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: 'Merhaba Selin Hanım! Ben **AgroPlus Akıllı Asistanı**. Stoklar, yaklaşan bakımlar veya teklif analizleri hakkında size nasıl yardımcı olabilirim?',
      timestamp: 'Şimdi'
    }
  ])

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isLoading, isOpen])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 150)
    }
  }, [isOpen])

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim()
    if (!query || isLoading) return

    const now = new Date()
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

    // 1. Add User Message
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: timeStr
    }

    setMessages((prev) => [...prev, userMsg])
    setInputMessage('')
    setIsLoading(true)

    // 2. Call Backend API
    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: query })
      })

      if (!res.ok) {
        throw new Error('API Response Error')
      }

      const data = await res.json()
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: data.reply || 'İşleminiz tamamlandı.',
        timestamp: timeStr
      }
      setMessages((prev) => [...prev, botMsg])
    } catch (err) {
      console.warn('Chatbot API request failed', err)
      const errorMsg: Message = {
        id: `bot-err-${Date.now()}`,
        sender: 'bot',
        text: 'Bağlantı sağlanamadı, lütfen tekrar deneyin.',
        timestamp: timeStr
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <>
      {/* 💬 Yüzen Tetikleyici Buton (Floating Trigger Button) */}
      <button
        type="button"
        className={`agro-chatbot-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        title={isOpen ? 'Sohbeti Kapat' : 'AgroPlus AI Asistanı ile Konuş'}
        aria-label="AgroPlus AI Asistanı"
      >
        <div className="agro-chatbot-trigger-inner">
          {isOpen ? <X size={24} /> : <Bot size={26} />}
        </div>
        {!isOpen && <span className="agro-chat-online-badge" />}
      </button>

      {/* 🪟 Sohbet Penceresi (Chat Window) */}
      {isOpen && (
        <div className="agro-chatbot-window">
          {/* Üst Bar (Header) */}
          <div className="agro-chatbot-header">
            <div className="agro-chatbot-header-info">
              <div className="agro-chatbot-avatar">
                <Bot size={20} />
                <span className="agro-avatar-online-dot" />
              </div>
              <div>
                <h3 className="agro-chatbot-title">AgroPlus AI Asistan</h3>
                <span className="agro-chatbot-status">Çevrimiçi · Tarım & Servis Destek</span>
              </div>
            </div>
            <button
              type="button"
              className="agro-chatbot-close-btn"
              onClick={() => setIsOpen(false)}
              title="Kapat"
              aria-label="Kapat"
            >
              <Minimize2 size={16} />
            </button>
          </div>

          {/* Mesaj Alanı (Chat Body) */}
          <div className="agro-chatbot-body">
            {messages.map((msg) => (
              <div key={msg.id} className={`agro-chat-bubble-wrap ${msg.sender}`}>
                {msg.sender === 'bot' && (
                  <div className="agro-chat-bot-icon">
                    <Sparkles size={14} />
                  </div>
                )}
                <div className={`agro-chat-bubble ${msg.sender}`}>
                  <div className="agro-chat-text">
                    {msg.text.split('\n').map((line, idx) => (
                      <p key={idx} style={{ margin: line ? '2px 0' : '6px 0' }}>
                        {line.startsWith('• ') ? (
                          <span>{line}</span>
                        ) : line.startsWith('**') || line.includes('**') ? (
                          line.split('**').map((part, pIdx) => (
                            pIdx % 2 === 1 ? <strong key={pIdx}>{part}</strong> : part
                          ))
                        ) : (
                          line
                        )}
                      </p>
                    ))}
                  </div>
                  <span className="agro-chat-timestamp">{msg.timestamp}</span>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="agro-chat-bubble-wrap bot">
                <div className="agro-chat-bot-icon">
                  <Sparkles size={14} />
                </div>
                <div className="agro-chat-typing-indicator">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Hızlı Soru Hapları (Quick Prompts) */}
          <div className="agro-chatbot-quick-prompts">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                className="agro-quick-prompt-chip"
                onClick={() => handleSendMessage(prompt.query)}
                disabled={isLoading}
              >
                {prompt.label}
              </button>
            ))}
          </div>

          {/* ⌨️ Girdi Alanı (Input Footer) */}
          <div className="agro-chatbot-footer">
            <input
              ref={inputRef}
              type="text"
              className="agro-chatbot-input"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Bir soru sorun veya işlem yazın..."
              disabled={isLoading}
            />
            <button
              type="button"
              className="agro-chatbot-send-btn"
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              title="Gönder"
              aria-label="Gönder"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
