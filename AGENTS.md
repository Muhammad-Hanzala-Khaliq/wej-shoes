# PROJECT RULES - READ THIS BEFORE EVERY TASK

## Source of Truth
The file "SRD.md" in the project root is the single source of truth.
Before ANY task, you MUST read the relevant section of SRD.md first.
If a task is unclear, refer to SRD.md. Do NOT guess.
Do NOT add features or fields that are not in SRD.md.

## Project
Custom Footwear E-Commerce Website.
Single store, Men & Women footwear only.
Payment: Cash on Delivery (COD) only.

## Tech Stack (STRICT - DO NOT DEVIATE)
- Next.js 15 App Router
- JAVASCRIPT ONLY (absolutely NO TypeScript, NO .ts/.tsx files)
- Tailwind CSS
- Prisma ORM
- Neon PostgreSQL
- Cloudinary (images only)
- Resend (email only, for password reset)

## Folder Structure
src/
├── app/
│   ├── (storefront)/     # public customer pages
│   ├── (auth)/           # login, signup, reset
│   ├── (admin)/          # admin panel (protected)
│   └── api/              # route handlers
├── features/             # ALL business logic here
│   ├── auth/
│   ├── catalog/
│   ├── cart/
│   ├── checkout/
│   └── admin/
├── components/
│   ├── ui/               # buttons, inputs
│   └── shared/           # ProductCard, etc.
├── lib/                  # prisma, cloudinary, utils
└── validators/           # zod schemas

## Hard Rules
1. NO TypeScript. Only .js and .jsx.
2. NEVER install any package without asking me first.
3. Business logic MUST go in src/features/ (service layer).
4. Route handlers must be THIN - they only call services.
5. NEVER trust client-side prices, stock, or totals.
6. All validation happens on the server side.
7. Any DB change MUST use Prisma migrations.
8. If a task conflicts with the SRD, STOP and ask me.
9. Show me ONLY the files you changed. Nothing else.
10. Tell me how to test your work when you finish.

## Database Flexibility Rules
- Use soft delete (deletedAt DateTime?) on: Category, Product, ProductVariant, Order
- Add "metadata Json?" only on Product and Order tables
- Never hard-delete products or orders
- Every model must have createdAt and updatedAt
- Use String type for status fields (not enums)

## Performance Rules
- Add pagination (take/skip) to ALL list queries
- Use unstable_cache for public pages
- Optimize Cloudinary image URLs with proper sizes
- Add lazy loading for heavy components
- Add database indexes on frequently queried fields