import React, { useState, useMemo } from 'react'
import {
  Bell, CheckCheck, Settings, X, Sparkles, AlertTriangle, MessageSquare,
  ShoppingCart, ArrowRight, Check, Trash2, Sliders, Volume2, ShieldCheck,
  Zap, Clock, PackageCheck, AlertCircle, RefreshCw, CheckCircle2
} from 'lucide-react'
import { NotificationItem, Page } from './types/navigation'

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'ai',
    typeLabel: 'Yapay Zeka Teklif Uyarısı (AI Insight)',
    title: 'AI Fiyat & Risk Analizi Tamamlandı',
    message: 'Yeni teklif için AI fiyat analizi tamamlandı: 2018 Case IH Maxxum 125',
    timeAgo: '3 dk önce',
    timestamp: '2026-09-01T10:27:00',
    isRead: false,
    badgeColor: 'purple',
    actionLabel: 'Teklifi İncele',
    deepLink: {
      page: 'Teklif Kontrolü (AI)',
      params: { quote_id: '892', quote_no: 'TKL-1001', model: '2018 Case IH Maxxum 125' }
    },
    extraMeta: {
      confidence: 96,
      quoteId: '892'
    }
  },
  {
    id: 'notif-2',
    type: 'stock',
    typeLabel: 'Kritik Stok Uyarısı',
    title: 'Minimum Stok Seviyesi Aşıldı',
    message: 'Orijinal Yağ Filtresi (NH-342) kritik seviyenin (3 adet) altına düştü.',
    timeAgo: '18 dk önce',
    timestamp: '2026-09-01T10:12:00',
    isRead: false,
    badgeColor: 'red',
    actionLabel: 'Sipariş Oluştur',
    deepLink: {
      page: 'Stok Takibi',
      params: { filter: 'critical', sku: 'NH-342', product_name: 'Orijinal Yağ Filtresi (NH-342)' }
    },
    extraMeta: {
      sku: 'NH-342'
    }
  },
  {
    id: 'notif-3',
    type: 'complaint',
    typeLabel: 'Müşteri Şikayet & Destek',
    title: 'Acil Arıza & Destek Talebi',
    message: 'Mehmet Kaya - Hidrolik arıza bildirimi acil statüsünde oluşturuldu.',
    timeAgo: '42 dk önce',
    timestamp: '2026-09-01T09:48:00',
    isRead: false,
    badgeColor: 'amber',
    actionLabel: 'Talebi Yanıtla',
    deepLink: {
      page: 'Şikayet & Talep',
      params: { ticket_id: '14', customer: 'Mehmet Kaya', subject: 'Hidrolik Arıza' }
    },
    extraMeta: {
      ticketId: '14'
    }
  },
  {
    id: 'notif-4',
    type: 'order',
    typeLabel: 'Yeni Sipariş & Satış Fırsatı',
    title: 'Yeni Teklif Talebi (Web Formu)',
    message: 'Web formundan 1 adet Ekim Makinesi için yeni fiyat teklifi talebi geldi.',
    timeAgo: '1.5 saat önce',
    timestamp: '2026-09-01T09:00:00',
    isRead: false,
    badgeColor: 'blue',
    actionLabel: 'Teklif Hazırla',
    deepLink: {
      page: 'Sipariş & Teklifler',
      params: { new: true, lead_id: '301', product: 'Ekim Makinesi' }
    },
    extraMeta: {
      leadId: '301'
    }
  }
]

interface AgroNotificationDrawerProps {
  isOpen: boolean
  onClose: () => void
  notifications: NotificationItem[]
  onMarkAllAsRead: () => void
  onMarkAsRead: (id: string) => void
  onDeleteNotification: (id: string) => void
  onNavigate: (page: Page, params?: Record<string, string | number | boolean>) => void
}

