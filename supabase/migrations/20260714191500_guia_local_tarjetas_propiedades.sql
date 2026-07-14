-- Tarjetas de guía local editables por el propietario (persistencia entre sesiones)

ALTER TABLE public.propiedades
  ADD COLUMN IF NOT EXISTS guia_local_tarjetas jsonb NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.propiedades.guia_local_tarjetas IS
  'Array JSON de tarjetas de recomendaciones locales: [{ id, categoria, nombre, distancia, informacion, activa }]';
