-- Conversaciones del chat web del huésped (Flujo 4 RAG)
-- Cada sesión del navegador móvil se identifica con session_id (localStorage).

CREATE TABLE IF NOT EXISTS public.conversaciones_huesped (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  propiedad_id uuid NOT NULL REFERENCES public.propiedades(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  historial_mensajes jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT conversaciones_huesped_session_unica
    UNIQUE (propiedad_id, session_id)
);

COMMENT ON TABLE public.conversaciones_huesped IS
  'Historial de chat del huésped por propiedad y sesión de navegador.';

COMMENT ON COLUMN public.conversaciones_huesped.session_id IS
  'UUID generado en el navegador del huésped y persistido en localStorage.';

COMMENT ON COLUMN public.conversaciones_huesped.historial_mensajes IS
  'Array JSON: [{ "rol": "user"|"assistant", "contenido": "...", "timestamp": "ISO8601" }]';

CREATE INDEX IF NOT EXISTS idx_conversaciones_huesped_propiedad
  ON public.conversaciones_huesped (propiedad_id);

CREATE INDEX IF NOT EXISTS idx_conversaciones_huesped_session
  ON public.conversaciones_huesped (session_id);

CREATE OR REPLACE FUNCTION public.set_conversaciones_huesped_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_conversaciones_huesped_updated_at
  ON public.conversaciones_huesped;

CREATE TRIGGER trg_conversaciones_huesped_updated_at
  BEFORE UPDATE ON public.conversaciones_huesped
  FOR EACH ROW
  EXECUTE FUNCTION public.set_conversaciones_huesped_updated_at();

ALTER TABLE public.conversaciones_huesped ENABLE ROW LEVEL SECURITY;

-- Huésped anónimo: insertar y leer/actualizar su propia sesión
CREATE POLICY "huesped_inserta_conversacion"
  ON public.conversaciones_huesped
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    propiedad_id IS NOT NULL
    AND session_id IS NOT NULL
    AND length(trim(session_id)) > 0
  );

CREATE POLICY "huesped_lee_su_conversacion"
  ON public.conversaciones_huesped
  FOR SELECT
  TO anon, authenticated
  USING (session_id IS NOT NULL);

CREATE POLICY "huesped_actualiza_su_conversacion"
  ON public.conversaciones_huesped
  FOR UPDATE
  TO anon, authenticated
  USING (session_id IS NOT NULL)
  WITH CHECK (session_id IS NOT NULL);

-- Propietario: leer chats de sus propiedades
CREATE POLICY "propietario_lee_chats_huesped"
  ON public.conversaciones_huesped
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.propiedades p
      INNER JOIN public.zonas z ON z.id = p.zona_id
      WHERE p.id = conversaciones_huesped.propiedad_id
        AND z.propietario_id = auth.uid()
    )
  );
