# RideEase Projesi

Küçük işletmelere yönelik araç kiralama platformu. Marka adı: **RideEase**. Backend ASP.NET Core Web API, frontend Next.js ile geliştirilmektedir.

## Stack

| Katman | Teknoloji |
|--------|-----------|
| Backend | ASP.NET Core Web API (**.NET 9**, `net9.0`) |
| Mimari | N-Tier (Entities → DataAccess → Business → WebAPI) |
| ORM | Entity Framework Core 9.0.5 |
| Veritabanı | PostgreSQL |
| Auth | ASP.NET Core Identity + JWT (access 15 dk + refresh 7 gün) |
| Frontend | Next.js + TypeScript + Tailwind CSS + react-hot-toast |
| Bildirimler | react-hot-toast (alert() kullanılmaz) |
| Container | Docker henüz eklenmedi — yerel geliştirmede PostgreSQL Docker container ile çalışır |

## Proje Yapısı

```
ArabaKiralama/
├── backend/
│   ├── ArabaKiralama.Entities/       # Entity sınıfları (POCO)
│   ├── ArabaKiralama.DataAccess/     # EF Core context, repository'ler, migration'lar
│   ├── ArabaKiralama.Business/       # Servis katmanı, iş kuralları, DTO'lar
│   └── ArabaKiralama.WebAPI/         # Controller'lar, JWT, middleware, servisler
├── frontend/
│   └── araba-kiralama-ui/            # Next.js uygulaması
├── .env.example                      # Şablon (git'e gider)
└── README.md
```

> **Not:** Docker dosyaları (Dockerfile, docker-compose.yml) kasıtlı olarak kaldırıldı.
> Öğrenme amacıyla kullanıcı kendisi ekleyecek.

## Tamamlanan Modüller

- **Kullanıcı Yönetimi** — kayıt, e-posta doğrulama, giriş, profil, ehliyet bilgisi, şifre sıfırlama, şifre değiştirme
- **Araç Yönetimi** — marka/model/plaka, yakıt tipi, vites, koltuk sayısı, km, günlük fiyat, müsaitlik, görsel URL
- **Rezervasyon** — tarih aralığı seçimi, çakışma kontrolü, durum takibi (Pending/Approved/Rejected/Cancelled/Completed)
- **Mock Ödeme** — Payment entity, KrediKartı/BankaKartı/Havale, kart formu, ödeme sayfası
- **Admin Paneli** — araç ekleme/düzenleme, rezervasyon onay/red, kullanıcı listeleme/kilitleme, raporlama
- **Rol + Claim Bazlı Yetkilendirme** — 4 rol (Admin/Moderator/CarManager/Customer), `can_delete_car` claim örneği
- **Görsel Yükleme** — `POST /api/cars/upload-image`, wwwroot/uploads/cars klasörüne kaydeder
- **Güvenlik** — Rate limiting, Identity lockout, DTO validation, security headers, kısıtlı DB kullanıcısı

## Kodlama Kuralları

### Genel
- Tüm kod (değişken, sınıf, metod, interface) **İngilizce** yazılır
- Açıklama ve yorumlar **Türkçe** yazılır
- Test yazılmıyor (şimdilik)
- Swagger/OpenAPI kullanılmıyor, API testi Postman ile yapılır

### C# / Backend
- Interface isimleri `I` prefix'i ile başlar: `ICarService`, `IReservationRepository`
- Repository pattern kullanılır; `DataAccess` katmanı doğrudan controller'dan çağrılmaz
- `Business` katmanı `DataAccess`'e bağımlıdır, `WebAPI` katmanı `Business`'a bağımlıdır
- Entity'ler `Entities` projesinde tutulur, hiçbir katmana bağımlı değildir
- JWT token üretimi ve doğrulaması `WebAPI` katmanında yönetilir
- EF Core migration'ları `DataAccess` projesinde tutulur

### Naming Conventions (C#)
- Sınıflar ve metodlar: `PascalCase`
- Değişkenler ve parametreler: `camelCase`
- Private field'lar: `_camelCase`
- Sabitler: `UPPER_SNAKE_CASE`

### TypeScript / Frontend
- Component'ler `PascalCase`, dosyalar `kebab-case`
- API çağrıları `services/` klasöründe toplanır
- Tailwind class'ları doğrudan JSX içinde kullanılır, ayrı CSS dosyası açılmaz
- Kullanıcıya gösterilen her başarı/hata mesajı `toast.success()` / `toast.error()` ile verilir, `alert()` kullanılmaz

## Veritabanı

