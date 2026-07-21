export type GuestUiCopy = {
  welcome: string
  subtitle: string
  brandSubtitle: string
  brandTagline: string
  stepLanguage: string
  stepName: string
  languageLabel: string
  languageHint: string
  languageSearch: string
  nameLabel: string
  namePlaceholder: string
  nameHint: string
  submit: string
  loading: string
  errorName: string
  errorSave: string
  loadingConcierge: string
  invalidLink: string
  linkUnavailable: string
  yourStay: string
  online: string
  ownerPersonal: string
  ownerBanner: string
  ownerLabel: string
  faqTitle: string
  inputPlaceholder: string
  inputLabel: string
  sendLabel: string
  inputHint: string
  sendError: string
  settingsTitle: string
  settingsLanguage: string
  settingsLanguageHint: string
  settingsSave: string
  settingsSaving: string
  settingsSaved: string
  settingsClose: string
  openSettings: string
}

const COPY: Record<string, GuestUiCopy> = {
  es: {
    welcome: 'Bienvenido a tu estancia',
    subtitle: 'Elige idioma y cómo te llamamos. Tu conserje se adaptará a ti.',
    brandSubtitle: 'Conserje digital',
    brandTagline: 'Tu conserje digital para esta estancia',
    stepLanguage: 'Idioma',
    stepName: 'Tu nombre',
    languageLabel: 'Idioma del conserje',
    languageHint: 'La interfaz y las respuestas usarán este idioma.',
    languageSearch: 'Buscar idioma…',
    nameLabel: '¿Cómo te llamamos?',
    namePlaceholder: 'Tu nombre o apodo',
    nameHint: 'Así te saludará el conserje durante tu estancia.',
    submit: 'Acceder al conserje',
    loading: 'Preparando…',
    errorName: 'Introduce cómo quieres que te llamemos.',
    errorSave: 'No se pudo guardar tu perfil. Inténtalo de nuevo.',
    loadingConcierge: 'Preparando tu conserje…',
    invalidLink: 'Enlace no válido.',
    linkUnavailable: 'Enlace no disponible',
    yourStay: 'Tu alojamiento',
    online: 'en línea',
    ownerPersonal: 'Propietario · te atiende personalmente',
    ownerBanner:
      'El conserje automático está en pausa. El propietario responderá a tus mensajes.',
    ownerLabel: 'Propietario',
    faqTitle: 'Preguntas frecuentes',
    inputPlaceholder: 'Escribe tu pregunta…',
    inputLabel: 'Escribe tu pregunta',
    sendLabel: 'Enviar mensaje',
    inputHint: 'Enter para enviar · Shift+Enter para nueva línea',
    sendError: 'No se pudo enviar el mensaje. Inténtalo de nuevo.',
    settingsTitle: 'Preferencias',
    settingsLanguage: 'Idioma',
    settingsLanguageHint: 'Cambia el idioma de la app y del conserje.',
    settingsSave: 'Guardar idioma',
    settingsSaving: 'Guardando…',
    settingsSaved: 'Idioma actualizado',
    settingsClose: 'Cerrar',
    openSettings: 'Idioma y preferencias',
  },
  en: {
    welcome: 'Welcome to your stay',
    subtitle: 'Pick your language and name. Your concierge will adapt to you.',
    brandSubtitle: 'Digital concierge',
    brandTagline: 'Your digital concierge for this stay',
    stepLanguage: 'Language',
    stepName: 'Your name',
    languageLabel: 'Concierge language',
    languageHint: 'The app and replies will use this language.',
    languageSearch: 'Search language…',
    nameLabel: 'What should we call you?',
    namePlaceholder: 'Your name or nickname',
    nameHint: 'The concierge will greet you by this name.',
    submit: 'Open concierge',
    loading: 'Loading…',
    errorName: 'Please enter what we should call you.',
    errorSave: 'Could not save your profile. Please try again.',
    loadingConcierge: 'Preparing your concierge…',
    invalidLink: 'Invalid link.',
    linkUnavailable: 'Link unavailable',
    yourStay: 'Your accommodation',
    online: 'online',
    ownerPersonal: 'Host · personally assisting you',
    ownerBanner:
      'The automatic concierge is paused. The host will reply to your messages.',
    ownerLabel: 'Host',
    faqTitle: 'Quick questions',
    inputPlaceholder: 'Type your question…',
    inputLabel: 'Type your question',
    sendLabel: 'Send message',
    inputHint: 'Enter to send · Shift+Enter for new line',
    sendError: 'Could not send the message. Please try again.',
    settingsTitle: 'Preferences',
    settingsLanguage: 'Language',
    settingsLanguageHint: 'Change the app and concierge language.',
    settingsSave: 'Save language',
    settingsSaving: 'Saving…',
    settingsSaved: 'Language updated',
    settingsClose: 'Close',
    openSettings: 'Language & preferences',
  },
  fr: {
    welcome: 'Bienvenue pour votre séjour',
    subtitle: 'Choisissez la langue et votre prénom. Votre concierge s’adapte à vous.',
    brandSubtitle: 'Concierge digital',
    brandTagline: 'Votre concierge digital pour ce séjour',
    stepLanguage: 'Langue',
    stepName: 'Votre prénom',
    languageLabel: 'Langue du concierge',
    languageHint: 'L’interface et les réponses utiliseront cette langue.',
    languageSearch: 'Rechercher une langue…',
    nameLabel: 'Comment souhaitez-vous être appelé ?',
    namePlaceholder: 'Votre prénom ou surnom',
    nameHint: 'Le concierge vous saluera avec ce nom.',
    submit: 'Accéder au concierge',
    loading: 'Chargement…',
    errorName: 'Indiquez comment vous appeler.',
    errorSave: 'Impossible d’enregistrer votre profil.',
    loadingConcierge: 'Préparation de votre concierge…',
    invalidLink: 'Lien non valide.',
    linkUnavailable: 'Lien indisponible',
    yourStay: 'Votre logement',
    online: 'en ligne',
    ownerPersonal: 'Propriétaire · vous assiste personnellement',
    ownerBanner:
      'Le concierge automatique est en pause. Le propriétaire répondra à vos messages.',
    ownerLabel: 'Propriétaire',
    faqTitle: 'Questions fréquentes',
    inputPlaceholder: 'Écrivez votre question…',
    inputLabel: 'Écrivez votre question',
    sendLabel: 'Envoyer le message',
    inputHint: 'Entrée pour envoyer · Maj+Entrée pour nouvelle ligne',
    sendError: 'Impossible d’envoyer le message. Réessayez.',
    settingsTitle: 'Préférences',
    settingsLanguage: 'Langue',
    settingsLanguageHint: 'Change la langue de l’app et du concierge.',
    settingsSave: 'Enregistrer la langue',
    settingsSaving: 'Enregistrement…',
    settingsSaved: 'Langue mise à jour',
    settingsClose: 'Fermer',
    openSettings: 'Langue et préférences',
  },
  de: {
    welcome: 'Willkommen zu Ihrem Aufenthalt',
    subtitle: 'Wählen Sie Sprache und Name. Ihr Concierge passt sich an.',
    brandSubtitle: 'Digitaler Concierge',
    brandTagline: 'Ihr digitaler Concierge für diesen Aufenthalt',
    stepLanguage: 'Sprache',
    stepName: 'Ihr Name',
    languageLabel: 'Sprache des Concierge',
    languageHint: 'App und Antworten nutzen diese Sprache.',
    languageSearch: 'Sprache suchen…',
    nameLabel: 'Wie sollen wir Sie nennen?',
    namePlaceholder: 'Ihr Name oder Spitzname',
    nameHint: 'So begrüßt Sie der Concierge.',
    submit: 'Concierge öffnen',
    loading: 'Laden…',
    errorName: 'Bitte geben Sie einen Namen ein.',
    errorSave: 'Profil konnte nicht gespeichert werden.',
    loadingConcierge: 'Concierge wird vorbereitet…',
    invalidLink: 'Ungültiger Link.',
    linkUnavailable: 'Link nicht verfügbar',
    yourStay: 'Ihre Unterkunft',
    online: 'online',
    ownerPersonal: 'Gastgeber · persönliche Betreuung',
    ownerBanner:
      'Der automatische Concierge ist pausiert. Der Gastgeber antwortet auf Ihre Nachrichten.',
    ownerLabel: 'Gastgeber',
    faqTitle: 'Häufige Fragen',
    inputPlaceholder: 'Schreiben Sie Ihre Frage…',
    inputLabel: 'Schreiben Sie Ihre Frage',
    sendLabel: 'Nachricht senden',
    inputHint: 'Enter zum Senden · Umschalt+Enter für neue Zeile',
    sendError: 'Nachricht konnte nicht gesendet werden.',
    settingsTitle: 'Einstellungen',
    settingsLanguage: 'Sprache',
    settingsLanguageHint: 'Sprache der App und des Concierge ändern.',
    settingsSave: 'Sprache speichern',
    settingsSaving: 'Speichern…',
    settingsSaved: 'Sprache aktualisiert',
    settingsClose: 'Schließen',
    openSettings: 'Sprache & Einstellungen',
  },
  it: {
    welcome: 'Benvenuto al tuo soggiorno',
    subtitle: 'Scegli lingua e nome. Il concierge si adatta a te.',
    brandSubtitle: 'Concierge digitale',
    brandTagline: 'Il tuo concierge digitale per questo soggiorno',
    stepLanguage: 'Lingua',
    stepName: 'Il tuo nome',
    languageLabel: 'Lingua del concierge',
    languageHint: 'L’interfaccia e le risposte useranno questa lingua.',
    languageSearch: 'Cerca lingua…',
    nameLabel: 'Come vuoi che ti chiamiamo?',
    namePlaceholder: 'Il tuo nome o soprannome',
    nameHint: 'Il concierge ti saluterà con questo nome.',
    submit: 'Accedi al concierge',
    loading: 'Caricamento…',
    errorName: 'Inserisci come chiamarti.',
    errorSave: 'Impossibile salvare il profilo.',
    loadingConcierge: 'Preparazione del concierge…',
    invalidLink: 'Link non valido.',
    linkUnavailable: 'Link non disponibile',
    yourStay: 'Il tuo alloggio',
    online: 'online',
    ownerPersonal: 'Proprietario · assistenza personale',
    ownerBanner:
      'Il concierge automatico è in pausa. Il proprietario risponderà ai tuoi messaggi.',
    ownerLabel: 'Proprietario',
    faqTitle: 'Domande frequenti',
    inputPlaceholder: 'Scrivi la tua domanda…',
    inputLabel: 'Scrivi la tua domanda',
    sendLabel: 'Invia messaggio',
    inputHint: 'Invio per inviare · Maiusc+Invio per nuova riga',
    sendError: 'Impossibile inviare il messaggio. Riprova.',
    settingsTitle: 'Preferenze',
    settingsLanguage: 'Lingua',
    settingsLanguageHint: 'Cambia la lingua dell’app e del concierge.',
    settingsSave: 'Salva lingua',
    settingsSaving: 'Salvataggio…',
    settingsSaved: 'Lingua aggiornata',
    settingsClose: 'Chiudi',
    openSettings: 'Lingua e preferenze',
  },
  pt: {
    welcome: 'Bem-vindo à sua estadia',
    subtitle: 'Escolha o idioma e o seu nome. O concierge adapta-se a si.',
    brandSubtitle: 'Concierge digital',
    brandTagline: 'O seu concierge digital para esta estadia',
    stepLanguage: 'Idioma',
    stepName: 'O seu nome',
    languageLabel: 'Idioma do concierge',
    languageHint: 'A app e as respostas usarão este idioma.',
    languageSearch: 'Pesquisar idioma…',
    nameLabel: 'Como devemos chamar-lhe?',
    namePlaceholder: 'O seu nome ou alcunha',
    nameHint: 'O concierge irá cumprimentá-lo por este nome.',
    submit: 'Aceder ao concierge',
    loading: 'A preparar…',
    errorName: 'Introduza como quer ser chamado.',
    errorSave: 'Não foi possível guardar o perfil.',
    loadingConcierge: 'A preparar o seu concierge…',
    invalidLink: 'Ligação inválida.',
    linkUnavailable: 'Ligação indisponível',
    yourStay: 'O seu alojamento',
    online: 'online',
    ownerPersonal: 'Anfitrião · assistência pessoal',
    ownerBanner:
      'O concierge automático está em pausa. O anfitrião responderá às suas mensagens.',
    ownerLabel: 'Anfitrião',
    faqTitle: 'Perguntas frequentes',
    inputPlaceholder: 'Escreva a sua pergunta…',
    inputLabel: 'Escreva a sua pergunta',
    sendLabel: 'Enviar mensagem',
    inputHint: 'Enter para enviar · Shift+Enter para nova linha',
    sendError: 'Não foi possível enviar a mensagem. Tente novamente.',
    settingsTitle: 'Preferências',
    settingsLanguage: 'Idioma',
    settingsLanguageHint: 'Altere o idioma da app e do concierge.',
    settingsSave: 'Guardar idioma',
    settingsSaving: 'A guardar…',
    settingsSaved: 'Idioma atualizado',
    settingsClose: 'Fechar',
    openSettings: 'Idioma e preferências',
  },
}

