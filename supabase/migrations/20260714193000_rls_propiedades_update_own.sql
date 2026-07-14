-- Permite al propietario actualizar sus propiedades (borrador, guía local, alertas...)

CREATE POLICY "propiedades_update_own"
  ON public.propiedades
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.zonas z
      WHERE z.id = propiedades.zona_id
        AND z.propietario_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.zonas z
      WHERE z.id = propiedades.zona_id
        AND z.propietario_id = auth.uid()
    )
  );
