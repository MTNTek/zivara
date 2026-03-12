# Checkpoint 3: Database and Auth Setup Verification

## Overview
This document provides a comprehensive checklist and testing guide for verifying that the database schema and authentication system are working correctly.

## Prerequisites

### 1. PostgreSQL Setup
Before running any tests, ensure PostgreSQL is properly configured:

```bash
# Check if PostgreSQL is running
pg_isready

# If not running, start PostgreSQL service:
# Windows: Start "postgresql-x64-XX" service in Services
# Mac: brew services start postgresql
# Linux: sudo systemctl start postgresql

# Create the database (if not exists)
psql -U postgres -c "CREATE DATABASE zivaravs;"

# Verify connection
psql -U postgres -d zivaravs -c "SELECT version();"
```

### 2. Environment Variables
Verify `.env` file contains all required variables:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/zivaravs
NODE_ENV=development
NEXTAUTH_SECRET=development-secret-key-change-in-production-use-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000
RESEND_API_KEY=your-resend-api-key-here
EMAIL_FROM=noreply@zivara.com
```

## Verification Steps

### Step 1: Run Database Migrations ✓

**Command:**
```bash
npm run db:migrate
```

**Expected Output:**
```
⏳ Running migrations...
✅ Migrations completed successfully
```

**What This Tests:**
- Database connection is working
- Migration files are valid
- All tables are created successfully
- Foreign key relationships are established

**Troubleshooting:**
- If connection fails: Check PostgreSQL is running and credentials are correct
- If migration fails: Check migration SQL files in `src/db/migrations/`

---

### Step 2: Verify Database Schema

**Command:**
```bash
npm run db:studio
```

This opens Drizzle Studio in your browser where you can:
- View all tables
- Verify table structures match the schema
- Check indexes are created
- Verify foreign key constraints

**Expected Tables:**
- users
- categories
- products
- product_images
- inventory
- cart_items
- orders
- order_items
- order_status_history
- reviews
- user_addresses
- price_history
- sessions
- audit_logs
- search_queries

---

### Step 3: Test User Registration Flow

**Manual Test via UI:**
1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:3000/register`
3. Fill in the registration form:
   - Name: Test User
   - Email: test@example.com
   - Password: TestPassword123
4. Submit the form

**Expected Behavior:**
- ✅ Form validates input (email format, password strength)
- ✅ User is created in the database
- ✅ Password is hashed (not stored in plain text)
- ✅ User role is set to 'customer' by default
- ✅ User is redirected to login page
- ✅ Welcome email is sent (if RESEND_API_KEY is configured)

**Automated Test:**
```bash
npm run test -- src/features/auth/actions.test.ts
```

**Verify in Database:**
```sql
SELECT id, email, name, role, is_active, created_at 
FROM users 
WHERE email = 'test@example.com';
```

**Check:**
- ✅ User exists
- ✅ `password_hash` is a bcrypt hash (starts with `$2b$`)
- ✅ `role` is 'customer'
- ✅ `is_active` is true

---

### Step 4: Test User Login Flow

**Manual Test via UI:**
1. Navigate to `http://localhost:3000/login`
2. Enter credentials:
   - Email: test@example.com
   - Password: TestPassword123
3. Submit the form

**Expected Behavior:**
- ✅ Valid credentials: User is authenticated and redirected to homepage
- ✅ Invalid credentials: Error message displayed
- ✅ Session cookie is set
- ✅ Session expires after 24 hours

**Test Invalid Login:**
1. Try logging in with wrong password
2. Expected: Error message "Invalid credentials" or similar

**Verify Session:**
After successful login, check browser cookies:
- Cookie name: `next-auth.session-token` (or similar)
- Cookie should contain JWT token
- Cookie should have appropriate expiration

---

### Step 5: Verify Admin Route Protection

**Test 1: Access Admin Route as Guest**
1. Ensure you're logged out
2. Navigate to `http://localhost:3000/admin/dashboard`

**Expected Behavior:**
- ✅ Redirected to `/login` page
- ✅ Cannot access admin dashboard

**Test 2: Access Admin Route as Customer**
1. Log in as a regular customer (test@example.com)
2. Navigate to `http://localhost:3000/admin/dashboard`

**Expected Behavior:**
- ✅ Redirected to homepage `/`
- ✅ Cannot access admin dashboard

**Test 3: Access Admin Route as Admin**
1. Create an admin user in the database:
```sql
-- First, create the admin user via registration or manually
INSERT INTO users (email, name, password_hash, role, is_active)
VALUES (
  'admin@zivara.com',
  'Admin User',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5jtRZL6IWOWvW', -- password: Admin123
  'admin',
  true
);
```

