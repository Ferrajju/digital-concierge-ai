export type GuestLanguage = {
  code: string
  label: string
  native: string
}

export const GUEST_LANGUAGES: GuestLanguage[] = [
  { code: 'es', label: 'Spanish', native: 'Español' },
  { code: 'en', label: 'English', native: 'English' },
  { code: 'ca', label: 'Catalan', native: 'Català' },
  { code: 'eu', label: 'Basque', native: 'Euskara' },
  { code: 'gl', label: 'Galician', native: 'Galego' },
  { code: 'fr', label: 'French', native: 'Français' },
  { code: 'pt', label: 'Portuguese', native: 'Português' },
  { code: 'pt-BR', label: 'Portuguese (Brazil)', native: 'Português (Brasil)' },
  { code: 'it', label: 'Italian', native: 'Italiano' },
  { code: 'de', label: 'German', native: 'Deutsch' },
  { code: 'nl', label: 'Dutch', native: 'Nederlands' },
  { code: 'pl', label: 'Polish', native: 'Polski' },
  { code: 'ru', label: 'Russian', native: 'Русский' },
  { code: 'uk', label: 'Ukrainian', native: 'Українська' },
  { code: 'ro', label: 'Romanian', native: 'Română' },
  { code: 'hu', label: 'Hungarian', native: 'Magyar' },
  { code: 'cs', label: 'Czech', native: 'Čeština' },
  { code: 'sk', label: 'Slovak', native: 'Slovenčina' },
  { code: 'bg', label: 'Bulgarian', native: 'Български' },
  { code: 'hr', label: 'Croatian', native: 'Hrvatski' },
  { code: 'sr', label: 'Serbian', native: 'Српски' },
  { code: 'sl', label: 'Slovenian', native: 'Slovenščina' },
  { code: 'el', label: 'Greek', native: 'Ελληνικά' },
  { code: 'tr', label: 'Turkish', native: 'Türkçe' },
  { code: 'ar', label: 'Arabic', native: 'العربية' },
  { code: 'he', label: 'Hebrew', native: 'עברית' },
  { code: 'fa', label: 'Persian', native: 'فارسی' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
  { code: 'ur', label: 'Urdu', native: 'اردو' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'zh', label: 'Chinese (Simplified)', native: '中文 (简体)' },
  { code: 'zh-TW', label: 'Chinese (Traditional)', native: '中文 (繁體)' },
  { code: 'ja', label: 'Japanese', native: '日本語' },
  { code: 'ko', label: 'Korean', native: '한국어' },
  { code: 'vi', label: 'Vietnamese', native: 'Tiếng Việt' },
  { code: 'th', label: 'Thai', native: 'ไทย' },
  { code: 'id', label: 'Indonesian', native: 'Bahasa Indonesia' },
  { code: 'ms', label: 'Malay', native: 'Bahasa Melayu' },
  { code: 'fil', label: 'Filipino', native: 'Filipino' },
  { code: 'sv', label: 'Swedish', native: 'Svenska' },
  { code: 'da', label: 'Danish', native: 'Dansk' },
  { code: 'no', label: 'Norwegian', native: 'Norsk' },
  { code: 'fi', label: 'Finnish', native: 'Suomi' },
  { code: 'is', label: 'Icelandic', native: 'Íslenska' },
  { code: 'et', label: 'Estonian', native: 'Eesti' },
  { code: 'lv', label: 'Latvian', native: 'Latviešu' },
  { code: 'lt', label: 'Lithuanian', native: 'Lietuvių' },
  { code: 'sq', label: 'Albanian', native: 'Shqip' },
  { code: 'mk', label: 'Macedonian', native: 'Македонски' },
  { code: 'bs', label: 'Bosnian', native: 'Bosanski' },
  { code: 'mt', label: 'Maltese', native: 'Malti' },
  { code: 'ga', label: 'Irish', native: 'Gaeilge' },
  { code: 'cy', label: 'Welsh', native: 'Cymraeg' },
  { code: 'sw', label: 'Swahili', native: 'Kiswahili' },
  { code: 'af', label: 'Afrikaans', native: 'Afrikaans' },
]

export function obtenerIdiomaGuest(code: string): GuestLanguage | undefined {
  return GUEST_LANGUAGES.find((lang) => lang.code === code)
}

export function esCodigoIdiomaValido(code: string): boolean {
  return GUEST_LANGUAGES.some((lang) => lang.code === code)
}
