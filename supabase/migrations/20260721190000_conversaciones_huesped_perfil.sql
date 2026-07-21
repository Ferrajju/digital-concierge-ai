-- Perfil del huésped por sesión (idioma y nombre para personalizar el conserje)

ALTER TABLE public.conversaciones_huesped
  ADD COLUMN IF NOT EXISTS nombre_huesped text,
  ADD COLUMN IF NOT EXISTS idioma text NOT NULL DEFAULT 'es',
  ADD COLUMN IF NOT EXISTS perfil_completado boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.conversaciones_huesped.nombre_huesped IS
  'Nombre o apodo con el que el huésped quiere que le llamen.';

COMMENT ON COLUMN public.conversaciones_huesped.idioma IS
  'Código ISO 639-1 (o BCP-47) del idioma preferido del huésped para el chat.';

COMMENT ON COLUMN public.conversaciones_huesped.perfil_completado IS
  'True tras completar la pantalla de bienvenida (idioma + nombre).';

CREATE INDEX IF NOT EXISTS idx_conversaciones_huesped_perfil
  ON public.conversaciones_huesped (propiedad_id, session_id)
  WHERE perfil_completado = true;
