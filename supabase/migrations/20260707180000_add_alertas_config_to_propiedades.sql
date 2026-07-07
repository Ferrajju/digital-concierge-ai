ALTER TABLE public.propiedades
  ADD COLUMN IF NOT EXISTS alertas_config jsonb NOT NULL DEFAULT '{
    "activas": true,
    "canal": "telegram",
    "contacto": "",
    "eventos": {
      "emergencias": true,
      "checkin_anticipado": true,
      "averias": true
    }
  }'::jsonb;

COMMENT ON COLUMN public.propiedades.alertas_config IS
  'Preferencias de notificaciones críticas del bot al propietario (eventos, canal y contacto).';