- PostgreSQL bağlantı string'i `appsettings.Development.json`'da (git'e gitmez), production'da environment variable'dan okunur
- EF Core Code-First yaklaşımı kullanılır
- Her migration anlamlı isimle oluşturulur: `AddCarTable`, `AddReservationStatusColumn`
- **Çift bağlantı string'i**: `DefaultConnection` (kısıtlı kullanıcı, runtime), `MigrationConnection` (postgres superuser, sadece migration için)
- Runtime kullanıcısı `arabakiralama_app`: sadece SELECT/INSERT/UPDATE/DELETE yetkisi var, DDL yok
- `Program.cs`'te `db.Database.Migrate()` **kullanılmaz**, `db.Database.CanConnect()` kullanılır

## Auth

| Endpoint | Açıklama |
|----------|----------|
| `POST /api/auth/register` | Kayıt → e-posta doğrulama linki gönderir |
| `POST /api/auth/login` | Giriş → access token + refresh token döner |
| `POST /api/auth/refresh` | Access token yenile |
| `POST /api/auth/logout` | Refresh token iptal et |
| `GET /api/auth/confirm-email` | E-posta doğrulama |
| `POST /api/auth/resend-confirmation` | Doğrulama linkini tekrar gönder |
| `POST /api/auth/forgot-password` | Şifre sıfırlama linki gönder |
| `POST /api/auth/reset-password` | Yeni şifre belirle |

- Access token süresi: **15 dakika** (`Jwt:ExpiryMinutes`)
- Refresh token süresi: **7 gün** (`Jwt:RefreshTokenExpiryDays`)
- JWT Bearer token header'da taşınır: `Authorization: Bearer <token>`
- Roller: `Admin`, `Moderator`, `CarManager`, `Customer`
- Claim bazlı ince yetki örneği: `can_delete_car=true` (CarManager içinde araç silme yetkisi)
- `AuthResponseDto` ve `UserListDto`'ya `Claims: Dictionary<string,string>` eklendi
- `TokenService.GenerateAccessToken` kullanıcı claim'lerini JWT'ye ekler
- `useAuth` hook'unda `isStaff` (Admin|Moderator|CarManager) ve `hasClaim(type,value)` helper'ları var
- Identity lockout: 5 başarısız deneme → 15 dakika kilitlenme
- E-posta doğrulanmadan giriş yapılamaz
- Forgot password her zaman aynı mesaj döner (e-posta enumeration önleme)
- E-posta modu: dev'de `Console` (link ILogger'a yazılır), prod'da `SMTP`

## Güvenlik

- **Rate limiting**: `"auth"` policy (10 req/dk), `"global"` policy (100 req/dk)
- **Security headers**: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy
- **DTO validation**: Data Annotations ([Required], [MaxLength], [Range], [EmailAddress], [Url] vb.)
- **Kısıtlı DB kullanıcısı**: `arabakiralama_app` DDL yapamaz
- **JWT secret**: environment variable'dan okunur, kodda hard-coded değil

## Geliştirme Komutları

```bash
# PostgreSQL Docker container başlatma (yerel geliştirme)
docker run --name arabakiralama-postgres \
  -e POSTGRES_DB=arabakiralama_db \
  -e POSTGRES_PASSWORD=postgres123 \
  -p 5432:5432 \
  -d postgres:16-alpine

# Backend başlatma (appsettings.Development.json gerekli — git'e gitmez)
cd backend/ArabaKiralama.WebAPI
dotnet run

# EF Core migration oluşturma
cd backend/ArabaKiralama.WebAPI
dotnet ef migrations add <MigrationName> \
  --project ../ArabaKiralama.DataAccess \
  --startup-project .

# Veritabanını güncelleme
dotnet ef database update \
  --project ../ArabaKiralama.DataAccess \
  --startup-project .

# Frontend başlatma
cd frontend/araba-kiralama-ui
npm install   # ilk kurulumda
npm run dev
```

## Test Kullanıcıları (Seed Data)

Backend Development modunda başlarken `Program.cs` otomatik oluşturur:

| E-posta | Şifre | Rol | Claim |
|---------|-------|-----|-------|
| admin@araba.com | Admin123! | Admin | — |
| moderator@araba.com | Mod123! | Moderator | — |
| carmanager@araba.com | Car123! | CarManager | can_delete_car=true |
| employee@araba.com | Emp123! | CarManager | — |
| musteri@araba.com | Musteri123! | Customer | — |

## Yetkilendirme Yapısı

| Endpoint grubu | Yetkili roller |
|----------------|---------------|
| `GET/PUT /api/admin/reservations` | Admin, Moderator |
| `GET /api/admin/users` | Admin, Moderator |
| `PUT /api/admin/users/{id}/deactivate-activate` | Admin |
| `PUT /api/admin/users/{id}/role` | Admin |
| `PUT /api/admin/users/{id}/claims/*` | Admin |
| `GET /api/admin/stats` | Admin, Moderator, CarManager |
| `POST/PUT /api/cars` | Admin, CarManager |
| `DELETE /api/cars/{id}` | Policy: `CanDeleteCar` (Admin veya CarManager + can_delete_car=true) |

## Önemli Dosyalar

| Dosya | Açıklama |
|-------|----------|
| `backend/ArabaKiralama.WebAPI/appsettings.Development.json` | Dev config (git'e gitmez, elle oluşturulur) |
| `backend/ArabaKiralama.WebAPI/Extensions/ServiceExtensions.cs` | DI kayıtları + `CanDeleteCar` policy |
| `backend/ArabaKiralama.WebAPI/Middleware/ExceptionMiddleware.cs` | Global hata yakalama |
| `backend/ArabaKiralama.WebAPI/Services/TokenService.cs` | JWT üretimi (extraClaims parametresi var) |
| `backend/ArabaKiralama.WebAPI/Services/EmailService.cs` | Console/SMTP e-posta gönderimi |
| `backend/ArabaKiralama.WebAPI/Program.cs` | Seed data (Development modunda 5 test kullanıcısı) |
| `backend/ArabaKiralama.Business/Concrete/UserService.cs` | AssignRole, AddClaim, RemoveClaim metodları |
| `frontend/araba-kiralama-ui/services/api.ts` | Axios instance + refresh interceptor |
| `frontend/araba-kiralama-ui/hooks/useAuth.ts` | isAdmin, isStaff, hasClaim() |
| `frontend/araba-kiralama-ui/app/admin/users/page.tsx` | Rol dropdown + can_delete_car toggle |
