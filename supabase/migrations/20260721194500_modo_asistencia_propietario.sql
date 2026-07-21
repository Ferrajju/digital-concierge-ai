-- Modo asistencia: el propietario responde manualmente y la IA queda pausada.

ALTER TABLE public.conversaciones_huesped
  ADD COLUMN IF NOT EXISTS modo_asistencia_propietario boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS modo_asistencia_desde timestamptz;

COMMENT ON COLUMN public.conversaciones_huesped.modo_asistencia_propietario IS
  'True mientras el propietario atiende el chat manualmente; la IA no responde al huésped.';

COMMENT ON COLUMN public.conversaciones_huesped.modo_asistencia_desde IS
  'Momento en que se activó el modo asistencia del propietario.';

CREATE POLICY "propietario_actualiza_chats_huesped"
  ON public.conversaciones_huesped
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.propiedades p
      INNER JOIN public.zonas z ON z.id = p.zona_id
      WHERE p.id = conversaciones_huesped.propiedad_id
        AND z.propietario_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.propiedades p
      INNER JOIN public.zonas z ON z.id = p.zona_id
      WHERE p.id = conversaciones_huesped.propiedad_id
        AND z.propietario_id = auth.uid()
    )
  );
