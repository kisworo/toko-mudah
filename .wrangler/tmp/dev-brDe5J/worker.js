var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-9Huflw/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// node_modules/@tsndr/cloudflare-worker-jwt/index.js
function bytesToByteString(bytes) {
  let byteStr = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    byteStr += String.fromCharCode(bytes[i]);
  }
  return byteStr;
}
__name(bytesToByteString, "bytesToByteString");
function byteStringToBytes(byteStr) {
  let bytes = new Uint8Array(byteStr.length);
  for (let i = 0; i < byteStr.length; i++) {
    bytes[i] = byteStr.charCodeAt(i);
  }
  return bytes;
}
__name(byteStringToBytes, "byteStringToBytes");
function arrayBufferToBase64String(arrayBuffer) {
  return btoa(bytesToByteString(new Uint8Array(arrayBuffer)));
}
__name(arrayBufferToBase64String, "arrayBufferToBase64String");
function base64StringToUint8Array(b64str) {
  return byteStringToBytes(atob(b64str));
}
__name(base64StringToUint8Array, "base64StringToUint8Array");
function textToUint8Array(str) {
  return byteStringToBytes(str);
}
__name(textToUint8Array, "textToUint8Array");
function arrayBufferToBase64Url(arrayBuffer) {
  return arrayBufferToBase64String(arrayBuffer).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
__name(arrayBufferToBase64Url, "arrayBufferToBase64Url");
function base64UrlToUint8Array(b64url) {
  return base64StringToUint8Array(b64url.replace(/-/g, "+").replace(/_/g, "/").replace(/\s/g, ""));
}
__name(base64UrlToUint8Array, "base64UrlToUint8Array");
function textToBase64Url(str) {
  const encoder = new TextEncoder();
  const charCodes = encoder.encode(str);
  const binaryStr = String.fromCharCode(...charCodes);
  return btoa(binaryStr).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
__name(textToBase64Url, "textToBase64Url");
function pemToBinary(pem) {
  return base64StringToUint8Array(pem.replace(/-+(BEGIN|END).*/g, "").replace(/\s/g, ""));
}
__name(pemToBinary, "pemToBinary");
async function importTextSecret(key, algorithm, keyUsages) {
  return await crypto.subtle.importKey("raw", textToUint8Array(key), algorithm, true, keyUsages);
}
__name(importTextSecret, "importTextSecret");
async function importJwk(key, algorithm, keyUsages) {
  return await crypto.subtle.importKey("jwk", key, algorithm, true, keyUsages);
}
__name(importJwk, "importJwk");
async function importPublicKey(key, algorithm, keyUsages) {
  return await crypto.subtle.importKey("spki", pemToBinary(key), algorithm, true, keyUsages);
}
__name(importPublicKey, "importPublicKey");
async function importPrivateKey(key, algorithm, keyUsages) {
  return await crypto.subtle.importKey("pkcs8", pemToBinary(key), algorithm, true, keyUsages);
}
__name(importPrivateKey, "importPrivateKey");
async function importKey(key, algorithm, keyUsages) {
  if (typeof key === "object")
    return importJwk(key, algorithm, keyUsages);
  if (typeof key !== "string")
    throw new Error("Unsupported key type!");
  if (key.includes("PUBLIC"))
    return importPublicKey(key, algorithm, keyUsages);
  if (key.includes("PRIVATE"))
    return importPrivateKey(key, algorithm, keyUsages);
  return importTextSecret(key, algorithm, keyUsages);
}
__name(importKey, "importKey");
function decodePayload(raw) {
  const bytes = Array.from(atob(raw), (char) => char.charCodeAt(0));
  const decodedString = new TextDecoder("utf-8").decode(new Uint8Array(bytes));
  return JSON.parse(decodedString);
}
__name(decodePayload, "decodePayload");
if (typeof crypto === "undefined" || !crypto.subtle)
  throw new Error("SubtleCrypto not supported!");
var algorithms = {
  none: { name: "none" },
  ES256: { name: "ECDSA", namedCurve: "P-256", hash: { name: "SHA-256" } },
  ES384: { name: "ECDSA", namedCurve: "P-384", hash: { name: "SHA-384" } },
  ES512: { name: "ECDSA", namedCurve: "P-521", hash: { name: "SHA-512" } },
  HS256: { name: "HMAC", hash: { name: "SHA-256" } },
  HS384: { name: "HMAC", hash: { name: "SHA-384" } },
  HS512: { name: "HMAC", hash: { name: "SHA-512" } },
  RS256: { name: "RSASSA-PKCS1-v1_5", hash: { name: "SHA-256" } },
  RS384: { name: "RSASSA-PKCS1-v1_5", hash: { name: "SHA-384" } },
  RS512: { name: "RSASSA-PKCS1-v1_5", hash: { name: "SHA-512" } }
};
async function sign(payload, secret, options = "HS256") {
  if (typeof options === "string")
    options = { algorithm: options };
  options = { algorithm: "HS256", header: { typ: "JWT", ...options.header ?? {} }, ...options };
  if (!payload || typeof payload !== "object")
    throw new Error("payload must be an object");
  if (options.algorithm !== "none" && (!secret || typeof secret !== "string" && typeof secret !== "object"))
    throw new Error("secret must be a string, a JWK object or a CryptoKey object");
  if (typeof options.algorithm !== "string")
    throw new Error("options.algorithm must be a string");
  const algorithm = algorithms[options.algorithm];
  if (!algorithm)
    throw new Error("algorithm not found");
  if (!payload.iat)
    payload.iat = Math.floor(Date.now() / 1e3);
  const partialToken = `${textToBase64Url(JSON.stringify({ ...options.header, alg: options.algorithm }))}.${textToBase64Url(JSON.stringify(payload))}`;
  if (options.algorithm === "none")
    return partialToken;
  const key = secret instanceof CryptoKey ? secret : await importKey(secret, algorithm, ["sign"]);
  const signature = await crypto.subtle.sign(algorithm, key, textToUint8Array(partialToken));
  return `${partialToken}.${arrayBufferToBase64Url(signature)}`;
}
__name(sign, "sign");
async function verify(token, secret, options = "HS256") {
  if (typeof options === "string")
    options = { algorithm: options };
  options = { algorithm: "HS256", clockTolerance: 0, throwError: false, ...options };
  if (typeof token !== "string")
    throw new Error("token must be a string");
  if (options.algorithm !== "none" && typeof secret !== "string" && typeof secret !== "object")
    throw new Error("secret must be a string, a JWK object or a CryptoKey object");
  if (typeof options.algorithm !== "string")
    throw new Error("options.algorithm must be a string");
  const tokenParts = token.split(".", 3);
  if (tokenParts.length < 2)
    throw new Error("token must consist of 2 or more parts");
  const [tokenHeader, tokenPayload, tokenSignature] = tokenParts;
  const algorithm = algorithms[options.algorithm];
  if (!algorithm)
    throw new Error("algorithm not found");
  const decodedToken = decode(token);
  try {
    if (decodedToken.header?.alg !== options.algorithm)
      throw new Error("INVALID_SIGNATURE");
    if (decodedToken.payload) {
      const now = Math.floor(Date.now() / 1e3);
      if (decodedToken.payload.nbf && decodedToken.payload.nbf > now && decodedToken.payload.nbf - now > (options.clockTolerance ?? 0))
        throw new Error("NOT_YET_VALID");
      if (decodedToken.payload.exp && decodedToken.payload.exp <= now && now - decodedToken.payload.exp > (options.clockTolerance ?? 0))
        throw new Error("EXPIRED");
    }
    if (algorithm.name === "none")
      return decodedToken;
    const key = secret instanceof CryptoKey ? secret : await importKey(secret, algorithm, ["verify"]);
    if (!await crypto.subtle.verify(algorithm, key, base64UrlToUint8Array(tokenSignature), textToUint8Array(`${tokenHeader}.${tokenPayload}`)))
      throw new Error("INVALID_SIGNATURE");
    return decodedToken;
  } catch (err) {
    if (options.throwError)
      throw err;
    return;
  }
}
__name(verify, "verify");
function decode(token) {
  return {
    header: decodePayload(token.split(".")[0].replace(/-/g, "+").replace(/_/g, "/")),
    payload: decodePayload(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
  };
}
__name(decode, "decode");

// src/auth.ts
var JWT_SECRET = "toko-mudah-secret-key-change-in-production";
var JWT_EXPIRY_DAYS = 7;
var PBKDF2_ITERATIONS = 1e5;
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}
__name(arrayBufferToBase64, "arrayBufferToBase64");
function base64ToUint8Array(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
__name(base64ToUint8Array, "base64ToUint8Array");
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltBase64 = arrayBufferToBase64(salt);
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    data,
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256"
    },
    keyMaterial,
    256
  );
  const hashBase64 = arrayBufferToBase64(derivedBits);
  return `${saltBase64}:${hashBase64}`;
}
__name(hashPassword, "hashPassword");
async function verifyPassword(password, storedHash) {
  try {
    const parts = storedHash.split(":");
    if (parts.length !== 2) {
      return false;
    }
    const [saltBase64, storedHashBase64] = parts;
    const salt = base64ToUint8Array(saltBase64);
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      data,
      { name: "PBKDF2" },
      false,
      ["deriveBits"]
    );
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt,
        iterations: PBKDF2_ITERATIONS,
        hash: "SHA-256"
      },
      keyMaterial,
      256
    );
    const computedHashBase64 = arrayBufferToBase64(derivedBits);
    return computedHashBase64 === storedHashBase64;
  } catch {
    return false;
  }
}
__name(verifyPassword, "verifyPassword");
async function generateToken(user) {
  const now = Math.floor(Date.now() / 1e3);
  const exp = now + JWT_EXPIRY_DAYS * 24 * 60 * 60;
  const payload = {
    userId: user.id,
    username: user.username,
    email: user.email,
    iat: now,
    exp
  };
  return await sign(payload, JWT_SECRET, { algorithm: "HS256" });
}
__name(generateToken, "generateToken");
async function verifyToken(token) {
  try {
    const result = await verify(token, JWT_SECRET, { algorithm: "HS256" });
    if (!result) {
      return null;
    }
    return {
      userId: result.payload.sub || result.payload.userId || "",
      username: result.payload.username || "",
      email: result.payload.email || ""
    };
  } catch {
    return null;
  }
}
__name(verifyToken, "verifyToken");
function extractToken(authHeader) {
  if (!authHeader) {
    return null;
  }
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }
  return parts[1];
}
__name(extractToken, "extractToken");

