# WEJ Shoes

Premium footwear e-commerce website for the Pakistani market. Single store selling Men, Women & Kids footwear with Cash on Delivery (COD) only.

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 15 (App Router) | Frontend + API routes |
| JavaScript (NO TypeScript) | All source code |
| Tailwind CSS | Styling |
| Prisma ORM | Database access |
| Neon PostgreSQL | Database |
| Cloudinary | Image hosting |
| Resend | Email (password reset) |
| NextAuth v5 (beta) | Authentication |

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: 20)
- pnpm (package manager)
- Neon PostgreSQL database
- Cloudinary account
- Resend account

### 1. Clone & Install

```bash
git clone <repository-url>
cd wej-shoes
pnpm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

Required variables:
```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Resend (email)
RESEND_API_KEY="re_..."
```

### 3. Database Setup

```bash
# Push schema to database
npx prisma db push

# Seed initial data (if seed script exists)
npx prisma db seed
```

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Architecture

```
src/
├── app/
│   ├── (storefront)/     # Public customer pages
│   ├── (auth)/           # Login, signup, reset password
│   ├── (admin)/          # Admin panel (protected)
│   └── api/              # API route handlers
├── features/             # Business logic (service layer)
│   ├── auth/
│   ├── catalog/
│   ├── cart/
│   ├── checkout/
│   └── admin/
├── components/
│   ├── ui/               # Buttons, inputs
│   └── shared/           # ProductCard, etc.
├── lib/                  # Prisma, Cloudinary, utils
└── validators/           # Zod schemas
```

### Key Patterns

- **Server-Page + Client-Island**: Admin pages use server components for data fetching, client islands for interactivity
- **Service layer**: All business logic in `src/features/`, route handlers are thin
- **Optimistic UI**: Cart operations update UI immediately, roll back on failure
- **ISR caching**: Homepage static, product pages SSG, collections dynamic with CDN headers

## Caching Strategy

| Page | Type | Revalidation |
|------|------|--------------|
| Homepage | Static (`○`) | On-demand via admin |
| Product detail | SSG (`●`) | On-demand on edit |
| Collections | Dynamic (`ƒ`) | CDN cache headers |
| Sale page | Static (`○`) | On-demand |

## Admin Guide

### Access

- URL: `/admin-login`
- Default credentials: Check database seed or create via signup + manual role update

### Admin Sections

- **Dashboard**: Overview of orders, revenue
- **Orders**: List, filter, update status
- **Products**: CRUD with image upload (Cloudinary)
- **Categories**: Manage category tree
- **Homepage**: Edit hero content, featured products
- **Shipping**: Configure shipping rules
- **Settings**: Store name, contact info, currency
- **Contact**: View and manage contact form submissions

## Vercel Deployment

### 1. Connect Repository

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Framework: Next.js (auto-detected)

### 2. Environment Variables

Add all environment variables from `.env.local` in Vercel dashboard.

### 3. Build Settings

- **Build Command**: `npx prisma generate && next build`
- **Install Command**: `pnpm install`

### 4. Deploy

Click "Deploy". Vercel will:
1. Install dependencies
2. Run Prisma generate
3. Build Next.js
4. Deploy to edge network

### 5. Post-Deploy

- Run `npx prisma db push` once to sync schema
- Set up custom domain in Vercel dashboard
- Configure DNS records

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `npx prisma db push` | Push schema to database |
| `npx prisma generate` | Generate Prisma client |
| `npx prisma migrate dev` | Create migration |
| `npx prisma studio` | Open Prisma Studio |

## Project Structure Notes

- **No TypeScript**: All files are `.js` or `.jsx`
- **No package installs**: Always ask before adding dependencies
- **Soft delete**: Products, orders, categories use `deletedAt` timestamp
- **Decimal serialization**: Prisma Decimals must be serialized via `JSON.parse(JSON.stringify(...))`
- **Rate limiting**: In-memory Map-based limiter for auth + contact endpoints
