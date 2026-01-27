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
  'Cache-Control': 'no-store, no-cache, must-revalidate, private',
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

// Helper function to verify authentication and return user ID
async function requireAuth(request: Request): Promise<string | null> {
  const authUser = await authenticateUser(request);
  return authUser ? authUser.userId : null;
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
        const { email, password, businessName } = data;

        // Validate input
        if (!email || !password) {
          return Response.json(
            { error: 'Email and password are required' },
            { status: 400, headers: corsHeaders }
          );
        }

        // Check if email already exists
        const existingUser = await env.DB.prepare(
          'SELECT id FROM users WHERE email = ?'
        ).bind(email).first();

        if (existingUser) {
          return Response.json(
            { error: 'Email already exists' },
            { status: 409, headers: corsHeaders }
          );
        }

        // Hash password and create user
        const passwordHash = await hashPassword(password);
        const id = crypto.randomUUID();
        const username = email.split('@')[0]; // Generate username from email for compatibility
        const timestamp = new Date().toISOString();

        await env.DB.prepare(
          'INSERT INTO users (id, username, email, password_hash, full_name, is_demo, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        ).bind(id, username, email, passwordHash, businessName || null, 0, timestamp, timestamp).run();

        // Generate token
        const user = { id, username, email, full_name: businessName, is_demo: 0 };
        const token = await generateToken(user);

        return Response.json(
          {
            user: { id, username, email, full_name: businessName },
            token,
          },
          { headers: corsHeaders }
        );
      }

      // Login endpoint
      if (path === '/api/auth/login' && request.method === 'POST') {
        const data = await request.json() as any;
        const { email, password } = data;

        // Validate input
        if (!email || !password) {
          return Response.json(
            { error: 'Email and password are required' },
            { status: 400, headers: corsHeaders }
          );
        }

        // Find user by email
        const user = await env.DB.prepare(
          'SELECT * FROM users WHERE email = ?'
        ).bind(email).first() as any;

        if (!user) {
          return Response.json(
            { error: 'Invalid email or password' },
            { status: 401, headers: corsHeaders }
          );
        }

        // Verify password
        const isValid = await verifyPassword(password, user.password_hash);
        if (!isValid) {
          return Response.json(
            { error: 'Invalid email or password' },
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

      // ===== PROTECTED ENDPOINTS (requires auth) =====

      // Get user ID for all subsequent requests
      const userId = await requireAuth(request);

      // Categories API
      if (path === '/api/categories' && request.method === 'GET') {
        if (!userId) {
          return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
        }
        const { results } = await env.DB.prepare(
          'SELECT * FROM categories WHERE user_id = ? ORDER BY name'
        ).bind(userId).all();
        return Response.json(results, { headers: corsHeaders });
      }

      if (path === '/api/categories' && request.method === 'POST') {
        if (!userId) {
          return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
        }
        const data = await request.json() as any;
        const id = Date.now().toString();
        await env.DB.prepare(
          'INSERT INTO categories (id, user_id, name, color) VALUES (?, ?, ?, ?)'
        ).bind(id, userId, data.name, data.color || null).run();
        return Response.json({ id, ...data }, { headers: corsHeaders });
      }

      if (path.startsWith('/api/categories/') && request.method === 'PUT') {
        if (!userId) {
          return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
        }
        const id = path.split('/').pop();
        const data = await request.json() as any;
        // Also check ownership
        await env.DB.prepare(
          'UPDATE categories SET name = ?, color = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?'
        ).bind(data.name, data.color || null, id, userId).run();
        return Response.json({ id, ...data }, { headers: corsHeaders });
      }

      if (path.startsWith('/api/categories/') && request.method === 'DELETE') {
        if (!userId) {
          return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
        }
        const id = path.split('/').pop();
        await env.DB.prepare('DELETE FROM categories WHERE id = ? AND user_id = ?').bind(id, userId).run();
        return Response.json({ success: true }, { headers: corsHeaders });
      }

      // Products API
      if (path === '/api/products' && request.method === 'GET') {
        if (!userId) {
          return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
        }
        const { results } = await env.DB.prepare(
          'SELECT * FROM products WHERE user_id = ? ORDER BY name'
        ).bind(userId).all();
        return Response.json(results, { headers: corsHeaders });
      }

      if (path === '/api/products' && request.method === 'POST') {
        if (!userId) {
          return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
        }
        const data = await request.json() as any;
        const id = Date.now().toString();
        await env.DB.prepare(
          'INSERT INTO products (id, user_id, name, price, stock, category, image, discount_type, discount_value) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        ).bind(
          id,
          userId,
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
        if (!userId) {
          return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
        }
        const id = path.split('/').pop();
        const data = await request.json() as any;
        await env.DB.prepare(
          'UPDATE products SET name = ?, price = ?, stock = ?, category = ?, image = ?, discount_type = ?, discount_value = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?'
        ).bind(
          data.name,
          data.price,
          data.stock,
          data.category,
          data.image || null,
          data.discountType || null,
          data.discountValue || null,
          id,
          userId
        ).run();
        return Response.json({ id, ...data }, { headers: corsHeaders });
      }

      if (path.startsWith('/api/products/') && request.method === 'DELETE') {
        if (!userId) {
          return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
        }
        const id = path.split('/').pop();
        await env.DB.prepare('DELETE FROM products WHERE id = ? AND user_id = ?').bind(id, userId).run();
        return Response.json({ success: true }, { headers: corsHeaders });
      }

      // Customers API
      if (path === '/api/customers' && request.method === 'GET') {
        if (!userId) {
          return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
        }
        const query = url.searchParams.get('q') || '';
        let sql = 'SELECT * FROM customers WHERE user_id = ?';
        const params: any[] = [userId];

        if (query) {
          sql += ' AND (name LIKE ? OR phone LIKE ?)';
          params.push(`%${query}%`, `%${query}%`);
        }

        sql += ' ORDER BY name';

        const stmt = env.DB.prepare(sql);
        const { results } = await stmt.bind(...params).all();
        return Response.json(results, { headers: corsHeaders });
      }

      if (path === '/api/customers' && request.method === 'POST') {
        if (!userId) {
          return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
        }
        const data = await request.json() as any;
        const id = Date.now().toString();
        await env.DB.prepare(
          'INSERT INTO customers (id, user_id, name, phone) VALUES (?, ?, ?, ?)'
        ).bind(id, userId, data.name, data.phone || null).run();
        return Response.json({ id, ...data }, { headers: corsHeaders });
      }

      // Transactions API
      if (path === '/api/transactions' && request.method === 'GET') {
        if (!userId) {
          return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
        }
        const { results } = await env.DB.prepare(
          `SELECT t.*, c.name as customer_name, c.phone as customer_phone
           FROM transactions t
           LEFT JOIN customers c ON t.customer_id = c.id AND c.user_id = t.user_id
           WHERE t.user_id = ?
           ORDER BY t.date DESC`
        ).bind(userId).all();

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
        if (!userId) {
          return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
        }
        const data = await request.json() as any;
        const id = Date.now().toString();

        // Start transaction
        await env.DB.prepare(
          `INSERT INTO transactions (id, user_id, customer_id, total, total_discount, amount_paid, change_amount, payment_method, date)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          id,
          userId,
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

          // Update product stock (only for this user's products)
          await env.DB.prepare(
            'UPDATE products SET stock = stock - ? WHERE id = ? AND user_id = ?'
          ).bind(item.quantity, item.id, userId).run();
        }

        const transaction = await env.DB.prepare(
          `SELECT t.*, c.name as customer_name, c.phone as customer_phone
           FROM transactions t
           LEFT JOIN customers c ON t.customer_id = c.id AND c.user_id = t.user_id
           WHERE t.id = ?`
        ).bind(id).first();

        return Response.json(transaction, { headers: corsHeaders });
      }

      // Settings API (per user)
      if (path === '/api/settings' && request.method === 'GET') {
        if (!userId) {
          return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
        }
        const settings = await env.DB.prepare(
          'SELECT * FROM store_settings WHERE user_id = ?'
        ).bind(userId).first();

        // Return default settings if none exist
        if (!settings) {
          return Response.json({
            store_name: '',
            store_address: '',
            store_phone: '',
            theme_tone: 'green',
            background_image: null,
            store_logo: null,
          }, { headers: corsHeaders });
        }

        return Response.json(settings, { headers: corsHeaders });
      }

      if (path === '/api/settings' && request.method === 'PUT') {
        if (!userId) {
          return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
        }
        const data = await request.json() as any;

        // Debug log
        console.log('PUT /api/settings received:', JSON.stringify({
          store_name: data.store_name,
          store_address: data.store_address,
          store_phone: data.store_phone,
          theme_tone: data.theme_tone,
          background_image: data.background_image ? 'Present' : 'None',
          store_logo: data.store_logo ? 'Present' : 'None',
        }));

        // Helper to convert undefined to null
        const toNull = (val: any) => val === undefined ? null : val;

        // Check if settings exist for this user
        const existing = await env.DB.prepare(
          'SELECT id FROM store_settings WHERE user_id = ?'
        ).bind(userId).first();

        if (existing) {
          // Build dynamic UPDATE query - only update fields that are provided
          const updateFields: string[] = [];
          const updateValues: any[] = [];

          if (data.store_name !== undefined) {
            updateFields.push('store_name = ?');
            updateValues.push(data.store_name);
          }
          if (data.store_address !== undefined) {
            updateFields.push('store_address = ?');
            updateValues.push(toNull(data.store_address));
          }
          if (data.store_phone !== undefined) {
            updateFields.push('store_phone = ?');
            updateValues.push(toNull(data.store_phone));
          }
          if (data.theme_tone !== undefined) {
            updateFields.push('theme_tone = ?');
            updateValues.push(data.theme_tone);
          }
          if (data.background_image !== undefined) {
            updateFields.push('background_image = ?');
            updateValues.push(toNull(data.background_image));
          }
          if (data.store_logo !== undefined) {
            updateFields.push('store_logo = ?');
            updateValues.push(toNull(data.store_logo));
          }

          if (updateFields.length === 0) {
            return Response.json({ error: 'No fields to update' }, { status: 400, headers: corsHeaders });
          }

          updateFields.push('updated_at = CURRENT_TIMESTAMP');
          updateValues.push(userId);

          console.log('UPDATE fields:', updateFields);
          console.log('UPDATE values count:', updateValues.length);

          await env.DB.prepare(
            `UPDATE store_settings SET ${updateFields.join(', ')} WHERE user_id = ?`
          ).bind(...updateValues).run();
        } else {
          // Insert new settings for this user
          await env.DB.prepare(
            `INSERT INTO store_settings (user_id, store_name, store_address, store_phone, theme_tone, background_image, store_logo)
             VALUES (?, ?, ?, ?, ?, ?, ?)`
          ).bind(
            userId,
            data.store_name || 'Toko Mudah',
            toNull(data.store_address),
            toNull(data.store_phone),
            data.theme_tone || 'green',
            toNull(data.background_image),
            toNull(data.store_logo)
          ).run();
        }

        const settings = await env.DB.prepare(
          'SELECT * FROM store_settings WHERE user_id = ?'
        ).bind(userId).first();

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
