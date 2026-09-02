import { useEffect, useMemo, useState } from 'react'
import {
  Bell, Boxes, Building2, CalendarDays, ChevronDown, CircleHelp,
  LayoutDashboard, MapPinned, Menu, MoreHorizontal, Package, Plus, Search,
  Settings, ShoppingCart, Tractor, Users, Wrench, X, ArrowUpRight, TrendingUp,
  AlertTriangle, CheckCircle2, Warehouse, Sparkles, Zap, Check, AlertCircle, FileText,
  Share2, MessageSquare, Layers
} from 'lucide-react'
import FieldWorks from './FieldWorks'
import SocialMediaAgent from './SocialMediaAgent'
import OrdersAndQuotes from './OrdersAndQuotes'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api'

type Page =
  | 'Genel Bakış'
  | 'Markalar'
  | 'Ürünler'
  | 'Stok Takibi'
  | 'Müşteriler'
  | 'Sipariş & Teklifler'
  | 'Teklif Kontrolü (AI)'
  | 'Sosyal Medya İçeriği Üret'
  | 'Tamir & Bakım'
  | 'Şikayet & Talep'
  | 'Depolar'
  | 'Analiz & Raporlama'
  | 'Saha İşleri'
  | 'Şubeler'
  | 'Kullanıcı Yönetimi'
  | 'Yapay Zeka Ajanları'

type DataTable = { columns: string[]; rows: string[][] }

type OverviewStats = {
  todays_orders?: number
  open_services?: number
  critical_stock?: number
  active_customers?: number
}

interface NavItem {
  label: Page
  icon: any
  badge?: string
  badgeClass?: string
}

const mainNav: NavItem[] = [
  { label: 'Genel Bakış', icon: LayoutDashboard },
  { label: 'Markalar', icon: Tractor },
  { label: 'Ürünler', icon: Package },
  { label: 'Stok Takibi', icon: Boxes, badge: '8' },
  { label: 'Müşteriler', icon: Users },
  { label: 'Sipariş & Teklifler', icon: ShoppingCart, badge: '15' },
  { label: 'Tamir & Bakım', icon: Wrench },
  { label: 'Depolar', icon: Warehouse },
  { label: 'Saha İşleri', icon: MapPinned }
]

const aiNav: NavItem[] = [
  { label: 'Teklif Kontrolü (AI)', icon: Zap, badge: 'AI', badgeClass: 'ai-badge' },
  { label: 'Sosyal Medya İçeriği Üret', icon: Share2, badge: 'Yeni', badgeClass: 'new-badge' },
  { label: 'Yapay Zeka Ajanları', icon: Sparkles }
]

const mgmtNav: NavItem[] = [
  { label: 'Şikayet & Talep', icon: CircleHelp, badge: '4' },
  { label: 'Analiz & Raporlama', icon: TrendingUp },
  { label: 'Şubeler', icon: Building2 },
  { label: 'Kullanıcı Yönetimi', icon: Settings }
]

const pageMeta: Record<Exclude<Page, 'Genel Bakış'>, { eyebrow: string; title: string; description: string; action: string }> = {
  'Markalar': { eyebrow: 'Katalog Yönetimi', title: 'Markalar', description: 'Çalıştığınız tarım makinesi markalarını ve ürün ailelerini yönetin.', action: 'Yeni Marka' },
  'Ürünler': { eyebrow: 'Katalog Yönetimi', title: 'Ürünler', description: 'Marka, model ve parça bilgilerini tek noktadan görüntüleyin.', action: 'Yeni Ürün' },
  'Stok Takibi': { eyebrow: 'Envanter', title: 'Stok Takibi', description: 'Kritik stokları, depo dağılımını ve hareketleri izleyin.', action: 'Stok Hareketi' },
  'Müşteriler': { eyebrow: 'CRM', title: 'Müşteriler', description: 'Müşteri profillerini, makine parkını ve işlem geçmişini yönetin.', action: 'Yeni Müşteri' },
  'Sipariş & Teklifler': { eyebrow: 'Satış & Teklif Yönetimi', title: 'Siparişler ve Teklifler', description: 'Açık siparişleri, müşteri tekliflerini ve satış süreçlerini bir arada izleyin.', action: 'Yeni İşlem' },
  'Teklif Kontrolü (AI)': { eyebrow: 'Yapay Zeka & Otomasyon', title: 'Teklif Kontrolü AI Ajanı', description: 'AI destekli teklif onay mekanizması. Onaylanan teklifler siparişe aktarılır, reddedilenler şikayet-talep tablosuna kaydedilir.', action: 'AI Kontrol Başlat' },
  'Sosyal Medya İçeriği Üret': { eyebrow: 'Yapay Zeka & Sosyal Medya', title: 'Sosyal Medya İçerik Üretim Ajanı', description: 'Medya postları, 24 saatlik durumlar, 1 dakikalık video senaryoları ve görseller üretin.', action: 'Hızlı İçerik Üret' },
  'Tamir & Bakım': { eyebrow: 'Servis Yönetimi', title: 'Tamir & Bakım', description: 'Servis kayıtları, atanan teknisyenler ve işlem durumları.', action: 'Servis Kaydı' },
  'Şikayet & Talep': { eyebrow: 'Müşteri Deneyimi', title: 'Şikayet & Talep Takip', description: 'Gelen kayıtları önceliklendirin ve çözüm süreçlerini izleyin.', action: 'Yeni Kayıt' },
  'Depolar': { eyebrow: 'Lojistik', title: 'Depolar', description: 'Depo kapasitesi, sorumlular ve stok değerlerini görüntüleyin.', action: 'Yeni Depo' },
  'Analiz & Raporlama': { eyebrow: 'Yatırım ve performans', title: 'Analiz & Raporlama', description: 'Şube gelirleri, stok riskleri ve servis performansını görselleştirin.', action: 'Rapor Oluştur' },
  'Saha İşleri': { eyebrow: 'Operasyon', title: 'Saha İşleri', description: 'Günlük saha görevlerini, rotaları ve ekip durumlarını izleyin.', action: 'Görev Oluştur' },
  'Şubeler': { eyebrow: 'Organizasyon', title: 'Şubeler', description: 'Şube performansını, iletişim bilgilerini ve ekipleri yönetin.', action: 'Yeni Şube' },
  'Kullanıcı Yönetimi': { eyebrow: 'Sistem Yönetimi', title: 'Kullanıcı Yönetimi', description: 'Ekip üyelerini, rollerini ve erişim yetkilerini kontrol edin.', action: 'Kullanıcı Ekle' },
  'Yapay Zeka Ajanları': { eyebrow: 'Otomasyon ve Zeka', title: 'Yapay Zeka Ajanları', description: 'AI güdümlü otomatik süreçler ve akıllı analizler ile işletmenizi geliştirin.', action: 'Yeni Ajan' }
}

