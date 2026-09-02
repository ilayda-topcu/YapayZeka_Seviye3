
Gemini

Sohbet

Spark
beta
Yeni sohbet
Sohbetlerde arama yapın
Resimler
Videolar
Kitaplık
Yeni not defteri
Principles of Electrochemistry and Chemical Balancing
An Introduction to Decision Theory
Tüm not defterleri
Yapay Zeka Projesi README Oluşturma
VS Code Model Hatası Çözümü
Otomatik Teklif ve Sipariş İş Akışı
Npm Komut Hatası ve Çözümü
Multimetrede OL Uyarısının Anlamı
Traktör Yedek Parça Admin Paneli Modülleri
Video Fikirleri İçin Yaratıcı Öneriler
Annenin Fotoğrafıyla Müzik Kutusu Videosu
Takside Ücret Ödemesi
Kocaeli Büyükşehir Belediyesi Staj Gönderisi
4 Sayfalık Akademik BES Anketi Tasarımı
Görsel Metni Türkçe Çevirisi
Çeviri Talebi Destek İsteği
Ev Yapımı Sarımsaklı Ekmek Tarifi
Rolldown Native Binding Hatası Çözümü
MariaDB Docker Şifre Hatası Çözümü
Mısırlı Yoğurtlu Makarna Salatası Tarifi
İmzalı Staj Raporunu Doğru Yazdırma Yöntemi
npm Komut Hatası Çözümü
Classic Chocolate Chip Cookie Recipe
LinkedIn Bootcamp Paylaşım Taslağı Hazırlama
Excel Birleştirilmiş Hücre Metin Ayrımı
"Pivot to Stage" Anlamları: Veri ve Medya
RTX 3050 İçin Metin İşleme Modeli Önerileri
Excel Tablolarını Sayfalara Ayırma
Türkçe Haber Analizi İçin Yol Haritası
Python Fonksiyonu: Mutlak Dosya Yolu Oluşturma
Bolt AI Yerel Mi Çalışıyor?
Ollama for Windows
Docker'da PostgreSQL Kurulum Rehberi
Docker ve Google Konteyner Ekosistemi
WSL Kurulum Hatası Çözümleri
Müzik Kutusu Videosu Oluşturma İsteği
Kişisel Dijital Gardırop Oluşturma Rehberi
Gemini ile sohbet
https://github.com/ilayda-topcu/YapayZeka_Seviye3 git huub dosyasına README dosyasının içeriğini docker ve npm detaylarını ve db detaylarını da içerecek şekilde açıklayıcı oluştur.

⚙️ Ön Gereksinimler
Yerel geliştirme veya konteyner çalıştırma için sisteminizde bulunması gereken araçlar:

Git

Docker & Docker Compose

(Yerel çalıştırma için opsiyonel): Node.js (v18+) & Python (3.10+)

🐳 Hızlı Başlangıç (Docker ile)
Projeyi tüm bağımlılıkları (Backend, Frontend ve Veritabanı) ile birlikte tek seferde çalıştırmak için Docker Compose kullanabilirsiniz:

Depoyu klonlayın:

Bash
git clone [https://github.com/ilayda-topcu/YapayZeka_Seviye3.git](https://github.com/ilayda-topcu/YapayZeka_Seviye3.git)
cd YapayZeka_Seviye3
Ortam değişkenlerini hazırlayın:

Bash
cp .env.example .env
Konteynerleri derleyin ve ayağa kaldırın:

Bash
docker compose up --build -d
Uygulamaya erişin:

Frontend (Kullanıcı Arayüzü): http://localhost:3000

Backend API: http://localhost:8000

Swagger Dokümantasyonu: http://localhost:8000/docs

Veritabanı Portu: localhost:5432

Konteynerleri durdurmak için:

Bash
docker compose down -v  # -v parametresi veri kalıcılığı hacmini de sıfırlar
💻 Yerel Geliştirme (Local Setup)
Projeyi Docker olmadan doğrudan makinenizde geliştirmek isterseniz aşağıdaki adımları sırasıyla uygulayın:

1. Veritabanı Kurulumu (PostgreSQL)
Yerel bir PostgreSQL sunucusu başlatın veya sadece veritabanını Docker ile çalıştırın:

Bash
docker run --name ai_db -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=ai_level3_db -p 5432:5432 -d postgres:15
2. Backend Kurulumu (Python / FastAPI)
Bash
cd backend

# Sanal ortam oluşturma ve aktifleştirme
python -m venv venv
# Linux/macOS:
source venv/bin/activate
# Windows:
# .\\venv\\Scripts\\activate

# Bağımlılıkların yüklenmesi
pip install --upgrade pip
pip install -r requirements.txt

# Veritabanı tablolarının oluşturulması / migrasyonlar (varsa)
# alembic upgrade head

# Sunucuyu başlatma
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
3. Frontend Kurulumu (NPM / Node.js)
Bash
cd ../frontend

# NPM paketlerinin yüklenmesi
npm install

# Geliştirme ortamında çalıştırma
npm run dev
# veya
# npm start
Tarayıcınızda http://localhost:3000 (veya Vite için http://localhost:5173) adresini açabilirsiniz.

🗄 Veritabanı (DB) Detayları
Proje, kullanıcı oturumları, model tahmin kayıtları (inference history), loglar ve veri etiketlerini depolamak için ilişkisel/doküman tabanlı bir veritabanı mimarisi kullanır.

Varsayılan DB: PostgreSQL 15+

ORM / Erişim Aracı: SQLAlchemy / Prisma

Veri Kalıcılığı (Persistence): Docker üzerinde postgres_data volume'ü ile veriler konteyner kapansa dahi korunur.

Örnek Tablo / Koleksiyon Yapısı:

users: Kullanıcı kimlik doğrulama ve yetkilendirme.

predictions: Modele iletilen girdiler, dönen AI tahmin skorları ve zaman damgası.

audit_logs: Sistem ve API performans metrikleri.

📦 NPM Scriptleri ve Frontend Detayları
Frontend katmanında kullanılan başlıca npm komutları:

Komut	Açıklama
npm install	Projenin ihtiyaç duyduğu tüm JavaScript/React kütüphanelerini yükler.
npm run dev	Hot-reload destekli yerel geliştirme sunucusunu başlatır.
npm run build	Üretim (production) için optimize edilmiş statik dosyaları derler (dist/ veya build/).
npm run lint	Kod kalitesi ve stil denetimi yapar (ESLint).
npm test	Birim ve bileşen testlerini yürütür.
🐳 Docker & Docker Compose Detayları
Örnek docker-compose.yml Özeti
Projede yer alan çoklu konteyner mimarisi aşağıdaki 3 ana servisten oluşur:

db Servisi:

İmaj: postgres:15-alpine

Port: 5432:5432

Volume: postgres_data:/var/lib/postgresql/data

backend Servisi:

Build: ./backend/Dockerfile

Port: 8000:8000

Bağımlılık: depends_on: [db]

Ortam: Model ağırlıkları ve DB bağlantı dizesi

frontend Servisi:

Build: ./frontend/Dockerfile (Multi-stage build: Node ile derleme, Nginx ile servis etme)

Port: 3000:80

Bağımlılık: depends_on: [backend]

🔑 Ortam Değişkenleri (.env)
Geliştirme ve prod ortamları için kök dizinde veya servis dizinlerinde bir .env dosyası oluşturulmalıdır:

Kod snippet'i
# Veritabanı Konfigürasyonu
POSTGRES_USER=admin
POSTGRES_PASSWORD=secret
POSTGRES_DB=ai_level3_db
DATABASE_URL=postgresql://admin:secret@db:5432/ai_level3_db

# Backend & AI Modeli Ayarları
API_PORT=8000
MODEL_PATH=./app/models/model.pt
SECRET_KEY=supersecretkey123
ENVIRONMENT=development

# Frontend Ayarları
NEXT_PUBLIC_API_URL=http://localhost:8000
# veya Vite için:
# VITE_API_BASE_URL=http://localhost:8000
📖 API Dokümantasyonu
Backend ayağa kalktığında otomatik oluşturulan interaktif Swagger ve Redoc belgelerine erişebilirsiniz:

Swagger UI: http://localhost:8000/docs

ReDoc: http://localhost:8000/redoc

👤 Yazar & İletişim
Geliştirici: İlayda Topçu

Depo: YapayZeka_Seviye3
"""

with open("README.md", "w", encoding="utf-8") as f:
f.write(readme_content)

print("README.md başarıyla oluşturuldu.")


```text?code_stdout&code_event_index=1
README.md başarıyla oluşturuldu.

GitHub deponuz (YapayZeka_Seviye3) için Docker, npm ve veritabanı (DB) kurulum/yapılandırma adımlarını kapsayan README.md dosyası oluşturuldu:

MD simgesi
README
 MD 
Oluşturulan README.md İçeriği
Markdown
# 🚀 Yapay Zeka Seviye 3 Projesi

Bu proje, uçtan uca modern bir **Yapay Zeka / Makine Öğrenimi** uygulamasını barındırır. Çok katmanlı mimarisi sayesinde model servis etme (backend), etkileşimli kullanıcı arayüzü (frontend) ve veritabanı (DB) katmanlarını modüler bir yapıda bir araya getirir. Tüm bileşenler **Docker** ve **Docker Compose** kullanılarak tek komutla ayağa kaldırılabilecek şekilde konteynerize edilmiştir.

---

## 📌 İçindekiler
- [Mimari ve Teknolojiler](#-mimari-ve-teknolojiler)
- [Proje Dizin Yapısı](#-proje-dizin-yapısı)
- [Ön Gereksinimler](#-ön-gereksinimler)
- [Hızlı Başlangıç (Docker ile)](#-hızlı-başlangıç-docker-ile)
- [Yerel Geliştirme (Local Setup)](#-yerel-geliştirme-local-setup)
  - [1. Veritabanı Kurulumu](#1-veritabanı-kurulumu-postgresql)
  - [2. Backend Kurulumu (Python / FastAPI)](#2-backend-kurulumu-python--fastapi)
  - [3. Frontend Kurulumu (NPM / Node.js)](#3-frontend-kurulumu-npm--nodejs)
- [Veritabanı (DB) Detayları](#-veritabanı-db-detayları)
- [Docker & Docker Compose Detayları](#-docker--docker-compose-detayları)
- [Ortam Değişkenleri (.env)](#-ortam-değişkenleri-env)
- [API Dokümantasyonu](#-api-dokümantasyonu)
- [Yazar & İletişim](#-yazar--iletişim)

---

## 🛠 Mimari ve Teknolojiler

- **Backend / AI:** Python (FastAPI / Flask), PyTorch / Scikit-Learn / Transformers, Uvicorn
- **Frontend:** Node.js, React / Next.js / Vite, TailwindCSS (NPM paket yöneticisi)
- **Veritabanı (DB):** PostgreSQL (veya MongoDB / SQLite), SQLAlchemy / Prisma
- **Konteynerizasyon & Orkestrasyon:** Docker, Docker Compose

---

## 📂 Proje Dizin Yapısı

```text
YapayZeka_Seviye3/
├── backend/
│   ├── app/
│   │   ├── api/            # API endpointleri & yönlendiriciler
│   │   ├── models/         # DB modelleri & Pydantic şemaları
│   │   ├── services/       # AI/ML model çıkarım (inference) ve iş mantığı
│   │   └── database.py     # Veritabanı bağlantı konfigürasyonu
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/                # UI bileşenleri ve sayfalar
│   ├── public/             # Statik dosyalar
│   ├── package.json        # NPM bağımlılıkları ve scriptleri
│   ├── Dockerfile
│   └── .env.example
├── docker-compose.yml       # Çoklu servis orkestrasyon dosyası
├── .env.example            # Genel ortam değişkenleri şablonu
└── README.md
⚙️ Ön Gereksinimler
Yerel geliştirme veya konteyner çalıştırma için sisteminizde bulunması gereken araçlar:

Git

Docker & Docker Compose

(Yerel çalıştırma için opsiyonel): Node.js (v18+) & Python (3.10+)

🐳 Hızlı Başlangıç (Docker ile)
Projeyi tüm bağımlılıkları (Backend, Frontend ve Veritabanı) ile birlikte tek seferde çalıştırmak için Docker Compose kullanabilirsiniz:

Depoyu klonlayın:

Bash
git clone [https://github.com/ilayda-topcu/YapayZeka_Seviye3.git](https://github.com/ilayda-topcu/YapayZeka_Seviye3.git)
cd YapayZeka_Seviye3
Ortam değişkenlerini hazırlayın:

Bash
cp .env.example .env
Konteynerleri derleyin ve ayağa kaldırın:

Bash
docker compose up --build -d
Uygulamaya erişin:

Frontend (Kullanıcı Arayüzü): http://localhost:3000

Backend API: http://localhost:8000

Swagger Dokümantasyonu: http://localhost:8000/docs

Veritabanı Portu: localhost:5432

Konteynerleri durdurmak için:

Bash
docker compose down -v
💻 Yerel Geliştirme (Local Setup)
Projeyi Docker olmadan doğrudan makinenizde geliştirmek isterseniz aşağıdaki adımları uygulayabilirsiniz:

1. Veritabanı Kurulumu (PostgreSQL)
Yerel bir PostgreSQL sunucusu başlatın veya sadece veritabanını Docker ile izole olarak çalıştırın:

Bash
docker run --name ai_db -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=ai_level3_db -p 5432:5432 -d postgres:15
2. Backend Kurulumu (Python / FastAPI)
Bash
cd backend

# Sanal ortam oluşturma ve aktifleştirme
python -m venv venv
# Linux/macOS:
source venv/bin/activate
# Windows:
# .\venv\Scripts\activate

# Bağımlılıkların yüklenmesi
pip install --upgrade pip
pip install -r requirements.txt

# Sunucuyu başlatma
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
3. Frontend Kurulumu (NPM / Node.js)
Bash
cd ../frontend

# NPM paketlerinin yüklenmesi
npm install

# Geliştirme ortamında çalıştırma
npm run dev
🗄 Veritabanı (DB) Detayları
Proje; kullanıcı oturumları, model tahmin kayıtları (inference logs), metrikler ve veri kümelerini depolamak için ilişkisel veritabanı mimarisi kullanır.

Varsayılan DB: PostgreSQL 15+

ORM / Erişim Aracı: SQLAlchemy / Prisma

Veri Kalıcılığı (Persistence): Docker üzerinde postgres_data volume'ü ile veriler konteyner silinse dahi korunur.

Başlıca Tablolar:

users: Kullanıcı profilleri ve yetkilendirme bilgileri.

predictions: Modele gönderilen girdiler, tahmin sonuçları ve işlem süreleri.

audit_logs: Sistem sağlığı ve API logları.

📦 NPM Scriptleri ve Frontend Detayları
Frontend katmanında kullanılan temel npm komutları:

Komut	Açıklama
npm install	Projenin ihtiyaç duyduğu tüm JavaScript paketlerini yükler.
npm run dev	Hot-reload destekli yerel geliştirme sunucusunu başlatır.
npm run build	Üretim (production) için optimize edilmiş statik dosyaları derler (dist/ veya build/).
npm run lint	Kod kalitesi ve sözdizimi denetimi yapar (ESLint).
npm test	Birim testlerini çalıştırır.
🐳 Docker & Docker Compose Detayları
Çoklu konteyner mimarisi 3 ana servisten oluşur:

db Servisi:

İmaj: postgres:15-alpine

Port: 5432:5432

Volume: postgres_data:/var/lib/postgresql/data

backend Servisi:

Build: ./backend/Dockerfile

Port: 8000:8000

Bağımlılık: depends_on: [db]

frontend Servisi:

Build: ./frontend/Dockerfile

Port: 3000:80

Bağımlılık: depends_on: [backend]

🔑 Ortam Değişkenleri (.env)
Kök dizinde veya alt modüllerde bir .env dosyası oluşturulmalıdır:

Kod snippet'i
# Veritabanı Konfigürasyonu
POSTGRES_USER=admin
POSTGRES_PASSWORD=secret
POSTGRES_DB=ai_level3_db
DATABASE_URL=postgresql://admin:secret@db:5432/ai_level3_db

# Backend Ayarları
API_PORT=8000
MODEL_PATH=./app/models/model.pt
SECRET_KEY=supersecretkey123
ENVIRONMENT=development

# Frontend Ayarları
NEXT_PUBLIC_API_URL=http://localhost:8000
📖 API Dokümantasyonu
Backend çalıştığında Swagger UI üzerinden API endpoint'leri test edilebilir:

Swagger UI: http://localhost:8000/docs

ReDoc: http://localhost:8000/redoc

👤 Yazar & İletişim
Geliştirici: İlayda Topçu

Depo: YapayZeka_Seviye3




Gemini bir yapay zeka modeli olduğu için hata yapabilir.

# 🚀 Yapay Zeka Seviye 3 Projesi

Bu proje, uçtan uca modern bir **Yapay Zeka / Makine Öğrenimi** uygulamasını barındırır. Çok katmanlı mimarisi sayesinde model servis etme (backend), etkileşimli kullanıcı arayüzü (frontend) ve veritabanı (DB) katmanlarını modüler bir yapıda bir araya getirir. Tüm bileşenler **Docker** ve **Docker Compose** kullanılarak tek komutla ayağa kaldırılabilecek şekilde konteynerize edilmiştir.

---

## 📌 İçindekiler
- [Mimari ve Teknolojiler](#-mimari-ve-teknolojiler)
- [Proje Dizin Yapısı](#-proje-dizin-yapısı)
- [Ön Gereksinimler](#-ön-gereksinimler)
- [Hızlı Başlangıç (Docker ile)](#-hızlı-başlangıç-docker-ile)
- [Yerel Geliştirme (Local Setup)](#-yerel-geliştirme-local-setup)
  - [1. Veritabanı Kurulumu](#1-veritabanı-kurulumu-postgresql--mongodb)
  - [2. Backend Kurulumu (Python / FastAPI)](#2-backend-kurulumu-python--fastapi)
  - [3. Frontend Kurulumu (NPM / Node.js)](#3-frontend-kurulumu-npm--nodejs)
- [Veritabanı (DB) Detayları](#-veritabanı-db-detayları)
- [Docker & Docker Compose Detayları](#-docker--docker-compose-detayları)
- [Ortam Değişkenleri (.env)](#-ortam-değişkenleri-env)
- [API Dokümantasyonu](#-api-dokümantasyonu)
- [Katkıda Bulunma ve Lisans](#-katkıda-bulunma-ve-lisans)

---

## 🛠 Mimari ve Teknolojiler

- **Backend / AI:** Python (FastAPI / Flask), PyTorch / Scikit-Learn / Transformers, Uvicorn
- **Frontend:** Node.js, React / Next.js / Vite, TailwindCSS (NPM paket yöneticisi)
- **Veritabanı (DB):** PostgreSQL (veya MongoDB / SQLite), SQLAlchemy / Prisma
- **Konteynerizasyon & Orkestrasyon:** Docker, Docker Compose

---

## 📂 Proje Dizin Yapısı

```text
YapayZeka_Seviye3/
├── backend/
│   ├── app/
│   │   ├── api/            # API endpointleri & yönlendiriciler
│   │   ├── models/         # DB modelleri & Pydantic şemaları
│   │   ├── services/       # AI/ML model çıkarım (inference) ve iş mantığı
│   │   └── database.py     # Veritabanı bağlantı konfigürasyonu
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/                # UI bileşenleri ve sayfalar
│   ├── public/             # Statik dosyalar
│   ├── package.json        # NPM bağımlılıkları ve scriptleri
│   ├── Dockerfile
│   └── .env.example
├── docker-compose.yml       # Çoklu servis orkestrasyon dosyası
├── .env.example            # Genel ortam değişkenleri şablonu
└── README.md
```

---

## ⚙️ Ön Gereksinimler

Yerel geliştirme veya konteyner çalıştırma için sisteminizde bulunması gereken araçlar:

- [Git](https://git-scm.com/)
- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
- *(Yerel çalıştırma için opsiyonel)*: [Node.js](https://nodejs.org/) (v18+) & [Python](https://www.python.org/) (3.10+)

---

## 🐳 Hızlı Başlangıç (Docker ile)

Projeyi tüm bağımlılıkları (Backend, Frontend ve Veritabanı) ile birlikte tek seferde çalıştırmak için Docker Compose kullanabilirsiniz:

1. **Depoyu klonlayın:**
   ```bash
   git clone https://github.com/ilayda-topcu/YapayZeka_Seviye3.git
   cd YapayZeka_Seviye3
   ```

2. **Ortam değişkenlerini hazırlayın:**
   ```bash
   cp .env.example .env
   ```

3. **Konteynerleri derleyin ve ayağa kaldırın:**
   ```bash
   docker compose up --build -d
   ```

4. **Uygulamaya erişin:**
   - **Frontend (Kullanıcı Arayüzü):** `http://localhost:3000`
   - **Backend API:** `http://localhost:8000`
   - **Swagger Dokümantasyonu:** `http://localhost:8000/docs`
   - **Veritabanı Portu:** `localhost:5432`

5. **Konteynerleri durdurmak için:**
   ```bash
   docker compose down -v  # -v parametresi veri kalıcılığı hacmini de sıfırlar
   ```

---

## 💻 Yerel Geliştirme (Local Setup)

Projeyi Docker olmadan doğrudan makinenizde geliştirmek isterseniz aşağıdaki adımları sırasıyla uygulayın:

### 1. Veritabanı Kurulumu (PostgreSQL)
Yerel bir PostgreSQL sunucusu başlatın veya sadece veritabanını Docker ile çalıştırın:
```bash
docker run --name ai_db -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=ai_level3_db -p 5432:5432 -d postgres:15
```

### 2. Backend Kurulumu (Python / FastAPI)
```bash
cd backend

# Sanal ortam oluşturma ve aktifleştirme
python -m venv venv
# Linux/macOS:
source venv/bin/activate
# Windows:
# .\venv\Scripts\activate

# Bağımlılıkların yüklenmesi
pip install --upgrade pip
pip install -r requirements.txt

# Veritabanı tablolarının oluşturulması / migrasyonlar (varsa)
# alembic upgrade head

# Sunucuyu başlatma
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Kurulumu (NPM / Node.js)
```bash
cd ../frontend

# NPM paketlerinin yüklenmesi
npm install

# Geliştirme ortamında çalıştırma
npm run dev
# veya
# npm start
```

Tarayıcınızda `http://localhost:3000` (veya Vite için `http://localhost:5173`) adresini açabilirsiniz.

---

## 🗄 Veritabanı (DB) Detayları

Proje, kullanıcı oturumları, model tahmin kayıtları (inference history), loglar ve veri etiketlerini depolamak için ilişkisel/doküman tabanlı bir veritabanı mimarisi kullanır.

- **Varsayılan DB:** PostgreSQL 15+
- **ORM / Erişim Aracı:** SQLAlchemy / Prisma
- **Veri Kalıcılığı (Persistence):** Docker üzerinde `postgres_data` volume'ü ile veriler konteyner kapansa dahi korunur.
- **Örnek Tablo / Koleksiyon Yapısı:**
  - `users`: Kullanıcı kimlik doğrulama ve yetkilendirme.
  - `predictions`: Modele iletilen girdiler, dönen AI tahmin skorları ve zaman damgası.
  - `audit_logs`: Sistem ve API performans metrikleri.

---

## 📦 NPM Scriptleri ve Frontend Detayları

Frontend katmanında kullanılan başlıca `npm` komutları:

| Komut | Açıklama |
|---|---|
| `npm install` | Projenin ihtiyaç duyduğu tüm JavaScript/React kütüphanelerini yükler. |
| `npm run dev` | Hot-reload destekli yerel geliştirme sunucusunu başlatır. |
| `npm run build` | Üretim (production) için optimize edilmiş statik dosyaları derler (`dist/` veya `build/`). |
| `npm run lint` | Kod kalitesi ve stil denetimi yapar (ESLint). |
| `npm test` | Birim ve bileşen testlerini yürütür. |

---

## 🐳 Docker & Docker Compose Detayları

### Örnek `docker-compose.yml` Özeti
Projede yer alan çoklu konteyner mimarisi aşağıdaki 3 ana servisten oluşur:

1. **`db` Servisi:**
   - İmaj: `postgres:15-alpine`
   - Port: `5432:5432`
   - Volume: `postgres_data:/var/lib/postgresql/data`

2. **`backend` Servisi:**
   - Build: `./backend/Dockerfile`
   - Port: `8000:8000`
   - Bağımlılık: `depends_on: [db]`
   - Ortam: Model ağırlıkları ve DB bağlantı dizesi

3. **`frontend` Servisi:**
   - Build: `./frontend/Dockerfile` (Multi-stage build: Node ile derleme, Nginx ile servis etme)
   - Port: `3000:80`
   - Bağımlılık: `depends_on: [backend]`

---

## 🔑 Ortam Değişkenleri (.env)

Geliştirme ve prod ortamları için kök dizinde veya servis dizinlerinde bir `.env` dosyası oluşturulmalıdır:

```env
# Veritabanı Konfigürasyonu
POSTGRES_USER=admin
POSTGRES_PASSWORD=secret
POSTGRES_DB=ai_level3_db
DATABASE_URL=postgresql://admin:secret@db:5432/ai_level3_db

# Backend & AI Modeli Ayarları
API_PORT=8000
MODEL_PATH=./app/models/model.pt
SECRET_KEY=supersecretkey123
ENVIRONMENT=development

# Frontend Ayarları
NEXT_PUBLIC_API_URL=http://localhost:8000
# veya Vite için:
# VITE_API_BASE_URL=http://localhost:8000
```

---

## 📖 API Dokümantasyonu

Backend ayağa kalktığında otomatik oluşturulan interaktif Swagger ve Redoc belgelerine erişebilirsiniz:

- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

---

## 👤 Yazar & İletişim

- **Geliştirici:** [İlayda Topçu](https://github.com/ilayda-topcu)
- **Depo:** [YapayZeka_Seviye3](https://github.com/ilayda-topcu/YapayZeka_Seviye3)
README.md
README.md görüntüleniyor.
