-- Conversaciones temporales de prueba del propietario (no aparecen en chats huésped)

CREATE TABLE IF NOT EXISTS public.conversaciones_prueba (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  propiedad_id uuid NOT NULL REFERENCES public.propiedades(id) ON DELETE CASCADE,
  propietario_id uuid NOT NULL REFERENCES public.propietarios(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  historial_mensajes jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT conversaciones_prueba_session_unica UNIQUE (propiedad_id, session_id)
);

CREATE INDEX IF NOT EXISTS conversaciones_prueba_propiedad_idx
  ON public.conversaciones_prueba (propiedad_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS conversaciones_prueba_propietario_idx
  ON public.conversaciones_prueba (propietario_id, updated_at DESC);

COMMENT ON TABLE public.conversaciones_prueba IS
  'Chats de simulacro del propietario. Temporales; no se listan en conversaciones de huésped.';

CREATE OR REPLACE FUNCTION public.set_conversaciones_prueba_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_conversaciones_prueba_updated_at ON public.conversaciones_prueba;

CREATE TRIGGER trg_conversaciones_prueba_updated_at
  BEFORE UPDATE ON public.conversaciones_prueba
  FOR EACH ROW
  EXECUTE FUNCTION public.set_conversaciones_prueba_updated_at();

ALTER TABLE public.conversaciones_prueba ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conversaciones_prueba_propietario_all"
  ON public.conversaciones_prueba
  FOR ALL
  TO authenticated
  USING (propietario_id = auth.uid())
  WITH CHECK (propietario_id = auth.uid());

ALTER TABLE public.alertas_enviadas
  ADD COLUMN IF NOT EXISTS es_prueba boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.alertas_enviadas.es_prueba IS
  'True si la alerta proviene de una simulación del propietario, no de un huésped real.';