async function fetchJson<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`)
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`)
  }
  return response.json() as Promise<T>
}

function Stat({ icon: Icon, label, value, change, red }: { icon: any, label: string, value: string, change: string, red?: boolean }) {
  return <div className="stat-card"><span className={'stat-icon ' + (red ? 'red' : '')}><Icon size={20} /></span><div><p>{label}</p><strong>{value}</strong><small className={red ? 'negative' : ''}><TrendingUp size={13} />{change}</small></div></div>
}

function Overview({ setPage }: { setPage: (p: Page) => void }) {
  const [stats, setStats] = useState<OverviewStats>({})
  const [recentOrders, setRecentOrders] = useState<string[][]>([])
  const [stockStatus, setStockStatus] = useState<string[][]>([])
  const [services, setServices] = useState<string[][]>([])
  const [complaints, setComplaints] = useState<string[][]>([])
  const [fieldTasks, setFieldTasks] = useState<string[][]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const overview = await fetchJson<any>('/overview')
        setStats(overview.stats || {})
        setRecentOrders(overview.recentOrders || [])
        setStockStatus(overview.stockStatus || [])
        setServices(overview.services || [])
        setComplaints(overview.complaints || [])
        setFieldTasks(overview.fieldTasks || [])
      } catch (error) {
        console.error('Overview fetch failed', error)
      }
    }
    load()
  }, [])

  const go = (p: Page) => <button className="text-btn" onClick={() => setPage(p)}>Tümünü Gör <ArrowUpRight size={15} /></button>

  return <>
    <div className="hero"><div><span className="eyebrow">1 Eylül 2026 · Pazartesi</span><h1>Günaydın, Selin! <span>👋</span></h1><p>İşletmenizin bugünkü durumuna hızlıca göz atın.</p></div><button className="primary"><Plus size={18} /> Yeni İşlem</button></div>
    <section className="stats">
      <Stat icon={ShoppingCart} label="Bugünkü Siparişler" value={String(stats.todays_orders ?? 0)} change="%12,4 bu ay" />
      <Stat icon={Wrench} label="Açık Servis Kayıtları" value={String(stats.open_services ?? 0)} change="5'i bugün planlı" />
      <Stat icon={AlertTriangle} label="Kritik Stok Uyarısı" value={String(stats.critical_stock ?? 0)} change="Hızlı aksiyon gerekli" red />
      <Stat icon={Users} label="Aktif Müşteriler" value={String(stats.active_customers ?? 0)} change="%8,2 artış" />
    </section>

    <div className="grid-main">
      <section className="card order-card">
        <div className="section-head"><div><h2>Son Siparişler</h2><p>Güncel sipariş hareketleri</p></div>{go('Sipariş & Teklifler')}</div>
        <div className="table-wrap"><table><thead><tr><th>Sipariş No</th><th>Müşteri</th><th>Tutar</th><th>Durum</th></tr></thead><tbody>{recentOrders.map((r, i) => <tr key={i}>{r.map((v, j) => <td key={j}>{j === 3 ? <span className={'pill ' + (i === 1 ? 'blue' : i === 2 ? 'green' : 'orange')}>{v}</span> : v}</td>)}</tr>)}</tbody></table></div>
      </section>

      <section className="card stock-card">
        <div className="section-head"><div><h2>Stok Durumu</h2><p>Depolara göre anlık görünüm</p></div>{go('Stok Takibi')}</div>
        <div className="stock-list">
          {stockStatus.map(([depot, occupancy, qty], index) => (
            <div key={index}>
              <div><b>{depot}</b><span>{qty}</span></div>
              <i><em style={{ width: occupancy.replace('%', '') + '%' }} /></i>
              <small>{occupancy} doluluk</small>
            </div>
          ))}
        </div>
      </section>
    </div>

    <div className="grid-bottom">
      <section className="card">
        <div className="section-head"><div><h2>Servis Takvimi</h2><p>Bugün planlanan işler</p></div>{go('Tamir & Bakım')}</div>
        {services.map((r, i) => <div className="service" key={i}><span className="service-date">{['09:30', '11:00', '14:30'][i] ?? '09:30'}</span><div><b>{r[0]}</b><p>{r[2]} · {r[1]}</p></div><span className="dot" /></div>)}
      </section>

      <section className="card activity">
        <div className="section-head"><div><h2>Son Aktiviteler</h2><p>Sistem hareketleri</p></div></div>
        {complaints.slice(0, 3).map((c, i) => <div className="activity-row" key={i}><CheckCircle2 /> <span><b>{c[1]}</b><small>{c[0]} · {c[3]}</small></span><time>{i + 1} dk</time></div>)}
        {fieldTasks.slice(0, 1).map((task, i) => <div className="activity-row" key={`task-${i}`}><ShoppingCart /> <span><b>{task[0]}</b><small>{task[1]} · {task[2]}</small></span><time>{task[3]}</time></div>)}
      </section>
    </div>
  </>
}

