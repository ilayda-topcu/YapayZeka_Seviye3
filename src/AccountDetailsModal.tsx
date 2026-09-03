import React, { useState, useEffect } from 'react'
import { User, Lock, X, Check, CheckCircle2, ShieldCheck, Mail, Phone } from 'lucide-react'

interface AccountDetailsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AccountDetailsModal({ isOpen, onClose }: AccountDetailsModalProps) {
  const [name, setName] = useState('Selin Aksoy')
  const [phone, setPhone] = useState('+90 555 123 45 67')
  const [email, setEmail] = useState('selin.aksoy@agroplus.com')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true)
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
      <div className="account-modal-container">
        {/* Modal Header */}
        <div className="account-modal-header">
          <div className="account-header-title-group">
            <div className="account-header-icon-badge">
              <User size={20} color="#059669" />
            </div>
            <div>
              <h2 className="account-modal-title">Hesap Bilgileri ve Güvenlik</h2>
              <p className="account-modal-subtitle">
                Kişisel profil detaylarınızı ve hesap güvenlik ayarlarınızı güncelleyin.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="account-modal-close-btn"
            onClick={onClose}
            title="Kapat"
            aria-label="Kapat"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSave} className="account-modal-form">
          {/* Bölüm 1: Kişisel Bilgiler (Personal Info) */}
          <div className="account-form-section">
            <div className="account-section-heading">
              <User size={15} className="account-section-icon" />
              <span>Kişisel Bilgiler</span>
            </div>

            <div className="account-form-grid-2">
              <div className="account-input-group">
                <label className="account-input-label">Ad Soyad</label>
                <input
                  type="text"
                  className="account-input-field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Selin Aksoy"
                  required
                />
              </div>

              <div className="account-input-group">
                <label className="account-input-label">Telefon</label>
                <input
                  type="tel"
                  className="account-input-field"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+90 555 123 45 67"
                  required
                />
              </div>
            </div>

            <div className="account-input-group" style={{ marginTop: '12px' }}>
              <label className="account-input-label">E-posta Adresi</label>
              <input
                type="email"
                className="account-input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="selin.aksoy@agroplus.com"
                required
              />
            </div>
          </div>

          {/* Bölüm 2: Şifre ve Güvenlik (Password & Security) */}
          <div className="account-form-section" style={{ marginTop: '20px' }}>
            <div className="account-section-heading">
              <Lock size={15} className="account-section-icon" />
              <span>Şifre ve Güvenlik</span>
            </div>

            <div className="account-form-grid-2">
              <div className="account-input-group">
                <label className="account-input-label">Mevcut Şifre</label>
                <input
                  type="password"
                  className="account-input-field"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <div className="account-input-group">
                <label className="account-input-label">Yeni Şifre</label>
                <input
                  type="password"
                  className="account-input-field"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Yeni şifrenizi girin"
                />
              </div>
            </div>

            {/* 2FA Kutusu (Tam Genişlik - Full Width) */}
            <div className="account-2fa-card">
              <div className="account-2fa-left">
                <div className="account-2fa-title-row">
                  <ShieldCheck size={18} color="#059669" />
                  <b>İki Adımlı Doğrulama (2FA)</b>
                  <span className={`account-2fa-badge ${twoFactorEnabled ? 'active' : 'inactive'}`}>
                    {twoFactorEnabled ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
                <p className="account-2fa-desc">
                  Giriş yaparken ek SMS veya Authenticator onay kodu talep edilir.
                </p>
              </div>

              <label className="agro-switch-wrap">
                <input
                  type="checkbox"
                  checked={twoFactorEnabled}
                  onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                />
                <span className="agro-switch-slider" />
              </label>
            </div>
          </div>

          {showToast && (
            <div className="account-toast-success">
              <CheckCircle2 size={16} /> Değişiklikler başarıyla kaydedildi!
            </div>
          )}

          {/* Alt Buton Alanı (Footer) */}
          <div className="account-modal-footer">
            <button
              type="button"
              className="account-btn-cancel"
              onClick={onClose}
            >
              İptal
            </button>
            <button
              type="submit"
              className="account-btn-save"
            >
              <Check size={16} /> Değişiklikleri Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
