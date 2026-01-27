# Cloudflare Workers + D1 Deployment Guide

This guide will help you deploy Kasier to Cloudflare Workers with Cloudflare D1 database.

## Prerequisites

1. Node.js and npm installed
2. Cloudflare account (sign up at https://dash.cloudflare.com/sign-up)
3. Wrangler CLI installed

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Login to Cloudflare

```bash
npx wrangler login
```

This will open a browser window to authenticate with your Cloudflare account.

### 3. Create D1 Database

```bash
npm run d1:create
```

After running this command, you'll get output like:

```
✅ Successfully created DB 'toko-mudah-db'

[[d1_databases]]
binding = "DB"
database_name = "toko-mudah-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**Important:** Copy the `database_id` and update it in `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "toko-mudah-db"
database_id = "YOUR_DATABASE_ID_HERE"  # Replace with actual ID
```

### 4. Run Database Migrations

For local development:
```bash
npm run d1:migrate-local
npm run d1:seed-local
```

For production:
```bash
npm run d1:migrate
npm run d1:seed
```

### 5. Run Locally with Wrangler

```bash
npm run cf:dev
```

This will start the Wrangler dev server on `http://localhost:8788`.

### 6. Deploy to Production

```bash
npm run cf:deploy
```

## Project Structure

```
toko-mudah/
├── src/
│   ├── worker.ts           # Cloudflare Workers entry point with API routes
│   ├── lib/
│   │   └── api.ts          # API client for frontend
│   ├── hooks/
│   │   ├── useStore.ts     # Original local state hook (for reference)
│   │   ├── useStoreApi.ts  # New API-based hook
│   │   └── useStoreSettingsApi.ts  # API-based settings hook
│   └── ...
├── schema.sql              # Database schema
├── seed-data.sql           # Initial seed data
├── wrangler.toml           # Cloudflare Workers configuration
└── package.json
```

## API Endpoints

The following API endpoints are available:

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create a new category
- `PUT /api/categories/:id` - Update a category
- `DELETE /api/categories/:id` - Delete a category

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create a new product
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product

### Customers
- `GET /api/customers?q=query` - Search customers
- `POST /api/customers` - Create a new customer

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create a new transaction

### Settings
- `GET /api/settings` - Get store settings
- `PUT /api/settings` - Update store settings

## Switching from Local State to API

To use the API-based version instead of local state:

1. Update your component imports from:
   ```ts
   import { useStore } from '@/hooks/useStore';
   import { useStoreSettings } from '@/hooks/useStoreSettings';
   ```

   To:
   ```ts
   import { useStoreApi } from '@/hooks/useStoreApi';
   import { useStoreSettingsApi } from '@/hooks/useStoreSettingsApi';
   ```

2. The API is the same, so no other changes are needed in your components.

## Environment Variables

For development, create a `.env.local` file:

```
VITE_API_URL=http://localhost:8788
```

For production, the `VITE_API_URL` should be empty or set to your deployed Worker URL.

## Database Schema

The following tables are created:

- `categories` - Product categories
- `products` - Products with stock and pricing
- `customers` - Customer information
- `transactions` - Sales transactions
- `transaction_items` - Items in each transaction
- `store_settings` - Store configuration

## Troubleshooting

### Database Issues

To view or manage your D1 database:

```bash
# Local database
npx wrangler d1 execute toko-mudah-db --local --command="SELECT * FROM products"

# Production database
npx wrangler d1 execute toko-mudah-db --command="SELECT * FROM products"
```

### Worker Not Starting

Make sure:
1. You've run `npm install` to install all dependencies
2. You've logged in with `npx wrangler login`
3. The `database_id` in `wrangler.toml` is correctly set

### Build Errors

If you get TypeScript errors about missing types:
```bash
npm install --save-dev @cloudflare/workers-types
```

## Production Deployment Checklist

- [ ] Install dependencies: `npm install`
- [ ] Create D1 database: `npm run d1:create`
- [ ] Update `database_id` in `wrangler.toml`
- [ ] Run migrations: `npm run d1:migrate`
- [ ] Seed data: `npm run d1:seed`
- [ ] Build and deploy: `npm run cf:deploy`
- [ ] Test the deployed application

## Additional Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
