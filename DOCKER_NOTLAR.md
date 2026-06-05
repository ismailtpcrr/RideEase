# Docker Notları — RideEase Projesi

## Docker Neden Kullanıyoruz?

Dockersız dünyada şu sorunlar çıkar:

```
"Bende .NET 8 var, sen 9 yazmışsın — çalışmıyor"
"Node versiyonum farklı"
"PostgreSQL bağlantısı kuramadım"
"Mac'te çalışıyor Windows'ta çalışmıyor"
```

Docker ile:

```
git clone ...
docker compose up
✅ Her bilgisayarda çalışır
```

Her container kendi içinde izole çalışır. Host bilgisayarda ne yüklü olduğu hiç önemli değil.

---

## Container Yapısı

```
docker compose up
       │
       ├──► postgres   (container) → port 5432
       ├──► backend    (container) → port 8080  → postgres'e bağlanır
       └──► frontend   (container) → port 3000  → backend'e istek atar
```

---

## Multi-Stage Build Nedir?

.NET ve Next.js'i build etmek için büyük araçlar (SDK, node_modules) gerekir ama çalıştırmak için gerekmez.
Multi-stage build ile: büyük image'da build et → küçük image'a sadece çıktıyı taşı.

```
Stage 1: Build        Stage 2: Runtime
┌──────────────┐      ┌──────────────┐
│  SDK (800MB) │ ───► │  ASP.NET     │
│  dotnet      │      │  (200MB)     │
│  publish     │      │  sadece .dll │
└──────────────┘      └──────────────┘
```

**Sonuç:** Final image küçük, kaynak kod içinde yok.

---

## Kaynak Kod Gizli Midir?

Final image içinde:

```
✅  .dll (derlenmiş binary)
✅  appsettings.json
✅  wwwroot/

❌  Program.cs
❌  Controllers/*.cs
❌  .csproj dosyaları
```

Image'ı alan kişi API'yi çalıştırabilir, kodu göremez ve değiştiremez.

---

## PostgreSQL İçin Dockerfile Yazılmaz

PostgreSQL için hazır official image kullanılır, Dockerfile yazmak gerekmez:

```yaml
postgres:
  image: postgres:16-alpine
```

---

## DataAccess Katmanı Nerede Çalışır?

DataAccess, Business, Entities, WebAPI → hepsi tek bir .NET binary'e derlenir.
Ayrı container olmaz, backend container'ının içinde çalışır.

---

## Senaryo 1 — Geliştirici (Koda katkı verecek)

```
git clone <repo>
    ↓
Kodu değiştirir
    ↓
docker compose up --build
    ↓
Çalışır
```

---

## Senaryo 2 — Sadece Çalıştıracak Kişi

**Git üzerinden:**
```
git clone <repo>
docker compose up --build   ← kendisi build eder
```

**Docker Hub üzerinden:**
```
docker pull <image>
docker compose up           ← build yok, direkt çalışır
```

| | Git | Docker Hub |
|---|---|---|
| Build gerekir mi? | Evet | Hayır |
| Kaynak kodu görür mü? | Evet | Hayır |
| Hız | Yavaş (build süresi) | Hızlı |
| Kullanım amacı | Geliştirici | Son kullanıcı / deploy |

---

## `docker compose up` vs `docker compose up --build`

```
docker compose up
→ Image zaten varsa onu kullanır (eski kod çalışabilir!)

docker compose up --build
→ Her seferinde yeniden build eder (güncel kod çalışır)
```

**Örnek:**

```
1. İlk kez çalıştırıyor → docker compose up
   Image yok → build eder → çalışır ✅

2. Kod değiştirdi → docker compose up
   Eski image var → build etmez → ESKİ KOD çalışır ❌

3. Kod değiştirdi → docker compose up --build
   Yeniden build eder → YENİ KOD çalışır ✅
```

**Kural:** Kod değiştiyse her zaman `--build` ekle.

---

## Build Etmek Ne Demek?

Kaynak kodu çalışabilir hale getirmek:

- Backend → `.cs` dosyaları → `.dll`'e dönüştürmek
- Frontend → `.tsx` dosyaları → optimize JS'e dönüştürmek

---

## Oluşturulan Dosyalar

| Dosya | Ne için |
|-------|---------|
| `backend/Dockerfile` | .NET projesini build et + çalıştır |
| `frontend/araba-kiralama-ui/Dockerfile` | Next.js'i build et + çalıştır |
| `docker-compose.yml` | PostgreSQL + Backend + Frontend'i birbirine bağla |
services:

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: arabakiralama_db
      POSTGRES_PASSWORD: postgres123
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ConnectionStrings__DefaultConnection=Host=postgres;Database=arabakiralama_db;Username=postgres;Password=postgres123
      - Jwt__Key=${JWT_KEY}
      - Jwt__Issuer=RideEase
      - Jwt__Audience=RideEaseClient
      - FrontendUrl=http://localhost:3000
    ports:
      - "8080:8080"
    depends_on:
      - postgres

  frontend:
    build:
      context: ./frontend/araba-kiralama-ui
      dockerfile: Dockerfile
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8080/api
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  postgres_data: