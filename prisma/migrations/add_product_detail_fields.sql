-- Agregar tagline y tags a menu_items
ALTER TABLE menu_items
  ADD COLUMN IF NOT EXISTS tagline TEXT,
  ADD COLUMN IF NOT EXISTS tags    TEXT[] NOT NULL DEFAULT '{}';

-- Tabla de componentes del plato
CREATE TABLE IF NOT EXISTS menu_item_components (
  id             TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  menu_item_id   TEXT        NOT NULL,
  nombre         TEXT        NOT NULL,
  cantidad_label TEXT        NOT NULL,
  foto_url       TEXT,
  orden          INTEGER     NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT pk_menu_item_components PRIMARY KEY (id),
  CONSTRAINT fk_mic_menu_item        FOREIGN KEY (menu_item_id)
    REFERENCES menu_items(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_mic_menu_item_id
  ON menu_item_components(menu_item_id);