2. Log in as admin (admin@zivara.com / Admin123)
3. Navigate to `http://localhost:3000/admin/dashboard`

**Expected Behavior:**
- ✅ Admin dashboard loads successfully
- ✅ Can access all admin routes

---

### Step 6: Test Middleware Protection

**Protected Routes (require authentication):**
- `/admin/*` - Requires admin role
- `/profile/*` - Requires authentication
- `/orders/*` - Requires authentication

**Test Each Route:**
1. **As Guest:** Should redirect to `/login`
2. **As Customer:** 
   - `/profile/*` and `/orders/*` should work
   - `/admin/*` should redirect to `/`
3. **As Admin:** All routes should work

---

### Step 7: Run Auth Unit Tests

**Command:**
```bash
npm run test -- src/features/auth
```

**Expected Results:**
All tests should pass:
- ✅ Email validation tests
- ✅ Password validation tests
- ✅ Name validation tests
- ✅ Registration validation tests
- ✅ Password reset validation tests

---

### Step 8: Verify Password Security

**Check Password Hashing:**
```sql
SELECT email, password_hash FROM users LIMIT 1;
```

**Verify:**
- ✅ Password hash starts with `$2b$12$` (bcrypt with 12 rounds)
- ✅ Hash is 60 characters long
- ✅ Plain text password is never stored

**Test Password Verification:**
The system should:
- ✅ Accept correct password
- ✅ Reject incorrect password
- ✅ Use constant-time comparison (bcrypt.compare)

---

## Verification Checklist

### Database Setup
- [ ] PostgreSQL is running
- [ ] Database `zivaravs` exists
- [ ] Migrations run successfully
- [ ] All tables are created
- [ ] Foreign keys are established
- [ ] Indexes are created

### Authentication System
- [ ] User registration works
- [ ] Passwords are hashed with bcrypt (12 rounds)
- [ ] User login works with valid credentials
- [ ] Login fails with invalid credentials
- [ ] Session is created on successful login
- [ ] Session expires after 24 hours

### Authorization & Route Protection
- [ ] Guest users cannot access protected routes
- [ ] Customers can access `/profile` and `/orders`
- [ ] Customers cannot access `/admin` routes
- [ ] Admin users can access all routes
- [ ] Middleware redirects unauthorized users correctly

### Security
- [ ] Passwords are never stored in plain text
- [ ] Password hashing uses bcrypt with 12 salt rounds
- [ ] Session tokens are secure (JWT)
- [ ] NEXTAUTH_SECRET is configured
- [ ] Email validation prevents invalid formats

### Testing
- [ ] Auth unit tests pass
- [ ] Schema validation tests pass (if implemented)
- [ ] Integration tests work with database

---

## Common Issues and Solutions

### Issue: Database Connection Refused
**Solution:**
1. Check PostgreSQL is running: `pg_isready`
2. Verify DATABASE_URL in `.env`
3. Ensure database exists: `psql -U postgres -l | grep zivaravs`

### Issue: Migration Fails
**Solution:**
1. Check migration files in `src/db/migrations/`
2. Verify schema.ts has no syntax errors
3. Try: `npm run db:push` (pushes schema directly without migrations)

### Issue: Login Not Working
**Solution:**
1. Check NEXTAUTH_SECRET is set in `.env`
2. Verify NEXTAUTH_URL matches your dev server
3. Clear browser cookies and try again
4. Check browser console for errors

### Issue: Admin Routes Not Protected
**Solution:**
1. Verify middleware.ts is configured correctly
2. Check user role in database: `SELECT role FROM users WHERE email = 'your@email.com'`
3. Clear session and log in again

---

## Next Steps

Once all verification steps pass:
1. ✅ Mark Checkpoint 3 as complete
2. ✅ Proceed to Task 4: Build core product catalog system
3. ✅ Document any issues or questions for the team

---

## Quick Test Script

Create a test user and verify everything works:

```bash
# 1. Run migrations
npm run db:migrate

# 2. Start dev server
npm run dev

# 3. In another terminal, run tests
npm run test

# 4. Open browser and test:
# - Register: http://localhost:3000/register
# - Login: http://localhost:3000/login
# - Try admin: http://localhost:3000/admin/dashboard
```

---

## Status: ⏸️ PENDING DATABASE CONNECTION

**Current Blocker:** PostgreSQL connection is not available.

**To Resume:**
1. Ensure PostgreSQL is running
2. Create the `zivaravs` database
3. Run `npm run db:migrate`
4. Follow the verification steps above

**Once Complete:** All checkboxes should be checked ✅
