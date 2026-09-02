import { useEffect, useState } from 'react'
import {
  ShoppingCart, FileText, Zap, Plus, Search, ChevronDown, MoreHorizontal,
  CheckCircle2, Clock, AlertTriangle, ArrowUpRight, TrendingUp, Filter, RefreshCw
} from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api'

type TabType = 'all' | 'orders' | 'quotes'

interface OrderItem {
  id: string
  type: 'ORDER' | 'QUOTE'
  no: string
  customer: string
  amount: string
  rawAmount: number
  status: string
  date: string
  note?: string
}

const fallbackCombinedList: OrderItem[] = [
  { id: '1', type: 'ORDER', no: 'SIP-20260901-001', customer: 'Tarım Teknoloji A.Ş.', amount: '₺64.500', rawAmount: 64500, status: 'TAMAMLANDI', date: '2026-09-01' },
  { id: '2', type: 'QUOTE', no: 'TKL-1001', customer: 'Bereket Tarım Ltd.', amount: '₺48.750', rawAmount: 48750, status: 'BEKLEMEDE (AI)', date: '2026-09-01' },
  { id: '3', type: 'ORDER', no: 'SIP-20260831-004', customer: 'Yeşil Toprak Çiftliği', amount: '₺32.200', rawAmount: 32200, status: 'HAZIRLANIYOR', date: '2026-08-31' },
  { id: '4', type: 'QUOTE', no: 'TKL-1002', customer: 'Güven Çiftliği', amount: '₺12.400', rawAmount: 12400, status: 'BEKLEMEDE (AI)', date: '2026-08-31' },
  { id: '5', type: 'ORDER', no: 'SIP-20260830-002', customer: 'Mekanik Tarım Ltd.', amount: '₺89.900', rawAmount: 89900, status: 'TAMAMLANDI', date: '2026-08-30' },
  { id: '6', type: 'QUOTE', no: 'TKL-0999', customer: 'Anadolu Kooperatifi', amount: '₺115.000', rawAmount: 115000, status: 'ONAYLANDI', date: '2026-08-29' }
]

