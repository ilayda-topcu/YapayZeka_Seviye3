import { useState } from 'react'
import {
  Sparkles, Send, Share2, Copy, Check, Video, Image as ImageIcon,
  MessageSquare, Play, Pause, Clock, Flame, BarChart2,
  ThumbsUp, MessageCircle, Repeat, Bookmark, RefreshCw, Layers, CheckCircle2,
  ExternalLink, Calendar, PlusCircle, MonitorPlay, Film, Palette, FileText,
  Sliders, Music, Eye, Radio, Globe, ShieldCheck
} from 'lucide-react'

type SubTab = 'post-story' | 'video' | 'image' | 'all'
type SocialPlatform = 'instagram' | 'x' | 'linkedin' | 'facebook' | 'youtube' | 'whatsapp' | 'tiktok'
type ToneOption = 'samimi' | 'kurumsal' | 'kampanya' | 'teknik'

interface StoryboardScene {
  time: string
  title: string
  visual: string
  voiceover: string
  onScreenText: string
  broll: string
}

interface SocialContentPackage {
  prompt: string
  tone: string
  audience: string
  post: {
    title: string
    body: string
    hashtags: string[]
    callToAction: string
    characterCount: number
    image: string
  }
  story: {
    headline: string
    subtext: string
    pollQuestion: string
    pollOptions: [string, string]
    linkText: string
    musicTrack: string
    expiresIn: string
    image: string
  }
  video: {
    title: string
    duration: string
    format: string
    musicStyle: string
    hook: string
    scenes: StoryboardScene[]
    summaryVoiceover: string
  }
  images: {
    title: string
    ratio: string
    description: string
    url: string
    tag: string
  }[]
}

const PRESET_PROMPTS = [
  { label: '🚜 Yeni Traktör Lansmanı', prompt: 'Yeni nesil EcoPower 120 HP akıllı traktör modelimizin tanıtımı için çiftçilere yönelik yakıt tasarrufu ve konfor odaklı lansman içeriği hazırla.' },
  { label: '🌾 Hasat Sezonu %20 İndirim', prompt: 'Hasat sezonuna özel tüm biçerdöver ve traktör orijinal yedek parçalarında geçerli %20 erken alım indirimi ve ücretsiz kargo kampanyası.' },
  { label: '💧 Akıllı Sulama Otomasyonu', prompt: 'Güneş enerjili sensörlü akıllı sulama ve nem takip sistemlerimizin su tasarrufu ve verim artışı sağlayan avantajlarını anlatan içerik.' },
  { label: '🔧 Ücretsiz Kış Bakım Günleri', prompt: 'Yetkili servislerimizde 15 Ekim tarihine kadar geçerli 24 nokta ücretsiz traktör kışlık check-up ve yağ değişim kampanyası.' },
  { label: '🌱 Organik Sıvı Gübre Desteği', prompt: 'Toprak analizine dayalı yüksek verimli organik sıvı gübre ve mikro element takviyeleri ile mahsul kalitesini ikiye katlama rehberi.' }
]

const DEMO_PACKAGE: SocialContentPackage = {
  prompt: 'Yeni nesil EcoPower 120 HP akıllı traktör lansmanı ve hasat sezonu erken alım fırsatı',
  tone: 'Samimi & Çiftçi Dili',
  audience: 'Çiftçiler ve Tarım İşletmeleri',
  post: {
    title: 'Toprağın Gücü, Teknolojinin Zirvesi: Yeni AgroPlus EcoPower 120 HP!',
    body: 'Bereketli Anadolu topraklarına güç katmaya geldik! 🌾🚜\n\nYeni nesil **AgroPlus EcoPower 120 HP**, %28 daha düşük yakıt tüketimi, akıllı GPS dümenleme desteği ve ultra geniş konforlu kabiniyle zorlu tarla koşullarını keyfe dönüştürüyor.\n\n✅ 120 Beygir Yüksek Torklu Çevreci Motor\n✅ Akıllı Otomatik Dümenleme & Tarla Haritalama\n✅ 3 Yıl / 3.000 Saat Tam Garanti\n✅ %0 Faizli 24 Ay Ziraat Bankası Kredi İmkânı\n\nErken sipariş veren ilk 50 çiftçimize ilk 3 periyodik bakım HEDİYE!',
    hashtags: ['#AgroPlus', '#EcoPower120', '#TarımTeknolojisi', '#Traktör', '#ÇiftçiDostu', '#BereketliTopraklar', '#AkıllıTarım'],
    callToAction: 'Hemen size en yakın AgroPlus yetkili bayisini ziyaret edin veya agroplus.com.tr üzerinden test sürüşü randevusu alın!',
    characterCount: 642,
    image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1200&q=80'
  },
  story: {
    headline: 'YENİ NESİL ECOPOWER 120 HP İLE TANIŞIN 🚜⚡',
    subtext: '%28 Yakıt Tasarrufu · 2 Yıl Sıfır Faiz · İlk 50 Kişiye Özel Bakım Hediyesi!',
    pollQuestion: 'Bu sezon tarlanızda en çok hangi özelliğe ihtiyaç duyuyorsunuz?',
    pollOptions: ['%28 Yakıt Tasarrufu ⛽', 'Akıllı GPS Dümenleme 📡'],
    linkText: 'Test Sürüşü Randevusu Al 👆',
    musicTrack: 'Anadolu Ezgileri & Modern Beat (Trend Ses)',
    expiresIn: '23 saat 59 dakika',
    image: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=800&q=80'
  },
  video: {
    title: '1 Dakikada Geleceğin Tarımı: EcoPower 120 HP Tarlada!',
    duration: '01:00 (60 Saniye)',
    format: '9:16 Dikey Format (Reels, TikTok, YouTube Shorts)',
    musicStyle: 'Dinamik, İlham Verici, Güçlü Tarım Temalı Ritim',
    hook: '0-5 sn: "Tarlada mazot masrafını dert eden çiftçimiz kalmasın! İşte kuralları değiştiren güç!"',
    summaryVoiceover: 'Tarlada mazot masrafını dert eden çiftçimiz kalmasın! AgroPlus EcoPower 120 HP, 120 beygir saf gücü %28 daha az yakıtla sunuyor. Akıllı GPS dümenleme ile tarlada tek bir santim bile boş kalmıyor. Geniş klimalı kabini, ergonomik kumanda paneli ve 24 ay %0 faiz avantajıyla hayalinizdeki traktör artık gerçeğe dönüşüyor. AgroPlus bayilerine gelin, tarlanızda bereketi başlatın!',
    scenes: [
      {
        time: '00:00 - 00:15',
        title: 'Bölüm 1: Kanca (Hook) & Sorun',
        visual: 'Gün doğumunda buğday tarlasında ilerleyen traktörün dramatik drone çekimi. Toz bulutu arasından parlayan LED farlar.',
        voiceover: 'Tarlada mazot masrafını dert eden çiftçimiz kalmasın! Kuralları değiştiren güç tarlaya indi.',
        onScreenText: 'MAZOT DERDİNE SON! ⚡ %28 TASARRUF',
        broll: 'Drone genel çekim + Motor kaputu tork yakın planı'
      },
      {
        time: '00:15 - 00:35',
        title: 'Bölüm 2: Çözüm & Akıllı Teknoloji',
        visual: 'Kabin içi geniş ekran GPS dümenleme görüntüsü. Çiftçinin direksiyonu bırakıp ekrandan rotayı izlediği güven anı.',
        voiceover: 'Yeni EcoPower 120 HP, akıllı GPS dümenleme sistemiyle gece gündüz santim sapmadan çalışır. Size sadece tarlanın keyfini sürmek kalır.',
        onScreenText: 'AKILLI GPS DÜMENLEME 🛰️ 0 HATA',
        broll: 'Kabin içi tablet dokunmatik ekran + Hidrolik kol çalışması'
      },
      {
        time: '00:35 - 00:50',
        title: 'Bölüm 3: Konfor & Finansman Avantajı',
        visual: 'Klimalı sessiz kabin, havalı süspansiyonlu koltuk. Ekranda %0 Faiz Ziraat Bankası logosu ve kampanya rozeti.',
        voiceover: 'Yorulmak yok, ertelemek yok! 24 aya varan %0 faizli Ziraat Bankası finansman desteğiyle şimdi tarlanızda.',
        onScreenText: '%0 FAİZLİ 24 AY KREDİ 🌾 3 YIL GARANTİ',
        broll: 'Süspansiyon detayları + Hızlı finansman grafiği'
      },
      {
        time: '00:50 - 01:00',
        title: 'Bölüm 4: Harekete Geçirici Mesaj (CTA)',
        visual: 'Traktörün gün batımında çiftçiyle birlikte durduğu görkemli kapanış sahnesi. AgroPlus logosu, web sitesi ve bayi iletişim bilgisi.',
        voiceover: 'Hemen en yakın AgroPlus bayisine gelin, test sürüşü yapın, ilk 50 kişiye özel hediyeleri kaçırmayın!',
        onScreenText: 'HEMEN TEST SÜRÜŞÜNE GELİN 👉 agroplus.com.tr',
        broll: 'AgroPlus Logo & Yetkili Bayi Haritası'
      }
    ]
  },
  images: [
    {
      title: 'Ana Kampanya Lansman Afişi',
      ratio: '1:1 (Kare - Instagram/Facebook)',
      description: 'Gündoğumu ışığında tarlada çalışan EcoPower 120 HP, tipografik kampanya metinleri ve AgroPlus logosuyla.',
      url: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1000&q=80',
      tag: 'Feed Postu'
    },
    {
      title: '24 Saatlik Story / Durum Kartı',
      ratio: '9:16 (Dikey Story)',
      description: 'Neon vurgulu %28 yakıt tasarrufu ve 24 ay faizsiz kredi vurgulu dikey mobil tasarım.',
      url: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=1000&q=80',
      tag: 'Story & Durum'
    },
    {
      title: 'Teknik Detay & Kabin İçi İnfografik',
      ratio: '16:9 (Yatay - YouTube / LinkedIn)',
      description: 'Akıllı kabin ekranı, GPS rota dümenleme ve ergonomik vites konsolu detay fotoğrafı.',
      url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1000&q=80',
      tag: 'Banner / Yatay'
    },
    {
      title: 'Hasat & Tarla Performans Çekimi',
      ratio: '4:5 (Dikey Portre)',
      description: 'Zorlu toprak koşullarında pulluk çeken traktörün dinamik hareketli aksiyon karesi.',
      url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1000&q=80',
      tag: 'Aksiyon Çekimi'
    }
  ]
}

