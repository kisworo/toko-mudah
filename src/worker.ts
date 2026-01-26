import { hashPassword, verifyPassword, generateToken, extractToken, verifyToken } from './auth';

interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Middleware to verify JWT token
async function authenticateUser(request: Request): Promise<{ userId: string; username: string } | null> {
  const authHeader = request.headers.get('Authorization');
  const token = extractToken(authHeader);

  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);
  return payload ? { userId: payload.userId, username: payload.username } : null;
}

export default {
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // ===== AUTH ENDPOINTS (no auth required) =====

      // Register endpoint
      if (path === '/api/auth/register' && request.method === 'POST') {
        const data = await request.json() as any;
        const { username, email, password, fullName } = data;

        // Validate input
        if (!username || !email || !password) {
          return Response.json(
            { error: 'Username, email, and password are required' },
            { status: 400, headers: corsHeaders }
          );
        }

        // Check if username already exists
        const existingUser = await env.DB.prepare(
          'SELECT id FROM users WHERE username = ? OR email = ?'
        ).bind(username, email).first();

        if (existingUser) {
          return Response.json(
            { error: 'Username or email already exists' },
            { status: 409, headers: corsHeaders }
          );
        }

        // Hash password and create user
        const passwordHash = await hashPassword(password);
        const id = crypto.randomUUID();
        const timestamp = new Date().toISOString();

        await env.DB.prepare(
          'INSERT INTO users (id, username, email, password_hash, full_name, is_demo, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        ).bind(id, username, email, passwordHash, fullName || null, 0, timestamp, timestamp).run();

        // Generate token
        const user = { id, username, email, full_name: fullName, is_demo: 0 };
        const token = await generateToken(user);

        return Response.json(
          {
            user: { id, username, email, full_name: fullName },
            token,
          },
          { headers: corsHeaders }
        );
      }

      // Login endpoint
      if (path === '/api/auth/login' && request.method === 'POST') {
        const data = await request.json() as any;
        const { username, password } = data;

        // Validate input
        if (!username || !password) {
          return Response.json(
            { error: 'Username and password are required' },
            { status: 400, headers: corsHeaders }
          );
        }

        // Find user by username or email
        const user = await env.DB.prepare(
          'SELECT * FROM users WHERE username = ? OR email = ?'
        ).bind(username, username).first() as any;

        if (!user) {
          return Response.json(
            { error: 'Invalid username or password' },
            { status: 401, headers: corsHeaders }
          );
        }

        // Verify password
        const isValid = await verifyPassword(password, user.password_hash);
        if (!isValid) {
          return Response.json(
            { error: 'Invalid username or password' },
            { status: 401, headers: corsHeaders }
          );
        }

        // Generate token
        const token = await generateToken(user);

        return Response.json(
          {
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              full_name: user.full_name,
              is_demo: user.is_demo,
            },
            token,
          },
          { headers: corsHeaders }
        );
      }

      // Get current user endpoint (requires auth)
      if (path === '/api/auth/me' && request.method === 'GET') {
        const authUser = await authenticateUser(request);
        if (!authUser) {
          return Response.json(
            { error: 'Unauthorized' },
            { status: 401, headers: corsHeaders }
          );
        }

        const user = await env.DB.prepare(
          'SELECT id, username, email, full_name, is_demo, created_at FROM users WHERE id = ?'
        ).bind(authUser.userId).first() as any;

        if (!user) {
          return Response.json(
            { error: 'User not found' },
            { status: 404, headers: corsHeaders }
          );
        }

        return Response.json(user, { headers: corsHeaders });
      }
      // Categories API
      if (path === '/api/categories' && request.method === 'GET') {
        const { results } = await env.DB.prepare(
          'SELECT * FROM categories ORDER BY name'
        ).all();
        return Response.json(results, { headers: corsHeaders });
      }

      if (path === '/api/categories' && request.method === 'POST') {
        const data = await request.json() as any;
        const id = Date.now().toString();
        await env.DB.prepare(
          'INSERT INTO categories (id, name, color) VALUES (?, ?, ?)'
        ).bind(id, data.name, data.color || null).run();
        return Response.json({ id, ...data }, { headers: corsHeaders });
      }

      if (path.startsWith('/api/categories/') && request.method === 'PUT') {
        const id = path.split('/').pop();
        const data = await request.json() as any;
        await env.DB.prepare(
          'UPDATE categories SET name = ?, color = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
        ).bind(data.name, data.color || null, id).run();
        return Response.json({ id, ...data }, { headers: corsHeaders });
      }

      if (path.startsWith('/api/categories/') && request.method === 'DELETE') {
        const id = path.split('/').pop();
        await env.DB.prepare('DELETE FROM categories WHERE id = ?').bind(id).run();
        return Response.json({ success: true }, { headers: corsHeaders });
      }

      // Products API
      if (path === '/api/products' && request.method === 'GET') {
        const { results } = await env.DB.prepare(
          'SELECT * FROM products ORDER BY name'
        ).all();
        return Response.json(results, { headers: corsHeaders });
      }

      if (path === '/api/products' && request.method === 'POST') {
        const data = await request.json() as any;
        const id = Date.now().toString();
        await env.DB.prepare(
          'INSERT INTO products (id, name, price, stock, category, image, discount_type, discount_value) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        ).bind(
          id,
          data.name,
          data.price,
          data.stock,
          data.category,
          data.image || null,
          data.discountType || null,
          data.discountValue || null
        ).run();
        return Response.json({ id, ...data }, { headers: corsHeaders });
      }

      if (path.startsWith('/api/products/') && request.method === 'PUT') {
        const id = path.split('/').pop();
        const data = await request.json() as any;
        await env.DB.prepare(
          'UPDATE products SET name = ?, price = ?, stock = ?, category = ?, image = ?, discount_type = ?, discount_value = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
        ).bind(
          data.name,
          data.price,
          data.stock,
          data.category,
          data.image || null,
          data.discountType || null,
          data.discountValue || null,
          id
        ).run();
        return Response.json({ id, ...data }, { headers: corsHeaders });
      }

      if (path.startsWith('/api/products/') && request.method === 'DELETE') {
        const id = path.split('/').pop();
        await env.DB.prepare('DELETE FROM products WHERE id = ?').bind(id).run();
        return Response.json({ success: true }, { headers: corsHeaders });
      }

      // Customers API
      if (path === '/api/customers' && request.method === 'GET') {
        const query = url.searchParams.get('q') || '';
        let sql = 'SELECT * FROM customers';
        const params: any[] = [];

        if (query) {
          sql += ' WHERE name LIKE ? OR phone LIKE ?';
          params.push(`%${query}%`, `%${query}%`);
        }

        sql += ' ORDER BY name';

        const stmt = env.DB.prepare(sql);
        const boundStmt = params.length > 0 ? stmt.bind(...params) : stmt;
        const { results } = await boundStmt.all();
        return Response.json(results, { headers: corsHeaders });
      }

      if (path === '/api/customers' && request.method === 'POST') {
        const data = await request.json() as any;
        const id = Date.now().toString();
        await env.DB.prepare(
          'INSERT INTO customers (id, name, phone) VALUES (?, ?, ?)'
        ).bind(id, data.name, data.phone || null).run();
        return Response.json({ id, ...data }, { headers: corsHeaders });
      }

      // Transactions API
      if (path === '/api/transactions' && request.method === 'GET') {
        const { results } = await env.DB.prepare(
          `SELECT t.*, c.name as customer_name, c.phone as customer_phone
           FROM transactions t
           LEFT JOIN customers c ON t.customer_id = c.id
           ORDER BY t.date DESC`
        ).all();

        // Get items for each transaction
        const transactions = await Promise.all(
          results.map(async (transaction: any) => {
            const { results: items } = await env.DB.prepare(
              'SELECT * FROM transaction_items WHERE transaction_id = ?'
            ).bind(transaction.id).all();
            return { ...transaction, items };
          })
        );

        return Response.json(transactions, { headers: corsHeaders });
      }

      if (path === '/api/transactions' && request.method === 'POST') {
        const data = await request.json() as any;
        const id = Date.now().toString();

        // Start transaction
        await env.DB.prepare(
          `INSERT INTO transactions (id, customer_id, total, total_discount, amount_paid, change_amount, payment_method, date)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          id,
          data.customerId || null,
          data.total,
          data.totalDiscount,
          data.amountPaid,
          data.change,
          data.paymentMethod,
          data.date
        ).run();

        // Insert transaction items
        for (const item of data.items) {
          await env.DB.prepare(
            `INSERT INTO transaction_items (transaction_id, product_id, product_name, quantity, price, discount_type, discount_value)
             VALUES (?, ?, ?, ?, ?, ?, ?)`
          ).bind(
            id,
            item.id,
            item.name,
            item.quantity,
            item.price,
            item.discountType || null,
            item.discountValue || null
          ).run();

          // Update product stock
          await env.DB.prepare(
            'UPDATE products SET stock = stock - ? WHERE id = ?'
          ).bind(item.quantity, item.id).run();
        }

        const transaction = await env.DB.prepare(
          `SELECT t.*, c.name as customer_name, c.phone as customer_phone
           FROM transactions t
           LEFT JOIN customers c ON t.customer_id = c.id
           WHERE t.id = ?`
        ).bind(id).first();

        return Response.json(transaction, { headers: corsHeaders });
      }

      // Settings API
      if (path === '/api/settings' && request.method === 'GET') {
        const settings = await env.DB.prepare(
          'SELECT * FROM store_settings WHERE id = 1'
        ).first();
        return Response.json(settings, { headers: corsHeaders });
      }

      if (path === '/api/settings' && request.method === 'PUT') {
        const data = await request.json() as any;
        await env.DB.prepare(
          `UPDATE store_settings
           SET store_name = ?, store_address = ?, store_phone = ?, theme_tone = ?, background_image = ?, updated_at = CURRENT_TIMESTAMP
           WHERE id = 1`
        ).bind(
          data.storeName,
          data.storeAddress || null,
          data.storePhone || null,
          data.themeTone,
          data.backgroundImage || null
        ).run();

        const settings = await env.DB.prepare(
          'SELECT * FROM store_settings WHERE id = 1'
        ).first();

        return Response.json(settings, { headers: corsHeaders });
      }

      // Serve static files for non-API routes
      try {
        // For root or non-static routes, serve index.html
        if (path === '/' || !path.includes('.')) {
          const asset = await env.ASSETS.fetch(new Request(new URL('/index.html', url)));
          return asset;
        }

        // Try to fetch from assets
        const asset = await env.ASSETS.fetch(request);
        return asset;
      } catch {
        return new Response('Not found', { status: 404 });
      }
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }
  },
};
