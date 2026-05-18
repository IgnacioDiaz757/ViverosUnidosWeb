-- ============================================================
-- VIVEROS UNIDOS — Galería · Supabase setup
-- Ejecutar en: Supabase → SQL Editor → New query
-- ============================================================

-- 1. Tabla principal
CREATE TABLE gallery_items (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  title         text        NOT NULL,
  alt_text      text,
  category      text        NOT NULL CHECK (category IN ('vivero','produccion','capacitaciones','eventos')),
  image_url     text        NOT NULL,
  display_order integer     DEFAULT 0,
  created_at    timestamptz DEFAULT now()
);

-- 2. Row Level Security — solo lectura pública (la anon key puede SELECT, nadie puede INSERT/UPDATE/DELETE desde el front)
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública" ON gallery_items
  FOR SELECT USING (true);

-- 3. Permisos de escritura para usuarios autenticados (panel admin)
CREATE POLICY "Admin inserta" ON gallery_items
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admin borra" ON gallery_items
  FOR DELETE TO authenticated USING (true);

-- 4. Permisos de Storage (ejecutar después de crear el bucket "gallery")
CREATE POLICY "Admin sube fotos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'gallery');

CREATE POLICY "Admin borra fotos" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'gallery');
