import React, { useState, useMemo } from 'react'
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin,
  Wrench, Truck, AlertCircle, ArrowRight, CheckCircle, ExternalLink,
  CalendarDays, X, ChevronDown, Check
} from 'lucide-react'
import { CalendarEventItem, DeepLinkState, Page } from './types/navigation'

interface AgroCalendarPopoverProps {
  isOpen: boolean
  onClose: () => void
  onNavigate: (page: Page, params?: Record<string, string | number | boolean>) => void
  onOpenFullCalendar: () => void
}

export const INITIAL_CALENDAR_EVENTS: CalendarEventItem[] = [
  // 1 Eylül 2026
  {
    id: 'cal-1',
    date: '2026-09-01',
    time: '10:30',
    title: 'Traktör 500 Saat Bakımı - Ahmet Yılmaz (New Holland T5.110)',
    category: 'service',
    categoryLabel: 'Servis & Bakım',
    customer: 'Ahmet Yılmaz',
    machine: 'New Holland T5.110',
    location: 'Merkez Atölye - İstasyon 2',
    actionLabel: 'Bakımı Başlat / Servise Git',
    deepLink: {
      page: 'Tamir & Bakım',
      params: { record_id: '102', action: 'start', service_no: 'SRV-20260901-0102' }
    }
  },
  {
    id: 'cal-2',
    date: '2026-09-01',
    time: '14:00',
    title: 'Biçerdöver Saha Teslimi - Kocaeli / Kartepe',
    category: 'field',
    categoryLabel: 'Saha & Teslimat',
    customer: 'Öztürk Tarım İşletmesi',
    machine: 'Claas Lexion 770',
    location: 'Kocaeli / Kartepe, Çiftlik Yolu No:14',
    actionLabel: 'Detayı Gör / Rotayı Aç',
    deepLink: {
      page: 'Saha İşleri',
      params: { task_id: '45', title: 'Biçerdöver Saha Teslimi', region: 'Kocaeli / Kartepe' }
    }
  },
  {
    id: 'cal-3',
    date: '2026-09-01',
    time: '16:30',
    title: 'Periyodik Filtre & Hidrolik Kontrolü - Bereket Çiftliği',
    category: 'service',
    categoryLabel: 'Servis & Bakım',
    customer: 'Bereket Çiftliği',
    machine: 'Case IH Maxxum 125',
    location: 'Mobil Servis Aracı #3',
    actionLabel: 'Servis Kaydını Aç',
    deepLink: {
      page: 'Tamir & Bakım',
      params: { record_id: '104', action: 'view' }
    }
  },
  // 2 Eylül 2026
  {
    id: 'cal-4',
    date: '2026-09-02',
    time: '09:00',
    title: 'Ekim Makinesi Kalibrasyon & Saha Testi',
    category: 'field',
    categoryLabel: 'Saha & Teslimat',
    customer: 'Yeşil Toprak Çiftliği',
    machine: 'Gaspardo MTE 6 Sıralı',
    location: 'Sakarya / Hendek',
    actionLabel: 'Saha Görevine Git',
    deepLink: {
      page: 'Saha İşleri',
      params: { task_id: '46' }
    }
  },
  {
    id: 'cal-5',
    date: '2026-09-02',
    time: '11:30',
    title: 'Şanzıman Revizyon & Diagnostik Analizi',
    category: 'service',
    categoryLabel: 'Servis & Bakım',
    customer: 'Mekanik Tarım Ltd.',
    machine: 'John Deere 6120M',
    location: 'Merkez Atölye - Ağır Bakım',
    actionLabel: 'Bakımı Başlat',
    deepLink: {
      page: 'Tamir & Bakım',
      params: { record_id: '105', action: 'start' }
    }
  },
  // 3 Eylül 2026
  {
    id: 'cal-6',
    date: '2026-09-03',
    time: '10:00',
    title: 'Traktör Akü & Elektrik Tesisatı Değişimi',
    category: 'service',
    categoryLabel: 'Servis & Bakım',
    customer: 'Güven Çiftliği',
    machine: 'Massey Ferguson 5711',
    location: 'İzmir Şube Servis',
    actionLabel: 'Servise Git',
    deepLink: {
      page: 'Tamir & Bakım',
      params: { record_id: '106' }
    }
  }
]

export const OVERDUE_EVENTS: CalendarEventItem[] = [
  {
    id: 'cal-overdue-1',
    date: '2026-08-31',
    time: '16:00',
    title: 'Gecikmiş: Hidrolik Pompa Basınç Testi & Valf Ayarı (Traktör T6.180)',
    category: 'service',
    categoryLabel: 'Servis & Bakım',
    customer: 'Anadolu Kooperatifi',
    machine: 'New Holland T6.180',
    location: 'Konya Şube',
    isOverdue: true,
    actionLabel: 'Gecikmiş İşi Başlat',
    deepLink: {
      page: 'Tamir & Bakım',
      params: { record_id: '99', action: 'start', overdue: true }
    }
  }
]

