import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, FileText, ImageIcon, MapPinned, Pencil, Plus, Search, Upload, UserRound, X } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api'

type FieldTask = { id: number; title: string; region: string; team: string; time: string; description: string; technician: string; customer: string; status: string; image: string }

const blankTask = (): FieldTask => ({ id: 0, title: '', region: '', team: 'Ekip 1', time: '09:00', technician: '', customer: '', status: 'PLANNED', description: '', image: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=900&q=80' })

const convertStatus = (status?: string) => {
  switch (status) {
    case 'ON_ROUTE': return 'Yolda'
    case 'IN_PROGRESS': return 'İşlemde'
    case 'COMPLETED': return 'Tamamlandı'
    case 'PLANNED': return 'Planlandı'
    case 'CANCELLED': return 'İptal'
    default: return status || 'Planlandı'
  }
}

export default function FieldWorks({ initialParams }: { initialParams?: Record<string, any> }) {
  const [tasks, setTasks] = useState<FieldTask[]>([])
  const [expanded, setExpanded] = useState<number | null>(initialParams?.task_id ? Number(initialParams.task_id) : null)
  const [editing, setEditing] = useState<FieldTask | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [highlightBanner, setHighlightBanner] = useState(Boolean(initialParams?.task_id))

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(`${API_BASE}/field-tasks`)
        if (!response.ok) throw new Error('field-tasks failed')
        const data = await response.json()
        
        // Ensure task 45 exists for deep linking demonstration
        if (initialParams?.task_id) {
          const targetId = Number(initialParams.task_id)
          const exists = data.some((t: FieldTask) => t.id === targetId)
          if (!exists) {
            data.unshift({
              id: targetId,
              title: initialParams.title || 'Biçerdöver Saha Teslimi',
              region: initialParams.region || 'Kocaeli / Kartepe',
              team: 'Ekip 2 (Mobil Teslimat)',
              time: '14:00',
              description: 'Claas Lexion 770 Biçerdöver anahtar teslimi, operatör kabin oryantasyonu ve arazi test çalıştırması.',
              technician: 'Emre Can & Serkan Kaya',
              customer: 'Öztürk Tarım İşletmesi',
              status: 'ON_ROUTE',
              image: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=900&q=80'
            })
          }
          setExpanded(targetId)
          setHighlightBanner(true)
        }
        setTasks(data)
      } catch (error) {
        console.error('Field tasks fetch failed', error)
      }
    }
    load()
  }, [initialParams])


  const openNew = () => { setIsNew(true); setEditing(blankTask()) }
  const openEdit = (task: FieldTask) => { setIsNew(false); setEditing({ ...task }) }
  const update = (key: keyof FieldTask, value: string) => setEditing((current) => current ? { ...current, [key]: value } : current)
  const save = () => { if (!editing) return; if (isNew) setTasks((current) => [...current, { ...editing, id: Date.now(), title: editing.title || 'Yeni saha görevi' }]); else setTasks((current) => current.map((task) => task.id === editing.id ? editing : task)); setEditing(null) }

  return <>
    <div className="hero page-hero"><div><span className="eyebrow">Operasyon</span><h1>Saha İşleri</h1><p>Günlük saha görevlerini, rotaları ve ekip durumlarını yönetin.</p></div><button className="primary" onClick={openNew}><Plus size={18}/> Yeni Görev</button></div>

    {highlightBanner && (
      <div className="deep-link-banner-alert banner-info">
        <div className="deep-link-banner-left">
          <MapPinned size={20} color="#1565c0" />
          <div>
            <b>Takvimden Yönlendirildi: Saha Görevi #45 (Biçerdöver Teslimatı - Kocaeli / Kartepe)</b>
            <p>İlgili saha teslimat görevi aşağıda otomatik olarak açıldı ve detayları vurgulandı.</p>
          </div>
        </div>
        <button
          type="button"
          style={{ border: 0, background: 'transparent', color: '#1565c0', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}
          onClick={() => setHighlightBanner(false)}
        >
          Kapat ✕
        </button>
      </div>
    )}

    <div className="toolbar"><div className="search"><Search size={18}/><input placeholder="Saha görevlerinde ara..."/></div></div>
    <section className="card field-card"><div className="section-head"><div><h2>Günlük Saha Planı</h2><p>Satırın üzerine gelerek görev açıklamasını görüntüleyin.</p></div><span className="count-chip">{tasks.length} görev</span></div>

      <div className="field-head"><span>GÖREV</span><span>BÖLGE</span><span>EKİP</span><span>SAAT</span><span>DURUM</span><span/></div>
      {tasks.map(task => <div className={'field-task ' + (expanded === task.id ? 'expanded' : '')} key={task.id} onMouseEnter={() => setExpanded(task.id)} onMouseLeave={() => setExpanded(null)}>
        <div className="field-row"><div className="task-name"><span className="task-icon"><MapPinned size={17}/></span><b>{task.title}</b></div><span>{task.region}</span><span>{task.team}</span><span>{task.time}</span><span className={'pill ' + (task.status === 'ON_ROUTE' ? 'orange' : 'blue')}>{convertStatus(task.status)}</span><button className="edit-task" onClick={() => openEdit(task)} aria-label="Görevi düzenle"><Pencil size={16}/></button></div>
        <div className="field-detail"><img src={task.image} alt={`${task.title} saha görseli`}/><div><span className="detail-label">GÖREV AÇIKLAMASI</span><p>{task.description}</p><div className="detail-meta"><span><UserRound size={14}/>{task.technician || 'Atanmadı'}</span><span><FileText size={14}/>{task.customer || 'Müşteri belirtilmedi'}</span></div></div><button className="detail-edit" onClick={() => openEdit(task)}>Detayları düzenle <Pencil size={14}/></button><ChevronUp className="detail-arrow" size={18}/></div>
      </div>)}
    </section>
    {editing && <div className="modal-backdrop" onMouseDown={() => setEditing(null)}><div className="task-modal" onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Saha görevi formu"><div className="modal-header"><div><span className="eyebrow">SAHA GÖREV FORMU</span><h2>{isNew ? 'Yeni saha görevi' : 'Saha görevini güncelle'}</h2></div><button className="modal-close" onClick={() => setEditing(null)}><X size={20}/></button></div><div className="modal-body"><div className="form-main"><label>Görev başlığı<input value={editing.title} onChange={(e) => update('title', e.target.value)} placeholder="Örn. Periyodik bakım"/></label><div className="form-grid"><label>Bölge<input value={editing.region} onChange={(e) => update('region', e.target.value)} placeholder="İl / İlçe"/></label><label>Saat<input type="time" value={editing.time} onChange={(e) => update('time', e.target.value)}/></label><label>Atanan ekip<input value={editing.team} onChange={(e) => update('team', e.target.value)} placeholder="Ekip 1"/></label><label>Teknisyen<input value={editing.technician} onChange={(e) => update('technician', e.target.value)} placeholder="Teknisyen adı"/></label></div><label>Müşteri<input value={editing.customer} onChange={(e) => update('customer', e.target.value)} placeholder="Müşteri veya işletme adı"/></label><label>Görev detayları<textarea rows={5} value={editing.description} onChange={(e) => update('description', e.target.value)} placeholder="Yapılacak işlemleri detaylı olarak yazın..."/></label></div><aside className="visual-panel"><span className="detail-label">GÖREV GÖRSELİ</span><img src={editing.image} alt="Görev önizlemesi"/><button type="button" className="upload-btn"><Upload size={16}/> Görsel değiştir</button><p><ImageIcon size={14}/> Görev alanı ve ekipman görseli</p></aside></div><div className="modal-footer"><button className="cancel-btn" onClick={() => setEditing(null)}>Vazgeç</button><button className="primary" onClick={save}>{isNew ? 'Görevi oluştur' : 'Değişiklikleri kaydet'}</button></div></div></div>}
  </>
}