const CONNECTED_ACCOUNTS = [
  { id: 'facebook', name: 'Facebook', handle: 'AgroPlus Türkiye Resmi Sayfası', followers: '48.5K Takipçi', iconColor: '#1877F2', type: 'Meta Business Suite' },
  { id: 'x', name: 'X (Twitter)', handle: '@AgroPlusTR', followers: '29.2K Takipçi', iconColor: '#000000', type: 'Doğrulanmış Kurumsal' },
  { id: 'instagram', name: 'Instagram', handle: '@agroplus.tarim', followers: '74.8K Takipçi', iconColor: '#E4405F', type: 'Profesyonel İçerik' },
  { id: 'linkedin', name: 'LinkedIn', handle: 'AgroPlus Tarım Teknolojileri A.Ş.', followers: '18.3K Bağlantı', iconColor: '#0A66C2', type: 'Şirket Sayfası' },
  { id: 'youtube', name: 'YouTube', handle: 'AgroPlus TV (Shorts & Video)', followers: '52.1K Abone', iconColor: '#FF0000', type: 'Kanal & Shorts' },
  { id: 'whatsapp', name: 'WhatsApp Durum', handle: 'AgroPlus Bayi & Müşteri Ağı', followers: '12.4K Kişi', iconColor: '#25D366', type: '24 Saatlik Durum' },
  { id: 'tiktok', name: 'TikTok', handle: '@agroplus_official', followers: '36.7K Takipçi', iconColor: '#000000', type: 'Kısa Video' }
]

