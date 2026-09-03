import React, { useState } from 'react'
import {
  CalendarDays, X, ChevronLeft, ChevronRight, Wrench, Truck,
  MapPin, Clock, Plus, Filter, ArrowRight, CheckCircle2, User
} from 'lucide-react'
import { INITIAL_CALENDAR_EVENTS, OVERDUE_EVENTS } from './AgroCalendarPopover'
import { CalendarEventItem, Page } from './types/navigation'

interface FullCalendarModalProps {
  isOpen: boolean
  onClose: () => void
  onNavigate: (page: Page, params?: Record<string, string | number | boolean>) => void
}

export default function FullCalendarModal({
  isOpen,
  onClose,
  onNavigate
}: FullCalendarModalProps) {
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')
  const [filterType, setFilterType] = useState<'all' | 'service' | 'field'>('all')
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventItem | null>(null)

  if (!isOpen) return null

  const allEvents = [...INITIAL_CALENDAR_EVENTS, ...OVERDUE_EVENTS]
  const filteredEvents = allEvents.filter((ev) => {
    if (filterType === 'service') return ev.category === 'service'
    if (filterType === 'field') return ev.category === 'field' || ev.category === 'delivery'
    return true
  })

  const handleAction = (item: CalendarEventItem) => {
    onClose()
    onNavigate(item.deepLink.page, item.deepLink.params)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="full-calendar-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="AgroPlus Genişletilmiş Operasyon Takvimi"
      >
        <div className="modal-header">
          <div className="full-cal-title-wrap">
            <div className="full-cal-icon">
              <CalendarDays size={20} />
            </div>
            <div>
              <span className="eyebrow">AgroPlus Ajanda &amp; Planlama</span>
              <h2>Operasyon &amp; Servis Randevu Takvimi</h2>
            </div>
          </div>

          <div className="full-cal-header-controls">
            <div className="view-mode-toggle">
              <button
                type="button"
                className={viewMode === 'month' ? 'active' : ''}
                onClick={() => setViewMode('month')}
              >
                Aylık
              </button>
              <button
                type="button"
                className={viewMode === 'week' ? 'active' : ''}
                onClick={() => setViewMode('week')}
              >
                Haftalık
              </button>
              <button
                type="button"
                className={viewMode === 'day' ? 'active' : ''}
                onClick={() => setViewMode('day')}
              >
                Günlük
              </button>
            </div>

            <button type="button" className="modal-close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="full-cal-toolbar">
          <div className="full-cal-nav-row">
            <button type="button" className="cal-nav-btn">
              <ChevronLeft size={16} />
            </button>
            <span className="full-cal-period-title">Eylül 2026</span>
            <button type="button" className="cal-nav-btn">
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="full-cal-filters">
            <button
              type="button"
              className={`cal-filter-chip ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              Tüm Görevler ({allEvents.length})
            </button>
            <button
              type="button"
              className={`cal-filter-chip ${filterType === 'service' ? 'active' : ''}`}
              onClick={() => setFilterType('service')}
            >
              <Wrench size={13} /> Servis &amp; Bakım
            </button>
            <button
              type="button"
              className={`cal-filter-chip ${filterType === 'field' ? 'active' : ''}`}
              onClick={() => setFilterType('field')}
            >
              <Truck size={13} /> Saha &amp; Teslimat
            </button>
          </div>
        </div>

        <div className="full-cal-body">
          <div className="full-cal-list-grid">
            {filteredEvents.map((ev) => (
              <div
                key={ev.id}
                className={`full-cal-card ${ev.isOverdue ? 'is-overdue' : ''} ${
                  selectedEvent?.id === ev.id ? 'is-selected' : ''
                }`}
                onClick={() => setSelectedEvent(ev)}
              >
                <div className="fcal-card-head">
                  <span className="fcal-card-date">
                    <Clock size={12} /> {ev.date} · {ev.time}
                  </span>
                  <span
                    className={`cal-category-pill ${
                      ev.category === 'service' ? 'pill-service' : 'pill-field'
                    }`}
                  >
                    {ev.category === 'service' ? <Wrench size={11} /> : <Truck size={11} />}
                    {ev.categoryLabel}
                  </span>
                </div>

                <h4 className="fcal-title">{ev.title}</h4>

                {ev.location && (
                  <p className="fcal-loc">
                    <MapPin size={12} /> {ev.location}
                  </p>
                )}

                <div className="fcal-footer">
                  <button
                    type="button"
                    className="primary fcal-action-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAction(ev)
                    }}
                  >
                    <span>{ev.actionLabel}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <div className="fcal-legend">
            <span><em className="legend-dot service" /> Servis &amp; Bakım</span>
            <span><em className="legend-dot field" /> Saha &amp; Teslimat</span>
            <span><em className="legend-dot overdue" /> Gecikmiş Randevular</span>
          </div>
          <button type="button" className="cancel-btn" onClick={onClose}>
            Kapat
          </button>
        </div>
      </div>
    </div>
  )
}
