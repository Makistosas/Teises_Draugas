export type Language = 'lt' | 'en';

export const translations = {
  lt: {
    // Navigation
    'nav.home': 'Pradžia',
    'nav.dashboard': 'Valdymo skydelis',
    'nav.cases': 'Mano bylos',
    'nav.newCase': 'Nauja byla',
    'nav.profile': 'Profilis',
    'nav.settings': 'Nustatymai',
    'nav.logout': 'Atsijungti',
    'nav.login': 'Prisijungti',
    'nav.register': 'Registruotis',

    // Hero section
    'hero.title': 'Jūsų teisinis draugas',
    'hero.subtitle': 'AI pagalbininkas civiliniams ginčams iki 5000 EUR',
    'hero.description':
      'Automatizuota bylų analizė, pretenzijų rašymas ir teismo dokumentų ruošimas. Greita, paprasta ir prieinama teisingumo apsauga.',
    'hero.cta': 'Pradėti nemokamai',
    'hero.learnMore': 'Sužinoti daugiau',

    // Features
    'features.title': 'Kaip tai veikia?',
    'features.analysis.title': 'Bylos analizė',
    'features.analysis.description':
      'Įkelkite įrodymus ir gaukite AI analizę su laimėjimo tikimybe',
    'features.demand.title': 'Pretenzijos siuntimas',
    'features.demand.description':
      'Automatiškai sugeneruota ir per E. pristatymą išsiųsta pretenzija',
    'features.negotiation.title': 'Derybos',
    'features.negotiation.description':
      'AI padės vesti derybas ir siūlys optimalius sprendimus',
    'features.court.title': 'Teismo byla',
    'features.court.description':
      'Vienu paspaudimu paruošti ir pateikti dokumentus teismui',

    // Case types
    'caseType.CONSUMER_DISPUTE': 'Vartotojų ginčas',
    'caseType.RENTAL_DEPOSIT': 'Nuomos užstato ginčas',
    'caseType.UNPAID_INVOICE': 'Neapmokėta sąskaita',
    'caseType.CONTRACT_BREACH': 'Sutarties pažeidimas',
    'caseType.PROPERTY_DAMAGE': 'Turto žala',
    'caseType.SERVICE_COMPLAINT': 'Paslaugų skundas',
    'caseType.EMPLOYMENT_DISPUTE': 'Darbo ginčas',
    'caseType.OTHER': 'Kita',

    // Case categories
    'caseCategory.VINTED': 'Vinted ginčas',
    'caseCategory.AIRBNB': 'Airbnb / trumpalaikė nuoma',
    'caseCategory.FREELANCE': 'Laisvai samdomas darbas',
    'caseCategory.LANDLORD_TENANT': 'Nuomotojas / nuomininkas',
    'caseCategory.ONLINE_PURCHASE': 'Pirkimas internetu',
    'caseCategory.LOCAL_SERVICE': 'Vietinės paslaugos',
    'caseCategory.OTHER': 'Kita',

    // Case status
    'caseStatus.INTAKE': 'Duomenų rinkimas',
    'caseStatus.ANALYSIS': 'Analizuojama',
    'caseStatus.DEMAND_LETTER': 'Pretenzijos etapas',
    'caseStatus.AWAITING_RESPONSE': 'Laukiama atsakymo',
    'caseStatus.NEGOTIATION': 'Derybos',
    'caseStatus.PREPARING_FILING': 'Ruošiami dokumentai',
    'caseStatus.FILED': 'Pateikta teismui',
    'caseStatus.IN_COURT': 'Teismo procesas',
    'caseStatus.RESOLVED': 'Išspręsta',
    'caseStatus.CLOSED': 'Uždaryta',

    // Timeline steps
    'step.ANALYSIS': 'Bylos analizė',
    'step.DEMAND_LETTER': 'Pretenzija',
    'step.RESPONSE': 'Atsakymas / Derybos',
    'step.COURT_FILING': 'Teismo byla',
    'step.RESOLUTION': 'Sprendimas',

    // Forms
    'form.title': 'Pavadinimas',
    'form.description': 'Aprašymas',
    'form.amount': 'Suma (EUR)',
    'form.caseType': 'Bylos tipas',
    'form.category': 'Kategorija',
    'form.opponent': 'Oponentas',
    'form.opponentName': 'Oponento vardas / pavadinimas',
    'form.opponentEmail': 'Oponento el. paštas',
    'form.opponentPhone': 'Oponento telefonas',
    'form.opponentAddress': 'Oponento adresas',
    'form.incidentDate': 'Įvykio data',
    'form.submit': 'Pateikti',
    'form.cancel': 'Atšaukti',
    'form.save': 'Išsaugoti',
    'form.next': 'Toliau',
    'form.back': 'Atgal',
    'form.upload': 'Įkelti dokumentus',
    'form.uploadHint': 'Vilkite failus čia arba paspauskite norėdami pasirinkti',

    // AI Disclaimer
    'ai.disclaimer':
      'Pastaba: Esu AI teisinis pagalbininkas, ne licencijuotas advokatas. Mano rekomendacijos paremtos algoritmais ir mokymosi duomenimis.',
    'ai.analyzing': 'Analizuoju jūsų bylą...',
    'ai.winProbability': 'Laimėjimo tikimybė',
    'ai.legalBasis': 'Teisinis pagrindas',
    'ai.recommendation': 'Rekomendacija',
    'ai.riskFactors': 'Rizikos veiksniai',

    // Demand letter
    'demand.title': 'Pretenzija',
    'demand.generate': 'Generuoti pretenziją',
    'demand.preview': 'Peržiūrėti',
    'demand.send': 'Siųsti per E. pristatymą',
    'demand.deadline': 'Atsakymo terminas',
    'demand.sent': 'Pretenzija išsiųsta',
    'demand.delivered': 'Pretenzija pristatyta',

    // Court filing
    'court.title': 'Teismo dokumentai',
    'court.paymentOrder': 'Teismo įsakymas',
    'court.smallClaim': 'Mažų sumų ginčas',
    'court.generate': 'Generuoti dokumentus',
    'court.sign': 'Pasirašyti',
    'court.submit': 'Pateikti teismui',
    'court.fee': 'Žyminis mokestis',
    'court.signWithSmartId': 'Pasirašyti su Smart-ID',
    'court.signWithMobileId': 'Pasirašyti su Mobile-ID',

    // Lawyer review
    'lawyer.requestReview': 'Užsakyti advokato peržiūrą',
    'lawyer.reviewFee': 'Peržiūros kaina',
    'lawyer.pending': 'Laukiama peržiūros',
    'lawyer.approved': 'Patvirtinta advokato',
    'lawyer.corrections': 'Siūlomi pataisymai',

    // Notifications
    'notification.caseCreated': 'Byla sukurta',
    'notification.analysisComplete': 'Analizė baigta',
    'notification.demandSent': 'Pretenzija išsiųsta',
    'notification.responseReceived': 'Gautas atsakymas',
    'notification.deadlineWarning': 'Artėja terminas',

    // Common
    'common.loading': 'Kraunama...',
    'common.error': 'Įvyko klaida',
    'common.success': 'Pavyko!',
    'common.confirm': 'Patvirtinti',
    'common.delete': 'Ištrinti',
    'common.edit': 'Redaguoti',
    'common.view': 'Peržiūrėti',
    'common.download': 'Atsisiųsti',
    'common.print': 'Spausdinti',
    'common.share': 'Dalintis',
    'common.help': 'Pagalba',
    'common.close': 'Uždaryti',
    'common.yes': 'Taip',
    'common.no': 'Ne',
    'common.or': 'arba',
    'common.and': 'ir',
    'common.eur': 'EUR',
    'common.days': 'dienos',

    // Footer
    'footer.about': 'Apie mus',
    'footer.privacy': 'Privatumo politika',
    'footer.terms': 'Naudojimo sąlygos',
    'footer.contact': 'Kontaktai',
    'footer.aiAct': 'EU AI Act atitiktis',
    'footer.disclaimer':
      'Teisės Draugas yra AI pagalbininkas, ne advokatas. Dėl sudėtingų bylų rekomenduojame konsultuotis su kvalifikuotu teisininku.',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.dashboard': 'Dashboard',
    'nav.cases': 'My Cases',
    'nav.newCase': 'New Case',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    'nav.logout': 'Log out',
    'nav.login': 'Log in',
    'nav.register': 'Register',

    // Hero section
    'hero.title': 'Your Legal Friend',
    'hero.subtitle': 'AI assistant for civil disputes up to 5000 EUR',
    'hero.description':
      'Automated case analysis, demand letter generation, and court document preparation. Fast, simple, and affordable access to justice.',
    'hero.cta': 'Start for free',
    'hero.learnMore': 'Learn more',

    // Features
    'features.title': 'How does it work?',
    'features.analysis.title': 'Case Analysis',
    'features.analysis.description':
      'Upload evidence and get AI analysis with win probability',
    'features.demand.title': 'Demand Letter',
    'features.demand.description':
      'Automatically generated and sent via E. pristatymas',
    'features.negotiation.title': 'Negotiation',
    'features.negotiation.description':
      'AI will help negotiate and suggest optimal solutions',
    'features.court.title': 'Court Filing',
    'features.court.description':
      'Prepare and submit court documents with one click',

    // Case types
    'caseType.CONSUMER_DISPUTE': 'Consumer Dispute',
    'caseType.RENTAL_DEPOSIT': 'Rental Deposit Dispute',
    'caseType.UNPAID_INVOICE': 'Unpaid Invoice',
    'caseType.CONTRACT_BREACH': 'Contract Breach',
    'caseType.PROPERTY_DAMAGE': 'Property Damage',
    'caseType.SERVICE_COMPLAINT': 'Service Complaint',
    'caseType.EMPLOYMENT_DISPUTE': 'Employment Dispute',
    'caseType.OTHER': 'Other',

    // Case categories
    'caseCategory.VINTED': 'Vinted Dispute',
    'caseCategory.AIRBNB': 'Airbnb / Short-term Rental',
    'caseCategory.FREELANCE': 'Freelance Work',
    'caseCategory.LANDLORD_TENANT': 'Landlord / Tenant',
    'caseCategory.ONLINE_PURCHASE': 'Online Purchase',
    'caseCategory.LOCAL_SERVICE': 'Local Services',
    'caseCategory.OTHER': 'Other',

    // Case status
    'caseStatus.INTAKE': 'Data Collection',
    'caseStatus.ANALYSIS': 'Analyzing',
    'caseStatus.DEMAND_LETTER': 'Demand Letter Phase',
    'caseStatus.AWAITING_RESPONSE': 'Awaiting Response',
    'caseStatus.NEGOTIATION': 'Negotiation',
    'caseStatus.PREPARING_FILING': 'Preparing Documents',
    'caseStatus.FILED': 'Filed with Court',
    'caseStatus.IN_COURT': 'Court Proceedings',
    'caseStatus.RESOLVED': 'Resolved',
    'caseStatus.CLOSED': 'Closed',

    // Timeline steps
    'step.ANALYSIS': 'Case Analysis',
    'step.DEMAND_LETTER': 'Demand Letter',
    'step.RESPONSE': 'Response / Negotiation',
    'step.COURT_FILING': 'Court Filing',
    'step.RESOLUTION': 'Resolution',

    // Forms
    'form.title': 'Title',
    'form.description': 'Description',
    'form.amount': 'Amount (EUR)',
    'form.caseType': 'Case Type',
    'form.category': 'Category',
    'form.opponent': 'Opponent',
    'form.opponentName': 'Opponent Name',
    'form.opponentEmail': 'Opponent Email',
    'form.opponentPhone': 'Opponent Phone',
    'form.opponentAddress': 'Opponent Address',
    'form.incidentDate': 'Incident Date',
    'form.submit': 'Submit',
    'form.cancel': 'Cancel',
    'form.save': 'Save',
    'form.next': 'Next',
    'form.back': 'Back',
    'form.upload': 'Upload Documents',
    'form.uploadHint': 'Drag files here or click to select',

    // AI Disclaimer
    'ai.disclaimer':
      'Note: I am an AI legal assistant, not a licensed attorney. My recommendations are based on algorithms and training data.',
    'ai.analyzing': 'Analyzing your case...',
    'ai.winProbability': 'Win Probability',
    'ai.legalBasis': 'Legal Basis',
    'ai.recommendation': 'Recommendation',
    'ai.riskFactors': 'Risk Factors',

    // Demand letter
    'demand.title': 'Demand Letter',
    'demand.generate': 'Generate Demand Letter',
    'demand.preview': 'Preview',
    'demand.send': 'Send via E. pristatymas',
    'demand.deadline': 'Response Deadline',
    'demand.sent': 'Demand Letter Sent',
    'demand.delivered': 'Demand Letter Delivered',

    // Court filing
    'court.title': 'Court Documents',
    'court.paymentOrder': 'Payment Order',
    'court.smallClaim': 'Small Claims',
    'court.generate': 'Generate Documents',
    'court.sign': 'Sign',
    'court.submit': 'Submit to Court',
    'court.fee': 'Court Fee',
    'court.signWithSmartId': 'Sign with Smart-ID',
    'court.signWithMobileId': 'Sign with Mobile-ID',

    // Lawyer review
    'lawyer.requestReview': 'Request Lawyer Review',
    'lawyer.reviewFee': 'Review Fee',
    'lawyer.pending': 'Review Pending',
    'lawyer.approved': 'Approved by Lawyer',
    'lawyer.corrections': 'Suggested Corrections',

    // Notifications
    'notification.caseCreated': 'Case Created',
    'notification.analysisComplete': 'Analysis Complete',
    'notification.demandSent': 'Demand Letter Sent',
    'notification.responseReceived': 'Response Received',
    'notification.deadlineWarning': 'Deadline Approaching',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.success': 'Success!',
    'common.confirm': 'Confirm',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.download': 'Download',
    'common.print': 'Print',
    'common.share': 'Share',
    'common.help': 'Help',
    'common.close': 'Close',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.or': 'or',
    'common.and': 'and',
    'common.eur': 'EUR',
    'common.days': 'days',

    // Footer
    'footer.about': 'About Us',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    'footer.contact': 'Contact',
    'footer.aiAct': 'EU AI Act Compliance',
    'footer.disclaimer':
      'Teisės Draugas is an AI assistant, not a lawyer. For complex cases, we recommend consulting a qualified attorney.',
  },
} as const;

export type TranslationKey = keyof (typeof translations)['lt'];