export default function OrdersAndQuotes({ onNavigateToQuoteControl }: { onNavigateToQuoteControl: () => void }) {
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [orders, setOrders] = useState<string[][]>([])
  const [quotes, setQuotes] = useState<string[][]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [ordersRes, quotesRes] = await Promise.all([
          fetch(`${API_BASE}/orders`).then(r => r.ok ? r.json() : null),
          fetch(`${API_BASE}/quotes`).then(r => r.ok ? r.json() : null)
        ])
        if (ordersRes?.rows) setOrders(ordersRes.rows)
        if (quotesRes?.rows) setQuotes(quotesRes.rows)
      } catch (err) {
        console.warn('Orders & quotes fetch fallback', err)
      }
      setLoading(false)
    }
    load()
  }, [])

  // Birleştirilmiş liste oluşturma
  const combinedData: OrderItem[] = []

  orders.forEach((row, idx) => {
    combinedData.push({
      id: `ord-${idx}`,
      type: 'ORDER',
      no: row[0] || `SIP-${idx}`,
      customer: row[1] || 'Müşteri',
      amount: row[2] || '₺0',
      rawAmount: parseFloat((row[2] || '0').replace(/[^0-9.-]+/g, '')) || 0,
      status: row[3] || 'TAMAMLANDI',
      date: '2026-09-01'
    })
  })

  quotes.forEach((row, idx) => {
    combinedData.push({
      id: `qut-${idx}`,
      type: 'QUOTE',
      no: row[0] || `TKL-${idx}`,
      customer: row[1] || 'Müşteri',
      amount: row[2] || '₺0',
      rawAmount: parseFloat((row[2] || '0').replace(/[^0-9.-]+/g, '')) || 0,
      status: row[3] || 'BEKLEMEDE',
      date: row[4] || '2026-09-01'
    })
  })

  const displayList = (combinedData.length > 0 ? combinedData : fallbackCombinedList)
    .filter(item => {
      if (activeTab === 'orders' && item.type !== 'ORDER') return false
      if (activeTab === 'quotes' && item.type !== 'QUOTE') return false
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        return item.no.toLowerCase().includes(term) || item.customer.toLowerCase().includes(term)
      }
      return true
    })

  const totalOrdersCount = combinedData.filter(i => i.type === 'ORDER').length || 12
  const totalQuotesCount = combinedData.filter(i => i.type === 'QUOTE').length || 6
  const pendingQuotesCount = combinedData.filter(i => i.type === 'QUOTE' && (i.status.includes('BEKLE') || i.status.includes('PENDING'))).length || 2

  return (
    <div>
      {/* Hero & Aksiyonlar */}
      <div className="hero page-hero">
        <div>
          <span className="eyebrow">Satış &amp; Teklif Yönetimi · Birleşik Görünüm</span>
          <h1>Siparişler ve Teklifler</h1>
          <p>Müşteri siparişlerini, açık teklifleri ve AI teklif onay süreçlerini tek bir merkezden yönetin.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="primary"
            onClick={onNavigateToQuoteControl}
            style={{ backgroundColor: '#143e2c', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Zap size={16} color="#4caf50" /> AI Teklif Kontrol Paneli
          </button>
          <button className="primary">
            <Plus size={18} /> Yeni İşlem
          </button>
        </div>
      </div>

      {/* KPI İstatistik Kartları */}
      <section className="stats">
        <div className="stat-card">
          <span className="stat-icon"><ShoppingCart size={20} /></span>
          <div>
            <p>Toplam Siparişler</p>
            <strong>{totalOrdersCount} Adet</strong>
            <small><TrendingUp size={13} /> %14,2 bu ay artış</small>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon" style={{ backgroundColor: '#fff3e0', color: '#e65100' }}>
            <FileText size={20} />
          </span>
          <div>
            <p>Aktif / Bekleyen Teklifler</p>
            <strong>{totalQuotesCount} Teklif ({pendingQuotesCount} Bekleyen)</strong>
            <small style={{ color: '#e65100' }}><Clock size={13} /> AI onayı bekleniyor</small>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon" style={{ backgroundColor: '#e8f5e9', color: '#2e7d32' }}>
            <Zap size={20} />
          </span>
          <div>
            <p>AI Teklif Onay Oranı</p>
            <strong>%94,8</strong>
            <small><CheckCircle2 size={13} /> Otomatik siparişe aktarım</small>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon" style={{ backgroundColor: '#e3f2fd', color: '#1565c0' }}>
            <TrendingUp size={20} />
          </span>
          <div>
            <p>Aylık Toplam Hacim</p>
            <strong>₺1.248.500</strong>
            <small><ArrowUpRight size={13} /> 30 günlük ciro</small>
          </div>
        </div>
      </section>

      {/* Sekmeler & Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        {/* Sekme Butonları */}
        <div style={{ display: 'flex', gap: 6, backgroundColor: '#e8eee9', padding: 4, borderRadius: 8 }}>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            style={{
              padding: '7px 14px',
              borderRadius: 6,
              border: 0,
              backgroundColor: activeTab === 'all' ? '#fff' : 'transparent',
              color: activeTab === 'all' ? '#143e2c' : '#55695c',
              fontWeight: 700,
              fontSize: 12,
              cursor: 'pointer',
              boxShadow: activeTab === 'all' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            Tüm Kayıtlar ({displayList.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            style={{
              padding: '7px 14px',
              borderRadius: 6,
              border: 0,
              backgroundColor: activeTab === 'orders' ? '#fff' : 'transparent',
              color: activeTab === 'orders' ? '#143e2c' : '#55695c',
              fontWeight: 700,
              fontSize: 12,
              cursor: 'pointer',
              boxShadow: activeTab === 'orders' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            📦 Siparişler ({totalOrdersCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('quotes')}
            style={{
              padding: '7px 14px',
              borderRadius: 6,
              border: 0,
              backgroundColor: activeTab === 'quotes' ? '#fff' : 'transparent',
              color: activeTab === 'quotes' ? '#143e2c' : '#55695c',
              fontWeight: 700,
              fontSize: 12,
              cursor: 'pointer',
              boxShadow: activeTab === 'quotes' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            📑 Teklifler ({totalQuotesCount})
          </button>
        </div>

        {/* Arama & Filtre */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className="search" style={{ width: 260 }}>
            <Search size={16} />
            <input
              placeholder="Numara veya müşteri ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="filter">
            <Filter size={15} /> Filtrele <ChevronDown size={14} />
          </button>
        </div>
      </div>

      {/* Birleşik Tablo */}
      <section className="card data-card">
        <div className="section-head">
          <div>
            <h2>
              {activeTab === 'all' ? 'Tüm Sipariş ve Teklif Listesi' : activeTab === 'orders' ? 'Siparişler Listesi' : 'Teklifler Listesi'}
            </h2>
            <p>Toplam {displayList.length} işlem kaydı görüntüleniyor</p>
          </div>
          <button className="icon-btn"><MoreHorizontal size={20} /></button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tür</th>
                <th>İşlem / Belge No</th>
                <th>Müşteri / Kurum</th>
                <th>Tutar</th>
                <th>Durum</th>
                <th>Tarih / Geçerlilik</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {displayList.map((item) => {
                const isQuote = item.type === 'QUOTE'
                const isPending = item.status.includes('BEKLE') || item.status.includes('PENDING')
                const isApproved = item.status.includes('TAMAM') || item.status.includes('ONAY') || item.status.includes('CONVERT')

                return (
                  <tr key={item.id}>
                    <td>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '3px 7px',
                        borderRadius: 4,
                        backgroundColor: isQuote ? '#fff3e0' : '#e8f5e9',
                        color: isQuote ? '#e65100' : '#2e7d32'
                      }}>
                        {isQuote ? <FileText size={12} /> : <ShoppingCart size={12} />}
                        {isQuote ? 'TEKLİF' : 'SİPARİŞ'}
                      </span>
                    </td>
                    <td>
                      <b style={{ color: '#1e382b' }}>{item.no}</b>
                    </td>
                    <td>{item.customer}</td>
                    <td>
                      <b>{item.amount}</b>
                    </td>
                    <td>
                      <span className={`pill ${isApproved ? 'green' : isPending ? 'orange' : 'blue'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ color: '#77887d', fontSize: 11 }}>{item.date}</td>
                    <td>
                      {isQuote && isPending ? (
                        <button
                          onClick={onNavigateToQuoteControl}
                          style={{
                            border: '1px solid #c8e6c9',
                            backgroundColor: '#f1f8f2',
                            color: '#2e7d32',
                            padding: '4px 8px',
                            borderRadius: 6,
                            fontSize: 10,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 3
                          }}
                        >
                          <Zap size={11} /> AI İncele
                        </button>
                      ) : (
                        <button className="more">
                          <MoreHorizontal size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {displayList.length === 0 && (
            <p style={{ textAlign: 'center', padding: 30, color: '#888', fontSize: 12 }}>
              Arama kriterlerine uygun kayıt bulunamadı.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
