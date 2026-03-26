# Tutorials & Knowledge Base (Next.js)

A web application for publishing and managing tutorials and support resources (videos, PDFs, FAQs, and images). It includes:

- A **public portal** with search and filters.
- An **admin panel** to create/edit content, upload files, and manage catalogs.
- Storage of uploaded files on disk and streaming (Range) support for videos.

## Tech Stack

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **SQL Server** (via `mssql`)
- Optional **LDAP/Active Directory** authentication for admin login (with a local DB fallback)

## Project Structure (high level)

- `app/(public)/...`
  - Public portal pages (list and detail)
- `app/admin/...`
  - Admin panel pages
- `app/api/...`
  - API routes (tutorials, auth, upload, catalogs)
- `app/tutorials-files/[...path]/route.ts`
  - Serves uploaded files from the configured `UPLOAD_DIR` (supports HTTP Range)
- `components/...`
  - UI components
- `lib/db.ts`
  - SQL Server connection (pool)
- `sql/*.sql`
  - Database creation/seed scripts

## Requirements

- Node.js 18+ (recommended)
- SQL Server instance reachable from the machine running the app

## Setup

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Create a `.env.local` file in the project root.

Minimal configuration (SQL Server + JWT + file storage):

```bash
# Database
DB_SERVER=YOUR_SQL_SERVER_HOST
DB_PORT=1433
DB_DATABASE=YOUR_DATABASE_NAME
DB_USER=YOUR_DB_USER
DB_PASSWORD=YOUR_DB_PASSWORD
DB_ENCRYPT=true
DB_TRUST_SERVER_CERT=false

# JWT
JWT_SECRET=change_me
JWT_EXPIRES_IN=8h

# File storage
UPLOAD_DIR=E:\path\to\tutorials-files
UPLOAD_BASE_URL=http://localhost:3001/tutorials/tutorials-files
MAX_FILE_SIZE=104857600

# App
NEXT_PUBLIC_BASE_PATH=/tutorials
NEXT_PUBLIC_API_URL=http://localhost:3001/tutorials
```

Optional LDAP/AD authentication variables:

```bash
AD_SERVER=ldap://your-ldap-host:389
AD_DOMAIN=example.local
AD_BASE_DN=DC=example,DC=local
AD_PORT=389
AD_TIMEOUT=5000
AD_CONNECT_TIMEOUT=5000
AD_RETRY_COUNT=3
AD_ADMIN_GROUP=
```

### 3) Initialize database

Run the SQL scripts under `sql/` in your SQL Server:

- `sql/01_create_tables.sql`
- `sql/02_seed_data.sql` (if present/needed)

> Note: `01_create_tables.sql` includes catalog tables used to populate admin dropdowns (content type, user profile, operation type).

### 4) Start the dev server

```bash
npm run dev
```

The app will be available at:

- Public portal: `http://localhost:3001/tutorials`
- Admin panel: `http://localhost:3001/tutorials/admin/login`

## Admin Features

- Manage tutorials (create/edit, activate/deactivate, soft-delete)
- Upload files (videos, PDFs, thumbnails, images)
- Manage catalogs (dropdown values):
  - Content types
  - User profiles
  - Operation types

## File Uploads & Serving

- Uploads are written to `UPLOAD_DIR`.
- Public URLs are based on `UPLOAD_BASE_URL`.
- Files are served via a Next.js route handler with Range support:
  - `app/tutorials-files/[...path]/route.ts`

### Common local URL examples

- Video:
  - `http://localhost:3001/tutorials/tutorials-files/videos/<file>.mp4`
- Thumbnail:
  - `http://localhost:3001/tutorials/tutorials-files/thumbnails/<file>.png`

## Notes on Security (quick checklist)

- Do not commit `.env.local`.
- Prefer storing admin sessions in **HttpOnly cookies** (recommended improvement) instead of `localStorage`.
- Apply rate limiting to authentication and upload routes if exposed publicly.

## Scripts

- `npm run dev` — start development server
- `npm run build` — build for production
- `npm run start` — run production build

## Troubleshooting

### Slow requests to `/api/*`

If API calls take ~15 seconds, it usually indicates SQL connectivity issues (wrong port/host or initial timeouts).

- Verify `DB_SERVER` and `DB_PORT`.
- Consider using the standard SQL Server port `1433`.

### React / Next runtime errors

If you see `Invalid hook call` or runtime module errors, ensure React versions are aligned with Next.js.

- Recommended:
  - `react@18.2.0`
  - `react-dom@18.2.0`
