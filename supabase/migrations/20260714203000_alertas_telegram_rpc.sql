-- RPC para que n8n (service role) evalúe si debe enviar una alerta Telegram
-- según la configuración guardada en propiedades.alertas_config.

CREATE OR REPLACE FUNCTION public.evaluar_alerta_propiedad(
  p_propiedad_id uuid,
  p_tipo_evento text
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prop RECORD;
  v_config jsonb;
  v_eventos jsonb;
  v_canal text;
  v_contacto text;
  v_telegram_prop bigint;
  v_alertas_activas boolean;
  v_evento_activo boolean;
BEGIN
  IF p_tipo_evento NOT IN ('emergencias', 'checkin_anticipado', 'averias') THEN
    RETURN jsonb_build_object(
      'notificar', false,
      'motivo', 'tipo_evento_invalido',
      'tipo_evento', p_tipo_evento
    );
  END IF;

  SELECT
    p.id,
    p.nombre_apartamento,
    p.direccion_calle,
    p.piso_puerta,
    p.codigo_postal,
    p.permiso_modo_alerta,
    p.alertas_config,
    pr.telegram_chat_id
  INTO v_prop
  FROM public.propiedades p
  INNER JOIN public.zonas z ON z.id = p.zona_id
  INNER JOIN public.propietarios pr ON pr.id = z.propietario_id
  WHERE p.id = p_propiedad_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'notificar', false,
      'motivo', 'propiedad_no_encontrada'
    );
  END IF;

  v_config := COALESCE(v_prop.alertas_config, '{}'::jsonb);
  v_eventos := COALESCE(v_config->'eventos', '{}'::jsonb);
  v_canal := COALESCE(NULLIF(v_config->>'canal', ''), 'telegram');

  v_alertas_activas := COALESCE(
    (v_config->>'activas')::boolean,
    v_prop.permiso_modo_alerta,
    false
  );

  IF NOT v_alertas_activas THEN
    RETURN jsonb_build_object(
      'notificar', false,
      'motivo', 'alertas_desactivadas',
      'propiedad_id', v_prop.id,
      'nombre_apartamento', v_prop.nombre_apartamento
    );
  END IF;

  v_evento_activo := COALESCE((v_eventos->>p_tipo_evento)::boolean, false);

  IF NOT v_evento_activo THEN
    RETURN jsonb_build_object(
      'notificar', false,
      'motivo', 'evento_desactivado',
      'tipo_evento', p_tipo_evento,
      'propiedad_id', v_prop.id,
      'nombre_apartamento', v_prop.nombre_apartamento
    );
  END IF;

  IF v_canal = 'email' THEN
    RETURN jsonb_build_object(
      'notificar', false,
      'motivo', 'canal_solo_email',
      'propiedad_id', v_prop.id,
      'nombre_apartamento', v_prop.nombre_apartamento
    );
  END IF;

  v_contacto := NULLIF(TRIM(v_config->>'contacto'), '');
  v_telegram_prop := v_prop.telegram_chat_id;

  IF v_contacto IS NULL AND v_telegram_prop IS NULL THEN
    RETURN jsonb_build_object(
      'notificar', false,
      'motivo', 'sin_telegram_configurado',
      'propiedad_id', v_prop.id,
      'nombre_apartamento', v_prop.nombre_apartamento
    );
  END IF;

  RETURN jsonb_build_object(
    'notificar', true,
    'telegram_chat_id', COALESCE(v_contacto, v_telegram_prop::text),
    'propiedad_id', v_prop.id,
    'nombre_apartamento', v_prop.nombre_apartamento,
    'direccion_calle', v_prop.direccion_calle,
    'piso_puerta', v_prop.piso_puerta,
    'codigo_postal', v_prop.codigo_postal,
    'tipo_evento', p_tipo_evento,
    'canal', v_canal
  );
END;
$$;

REVOKE ALL ON FUNCTION public.evaluar_alerta_propiedad(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.evaluar_alerta_propiedad(uuid, text) TO service_role;

COMMENT ON FUNCTION public.evaluar_alerta_propiedad(uuid, text) IS
  'Evalúa si n8n debe enviar una alerta Telegram según alertas_config de la propiedad.';

-- Registro opcional de alertas enviadas (auditoría / depuración)

CREATE TABLE IF NOT EXISTS public.alertas_enviadas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  propiedad_id uuid NOT NULL REFERENCES public.propiedades(id) ON DELETE CASCADE,
  tipo_evento text NOT NULL CHECK (
    tipo_evento IN ('emergencias', 'checkin_anticipado', 'averias')
  ),
  resumen text NOT NULL DEFAULT '',
  mensaje_huesped text NOT NULL DEFAULT '',
  session_id text,
  telegram_chat_id text,
  enviada boolean NOT NULL DEFAULT false,
  motivo_omitida text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS alertas_enviadas_propiedad_id_idx
  ON public.alertas_enviadas (propiedad_id, created_at DESC);

ALTER TABLE public.alertas_enviadas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "alertas_enviadas_select_own"
  ON public.alertas_enviadas
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.propiedades p
      INNER JOIN public.zonas z ON z.id = p.zona_id
      WHERE p.id = alertas_enviadas.propiedad_id
        AND z.propietario_id = auth.uid()
    )
  );

REVOKE ALL ON TABLE public.alertas_enviadas FROM anon, authenticated;
GRANT SELECT ON TABLE public.alertas_enviadas TO authenticated;
GRANT ALL ON TABLE public.alertas_enviadas TO service_role;
