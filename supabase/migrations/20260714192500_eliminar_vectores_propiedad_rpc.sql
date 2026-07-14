-- Borra vectores de una propiedad antes de reindexar (Flujo 3).
-- Solo el propietario autenticado de esa propiedad puede ejecutarla.

CREATE OR REPLACE FUNCTION public.eliminar_vectores_propiedad(p_propiedad_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_eliminados integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Debes iniciar sesión.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.propiedades p
    INNER JOIN public.zonas z ON z.id = p.zona_id
    WHERE p.id = p_propiedad_id
      AND z.propietario_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Sin permiso para eliminar vectores de esta propiedad.';
  END IF;

  DELETE FROM public.documentos_vectores
  WHERE metadata->>'propiedad_id' = p_propiedad_id::text;

  GET DIAGNOSTICS v_eliminados = ROW_COUNT;
  RETURN v_eliminados;
END;
$$;

REVOKE ALL ON FUNCTION public.eliminar_vectores_propiedad(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.eliminar_vectores_propiedad(uuid) TO authenticated;

COMMENT ON FUNCTION public.eliminar_vectores_propiedad(uuid) IS
  'Elimina todos los chunks vectoriales de una propiedad antes de reindexar.';
