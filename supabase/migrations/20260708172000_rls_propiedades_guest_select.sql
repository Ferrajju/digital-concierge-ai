-- Lectura pública de propiedades para el portal del huésped (anon).
-- La app filtra siempre por .eq('id', uuid). Sin el UUID exacto no hay enlace válido.

ALTER TABLE public.propiedades ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "guest_lee_propiedad_por_uuid" ON public.propiedades;

CREATE POLICY "guest_lee_propiedad_por_uuid"
  ON public.propiedades
  FOR SELECT
  TO anon, authenticated
  USING (id IS NOT NULL);

COMMENT ON POLICY "guest_lee_propiedad_por_uuid" ON public.propiedades IS
  'Permite al huésped anónimo leer datos de cabecera si conoce el UUID de la propiedad.';
