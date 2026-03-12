This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Prerequisites

Before running the application, ensure you have:

1. Node.js 18+ installed
2. PostgreSQL database running
3. Environment variables configured (copy `.env.example` to `.env` and fill in values)

### Database Setup

1. Run database migrations:

```bash
npm run db:migrate
```

2. Seed the database with sample data:

```bash
npm run db:seed
```

The seed script populates your database with sample data for development and testing. It is idempotent and safe to run multiple times.

#### What Gets Created

The seed script creates:
- **4 Users**: 1 admin and 3 customer accounts
- **11 Categories**: 3-level category hierarchy (Electronics, Clothing, Home & Garden)
- **10 Products**: Sample products across different categories
- **Product Images**: 2-3 images per product (using placeholder images)
- **Inventory**: Stock levels for all products (20-120 units each)
- **3 User Addresses**: Default shipping addresses for customers
- **3 Orders**: Sample orders in different states (delivered, shipped, processing)
- **5 Reviews**: Product reviews with ratings

#### Test User Credentials

Use these credentials to log in and test different user roles:

**Admin Account:**
- Email: `admin@zivara.com`
- Password: `password123`
- Access: Full admin dashboard, user management, order management, product management

**Customer Accounts:**
- Email: `john.doe@example.com` / Password: `password123`
- Email: `jane.smith@example.com` / Password: `password123`
- Email: `bob.wilson@example.com` / Password: `password123`
- Access: Customer features (shopping, orders, reviews, profile)

### Running the Development Server

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
