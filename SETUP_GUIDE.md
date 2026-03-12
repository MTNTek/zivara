# Zivara Development Environment Setup

## ✅ Completed Steps

1. ✅ Repository cloned
2. ✅ Dependencies installed (555 packages)
3. ✅ Environment file created (`.env.local`)

## 🔧 Next Steps

### 1. Configure Database

You need a PostgreSQL database. Choose one option:

**Option A: Local PostgreSQL**
- Install PostgreSQL from https://www.postgresql.org/download/
- Create a database: `createdb zivara`
- Update `DATABASE_URL` in `.env.local` with your credentials

**Option B: Docker PostgreSQL**
```bash
docker run --name zivara-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=zivara -p 5432:5432 -d postgres:16
```
Then use: `DATABASE_URL=postgresql://postgres:password@localhost:5432/zivara`

**Option C: Cloud Database (Neon, Supabase, etc.)**
- Sign up for a free PostgreSQL database
- Copy the connection string to `DATABASE_URL` in `.env.local`

### 2. Generate Auth Secret

Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```
Copy the output and replace `your-secret-key-here-change-this-in-production` in `.env.local`

### 3. Run Database Migrations

Once your database is configured:
```bash
npm run db:migrate
```

### 4. Seed Sample Data

Populate the database with test data:
```bash
npm run db:seed
```

This creates:
- 4 test users (1 admin, 3 customers)
- 11 product categories
- 10 sample products
- Sample orders and reviews

### 5. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## 🧪 Test Credentials

**Admin Account:**
- Email: `admin@zivara.com`
- Password: `password123`

**Customer Accounts:**
- Email: `john.doe@example.com` / Password: `password123`
- Email: `jane.smith@example.com` / Password: `password123`
- Email: `bob.wilson@example.com` / Password: `password123`

## 🔑 Optional Services

### Stripe (Payment Processing)
1. Sign up at https://dashboard.stripe.com
2. Get test API keys from https://dashboard.stripe.com/test/apikeys
3. Add to `.env.local`:
   - `STRIPE_SECRET_KEY=sk_test_...`
   - `STRIPE_PUBLISHABLE_KEY=pk_test_...`

### Resend (Email Notifications)
1. Sign up at https://resend.com
2. Get API key from https://resend.com/api-keys
3. Add to `.env.local`: `RESEND_API_KEY=re_...`

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run db:studio` - Open Drizzle Studio (database GUI)
- `npm run db:seed:demo` - Seed enhanced demo data

## ⚠️ Security Note

The `.env.local` file contains sensitive information. Never commit it to version control. It's already in `.gitignore`.

## 🐛 Troubleshooting

**Database connection errors:**
- Verify PostgreSQL is running
- Check DATABASE_URL format and credentials
- Ensure database exists

**Port 3000 already in use:**
- Stop other services on port 3000, or
- Use a different port: `PORT=3001 npm run dev`

**Module not found errors:**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
