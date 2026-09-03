export type Page =
  | 'Genel Bakış'
  | 'Markalar'
  | 'Ürünler'
  | 'Stok Takibi'
  | 'Müşteriler'
  | 'Sipariş & Teklifler'
  | 'Teklif Kontrolü (AI)'
  | 'Sosyal Medya İçeriği Üret'
  | 'Yardım Chatbotu (AI)'
  | 'Tamir & Bakım'
  | 'Şikayet & Talep'
  | 'Depolar'
  | 'Analiz & Raporlama'
  | 'Saha İşleri'
  | 'Şubeler'
  | 'Kullanıcı Yönetimi'
  | 'Yapay Zeka Ajanları'

export interface DeepLinkState {
  page: Page
  params?: Record<string, string | number | boolean>
}

export interface CalendarEventItem {
  id: string
  date: string // YYYY-MM-DD
  time: string
  title: string
  category: 'service' | 'field' | 'delivery'
  categoryLabel: string
  customer?: string
  machine?: string
  location?: string
  isOverdue?: boolean
  deepLink: DeepLinkState
  actionLabel: string
}

export interface NotificationItem {
  id: string
  type: 'ai' | 'stock' | 'complaint' | 'order'
  typeLabel: string
  title: string
  message: string
  timeAgo: string
  timestamp: string
  isRead: boolean
  badgeColor: 'purple' | 'red' | 'amber' | 'blue' | 'green'
  deepLink: DeepLinkState
  actionLabel: string
  extraMeta?: {
    confidence?: number
    sku?: string
    ticketId?: string
    leadId?: string
    quoteId?: string
  }
}
