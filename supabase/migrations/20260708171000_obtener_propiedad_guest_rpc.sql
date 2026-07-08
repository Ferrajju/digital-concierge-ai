-- Datos públicos de propiedad para el portal del huésped (sin exponer borrador ni alertas)

CREATE OR REPLACE FUNCTION public.obtener_propiedad_guest(p_propiedad_id uuid)
RETURNS TABLE (
  id uuid,
  nombre_apartamento text,
  direccion_calle text,
  piso_puerta text,
  codigo_postal text,
  ia_identidad text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.nombre_apartamento,
    p.direccion_calle,
    p.piso_puerta,
    p.codigo_postal,
    p.ia_identidad
  FROM public.propiedades p
  WHERE p.id = p_propiedad_id;
$$;

REVOKE ALL ON FUNCTION public.obtener_propiedad_guest(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.obtener_propiedad_guest(uuid) TO anon, authenticated;

COMMENT ON FUNCTION public.obtener_propiedad_guest(uuid) IS
  'Devuelve datos públicos de una propiedad para la cabecera del chat del huésped.';
