-- ─────────────────────────────────────────────────────────────────
-- Fruitholic — Initial Schema
-- All status/type fields use plain TEXT (no ENUM, no CHECK).
-- Validation is handled in application code via Zod.
-- ─────────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────────────────────────
-- PROFILES (linked to auth.users)
-- role: 'admin' | 'customer' — checked in code via Zod
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL DEFAULT 'customer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────
-- CATEGORIES
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id   UUID REFERENCES categories(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  sort_order  INT  NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug   ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);

-- ─────────────────────────────────────────────────────────────────
-- PRODUCTS
-- description / short_description: stored as TipTap JSON string
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id       UUID REFERENCES categories(id) ON DELETE SET NULL,
  name              TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,
  description       TEXT,
  short_description TEXT,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order        INT NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug     ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_active   ON products(is_active);

-- ─────────────────────────────────────────────────────────────────
-- PRODUCT IMAGES
-- sort_order = 0 → thumbnail
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_images (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  sort_order  INT  NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id, sort_order);

-- ─────────────────────────────────────────────────────────────────
-- PRODUCT VARIANTS (≥1 per product)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_variants (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  price       BIGINT NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);

-- ─────────────────────────────────────────────────────────────────
-- OPTION GROUPS
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS option_groups (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  min_select  INT NOT NULL DEFAULT 0,
  max_select  INT NOT NULL DEFAULT 1,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────
-- OPTION VALUES
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS option_values (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  option_group_id UUID NOT NULL REFERENCES option_groups(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  price           BIGINT NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order      INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_option_values_group ON option_values(option_group_id);

-- ─────────────────────────────────────────────────────────────────
-- PRODUCT ↔ OPTION GROUPS (M:M)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_option_groups (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  option_group_id UUID NOT NULL REFERENCES option_groups(id) ON DELETE CASCADE,
  sort_order      INT NOT NULL DEFAULT 0,
  UNIQUE (product_id, option_group_id)
);

CREATE INDEX IF NOT EXISTS idx_pog_product ON product_option_groups(product_id);

-- ─────────────────────────────────────────────────────────────────
-- ORDERS
-- All status fields are plain TEXT — validated in code, not DB
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code             TEXT NOT NULL UNIQUE,
  -- customer info
  customer_name    TEXT NOT NULL,
  customer_phone   TEXT NOT NULL,
  customer_email   TEXT,
  -- receiver info (null = same as customer)
  receiver_name    TEXT,
  receiver_phone   TEXT,
  -- delivery
  address          TEXT NOT NULL,
  note             TEXT,
  delivery_type    TEXT NOT NULL DEFAULT 'ASAP',    -- ASAP | SCHEDULED | PICKUP
  delivery_time    TIMESTAMPTZ,                      -- for SCHEDULED only
  -- payment
  payment_method   TEXT NOT NULL,                   -- COD | BANK_TRANSFER
  payment_status   TEXT NOT NULL DEFAULT 'UNPAID',  -- UNPAID | PAID | REFUNDED
  -- order lifecycle
  status           TEXT NOT NULL DEFAULT 'PENDING', -- PENDING | CONFIRMED | DELIVERING | COMPLETED | CANCELLED
  total_amount     BIGINT NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_code           ON orders(code);
CREATE INDEX IF NOT EXISTS idx_orders_status         ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at     ON orders(created_at DESC);

-- ─────────────────────────────────────────────────────────────────
-- ORDER ITEMS (snapshot at time of order)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id   UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id   UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  -- snapshots
  product_name TEXT NOT NULL,
  variant_name TEXT NOT NULL,
  price        BIGINT NOT NULL DEFAULT 0,
  quantity     INT NOT NULL DEFAULT 1,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- ─────────────────────────────────────────────────────────────────
-- ORDER ITEM OPTIONS (snapshot)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_item_options (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id     UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  option_group_id   UUID REFERENCES option_groups(id) ON DELETE SET NULL,
  option_value_id   UUID REFERENCES option_values(id) ON DELETE SET NULL,
  -- snapshots
  option_group_name TEXT NOT NULL,
  option_value_name TEXT NOT NULL,
  price             BIGINT NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_item_options_item ON order_item_options(order_item_id);

-- ─────────────────────────────────────────────────────────────────
-- AUTO-UPDATE updated_at TRIGGER
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'categories', 'products', 'product_variants',
    'option_groups', 'option_values', 'orders'
  ] LOOP
    EXECUTE FORMAT(
      'DROP TRIGGER IF EXISTS trg_%s_updated_at ON %I;
       CREATE TRIGGER trg_%s_updated_at
         BEFORE UPDATE ON %I
         FOR EACH ROW EXECUTE FUNCTION update_updated_at();',
      t, t, t, t
    );
  END LOOP;
END $$;

-- ─────────────────────────────────────────────────────────────────
-- RPC: Generate unique order code (FH + 6 digits)
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION generate_order_code()
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
  new_code TEXT;
  attempts INT := 0;
BEGIN
  LOOP
    new_code := 'FH' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM orders WHERE code = new_code);
    attempts := attempts + 1;
    IF attempts > 10 THEN
      RAISE EXCEPTION 'Cannot generate unique order code after % attempts', attempts;
    END IF;
  END LOOP;
  RETURN new_code;
END;
$$;

-- ─────────────────────────────────────────────────────────────────
-- RPC: Full product detail (avoids N+1 queries)
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_product_detail(p_slug TEXT)
RETURNS JSON LANGUAGE plpgsql STABLE AS $$
DECLARE
  result JSON;
BEGIN
  SELECT JSON_BUILD_OBJECT(
    'product', ROW_TO_JSON(p),
    'images', (
      SELECT JSON_AGG(pi ORDER BY pi.sort_order)
      FROM product_images pi
      WHERE pi.product_id = p.id
    ),
    'variants', (
      SELECT JSON_AGG(pv ORDER BY pv.sort_order)
      FROM product_variants pv
      WHERE pv.product_id = p.id AND pv.is_active = TRUE
    ),
    'option_groups', (
      SELECT JSON_AGG(
        JSON_BUILD_OBJECT(
          'id', og.id,
          'name', og.name,
          'min_select', og.min_select,
          'max_select', og.max_select,
          'values', (
            SELECT JSON_AGG(ov ORDER BY ov.sort_order)
            FROM option_values ov
            WHERE ov.option_group_id = og.id AND ov.is_active = TRUE
          )
        ) ORDER BY pog.sort_order
      )
      FROM product_option_groups pog
      JOIN option_groups og ON og.id = pog.option_group_id
      WHERE pog.product_id = p.id
    )
  ) INTO result
  FROM products p
  WHERE p.slug = p_slug AND p.is_active = TRUE;

  RETURN result;
END;
$$;

-- ─────────────────────────────────────────────────────────────────
-- RPC: Dashboard — Revenue + quantity per product
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_revenue_by_product(
  p_from TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_to   TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  product_id    UUID,
  product_name  TEXT,
  total_qty     BIGINT,
  total_revenue BIGINT
) LANGUAGE sql STABLE AS $$
  SELECT
    oi.product_id,
    oi.product_name,
    SUM(oi.quantity)::BIGINT             AS total_qty,
    SUM(oi.price * oi.quantity)::BIGINT  AS total_revenue
  FROM order_items oi
  JOIN orders o ON o.id = oi.order_id
  WHERE
    o.created_at BETWEEN p_from AND p_to
    AND o.status != 'CANCELLED'
  GROUP BY oi.product_id, oi.product_name
  ORDER BY total_revenue DESC;
$$;

-- ─────────────────────────────────────────────────────────────────
-- RPC: Dashboard — Order count per status per day
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_orders_by_status_per_day(
  p_from TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_to   TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  day    DATE,
  status TEXT,
  cnt    BIGINT
) LANGUAGE sql STABLE AS $$
  SELECT
    DATE(o.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh') AS day,
    o.status,
    COUNT(*)::BIGINT AS cnt
  FROM orders o
  WHERE o.created_at BETWEEN p_from AND p_to
  GROUP BY 1, 2
  ORDER BY 1, 2;
$$;
