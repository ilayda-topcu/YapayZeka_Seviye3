import React, { useState, useRef, useEffect } from 'react'
import {
  Bot, Send, Sparkles, Database, FileText, CheckCircle2,
  AlertTriangle, RefreshCw, Trash2, ArrowRight, CornerDownLeft,
  Search, ShieldCheck, TicketCheck, MessageSquare, Wrench, Package, Tractor, Users
} from 'lucide-react'
import { Page } from './types/navigation'

interface ChatMessage {
  id: string
  sender: 'bot' | 'user'
  text: string
  timestamp: string
  isNotFound?: boolean
  pendingTicketInfo?: {
    subject: string
    description: string
    query: string
  }
  ticketCreated?: boolean
  ticketNo?: string
}

interface HelpChatbotAgentProps {
  onNavigate?: (page: Page, params?: Record<string, any>) => void
}

const QUICK_PROMPTS = [
  {
    icon: Tractor,
    title: 'Traktör & Makine Modelleri',
    prompt: 'Veritabanındaki Case IH ve New Holland traktör modellerini listele.'
  },
  {
    icon: Package,
    title: 'Kritik Yedek Parça Stokları',
    prompt: 'Stokta azalan veya kritik seviyedeki yedek parçalar hangileridir?'
  },
  {
    icon: Wrench,
    title: 'Aktif Servis Kayıtları',
    prompt: 'Şu anda işlem bekleyen veya devam eden servis kayıtları nelerdir?'
  },
  {
    icon: Users,
    title: 'Müşteri & Teklif Sorgusu',
    prompt: 'Kayıtlı müşteriler ve açık teklif durumları hakkında bilgi ver.'
  },
  {
    icon: AlertTriangle,
    title: 'Olmayan Ürün (Talep Testi)',
    prompt: 'Claas Lexion 770 biçerdöver ve tabla parça stoğu var mı?'
  }
]

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api'

