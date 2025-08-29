# Express + TypeScript + Sequelize (PostgreSQL) – REST API

Bu proje; **Express (v5)**, **TypeScript**, **Sequelize (sequelize-typescript)**, **PostgreSQL**, **JWT (access & refresh)**, **bcrypt** ve **Zod** kullanılarak geliştirilmiş, üretime uygun iskelet bir REST API sunar.

## İçindekiler

* [Özellikler](#özellikler)
* [Mimari ve Dizim](#mimari-ve-dizim)
* [Önkoşullar](#önkoşullar)
* [Kurulum](#kurulum)
* [Ortam Değişkenleri](#ortam-değişkenleri)
* [Çalıştırma](#çalıştırma)
* [Veritabanı ve Modeller](#veritabanı-ve-modeller)
* [Kimlik Doğrulama](#kimlik-doğrulama)
* [Endpointler](#endpointler)
* [Validasyon (Zod) ve Hata Formatı](#validasyon-zod-ve-hata-formatı)
* [Postman Kullanımı](#postman-kullanımı)
* [Scriptler (package.json)](#scriptler-packagejson)
* [Güvenlik ve Üretim Notları](#güvenlik-ve-üretim-notları)
* [Sorun Giderme](#sorun-giderme)

---

## Özellikler

* **TypeScript** ile güçlü tip güvenliği
* **Express 5** tabanlı katmanlı mimari
* **Sequelize (sequelize-typescript)** ile PostgreSQL ORM
* **JWT** tabanlı auth (access & refresh, **rotation + revoke** destekli)
* **bcrypt** ile güvenli parola hashleme
* **Zod** ile request body / query / params doğrulaması
* **Helmet, CORS, Morgan** ile temel güvenlik ve loglama

---

## Mimari ve Dizim

```
src/
  app.ts
  server.ts
  config/
    env.ts
  db/
    sequelize.ts
  models/
    user.model.ts
    refresh-token.model.ts
  controllers/
    auth.controller.ts
    user.controller.ts
  routes/
    auth.routes.ts
    user.routes.ts
  schemas/
    auth.schema.ts
    user.schema.ts
  middlewares/
    auth.middleware.ts
    validate.ts
  utils/
    jwt.ts
  types/
    express.d.ts
```

* **config/env.ts**: .env okuma ve tipli config
* **db/sequelize.ts**: Sequelize bağlantı ve model kaydı
* **models**: `User` (self-relation: `parentId` → `children`), `RefreshToken`
* **controllers**: İş mantığı (Auth & Users)
* **routes**: Express router katmanı
* **middlewares**: `requireAuth`, `validate`
* **schemas**: Zod şemaları
* **utils/jwt.ts**: JWT imzalama/doğrulama yardımcıları

---

## Önkoşullar

* **Node.js**: 18+ (önerilen 20+)
* **Yarn**
* **PostgreSQL**: Çalışır durumda olmalı (lokal veya uzak)

> Hızlı PostgreSQL için (Docker):
>
> ```bash
> docker run --name pg -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16
> ```

---

## Kurulum

```bash
# Bağımlılıklar
yarn install

# .env dosyasını oluşturun
cp .env.example .env
# .env içindeki değerleri düzenleyin
```

---

## Ortam Değişkenleri

`.env.example`:

```
NODE_ENV=development
PORT=4000
DATABASE_URL=postgres://postgres:password@localhost:5432/express_api

JWT_ACCESS_SECRET=replace-with-strong-random
JWT_REFRESH_SECRET=replace-with-strong-random
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

BCRYPT_SALT_ROUNDS=12
CORS_ORIGIN=http://localhost:5173
```

> **Güvenlik:** `JWT_*_SECRET` değerlerini güçlü ve rastgele seçin. Üretimde `.env` dosyasını asla versiyona eklemeyin.

---

## Çalıştırma

Geliştirme:

```bash
yarn dev
# http://localhost:4000/health
```

Derleme + Prod benzeri çalıştırma:

```bash
yarn build
yarn start
```

> Geliştirme modunda `sequelize.sync()` ile otomatik tablo senkronizasyonu yapılır. **Prod ortamında migration** kullanmanız önerilir (bkz. [Sorun Giderme](#sorun-giderme)).

---

## Veritabanı ve Modeller

### User

* `id: UUID`
* `email: string (unique)`
* `name: string`
* `password: string (bcrypt ile hashlenir)`
* `parentId: UUID | null` → self-relation
* `children: User[]` (tek seviye include edilir)

### RefreshToken

* `id: UUID`
* `jti: string (unique)`
* `userId: UUID`
* `revoked: boolean`
* `expiresAt: Date`

> **Parola Hashleme:** `User` modelindeki `@BeforeSave` hook’unda `bcrypt` ile otomatik yapılır.

---

## Kimlik Doğrulama

* **/auth/register** ve **/auth/login** işlemleri **accessToken** + **refreshToken** döner.
* **/auth/refresh**: Gönderilen refresh token geçerliyse **rotation** yapılır; eski refresh revoke edilir, yenisi verilir.
* **/auth/logout**: Gönderilen refresh token **revoked** yapılır.
* Korunan endpoint’ler `Authorization: Bearer <ACCESS_TOKEN>` ister.

---

## Endpointler

### Health

* `GET /health` → `{ ok: true }`

### Auth

* `POST /auth/register` → **201**: `{ user, tokens: { accessToken, refreshToken } }`
* `POST /auth/login` → **200**: `{ user, tokens: { accessToken, refreshToken } }`
* `POST /auth/refresh` → **200**: `{ accessToken, refreshToken }` (rotation)
* `POST /auth/logout` → **200**: `{ success: true }`

**Örnek:**

```bash
curl -X POST http://localhost:4000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"a@b.com","password":"P@ssw0rd!"}'
```

### Users (Auth gerekli)

* `GET /users`

  * Query: `page` (default 1), `limit` (default 10, max 100),
    `sortBy` (`createdAt|email|name`), `order` (`asc|desc`),
    `q` (ad/email arama), `parentId` (UUID filtre)
  * Response: `{ data: User[], meta: { page, limit, total, totalPages } }`
* `GET /users/:id` → `children` ile gelir
* `POST /users` → `{ id, email, name, parentId }` (parola gizlenir)
* `PUT /users/:id` / `PATCH /users/:id`
* `DELETE /users/:id` → **204**

**Örnek:**

```bash
curl -H "Authorization: Bearer <ACCESS_TOKEN>" \
  "http://localhost:4000/users?page=1&limit=10&sortBy=createdAt&order=asc&q=ali"
```

---

## Validasyon (Zod) ve Hata Formatı

Middleware: `validate.ts`

* `safeParse` ile **body / query / params** ayrı ayrı doğrulanır.
* Hatalar tek yanıtta toplanır.

**Hata örneği:**

```json
{
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email", "code": "invalid_string", "part": "body" },
    { "field": "password", "message": "String must contain at least 8 character(s)", "code": "too_small", "part": "body" }
  ]
}
```

> **Not (Express 5):** `req.query` ve `req.params` **getter** olduğu için yeniden atama yapılmaz; `Object.assign(req.query, parsed)` yaklaşımı kullanılır.

---

## Postman Kullanımı

**Basit Tests Script’i** (status 2xx ise token’ları global değişkenlere yazar):

```javascript
// Status 2xx kontrolü
pm.test("OK", function () {
  pm.expect(pm.response.code).to.be.within(200, 299);
});

let data = null;
try { data = pm.response.json(); } catch (e) {}

if (data && pm.response.code >= 200 && pm.response.code < 300) {
  const access  = data.accessToken  || data?.tokens?.accessToken;
  const refresh = data.refreshToken || data?.tokens?.refreshToken;
  if (access)  pm.globals.set("access_token", access);
  if (refresh) pm.globals.set("refresh_token", refresh);
}
```

**(Opsiyonel) Koleksiyon Pre-request Script** – Authorization header’ını otomatik ekler:

```javascript
const access = pm.globals.get('access_token');
if (access) {
  pm.request.headers.upsert({ key: 'Authorization', value: `Bearer ${access}` });
}
```

---

## Scriptler (package.json)

```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "lint": "eslint . --ext .ts",
    "format": "prettier --write .",
    "typecheck": "tsc --noEmit"
  }
}
```

---

## Güvenlik ve Üretim Notları

* **Secrets**: `JWT_*_SECRET` değerlerini güçlü tutun; prod’da gizli yönetin (Vault, Secrets Manager, Kubernetes Secret, vb.)
* **CORS**: `CORS_ORIGIN` `.env` ile yapılandırılır.
* **HTTPS**: Token taşırken daima HTTPS.
* **Rate Limiting**: Brute-force engellemek için `express-rate-limit` ekleyin.
* **Loglama**: Prod’da `morgan` yerine `pino` tercih edilebilir; `request-id` ekleyin.
* **Migrations**: `sequelize.sync()` yerine `sequelize-cli` veya `umzug` ile migration yönetimi kullanın.

---

## Sorun Giderme

### Zod: `AnyZodObject` export edilmiyor

* Çözüm: `ZodSchema<any>` veya `ZodTypeAny` kullanın; `AnyZodObject` import etmeyin.

### jsonwebtoken: `sign` overload hatası

* Namespace import kullanın: `import * as jwt from 'jsonwebtoken'`
* Secret’ı `as jwt.Secret` cast edin, `expiresIn` tipini `SignOptions['expiresIn']` olarak belirleyin.

### Express 5: `req.query`/`req.params` yeniden atama hatası

* `req.query = parsed` yerine `Object.assign(req.query, parsed)` kullanın.

### DB Bağlantı Hatası

* `DATABASE_URL` değerini kontrol edin, PG çalışıyor mu bakın.

---

## Lisans

Bu proje eğitim/örnek amaçlıdır. İhtiyacınıza göre lisanslayın.
