-- Comentarios y errores del propietario desde el panel

CREATE TABLE IF NOT EXISTS public.feedback_propietario (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  propietario_id uuid NOT NULL REFERENCES public.propietarios(id) ON DELETE CASCADE,
  tipo text NOT NULL CHECK (tipo IN ('comentario', 'error')),
  pantalla text NOT NULL,
  ruta text NOT NULL,
  propiedad_id uuid REFERENCES public.propiedades(id) ON DELETE SET NULL,
  mensaje text NOT NULL CHECK (char_length(trim(mensaje)) >= 10),
  contexto jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS feedback_propietario_propietario_id_idx
  ON public.feedback_propietario (propietario_id, created_at DESC);

ALTER TABLE public.feedback_propietario ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feedback_propietario_insert_own"
  ON public.feedback_propietario
  FOR INSERT
  TO authenticated
  WITH CHECK (propietario_id = auth.uid());

CREATE POLICY "feedback_propietario_select_own"
  ON public.feedback_propietario
  FOR SELECT
  TO authenticated
  USING (propietario_id = auth.uid());

COMMENT ON TABLE public.feedback_propietario IS
  'Feedback de ayuda, mejoras y errores enviado desde el panel del propietario.';
