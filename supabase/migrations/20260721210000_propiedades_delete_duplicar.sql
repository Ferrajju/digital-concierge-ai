-- Eliminar y duplicar propiedades desde el panel del propietario.

CREATE OR REPLACE FUNCTION public.eliminar_propiedad_propietario(p_propiedad_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
    RAISE EXCEPTION 'Propiedad no encontrada o sin permiso.';
  END IF;

  DELETE FROM public.documentos_vectores
  WHERE metadata->>'propiedad_id' = p_propiedad_id::text;

  DELETE FROM public.propiedades
  WHERE id = p_propiedad_id;
END;
$$;

REVOKE ALL ON FUNCTION public.eliminar_propiedad_propietario(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.eliminar_propiedad_propietario(uuid) TO authenticated;

COMMENT ON FUNCTION public.eliminar_propiedad_propietario(uuid) IS
  'Elimina una propiedad del propietario autenticado, sus vectores y datos relacionados en cascada.';

CREATE OR REPLACE FUNCTION public.duplicar_propiedad_propietario(
  p_propiedad_origen_id uuid,
  p_nuevo_nombre text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_origen public.propiedades%ROWTYPE;
  v_new_id uuid;
  v_nombre text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Debes iniciar sesión.';
  END IF;

  v_nombre := trim(p_nuevo_nombre);
  IF v_nombre = '' THEN
    RAISE EXCEPTION 'El nombre no puede estar vacío.';
  END IF;

  SELECT p.*
  INTO v_origen
  FROM public.propiedades p
  INNER JOIN public.zonas z ON z.id = p.zona_id
  WHERE p.id = p_propiedad_origen_id
    AND z.propietario_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Propiedad no encontrada o sin permiso.';
  END IF;

  INSERT INTO public.propiedades (
    zona_id,
    nombre_apartamento,
    ia_identidad,
    ia_elegancia,
    ia_expresividad,
    permiso_modo_alerta,
    duplicated_from_id,
    borrador_texto,
    direccion_calle,
    piso_puerta,
    codigo_postal,
    indicaciones_acceso,
    alertas_config,
    guia_local_tarjetas
  ) VALUES (
    v_origen.zona_id,
    v_nombre,
    v_origen.ia_identidad,
    v_origen.ia_elegancia,
    v_origen.ia_expresividad,
    v_origen.permiso_modo_alerta,
    p_propiedad_origen_id,
    v_origen.borrador_texto,
    v_origen.direccion_calle,
    v_origen.piso_puerta,
    v_origen.codigo_postal,
    v_origen.indicaciones_acceso,
    v_origen.alertas_config,
    v_origen.guia_local_tarjetas
  )
  RETURNING id INTO v_new_id;

  INSERT INTO public.documentos_vectores (content, metadata, embedding)
  SELECT
    dv.content,
    jsonb_set(
      COALESCE(dv.metadata, '{}'::jsonb),
      '{propiedad_id}',
      to_jsonb(v_new_id::text),
      true
    ),
    dv.embedding
  FROM public.documentos_vectores dv
  WHERE dv.metadata->>'propiedad_id' = p_propiedad_origen_id::text;

  RETURN v_new_id;
END;
$$;

REVOKE ALL ON FUNCTION public.duplicar_propiedad_propietario(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.duplicar_propiedad_propietario(uuid, text) TO authenticated;

COMMENT ON FUNCTION public.duplicar_propiedad_propietario(uuid, text) IS
  'Duplica manual, permisos, alertas, guía local y vectores. Nuevo UUID (QR) e historial de chats vacío.';
