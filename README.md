# Fullstack DevCase

## Proje Özeti
Bu proje, Next.js tabanlı bir kullanıcı yönetim paneli ve Node.js/Express/Sequelize ile yazılmış bir REST API'den oluşmaktadır. Kullanıcılar üzerinde CRUD işlemleri, authentication, parent-child ilişkisi, arama ve sıralama gibi özellikler sunar.

## Kullandığımız Teknolojiler
- **Frontend:** Next.js, React, TypeScript, Axios, Radix UI, Lucide Icons
- **Backend:** Node.js, Express, Sequelize
- **Veritabanı:** PostgreSQL
- **Diğer:** Postman (API dokümantasyonu ve testleri için)

## Eklenen Özellikler
- JWT tabanlı authentication (login, register, refresh, logout)
- Kullanıcı ekleme, silme, düzenleme, parent seçimi (email ile)
- Kullanıcı tablosunda arama (debounce ile), sıralama (en yeni, isme göre)
- Modal ile kullanıcı ekleme/düzenleme/silme işlemleri
- API'da arama (q parametresi ile), sıralama (sortBy, order parametreleri)
- Frontend'de arama ve sıralama seçenekleri
- Tüm API endpointleri için Postman koleksiyonu

## Kurulum ve Çalıştırma

### Gereksinimler
- Node.js (v18+ önerilir)
- PostgreSQL (çalışır durumda bir veritabanı)

### Backend (API) Kurulumu
1. `api/` klasörüne gidin:
   ```bash
   cd api
   ```
2. Bağımlılıkları yükleyin:
   ```bash
   yarn install # veya npm install
   ```
3. `.env` dosyasını doldurun (örnek için `.env.example` dosyasını kullanabilirsiniz):
   - PostgreSQL bağlantı bilgileri
   - JWT secret
4. Veritabanını oluşturun ve migrasyonları çalıştırın (gerekirse):
   ```bash
   # PostgreSQL'de veritabanı oluşturun
   createdb devcase
   # Sequelize migration komutları (varsa)
   # yarn sequelize db:migrate
   ```
5. API'yi başlatın:
   ```bash
   yarn dev
   # veya
   npm run dev
   ```
   - API varsayılan olarak `http://localhost:4000` portunda çalışır.

### Frontend Kurulumu
1. `frontend/` klasörüne gidin:
   ```bash
   cd frontend
   ```
2. Bağımlılıkları yükleyin:
   ```bash
   yarn install # veya npm install
   ```
3. Frontend'i başlatın:
   ```bash
   yarn dev
   # veya
   npm run dev
   ```
   - Frontend varsayılan olarak `http://localhost:3000` portunda çalışır.
   - **Not:** CORS sorunları yaşamamak için frontend'i 3000 portunda çalıştırın.

## API Dökümantasyonu
- Tüm API endpointleri ve örnek istekler için `REST API.postman_collection.json` dosyasını kullanabilirsiniz.
- Postman ile import ederek test edebilirsiniz.

## Önemli Dosyalar
- `api/` : Backend kaynak kodu
- `frontend/` : Frontend kaynak kodu
- `REST API.postman_collection.json` : API dokümantasyon ve test koleksiyonu

## Geliştirilen Akışlar
- Kullanıcı ekleme, silme, düzenleme (modal ile)
- Parent-child ilişkisi (parent email ile seçilebiliyor)
- Arama ve sıralama (API ve frontend entegre)
- JWT authentication
- Postman ile test edilebilir API

---
Herhangi bir sorunda veya geliştirme için bana ulaşabilirsiniz.
