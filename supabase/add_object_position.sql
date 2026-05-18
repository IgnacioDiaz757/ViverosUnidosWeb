-- Agrega la columna que guarda el encuadre elegido en el panel admin
ALTER TABLE gallery_items
  ADD COLUMN IF NOT EXISTS object_position text DEFAULT '50% 50%';