const MONTH_NAMES = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
]

const WEEK_DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']

export default function AgroCalendarPopover({
  isOpen,
  onClose,
  onNavigate,
  onOpenFullCalendar
}: AgroCalendarPopoverProps) {
  // Calendar base state: 2026-09-01
  const [currentYear, setCurrentYear] = useState(2026)
  const [currentMonth, setCurrentMonth] = useState(8) // 0-indexed: 8 = September
  const [selectedDate, setSelectedDate] = useState('2026-09-01')
  const [activeTab, setActiveTab] = useState<'all' | 'service' | 'field'>('all')

  // Generate calendar grid days
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay()
    // JS getDay(): 0 is Sunday, 1 is Monday. Convert so 0 is Monday:
    const startOffset = (firstDayIndex + 6) % 7
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate()

    const days: { dayNumber: number; dateString: string; isCurrentMonth: boolean }[] = []

    // Previous month padding
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear
      const mStr = String(prevMonth + 1).padStart(2, '0')
      const dStr = String(d).padStart(2, '0')
      days.push({
        dayNumber: d,
        dateString: `${prevYear}-${mStr}-${dStr}`,
        isCurrentMonth: false
      })
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const mStr = String(currentMonth + 1).padStart(2, '0')
      const dStr = String(i).padStart(2, '0')
      days.push({
        dayNumber: i,
        dateString: `${currentYear}-${mStr}-${dStr}`,
        isCurrentMonth: true
      })
    }

    // Next month padding to fill complete grid of rows
    const totalCells = Math.ceil(days.length / 7) * 7
    const nextPadding = totalCells - days.length
    for (let i = 1; i <= nextPadding; i++) {
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear
      const mStr = String(nextMonth + 1).padStart(2, '0')
      const dStr = String(i).padStart(2, '0')
      days.push({
        dayNumber: i,
        dateString: `${nextYear}-${mStr}-${dStr}`,
        isCurrentMonth: false
      })
    }

    return days
  }, [currentYear, currentMonth])

  // Map dates to event indicators
  const eventDateMap = useMemo(() => {
    const map: Record<string, { serviceCount: number; fieldCount: number }> = {}
    INITIAL_CALENDAR_EVENTS.forEach((ev) => {
      if (!map[ev.date]) {
        map[ev.date] = { serviceCount: 0, fieldCount: 0 }
      }
      if (ev.category === 'service') map[ev.date].serviceCount++
      else map[ev.date].fieldCount++
    })
    return map
  }, [])

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear((y) => y - 1)
    } else {
      setCurrentMonth((m) => m - 1)
    }
  }

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear((y) => y + 1)
    } else {
      setCurrentMonth((m) => m + 1)
    }
  }

  // Filtered events for the selected day
  const dayEvents = useMemo(() => {
    return INITIAL_CALENDAR_EVENTS.filter((ev) => {
      if (ev.date !== selectedDate) return false
      if (activeTab === 'service' && ev.category !== 'service') return false
      if (activeTab === 'field' && ev.category !== 'field' && ev.category !== 'delivery') return false
      return true
    })
  }, [selectedDate, activeTab])

  // Overdue count
  const overdueItems = OVERDUE_EVENTS

  const handleItemAction = (item: CalendarEventItem) => {
    onClose()
    onNavigate(item.deepLink.page, item.deepLink.params)
  }

  if (!isOpen) return null

  // Format selected date title in Turkish
  const formattedSelectedDate = (() => {
    const parts = selectedDate.split('-')
    if (parts.length === 3) {
      const day = parseInt(parts[2], 10)
      const month = MONTH_NAMES[parseInt(parts[1], 10) - 1]
      return `${day} ${month} ${parts[0]}`
    }
    return selectedDate
  })()

  return (
    <>
      {/* Invisible backdrop for outside click */}
      <div className="popover-backdrop" onClick={onClose} />

      <div className="agro-calendar-popover" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cal-popover-header">
          <div className="cal-header-title">
            <CalendarDays size={18} className="cal-icon-title" />
            <div>
              <h3>Operasyon &amp; Randevu Takvimi</h3>
              <p>Günlük randevular ve saha görevleri</p>
            </div>
          </div>
          <button className="cal-close-btn" onClick={onClose} title="Kapat">
            <X size={16} />
          </button>
        </div>

        {/* Mini Month Calendar View */}
        <div className="cal-mini-calendar">
          <div className="cal-month-nav">
            <button type="button" className="cal-nav-btn" onClick={handlePrevMonth} aria-label="Önceki Ay">
              <ChevronLeft size={16} />
            </button>
            <span className="cal-current-month">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </span>
            <button type="button" className="cal-nav-btn" onClick={handleNextMonth} aria-label="Sonraki Ay">
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="cal-weekdays-row">
            {WEEK_DAYS.map((w) => (
              <span key={w} className="cal-weekday-label">
                {w}
              </span>
            ))}
          </div>

          <div className="cal-days-grid">
            {calendarDays.map((item, idx) => {
              const isSelected = item.dateString === selectedDate
              const isToday = item.dateString === '2026-09-01'
              const events = eventDateMap[item.dateString]
              const hasEvents = Boolean(events && (events.serviceCount > 0 || events.fieldCount > 0))

              return (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setSelectedDate(item.dateString)}
                  className={`cal-day-cell ${
                    !item.isCurrentMonth ? 'other-month' : ''
                  } ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                >
                  <span className="cal-day-num">{item.dayNumber}</span>
                  {hasEvents && (
                    <span className="cal-dots-wrap">
                      {events.serviceCount > 0 && <span className="cal-dot service" />}
                      {events.fieldCount > 0 && <span className="cal-dot field" />}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Overdue / Critical Alert Banner (if any) */}
        {overdueItems.length > 0 && (
          <div className="cal-overdue-banner">
            <div className="cal-overdue-left">
              <span className="cal-overdue-badge">
                <AlertCircle size={13} /> Gecikti
              </span>
              <div className="cal-overdue-text">
                <b>1 Servis Randevusu Bekliyor</b>
                <small>31 Ağustos · Hidrolik Pompa Basınç Testi</small>
              </div>
            </div>
            <button
              type="button"
              className="cal-overdue-action"
              onClick={() => handleItemAction(overdueItems[0])}
            >
              Servise Git <ArrowRight size={13} />
            </button>
          </div>
        )}

        {/* Tab / Filter Navigation */}
        <div className="cal-tabs-bar">
          <div className="cal-tab-buttons">
            <button
              type="button"
              className={`cal-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              Tümü
            </button>
            <button
              type="button"
              className={`cal-tab-btn ${activeTab === 'service' ? 'active' : ''}`}
              onClick={() => setActiveTab('service')}
            >
              <Wrench size={13} /> Servis &amp; Bakım
            </button>
            <button
              type="button"
              className={`cal-tab-btn ${activeTab === 'field' ? 'active' : ''}`}
              onClick={() => setActiveTab('field')}
            >
              <Truck size={13} /> Saha &amp; Teslimat
            </button>
          </div>
          <span className="cal-selected-date-label">{formattedSelectedDate}</span>
        </div>

        {/* Selected Day's Task List */}
        <div className="cal-events-list">
          {dayEvents.length > 0 ? (
            dayEvents.map((item) => (
              <div key={item.id} className="cal-event-card">
                <div className="cal-event-top">
                  <span className="cal-event-time">
                    <Clock size={12} /> {item.time}
                  </span>
                  <span
                    className={`cal-category-pill ${
                      item.category === 'service' ? 'pill-service' : 'pill-field'
                    }`}
                  >
                    {item.category === 'service' ? (
                      <Wrench size={11} style={{ marginRight: 3 }} />
                    ) : (
                      <Truck size={11} style={{ marginRight: 3 }} />
                    )}
                    {item.categoryLabel}
                  </span>
                </div>

                <div className="cal-event-content">
                  <h4 className="cal-event-title">{item.title}</h4>
                  {item.location && (
                    <p className="cal-event-loc">
                      <MapPin size={12} /> {item.location}
                    </p>
                  )}
                </div>

                <div className="cal-event-action-row">
                  <button
                    type="button"
                    className="cal-deep-link-btn"
                    onClick={() => handleItemAction(item)}
                  >
                    <span>{item.actionLabel}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="cal-empty-state">
              <CheckCircle size={28} className="cal-empty-icon" />
              <h4>Harika! Bugün için bekleyen randevu bulunmuyor.</h4>
              <p>Farklı bir gün seçebilir veya yeni randevu oluşturabilirsiniz.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="cal-popover-footer">
          <button
            type="button"
            className="cal-view-full-btn"
            onClick={() => {
              onClose()
              onOpenFullCalendar()
            }}
          >
            <CalendarIcon size={14} />
            <span>Tam Takvimi Görüntüle</span>
            <ExternalLink size={13} />
          </button>
        </div>
      </div>
    </>
  )
}
