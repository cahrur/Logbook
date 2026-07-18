# Logbook Proyek

Aplikasi untuk mencatat perjalanan proyek yang alur & requirement-nya masih sering berubah. Diorganisir **per modul** dan diisi **bersama tim**: aktivitas harian, milestone, usulan, dan laporan rapat semuanya menempel ke modulnya, sehingga setiap perubahan bisa dilacak balik ke sumbernya.

> Status: **Fase 1** (fondasi) — auth multi-user, modul, dan activity log. Milestone, papan usulan, dan agenda/laporan rapat menyusul di Fase 2.

## Features

### Fase 1 (selesai)
- [x] Autentikasi multi-user (JWT access + refresh, rotation) dengan 3 peran: **admin**, **member**, **viewer**
- [x] Manajemen tim (admin menambah user & mengatur peran)
- [x] CRUD **Modul** sebagai unit kerja proyek (status + progres manual + PIC)
- [x] **Activity log** harian tertaut modul, dengan timeline & filter (modul/kategori)
- [x] Dashboard "Hari Ini": statistik, progres modul, aktivitas terbaru

### Fase 2 (berikutnya)
- [ ] Milestone per modul (target, revisi target, status)
- [ ] Papan usulan (alur status + pengusul internal/eksternal)
- [ ] Agenda rapat + laporan (ringkasan, keputusan, action item)
- [ ] Tautan jejak keputusan: laporan ⇄ usulan ⇄ milestone

## Tech Stack

| Layer     | Technology                                   |
|-----------|----------------------------------------------|
| Frontend  | React + Vite, TanStack Query, Tailwind CSS   |
| Backend   | Express.js (layered: route → controller → service → repository) |
| Database  | MySQL atau PostgreSQL (via Knex)             |
| Auth      | JWT (access + refresh) + bcrypt, RBAC        |
| Deploy    | Docker (single image) + Coolify              |

## Struktur Proyek

```
activity-log-project/
├── backend/          # Express API + serve build frontend (produksi)
│   ├── src/
│   │   ├── config/         # env loader + koneksi Knex
│   │   ├── controllers/    # handle request/response
│   │   ├── services/       # business logic
│   │   ├── repositories/   # akses database
│   │   ├── middlewares/    # auth, authorize (RBAC), validate, error
│   │   ├── validations/    # skema Zod
│   │   ├── routes/         # definisi endpoint
│   │   └── utils/          # errors, response, db helper (dialect-agnostic)
│   ├── migrations/         # Knex migration (auto-run saat startup)
│   └── server.js
├── frontend/         # React (Vite)
│   └── src/{pages,components,layouts,hooks,services,context,lib}
└── Dockerfile        # multi-stage → 1 image untuk Coolify
```

## Getting Started (Development)

### Prerequisites
- Node.js 20+
- MySQL 8+ **atau** PostgreSQL 14+

### 1. Database
Buat database kosong, misal `logbook_proyek`. Migrasi berjalan otomatis saat backend start.

### 2. Backend
```bash
cd backend
cp .env.example .env         # lalu sesuaikan (lihat tabel di bawah)
npm install
npm run dev                  # http://localhost:8000
```
Saat pertama kali start dan tabel `users` masih kosong, sistem membuat akun admin awal dari `ADMIN_EMAIL` / `ADMIN_PASSWORD` di `.env`.

### 3. Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev                  # http://localhost:5173
```
Vite mem-proxy `/api` ke backend, jadi login langsung berfungsi.

### Environment Variables (backend)

| Variable | Description | Contoh |
|----------|-------------|--------|
| `APP_PORT` | Port server | `8000` |
| `CORS_ORIGINS` | Origin frontend (comma-separated) | `http://localhost:5173` |
| `DB_CLIENT` | `mysql2` atau `pg` | `mysql2` |
| `DB_HOST` / `DB_PORT` | Host & port DB | `localhost` / `3306` |
| `DB_NAME` / `DB_USER` / `DB_PASS` | Kredensial DB | `logbook_proyek` / `root` / — |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Secret JWT (harus berbeda) | 96 hex chars |
| `BCRYPT_ROUNDS` | Cost bcrypt | `12` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Admin awal (first boot) | — |

## Production Deployment (Coolify)

Seluruh app = **1 resource** (satu Docker image: Express menyajikan API + build frontend). Database dibuat sebagai **resource terpisah** di Coolify.

1. Push repo ke GitHub.
2. Buat resource baru di Coolify → **Dockerfile** (build context = root repo).
3. Buat resource database (MySQL/PostgreSQL) terpisah, sambungkan via internal network.
4. Set environment variables di **Coolify Dashboard** (jangan commit `.env`).
5. Deploy. Migrasi berjalan otomatis saat container start.

### Health Check
```
GET /health → 200 OK
```
(Sudah dikonfigurasi juga di `HEALTHCHECK` Dockerfile.)

## API Documentation

Base URL: `/api/v1`

| Method | Endpoint | Peran | Deskripsi |
|--------|----------|-------|-----------|
| `POST` | `/auth/login` | publik | Login → access token + refresh cookie |
| `POST` | `/auth/refresh` | cookie | Rotasi refresh token → access token baru |
| `POST` | `/auth/logout` | auth | Revoke semua sesi |
| `GET`  | `/auth/me` | auth | Profil user |
| `GET`  | `/auth/users` | admin | Daftar user |
| `POST` | `/auth/users` | admin | Buat user |
| `GET`  | `/modules` | semua | Daftar modul + progres |
| `GET`  | `/modules/:id` | semua | Detail modul |
| `POST` | `/modules` | admin, member | Buat modul |
| `PUT`  | `/modules/:id` | admin, member | Update modul |
| `DELETE` | `/modules/:id` | admin | Hapus modul |
| `GET`  | `/activities` | semua | Daftar aktivitas (filter: modul, kategori, tanggal) |
| `POST` | `/activities` | admin, member | Catat aktivitas |
| `PUT`  | `/activities/:id` | admin, member* | Update (member: hanya miliknya) |
| `DELETE` | `/activities/:id` | admin, member* | Hapus (member: hanya miliknya) |
| `GET`  | `/dashboard` | auth | Ringkasan dashboard |
| `GET`  | `/health` | publik | Health check |

Format respons konsisten: `{ success, message, data }`.

## License

MIT
