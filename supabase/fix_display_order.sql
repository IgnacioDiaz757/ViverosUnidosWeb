-- Ampliar display_order para aceptar timestamps en milisegundos
ALTER TABLE gallery_items ALTER COLUMN display_order TYPE bigint;
