-- ============================================================
-- VIVEROS UNIDOS — Políticas de escritura para el panel admin
-- Ejecutar en: Supabase → SQL Editor → New query
-- (La tabla ya fue creada con init.sql)
-- ============================================================

-- Permisos de escritura para usuarios autenticados (panel admin)
CREATE POLICY "Admin inserta" ON gallery_items
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admin borra" ON gallery_items
  FOR DELETE TO authenticated USING (true);

-- Permisos de Storage (el bucket "gallery" ya debe estar creado)
CREATE POLICY "Admin sube fotos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'gallery');

CREATE POLICY "Admin borra fotos" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'gallery');