export default function SocialMediaAgent() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('post-story')
  const [promptInput, setPromptInput] = useState(DEMO_PACKAGE.prompt)
  const [selectedTone, setSelectedTone] = useState<ToneOption>('samimi')
  const [targetAudience, setTargetAudience] = useState('Çiftçiler ve Tarım İşletmeleri')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationStep, setGenerationStep] = useState(0)
  const [contentPackage, setContentPackage] = useState<SocialContentPackage>(DEMO_PACKAGE)
  const [activePlatformPreview, setActivePlatformPreview] = useState<SocialPlatform>('instagram')
  const [copiedSection, setCopiedSection] = useState<string | null>(null)
  
  // Video Player Simülatörü
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [videoProgress, setVideoProgress] = useState(15) // %15

  // Paylaş Modalı State'leri
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>(['instagram', 'x', 'facebook', 'linkedin', 'youtube'])
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishSuccessMessage, setPublishSuccessMessage] = useState<string | null>(null)

  // AI Pipeline Adımları
  const pipelineSteps = [
    { title: 'Trend & Pazar Analizi Ajanı', desc: 'Tarım sektörü hashtag ve etkileşim dinamikleri taranıyor...' },
    { title: 'Metin & Hashtag Yazarı Ajanı (Copywriter)', desc: 'Platforma özel başlık, metin ve harekete geçirici mesaj yazılıyor...' },
    { title: '24 Saatlik Durum & Story Ajanı', desc: 'Hikaye kartı, anket seçenekleri ve çıkartmalar tasarlanıyor...' },
    { title: '1 Dakikalık Video & Senaryo Ajanı', desc: '60 saniyelik sahne sahne storyboard ve seslendirme metni üretiliyor...' },
    { title: 'Ultra HD Görsel Tasarım Ajanı (Diffusion)', desc: 'Yüksek kaliteli tarım ve ürün görselleri render ediliyor...' }
  ]

  const handleStartGeneration = async () => {
    if (!promptInput.trim()) return
    setIsGenerating(true)
    setPublishSuccessMessage(null)

    // Ajan adımlarını sırayla simüle et
    for (let i = 0; i < pipelineSteps.length; i++) {
      setGenerationStep(i)
      await new Promise(r => setTimeout(r, 650))
    }

    // Seçilen tona ve prompta göre içeriği güncelle
    const updatedPackage: SocialContentPackage = {
      ...DEMOPackageCustomized(promptInput, selectedTone, targetAudience)
    }
    setContentPackage(updatedPackage)
    setIsGenerating(false)
    setGenerationStep(0)
  }

  function DEMOPackageCustomized(prompt: string, tone: ToneOption, audience: string): SocialContentPackage {
    const isDiscount = prompt.toLowerCase().includes('indirim') || prompt.toLowerCase().includes('kampanya')
    const isMaintenance = prompt.toLowerCase().includes('bakım') || prompt.toLowerCase().includes('servis')
    const isIrrigation = prompt.toLowerCase().includes('sulama') || prompt.toLowerCase().includes('su')

    let title = 'Toprağın Gücü, Teknolojinin Zirvesi: AgroPlus ile Geleceğe!'
    let body = `Tarlada bereketi artıracak çözümle karşınızdayız! 🌱\n\n"${prompt}" konusunda hazırlanan özel çözümlerimizle çiftçimizin her daim yanındayız.\n\n✅ Yüksek Performans & Güvenilirlik\n✅ Uzman Servis ve Yedek Parça Desteği\n✅ Uygun Finansman ve Taksit Seçenekleri\n\nDetaylı bilgi için size en yakın bayimize bekliyoruz!`
    let hashtags = ['#AgroPlus', '#TarımTeknolojisi', '#BereketliTopraklar', '#AkıllıTarım', '#ÇiftçiDostu']
    let hook = '0-5 sn: "Tarlada verimi ikiye katlamanın sırrı burada!"'

    if (isDiscount) {
      title = 'BÜYÜK HASAT FIRSATI: Orijinal Yedek Parçada %20 İndirim Başladı! 🌾🔥'
      body = `Hasat zamanı tarlada durmak yok! 🚜💨\n\nAgroPlus yetkili bayilerinde tüm traktör ve biçerdöver orijinal yedek parçalarında **%20 ERKEN ALIM İNDİRİMİ** ve ücretsiz kargo avantajı sizleri bekliyor!\n\n🔴 Orijinal Filtre, Kayış ve Bıçak Gruplarında Özel Fiyat\n🔴 Ücretsiz Teknik Danışmanlık\n🔴 81 İle Aynı Gün Hızlı Kargo\n\nStoklarla sınırlı bu kampanyayı kaçırmayın!`
      hashtags = ['#AgroPlusİndirim', '#HasatFırsatı', '#YedekParça', '#TraktörBakım', '#Tarım', '#Kampanya']
      hook = '0-5 sn: "Hasat öncesi bu fırsatı kaçıran çok üzülür! %20 net indirim!"'
    } else if (isMaintenance) {
      title = 'Kış Gelmeden Traktörünüz Güvende: 24 Nokta Ücretsiz Bakım Günleri! ❄️🔧'
      body = `Kışın zorlu şartları başlamadan traktörünüzü tam korumaya alın! 🚜🛡️\n\n15 Ekim tarihine kadar tüm AgroPlus yetkili servislerimizde **24 Nokta Ücretsiz Kışlık Kontrol** ve sıvı seviye kontrolleri hediye!\n\n🔹 Antifriz ve Akü Performans Testi\n🔹 Hidrolik ve Fren Sistemi Kontrolü\n🔹 Orijinal Yağ Değişiminde %15 İndirim\n\nHemen randevunuzu oluşturun, kışa kafanız rahat girin!`
      hashtags = ['#AgroPlusServis', '#TraktörBakım', '#KışBakımı', '#ÜcretsizServis', '#TarımTeknik']
      hook = '0-5 sn: "Traktörünüz kışa hazır mı? Ücretsiz bakım günleri başladı!"'
    } else if (isIrrigation) {
      title = 'Damla Damla Tasarruf, Maksimum Mahsul: Akıllı Sulama Sistemleri! 💧🌾'
      body = `Geleceğin tarımı akıllı su yönetimiyle başlıyor! 💧⚡\n\nAgroPlus Akıllı Sensörlü Sulama Sistemleri ile:\n\n🌱 %40 Su ve Elektrik Tasarrufu\n📱 Cep Telefonundan Tek Tuşla Sulama Yönetimi\n☀️ Güneş Enerjisi (Solar) Uyumlu Çalışma\n\nKuraklığa karşı toprağınızı koruyun, verimi zirveye taşıyın!`
      hashtags = ['#AkıllıSulama', '#SuTasarrufu', '#GüneşEnerjisi', '#ModernTarım', '#AgroPlus']
      hook = '0-5 sn: "Sulama faturanızı yarıya indirmeye hazır mısınız?"'
    }

    return {
      prompt,
      tone: tone === 'samimi' ? 'Samimi & Çiftçi Dili' : tone === 'kurumsal' ? 'Kurumsal & Güvenilir' : tone === 'kampanya' ? 'Heyecanlı & Kampanya' : 'Teknik & Detaylı',
      audience,
      post: {
        title,
        body,
        hashtags,
        callToAction: 'Hemen size en yakın AgroPlus yetkili bayisini ziyaret edin veya profildeki linke tıklayın!',
        characterCount: body.length + hashtags.join(' ').length,
        image: isDiscount
          ? 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80'
          : isMaintenance
          ? 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80'
          : 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1200&q=80'
      },
      story: {
        headline: title.slice(0, 45) + '... 🚜⚡',
        subtext: 'Kaçırılmayacak Avantajlar ve Özel Hediyeler İçin Kaydırın!',
        pollQuestion: 'Bu fırsatı hemen tarlanızda denemek ister misiniz?',
        pollOptions: ['Evet, Hemen Bilgi Al! 🚀', 'Detayları İncele 🔍'],
        linkText: 'Detaylar ve Randevu İçin Tıkla 👆',
        musicTrack: 'Tarım & Doğa Temalı Trend Ritim',
        expiresIn: '23 saat 59 dakika',
        image: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=800&q=80'
      },
      video: {
        title: `1 Dakikada ${prompt.slice(0, 30)}...`,
        duration: '01:00 (60 Saniye)',
        format: '9:16 Dikey Format (Reels, TikTok, Shorts)',
        musicStyle: 'Enerjik & İlham Verici Anadolu Ritimleri',
        hook,
        summaryVoiceover: `${hook} ${body.replace(/(\r\n|\n|\r)/gm, ' ')}`,
        scenes: DEMO_PACKAGE.video.scenes
      },
      images: DEMO_PACKAGE.images
    }
  }

  const handleCopy = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text)
    setCopiedSection(sectionKey)
    setTimeout(() => setCopiedSection(null), 2500)
  }

  const toggleAccountSelection = (id: string) => {
    if (selectedAccounts.includes(id)) {
      setSelectedAccounts(selectedAccounts.filter(a => a !== id))
    } else {
      setSelectedAccounts([...selectedAccounts, id])
    }
  }

  const selectAllAccounts = () => {
    if (selectedAccounts.length === CONNECTED_ACCOUNTS.length) {
      setSelectedAccounts([])
    } else {
      setSelectedAccounts(CONNECTED_ACCOUNTS.map(a => a.id))
    }
  }

  const handlePublishNow = async () => {
    if (selectedAccounts.length === 0) return
    setIsPublishing(true)
    setPublishSuccessMessage(null)

    await new Promise(r => setTimeout(r, 1600))

    const accountNames = CONNECTED_ACCOUNTS
      .filter(a => selectedAccounts.includes(a.id))
      .map(a => a.name)
      .join(', ')

    setIsPublishing(false)
    setIsShareModalOpen(false)
    setPublishSuccessMessage(`🚀 İçerik başarıyla yayınlandı! (${accountNames}) hesaplarında paylaşıldı ve yayın analitiklerine eklendi.`)
  }

  return (
    <div className="social-agent-container">
      {/* Üst Başlık & Hero */}
      <div className="hero page-hero" style={{ marginBottom: 20 }}>
        <div>
          <span className="eyebrow">Yapay Zeka &amp; Sosyal Medya Otomasyonu</span>
          <h1>Sosyal Medya İçeriği Üret Ajanı</h1>
          <p>Yapay zeka ajanı ile saniyeler içinde sosyal medya postu, 24 saatlik durum hikayesi, 1 dakikalık video senaryosu ve görseller üretin.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="primary"
            onClick={() => setIsShareModalOpen(true)}
            style={{ backgroundColor: '#143e2c', display: 'flex', alignItems: 'center', gap: 7 }}
          >
            <Share2 size={17} /> Sosyal Medyada Paylaş ({selectedAccounts.length})
          </button>
        </div>
      </div>

      {/* Başarı Bildirimi */}
      {publishSuccessMessage && (
        <div style={{
          padding: '14px 18px',
          marginBottom: 18,
          borderRadius: 10,
          backgroundColor: '#eaf8eb',
          border: '1px solid #a5d6a7',
          color: '#1b5e20',
          fontSize: 13,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          boxShadow: '0 4px 12px rgba(46, 125, 50, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckCircle2 size={20} color="#2e7d32" />
            <span>{publishSuccessMessage}</span>
          </div>
          <button
            onClick={() => setPublishSuccessMessage(null)}
            style={{ border: 0, background: 'transparent', cursor: 'pointer', color: '#1b5e20', fontSize: 13, fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* 3 Seçenekli Üst Menü / Sekmeler */}
      <div className="agent-subtabs-nav">
        <button
          className={`agent-subtab-btn ${activeSubTab === 'post-story' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('post-story')}
        >
          <MessageSquare size={17} />
          <span>Medya Postu &amp; Durum Paylaşımı (24s)</span>
          <em className="tab-pill">Post &amp; Story</em>
        </button>

        <button
          className={`agent-subtab-btn ${activeSubTab === 'video' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('video')}
        >
          <Video size={17} />
          <span>Video İçeriği (1 dk)</span>
          <em className="tab-pill">Reels / Shorts / TikTok</em>
        </button>

        <button
          className={`agent-subtab-btn ${activeSubTab === 'image' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('image')}
        >
          <ImageIcon size={17} />
          <span>Görsel Üretimi</span>
          <em className="tab-pill">Ultra HD Diffusion</em>
        </button>

        <button
          className={`agent-subtab-btn ${activeSubTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('all')}
        >
          <Layers size={17} />
          <span>Tüm Paketi Görüntüle</span>
          <em className="tab-pill gold">Multi-Agent Paket</em>
        </button>
      </div>

      {/* AI Prompt Yazı Yazma Ajanı Giriş Kartı */}
      <section className="card" style={{ marginBottom: 22, border: '1.5px solid #d0e4d2', backgroundColor: '#fcfdfc' }}>
        <div className="section-head" style={{ marginBottom: 14 }}>
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#143e2c' }}>
              <Sparkles size={18} color="#e54a3c" />
              AI İçerik Yazma &amp; Üretim Ajanı
            </h2>
            <p>İçerik fikrinizi, kampanyayı veya duyurmak istediğiniz konuyu yazın; AI ajanı tüm mecralara uygun içerikleri hazırlasın.</p>
          </div>
          <span style={{ fontSize: 11, backgroundColor: '#e7f3e8', color: '#2e7d32', padding: '4px 10px', borderRadius: 20, fontWeight: 700 }}>
            ⚡ GPT-4o &amp; Diffusion Motoru Aktif
          </span>
        </div>

        {/* Hazır Prompt Şablonları */}
        <div style={{ marginBottom: 14 }}>
          <span style={{ fontSize: 11, color: '#687b70', fontWeight: 600, display: 'block', marginBottom: 6 }}>
            💡 Hızlı Prompt Şablonları:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {PRESET_PROMPTS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                className="preset-chip"
                onClick={() => setPromptInput(item.prompt)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Prompt Input Textarea */}
        <div style={{ position: 'relative', marginBottom: 14 }}>
          <textarea
            rows={3}
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            placeholder="Örn: Yeni nesil 120 HP akıllı traktörümüz için çiftçilere yönelik yakıt tasarrufu odaklı lansman ve %20 erken alım indirimi..."
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: 13,
              borderRadius: 10,
              border: '1.5px solid #c7dccb',
              backgroundColor: '#fff',
              outline: 'none',
              fontFamily: 'inherit',
              lineHeight: 1.5,
              resize: 'vertical',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)'
            }}
          />
        </div>

        {/* Ayarlar: Ton, Hedef Kitle & Üret Butonu */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#4a5d52', display: 'block', marginBottom: 5 }}>
              Yazım Tonu (Tone of Voice):
            </label>
            <select
              value={selectedTone}
              onChange={(e) => setSelectedTone(e.target.value as ToneOption)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 8,
                border: '1px solid #cddcd0',
                backgroundColor: '#fff',
                fontSize: 12,
                fontWeight: 600,
                color: '#243b2e'
              }}
            >
              <option value="samimi">🌾 Samimi &amp; Çiftçi Dili (Tavsiye Edilen)</option>
              <option value="kurumsal">🏢 Kurumsal &amp; Güvenilir</option>
              <option value="kampanya">🔥 Heyecanlı &amp; Kampanya / İndirim</option>
              <option value="teknik">⚙️ Teknik &amp; Donanım Detaylı</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#4a5d52', display: 'block', marginBottom: 5 }}>
              Hedef Kitle:
            </label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 8,
                border: '1px solid #cddcd0',
                backgroundColor: '#fff',
                fontSize: 12,
                fontWeight: 600,
                color: '#243b2e'
              }}
            >
              <option value="Çiftçiler ve Tarım İşletmeleri">Çiftçiler ve Tarım İşletmeleri</option>
              <option value="Tarım Kooperatifleri & Bayiler">Tarım Kooperatifleri &amp; Bayiler</option>
              <option value="Meyve / Sebze ve Sera Üreticileri">Meyve / Sebze ve Sera Üreticileri</option>
              <option value="Genel Kamuoyu ve Sektör Takipçileri">Genel Kamuoyu ve Sektör Takipçileri</option>
            </select>
          </div>

          <div>
            <button
              className="primary"
              onClick={handleStartGeneration}
              disabled={isGenerating || !promptInput.trim()}
              style={{
                width: '100%',
                padding: '11px 18px',
                height: 42,
                justifyContent: 'center',
                fontSize: 13,
                boxShadow: '0 6px 16px rgba(229, 74, 60, 0.3)'
              }}
            >
              {isGenerating ? (
                <>
                  <RefreshCw size={16} className="spin-icon" /> AI Ajanları Çalışıyor...
                </>
              ) : (
                <>
                  <Sparkles size={16} /> AI ile İçerikleri Sırayla Üret
                </>
              )}
            </button>
          </div>
        </div>

        {/* AI Çoklu Ajan Çalışma Pipeline Stepper Animasyonu */}
        {isGenerating && (
          <div style={{ marginTop: 20, padding: 16, backgroundColor: '#f2f8f3', borderRadius: 10, border: '1px solid #c9e4cd' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#1e5338', display: 'block', marginBottom: 12 }}>
              🤖 Yapay Zeka Ajanları Sırayla İşlem Yapıyor ({generationStep + 1} / {pipelineSteps.length}):
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
              {pipelineSteps.map((step, idx) => {
                const isCurrent = generationStep === idx
                const isDone = generationStep > idx
                return (
                  <div
                    key={idx}
                    style={{
                      padding: 10,
                      borderRadius: 8,
                      backgroundColor: isCurrent ? '#fff' : isDone ? '#e5f3e7' : '#fafafa',
                      border: `1.5px solid ${isCurrent ? '#e54a3c' : isDone ? '#54a25c' : '#e0e0e0'}`,
                      boxShadow: isCurrent ? '0 4px 12px rgba(229, 74, 60, 0.15)' : 'none',
                      transition: 'all 0.25s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      {isDone ? (
                        <Check size={14} color="#2e7d32" strokeWidth={3} />
                      ) : isCurrent ? (
                        <RefreshCw size={14} color="#e54a3c" className="spin-icon" />
                      ) : (
                        <span style={{ width: 14, height: 14, borderRadius: '50%', border: '1.5px solid #bbb', display: 'inline-block' }} />
                      )}
                      <b style={{ fontSize: 11, color: isCurrent ? '#e54a3c' : isDone ? '#1e5338' : '#777' }}>
                        Adım {idx + 1}
                      </b>
                    </div>
                    <p style={{ margin: 0, fontSize: 10, fontWeight: 600, color: '#333' }}>{step.title}</p>
                    <small style={{ fontSize: 9, color: '#666', display: 'block', marginTop: 2 }}>{step.desc}</small>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </section>

      {/* ========================================================= */}
      {/* SEKME 1: MEDYA POSTU & DURUM PAYLAŞIMI (24 SAAT GEÇERLİ) */}
      {/* ========================================================= */}
      {(activeSubTab === 'post-story' || activeSubTab === 'all') && (
        <div style={{ marginBottom: 26 }}>
          <div className="section-head" style={{ marginBottom: 14 }}>
            <div>
              <h2 style={{ fontSize: 17, color: '#143e2c', display: 'flex', alignItems: 'center', gap: 7 }}>
                <MessageSquare size={19} color="#2e7d32" />
                1. Seçenek: Sosyal Medya Postu &amp; 24 Saatlik Durum Paylaşımı
              </h2>
              <p>Çoklu platform post metni ve 24 saat geçerli hikaye (story / status) canlı önizlemesi.</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="text-btn"
                onClick={() => handleCopy(`${contentPackage.post.title}\n\n${contentPackage.post.body}\n\n${contentPackage.post.hashtags.join(' ')}`, 'post')}
              >
                {copiedSection === 'post' ? <Check size={15} color="#2e7d32" /> : <Copy size={15} />}
                {copiedSection === 'post' ? 'Kopyalandı!' : 'Metni Kopyala'}
              </button>
              <button
                className="primary"
                onClick={() => setIsShareModalOpen(true)}
                style={{ padding: '7px 12px', fontSize: 11 }}
              >
                <Share2 size={14} /> Paylaş
              </button>
            </div>
          </div>

          <div className="grid-main" style={{ gridTemplateColumns: '1.25fr 1fr', gap: 18 }}>
            {/* Sol: Sosyal Medya Postu Kartı & Platform Önizleyicisi */}
            <div className="card" style={{ padding: 18 }}>
              {/* Platform Seçici Sekmeler */}
              <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid #edf2ee', paddingBottom: 10, marginBottom: 14, overflowX: 'auto' }}>
                {(['instagram', 'x', 'linkedin', 'facebook'] as SocialPlatform[]).map((p) => {
                  const labelMap: Record<string, string> = {
                    instagram: 'Instagram',
                    x: 'X (Twitter)',
                    linkedin: 'LinkedIn',
                    facebook: 'Facebook'
                  }
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setActivePlatformPreview(p)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        border: 0,
                        backgroundColor: activePlatformPreview === p ? '#143e2c' : '#f0f4f1',
                        color: activePlatformPreview === p ? '#fff' : '#52665b',
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5
                      }}
                    >
                      <Globe size={13} /> {labelMap[p]}
                    </button>
                  )
                })}
              </div>

              {/* Sosyal Medya Post Mockup'ı */}
              <div style={{ border: '1px solid #e2ece3', borderRadius: 12, overflow: 'hidden', backgroundColor: '#fff' }}>
                {/* Profil Başlığı */}
                <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f0f4f1' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#143e2c', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 11 }}>
                      AP
                    </div>
                    <div>
                      <b style={{ fontSize: 12, color: '#1e382b', display: 'flex', alignItems: 'center', gap: 4 }}>
                        AgroPlus Türkiye
                        <ShieldCheck size={13} color="#1877F2" />
                      </b>
                      <small style={{ fontSize: 10, color: '#88998f', display: 'block' }}>
                        {activePlatformPreview === 'x' ? '@AgroPlusTR' : 'Sponsorlu / Resmi Sayfa'} · Şimdi
                      </small>
                    </div>
                  </div>
                  <button className="icon-btn" style={{ width: 28, height: 28 }}><Repeat size={14} /></button>
                </div>

                {/* Post Görseli */}
                <div style={{ position: 'relative' }}>
                  <img
                    src={contentPackage.post.image}
                    alt="Sosyal Medya Post Görseli"
                    style={{ width: '100%', maxHeight: 310, objectFit: 'cover', display: 'block' }}
                  />
                  <span style={{ position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: 10, padding: '3px 8px', borderRadius: 4 }}>
                    🌾 AgroPlus Orijinal
                  </span>
                </div>

                {/* Butonlar & Aksiyonlar */}
                <div style={{ padding: '10px 14px 4px', display: 'flex', justifyContent: 'space-between', color: '#55695d' }}>
                  <div style={{ display: 'flex', gap: 14 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, cursor: 'pointer' }}><ThumbsUp size={15} /> 1.4K</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, cursor: 'pointer' }}><MessageCircle size={15} /> 184</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, cursor: 'pointer' }}><Repeat size={15} /> 92</span>
                  </div>
                  <Bookmark size={15} style={{ cursor: 'pointer' }} />
                </div>

                {/* Metin & Hashtag İçeriği */}
                <div style={{ padding: '10px 14px 14px' }}>
                  <h3 style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, color: '#1b3a2a' }}>
                    {contentPackage.post.title}
                  </h3>
                  <p style={{ margin: '0 0 10px', fontSize: 12, color: '#3d5246', lineHeight: 1.55, whiteSpace: 'pre-line' }}>
                    {contentPackage.post.body}
                  </p>
                  <p style={{ margin: '0 0 8px', fontSize: 11, color: '#1b74e4', fontWeight: 600, lineHeight: 1.4 }}>
                    {contentPackage.post.hashtags.join(' ')}
                  </p>
                  <div style={{ padding: '8px 10px', backgroundColor: '#f6faf7', borderRadius: 6, border: '1px dashed #c9decb', fontSize: 11, color: '#2e7d32', fontWeight: 600 }}>
                    👉 {contentPackage.post.callToAction}
                  </div>
                </div>
              </div>
            </div>

            {/* Sağ: 24 Saat Geçerli Durum / Story Simülatörü */}
            <div className="card" style={{ padding: 18 }}>
              <div className="section-head" style={{ marginBottom: 12 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 14, color: '#143e2c', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={16} color="#e54a3c" />
                    24 Saatlik Durum / Story Önizlemesi
                  </h3>
                  <p style={{ fontSize: 11, color: '#7a8d82' }}>Instagram Story &amp; WhatsApp Durum Formatı (9:16)</p>
                </div>
                <span style={{ fontSize: 10, backgroundColor: '#fdeeed', color: '#c62828', padding: '3px 8px', borderRadius: 12, fontWeight: 700 }}>
                  ⏳ 24 Saat Geçerli
                </span>
              </div>

              {/* Mobil Telefon Story Çerçevesi */}
              <div className="story-phone-mockup">
                {/* Story Üst Bar & Süre İlerlemesi */}
                <div className="story-top-bars">
                  <div className="story-progress-bar"><div className="story-fill" style={{ width: '65%' }} /></div>
                  <div className="story-progress-bar"><div className="story-fill" style={{ width: '0%' }} /></div>
                </div>

                {/* Profil & Canlı Zaman Bilgisi */}
                <div className="story-header-overlay">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#ec4437', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 700 }}>
                      AP
                    </div>
                    <div>
                      <b style={{ fontSize: 11, color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>agroplus.tarim</b>
                      <span style={{ fontSize: 9, color: '#eee', marginLeft: 6 }}>Kalan: 23s 58dk</span>
                    </div>
                  </div>
                  <span style={{ color: '#fff', fontSize: 12 }}>✕</span>
                </div>

                {/* Arka Plan Görseli */}
                <img
                  src={contentPackage.story.image}
                  alt="24 Saatlik Story"
                  className="story-bg-image"
                />

                {/* Story İçerik Katmanı & Çıkartmalar */}
                <div className="story-content-layer">
                  {/* Başlık Rozeti */}
                  <div className="story-badge">
                    <Flame size={13} color="#ff9800" />
                    <span>{contentPackage.story.headline}</span>
                  </div>

                  {/* Alt Bilgi Kutusu */}
                  <div className="story-subcard">
                    <p style={{ margin: 0, fontSize: 11, color: '#fff', fontWeight: 600 }}>
                      {contentPackage.story.subtext}
                    </p>
                  </div>

                  {/* İnteraktif Anket Sticker'ı */}
                  <div className="story-poll-sticker">
                    <span className="poll-title">{contentPackage.story.pollQuestion}</span>
                    <div className="poll-options">
                      <button className="poll-opt">{contentPackage.story.pollOptions[0]}</button>
                      <button className="poll-opt">{contentPackage.story.pollOptions[1]}</button>
                    </div>
                  </div>

                  {/* Müzik Etiketi */}
                  <div className="story-music-tag">
                    <Music size={12} color="#fff" />
                    <span>{contentPackage.story.musicTrack}</span>
                  </div>

                  {/* Kaydırmalı Bağlantı (CTA) */}
                  <div className="story-swipe-link">
                    <span>{contentPackage.story.linkText}</span>
                    <ExternalLink size={12} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SEKME 2: 1 DAKİKALIK VİDEO İÇERİĞİ (REELS / SHORTS / TIKTOK) */}
      {/* ========================================================= */}
      {(activeSubTab === 'video' || activeSubTab === 'all') && (
        <div style={{ marginBottom: 26 }}>
          <div className="section-head" style={{ marginBottom: 14 }}>
            <div>
              <h2 style={{ fontSize: 17, color: '#143e2c', display: 'flex', alignItems: 'center', gap: 7 }}>
                <Film size={19} color="#d84315" />
                2. Seçenek: 1 Dakikalık Dikey Video İçeriği &amp; Storyboard (60 sn)
              </h2>
              <p>Reels, YouTube Shorts ve TikTok için sahne sahne kurgulanmış seslendirme, B-roll ve metin senaryosu.</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="text-btn"
                onClick={() => handleCopy(contentPackage.video.summaryVoiceover, 'video')}
              >
                {copiedSection === 'video' ? <Check size={15} color="#2e7d32" /> : <Copy size={15} />}
                {copiedSection === 'video' ? 'Seslendirmeyi Kopyala' : 'Senaryoyu Kopyala'}
              </button>
              <button
                className="primary"
                onClick={() => setIsShareModalOpen(true)}
                style={{ padding: '7px 12px', fontSize: 11 }}
              >
                <Share2 size={14} /> Videoyu Paylaş
              </button>
            </div>
          </div>

          <div className="grid-main" style={{ gridTemplateColumns: '1fr 1.5fr', gap: 18 }}>
            {/* Sol: 1 Dakikalık Video Önizleme Oynatıcısı & Metrikler */}
            <div className="card" style={{ padding: 18 }}>
              <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', backgroundColor: '#000', height: 380 }}>
                <img
                  src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80"
                  alt="Video Önizleme"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
                />

                {/* Video Başlığı & Kanca Rozeti */}
                <div style={{ position: 'absolute', top: 14, left: 14, right: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ backgroundColor: 'rgba(229, 74, 60, 0.9)', color: '#fff', fontSize: 10, padding: '4px 8px', borderRadius: 4, fontWeight: 700 }}>
                    🎬 1 DK VİDEO REELS
                  </span>
                  <span style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 10, padding: '4px 8px', borderRadius: 4 }}>
                    00:{videoProgress < 10 ? `0${Math.floor(videoProgress * 0.6)}` : Math.floor(videoProgress * 0.6)} / 01:00
                  </span>
                </div>

                {/* Ekran Üzeri Metin (On-Screen Text) */}
                <div style={{ position: 'absolute', top: '35%', left: 14, right: 14, textAlign: 'center' }}>
                  <div style={{ backgroundColor: '#ffeb3b', color: '#000', display: 'inline-block', padding: '6px 14px', borderRadius: 6, fontWeight: 800, fontSize: 13, textTransform: 'uppercase', boxShadow: '0 4px 10px rgba(0,0,0,0.4)' }}>
                    MAZOT DERDİNE SON! ⚡ %28 TASARRUF
                  </div>
                  <p style={{ color: '#fff', fontSize: 11, marginTop: 8, textShadow: '0 2px 4px rgba(0,0,0,0.9)', fontWeight: 600 }}>
                    "Tarlada kuralları değiştiren güç tarlaya indi!"
                  </p>
                </div>

                {/* Oynat / Durdur Butonu */}
                <div style={{ position: 'absolute', top: '55%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                  <button
                    onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                    style={{
                      width: 54,
                      height: 54,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(229, 74, 60, 0.95)',
                      border: '2px solid #fff',
                      color: '#fff',
                      display: 'grid',
                      placeItems: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 6px 20px rgba(0,0,0,0.5)'
                    }}
                  >
                    {isVideoPlaying ? <Pause size={22} /> : <Play size={22} style={{ marginLeft: 3 }} />}
                  </button>
                </div>

                {/* Alt Oynatıcı Kontrolleri & Zaman Çubuğu */}
                <div style={{ position: 'absolute', bottom: 12, left: 14, right: 14 }}>
                  <div style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2, marginBottom: 8, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${videoProgress}%`, backgroundColor: '#e54a3c', borderRadius: 2 }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: 10 }}>
                    <span>{contentPackage.video.musicStyle}</span>
                    <span>1080x1920 (9:16)</span>
                  </div>
                </div>
              </div>

              {/* Video Parametreleri */}
              <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11 }}>
                <div style={{ padding: 8, backgroundColor: '#f6faf7', borderRadius: 6, border: '1px solid #e2ece3' }}>
                  <span style={{ color: '#7a8d81', fontSize: 9, display: 'block' }}>SÜRE &amp; FORMAT</span>
                  <b>{contentPackage.video.duration} · 9:16</b>
                </div>
                <div style={{ padding: 8, backgroundColor: '#f6faf7', borderRadius: 6, border: '1px solid #e2ece3' }}>
                  <span style={{ color: '#7a8d81', fontSize: 9, display: 'block' }}>MÜZİK &amp; RİTİM</span>
                  <b style={{ color: '#d84315' }}>Trend Anadolu Beat</b>
                </div>
              </div>
            </div>

            {/* Sağ: 4 Sahneli Storyboard & Seslendirme Tablosu */}
            <div className="card" style={{ padding: 18 }}>
              <div className="section-head" style={{ marginBottom: 12 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 14, color: '#143e2c' }}>
                    60 Saniyelik Sahne Sahne Storyboard &amp; Seslendirme Senaryosu
                  </h3>
                  <p style={{ fontSize: 11, color: '#7a8d82' }}>Her 15 saniyelik blok için görsel çekim açısı, metin ve seslendirme</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {contentPackage.video.scenes.map((scene, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: 12,
                      borderRadius: 8,
                      border: '1px solid #e5ece6',
                      backgroundColor: idx === 0 ? '#fffaf8' : '#fafbfa',
                      borderLeft: `4px solid ${['#e54a3c', '#2e7d32', '#1565c0', '#f57c00'][idx]}`
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <b style={{ fontSize: 12, color: '#1e382b' }}>{scene.title}</b>
                      <span style={{ fontSize: 10, fontWeight: 700, backgroundColor: '#eee', padding: '2px 7px', borderRadius: 10, color: '#555' }}>
                        ⏱️ {scene.time}
                      </span>
                    </div>

                    <p style={{ margin: '0 0 6px', fontSize: 11, color: '#445', lineHeight: 1.45 }}>
                      🎬 <b>Görsel Çekim:</b> {scene.visual}
                    </p>

                    <div style={{ padding: '6px 9px', backgroundColor: '#f0f5f1', borderRadius: 6, fontSize: 11, color: '#1b4a2e', marginBottom: 6 }}>
                      🎙️ <b>AI Seslendirme (Voiceover):</b> "{scene.voiceover}"
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#778' }}>
                      <span>🔤 <b>Ekran Yazısı:</b> {scene.onScreenText}</span>
                      <span>📹 <b>B-Roll:</b> {scene.broll}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SEKME 3: ULTRA HD AI GÖRSEL ÜRETİMİ (DIFFUSION AI) */}
      {/* ========================================================= */}
      {(activeSubTab === 'image' || activeSubTab === 'all') && (
        <div style={{ marginBottom: 26 }}>
          <div className="section-head" style={{ marginBottom: 14 }}>
            <div>
              <h2 style={{ fontSize: 17, color: '#143e2c', display: 'flex', alignItems: 'center', gap: 7 }}>
                <Palette size={19} color="#7b1fa2" />
                3. Seçenek: Ultra HD AI Görsel Üretimi (Diffusion Galerisi)
              </h2>
              <p>Yapay zeka tarafından üretilen afiş, dikey story görseli ve teknik banner tasarımları.</p>
            </div>
            <button
              className="primary"
              onClick={() => setIsShareModalOpen(true)}
              style={{ padding: '7px 12px', fontSize: 11 }}
            >
              <Share2 size={14} /> Görselleri Paylaş
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {contentPackage.images.map((img, idx) => (
              <div key={idx} className="card" style={{ padding: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', marginBottom: 10, height: 180 }}>
                  <img
                    src={img.url}
                    alt={img.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span style={{ position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(20, 62, 44, 0.85)', color: '#fff', fontSize: 9, padding: '3px 7px', borderRadius: 4, fontWeight: 700 }}>
                    {img.tag}
                  </span>
                  <span style={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: 9, padding: '3px 7px', borderRadius: 4 }}>
                    {img.ratio}
                  </span>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <b style={{ fontSize: 12, color: '#1e382b', display: 'block', marginBottom: 4 }}>{img.title}</b>
                    <p style={{ margin: 0, fontSize: 10, color: '#687b70', lineHeight: 1.4 }}>{img.description}</p>
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginTop: 12, paddingTop: 8, borderTop: '1px solid #edf2ee' }}>
                    <button
                      className="text-btn"
                      onClick={() => handleCopy(img.url, `img-${idx}`)}
                      style={{ fontSize: 10 }}
                    >
                      {copiedSection === `img-${idx}` ? <Check size={13} color="#2e7d32" /> : <Copy size={13} />}
                      {copiedSection === `img-${idx}` ? 'Kopyalandı' : 'URL Kopyala'}
                    </button>
                    <button
                      onClick={() => {
                        setContentPackage({
                          ...contentPackage,
                          post: { ...contentPackage.post, image: img.url }
                        })
                        setActiveSubTab('post-story')
                      }}
                      style={{
                        border: '1px solid #c9decb',
                        background: '#f6faf7',
                        color: '#2e7d32',
                        padding: '4px 8px',
                        borderRadius: 6,
                        fontSize: 10,
                        fontWeight: 600,
                        cursor: 'pointer',
                        marginLeft: 'auto'
                      }}
                    >
                      Postta Kullan ✓
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SOSYAL MEDYA HESAPLARI PAYLAŞIM MODALI (SHARE MODAL) */}
      {/* ========================================================= */}
      {isShareModalOpen && (
        <div className="modal-backdrop" onMouseDown={() => setIsShareModalOpen(false)}>
          <div
            className="task-modal"
            style={{ maxWidth: 620 }}
            onMouseDown={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="modal-header">
              <div>
                <span className="eyebrow">ÇOKLU HESAP ENTEGRASYONU</span>
                <h2>Sosyal Medya Hesaplarında Paylaş</h2>
                <p style={{ margin: '3px 0 0', fontSize: 11, color: '#7a8d81' }}>
                  Üretilen demo içeriği aşağıdaki bağlı sosyal medya hesaplarınıza tek tıkla gönderin veya zamanlayın.
                </p>
              </div>
              <button className="modal-close" onClick={() => setIsShareModalOpen(false)}>✕</button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '18px 24px' }}>
              {/* Çoklu Seçim Toolbar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#33483c' }}>
                  Bağlı Hesaplar ({selectedAccounts.length} / {CONNECTED_ACCOUNTS.length} Seçili):
                </span>
                <button
                  type="button"
                  onClick={selectAllAccounts}
                  style={{ border: 0, background: 'transparent', color: '#e54a3c', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                >
                  {selectedAccounts.length === CONNECTED_ACCOUNTS.length ? 'Seçimi Kaldır' : 'Tümünü Seç'}
                </button>
              </div>

              {/* Sosyal Medya Hesap Listesi */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9, maxHeight: 310, overflowY: 'auto' }}>
                {CONNECTED_ACCOUNTS.map((acc) => {
                  const isSelected = selectedAccounts.includes(acc.id)
                  return (
                    <div
                      key={acc.id}
                      onClick={() => toggleAccountSelection(acc.id)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: `1.5px solid ${isSelected ? '#143e2c' : '#e3ece4'}`,
                        backgroundColor: isSelected ? '#f5f9f6' : '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {/* Checkbox */}
                        <div style={{
                          width: 18,
                          height: 18,
                          borderRadius: 4,
                          border: `2px solid ${isSelected ? '#143e2c' : '#b0c2b5'}`,
                          backgroundColor: isSelected ? '#143e2c' : '#fff',
                          display: 'grid',
                          placeItems: 'center',
                          color: '#fff',
                          fontSize: 11,
                          fontWeight: 800
                        }}>
                          {isSelected && '✓'}
                        </div>

                        {/* Hesap Bilgisi */}
                        <div>
                          <b style={{ fontSize: 12, color: '#1e382b', display: 'flex', alignItems: 'center', gap: 6 }}>
                            {acc.name}
                            <span style={{ fontSize: 9, fontWeight: 600, color: '#666', backgroundColor: '#edf2ee', padding: '1px 6px', borderRadius: 4 }}>
                              {acc.type}
                            </span>
                          </b>
                          <small style={{ fontSize: 10, color: '#7a8d81', display: 'block', marginTop: 1 }}>
                            {acc.handle} · <span style={{ color: '#2e7d32', fontWeight: 600 }}>{acc.followers}</span>
                          </small>
                        </div>
                      </div>

                      <span style={{ fontSize: 11, color: isSelected ? '#2e7d32' : '#999', fontWeight: 600 }}>
                        {isSelected ? 'Yayına Hazır ●' : 'Devre Dışı'}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Paylaşılacak Paket Özeti */}
              <div style={{ marginTop: 16, padding: 12, backgroundColor: '#fafbfa', borderRadius: 8, border: '1px dashed #cddcd0', fontSize: 11, color: '#445' }}>
                <p style={{ margin: 0 }}>
                  📄 <b>Paylaşılacak Başlık:</b> {contentPackage.post.title}
                </p>
                <p style={{ margin: '4px 0 0', color: '#667' }}>
                  📸 <b>Ekler:</b> 1 Orijinal Görsel + 1 Dakikalık Reels Senaryosu + 24s Story Paketi
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    handleCopy(`${contentPackage.post.title}\n\n${contentPackage.post.body}`, 'modal-copy')
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: 5 }}
                >
                  <Copy size={14} /> {copiedSection === 'modal-copy' ? 'Kopyalandı!' : 'Metni Kopyala'}
                </button>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setIsShareModalOpen(false)}
                  disabled={isPublishing}
                >
                  Kapat
                </button>
                <button
                  type="button"
                  className="primary"
                  onClick={handlePublishNow}
                  disabled={isPublishing || selectedAccounts.length === 0}
                  style={{
                    backgroundColor: '#143e2c',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '10px 18px'
                  }}
                >
                  {isPublishing ? (
                    <>
                      <RefreshCw size={15} className="spin-icon" /> Gönderiliyor...
                    </>
                  ) : (
                    <>
                      <Send size={15} /> Seçili Hesaplarda Paylaş ({selectedAccounts.length})
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
