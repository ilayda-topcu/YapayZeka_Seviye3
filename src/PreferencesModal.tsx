import React, { useState, useEffect } from 'react'
import { Settings, X, Check, Sun, Moon, Monitor, Globe, Bell, CheckCircle2 } from 'lucide-react'

interface PreferencesModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function PreferencesModal({ isOpen, onClose }: PreferencesModalProps) {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light')
  const [language, setLanguage] = useState<'tr' | 'en'>('tr')
  const [criticalStockAlert, setCriticalStockAlert] = useState(true)
  const [offerAndServiceAlert, setOfferAndServiceAlert] = useState(true)
  const [systemSoundAlert, setSystemSoundAlert] = useState(false)
  const [showToast, setShowToast] = useState(false)

  // Escape key listener & Body scroll lock
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setShowToast(true)
    setTimeout(() => {
      setShowToast(false)
      onClose()
    }, 1200)
  }

  return (
    <div
      className="modal-backdrop-blur"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="task-modal preferences-modal-box">
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="modal-icon-badge">
              <Settings size={22} color="#047857" />
            </div>
            <div>
              <h2>Sistem Tercihleri</h2>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6b7280' }}>
                Arayüz teması, dil seçimi ve bildirim tercihlerini yönetin.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            title="Kapat"
            aria-label="Kapat"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="modal-body" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* 1. Arayüz Teması */}
          <div>
            <label className="pref-label">Arayüz Teması</label>
            <div className="theme-selector-grid-3">
              <button
                type="button"
                className={`theme-option-card ${theme === 'light' ? 'selected' : ''}`}
                onClick={() => setTheme('light')}
              >
                <Sun size={20} color="#e65100" />
                <b>Açık Mod</b>
                <small>Aydınlık yeşil & beyaz</small>
              </button>

              <button
                type="button"
                className={`theme-option-card ${theme === 'dark' ? 'selected' : ''}`}
                onClick={() => setTheme('dark')}
              >
                <Moon size={20} color="#5c6bc0" />
                <b>Koyu Mod</b>
                <small>Göz yormayan koyu tema</small>
              </button>

              <button
                type="button"
                className={`theme-option-card ${theme === 'system' ? 'selected' : ''}`}
                onClick={() => setTheme('system')}
              >
                <Monitor size={20} color="#047857" />
                <b>Sistem</b>
                <small>Cihazla otomatik senkron</small>
              </button>
            </div>
          </div>

          {/* 2. Dil Seçimi */}
          <div>
            <label className="pref-label">
              <Globe size={13} style={{ marginRight: 5, verticalAlign: 'middle' }} />
              Dil
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'tr' | 'en')}
              className="pref-select-input"
            >
              <option value="tr">🇹🇷 Türkçe (Varsayılan)</option>
              <option value="en">🇬🇧 English (EN)</option>
            </select>
          </div>

          {/* 3. Bildirim Ayarları */}
          <div>
            <label className="pref-label" style={{ marginBottom: 10 }}>
              <Bell size={13} style={{ marginRight: 5, verticalAlign: 'middle' }} />
              Bildirim Ayarları
            </label>

            <div className="pref-toggles-list">
              {/* Kritik Stok Bildirimi */}
              <div className="pref-toggle-item">
                <div className="pref-toggle-info">
                  <b>Kritik stok seviyesi bildirimleri</b>
                  <p>Stoklar minimum eşiğin altına indiğinde anında uyarır.</p>
                </div>
                <label className="agro-switch-wrap">
                  <input
                    type="checkbox"
                    checked={criticalStockAlert}
                    onChange={(e) => setCriticalStockAlert(e.target.checked)}
                  />
                  <span className="agro-switch-slider" />
                </label>
              </div>

              {/* Yeni Teklif & Servis Uyarısı */}
              <div className="pref-toggle-item">
                <div className="pref-toggle-info">
                  <b>Yeni teklif ve servis talebi uyarıları</b>
                  <p>Müşterilerden gelen servis taleplerinde bildirim düşer.</p>
                </div>
                <label className="agro-switch-wrap">
                  <input
                    type="checkbox"
                    checked={offerAndServiceAlert}
                    onChange={(e) => setOfferAndServiceAlert(e.target.checked)}
                  />
                  <span className="agro-switch-slider" />
                </label>
              </div>

              {/* Sistem Sesli Uyarıları */}
              <div className="pref-toggle-item">
                <div className="pref-toggle-info">
                  <b>Sistem sesli uyarıları</b>
                  <p>Önemli aksiyon ve uyarılarda sesli bildirim çalar.</p>
                </div>
                <label className="agro-switch-wrap">
                  <input
                    type="checkbox"
                    checked={systemSoundAlert}
                    onChange={(e) => setSystemSoundAlert(e.target.checked)}
                  />
                  <span className="agro-switch-slider" />
                </label>
              </div>
            </div>
          </div>

          {showToast && (
            <div className="settings-success-alert">
              <CheckCircle2 size={16} /> Sistem tercihleri başarıyla kaydedildi!
            </div>
          )}

          {/* Footer Actions */}
          <div className="modal-footer" style={{ margin: '10px -24px -22px', padding: '16px 24px' }}>
            <button type="button" className="cancel-btn" onClick={onClose}>
              Kapat
            </button>
            <button type="submit" className="primary">
              <Check size={16} /> Tercihleri Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