export default function HelpChatbotAgent({ onNavigate }: HelpChatbotAgentProps) {
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-init',
      sender: 'bot',
      text: 'Merhaba Selin Hanım! Ben **AgroPlus Veritabanı Yardım Asistanıyım (AI Agent)**.\n\n🔒 **Çalışma Prensibim:**\nSize **yalnızca** sistemimizdeki doğrulanmış canlı veritabanı kayıtları (Traktör modelleri, yedek parça stokları, müşteri profilleri, teklifler ve servis kayıtları) üzerinden yanıt veririm.\n\n⚠️ Aradığınız veya talep ettiğiniz bir ürün/bilgi veritabanımızda bulunamazsa, sizin onayınızla otomatik olarak **Talep-Şikayet Yönetimi** modülüne kayıt açabilirim.',
      timestamp: 'Bugün'
    }
  ])

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim()
    if (!query || isLoading) return

    const now = new Date()
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

    // Check if there is an active pending ticket in the last bot message
    const lastMsg = messages[messages.length - 1]
    const pendingInfo = lastMsg?.isNotFound ? lastMsg.pendingTicketInfo : undefined

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: timeStr
    }

    setMessages(prev => [...prev, userMsg])
    setInputMessage('')
    setIsLoading(true)

    try {
      const res = await fetch(`${API_BASE}/ai-assistant/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          sessionId: 'selin-aksoy',
          pendingTicketInfo: pendingInfo
        })
      })

      if (!res.ok) throw new Error('API request failed')

      const data = await res.json()

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: data.reply,
        timestamp: timeStr,
        isNotFound: data.isNotFound,
        pendingTicketInfo: data.isNotFound ? {
          subject: data.suggestedSubject,
          description: data.suggestedDescription,
          query
        } : undefined,
        ticketCreated: data.ticketCreated,
        ticketNo: data.ticketNo
      }

      setMessages(prev => [...prev, botMsg])
    } catch (err) {
      console.error('Chat error:', err)
      const errorMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        sender: 'bot',
        text: '⚠️ Veritabanı ve AI asistan servisiyle bağlantı kurulamadı. Lütfen sunucunun çalıştığından emin olun.',
        timestamp: timeStr
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTicketExplicitly = async (msg: ChatMessage) => {
    if (!msg.pendingTicketInfo || isLoading) return

    setIsLoading(true)
    const now = new Date()
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

    try {
      const res = await fetch(`${API_BASE}/ai-assistant/create-ticket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: msg.pendingTicketInfo.subject,
          description: msg.pendingTicketInfo.description,
          priority: 'MEDIUM',
          ticket_type: 'REQUEST'
        })
      })

      const data = await res.json()
      if (data.success) {
        // Update the previous message so action buttons disappear
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isNotFound: false } : m))

        const confirmMsg: ChatMessage = {
          id: `bot-ticket-${Date.now()}`,
          sender: 'bot',
          text: `✅ **Talebiniz Başarıyla Oluşturuldu!**\n\n• **Talep Kayıt No:** \`#${data.ticketNo}\`\n• **Konu:** ${msg.pendingTicketInfo.subject}\n• **Durum:** AÇIK (Operasyon ekibine iletildi)\n\nDetayları incelemek ve takip etmek için aşağıdaki butona tıklayarak Şikayet & Talep modülüne gidebilirsiniz.`,
          timestamp: timeStr,
          ticketCreated: true,
          ticketNo: data.ticketNo
        }
        setMessages(prev => [...prev, confirmMsg])
      }
    } catch (err) {
      console.error('Create ticket error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelTicket = (msgId: string) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isNotFound: false } : m))
  }

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'bot',
        text: 'Sohbet geçmişi temizlendi. Veritabanı kayıtları hakkında sormak istediğiniz yeni bir konuyu yazabilirsiniz.',
        timestamp: 'Şimdi'
      }
    ])
  }

  return (
    <div className="help-chatbot-container">
      {/* 🌟 HERO & CAPABILITY HEADER */}
      <div className="help-chatbot-hero">
        <div className="help-hero-content">
          <div className="help-hero-badge">
            <Sparkles size={14} />
            <span>Veritabanı Destekli AI Yardım Ajanı</span>
          </div>
          <h1>AgroPlus Yardım & Veritabanı Asistanı</h1>
          <p>
            Mevcut MariaDB veritabanındaki parçalar, traktörler, servisler, müşteriler ve teklif kayıtlarıyla çalışan akıllı operasyonel rehber.
          </p>
        </div>

        <div className="help-hero-badges-row">
          <div className="help-meta-chip active">
            <Database size={13} />
            <span>Canlı MariaDB Verisi</span>
          </div>
          <div className="help-meta-chip shield">
            <ShieldCheck size={13} />
            <span>Yalnızca Mevcut Verilerle Cevap</span>
          </div>
          <div className="help-meta-chip ticket">
            <TicketCheck size={13} />
            <span>Otomatik Talep / Şikayet Entegrasyonu</span>
          </div>
        </div>
      </div>

      {/* 💬 CHAT STREAM WRAPPER */}
      <div className="help-chat-card">
        <div className="help-chat-topbar">
          <div className="help-topbar-info">
            <div className="help-bot-avatar">
              <Bot size={20} />
              <span className="help-avatar-online" />
            </div>
            <div>
              <h3>AgroPlus Veritabanı Asistanı</h3>
              <span className="help-bot-sub">Role: Strict Database Grounded Assistant</span>
            </div>
          </div>

          <div className="help-topbar-actions">
            <button
              type="button"
              className="help-clear-btn"
              onClick={handleClearChat}
              title="Sohbeti Temizle"
            >
              <Trash2 size={15} />
              <span>Temizle</span>
            </button>
          </div>
        </div>

        {/* 📜 MESSAGES BODY */}
        <div className="help-chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`help-msg-row ${msg.sender}`}>
              {msg.sender === 'bot' && (
                <div className="help-msg-avatar">
                  <Bot size={18} />
                </div>
              )}

              <div className={`help-msg-bubble ${msg.sender}`}>
                <div className="help-msg-text">
                  {msg.text.split('\n').map((line, idx) => (
                    <p key={idx} style={{ margin: line ? '3px 0' : '8px 0' }}>
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

                {/* 🎫 INTERACTIVE TICKET CREATION CARD ON 'NOT FOUND' */}
                {msg.isNotFound && msg.pendingTicketInfo && (
                  <div className="help-ticket-action-box">
                    <div className="help-ticket-action-header">
                      <AlertTriangle size={18} className="text-amber-500" />
                      <div>
                        <b>Otomatik Talep / Şikayet Kaydı Açma Önerisi</b>
                        <p>Aranan bilgi sistemde bulunamadığı için talep açılabilir.</p>
                      </div>
                    </div>
                    <div className="help-ticket-action-buttons">
                      <button
                        type="button"
                        className="help-btn-create-ticket"
                        onClick={() => handleCreateTicketExplicitly(msg)}
                        disabled={isLoading}
                      >
                        <TicketCheck size={16} />
                        <span>Evet, Talep-Şikayet Kaydı Oluştur</span>
                      </button>
                      <button
                        type="button"
                        className="help-btn-cancel-ticket"
                        onClick={() => handleCancelTicket(msg.id)}
                        disabled={isLoading}
                      >
                        Vazgeç
                      </button>
                    </div>
                  </div>
                )}

                {/* 🚀 DEEP LINK BUTTON ON TICKET CREATED */}
                {msg.ticketCreated && onNavigate && (
                  <div className="help-ticket-success-box">
                    <button
                      type="button"
                      className="help-btn-view-complaints"
                      onClick={() => onNavigate('Şikayet & Talep')}
                    >
                      <span>Şikayet & Talep Modülünde Görüntüle</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                )}

                <span className="help-msg-time">{msg.timestamp}</span>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="help-msg-row bot">
              <div className="help-msg-avatar">
                <Bot size={18} />
              </div>
              <div className="help-typing-indicator">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ⚡ QUICK PROMPTS HORIZONTAL TRAY */}
        <div className="help-quick-tray">
          <span className="help-tray-label">Örnek Sorgular:</span>
          <div className="help-tray-list">
            {QUICK_PROMPTS.map((item, idx) => {
              const Icon = item.icon
              return (
                <button
                  key={idx}
                  type="button"
                  className="help-quick-chip"
                  onClick={() => handleSendMessage(item.prompt)}
                  disabled={isLoading}
                >
                  <Icon size={14} />
                  <span>{item.title}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ⌨️ INPUT FOOTER */}
        <div className="help-chat-footer">
          <div className="help-input-wrapper">
            <input
              ref={inputRef}
              type="text"
              className="help-chat-input"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              placeholder="Veritabanında parça, traktör modeli, servis veya müşteri sorgulayın..."
              disabled={isLoading}
            />
            <button
              type="button"
              className="help-send-btn"
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              title="Gönder (Enter)"
            >
              <Send size={16} />
            </button>
          </div>
          <div className="help-input-hint">
            <span>💡 İpucu: Aranan bilgi veritabanında yoksa direkt <b>"Evet"</b> yazarak veya butona basarak talep oluşturabilirsiniz.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
