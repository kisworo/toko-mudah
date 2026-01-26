var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-lO2S8A/checked-fetch.js
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

// node_modules/itty-router/index.mjs
var t = /* @__PURE__ */ __name(({ base: e = "", routes: t2 = [], ...r2 } = {}) => ({ __proto__: new Proxy({}, { get: /* @__PURE__ */ __name((r3, o2, a, s) => (r4, ...c) => t2.push([o2.toUpperCase?.(), RegExp(`^${(s = (e + r4).replace(/\/+(\/|$)/g, "$1")).replace(/(\/?\.?):(\w+)\+/g, "($1(?<$2>*))").replace(/(\/?\.?):(\w+)/g, "($1(?<$2>[^$1/]+?))").replace(/\./g, "\\.").replace(/(\/?)\*/g, "($1.*)?")}/*$`), c, s]) && a, "get") }), routes: t2, ...r2, async fetch(e2, ...o2) {
  let a, s, c = new URL(e2.url), n = e2.query = { __proto__: null };
  for (let [e3, t3] of c.searchParams) n[e3] = n[e3] ? [].concat(n[e3], t3) : t3;
  e: try {
    for (let t3 of r2.before || []) if (null != (a = await t3(e2.proxy ?? e2, ...o2))) break e;
    t: for (let [r3, n2, l, i] of t2) if ((r3 == e2.method || "ALL" == r3) && (s = c.pathname.match(n2))) {
      e2.params = s.groups || {}, e2.route = i;
      for (let t3 of l) if (null != (a = await t3(e2.proxy ?? e2, ...o2))) break t;
    }
  } catch (t3) {
    if (!r2.catch) throw t3;
    a = await r2.catch(t3, e2.proxy ?? e2, ...o2);
  }
  try {
    for (let t3 of r2.finally || []) a = await t3(a, e2.proxy ?? e2, ...o2) ?? a;
  } catch (t3) {
    if (!r2.catch) throw t3;
    a = await r2.catch(t3, e2.proxy ?? e2, ...o2);
  }
  return a;
} }), "t");
var r = /* @__PURE__ */ __name((e = "text/plain; charset=utf-8", t2) => (r2, o2 = {}) => {
  if (void 0 === r2 || r2 instanceof Response) return r2;
  const a = new Response(t2?.(r2) ?? r2, o2.url ? void 0 : o2);
  return a.headers.set("content-type", e), a;
}, "r");
var o = r("application/json; charset=utf-8", JSON.stringify);
var p = r("text/plain; charset=utf-8", String);
var f = r("text/html");
var u = r("image/jpeg");
var h = r("image/png");
var g = r("image/webp");

