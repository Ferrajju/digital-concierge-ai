-- Permite al propietario actualizar sus zonas (ciudad/región al editar ubicación)

CREATE POLICY "zonas_update_own"
  ON public.zonas
  FOR UPDATE
  TO authenticated
  USING (propietario_id = auth.uid())
  WITH CHECK (propietario_id = auth.uid());
