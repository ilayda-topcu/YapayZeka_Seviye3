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
- [NPM Scriptleri ve Frontend Detayları](#-npm-scriptleri-ve-frontend-detayları)
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