// src/worker.ts
var corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Cache-Control": "no-store, no-cache, must-revalidate, private"
};
async function authenticateUser(request) {
  const authHeader = request.headers.get("Authorization");
  const token = extractToken(authHeader);
  if (!token) {
    return null;
  }
  const payload = await verifyToken(token);
  return payload ? { userId: payload.userId, username: payload.username } : null;
}
__name(authenticateUser, "authenticateUser");
async function requireAuth(request) {
  const authUser = await authenticateUser(request);
  return authUser ? authUser.userId : null;
}
__name(requireAuth, "requireAuth");
var worker_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    try {
      if (path === "/api/auth/register" && request.method === "POST") {
        const data = await request.json();
        const { email, password, businessName } = data;
        if (!email || !password) {
          return Response.json(
            { error: "Email and password are required" },
            { status: 400, headers: corsHeaders }
          );
        }
        const existingUser = await env.DB.prepare(
          "SELECT id FROM users WHERE email = ?"
        ).bind(email).first();
        if (existingUser) {
          return Response.json(
            { error: "Email already exists" },
            { status: 409, headers: corsHeaders }
          );
        }
        const passwordHash = await hashPassword(password);
        const id = crypto.randomUUID();
        const username = email.split("@")[0];
        const timestamp = (/* @__PURE__ */ new Date()).toISOString();
        await env.DB.prepare(
          "INSERT INTO users (id, username, email, password_hash, full_name, is_demo, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        ).bind(id, username, email, passwordHash, businessName || null, 0, timestamp, timestamp).run();
        const user = { id, username, email, full_name: businessName, is_demo: 0 };
        const token = await generateToken(user);
        return Response.json(
          {
            user: { id, username, email, full_name: businessName },
            token
          },
          { headers: corsHeaders }
        );
      }
      if (path === "/api/auth/login" && request.method === "POST") {
        const data = await request.json();
        const { email, password } = data;
        if (!email || !password) {
          return Response.json(
            { error: "Email and password are required" },
            { status: 400, headers: corsHeaders }
          );
        }
        const user = await env.DB.prepare(
          "SELECT * FROM users WHERE email = ?"
        ).bind(email).first();
        if (!user) {
          return Response.json(
            { error: "Invalid email or password" },
            { status: 401, headers: corsHeaders }
          );
        }
        const isValid = await verifyPassword(password, user.password_hash);
        if (!isValid) {
          return Response.json(
            { error: "Invalid email or password" },
            { status: 401, headers: corsHeaders }
          );
        }
        const token = await generateToken(user);
        return Response.json(
          {
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              full_name: user.full_name,
              is_demo: user.is_demo
            },
            token
          },
          { headers: corsHeaders }
        );
      }
      if (path === "/api/auth/me" && request.method === "GET") {
        const authUser = await authenticateUser(request);
        if (!authUser) {
          return Response.json(
            { error: "Unauthorized" },
            { status: 401, headers: corsHeaders }
          );
        }
        const user = await env.DB.prepare(
          "SELECT id, username, email, full_name, is_demo, created_at FROM users WHERE id = ?"
        ).bind(authUser.userId).first();
        if (!user) {
          return Response.json(
            { error: "User not found" },
            { status: 404, headers: corsHeaders }
          );
        }
        return Response.json(user, { headers: corsHeaders });
      }
      const userId = await requireAuth(request);
      if (path === "/api/categories" && request.method === "GET") {
        if (!userId) {
          return Response.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
        }
        const { results } = await env.DB.prepare(
          "SELECT * FROM categories WHERE user_id = ? ORDER BY name"
        ).bind(userId).all();
        return Response.json(results, { headers: corsHeaders });
      }
      if (path === "/api/categories" && request.method === "POST") {
        if (!userId) {
          return Response.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
        }
        const data = await request.json();
        const id = Date.now().toString();
        await env.DB.prepare(
          "INSERT INTO categories (id, user_id, name, color) VALUES (?, ?, ?, ?)"
        ).bind(id, userId, data.name, data.color || null).run();
        return Response.json({ id, ...data }, { headers: corsHeaders });
      }
      if (path.startsWith("/api/categories/") && request.method === "PUT") {
        if (!userId) {
          return Response.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
        }
        const id = path.split("/").pop();
        const data = await request.json();
        await env.DB.prepare(
          "UPDATE categories SET name = ?, color = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?"
        ).bind(data.name, data.color || null, id, userId).run();
        return Response.json({ id, ...data }, { headers: corsHeaders });
      }
      if (path.startsWith("/api/categories/") && request.method === "DELETE") {
        if (!userId) {
          return Response.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
        }
        const id = path.split("/").pop();
        await env.DB.prepare("DELETE FROM categories WHERE id = ? AND user_id = ?").bind(id, userId).run();
        return Response.json({ success: true }, { headers: corsHeaders });
      }
      if (path === "/api/products" && request.method === "GET") {
        if (!userId) {
          return Response.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
        }
        const { results } = await env.DB.prepare(
          "SELECT * FROM products WHERE user_id = ? ORDER BY name"
        ).bind(userId).all();
        return Response.json(results, { headers: corsHeaders });
      }
      if (path === "/api/products" && request.method === "POST") {
        if (!userId) {
          return Response.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
        }
        const data = await request.json();
        const id = Date.now().toString();
        await env.DB.prepare(
          "INSERT INTO products (id, user_id, name, price, stock, category, image, discount_type, discount_value) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
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
      if (path.startsWith("/api/products/") && request.method === "PUT") {
        if (!userId) {
          return Response.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
        }
        const id = path.split("/").pop();
        const data = await request.json();
        await env.DB.prepare(
          "UPDATE products SET name = ?, price = ?, stock = ?, category = ?, image = ?, discount_type = ?, discount_value = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?"
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
      if (path.startsWith("/api/products/") && request.method === "DELETE") {
        if (!userId) {
          return Response.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
        }
        const id = path.split("/").pop();
        await env.DB.prepare("DELETE FROM products WHERE id = ? AND user_id = ?").bind(id, userId).run();
        return Response.json({ success: true }, { headers: corsHeaders });
      }
      if (path === "/api/customers" && request.method === "GET") {
        if (!userId) {
          return Response.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
        }
        const query = url.searchParams.get("q") || "";
        let sql = "SELECT * FROM customers WHERE user_id = ?";
        const params = [userId];
        if (query) {
          sql += " AND (name LIKE ? OR phone LIKE ?)";
          params.push(`%${query}%`, `%${query}%`);
        }
        sql += " ORDER BY name";
        const stmt = env.DB.prepare(sql);
        const { results } = await stmt.bind(...params).all();
        return Response.json(results, { headers: corsHeaders });
      }
      if (path === "/api/customers" && request.method === "POST") {
        if (!userId) {
          return Response.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
        }
        const data = await request.json();
        const id = Date.now().toString();
        await env.DB.prepare(
          "INSERT INTO customers (id, user_id, name, phone) VALUES (?, ?, ?, ?)"
        ).bind(id, userId, data.name, data.phone || null).run();
        return Response.json({ id, ...data }, { headers: corsHeaders });
      }
      if (path === "/api/transactions" && request.method === "GET") {
        if (!userId) {
          return Response.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
        }
        const startDate = url.searchParams.get("startDate");
        const endDate = url.searchParams.get("endDate");
        let sql = `SELECT t.*, c.name as customer_name, c.phone as customer_phone
           FROM transactions t
           LEFT JOIN customers c ON t.customer_id = c.id
           WHERE t.user_id = ?`;
        const params = [userId];
        if (startDate) {
          sql += ` AND t.date >= ?`;
          params.push(startDate);
        }
        if (endDate) {
          sql += ` AND t.date <= ?`;
          params.push(endDate);
        }
        sql += ` ORDER BY t.date DESC`;
        const { results: transactionsRaw } = await env.DB.prepare(sql).bind(...params).all();
        if (transactionsRaw.length === 0) {
          return Response.json([], { headers: corsHeaders });
        }
        let itemsSql = `SELECT ti.* 
          FROM transaction_items ti
          JOIN transactions t ON ti.transaction_id = t.id
          WHERE t.user_id = ?`;
        const itemsParams = [userId];
        if (startDate) {
          itemsSql += ` AND t.date >= ?`;
          itemsParams.push(startDate);
        }
        if (endDate) {
          itemsSql += ` AND t.date <= ?`;
          itemsParams.push(endDate);
        }
        const { results: itemsRaw } = await env.DB.prepare(itemsSql).bind(...itemsParams).all();
        const itemsMap = /* @__PURE__ */ new Map();
        itemsRaw.forEach((item) => {
          if (!itemsMap.has(item.transaction_id)) {
            itemsMap.set(item.transaction_id, []);
          }
          itemsMap.get(item.transaction_id)?.push(item);
        });
        const transactions = transactionsRaw.map((t) => {
          let customer = void 0;
          if (t.customer_name) {
            customer = {
              id: t.customer_id,
              name: t.customer_name,
              phone: t.customer_phone
            };
          }
          const { customer_name, customer_phone, ...txData } = t;
          return {
            ...txData,
            customer,
            items: itemsMap.get(t.id) || []
          };
        });
        return Response.json(transactions, { headers: corsHeaders });
      }
      if (path === "/api/transactions" && request.method === "POST") {
        if (!userId) {
          return Response.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
        }
        const data = await request.json();
        const id = Date.now().toString();
        const batch = [];
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
        for (const item of data.items) {
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
          if (item.id) {
            batch.push(env.DB.prepare(
              "UPDATE products SET stock = stock - ? WHERE id = ? AND user_id = ?"
            ).bind(item.quantity, item.id, userId));
          }
        }
        await env.DB.batch(batch);
        const transaction = await env.DB.prepare(
          `SELECT t.*, c.name as customer_name, c.phone as customer_phone
           FROM transactions t
           LEFT JOIN customers c ON t.customer_id = c.id
           WHERE t.id = ?`
        ).bind(id).first();
        const { results: items } = await env.DB.prepare(
          "SELECT * FROM transaction_items WHERE transaction_id = ?"
        ).bind(id).all();
        let customer = void 0;
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
      if (path === "/api/settings" && request.method === "GET") {
        if (!userId) {
          return Response.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
        }
        const settings = await env.DB.prepare(
          "SELECT * FROM store_settings WHERE user_id = ?"
        ).bind(userId).first();
        if (!settings) {
          return Response.json({
            store_name: "",
            store_address: "",
            store_phone: "",
            theme_tone: "green",
            background_image: null,
            store_logo: null
          }, { headers: corsHeaders });
        }
        return Response.json(settings, { headers: corsHeaders });
      }
      if (path === "/api/settings" && request.method === "PUT") {
        if (!userId) {
          return Response.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
        }
        const data = await request.json();
        console.log("PUT /api/settings received:", JSON.stringify({
          store_name: data.store_name,
          store_address: data.store_address,
          store_phone: data.store_phone,
          theme_tone: data.theme_tone,
          background_image: data.background_image ? "Present" : "None",
          store_logo: data.store_logo ? "Present" : "None"
        }));
        const toNull = /* @__PURE__ */ __name((val) => val === void 0 ? null : val, "toNull");
        const existing = await env.DB.prepare(
          "SELECT id FROM store_settings WHERE user_id = ?"
        ).bind(userId).first();
        if (existing) {
          const updateFields = [];
          const updateValues = [];
          if (data.store_name !== void 0) {
            updateFields.push("store_name = ?");
            updateValues.push(data.store_name);
          }
          if (data.store_address !== void 0) {
            updateFields.push("store_address = ?");
            updateValues.push(toNull(data.store_address));
          }
          if (data.store_phone !== void 0) {
            updateFields.push("store_phone = ?");
            updateValues.push(toNull(data.store_phone));
          }
          if (data.theme_tone !== void 0) {
            updateFields.push("theme_tone = ?");
            updateValues.push(data.theme_tone);
          }
          if (data.background_image !== void 0) {
            updateFields.push("background_image = ?");
            updateValues.push(toNull(data.background_image));
          }
          if (data.store_logo !== void 0) {
            updateFields.push("store_logo = ?");
            updateValues.push(toNull(data.store_logo));
          }
          if (updateFields.length === 0) {
            return Response.json({ error: "No fields to update" }, { status: 400, headers: corsHeaders });
          }
          updateFields.push("updated_at = CURRENT_TIMESTAMP");
          updateValues.push(userId);
          console.log("UPDATE fields:", updateFields);
          console.log("UPDATE values count:", updateValues.length);
          await env.DB.prepare(
            `UPDATE store_settings SET ${updateFields.join(", ")} WHERE user_id = ?`
          ).bind(...updateValues).run();
        } else {
          await env.DB.prepare(
            `INSERT INTO store_settings (user_id, store_name, store_address, store_phone, theme_tone, background_image, store_logo)
             VALUES (?, ?, ?, ?, ?, ?, ?)`
          ).bind(
            userId,
            data.store_name || "Kasier",
            toNull(data.store_address),
            toNull(data.store_phone),
            data.theme_tone || "green",
            toNull(data.background_image),
            toNull(data.store_logo)
          ).run();
        }
        const settings = await env.DB.prepare(
          "SELECT * FROM store_settings WHERE user_id = ?"
        ).bind(userId).first();
        return Response.json(settings, { headers: corsHeaders });
      }
      try {
        if (path === "/" || !path.includes(".")) {
          const asset2 = await env.ASSETS.fetch(new Request(new URL("/index.html", url)));
          return asset2;
        }
        const asset = await env.ASSETS.fetch(request);
        return asset;
      } catch {
        return new Response("Not found", { status: 404 });
      }
    } catch (error) {
      return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-9Huflw/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-9Huflw/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=worker.js.map