export function obtenerCopyGuest(idioma: string): GuestUiCopy {
  const base = idioma.split('-')[0]
  return COPY[idioma] ?? COPY[base] ?? COPY.en
}

/** @deprecated Usa obtenerCopyGuest */
export function obtenerCopyOnboarding(idioma: string): GuestUiCopy {
  return obtenerCopyGuest(idioma)
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

const PREGUNTAS_RAPIDAS: Record<string, string[]> = {
  es: [
    '¿Cuál es la clave del Wi-Fi?',
    '¿Horario de check-out?',
    '¿Supermercado recomendado cerca?',
    '¿Cómo funciona la basura?',
  ],
  en: [
    'What is the Wi-Fi password?',
    'What time is check-out?',
    'Any supermarket nearby?',
    'How does trash/recycling work?',
  ],
  fr: [
    'Quel est le mot de passe Wi-Fi ?',
    'Quelle heure est le check-out ?',
    'Supermarché recommandé à proximité ?',
    'Comment fonctionnent les poubelles ?',
  ],
  de: [
    'Wie lautet das WLAN-Passwort?',
    'Wann ist Check-out?',
    'Supermarkt in der Nähe?',
    'Wie funktioniert die Müllentsorgung?',
  ],
  it: [
    'Qual è la password del Wi-Fi?',
    'A che ora è il check-out?',
    'Supermercato consigliato nelle vicinanze?',
    'Come funziona la raccolta differenziata?',
  ],
  pt: [
    'Qual é a palavra-passe do Wi-Fi?',
    'A que horas é o check-out?',
    'Supermercado recomendado perto?',
    'Como funciona o lixo/reciclagem?',
  ],
}

export function obtenerPreguntasRapidas(idioma: string): string[] {
  const base = idioma.split('-')[0]
  return PREGUNTAS_RAPIDAS[idioma] ?? PREGUNTAS_RAPIDAS[base] ?? PREGUNTAS_RAPIDAS.en
}
