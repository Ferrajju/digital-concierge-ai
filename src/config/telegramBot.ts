export const TELEGRAM_BOT_USERNAME = 'TheUmbralbot'

export const TELEGRAM_BOT_URL =
  import.meta.env.VITE_TELEGRAM_BOT_URL?.trim() ||
  `https://t.me/${TELEGRAM_BOT_USERNAME}`

export const TELEGRAM_BOT_DISPLAY = '@TheUmbralbot'
