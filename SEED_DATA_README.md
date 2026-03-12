# Seed Data Documentation

This document explains the seed data available for the Zivara e-commerce platform.

## Available Seed Scripts

### 1. Basic Seed (`npm run db:seed`)
- **File**: `src/db/seed.ts`
- **Products**: ~10 sample products
- **Use Case**: Quick testing and development
- **Features**:
  - 4 users (1 admin, 3 customers)
  - 11 categories (3-level hierarchy)
  - Sample orders with status history
  - Product reviews

### 2. Enhanced Seed (`npm run db:seed:enhanced`) ⭐ RECOMMENDED
- **File**: `src/db/seed-enhanced.ts`
- **Products**: 100+ realistic products
- **Use Case**: Full-featured demo and testing
- **Features**:
  - 6 users (1 admin, 5 customers)
  - 11 main categories
  - Comprehensive product catalog
  - Realistic pricing and descriptions
  - Product images (placeholder)
  - Inventory management
  - 50+ product reviews

## Product Categories

The enhanced seed includes products across all major categories:

### 1. Electronics (40+ products)
- **Smartphones**: iPhone 15 Pro Max, Samsung Galaxy S24 Ultra, Google Pixel 8 Pro, etc.
- **Laptops**: MacBook Pro, Dell XPS, HP Spectre, Lenovo ThinkPad, ASUS ROG, etc.
- **Tablets**: iPad Pro, Samsung Galaxy Tab, Microsoft Surface Pro, etc.
- **Cameras**: Canon EOS, Sony A7, Nikon Z8, Fujifilm X-T5, GoPro, etc.
- **Headphones**: Sony WH-1000XM5, AirPods Max, Bose QuietComfort, etc.
- **Smartwatches**: Apple Watch, Samsung Galaxy Watch, Garmin Fenix, etc.

### 2. Fashion (15+ products)
- **Men's Clothing**: Levi's jeans, Nike t-shirts, Adidas hoodies, Ralph Lauren polos, etc.
- **Women's Clothing**: Zara dresses, Lululemon leggings, H&M blazers, etc.
- **Shoes**: Nike Air Max, Adidas Ultraboost, Converse, Vans, New Balance, etc.

### 3. Home & Kitchen (6+ products)
- KitchenAid Stand Mixer
- Ninja Air Fryer
- Keurig Coffee Maker
- Instant Pot
- Dyson Vacuum
- iRobot Roomba

### 4. Beauty & Health (5+ products)
- Dyson Airwrap Styler
- Foreo Luna
- Olaplex Hair Repair
- La Mer Cream
- Fenty Beauty Foundation

### 5. Sports & Outdoors (5+ products)
- Peloton Bike
- Bowflex Dumbbells
- Hydro Flask
- Yeti Cooler
- TRX Suspension Trainer

### 6. Toys & Games (5+ products)
- LEGO Star Wars sets
- Nintendo Switch
- Barbie Dreamhouse
- Hot Wheels
- Nerf Blasters

### 7. Books (4+ products)
- Atomic Habits
- The Midnight Library
- Educated
- Where the Crawdads Sing

### 8. Automotive (4+ products)
- Garmin Dash Cam
- WeatherTech Floor Mats
- Anker Car Charger
- Michelin Wiper Blades

### 9. Pet Supplies (4+ products)
- Furbo Dog Camera
- PetSafe Automatic Feeder
- Catit Fountain
- Kong Dog Toy

### 10. Office Products (4+ products)
- Herman Miller Aeron Chair
- HP OfficeJet Printer
- Logitech MX Master Mouse
- Moleskine Notebook

### 11. Garden & Outdoor (4+ products)
- Weber Gas Grill
- Greenworks Lawn Mower
- Gardena Hose
- Miracle-Gro Soil

## How to Use

### First Time Setup

1. **Ensure database is running**:
   ```bash
   # Make sure your PostgreSQL database is running
   # Check your .env file for DATABASE_URL
   ```

2. **Run migrations**:
   ```bash
   npm run db:migrate
   ```

3. **Seed the database**:
   ```bash
   # For full product catalog (recommended)
   npm run db:seed:enhanced
   
   # OR for basic testing
   npm run db:seed
   ```

### Re-seeding

The seed scripts are **idempotent** - they clear existing data before inserting new data. You can run them multiple times safely:

```bash
npm run db:seed:enhanced
```

## Test Credentials

After seeding, you can log in with these accounts:

### Admin Account
- **Email**: admin@zivara.com
- **Password**: password123
- **Access**: Full admin dashboard access

### Customer Accounts
- **Email**: john.doe@example.com
- **Password**: password123

- **Email**: jane.smith@example.com
- **Password**: password123

- **Email**: bob.wilson@example.com
- **Password**: password123

- **Email**: alice.johnson@example.com
- **Password**: password123

- **Email**: charlie.brown@example.com
- **Password**: password123

## Product Features

Each product includes:
- ✅ Unique name and SKU
- ✅ Detailed description
- ✅ Realistic pricing
- ✅ Discount pricing (on select items)
- ✅ Multiple product images (2-4 per product)
- ✅ Inventory tracking (50-200 units per product)
- ✅ Category assignment
- ✅ SEO-friendly slugs

## Future Integration: Amazon Product API

This seed data is designed as a temporary solution. When you're ready to integrate with Amazon's Product Advertising API:

### Steps to Integrate:

1. **Sign up for Amazon Product Advertising API**:
   - Visit: https://affiliate-program.amazon.com/
   - Apply for API access
   - Get your Access Key and Secret Key

2. **Install AWS SDK**:
   ```bash
   npm install @aws-sdk/client-product-advertising-api
   ```

3. **Create API integration**:
   ```typescript
   // src/lib/amazon-api.ts
   import { ProductAdvertisingAPIClient } from '@aws-sdk/client-product-advertising-api';
   
   export async function fetchAmazonProducts(category: string) {
     // Your API integration code
   }
   ```

4. **Replace seed data with live data**:
   - Update product queries to fetch from Amazon API
   - Cache responses for performance
   - Sync inventory and pricing regularly

## Notes

- **Images**: Currently using placeholder images. Replace with actual product images when available.
- **Inventory**: Random quantities between 50-200 units per product.
- **Reviews**: 50 random reviews distributed across products.
- **Pricing**: Realistic pricing based on actual market values.
- **Discounts**: ~30% of products have discount pricing.

## Troubleshooting

### Database Connection Error
```bash
# Check your .env file
DATABASE_URL=postgresql://user:password@localhost:5432/zivara
```

### Migration Issues
```bash
# Reset and re-run migrations
npm run db:push
npm run db:seed:enhanced
```

### Clear All Data
```bash
# The seed scripts automatically clear existing data
# Just run the seed command again
npm run db:seed:enhanced
```

## Support

For issues or questions:
1. Check the main README.md
2. Review database schema in `src/db/schema.ts`
3. Inspect seed files for data structure

---

**Last Updated**: January 2024
**Version**: 1.0.0
