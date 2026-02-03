import { hashPassword, verifyPassword, generateToken, extractToken, verifyToken, type UserRole } from './auth';

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

// Extended auth payload with role
type AuthPayload = {
  userId: string;
  username: string;
  email: string;
  role: UserRole;
};

// Middleware to verify JWT token
async function authenticateUser(request: Request): Promise<AuthPayload | null> {
  const authHeader = request.headers.get('Authorization');
  const token = extractToken(authHeader);

  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);
  return payload as AuthPayload | null;
}

// Helper function to verify authentication and return user ID
async function requireAuth(request: Request): Promise<string | null> {
  const authUser = await authenticateUser(request);
  return authUser ? authUser.userId : null;
}

// Helper function to require superadmin role
async function requireSuperAdmin(request: Request, env: Env): Promise<{ userId: string; username: string } | null> {
  const authUser = await authenticateUser(request);
  if (!authUser) {
    return null;
  }

  // Verify user is superadmin
  const user = await env.DB.prepare(
    'SELECT id, username, role FROM users WHERE id = ? AND role = ? AND is_active = 1'
  ).bind(authUser.userId, 'superadmin').first() as any;

  if (!user) {
    return null;
  }

  return { userId: user.id, username: user.username };
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
          'INSERT INTO users (id, username, email, password_hash, full_name, is_demo, role, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        ).bind(id, username, email, passwordHash, businessName || null, 0, 'user', 1, timestamp, timestamp).run();

        // Generate token
        const user = { id, username, email, full_name: businessName, is_demo: 0, role: 'user' as UserRole, is_active: 1 };
        const token = await generateToken(user);

        return Response.json(
          {
            user: { id, username, email, full_name: businessName, role: 'user' },
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

        // Check if user is active
        if (user.is_active === 0) {
          return Response.json(
            { error: 'Akun tidak aktif. Silakan hubungi administrator.' },
            { status: 403, headers: corsHeaders }
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
              role: user.role,
              is_active: user.is_active,
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
          'SELECT id, username, email, full_name, is_demo, role, is_active, created_at FROM users WHERE id = ?'
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

        const startDate = url.searchParams.get('startDate');
        const endDate = url.searchParams.get('endDate');

        // Build query for transactions
        let sql = `SELECT t.*, c.name as customer_name, c.phone as customer_phone
           FROM transactions t
           LEFT JOIN customers c ON t.customer_id = c.id
           WHERE t.user_id = ?`;
        
        const params: any[] = [userId];

        if (startDate) {
          sql += ` AND t.date >= ?`;
          params.push(startDate);
        }
        if (endDate) {
          sql += ` AND t.date <= ?`;
          params.push(endDate);
        }

        sql += ` ORDER BY t.date DESC`;

        // Fetch transactions
        const { results: transactionsRaw } = await env.DB.prepare(sql).bind(...params).all();

        if (transactionsRaw.length === 0) {
          return Response.json([], { headers: corsHeaders });
        }

        // Fetch all items for these transactions efficiently
        // We use a JOIN to filter items by the same criteria (user_id and date range)
        // to avoid passing massive list of IDs
        let itemsSql = `SELECT ti.* 
          FROM transaction_items ti
          JOIN transactions t ON ti.transaction_id = t.id
          WHERE t.user_id = ?`;
        
        const itemsParams: any[] = [userId];

        if (startDate) {
          itemsSql += ` AND t.date >= ?`;
          itemsParams.push(startDate);
        }
        if (endDate) {
          itemsSql += ` AND t.date <= ?`;
          itemsParams.push(endDate);
        }

        const { results: itemsRaw } = await env.DB.prepare(itemsSql).bind(...itemsParams).all();

        // Group items by transaction_id
        const itemsMap = new Map<string, any[]>();
        itemsRaw.forEach((item: any) => {
          if (!itemsMap.has(item.transaction_id)) {
            itemsMap.set(item.transaction_id, []);
          }
          itemsMap.get(item.transaction_id)?.push(item);
        });

        // Assemble result with proper structure
        const transactions = transactionsRaw.map((t: any) => {
          // Construct customer object if customer data exists
          let customer = undefined;
          if (t.customer_name) {
            customer = {
              id: t.customer_id,
              name: t.customer_name,
              phone: t.customer_phone
            };
          }

          // Clean up flat fields
          const { customer_name, customer_phone, ...txData } = t;

          return {
            ...txData,
            customer,
            items: itemsMap.get(t.id) || []
          };
        });

        return Response.json(transactions, { headers: corsHeaders });
      }

      if (path === '/api/transactions' && request.method === 'POST') {
        if (!userId) {
          return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
        }
        const data = await request.json() as any;
        const id = Date.now().toString();

        const batch = [];

        // 1. Insert Transaction
        batch.push(env.DB.prepare(
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
        ));

        // 2. Insert Items & Update Stock
        for (const item of data.items) {
          // Insert item
          batch.push(env.DB.prepare(
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
          ));

          // Update stock
          if (item.id) { // Only update stock if product exists in DB (has ID)
            batch.push(env.DB.prepare(
              'UPDATE products SET stock = stock - ? WHERE id = ? AND user_id = ?'
            ).bind(item.quantity, item.id, userId));
          }
        }

        // Execute batch
        await env.DB.batch(batch);

        // Fetch the created transaction to return
        // We need to construct the response manually or fetch it
        // Fetching is safer to get the exact DB state
        
        const transaction = await env.DB.prepare(
          `SELECT t.*, c.name as customer_name, c.phone as customer_phone
           FROM transactions t
           LEFT JOIN customers c ON t.customer_id = c.id
           WHERE t.id = ?`
        ).bind(id).first() as any;

        const { results: items } = await env.DB.prepare(
           'SELECT * FROM transaction_items WHERE transaction_id = ?'
        ).bind(id).all();

        // Format response
        let customer = undefined;
        if (transaction.customer_name) {
          customer = {
            id: transaction.customer_id,
            name: transaction.customer_name,
            phone: transaction.customer_phone
          };
        }
        const { customer_name, customer_phone, ...txData } = transaction;

        const result = {
          ...txData,
          customer,
          items
        };

        return Response.json(result, { headers: corsHeaders });
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
            data.store_name || 'Kasier',
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

      // ===== SUPERADMIN ENDPOINTS (requires superadmin role) =====

      // Get all users (superadmin only)
      if (path === '/api/admin/users' && request.method === 'GET') {
        const superAdmin = await requireSuperAdmin(request, env);
        if (!superAdmin) {
          return Response.json({ error: 'Forbidden - SuperAdmin access required' }, { status: 403, headers: corsHeaders });
        }

        const { results } = await env.DB.prepare(
          'SELECT id, username, email, full_name, is_demo, role, is_active, created_at, updated_at FROM users ORDER BY created_at DESC'
        ).all();

        return Response.json(results, { headers: corsHeaders });
      }

      // Get user by ID (superadmin only)
      if (path.startsWith('/api/admin/users/') && request.method === 'GET' && !path.includes('/toggle-active')) {
        const superAdmin = await requireSuperAdmin(request, env);
        if (!superAdmin) {
          return Response.json({ error: 'Forbidden - SuperAdmin access required' }, { status: 403, headers: corsHeaders });
        }

        const userId = path.split('/').pop();
        const user = await env.DB.prepare(
          'SELECT id, username, email, full_name, is_demo, role, is_active, created_at, updated_at FROM users WHERE id = ?'
        ).bind(userId).first();

        if (!user) {
          return Response.json({ error: 'User not found' }, { status: 404, headers: corsHeaders });
        }

        return Response.json(user, { headers: corsHeaders });
      }

      // Create user (superadmin only)
      if (path === '/api/admin/users' && request.method === 'POST') {
        const superAdmin = await requireSuperAdmin(request, env);
        if (!superAdmin) {
          return Response.json({ error: 'Forbidden - SuperAdmin access required' }, { status: 403, headers: corsHeaders });
        }

        const data = await request.json() as any;
        const { username, email, password, full_name, role = 'user' } = data;

        // Validate input
        if (!username || !email || !password) {
          return Response.json(
            { error: 'Username, email, and password are required' },
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

        // Check if username already exists
        const existingUsername = await env.DB.prepare(
          'SELECT id FROM users WHERE username = ?'
        ).bind(username).first();

        if (existingUsername) {
          return Response.json(
            { error: 'Username already exists' },
            { status: 409, headers: corsHeaders }
          );
        }

        // Hash password and create user
        const passwordHash = await hashPassword(password);
        const id = crypto.randomUUID();
        const timestamp = new Date().toISOString();

        await env.DB.prepare(
          'INSERT INTO users (id, username, email, password_hash, full_name, is_demo, role, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        ).bind(id, username, email, passwordHash, full_name || null, 0, role, 1, timestamp, timestamp).run();

        const newUser = await env.DB.prepare(
          'SELECT id, username, email, full_name, is_demo, role, is_active, created_at, updated_at FROM users WHERE id = ?'
        ).bind(id).first();

        return Response.json(newUser, { status: 201, headers: corsHeaders });
      }

      // Update user (superadmin only)
      if (path.startsWith('/api/admin/users/') && request.method === 'PUT' && !path.includes('/toggle-active')) {
        const superAdmin = await requireSuperAdmin(request, env);
        if (!superAdmin) {
          return Response.json({ error: 'Forbidden - SuperAdmin access required' }, { status: 403, headers: corsHeaders });
        }

        const userId = path.split('/').pop();
        const data = await request.json() as any;

        // Check if user exists
        const existingUser = await env.DB.prepare(
          'SELECT id FROM users WHERE id = ?'
        ).bind(userId).first();

        if (!existingUser) {
          return Response.json({ error: 'User not found' }, { status: 404, headers: corsHeaders });
        }

        // Build update query
        const updateFields: string[] = [];
        const updateValues: any[] = [];

        if (data.username !== undefined) {
          // Check if new username is already taken
          const usernameExists = await env.DB.prepare(
            'SELECT id FROM users WHERE username = ? AND id != ?'
          ).bind(data.username, userId).first();

          if (usernameExists) {
            return Response.json({ error: 'Username already exists' }, { status: 409, headers: corsHeaders });
          }

          updateFields.push('username = ?');
          updateValues.push(data.username);
        }

        if (data.email !== undefined) {
          // Check if new email is already taken
          const emailExists = await env.DB.prepare(
            'SELECT id FROM users WHERE email = ? AND id != ?'
          ).bind(data.email, userId).first();

          if (emailExists) {
            return Response.json({ error: 'Email already exists' }, { status: 409, headers: corsHeaders });
          }

          updateFields.push('email = ?');
          updateValues.push(data.email);
        }

        if (data.full_name !== undefined) {
          updateFields.push('full_name = ?');
          updateValues.push(data.full_name || null);
        }

        if (data.role !== undefined) {
          updateFields.push('role = ?');
          updateValues.push(data.role);
        }

        if (data.is_active !== undefined) {
          updateFields.push('is_active = ?');
          updateValues.push(data.is_active ? 1 : 0);
        }

        if (data.password !== undefined) {
          const passwordHash = await hashPassword(data.password);
          updateFields.push('password_hash = ?');
          updateValues.push(passwordHash);
        }

        if (updateFields.length === 0) {
          return Response.json({ error: 'No fields to update' }, { status: 400, headers: corsHeaders });
        }

        updateFields.push('updated_at = CURRENT_TIMESTAMP');
        updateValues.push(userId);

        await env.DB.prepare(
          `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`
        ).bind(...updateValues).run();

        const updatedUser = await env.DB.prepare(
          'SELECT id, username, email, full_name, is_demo, role, is_active, created_at, updated_at FROM users WHERE id = ?'
        ).bind(userId).first();

        return Response.json(updatedUser, { headers: corsHeaders });
      }

      // Toggle user active status (superadmin only)
      if (path.startsWith('/api/admin/users/') && path.endsWith('/toggle-active') && request.method === 'PUT') {
        const superAdmin = await requireSuperAdmin(request, env);
        if (!superAdmin) {
          return Response.json({ error: 'Forbidden - SuperAdmin access required' }, { status: 403, headers: corsHeaders });
        }

        const userId = path.split('/')[4]; // /api/admin/users/{id}/toggle-active
        const data = await request.json() as any;

        // Check if user exists
        const existingUser = await env.DB.prepare(
          'SELECT id FROM users WHERE id = ?'
        ).bind(userId).first();

        if (!existingUser) {
          return Response.json({ error: 'User not found' }, { status: 404, headers: corsHeaders });
        }

        // Prevent deactivating the last superadmin
        if (data.is_active === false) {
          const superAdminCount = await env.DB.prepare(
            'SELECT COUNT(*) as count FROM users WHERE role = ? AND is_active = 1'
          ).bind('superadmin').first() as any;

          const targetUser = await env.DB.prepare(
            'SELECT role FROM users WHERE id = ?'
          ).bind(userId).first() as any;

          if (targetUser.role === 'superadmin' && superAdminCount.count <= 1) {
            return Response.json(
              { error: 'Cannot deactivate the last superadmin' },
              { status: 400, headers: corsHeaders }
            );
          }
        }

        await env.DB.prepare(
          'UPDATE users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
        ).bind(data.is_active ? 1 : 0, userId).run();

        const updatedUser = await env.DB.prepare(
          'SELECT id, username, email, full_name, is_demo, role, is_active, created_at, updated_at FROM users WHERE id = ?'
        ).bind(userId).first();

        return Response.json(updatedUser, { headers: corsHeaders });
      }

      // Delete user (superadmin only)
      if (path.startsWith('/api/admin/users/') && request.method === 'DELETE') {
        const superAdmin = await requireSuperAdmin(request, env);
        if (!superAdmin) {
          return Response.json({ error: 'Forbidden - SuperAdmin access required' }, { status: 403, headers: corsHeaders });
        }

        const userId = path.split('/').pop();

        // Check if user exists
        const existingUser = await env.DB.prepare(
          'SELECT role FROM users WHERE id = ?'
        ).bind(userId).first() as any;

        if (!existingUser) {
          return Response.json({ error: 'User not found' }, { status: 404, headers: corsHeaders });
        }

        // Prevent deleting the last superadmin
        if (existingUser.role === 'superadmin') {
          const superAdminCount = await env.DB.prepare(
            'SELECT COUNT(*) as count FROM users WHERE role = ?'
          ).bind('superadmin').first() as any;

          if (superAdminCount.count <= 1) {
            return Response.json(
              { error: 'Cannot delete the last superadmin' },
              { status: 400, headers: corsHeaders }
            );
          }
        }

        // Prevent self-deletion
        if (userId === superAdmin.userId) {
          return Response.json(
            { error: 'Cannot delete your own account' },
            { status: 400, headers: corsHeaders }
          );
        }

        await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(userId).run();

        return Response.json({ success: true }, { headers: corsHeaders });
      }

      // Get admin statistics (superadmin only)
      if (path === '/api/admin/stats' && request.method === 'GET') {
        const superAdmin = await requireSuperAdmin(request, env);
        if (!superAdmin) {
          return Response.json({ error: 'Forbidden - SuperAdmin access required' }, { status: 403, headers: corsHeaders });
        }

        // Get total users
        const totalUsersResult = await env.DB.prepare(
          'SELECT COUNT(*) as count FROM users'
        ).first() as any;

        // Get active users
        const activeUsersResult = await env.DB.prepare(
          'SELECT COUNT(*) as count FROM users WHERE is_active = 1'
        ).first() as any;

        // Get inactive users
        const inactiveUsersResult = await env.DB.prepare(
          'SELECT COUNT(*) as count FROM users WHERE is_active = 0'
        ).first() as any;

        // Get new users today
        const today = new Date().toISOString().split('T')[0];
        const newUsersTodayResult = await env.DB.prepare(
          "SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = ?"
        ).bind(today).first() as any;

        // Get new users this week
        const newUsersThisWeekResult = await env.DB.prepare(
          "SELECT COUNT(*) as count FROM users WHERE created_at >= datetime('now', '-7 days')"
        ).first() as any;

        // Get new users this month
        const newUsersThisMonthResult = await env.DB.prepare(
          "SELECT COUNT(*) as count FROM users WHERE created_at >= datetime('now', '-30 days')"
        ).first() as any;

        return Response.json({
          totalUsers: totalUsersResult.count,
          activeUsers: activeUsersResult.count,
          inactiveUsers: inactiveUsersResult.count,
          newUsersToday: newUsersTodayResult.count,
          newUsersThisWeek: newUsersThisWeekResult.count,
          newUsersThisMonth: newUsersThisMonthResult.count,
        }, { headers: corsHeaders });
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
