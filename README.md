# ArabaKiralama

Küçük işletmelere yönelik araç kiralama platformu. ASP.NET Core Web API (backend) ve Next.js (frontend) ile geliştirilmiştir.

## Özellikler

- **Kullanıcı Yönetimi** — Kayıt, e-posta doğrulama, giriş, profil, şifre sıfırlama
- **Araç Yönetimi** — Marka/model/plaka, yakıt tipi, vites, görsel yükleme, müsaitlik durumu
- **Rezervasyon** — Tarih aralığı seçimi, çakışma kontrolü, durum takibi
- **Mock Ödeme** — Kredi kartı / banka kartı / havale formu
- **Admin Paneli** — Araç ekleme/düzenleme, rezervasyon onay/red, kullanıcı yönetimi, raporlama
- **Güvenlik** — JWT + refresh token, rate limiting, Identity lockout, security headers

## Stack

| Katman | Teknoloji |
|--------|-----------|
| Backend | ASP.NET Core Web API (.NET 9) |
| ORM | Entity Framework Core 9 |
| Veritabanı | PostgreSQL 16 |
| Auth | ASP.NET Core Identity + JWT |
| Frontend | Next.js 15 + TypeScript + Tailwind CSS |
| Container | Docker + Docker Compose |

## Hızlı Başlangıç (Docker)

### 1. Gereksinimler

- Docker Desktop
- Git

### 2. Kurulum

```bash
git clone https://github.com/kullanici/araba-kiralama.git
cd araba-kiralama

# .env dosyasını oluştur
cp .env.example .env
# .env dosyasını düzenleyerek JWT_KEY değerini gir (en az 32 karakter)
```

### 3. Başlat

```bash
docker-compose up --build
```

Uygulama hazır olduğunda:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5183/api

### 4. Veritabanı Migration (ilk kurulumda)

```bash
docker exec -it arabakiralama-backend dotnet ef database update \
  --project ArabaKiralama.DataAccess \
  --startup-project ArabaKiralama.WebAPI \
  --connection "Host=postgres;Database=arabakiralama_db;Username=postgres;Password=postgres123"
```

## Yerel Geliştirme

### Backend

`backend/ArabaKiralama.WebAPI/appsettings.Development.json` dosyasını oluştur:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=arabakiralama_db;Username=arabakiralama_app;Password=AppUser!Secure2024",
    "MigrationConnection": "Host=localhost;Database=arabakiralama_db;Username=postgres;Password=postgres123"
  },
  "Jwt": {
    "Key": "GelistirmeAnahtari_EnAz32KarakterOlmali!",
    "Issuer": "ArabaKiralama",
    "Audience": "ArabaKiralamaClient",
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

### Migration Oluşturma

```bash
cd backend/ArabaKiralama.WebAPI
dotnet ef migrations add <MigrationAdi> \
  --project ../ArabaKiralama.DataAccess \
  --startup-project . \
  --connection "Host=localhost;Database=arabakiralama_db;Username=postgres;Password=postgres123"
```

## Proje Yapısı

```
ArabaKiralama/
├── backend/
│   ├── ArabaKiralama.Entities/       # Entity sınıfları (POCO)
│   ├── ArabaKiralama.DataAccess/     # EF Core context, repository'ler, migration'lar
│   ├── ArabaKiralama.Business/       # Servis katmanı, iş kuralları, DTO'lar
│   └── ArabaKiralama.WebAPI/         # Controller'lar, JWT, middleware
├── frontend/
│   └── araba-kiralama-ui/            # Next.js uygulaması
├── docker/
│   └── postgres-init/                # PostgreSQL başlangıç scriptleri
├── docker-compose.yml
└── .env.example
```

## Ortam Değişkenleri

| Değişken | Açıklama |
|----------|----------|
| `JWT_KEY` | JWT imzalama anahtarı (en az 32 karakter) |

Diğer tüm ayarlar `docker-compose.yml` içindeki `environment` bloğundan yapılandırılabilir.

## Admin Hesabı

İlk Admin kullanıcısını doğrudan veritabanından oluşturmanız gerekir. Kayıt olan kullanıcıya `Admin` rolü atamak için:

```sql
INSERT INTO "AspNetUserRoles" ("UserId", "RoleId")
SELECT u."Id", r."Id"
FROM "AspNetUsers" u, "AspNetRoles" r
WHERE u."Email" = 'admin@ornek.com' AND r."Name" = 'Admin';
```

## Lisans

MIT