export default function AgroNotificationDrawer({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onMarkAsRead,
  onDeleteNotification,
  onNavigate
}: AgroNotificationDrawerProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'ai' | 'stock' | 'customer'>('all')
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [settings, setSettings] = useState({
    aiInsights: true,
    criticalStock: true,
    serviceAlerts: true,
    customerRequests: true,
    soundEnabled: true
  })

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length
  }, [notifications])

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      if (activeCategory === 'ai') return item.type === 'ai'
      if (activeCategory === 'stock') return item.type === 'stock' || item.type === 'order'
      if (activeCategory === 'customer') return item.type === 'complaint'
      return true
    })
  }, [notifications, activeCategory])

  const handleAction = (item: NotificationItem) => {
    onMarkAsRead(item.id)
    onClose()
    onNavigate(item.deepLink.page, item.deepLink.params)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Slide-over backdrop */}
      <div className="drawer-backdrop" onClick={onClose} />

      <aside
        className="agro-notification-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Bildirimler Çekmecesi"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-title-area">
            <div className="drawer-bell-icon">
              <Bell size={18} />
              {unreadCount > 0 && <span className="drawer-unread-dot" />}
            </div>
            <div>
              <h3>Duyurular &amp; Bildirimler</h3>
              <p>Operasyonel uyarılar ve akıllı ajan bildirimleri</p>
            </div>
          </div>

          <div className="drawer-header-actions">
            <button
              type="button"
              className="drawer-icon-btn"
              onClick={() => setShowSettingsModal(true)}
              title="Bildirim Ayarları"
            >
              <Settings size={17} />
            </button>
            <button
              type="button"
              className="drawer-icon-btn close"
              onClick={onClose}
              title="Çekmeceyi Kapat"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Quick Toolbar (Mark all as read & Counter) */}
        <div className="drawer-toolbar">
          <div className="drawer-status-chip">
            <span className="dot-live" />
            <b>{unreadCount} Okunmamış</b>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              className="mark-all-read-btn"
              onClick={onMarkAllAsRead}
            >
              <CheckCheck size={14} />
              <span>Tümünü Okundu Say</span>
            </button>
          )}
        </div>

        {/* Category Tabs */}
        <div className="drawer-tabs">
          <button
            type="button"
            className={`drawer-tab-btn ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            Tümü ({notifications.length})
          </button>
          <button
            type="button"
            className={`drawer-tab-btn ${activeCategory === 'ai' ? 'active' : ''}`}
            onClick={() => setActiveCategory('ai')}
          >
            <Sparkles size={12} /> Yapay Zeka
          </button>
          <button
            type="button"
            className={`drawer-tab-btn ${activeCategory === 'stock' ? 'active' : ''}`}
            onClick={() => setActiveCategory('stock')}
          >
            <AlertTriangle size={12} /> Stok &amp; Sipariş
          </button>
          <button
            type="button"
            className={`drawer-tab-btn ${activeCategory === 'customer' ? 'active' : ''}`}
            onClick={() => setActiveCategory('customer')}
          >
            <MessageSquare size={12} /> Müşteri &amp; Destek
          </button>
        </div>

        {/* Notification List */}
        <div className="drawer-list">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((item) => {
              const isAi = item.type === 'ai'
              const isStock = item.type === 'stock'
              const isComplaint = item.type === 'complaint'
              const isOrder = item.type === 'order'

              return (
                <div
                  key={item.id}
                  className={`notification-card ${item.isRead ? 'read' : 'unread'} type-${item.type}`}
                >
                  <div className="notif-top">
                    <div className="notif-type-tag">
                      <span className={`notif-type-icon ${item.badgeColor}`}>
                        {isAi && <Sparkles size={13} />}
                        {isStock && <AlertTriangle size={13} />}
                        {isComplaint && <MessageSquare size={13} />}
                        {isOrder && <ShoppingCart size={13} />}
                      </span>
                      <span className="notif-type-text">{item.typeLabel}</span>
                    </div>

                    <div className="notif-actions-top">
                      <span className="notif-time">
                        <Clock size={11} /> {item.timeAgo}
                      </span>
                      {!item.isRead && (
                        <button
                          type="button"
                          className="notif-mark-read"
                          onClick={() => onMarkAsRead(item.id)}
                          title="Okundu olarak işaretle"
                        >
                          <Check size={13} />
                        </button>
                      )}
                      <button
                        type="button"
                        className="notif-delete"
                        onClick={() => onDeleteNotification(item.id)}
                        title="Bildirimi sil"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="notif-body">
                    <h4 className="notif-title">{item.title}</h4>
                    <p className="notif-message">{item.message}</p>

                    {item.extraMeta?.confidence && (
                      <div className="notif-confidence-bar">
                        <span>AI Güven Skoru: <b>%{item.extraMeta.confidence}</b></span>
                        <div className="conf-track">
                          <div
                            className="conf-fill"
                            style={{ width: `${item.extraMeta.confidence}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="notif-footer">
                    <button
                      type="button"
                      className="notif-action-btn"
                      onClick={() => handleAction(item)}
                    >
                      <span>{item.actionLabel}</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="drawer-empty-state">
              <div className="drawer-empty-icon-wrap">
                <CheckCircle2 size={36} />
              </div>
              <h4>Harika! Bugün için bekleyen aksiyon bulunmuyor.</h4>
              <p>Tüm sistem bildirimleri incelendi ve operasyonlar güncel durumda.</p>
            </div>
          )}
        </div>

        {/* Drawer Footer Info */}
        <div className="drawer-footer-bar">
          <span>AgroPlus Canlı Bildirim Sistemi · V3.2</span>
          <button
            type="button"
            className="drawer-quick-pref-btn"
            onClick={() => setShowSettingsModal(true)}
          >
            <Sliders size={13} /> Tercihler
          </button>
        </div>

        {/* Notification Settings Modal */}
        {showSettingsModal && (
          <div className="settings-modal-overlay" onClick={() => setShowSettingsModal(false)}>
            <div className="settings-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="settings-modal-header">
                <div className="settings-title-row">
                  <Sliders size={18} />
                  <h4>Bildirim ve Uyarı Ayarları</h4>
                </div>
                <button
                  type="button"
                  className="cal-close-btn"
                  onClick={() => setShowSettingsModal(false)}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="settings-modal-body">
                <label className="pref-toggle-item">
                  <div>
                    <b>Yapay Zeka Teklif &amp; Risk Bildirimleri</b>
                    <small>Fiyat, kar marjı ve model uyumluluğu AI analiz sonuçları</small>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.aiInsights}
                    onChange={(e) =>
                      setSettings({ ...settings, aiInsights: e.target.checked })
                    }
                  />
                </label>

                <label className="pref-toggle-item">
                  <div>
                    <b>Kritik Stok ve Parça İhtiyaç Uyarıları</b>
                    <small>Minimum stok seviyesinin altına inen OEM parçalar</small>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.criticalStock}
                    onChange={(e) =>
                      setSettings({ ...settings, criticalStock: e.target.checked })
                    }
                  />
                </label>

                <label className="pref-toggle-item">
                  <div>
                    <b>Servis &amp; Saha Görev Randevuları</b>
                    <small>Yaklaşan bakım ve saha teslimat hatırlatmaları</small>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.serviceAlerts}
                    onChange={(e) =>
                      setSettings({ ...settings, serviceAlerts: e.target.checked })
                    }
                  />
                </label>

                <label className="pref-toggle-item">
                  <div>
                    <b>Müşteri Şikayet &amp; Acil Destek Talepleri</b>
                    <small>Yeni gelen yüksek öncelikli servis talepleri</small>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.customerRequests}
                    onChange={(e) =>
                      setSettings({ ...settings, customerRequests: e.target.checked })
                    }
                  />
                </label>

                <label className="pref-toggle-item">
                  <div>
                    <b>Sesli Bildirim ve Anlık Popover Uyarısı</b>
                    <small>Önemli aksiyonlar geldiğinde hafif ses tonu çal</small>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={(e) =>
                      setSettings({ ...settings, soundEnabled: e.target.checked })
                    }
                  />
                </label>
              </div>

              <div className="settings-modal-footer">
                <button
                  type="button"
                  className="primary"
                  onClick={() => setShowSettingsModal(false)}
                >
                  <Check size={14} /> Tercihleri Kaydet
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
