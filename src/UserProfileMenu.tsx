import React, { useEffect, useRef, useState } from 'react'
import {
  User, Shield, Settings, LogOut, Check, X,
  ChevronRight, MapPin, Clock,
  AlertTriangle, ExternalLink, CheckCircle2
} from 'lucide-react'
import { Page } from './types/navigation'

interface UserProfileMenuProps {
  isOpen: boolean
  onClose: () => void
  anchorPosition?: 'header' | 'sidebar'
  isSidebarCollapsed?: boolean
  onNavigate: (page: Page, params?: Record<string, any>) => void
  onOpenAccountModal?: () => void
  onOpenPreferencesModal?: () => void
  onLogout?: () => void
}

export default function UserProfileMenu({
  isOpen,
  onClose,
  anchorPosition = 'header',
  isSidebarCollapsed = false,
  onNavigate,
  onOpenAccountModal,
  onOpenPreferencesModal,
  onLogout
}: UserProfileMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  
  // Logout Modal State
  const [logoutModalOpen, setLogoutModalOpen] = useState(false)
  const [logoutToast, setLogoutToast] = useState(false)

  // Handle click outside to close popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !logoutModalOpen
      ) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, logoutModalOpen, onClose])

  // Handle ESC key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (logoutModalOpen) setLogoutModalOpen(false)
        else onClose()
      }
    }

    if (isOpen || logoutModalOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, logoutModalOpen, onClose])

  if (!isOpen && !logoutModalOpen && !logoutToast) {
    return null
  }

  const handlePerformLogout = () => {
    try {
      localStorage.removeItem('agroplus_session')
      localStorage.removeItem('agroplus_user')
      sessionStorage.clear()
    } catch (err) {
      console.warn('Logout storage clear error', err)
    }
    setLogoutModalOpen(false)
    onClose()
    setLogoutToast(true)
    setTimeout(() => {
      setLogoutToast(false)
      if (onLogout) {
        onLogout()
      } else {
        window.location.href = window.location.pathname
      }
    }, 1500)
  }

  return (
    <>
      {/* Profil Dropdown / Drop-up Popover */}
      {isOpen && (
        <div
          ref={menuRef}
          className={`user-profile-popover ${
            anchorPosition === 'sidebar'
              ? isSidebarCollapsed
                ? 'sidebar-anchored collapsed-flyout'
                : 'sidebar-anchored drop-up'
              : 'header-anchored drop-down'
          }`}
        >
          {/* Header Özeti */}
          <div className="user-profile-header">
            <div className="user-profile-avatar-wrap">
              <div className="user-avatar-lg">SA</div>
              <span className="user-status-dot" title="Çevrimiçi (Online)" />
            </div>
            <div className="user-profile-header-info">
              <div className="user-profile-name-row">
                <h4 className="user-profile-fullname">Selin Aksoy</h4>
                <span className="user-role-badge">Admin</span>
              </div>
              <p className="user-profile-email">selin.aksoy@agroplus.com</p>
              <span className="user-profile-title">Bölge Satış & Servis Müdürü</span>
            </div>
          </div>

          {/* Hızlı Bilgi & Lokasyon Alanı */}
          <div className="user-quick-info-box">
            <div className="user-info-row">
              <MapPin size={13} color="#4c9a56" />
              <span>Marmara Bölge Servis & Satış (HQ)</span>
            </div>
            <div className="user-info-row">
              <Clock size={13} color="#839187" />
              <span>Son Giriş: <b>Bugün, 09:42</b> <small>(192.168.1.104)</small></span>
            </div>
          </div>

          {/* Menü Öğeleri Listesi */}
          <div className="user-menu-items">
            {/* 1. Hesap Detayları & Güvenlik */}
            <button
              type="button"
              className="user-menu-item"
              onClick={() => {
                onClose()
                if (onOpenAccountModal) {
                  onOpenAccountModal()
                }
              }}
            >
              <div className="user-menu-item-icon"><User size={16} /></div>
              <div className="user-menu-item-text">
                <b>Hesap Detayları & Güvenlik</b>
                <small>Profil, e-posta, şifre ve 2FA</small>
              </div>
              <ChevronRight size={15} className="menu-arrow" />
            </button>

            {/* 2. Sistem Tercihleri */}
            <button
              type="button"
              className="user-menu-item"
              onClick={() => {
                onClose()
                if (onOpenPreferencesModal) {
                  onOpenPreferencesModal()
                }
              }}
            >
              <div className="user-menu-item-icon"><Settings size={16} /></div>
              <div className="user-menu-item-text">
                <b>Sistem Tercihleri</b>
                <small>Tema, bildirimler ve dil ayarı</small>
              </div>
              <ChevronRight size={15} className="menu-arrow" />
            </button>

            {/* 3. Kullanıcı & Rol Yönetimi (Yetki Matrisi Yönlendirmesi) */}
            <button
              type="button"
              className="user-menu-item"
              onClick={() => {
                onNavigate('Kullanıcı Yönetimi')
                onClose()
              }}
            >
              <div className="user-menu-item-icon"><Shield size={16} /></div>
              <div className="user-menu-item-text">
                <b>Kullanıcı & Rol Yönetimi</b>
                <small>Ekip izinleri ve yetki matrisi</small>
              </div>
              <ExternalLink size={14} className="menu-arrow" />
            </button>
          </div>

          {/* Footer & Güvenli Çıkış Butonu */}
          <div className="user-menu-footer">
            <button
              type="button"
              className="user-logout-btn"
              onClick={() => {
                setLogoutModalOpen(true)
              }}
            >
              <LogOut size={15} />
              <span>Güvenli Çıkış Yap</span>
            </button>
          </div>
        </div>
      )}

      {/* Logout Onay Modalı */}
      {logoutModalOpen && (
        <div
          className="modal-backdrop-blur"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setLogoutModalOpen(false)
            }
          }}
        >
          <div className="task-modal" style={{ maxWidth: 440, padding: 0 }}>
            <div className="logout-confirm-content">
              <div className="logout-icon-wrap">
                <AlertTriangle size={28} color="#dc2626" />
              </div>
              <h3>Oturumu kapatmak istediğinize emin misiniz?</h3>
              <p>
                Kaydedilmemiş değişiklikleriniz kaybolabilir. Tekrar giriş yapana kadar oturumunuz sonlandırılacaktır.
              </p>

              <div className="logout-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setLogoutModalOpen(false)}
                >
                  İptal
                </button>
                <button
                  type="button"
                  className="primary logout-confirm-btn"
                  onClick={handlePerformLogout}
                >
                  <LogOut size={16} /> Evet, Çıkış Yap
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout Başarı Toast Bildirimi */}
      {logoutToast && (
        <div className="logout-success-toast">
          <CheckCircle2 size={18} color="#2e7d32" />
          <span>Oturum başarıyla kapatıldı. Yönlendiriliyorsunuz...</span>
        </div>
      )}
    </>
  )
}
