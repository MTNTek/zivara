# Zivara E-commerce Platform - Demo Setup

## First User Auto-Admin Feature

The platform now automatically makes the first registered user an admin. This is perfect for demos and initial setup.

## Quick Start

### 1. Clear All Data (Optional)
If you want to start completely fresh:

```bash
npm run db:clear
```

This removes all users, orders, products, and categories.

### 2. Seed Demo Data
Load sample products and categories (no users):

```bash
npm run db:seed:demo
```

This creates:
- 7 product categories (Electronics, Fashion, Home & Kitchen, etc.)
- 41 realistic products with images
- Inventory for all products

### 3. Start the Development Server

```bash
npm run dev
```

### 4. Create Your Admin Account

1. Go to http://localhost:3000/login
2. You'll be automatically redirected to /register (since no users exist)
3. Fill out the registration form
4. Your account will automatically be created as an admin!
5. Sign in with your new credentials

## How It Works

### First User Detection
- When registering, the system checks if any users exist in the database
- If no users exist, the new user is assigned the `admin` role
- All subsequent users are assigned the `customer` role

### Login Page Redirect
- The login page checks if any users exist on load
- If no users exist, it automatically redirects to the registration page
- This ensures you can't get stuck at the login page with no way to create an account

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run db:clear` | Remove all data from database |
| `npm run db:seed:demo` | Seed products and categories (no users) |
| `npm run db:seed:enhanced` | Seed everything including test users (old method) |
| `npm run dev` | Start development server |

## Demo Flow

1. **Fresh Start**: `npm run db:clear` → `npm run db:seed:demo`
2. **Start Server**: `npm run dev`
3. **Visit Site**: http://localhost:3000
4. **Register**: Create first account (becomes admin automatically)
5. **Explore**: Browse products, manage admin panel at /admin

## Notes

- The first user message appears in the toast notification after registration
- Admin users have access to `/admin` routes
- Regular customers can only access customer-facing pages
- You can always clear and reseed data for demos

## Security

This auto-admin feature is designed for:
- Development environments
- Demo purposes
- Initial platform setup

For production, you should:
- Manually create admin accounts through a secure process
- Disable auto-admin functionality
- Use proper authentication and authorization