// src/worker.ts
var router = t();
var corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};
router.options("*", () => new Response(null, { headers: corsHeaders }));
router.get("/api/categories", async (request, env) => {
  try {
    const { results } = await env.DB.prepare(
      "SELECT * FROM categories ORDER BY name"
    ).all();
    return Response.json(results, { headers: corsHeaders });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});
router.post("/api/categories", async (request, env) => {
  try {
    const data = await request.json();
    const id = Date.now().toString();
    await env.DB.prepare(
      "INSERT INTO categories (id, name, color) VALUES (?, ?, ?)"
    ).bind(id, data.name, data.color || null).run();
    return Response.json({ id, ...data }, { headers: corsHeaders });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});
router.put("/api/categories/:id", async (request, env, ctx) => {
  try {
    const { id } = ctx.params;
    const data = await request.json();
    await env.DB.prepare(
      "UPDATE categories SET name = ?, color = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).bind(data.name, data.color || null, id).run();
    return Response.json({ id, ...data }, { headers: corsHeaders });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});
router.delete("/api/categories/:id", async (request, env, ctx) => {
  try {
    const { id } = ctx.params;
    await env.DB.prepare("DELETE FROM categories WHERE id = ?").bind(id).run();
    return Response.json({ success: true }, { headers: corsHeaders });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});
router.get("/api/products", async (request, env) => {
  try {
    const { results } = await env.DB.prepare(
      "SELECT * FROM products ORDER BY name"
    ).all();
    return Response.json(results, { headers: corsHeaders });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});
router.post("/api/products", async (request, env) => {
  try {
    const data = await request.json();
    const id = Date.now().toString();
    await env.DB.prepare(
      "INSERT INTO products (id, name, price, stock, category, image, discount_type, discount_value) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
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
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});
router.put("/api/products/:id", async (request, env, ctx) => {
  try {
    const { id } = ctx.params;
    const data = await request.json();
    await env.DB.prepare(
      "UPDATE products SET name = ?, price = ?, stock = ?, category = ?, image = ?, discount_type = ?, discount_value = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
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
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});
router.delete("/api/products/:id", async (request, env, ctx) => {
  try {
    const { id } = ctx.params;
    await env.DB.prepare("DELETE FROM products WHERE id = ?").bind(id).run();
    return Response.json({ success: true }, { headers: corsHeaders });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});
router.get("/api/customers", async (request, env) => {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get("q") || "";
    let sql = "SELECT * FROM customers";
    const params = [];
    if (query) {
      sql += " WHERE name LIKE ? OR phone LIKE ?";
      params.push(`%${query}%`, `%${query}%`);
    }
    sql += " ORDER BY name";
    const stmt = env.DB.prepare(sql);
    const boundStmt = params.length > 0 ? stmt.bind(...params) : stmt;
    const { results } = await boundStmt.all();
    return Response.json(results, { headers: corsHeaders });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});
router.post("/api/customers", async (request, env) => {
  try {
    const data = await request.json();
    const id = Date.now().toString();
    await env.DB.prepare(
      "INSERT INTO customers (id, name, phone) VALUES (?, ?, ?)"
    ).bind(id, data.name, data.phone || null).run();
    return Response.json({ id, ...data }, { headers: corsHeaders });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});
router.get("/api/transactions", async (request, env) => {
  try {
    const { results } = await env.DB.prepare(
      `SELECT t.*, c.name as customer_name, c.phone as customer_phone
       FROM transactions t
       LEFT JOIN customers c ON t.customer_id = c.id
       ORDER BY t.date DESC`
    ).all();
    const transactions = await Promise.all(
      results.map(async (transaction) => {
        const { results: items } = await env.DB.prepare(
          "SELECT * FROM transaction_items WHERE transaction_id = ?"
        ).bind(transaction.id).all();
        return { ...transaction, items };
      })
    );
    return Response.json(transactions, { headers: corsHeaders });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});
router.post("/api/transactions", async (request, env) => {
  try {
    const data = await request.json();
    const id = Date.now().toString();
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
      await env.DB.prepare(
        "UPDATE products SET stock = stock - ? WHERE id = ?"
      ).bind(item.quantity, item.id).run();
    }
    const transaction = await env.DB.prepare(
      `SELECT t.*, c.name as customer_name, c.phone as customer_phone
       FROM transactions t
       LEFT JOIN customers c ON t.customer_id = c.id
       WHERE t.id = ?`
    ).bind(id).first();
    return Response.json(transaction, { headers: corsHeaders });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});
router.get("/api/settings", async (request, env) => {
  try {
    const settings = await env.DB.prepare(
      "SELECT * FROM store_settings WHERE id = 1"
    ).first();
    return Response.json(settings, { headers: corsHeaders });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});
router.put("/api/settings", async (request, env) => {
  try {
    const data = await request.json();
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
      "SELECT * FROM store_settings WHERE id = 1"
    ).first();
    return Response.json(settings, { headers: corsHeaders });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});
router.all("*", async (request, env) => {
  try {
    const url = new URL(request.url);
    if (url.pathname === "/" || !url.pathname.includes(".")) {
      const asset2 = await env.ASSETS.fetch(new Request(new URL("/index.html", url)));
      return asset2;
    }
    const asset = await env.ASSETS.fetch(request);
    return asset;
  } catch (error) {
    return new Response("Not found", { status: 404 });
  }
});
var worker_default = {
  fetch: /* @__PURE__ */ __name((request, env, ctx) => router.handle(request, env, ctx), "fetch")
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

// .wrangler/tmp/bundle-lO2S8A/middleware-insertion-facade.js
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

// .wrangler/tmp/bundle-lO2S8A/middleware-loader.entry.ts
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