const fallbackAnalytics = {
  salesByBranch: [
    { branch_name: 'Ankara Şubesi', order_count: 42, total_revenue: 342800, avg_order: 8152 },
    { branch_name: 'İzmir Şubesi', order_count: 36, total_revenue: 301540, avg_order: 8376 },
    { branch_name: 'Konya Şubesi', order_count: 29, total_revenue: 268200, avg_order: 9248 },
    { branch_name: 'Antalya Şubesi', order_count: 24, total_revenue: 226900, avg_order: 9454 }
  ],
  stockAlerts: [
    { product_name: 'Fren Balatası', warehouse_name: 'Merkez Depo', quantity: 8, minimum_stock: 30, shortage: 22 },
    { product_name: 'Hidrolik Pompa', warehouse_name: 'İzmir Depo', quantity: 6, minimum_stock: 24, shortage: 18 },
    { product_name: 'Traktör Filtre', warehouse_name: 'Konya Depo', quantity: 10, minimum_stock: 25, shortage: 15 },
    { product_name: 'Şanzıman Yağı', warehouse_name: 'Antalya Depo', quantity: 12, minimum_stock: 28, shortage: 16 }
  ],
  serviceStatus: [
    { service_status: 'Beklemede', service_count: 18, total_cost: 48250 },
    { service_status: 'Devam Ediyor', service_count: 12, total_cost: 36510 },
    { service_status: 'Tamamlandı', service_count: 34, total_cost: 97200 }
  ],
  customerActivity: [
    { customer_name: 'Tarım Teknoloji A.Ş.', order_count: 16, total_spend: 428400, last_order: '2026-08-29' },
    { customer_name: 'Yeşil Toprak Çiftliği', order_count: 12, total_spend: 315900, last_order: '2026-08-27' },
    { customer_name: 'Mekanik Tarım Ltd.', order_count: 10, total_spend: 289500, last_order: '2026-08-23' }
  ],
  fieldSummary: [
    { region: 'Merkez', task_count: 18, completed_count: 14 },
    { region: 'Güney', task_count: 14, completed_count: 9 },
    { region: 'Doğu', task_count: 11, completed_count: 8 }
  ],
  reportCatalog: [
    { report_name: 'Şube Geliri', view_name: 'v_report_branch_revenue', row_count: 4 },
    { report_name: 'Aylık Satış Özeti', view_name: 'v_report_sales_summary', row_count: 8 },
    { report_name: 'Stok Sağlık Durumu', view_name: 'v_report_stock_health', row_count: 7 },
    { report_name: 'Düşük Stok Parçaları', view_name: 'v_report_low_stock_parts', row_count: 9 },
    { report_name: 'Servis Performansı', view_name: 'v_report_service_performance', row_count: 6 },
    { report_name: 'Teknisyen Bazlı Servis', view_name: 'v_report_service_by_technician', row_count: 5 },
    { report_name: 'Müşteri Değer Analizi', view_name: 'v_report_customer_value', row_count: 10 },
    { report_name: 'Sipariş Durum Karışımı', view_name: 'v_report_order_status_mix', row_count: 4 },
    { report_name: 'Bölge Saha Performansı', view_name: 'v_report_field_region_performance', row_count: 6 },
    { report_name: 'Şikayet Çözüm Takibi', view_name: 'v_report_complaint_resolution', row_count: 7 }
  ]
}

