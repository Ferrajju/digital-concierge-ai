type OnboardingCopy = {
  welcome: string
  subtitle: string
  languageLabel: string
  languageHint: string
  nameLabel: string
  namePlaceholder: string
  nameHint: string
  submit: string
  loading: string
  errorName: string
  errorSave: string
}

const COPY: Record<string, OnboardingCopy> = {
  es: {
    welcome: 'Bienvenido a tu estancia',
    subtitle: 'Configura tu conserje digital antes de empezar.',
    languageLabel: 'Idioma del conserje',
    languageHint: 'El conserje te responderá en este idioma.',
    nameLabel: '¿Cómo te llamamos?',
    namePlaceholder: 'Tu nombre o apodo',
    nameHint: 'Así te saludará el conserje durante tu estancia.',
    submit: 'Acceder al conserje',
    loading: 'Preparando...',
    errorName: 'Introduce cómo quieres que te llamemos.',
    errorSave: 'No se pudo guardar tu perfil. Inténtalo de nuevo.',
  },
  en: {
    welcome: 'Welcome to your stay',
    subtitle: 'Set up your digital concierge before you start.',
    languageLabel: 'Concierge language',
    languageHint: 'The concierge will reply in this language.',
    nameLabel: 'What should we call you?',
    namePlaceholder: 'Your name or nickname',
    nameHint: 'The concierge will greet you by this name.',
    submit: 'Open concierge',
    loading: 'Loading...',
    errorName: 'Please enter what we should call you.',
    errorSave: 'Could not save your profile. Please try again.',
  },
  fr: {
    welcome: 'Bienvenue pour votre séjour',
    subtitle: 'Configurez votre concierge numérique avant de commencer.',
    languageLabel: 'Langue du concierge',
    languageHint: 'Le concierge répondra dans cette langue.',
    nameLabel: 'Comment souhaitez-vous être appelé ?',
    namePlaceholder: 'Votre prénom ou surnom',
    nameHint: 'Le concierge vous saluera avec ce nom.',
    submit: 'Accéder au concierge',
    loading: 'Chargement...',
    errorName: 'Indiquez comment vous appeler.',
    errorSave: 'Impossible d’enregistrer votre profil.',
  },
  de: {
    welcome: 'Willkommen zu Ihrem Aufenthalt',
    subtitle: 'Richten Sie Ihren digitalen Concierge ein.',
    languageLabel: 'Sprache des Concierge',
    languageHint: 'Der Concierge antwortet in dieser Sprache.',
    nameLabel: 'Wie sollen wir Sie nennen?',
    namePlaceholder: 'Ihr Name oder Spitzname',
    nameHint: 'So begrüßt Sie der Concierge.',
    submit: 'Concierge öffnen',
    loading: 'Laden...',
    errorName: 'Bitte geben Sie einen Namen ein.',
    errorSave: 'Profil konnte nicht gespeichert werden.',
  },
  it: {
    welcome: 'Benvenuto al tuo soggiorno',
    subtitle: 'Configura il concierge digitale prima di iniziare.',
    languageLabel: 'Lingua del concierge',
    languageHint: 'Il concierge risponderà in questa lingua.',
    nameLabel: 'Come vuoi che ti chiamiamo?',
    namePlaceholder: 'Il tuo nome o soprannome',
    nameHint: 'Il concierge ti saluterà con questo nome.',
    submit: 'Accedi al concierge',
    loading: 'Caricamento...',
    errorName: 'Inserisci come chiamarti.',
    errorSave: 'Impossibile salvare il profilo.',
  },
  pt: {
    welcome: 'Bem-vindo à sua estadia',
    subtitle: 'Configure o seu concierge digital antes de começar.',
    languageLabel: 'Idioma do concierge',
    languageHint: 'O concierge responderá neste idioma.',
    nameLabel: 'Como devemos chamar-lhe?',
    namePlaceholder: 'O seu nome ou alcunha',
    nameHint: 'O concierge irá cumprimentá-lo por este nome.',
    submit: 'Aceder ao concierge',
    loading: 'A preparar...',
    errorName: 'Introduza como quer ser chamado.',
    errorSave: 'Não foi possível guardar o perfil.',
  },
}

export function obtenerCopyOnboarding(idioma: string): OnboardingCopy {
  const base = idioma.split('-')[0]
  return COPY[idioma] ?? COPY[base] ?? COPY.en
}

export function crearMensajeBienvenidaChat(input: {
  nombreAgente: string
  nombreHuesped: string
  idioma: string
}): string {
  const { nombreAgente, nombreHuesped, idioma } = input
  const base = idioma.split('-')[0]

  const plantillas: Record<string, string> = {
    es: `¡Hola, **${nombreHuesped}**! Soy **${nombreAgente}**, tu conserje digital.\n\nPregúntame lo que necesites sobre el alojamiento, la zona o tu estancia. También puedes usar las sugerencias de abajo.`,
    en: `Hi, **${nombreHuesped}**! I'm **${nombreAgente}**, your digital concierge.\n\nAsk me anything about the property, the area, or your stay. You can also use the quick suggestions below.`,
    fr: `Bonjour, **${nombreHuesped}** ! Je suis **${nombreAgente}**, votre concierge digital.\n\nPosez-moi vos questions sur le logement, le quartier ou votre séjour.`,
    de: `Hallo, **${nombreHuesped}**! Ich bin **${nombreAgente}**, Ihr digitaler Concierge.\n\nFragen Sie mich alles über die Unterkunft, die Umgebung oder Ihren Aufenthalt.`,
    it: `Ciao, **${nombreHuesped}**! Sono **${nombreAgente}**, il tuo concierge digitale.\n\nChiedimi qualsiasi cosa sull'alloggio, la zona o il soggiorno.`,
    pt: `Olá, **${nombreHuesped}**! Sou **${nombreAgente}**, o seu concierge digital.\n\nPergunte o que precisar sobre o alojamento, a zona ou a estadia.`,
  }

  return plantillas[base] ?? plantillas.en
}
