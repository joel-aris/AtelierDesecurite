export const assets = {
  logo: '/assets/sec.png',
  hero: '/assets/oklm.jpg',
  password: '/assets/genpass.jpg',
  file: '/assets/audit.jpg',
  https: '/assets/htts.jpg',
  phishing: '/assets/phishing.jpg',
  audit: '/assets/audit2.jpg',
};

export const toolCards = [
  {
    id: 'password',
    title: 'Générateur de mots de passe',
    text: 'Mots de passe et passphrases avec entropie, batch et historique de session.',
    image: assets.password,
  },
  {
    id: 'file',
    title: 'Analyseur de fichiers',
    text: 'Hashs, MIME réel, métadonnées et signatures suspectes depuis un dépôt drag and drop.',
    image: assets.file,
  },
  {
    id: 'https',
    title: 'Vérificateur HTTPS',
    text: 'Certificats, versions TLS, headers de sécurité et score synthétique.',
    image: assets.https,
  },
  {
    id: 'phishing',
    title: 'Détecteur de phishing',
    text: 'Analyse heuristique des URLs et emails avec justification des facteurs de risque.',
    image: assets.phishing,
  },
  {
    id: 'incidents',
    title: 'Journal d’incidents',
    text: 'CRUD local, filtres, timeline de statut et exports CSV/JSON.',
    image: assets.audit,
  },
  {
    id: 'audit',
    title: 'Audit de sécurité',
    text: 'Checklist multi-catégories, score, recommandations et rapport final.',
    image: assets.hero,
  },
  {
    id: 'totp',
    title: 'Générateur 2FA',
    text: 'Secret TOTP, URI otpauth et vérification pédagogique d’un code à 6 chiffres.',
    image: assets.logo,
  },
  {
    id: 'hash',
    title: 'Identificateur de hash',
    text: 'Reconnaissance probable MD5, SHA, bcrypt, Argon2 et formats hexadécimaux.',
    image: assets.file,
  },
  {
    id: 'breach',
    title: 'Breach check',
    text: 'Interface prête pour Have I Been Pwned en k-anonymity côté backend.',
    image: assets.password,
  },
  {
    id: 'dashboard',
    title: 'Tableau de bord personnel',
    text: 'Synthèse des analyses, incidents ouverts, dernier audit et score global.',
    image: assets.audit,
  },
];

export const knownDomains = ['google.com', 'microsoft.com', 'apple.com', 'paypal.com', 'amazon.com', 'facebook.com', 'github.com'];

export const auditCategories = {
  'Comptes et mots de passe': ['MFA activée', 'Gestionnaire de mots de passe', 'Politique de rotation documentée'],
  'Mises à jour système': ['Postes à jour', 'Serveurs patchés', 'Inventaire applicatif maintenu'],
  Sauvegardes: ['Sauvegardes chiffrées', 'Test de restauration récent', 'Copie hors site'],
  Réseau: ['Wi-Fi invité isolé', 'Pare-feu documenté', 'Journalisation centralisée'],
  Sensibilisation: ['Formation phishing', 'Procédure de signalement', 'Exercices réguliers'],
  'Contrôle d’accès': ['Principe du moindre privilège', 'Comptes inactifs désactivés', 'Revue trimestrielle'],
};