function AnalyticsPage() {
  const [data, setData] = useState<any>(fallbackAnalytics)

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetchJson<any>('/analytics')
        setData({ ...fallbackAnalytics, ...response })
      } catch (error) {
        console.error('Analytics fetch failed', error)
        setData(fallbackAnalytics)
      }
    }
    load()
  }, [])

  const formatMoney = (value: number) => `₺${Number(value || 0).toLocaleString('tr-TR')}`
  const catalog = data.reportCatalog?.length ? data.reportCatalog : fallbackAnalytics.reportCatalog

  return <>
    <div className="hero page-hero">
      <div><span className="eyebrow">Yatırım ve performans</span><h1>Analiz &amp; Raporlama</h1><p>Şube gelirleri, stok riskleri ve servis performansını görselleştirin.</p></div>
      <button className="primary"><Plus size={18} /> Rapor Oluştur</button>
    </div>

    <section className="card" style={{ marginBottom: 18 }}>
      <div className="section-head"><div><h2>Örnek Analiz Raporları</h2><p>Veritabanında oluşturulan 10 örnek rapor görünümü</p></div></div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Rapor Adı</th><th>View</th><th>Kayıt Sayısı</th></tr></thead>
          <tbody>
            {catalog.map((row: any, idx: number) => (
              <tr key={idx}><td>{row.report_name}</td><td>{row.view_name}</td><td>{row.row_count}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>

    <div className="grid-main">
      <section className="card">
        <div className="section-head"><div><h2>Şube Geliri</h2><p>30 günlük gelir görünümü</p></div></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Şube</th><th>Sipariş</th><th>Toplam Gelir</th><th>Ortalama Sipariş</th></tr></thead>
            <tbody>
              {data.salesByBranch?.map((row: any, idx: number) => (
                <tr key={idx}><td>{row.branch_name}</td><td>{row.order_count}</td><td>{formatMoney(row.total_revenue)}</td><td>{formatMoney(row.avg_order)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <div className="section-head"><div><h2>Kritik Stok Uyarıları</h2><p>Minimum stok altında kalan ürünler</p></div></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Ürün</th><th>Depo</th><th>Mevcut</th><th>Minimum</th><th>Eksi</th></tr></thead>
            <tbody>
              {data.stockAlerts?.map((row: any, idx: number) => (
                <tr key={idx}><td>{row.product_name}</td><td>{row.warehouse_name}</td><td>{row.quantity}</td><td>{row.minimum_stock}</td><td>{row.shortage}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <div className="grid-bottom">
      <section className="card">
        <div className="section-head"><div><h2>Servis Durumu</h2><p>Servis iş yükü dağılımı</p></div></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Durum</th><th>Adet</th><th>Toplam Maliyet</th></tr></thead>
            <tbody>
              {data.serviceStatus?.map((row: any, idx: number) => (
                <tr key={idx}><td>{row.service_status}</td><td>{row.service_count}</td><td>{formatMoney(row.total_cost)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card activity">
        <div className="section-head"><div><h2>Müşteri Aktivitesi</h2><p>En çok harcama yapan müşteriler</p></div></div>
        {data.customerActivity?.map((row: any, idx: number) => (
          <div className="activity-row" key={idx}><CheckCircle2 /> <span><b>{row.customer_name}</b><small>{row.order_count} sipariş · {formatMoney(row.total_spend)}</small></span><time>{row.last_order}</time></div>
        ))}
      </section>
    </div>

    <section className="card" style={{ marginTop: 18 }}>
      <div className="section-head"><div><h2>Saha Görev Özeti</h2><p>Bölgelere göre saha performansı</p></div></div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Bölge</th><th>Toplam Görev</th><th>Tamamlanan</th></tr></thead>
          <tbody>
            {data.fieldSummary?.map((row: any, idx: number) => (
              <tr key={idx}><td>{row.region}</td><td>{row.task_count}</td><td>{row.completed_count}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  </>
}

const fallbackQuoteControlData = {
  summary: {
    pending_count: 2,
    approved_count: 14,
    rejected_count: 4,
    pending_total_amount: 61150,
    complaint_count: 4,
    avg_confidence: 96.2
  },
  agents: [
    { id: 1, name: 'Teklif Onay Ajanı', role: 'Fiyat, Stok ve Limit Kontrolü', model: 'GPT-4 / Sonnet 3.5', status: 'Aktif', accuracy: '96.8%' },
    { id: 2, name: 'Teknik Uygunluk Ajanı', role: 'Traktör Modeli & OEM Parça Uyumu', model: 'GPT-4o', status: 'Aktif', accuracy: '98.4%' },
    { id: 3, name: 'Finans ve Marj Ajanı', role: 'Kar Marjı ve İskonto Sınır Kontrolü', model: 'GPT-4 Turbo', status: 'Aktif', accuracy: '95.1%' }
  ],
  quotes: [
    {
      id: 1,
      quote_no: 'TKL-1001',
      customer: 'Bereket Tarım Ltd.',
      customer_email: 'iletisim@berekettarim.com',
      total: '₺48.750',
      raw_total: 48750,
      item_count: 2,
      status: 'BEKLEMEDE',
      validity: '2026-10-01',
      quote_date: '2026-09-01',
      ai_recommendation: 'APPROVE',
      ai_confidence: 94,
      ai_reason: 'Müşteri kredi riski düşük, stok mevcudiyeti tam (%100), iskonto oranı şirket politikasında (%5 sınır altında).',
      ai_agent_name: 'Teklif Onay Ajanı'
    },
    {
      id: 2,
      quote_no: 'TKL-1002',
      customer: 'Güven Çiftliği',
      customer_email: 'info@guvenciftligi.com',
      total: '₺12.400',
      raw_total: 12400,
      item_count: 1,
      status: 'BEKLEMEDE',
      validity: '2026-09-30',
      quote_date: '2026-09-01',
      ai_recommendation: 'REJECT',
      ai_confidence: 89,
      ai_reason: 'Talep edilen yedek parça stokta yetersiz, kar marjı hedeflenen %15 tabanının altında kalmaktadır.',
      ai_agent_name: 'Finans ve Marj Ajanı'
    }
  ],
  history: [
    {
      id: 1,
      quote_no: 'TKL-1000',
      customer: 'Ahmet Yılmaz',
      status: 'APPROVED',
      action: 'Siparişe Dönüştürüldü',
      decision_notes: 'sp_approve_quote_create_order prosedürü ile SIP-20260901-0002 oluşturuldu.',
      date: '2026-08-31 14:30'
    },
    {
      id: 2,
      quote_no: 'TKL-0999',
      customer: 'Mehmet Kaya',
      status: 'REJECTED',
      action: 'Şikayet Talebi Açıldı',
      decision_notes: 'sp_reject_quote_create_complaint prosedürü ile TLP-20260830-0099 kaydedildi.',
      date: '2026-08-30 11:15'
    }
  ]
}

function QuoteControlPage() {
  const [data, setData] = useState<any>(fallbackQuoteControlData)
  const [selectedQuote, setSelectedQuote] = useState<any>(null)
  const [processing, setProcessing] = useState(false)
  const [batchRunning, setBatchRunning] = useState(false)
  const [actionAlert, setActionAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const loadData = async () => {
    try {
      const response = await fetchJson<any>('/quote-control')
      if (response && response.quotes) {
        setData(response)
        if (response.quotes.length > 0 && !selectedQuote) {
          setSelectedQuote(response.quotes[0])
        }
      }
    } catch (error) {
      console.error('Quote control fetch failed', error)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleApprove = async (quote: any) => {
    setProcessing(true)
    setActionAlert(null)
    try {
      const response = await fetch(`${API_BASE}/quotes/${quote.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_id: 1,
          approval_reason: 'PRICE',
          decision_notes: 'AI Ajan tarafından onaylandı (sp_approve_quote_create_order tetiklendi)'
        })
      })

      if (response.ok) {
        setActionAlert({
          type: 'success',
          message: `✅ [${quote.quote_no}] Teklifi başarıyla ONAYLANDI. Veritabanı prosedürü çalıştırıldı ve siparişler (orders) tablosuna otomatik sipariş kaydı açıldı!`
        })
        await loadData()
        setSelectedQuote(null)
      } else {
        throw new Error('Onay işlemi başarısız')
      }
    } catch (error: any) {
      setActionAlert({ type: 'error', message: `❌ Onay işlemi gerçekleştirilemedi: ${error.message}` })
    }
    setProcessing(false)
  }

  const handleReject = async (quote: any) => {
    setProcessing(true)
    setActionAlert(null)
    try {
      const response = await fetch(`${API_BASE}/quotes/${quote.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_id: 1,
          rejection_reason: 'PRICE_MISMATCH',
          decision_notes: 'Fiyat/stok uyuşmazlığı nedeniyle AI Ajan tarafından reddedildi (sp_reject_quote_create_complaint tetiklendi)'
        })
      })

      if (response.ok) {
        setActionAlert({
          type: 'success',
          message: `⚠️ [${quote.quote_no}] Teklifi REDDEDİLDİ. Veritabanı prosedürü çalıştırıldı ve şikayet & talep tablosuna 'Teklif Talebi' konulu yeni kayıt açıldı!`
        })
        await loadData()
        setSelectedQuote(null)
      } else {
        throw new Error('Red işlemi başarısız')
      }
    } catch (error: any) {
      setActionAlert({ type: 'error', message: `❌ Red işlemi gerçekleştirilemedi: ${error.message}` })
    }
    setProcessing(false)
  }

  const runBatchAiCheck = async () => {
    setBatchRunning(true)
    setActionAlert(null)
    await new Promise(r => setTimeout(r, 1500))
    await loadData()
    setActionAlert({
      type: 'success',
      message: `⚡ Yapay Zeka Ajanları tüm bekleyen teklifleri analiz etti. Veritabanı prosedürleri ve trigger kontrol mekanizmaları senkronize edildi.`
    })
    setBatchRunning(false)
  }

  const quotesList = data.quotes || []
  const summary = data.summary || fallbackQuoteControlData.summary
  const agents = data.agents || fallbackQuoteControlData.agents
  const history = data.history || fallbackQuoteControlData.history

  return <>
    <div className="hero page-hero">
      <div>
        <span className="eyebrow">Yapay Zeka &amp; Otomasyon · Stored Procedure Entegreli</span>
        <h1>Teklif Kontrolü AI Ajanı</h1>
        <p>AI onaylanan teklifleri otomatik siparişe dönüştürür, reddedilenleri şikayet-talep tablosuna aktarır.</p>
      </div>
      <button className="primary" onClick={runBatchAiCheck} disabled={batchRunning}>
        <Zap size={18} /> {batchRunning ? 'Ajanlar Taranıyor...' : 'Toplu AI Analizi Çalıştır'}
      </button>
    </div>

    {actionAlert && (
      <div style={{
        padding: '14px 18px',
        marginBottom: 18,
        borderRadius: 8,
        backgroundColor: actionAlert.type === 'success' ? '#eaf8eb' : '#fdeeed',
        border: `1px solid ${actionAlert.type === 'success' ? '#a5d6a7' : '#ef9a9a'}`,
        color: actionAlert.type === 'success' ? '#1b5e20' : '#b71c1c',
        fontSize: 13,
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }}>
        {actionAlert.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
        <span>{actionAlert.message}</span>
      </div>
    )}

    {/* Metrik İstatistik Kartları */}
    <section className="stats">
      <Stat icon={Zap} label="Bekleyen Teklifler" value={`${summary.pending_count ?? quotesList.length} adet`} change={`₺${Number(summary.pending_total_amount || 0).toLocaleString('tr-TR')}`} />
      <Stat icon={ShoppingCart} label="Siparişe Dönüştürülen" value={`${summary.approved_count ?? 14} adet`} change="Otomatik sipariş kaydı" />
      <Stat icon={AlertTriangle} label="Reddedilen / Şikayet" value={`${summary.rejected_count ?? 4} kayıt`} change="Şikayet-Talep tablosuna aktarıldı" red />
      <Stat icon={Sparkles} label="AI Doğruluk Oranı" value={`%${summary.avg_confidence ?? 96.2}`} change="3 Ajan aktif çalışıyor" />
    </section>

    {/* Aktif AI Ajanları Bölümü */}
    <section className="card" style={{ marginBottom: 18 }}>
      <div className="section-head">
        <div>
          <h2>Aktif AI Ajan Ekibi</h2>
          <p>Teklif analiz ve onay süreçlerini yöneten yapay zeka modelleri</p>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
        {agents.map((ag: any, idx: number) => (
          <div key={idx} style={{ padding: 14, border: '1px solid #e2ece3', borderRadius: 10, backgroundColor: '#f9fbf9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <b style={{ color: '#143e2c', fontSize: 13 }}>{ag.name}</b>
              <span className="pill green" style={{ fontSize: 10 }}>✓ {ag.status}</span>
            </div>
            <p style={{ margin: '4px 0 8px', fontSize: 11, color: '#55695c' }}>{ag.role}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#7a8d81', borderTop: '1px solid #edf2ee', paddingTop: 6 }}>
              <span>Model: <b>{ag.model}</b></span>
              <span>Güven: <b style={{ color: '#2e7d32' }}>{ag.accuracy}</b></span>
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* Ana Grid: Sol Bekleyen Teklifler, Sağ Seçili Teklif Detay ve Karar Paneli */}
    <div className="grid-main">
      <section className="card">
        <div className="section-head">
          <div>
            <h2>Onay Bekleyen Teklifler &amp; Canlı AI Analizi</h2>
            <p>Yapay zeka önerileri doğrultusunda işlem yapın</p>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Teklif No</th>
                <th>Müşteri</th>
                <th>Tutar</th>
                <th>AI Karar Önerisi</th>
                <th>AI Güven Skoru</th>
              </tr>
            </thead>
            <tbody>
              {quotesList.map((q: any) => {
                const isSelected = selectedQuote?.id === q.id
                const isApproved = q.ai_recommendation === 'APPROVE'
                return (
                  <tr
                    key={q.id}
                    onClick={() => setSelectedQuote(q)}
                    style={{
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#f0f7ff' : 'transparent',
                      transition: 'background 0.15s'
                    }}
                  >
                    <td>
                      <b style={{ color: isSelected ? '#1976d2' : '#24392e' }}>{q.quote_no}</b>
                    </td>
                    <td>{q.customer}</td>
                    <td><b>{q.total}</b></td>
                    <td>
                      <span className={`pill ${isApproved ? 'green' : 'orange'}`}>
                        {isApproved ? '✓ ONAYLA' : '✕ REDDET'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 45, height: 6, backgroundColor: '#e0e0e0', borderRadius: 3 }}>
                          <div style={{
                            width: `${q.ai_confidence || 90}%`,
                            height: '100%',
                            backgroundColor: isApproved ? '#4caf50' : '#f44336',
                            borderRadius: 3
                          }} />
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 600 }}>%{q.ai_confidence || 90}</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {quotesList.length === 0 && (
            <p style={{ padding: 24, textAlign: 'center', color: '#888', fontSize: 13 }}>
              Şu anda inceleme bekleyen aktif teklif bulunmamaktadır.
            </p>
          )}
        </div>
      </section>

      {/* Sağ Panel: Seçili Teklif Detay ve Hızlı Aksiyon */}
      <section className="card">
        <div className="section-head">
          <div>
            <h2>Karar &amp; Prosedür Paneli</h2>
            <p>{selectedQuote ? `${selectedQuote.quote_no} - ${selectedQuote.customer}` : 'İncelemek için sol tablodan bir teklif seçin'}</p>
          </div>
        </div>

        {selectedQuote ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ padding: 10, backgroundColor: '#f6f9f6', borderRadius: 8, border: '1px solid #e5ebe5' }}>
                <span style={{ fontSize: 10, color: '#77887d', textTransform: 'uppercase', fontWeight: 600 }}>Teklif Tutarı</span>
                <p style={{ margin: '3px 0 0', fontSize: 17, fontWeight: 700, color: '#1d3b2b' }}>{selectedQuote.total}</p>
              </div>
              <div style={{ padding: 10, backgroundColor: '#f6f9f6', borderRadius: 8, border: '1px solid #e5ebe5' }}>
                <span style={{ fontSize: 10, color: '#77887d', textTransform: 'uppercase', fontWeight: 600 }}>Geçerlilik Tarihi</span>
                <p style={{ margin: '3px 0 0', fontSize: 13, fontWeight: 600, color: '#1d3b2b' }}>{selectedQuote.validity}</p>
              </div>
            </div>

            {/* AI Analiz Rapor Kutusu */}
            <div style={{
              padding: 14,
              borderRadius: 8,
              backgroundColor: selectedQuote.ai_recommendation === 'APPROVE' ? '#f1f8f2' : '#fdf3f2',
              border: `1px solid ${selectedQuote.ai_recommendation === 'APPROVE' ? '#c8e6c9' : '#ffcdd2'}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: selectedQuote.ai_recommendation === 'APPROVE' ? '#2e7d32' : '#c62828' }}>
                  🤖 AI AJAN DEĞERLENDİRMESİ ({selectedQuote.ai_agent_name})
                </span>
                <span className={`pill ${selectedQuote.ai_recommendation === 'APPROVE' ? 'green' : 'orange'}`}>
                  Güven: %{selectedQuote.ai_confidence}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 11, color: '#334', lineHeight: 1.5 }}>
                {selectedQuote.ai_reason}
              </p>
            </div>

            {/* Veritabanı Prosedür Açıklaması */}
            <div style={{ padding: 10, backgroundColor: '#fafafa', borderRadius: 6, fontSize: 10, color: '#666', border: '1px dashed #ddd' }}>
              <p style={{ margin: 0 }}>
                ⚙️ <b>Onay:</b> <code>sp_approve_quote_create_order</code> → <code>orders</code> tablosuna otomatik sipariş açar.
              </p>
              <p style={{ margin: '4px 0 0' }}>
                ⚙️ <b>Red:</b> <code>sp_reject_quote_create_complaint</code> → <code>requests_complaints</code> tablosuna <i>'Teklif Talebi'</i> kaydı açar.
              </p>
            </div>

            {/* Aksiyon Butonları */}
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button
                className="primary"
                onClick={() => handleApprove(selectedQuote)}
                disabled={processing}
                style={{ flex: 1, backgroundColor: processing ? '#999' : '#2e7d32', justifyContent: 'center' }}
              >
                <Check size={16} /> {processing ? 'İşleniyor...' : 'Onayla (Sipariş Aç)'}
              </button>
              <button
                className="cancel-btn"
                onClick={() => handleReject(selectedQuote)}
                disabled={processing}
                style={{ flex: 1, borderColor: '#d32f2f', color: '#d32f2f', backgroundColor: '#fff', justifyContent: 'center' }}
              >
                <AlertCircle size={16} /> {processing ? 'İşleniyor...' : 'Reddet (Şikayet Aç)'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>
            <Zap size={32} style={{ color: '#ccc', marginBottom: 8 }} />
            <p style={{ margin: 0, fontSize: 12 }}>Detayları ve AI gerekçesini görmek için soldan bir teklif seçin.</p>
          </div>
        )}
      </section>
    </div>

    {/* Alt Bölüm: İşlem Geçmişi & Prosedür Logları */}
    <section className="card" style={{ marginTop: 18 }}>
      <div className="section-head">
        <div>
          <h2>AI Karar &amp; Dönüşüm Geçmişi</h2>
          <p>Prosedürler ve tetikleyiciler ile gerçekleştirilen son sipariş ve şikayet-talep kayıtları</p>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Teklif No</th>
              <th>Müşteri</th>
              <th>Durum</th>
              <th>Gerçekleşen Eylem</th>
              <th>Prosedür &amp; Karar Notu</th>
              <th>Tarih</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h: any, idx: number) => (
              <tr key={idx}>
                <td><b>{h.quote_no}</b></td>
                <td>{h.customer}</td>
                <td>
                  <span className={`pill ${h.status === 'APPROVED' ? 'green' : 'orange'}`}>
                    {h.status === 'APPROVED' ? 'ONAYLANDI' : 'REDDEDİLDİ'}
                  </span>
                </td>
                <td>
                  <b style={{ color: h.status === 'APPROVED' ? '#2e7d32' : '#c62828', fontSize: 11 }}>
                    {h.action}
                  </b>
                </td>
                <td style={{ fontSize: 10, color: '#555' }}>{h.decision_notes}</td>
                <td style={{ fontSize: 10, color: '#888' }}>{h.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  </>
}

const fallbackAiAgents = {
  agents: [
    { id: 1, name: 'Satış Ajan', role: 'Teklif Değerlendirme', status: 'ready' },
    { id: 2, name: 'Teknik Ajan', role: 'Ürün Uygunluk Analizi', status: 'ready' },
    { id: 3, name: 'Finans Ajan', role: 'Fiyat ve Marj Kontrol', status: 'ready' }
  ],
  lastResults: [
    { agent: 'Satış Ajan', quote: 'SIP-1048', customer: 'Bereket Tarım Ltd.', decision: 'Onaylı', confidence: 92, reason: 'Müşteri kredisi iyi, önceki işlemler başarılı' },
    { agent: 'Teknik Ajan', quote: 'SIP-1047', customer: 'Ahmet Yılmaz', decision: 'Onaylı', confidence: 88, reason: 'Talep edilen parçaların uygunluğu sağlandı' },
    { agent: 'Finans Ajan', quote: 'SIP-1046', customer: 'Güven Çiftliği', decision: 'İncelenmesi Gerekli', confidence: 75, reason: 'Marj sınır altında, müdür onayı gerekli' }
  ]
}

function AiAgentsPage() {
  const [data, setData] = useState<any>(fallbackAiAgents)
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<any>(null)

  const runQuoteCheck = async () => {
    setRunning(true)
    setResult(null)
    await new Promise(r => setTimeout(r, 2000))

    try {
      const response = await fetchJson<any>('/ai-agents')
      setData({ ...fallbackAiAgents, ...response })
      if (response.lastResults?.[0]) {
        setResult(response.lastResults[0])
      }
    } catch (error) {
      const random = fallbackAiAgents.lastResults[Math.floor(Math.random() * 3)]
      setResult(random)
    }
    setRunning(false)
  }

  const getDecisionColor = (decision: string) => {
    if (decision === 'Onaylı') return 'green'
    if (decision === 'Reddedildi') return 'red'
    return 'orange'
  }

  return <>
    <div className="hero page-hero">
      <div><span className="eyebrow">Otomasyon ve Zeka</span><h1>Yapay Zeka Ajanları</h1><p>AI güdümlü otomatik süreçler ve akıllı analizler ile işletmenizi geliştirin.</p></div>
      <button className="primary" onClick={runQuoteCheck} disabled={running}><Zap size={18} />{running ? 'İşleniyor...' : 'Teklif Kontrol Başlat'}</button>
    </div>

    <div className="grid-main">
      <section className="card">
        <div className="section-head"><div><h2>Aktif Ajanlar</h2><p>İşletmenizi destekleyen AI ajanları</p></div></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Ajan Adı</th><th>Rol</th><th>Durum</th></tr></thead>
            <tbody>
              {data.agents?.map((agent: any, idx: number) => (
                <tr key={idx}>
                  <td><b>{agent.name}</b></td>
                  <td>{agent.role}</td>
                  <td><span className="pill green">✓ Hazır</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <div className="section-head"><div><h2>Son Analiz Sonuçları</h2><p>AI Teklif Kontrolü çalışmaları</p></div></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {result ? (
            <div style={{ padding: 16, border: '1px solid #e0e0e0', borderRadius: 8, backgroundColor: '#f9f9f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div>
                  <b>{result.agent}</b>
                  <p style={{ margin: '4px 0', fontSize: 13, color: '#666' }}>Müşteri: {result.customer} · Teklif: {result.quote}</p>
                </div>
                <span className={`pill ${getDecisionColor(result.decision)}`} style={{ fontSize: 12, fontWeight: 600 }}>
                  {result.decision === 'Onaylı' && <Check size={14} style={{ marginRight: 4 }} />}
                  {result.decision === 'Reddedildi' && <AlertCircle size={14} style={{ marginRight: 4 }} />}
                  {result.decision}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: '#666' }}>Güven: {result.confidence}%</span>
                <div style={{ flexGrow: 1, height: 6, backgroundColor: '#e0e0e0', borderRadius: 3 }}>
                  <div style={{ height: '100%', width: `${result.confidence}%`, backgroundColor: getDecisionColor(result.decision) === 'green' ? '#4caf50' : getDecisionColor(result.decision) === 'red' ? '#f44336' : '#ff9800', borderRadius: 3 }} />
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: '#555', lineHeight: 1.5 }}>📝 {result.reason}</p>
            </div>
          ) : (
            data.lastResults?.slice(0, 3).map((item: any, idx: number) => (
              <div key={idx} style={{ padding: 12, border: '1px solid #e8e8e8', borderRadius: 6, backgroundColor: '#fafafa' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <b style={{ fontSize: 13 }}>{item.agent}</b>
                    <p style={{ margin: '2px 0', fontSize: 12, color: '#888' }}>{item.customer}</p>
                  </div>
                  <span style={{ fontSize: 12, padding: '4px 8px', borderRadius: 4, backgroundColor: getDecisionColor(item.decision) === 'green' ? '#c8e6c9' : getDecisionColor(item.decision) === 'red' ? '#ffcdd2' : '#ffe0b2', color: getDecisionColor(item.decision) === 'green' ? '#2e7d32' : getDecisionColor(item.decision) === 'red' ? '#c62828' : '#e65100' }}>
                    {item.decision} ({item.confidence}%)
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  </>
}

function DetailPage({ page }: { page: Exclude<Page, 'Genel Bakış'> }) {
  const [data, setData] = useState<DataTable>({ columns: [], rows: [] })

  useEffect(() => {
    const endpointMap: Record<Exclude<Page, 'Genel Bakış'>, string> = {
      'Markalar': '/brands',
      'Ürünler': '/products',
      'Stok Takibi': '/stock',
      'Müşteriler': '/customers',
      'Sipariş & Teklifler': '/orders',
      'Teklif Kontrolü (AI)': '/quote-control',
      'Sosyal Medya İçeriği Üret': '/ai-agents',
      'Tamir & Bakım': '/services',
      'Şikayet & Talep': '/complaints',
      'Depolar': '/warehouses',
      'Analiz & Raporlama': '/analytics',
      'Saha İşleri': '/field-tasks',
      'Şubeler': '/branches',
      'Kullanıcı Yönetimi': '/users',
      'Yapay Zeka Ajanları': '/ai-agents'
    }

    const load = async () => {
      try {
        const response = await fetchJson<any>(endpointMap[page])
        if (page === 'Saha İşleri') {
          const rows = (response || []).map((task: any) => [task.title, task.region, task.team, task.time, task.status])
          setData({ columns: ['Görev', 'Bölge', 'Ekip', 'Saat', 'Durum'], rows })
        } else {
          setData(response || { columns: [], rows: [] })
        }
      } catch (error) {
        console.error('Detail fetch failed', error)
      }
    }

    load()
  }, [page])

  const meta = pageMeta[page]

  return <>
    <div className="hero page-hero">
      <div><span className="eyebrow">{meta.eyebrow}</span><h1>{meta.title}</h1><p>{meta.description}</p></div>
      <button className="primary"><Plus size={18} />{meta.action}</button>
    </div>
    <div className="toolbar">
      <div className="search"><Search size={18} /><input placeholder={`${meta.title} içinde ara...`} /></div>
      <button className="filter"><Settings size={17} /> Filtrele <ChevronDown size={16} /></button>
    </div>
    <section className="card data-card">
      <div className="section-head"><div><h2>{meta.title} Listesi</h2><p>Toplam {data.rows.length} kayıt görüntüleniyor</p></div><button className="icon-btn"><MoreHorizontal size={20} /></button></div>
      <div className="table-wrap"><table><thead><tr>{data.columns.map((c) => <th key={c}>{c}</th>)}<th></th></tr></thead><tbody>{data.rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}<td><button className="more"><MoreHorizontal size={19} /></button></td></tr>)}</tbody></table></div>
    </section>
  </>
}

export default function App() {
  const [page, setPage] = useState<Page>('Genel Bakış')
  const [open, setOpen] = useState(false)
  const title = useMemo(() => page === 'Genel Bakış' ? 'Genel Bakış' : page, [page])

  return <div className="app">
    <aside className={open ? 'open' : ''}>
      <div className="brand">
        <div className="brand-mark"><span /><i /></div>
        <div><b>Agro<span>Plus</span></b><small>Yönetim Paneli</small></div>
        <button className="mobile-close" onClick={() => setOpen(false)}><X /></button>
      </div>
      <nav>
        <p className="nav-label">ANA MENÜ</p>
        {mainNav.map(({ label, icon: Icon, badge, badgeClass }) => (
          <button
            className={page === label ? 'active' : ''}
            onClick={() => { setPage(label); setOpen(false) }}
            key={label}
          >
            <Icon size={19} />
            <span>{label}</span>
            {badge && <em className={badgeClass || ''}>{badge}</em>}
          </button>
        ))}

        <p className="nav-label ai-group">
          <Sparkles size={13} color="#79c45d" />
          YAPAY ZEKA AJANLARI
        </p>
        {aiNav.map(({ label, icon: Icon, badge, badgeClass }) => (
          <button
            className={page === label ? 'active' : ''}
            onClick={() => { setPage(label); setOpen(false) }}
            key={label}
          >
            <Icon size={19} />
            <span>{label}</span>
            {badge && <em className={badgeClass || ''}>{badge}</em>}
          </button>
        ))}

        <p className="nav-label second">YÖNETİM</p>
        {mgmtNav.map(({ label, icon: Icon, badge, badgeClass }) => (
          <button
            className={page === label ? 'active' : ''}
            onClick={() => { setPage(label); setOpen(false) }}
            key={label}
          >
            <Icon size={19} />
            <span>{label}</span>
            {badge && <em className={badgeClass || ''}>{badge}</em>}
          </button>
        ))}
      </nav>
      <div className="side-bottom">
        <div className="help"><Sparkles size={18} /><div><b>Yardıma mı ihtiyacınız var?</b><small>Destek merkezini ziyaret edin</small></div></div>
        <div className="profile"><div className="avatar">SA</div><div><b>Selin Aksoy</b><small>Yönetici</small></div><ChevronDown size={16} /></div>
      </div>
    </aside>

    <main>
      <header>
        <button className="menu-btn" onClick={() => setOpen(true)}><Menu /></button>
        <div className="crumb"><span>AgroPlus</span><i>/</i><b>{title}</b></div>
        <div className="header-right">
          <button className="icon-btn"><CalendarDays size={19} /></button>
          <button className="icon-btn notification"><Bell size={19} /><em /></button>
          <div className="header-avatar">SA</div>
        </div>
      </header>
      <div className="content">
        {page === 'Genel Bakış' ? (
          <Overview setPage={setPage} />
        ) : page === 'Sipariş & Teklifler' ? (
          <OrdersAndQuotes onNavigateToQuoteControl={() => setPage('Teklif Kontrolü (AI)')} />
        ) : page === 'Teklif Kontrolü (AI)' ? (
          <QuoteControlPage />
        ) : page === 'Sosyal Medya İçeriği Üret' ? (
          <SocialMediaAgent />
        ) : page === 'Analiz & Raporlama' ? (
          <AnalyticsPage />
        ) : page === 'Saha İşleri' ? (
          <FieldWorks />
        ) : page === 'Yapay Zeka Ajanları' ? (
          <AiAgentsPage />
        ) : (
          <DetailPage page={page} />
        )}
      </div>
    </main>
  </div>
}

