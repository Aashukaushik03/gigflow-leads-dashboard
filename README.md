# GigFlow – Smart Leads Dashboard

A production-grade full-stack Lead Management Dashboard built with the **MERN stack + TypeScript**.

---

##  Live Demo

- **Frontend:** https://gigflow-leads-dashboard-delta.vercel.app
- **Backend API:** https://gigflow-leads-dashboard-6m9r.onrender.com
- **Health Check:** https://gigflow-leads-dashboard-6m9r.onrender.com/health

---
## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, TailwindCSS, Vite |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |


---

## Features

### Authentication
- JWT-based login & registration
- Password hashing with bcrypt (12 salt rounds)
- Protected routes with auth middleware
- Session persistence via localStorage
- Token expiry handling with auto-redirect

### Lead Management (CRUD)
- Create, read, update, delete leads
- Lead fields: Name, Email, Status, Source, Notes
- Status: `New` | `Contacted` | `Qualified` | `Lost`
- Source: `Website` | `Instagram` | `Referral`

### Advanced Filtering & Search
- Filter by Status (single or combined)
- Filter by Source (single or combined)
- Search by name or email (debounced, 400ms)
- Sort by Latest or Oldest
- All filters work together simultaneously

### Pagination
- Backend pagination (10 records/page)
- `skip` + `limit` implementation
- Pagination metadata in every API response
- Smart page number display with ellipsis

### Role-Based Access Control (RBAC)
- **Admin**: Full access — view all leads, delete any lead, manage user roles
- **Sales**: Can only create/view/edit/delete their own leads

### CSV Export
- Export current filtered leads to CSV
- Respects active filters (status, source, search)
- Instant file download

### Dark Mode
- System preference detection on first load
- Toggle between light/dark with persistence
- Smooth transitions throughout

### UI/UX
- Fully responsive (mobile-first)
- Loading states with spinners
- Empty states with contextual messages
- Error boundaries with retry options
- Form validation with inline error messages
- Toast notifications for all actions
- Animated modals and transitions
- Stats banner with live counts

---

## Project Structure

```
gigflow/
├── backend/
│   ├── src/
│   │   ├── config/          # DB connection
│   │   ├── controllers/     # Route handlers (auth, leads)
│   │   ├── middleware/      # auth, errorHandler, validate
│   │   ├── models/          # User, Lead Mongoose schemas
│   │   ├── routes/          # auth, leads, users
│   │   └── types/           # Shared TypeScript interfaces
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── api/             # axios client, auth & leads API
│   │   ├── components/
│   │   │   ├── auth/        # ProtectedRoute
│   │   │   ├── dashboard/   # StatsBanner
│   │   │   ├── layout/      # Navbar
│   │   │   ├── leads/       # LeadCard, LeadForm, LeadFiltersBar, LeadDetailModal
│   │   │   └── ui/          # Modal, Spinner, Pagination, EmptyState, StatusBadge, ConfirmDialog
│   │   ├── context/         # AuthContext, ThemeContext
│   │   ├── hooks/           # useLeads (with debounce)
│   │   ├── pages/           # LoginPage, RegisterPage, DashboardPage
│   │   └── types/           # Shared TypeScript types & constants
│   ├── .env.example
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.ts
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## Local Setup (Without Docker)

### Prerequisites
- Node.js ≥ 18
- MongoDB running locally or a MongoDB Atlas URI

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/gigflow-leads-dashboard.git
cd gigflow-leads-dashboard
```

### 2. Backend setup
```bash
cd backend
npm install

# Copy and fill in env vars
cp .env.example .env
# Edit .env — set MONGODB_URI and JWT_SECRET

npm run dev
# API runs on http://localhost:5000
```

### 3. Frontend setup
```bash
cd ../frontend
npm install

cp .env.example .env
# VITE_API_URL defaults to /api (proxied by Vite to localhost:5000)

npm run dev
# App runs on http://localhost:5173
```

---

## Docker Setup (Recommended)

```bash
# From the root of the project
cp backend/.env.example backend/.env
# Edit backend/.env with your JWT_SECRET

docker-compose up --build
```

Services started:
- **Frontend**: http://localhost
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017

To stop:
```bash
docker-compose down
```

To stop and remove volumes (wipe DB):
```bash
docker-compose down -v
```

---

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Create account | No |
| POST | `/auth/login` | Login | No |
| GET | `/auth/me` | Get current user | Yes |

**Register / Login Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123",
  "role": "sales"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": { "_id": "...", "name": "John Doe", "email": "...", "role": "sales" },
    "token": "eyJhbGci..."
  }
}
```

### Leads

All lead endpoints require `Authorization: Bearer <token>` header.

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/leads` | List leads (filtered + paginated) | All |
| GET | `/leads/:id` | Get single lead | All |
| POST | `/leads` | Create lead | All |
| PUT | `/leads/:id` | Update lead | Owner / Admin |
| DELETE | `/leads/:id` | Delete lead | Owner / Admin |
| GET | `/leads/stats` | Get status/source stats | All |
| GET | `/leads/export/csv` | Export filtered leads as CSV | All |

**Query Parameters for GET /leads:**

| Param | Type | Values | Description |
|-------|------|--------|-------------|
| `status` | string | `New`, `Contacted`, `Qualified`, `Lost` | Filter by status |
| `source` | string | `Website`, `Instagram`, `Referral` | Filter by source |
| `search` | string | any | Search name or email |
| `sort` | string | `latest`, `oldest` | Sort order |
| `page` | number | ≥ 1 | Page number |
| `limit` | number | 1–50 | Records per page (default 10) |

**Paginated Response:**
```json
{
  "success": true,
  "message": "Leads fetched successfully",
  "data": {
    "items": [ ... ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 10,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

**Create / Update Lead Body:**
```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "status": "New",
  "source": "Instagram",
  "notes": "Interested in premium plan"
}
```

### Users (Admin Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | List all users |
| PATCH | `/users/:id/role` | Update user role |

---

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/gigflow
JWT_SECRET=your_super_secret_key_change_me
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

> ⚠️ Never commit `.env` files. Only `.env.example` files are committed.

---

## Scripts

### Backend
```bash
npm run dev      # Development with hot reload
npm run build    # Compile TypeScript
npm run start    # Run compiled JS (production)
npm run lint     # ESLint
```

### Frontend
```bash
npm run dev      # Vite dev server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # ESLint
```

---

## TypeScript Usage

- Strict mode enabled on both frontend and backend
- All interfaces and types defined in `src/types/index.ts`
- `any` usage avoided — Mongoose documents use generics
- Express request extended via `AuthRequest` interface
- All API responses typed with `ApiResponse<T>` generic

---

## Evaluation Checklist

- [x] TypeScript (strict, both FE + BE)
- [x] JWT Authentication
- [x] CRUD for Leads
- [x] Filtering (status, source, search, sort)
- [x] Multiple filters working together
- [x] Backend pagination (skip + limit)
- [x] Debounced search
- [x] CSV Export
- [x] Role-Based Access Control (admin + sales)
- [x] Docker Setup (multi-service compose)
- [x] Dark Mode
- [x] Loading & Error States
- [x] Form Validation
- [x] RESTful API with proper status codes
- [x] Centralized error handling
- [x] Clean folder structure
- [x] Reusable components
- [x] .env.example (no secrets committed)
- [x] README with setup instructions


