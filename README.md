# RideEase

Küçük işletmelere yönelik araç kiralama platformu. ASP.NET Core Web API (backend) ve Next.js (frontend) ile geliştirilmiş, Docker ile containerize edilmiştir.

## Özellikler

- **Kullanıcı Yönetimi** — Kayıt, e-posta doğrulama, giriş, profil, şifre sıfırlama, şifre değiştirme
- **Araç Yönetimi** — Marka/model/plaka, yakıt tipi, vites, koltuk sayısı, km, günlük fiyat, görsel yükleme
- **Rezervasyon** — Tarih aralığı seçimi, çakışma kontrolü, durum takibi (Pending/Approved/Rejected/Cancelled/Completed)
- **Mock Ödeme** — Kredi kartı / banka kartı / havale formu
- **Admin Paneli** — Araç ekleme/düzenleme, rezervasyon onay/red, kullanıcı listeleme/kilitleme, raporlama
- **Rol + Claim Yetkilendirme** — 4 rol: Admin, Moderator, CarManager, Customer
- **Güvenlik** — JWT + refresh token, rate limiting, Identity lockout, security headers

## Teknoloji Stack

| Katman | Teknoloji |
|--------|-----------|
| Backend | ASP.NET Core Web API (.NET 9) |
| Mimari | N-Tier (Entities → DataAccess → Business → WebAPI) |
| ORM | Entity Framework Core 9 |
| Veritabanı | PostgreSQL 16 |
| Auth | ASP.NET Core Identity + JWT |
| Frontend | Next.js + TypeScript + Tailwind CSS |
| Container | Docker + Docker Compose |

## Docker Mimarisi

Proje 3 ayrı container olarak çalışır, birbirleriyle Docker iç ağı üzerinden haberleşir:

```
docker compose up
       │
       ├──► postgres   → port 5432  (official image, Dockerfile yok)
       ├──► backend    → port 8080  (multi-stage build ile derlenir)
       └──► frontend   → port 3000  (multi-stage build ile derlenir)
```

### Backend Container (Multi-Stage Build)

```
Stage 1 — build (dotnet/sdk:9.0)
  └── 4 katmanı derle → .dll üret

Stage 2 — runtime (dotnet/aspnet:9.0)
  └── sadece .dll'i al → küçük image (~200MB)
      kaynak kod image'a girmez
```

### Frontend Container (Multi-Stage Build)

```
Stage 1 — deps (node:22-alpine)
  └── npm ci → bağımlılıkları yükle

Stage 2 — build (node:22-alpine)
  └── npm run build → optimize JS üret (standalone mod)

Stage 3 — runtime (node:22-alpine)
  └── sadece build çıktısını al → küçük image
```

## Hızlı Başlangıç (Docker)

### Gereksinimler

- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- Git

### Kurulum

```bash
git clone https://github.com/ismailtpcrr/RideEase.git
cd RideEase

# .env dosyasını oluştur ve JWT_KEY değerini gir (en az 32 karakter)
cp .env.example .env
```

`.env` dosyasını düzenle:

```
JWT_KEY=BurayayEnAz32KarakterGizliAnahtarYaz!
```

### Başlat

```bash
docker compose up --build
```

Uygulama hazır olduğunda:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api

### Durdur

```bash
docker compose down          # container'ları durdurur
docker compose down -v       # container + veritabanı verilerini siler
```

## Proje Yapısı

```
RideEase/
├── backend/
│   ├── Dockerfile                        # Backend multi-stage build
│   ├── ArabaKiralama.Entities/           # Entity sınıfları (POCO)
│   ├── ArabaKiralama.DataAccess/         # EF Core context, repository'ler, migration'lar
│   ├── ArabaKiralama.Business/           # Servis katmanı, iş kuralları, DTO'lar
│   └── ArabaKiralama.WebAPI/             # Controller'lar, JWT, middleware
├── frontend/
│   └── araba-kiralama-ui/
│       ├── Dockerfile                    # Frontend multi-stage build
│       ├── app/                          # Next.js sayfaları
│       ├── components/                   # UI bileşenleri
│       ├── services/                     # API çağrıları
│       └── hooks/                        # useAuth vb.
├── docker-compose.yml                    # 3 servisi birbirine bağlar
├── .env.example                          # Ortam değişkeni şablonu
└── README.md
```

## Yerel Geliştirme (Docker Olmadan)

Docker yerine doğrudan çalıştırmak için:

### Gereksinimler

- .NET 9 SDK
- Node.js 22+
- PostgreSQL (veya Docker ile sadece DB):

```bash
docker run --name rideease-postgres \
  -e POSTGRES_DB=arabakiralama_db \
  -e POSTGRES_PASSWORD=postgres123 \
  -p 5432:5432 -d postgres:16-alpine
```

### Backend

`backend/ArabaKiralama.WebAPI/appsettings.Development.json` oluştur (git'e gitmez):

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=arabakiralama_db;Username=arabakiralama_app;Password=AppUser!Secure2024",
    "MigrationConnection": "Host=localhost;Database=arabakiralama_db;Username=postgres;Password=postgres123"
  },
  "Jwt": {
    "Key": "GelistirmeAnahtari_EnAz32KarakterOlmali!",
    "Issuer": "RideEase",
    "Audience": "RideEaseClient",
    "ExpiryMinutes": "15",
    "RefreshTokenExpiryDays": "7"
  },
  "Email": { "Mode": "Console" },
  "FrontendUrl": "http://localhost:3000"
}
```

```bash
cd backend/ArabaKiralama.WebAPI
dotnet run
```

### Frontend

```bash
cd frontend/araba-kiralama-ui
npm install
npm run dev
```

## Test Kullanıcıları

Development modunda backend başlarken otomatik oluşturulur:

| E-posta | Şifre | Rol |
|---------|-------|-----|
| admin@araba.com | Admin123! | Admin |
| moderator@araba.com | Mod123! | Moderator |
| carmanager@araba.com | Car123! | CarManager |
| musteri@araba.com | Musteri123! | Customer |

## Ortam Değişkenleri

| Değişken | Açıklama |
|----------|----------|
| `JWT_KEY` | JWT imzalama anahtarı (en az 32 karakter) |

Diğer tüm ayarlar `docker-compose.yml` içindeki `environment` bloğundan yapılandırılır.

## Lisans

MIT
