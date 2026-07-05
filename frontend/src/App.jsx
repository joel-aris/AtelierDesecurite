import { useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clipboard,
  Download,
  FileSearch,
  Fingerprint,
  Gauge,
  GlobeLock,
  KeyRound,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Menu,
  Moon,
  QrCode,
  Search,
  Shield,
  ShieldAlert,
  Sun,
  UserCircle,
  X,
} from 'lucide-react';
import { api, authStore } from './lib/api.js';
import { assets, auditCategories, toolCards } from './data/content.js';

function App() {
  const [user, setUser] = useState(authStore.current());
  const [theme, setTheme] = useState(localStorage.getItem('secureOfficeTheme') || 'light');

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('secureOfficeTheme', next);
  }

  return (
    <div data-theme={theme}>
    <Routes>
      <Route path="/" element={<PublicLayout user={user} setUser={setUser} theme={theme} toggleTheme={toggleTheme}><Home user={user} /></PublicLayout>} />
      <Route path="/tools" element={<PublicLayout user={user} setUser={setUser} theme={theme} toggleTheme={toggleTheme}><Tools user={user} /></PublicLayout>} />
      <Route path="/admin-login" element={<AdminLogin setUser={setUser} />} />
      <Route path="/admin" element={<AdminGuard user={user}><AdminLayout setUser={setUser} /></AdminGuard>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </div>
  );
}

function PublicLayout({ children, user, setUser, theme, toggleTheme }) {
  const [open, setOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className="app-shell">
      <header className="site-header">
        <Link className="brand" to="/">
          <img src={assets.logo} alt="SECURE OFFICE" />
          <span>SECURE OFFICE</span>
        </Link>
        <button className="icon-button mobile-only" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
        <nav className={open ? 'nav open' : 'nav'}>
          <Link to="/">Accueil</Link>
          <Link to="/tools">Outils</Link>
          <button className="icon-button" onClick={toggleTheme} aria-label="Changer de thème">
            {theme === 'dark' ? <Sun /> : <Moon />}
          </button>
          <button className="account-button" onClick={() => setAuthOpen(true)}>
            <UserCircle size={18} />
            {user ? user.name : 'Invité'}
          </button>
        </nav>
      </header>
      {children}
      {authOpen && <AuthPanel user={user} setUser={setUser} close={() => setAuthOpen(false)} />}
      <footer className="footer">
        <div className="footer-top">
          <img src={assets.logo} alt="SECURE OFFICE" />
          <span>SECURE OFFICE</span>
        </div>
        <nav className="footer-nav">
          <Link to="/">Accueil</Link>
          <Link to="/tools">Outils</Link>
        </nav>
        <div className="footer-info">
          <span>© {new Date().getFullYear()} SECURE OFFICE. Tous droits réservés.</span>
          <span>API Laravel PostgreSQL</span>
          <span>Plateforme professionnelle de cybersécurité</span>
        </div>
      </footer>
    </div>
  );
}

function AuthPanel({ user, setUser, close }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const { data } = await api.post(endpoint, form);
      setUser(authStore.saveSession(data));
      close();
    } catch (err) {
      setError(err.response?.data?.message || 'Backend indisponible ou informations invalides.');
    }
  }

  async function logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // Token cleanup remains local if the API is offline.
    }
    authStore.clear();
    setUser(null);
    close();
  }

  return (
    <div className="modal-backdrop">
      <section className="auth-panel">
        <button className="icon-button modal-close" onClick={close} aria-label="Fermer"><X /></button>
        {user ? (
          <>
            <span className="eyebrow">Compte connecté</span>
            <h2>{user.name}</h2>
            <p>{user.email} · rôle {user.role}</p>
            <button className="primary-button" onClick={logout}><LogOut size={18} /> Déconnexion</button>
          </>
        ) : (
          <>
            <span className="eyebrow">Espace sécurisé</span>
            <h2>{mode === 'login' ? 'Connexion' : 'Créer un compte'}</h2>
            <p>Connectez-vous à un compte existant ou créez un espace utilisateur pour conserver vos analyses.</p>
            <form className="auth-form" onSubmit={submit}>
              {mode === 'register' && <input placeholder="Nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />}
              <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input type="password" placeholder="Mot de passe" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              {error && <p className="alert">{error}</p>}
              <button className="primary-button">{mode === 'login' ? 'Se connecter' : 'Créer le compte'}</button>
            </form>
            <button className="secondary-button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
              {mode === 'login' ? 'Créer un compte' : 'J’ai déjà un compte'}
            </button>
          </>
        )}
      </section>
    </div>
  );
}

function Home({ user }) {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Plateforme cybersécurité</span>
          <h1>SECURE OFFICE</h1>
          <p>
            Une suite professionnelle pour analyser, vérifier, documenter et renforcer la sécurité d’un environnement bureautique.
          </p>
          <div className="hero-actions">
            <Link className="primary-button" to="/tools"><Shield size={18} /> Ouvrir les outils</Link>
            <a className="secondary-button" href="#showcase">Voir le périmètre</a>
          </div>
          <p className="session-note">{user ? `Session active: ${user.email}` : 'Accès immédiat aux outils avec conservation locale invitée.'}</p>
        </div>
        <div className="hero-media">
          <img src={assets.hero} alt="Tableau de bord SECURE OFFICE" />
        </div>
      </section>

      <section className="section" id="showcase">
        <div className="section-heading">
          <span className="eyebrow">Modules</span>
          <h2>Un menu principal, dix capacités opérationnelles</h2>
        </div>
        <div className="feature-grid">
          {toolCards.map((tool) => (
            <article className="feature-card" key={tool.id}>
              <img src={tool.image} alt="" />
              <h3>{tool.title}</h3>
              <p>{tool.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="showcase">
        <img src={assets.audit} alt="Illustration d'audit de sécurité" />
        <div>
          <span className="eyebrow">Architecture de confiance</span>
          <h2>Audits, incidents et preuves restent lisibles</h2>
          <p>
            Les écrans privilégient des données actionnables, des scores explicables et des exports exploitables.
          </p>
        </div>
      </section>

<section className="faq">
         <h2>FAQ</h2>
         <details open>
           <summary>Quelles sont les capacités d'analyse de fichiers disponibles ?</summary>
           <p>L'analyseur calcule les hashs MD5, SHA1, SHA256 et SHA512, détecte le MIME réel, examine les métadonnées et vérifie les signatures connues dans une base de hashs malveillants.</p>
         </details>
         <details>
           <summary>Comment fonctionne l'audit de sécurité ?</summary>
           <p>L'audit couvre 6 catégories (comptes, mises à jour, sauvegardes, réseau, sensibilisation, contrôle d'accès) avec 18 critères évaluables, calcul d'un score global et génération de recommandations personnalisées.</p>
         </details>
         <details>
           <summary>Puis-je vérifier la sécurité d'un site web ?</summary>
           <p>Le vérificateur HTTPS analyse les certificats, versions TLS supportées, headers de sécurité et calcule un score synthétique pour évaluer la configuration HTTPS d'un hébergeur.</p>
         </details>
         <details>
           <summary>Le générateur de mots de passe est-il sûr ?</summary>
           <p>Il génère localement des mots de passe avec calcul d'entropie en temps réel, support du mode passphrase Diceware, et option d'export PDF/CSV/HTML pour une utilisation hors ligne.</p>
         </details>
       </section>
    </>
  );
}

function Tools() {
  const [active, setActive] = useState('dashboard');
  const current = toolCards.find((tool) => tool.id === active);
  const panel = {
    dashboard: <Dashboard />,
    password: <PasswordGenerator />,
    file: <FileAnalyzer />,
    https: <HttpsChecker />,
    phishing: <PhishingDetector />,
    incidents: <IncidentJournal />,
    audit: <SecurityAudit />,
    totp: <TotpTool />,
    hash: <HashIdentifier />,
    breach: <BreachCheck />,
  }[active];

  return (
    <main className="tool-page">
      <aside className="tool-sidebar">
        <div className="sidebar-title">
          <LayoutDashboard size={18} />
          <span>Menu principal</span>
        </div>
        {toolCards.map((tool) => (
          <button className={active === tool.id ? 'tool-tab active' : 'tool-tab'} key={tool.id} onClick={() => setActive(tool.id)}>
            <img src={tool.image} alt="" />
            <span>{tool.title}</span>
          </button>
        ))}
      </aside>
      <section className="tool-workspace">
        <div className="workspace-heading">
          <div>
            <span className="eyebrow">Interface utilisateur</span>
            <h1>{current.title}</h1>
          </div>
          <img src={current.image} alt="" />
        </div>
        {panel}
      </section>
    </main>
  );
}

function Dashboard() {
  const [data, setData] = useState({ file_analyses: 0, open_incidents: 0, last_audit_score: null, security_score: 0 });
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard')
      .then((response) => setData(response.data))
      .catch(() => setError('Impossible de charger les données du tableau de bord.'));
  }, []);

  const metrics = [
    ['Analyses fichiers', data.file_analyses, FileSearch],
    ['Incidents ouverts', data.open_incidents, ShieldAlert],
    ['Dernier audit', data.last_audit_score ? `${data.last_audit_score}%` : 'Aucun', Gauge],
    ['Score agrégé', `${data.security_score}%`, BarChart3],
  ];
  return (
    <>
      {error && <div className="alert-banner">{error}</div>}
      <div className="metric-grid">
        {metrics.map(([label, value, Icon]) => (
          <article className="metric-card" key={label}>
            <Icon />
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>
    </>
  );
}

function PasswordGenerator() {
  const [settings, setSettings] = useState({ length: 18, upper: true, lower: true, digits: true, symbols: true, ambiguous: true, batch: 4, passphrase: false });
  const [items, setItems] = useState([]);
  const [apiResult, setApiResult] = useState(null);
  const [error, setError] = useState('');

  const poolSize = (settings.upper ? 26 : 0) + (settings.lower ? 26 : 0) + (settings.digits ? 10 : 0) + (settings.symbols ? 28 : 0) - (settings.ambiguous ? 6 : 0);
  const entropy = Math.max(1, Math.round((settings.passphrase ? settings.batch * Math.log2(7776) : settings.length * Math.log2(Math.max(poolSize, 2))) * 10) / 10);
  const strength = entropy > 120 ? 'excellent' : entropy > 80 ? 'fort' : entropy > 45 ? 'moyen' : 'faible';
  const crack = entropy > 100 ? 'plusieurs siècles' : entropy > 70 ? 'plusieurs années' : entropy > 45 ? 'quelques semaines' : 'quelques heures';

  async function generate() {
    setError('');
    try {
      const { data } = await api.post('/tools/password', settings);
      setApiResult(data);
      setItems(data.items || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Le générateur backend est indisponible.');
    }
  }

  return (
    <div className="tool-grid">
      <div className="control-panel">
        <label>Longueur <output>{settings.length}</output></label>
        <input type="range" min="8" max="64" value={settings.length} onChange={(e) => setSettings({ ...settings, length: Number(e.target.value) })} />
        {[
          ['upper', 'Majuscules'],
          ['lower', 'Minuscules'],
          ['digits', 'Chiffres'],
          ['symbols', 'Symboles'],
          ['ambiguous', 'Exclure les caractères ambigus'],
          ['passphrase', 'Mode passphrase Diceware'],
        ].map(([key, label]) => (
          <label className="check-row" key={key}>
            <input type="checkbox" checked={settings[key]} onChange={(e) => setSettings({ ...settings, [key]: e.target.checked })} />
            {label}
          </label>
        ))}
        <label>Batch <input type="number" min="1" max="12" value={settings.batch} onChange={(e) => setSettings({ ...settings, batch: Number(e.target.value) })} /></label>
        <button className="primary-button" onClick={generate}><KeyRound size={18} /> Générer</button>
      </div>
      <div className="result-panel">
        {error && <p className="alert">{error}</p>}
        <div className={`strength ${apiResult?.strength || strength}`}><span style={{ width: `${Math.min(100, apiResult?.entropy || entropy)}%` }} /></div>
        <p><strong>{apiResult?.entropy || entropy} bits</strong> · force {apiResult?.strength || strength} · crack estimé: {apiResult?.crack_time || crack}</p>
        {items.map((item) => (
          <div className="password-row" key={item}>
            <code>{item}</code>
            <button className="icon-button" onClick={() => navigator.clipboard?.writeText(item)} aria-label="Copier"><Clipboard /></button>
          </div>
        ))}
        {items.length > 0 && (
          <div className="hero-actions" style={{ marginTop: 16 }}>
            <button className="secondary-button" onClick={() => exportPdf()}><Download size={18} /> PDF</button>
            <button className="secondary-button" onClick={() => exportExcel()}><Download size={18} /> Excel/CSV</button>
          </div>
        )}
      </div>
    </div>
  );

  async function exportPdf() {
    try {
      const { data } = await api.post('/exports/password/pdf', { passwords: items, settings: { entropy, strength } }, { responseType: 'blob' });
      const url = URL.createObjectURL(data);
      Object.assign(document.createElement('a'), { href: url, download: 'mots-de-passe.pdf' }).click();
      URL.revokeObjectURL(url);
    } catch {
      exportAsHtml();
    }
  }

  async function exportExcel() {
    const csv = `Mot de passe,Entropie (${entropy} bits),Force (${strength})\n${items.map(p => `"${p}"`).join('\n')}`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    Object.assign(document.createElement('a'), { href: url, download: 'mots-de-passe.csv' }).click();
    URL.revokeObjectURL(url);
  }

  function exportAsHtml() {
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
body { font-family: Inter, system-ui, sans-serif; margin: 40px; }
h1 { font-weight: 760; }
pre { background: #f5f5f7; padding: 20px; border-radius: 8px; font-size: 16px; }
.meta { color: #666; }
</style>
</head><body>
<h1>Générateur de mots de passe - Rapport</h1>
<p class="meta">Entropie: ${entropy} bits | Force: ${strength}</p>
<pre>${items.join('\n')}</pre>
<p style="margin-top:20px; font-size:12px; color:#666;">SECURE OFFICE - ${new Date().toLocaleDateString()}</p>
</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    Object.assign(document.createElement('a'), { href: url, download: 'mots-de-passe.html' }).click();
    URL.revokeObjectURL(url);
  }
}

function FileAnalyzer() {
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');

  async function analyze(file) {
    if (!file) return;
    setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      const { data } = await api.post('/tools/file', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setReport(data);
    } catch (err) {
      setReport(null);
      setError(err.response?.data?.message || 'Analyse impossible: API fichier indisponible.');
    }
  }

  return (
    <div className="tool-grid">
      <label className="drop-zone">
        <FileSearch size={42} />
        <span>Déposer ou sélectionner un fichier</span>
        <input type="file" onChange={(e) => analyze(e.target.files[0])} />
      </label>
      {error ? <div className="empty-state">{error}</div> : <ReportViewer report={report} />}
    </div>
  );
}

function ReportViewer({ report }) {
  if (!report) return <div className="empty-state">Aucun rapport généré.</div>;

  async function exportPdf() {
    try {
      const { data } = await api.post('/exports/file/pdf', { report }, { responseType: 'blob' });
      const url = URL.createObjectURL(data);
      Object.assign(document.createElement('a'), { href: url, download: `${report.name}-rapport.pdf` }).click();
      URL.revokeObjectURL(url);
    } catch {
      exportAsHtml();
    }
  }

  async function exportExcel() {
    try {
      const { data } = await api.post('/exports/file/excel', { report });
      const url = URL.createObjectURL(new Blob([data], { type: 'text/csv' }));
      Object.assign(document.createElement('a'), { href: url, download: `${report.name}-rapport.csv` }).click();
      URL.revokeObjectURL(url);
    } catch {
      exportAsCsv();
    }
  }

  function exportAsCsv() {
    const csv = `Champ,Valeur
Nom,${report.name}
Taille,${report.size}
Extension,${report.declared_extension}
MIME,${report.real_mime}
MD5,${report.hashes?.md5 || ''}
SHA1,${report.hashes?.sha1 || ''}
SHA256,${report.hashes?.sha256 || ''}
SHA512,${report.hashes?.sha512 || ''}`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    Object.assign(document.createElement('a'), { href: url, download: `${report.name}-rapport.csv` }).click();
    URL.revokeObjectURL(url);
  }

  function exportAsHtml() {
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
body { font-family: Inter, system-ui, sans-serif; margin: 40px; }
h1 { font-weight: 760; }
dl { display: grid; grid-template-columns: 160px 1fr; gap: 8px; }
dt { font-weight: 700; color: #666; }
pre { background: #f5f5f7; padding: 16px; border-radius: 8px; }
</style>
</head><body>
<h1>Rapport d'analyse de fichier</h1>
<dl>
  <dt>Nom</dt><dd>${report.name}</dd>
  <dt>Taille</dt><dd>${report.size}</dd>
  <dt>Extension</dt><dd>${report.declared_extension}</dd>
  <dt>MIME</dt><dd>${report.real_mime}</dd>
</dl>
<h2>Hashs</h2><pre>${JSON.stringify(report.hashes, null, 2)}</pre>
<p style="color:#d32f2f;">⚠️ Incohérence ou signature suspecte détectée.</p>
<p style="margin-top:20px; font-size:12px; color:#666;">SECURE OFFICE - ${new Date().toLocaleDateString()}</p>
</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    Object.assign(document.createElement('a'), { href: url, download: `${report.name}-rapport.html` }).click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="result-panel">
      {(report.mismatch || report.malicious_match || report.suspicious_signatures?.length > 0) && <p className="alert"><AlertTriangle size={18} /> Incohérence ou signature suspecte détectée.</p>}
      <dl className="report-list">
        {Object.entries(report).filter(([, value]) => typeof value !== 'object').map(([key, value]) => <><dt key={`${key}-d`}>{key}</dt><dd key={key}>{String(value)}</dd></>)}
      </dl>
      <pre>{JSON.stringify(report.hashes, null, 2)}</pre>
      <div className="hero-actions" style={{ marginTop: 16 }}>
        <button className="secondary-button" onClick={exportPdf}><Download size={18} /> PDF</button>
        <button className="secondary-button" onClick={exportExcel}><Download size={18} /> Excel/CSV</button>
      </div>
    </div>
  );
}

function HttpsChecker() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function check() {
    setError('');
    try {
      const { data } = await api.post('/tools/https', { target: url });
      setResult({
        ...data,
        certificate: data.certificate?.valid ? `${data.certificate.issuer || 'CA'} · expiration ${data.certificate.valid_to || 'inconnue'}` : 'Certificat non vérifié',
      });
    } catch (err) {
      setResult(null);
      setError(err.response?.data?.message || 'Vérification HTTPS indisponible.');
    }
  }

  return (
    <div className="tool-stack">
      <div className="inline-form">
        <GlobeLock />
        <input value={url} onChange={(e) => setUrl(e.target.value)} />
        <button className="primary-button" onClick={check}>Vérifier</button>
      </div>
      {error && <div className="empty-state">{error}</div>}
      {result && <div className="result-panel">
        <h3>Score {result.score}</h3>
        <p>{result.host} · {result.certificate}</p>
        <div className="pill-row">{result.tls.map((item) => <span className="pill" key={item}>{item}</span>)}</div>
        <div className="header-grid">{result.headers.map((h) => <span className={h.ok ? 'ok' : 'ko'} key={h.header}>{h.ok ? <CheckCircle2 /> : <AlertTriangle />} {h.header}</span>)}</div>
      </div>}
    </div>
  );
}

function PhishingDetector() {
  const [input, setInput] = useState('');
  const [email, setEmail] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');

  async function run() {
    setError('');
    try {
      const { data } = await api.post('/tools/phishing', { url: input, email_text: email });
      setAnalysis(data);
    } catch (err) {
      setAnalysis(null);
      setError(err.response?.data?.message || 'Analyse phishing indisponible.');
    }
  }

  return (
    <div className="tool-grid">
      <div className="control-panel">
        <label>URL <input value={input} onChange={(e) => setInput(e.target.value)} /></label>
        <label>Email <textarea value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <button className="primary-button" onClick={run}><ShieldAlert size={18} /> Analyser</button>
      </div>
      <div className="result-panel">
        {error && <p className="alert">{error}</p>}
        {analysis ? (
          <>
            <h3>Risque {analysis.label}</h3>
            <div className={`risk-meter ${analysis.label}`}><span style={{ width: `${analysis.score}%` }} /></div>
            {analysis.reasons.map((reason) => <p className="factor" key={reason}><ShieldAlert size={17} /> {reason}</p>)}
          </>
        ) : <p className="muted">Lancez l'analyse pour obtenir une évaluation par mots-clés, homographes et facteurs de risque.</p>}
      </div>
    </div>
  );
}

function IncidentJournal() {
  const [incidents, setIncidents] = useState([]);
  const [draft, setDraft] = useState({ title: '', category: 'phishing', severity: 'faible', status: 'ouvert', date: new Date().toISOString().slice(0, 10) });
  const [filter, setFilter] = useState('');
  const [error, setError] = useState('');
  const filtered = incidents.filter((item) => JSON.stringify(item).toLowerCase().includes(filter.toLowerCase()));

  useEffect(() => {
    api.get('/incidents')
      .then((response) => setIncidents(response.data.data || []))
      .catch(() => setError('Impossible de charger le journal d’incidents.'));
  }, []);

  async function addIncident() {
    if (!draft.title.trim()) return;
    setError('');
    try {
      const { data } = await api.post('/incidents', { ...draft, incident_date: draft.date });
      setIncidents([data, ...incidents]);
    } catch (err) {
      setError(err.response?.data?.message || 'Création impossible.');
    }
    setDraft({ ...draft, title: '' });
  }

  return (
    <div className="tool-stack">
      <div className="incident-form">
        <input placeholder="Titre" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
        {['category', 'severity', 'status'].map((key) => (
          <select key={key} value={draft[key]} onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}>
            {(key === 'category' ? ['phishing', 'malware', 'fuite de données', 'accès non autorisé', 'autre'] : key === 'severity' ? ['faible', 'moyen', 'élevé', 'critique'] : ['ouvert', 'en cours', 'résolu']).map((v) => <option key={v}>{v}</option>)}
          </select>
        ))}
        <input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
        <button className="primary-button" onClick={addIncident}>Créer</button>
      </div>
      {error && <div className="alert-banner">{error}</div>}
      <div className="inline-form"><Search /><input placeholder="Filtrer le journal" value={filter} onChange={(e) => setFilter(e.target.value)} /></div>
      <div className="table-card">
        {filtered.map((incident) => (
          <div className="table-row" key={incident.id}>
            <strong>{incident.title}</strong>
            <span>{incident.category}</span>
            <span className={`severity ${incident.severity}`}>{incident.severity}</span>
            <select value={incident.status} onChange={(e) => setIncidents(incidents.map((item) => item.id === incident.id ? { ...item, status: e.target.value } : item))}>
              <option>ouvert</option><option>en cours</option><option>résolu</option>
            </select>
            <button className="icon-button" onClick={() => setIncidents(incidents.filter((item) => item.id !== incident.id))}><X /></button>
          </div>
        ))}
      </div>
      <div className="hero-actions" style={{ marginTop: 16 }}>
        <button className="secondary-button" onClick={exportPdf} disabled={!filtered.length}><Download size={18} /> PDF</button>
        <button className="secondary-button" onClick={exportExcel} disabled={!filtered.length}><Download size={18} /> Excel/CSV</button>
      </div>
    </div>
  );

  async function exportPdf() {
    try {
      const { data } = await api.post('/exports/incidents/pdf', { incidents: filtered }, { responseType: 'blob' });
      const url = URL.createObjectURL(data);
      Object.assign(document.createElement('a'), { href: url, download: 'journal-incidents.pdf' }).click();
      URL.revokeObjectURL(url);
    } catch {
      exportAsHtml();
    }
  }

  async function exportExcel() {
    const csv = `Titre,Catégorie,Sévérité,Statut,Date
${filtered.map(i => `"${i.title}",${i.category},${i.severity},${i.status},${i.incident_date || i.date || ''}`).join('\n')}`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    Object.assign(document.createElement('a'), { href: url, download: 'journal-incidents.csv' }).click();
    URL.revokeObjectURL(url);
  }

  function exportAsHtml() {
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
body { font-family: Inter, system-ui, sans-serif; margin: 40px; }
h1 { font-weight: 760; }
table { width: 100%; border-collapse: collapse; margin: 12px 0; }
th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
th { background: #f5f5f7; font-weight: 700; }
</style>
</head><body>
<h1>Journal des incidents</h1>
<table><tr><th>Titre</th><th>Catégorie</th><th>Sévérité</th><th>Statut</th></tr>
${filtered.map(i => `<tr><td>${i.title}</td><td>${i.category}</td><td>${i.severity}</td><td>${i.status}</td></tr>`).join('')}
</table>
<p style="margin-top:20px; font-size:12px; color:#666;">SECURE OFFICE - ${new Date().toLocaleDateString()}</p>
</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    Object.assign(document.createElement('a'), { href: url, download: 'journal-incidents.html' }).click();
    URL.revokeObjectURL(url);
  }
}

function SecurityAudit() {
  const [answers, setAnswers] = useState({});
  const [status, setStatus] = useState('');
  const [savedAudit, setSavedAudit] = useState(null);
  const total = Object.values(auditCategories).flat().length;
  const ok = Object.values(answers).filter((value) => value === 'conforme' || value === 'na').length;
  const score = Math.round((ok / total) * 100);
  const recommendations = Object.entries(answers).filter(([, value]) => value === 'non conforme').map(([key]) => `Corriger: ${key}`);

  async function saveAudit() {
    const grouped = Object.fromEntries(Object.entries(auditCategories).map(([category, items]) => [
      category,
      Object.fromEntries(items.map((item) => [item, answers[item] || ''])),
    ]));
    try {
      const { data } = await api.post('/audits', { title: 'Audit de sécurité', answers: grouped });
      setSavedAudit(data);
      setStatus('Audit enregistré.');
    } catch (err) {
      setStatus(err.response?.data?.message || 'Enregistrement impossible.');
    }
  }

  async function exportPdf() {
    if (!savedAudit) return;
    try {
      const { data } = await api.post('/exports/audit/pdf', { audit: savedAudit }, { responseType: 'blob' });
      const url = URL.createObjectURL(data);
      Object.assign(document.createElement('a'), { href: url, download: 'audit-securite.pdf' }).click();
      URL.revokeObjectURL(url);
    } catch {
      exportAsHtml();
    }
  }

  function exportAsHtml() {
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
body { font-family: Inter, system-ui, sans-serif; margin: 40px; color: #050505; }
h1 { font-weight: 760; }
table { width: 100%; border-collapse: collapse; margin: 12px 0; }
th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
th { background: #f5f5f7; font-weight: 700; }
.score { background: #050505; color: white; padding: 4px 12px; border-radius: 20px; font-weight: 700; }
</style>
</head><body>
<h1>Audit de sécurité</h1>
<p><strong>Titre:</strong> Audit de sécurité</p>
<div class="score">Score global: ${score}%</div>
<h2>Détails par catégorie</h2>
<table><tr><th>Catégorie</th><th>Score</th></tr>
${Object.entries(auditCategories).map(([cat]) => `<tr><td>${cat}</td><td>${Math.round(score / Object.keys(auditCategories).length)}%</td></tr>`).join('')}
</table>
${recommendations.length ? `<h2>Recommandations</h2><ul>${recommendations.map(r => `<li>${r}</li>`).join('')}</ul>` : ''}
<p style="margin-top:20px; font-size:12px; color:#666;">SECURE OFFICE - ${new Date().toLocaleDateString()}</p>
</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    Object.assign(document.createElement('a'), { href: url, download: 'audit-securite.html' }).click();
    URL.revokeObjectURL(url);
  }

  async function exportExcel() {
    const csv = `Catégorie,Critère,Statut
${Object.entries(auditCategories).flatMap(([cat, items]) =>
  items.map(item => `${cat},${item},${answers[item] || ''}`)
).join('\n')}`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    Object.assign(document.createElement('a'), { href: url, download: 'audit-securite.csv' }).click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="tool-stack">
      <div className="score-band"><Gauge /> Score global <strong>{score}%</strong></div>
      {Object.entries(auditCategories).map(([category, items]) => (
        <section className="audit-section" key={category}>
          <h3>{category}</h3>
          {items.map((item) => (
            <div className="audit-row" key={item}>
              <span>{item}</span>
              <select value={answers[item] || ''} onChange={(e) => setAnswers({ ...answers, [item]: e.target.value })}>
                <option value="">À évaluer</option>
                <option value="conforme">conforme</option>
                <option value="non conforme">non conforme</option>
                <option value="na">non applicable</option>
              </select>
              <input placeholder="Commentaire" />
            </div>
          ))}
        </section>
      ))}
      <div className="result-panel">
        <h3>Recommandations</h3>
        {(recommendations.length ? recommendations : ['Aucune non-conformité renseignée.']).map((item) => <p key={item}>{item}</p>)}
        <div className="hero-actions" style={{ marginTop: 16 }}>
          <button className="secondary-button" onClick={saveAudit}><Download size={18} /> Enregistrer l'audit</button>
          <button className="secondary-button" onClick={exportPdf} disabled={!savedAudit}><Download size={18} /> PDF</button>
          <button className="secondary-button" onClick={exportExcel}><Download size={18} /> Excel/CSV</button>
        </div>
{status && <p className="muted">{status}</p>}
    </div>
  </div>
);
}

function TotpTool() {
  const [secret, setSecret] = useState('');
  const [uri, setUri] = useState('');
  const [code, setCode] = useState('');
  const [valid, setValid] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    refreshSecret();
  }, []);

  async function refreshSecret() {
    setError('');
    try {
      const { data } = await api.get('/tools/totp');
      setSecret(data.secret);
      setUri(data.otpauth_uri);
    } catch (err) {
      setError(err.response?.data?.message || 'Génération TOTP indisponible.');
    }
  }
  async function verify() {
    setError('');
    try {
      const { data } = await api.post('/tools/totp/verify', { secret, code });
      setValid(data.valid);
    } catch (err) {
      setValid(false);
      setError(err.response?.data?.message || 'Vérification TOTP indisponible.');
    }
  }
  return (
    <div className="tool-grid">
      <div className="qr-box"><QrCode size={88} /><code>{secret}</code></div>
      <div className="result-panel">
        <p>{uri}</p>
        <input maxLength="6" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Code 6 chiffres" />
        <div className="hero-actions"><button className="secondary-button" onClick={refreshSecret}>Nouveau secret</button><button className="primary-button" onClick={verify}>Vérifier</button></div>
        {error && <p className="alert">{error}</p>}
        {valid !== null && <p className={valid ? 'ok-text' : 'muted'}>{valid ? 'Code valide' : 'Code invalide'}</p>}
      </div>
    </div>
  );
}

function HashIdentifier() {
  const [hash, setHash] = useState('');
  const [types, setTypes] = useState([]);
  const [error, setError] = useState('');
  async function identify() {
    setError('');
    try {
      const { data } = await api.post('/tools/hash', { hash });
      setTypes(data.candidates || []);
    } catch (err) {
      setTypes([]);
      setError(err.response?.data?.message || 'Identification indisponible.');
    }
  }
  return (
    <div className="tool-stack">
      <textarea value={hash} onChange={(e) => setHash(e.target.value.trim())} placeholder="Coller un hash" />
      <button className="primary-button" onClick={identify}><Fingerprint size={18} /> Identifier</button>
      {error && <p className="alert">{error}</p>}
      <div className="pill-row">{(types.length ? types : ['Format inconnu']).map((type) => <span className="pill" key={type}><Fingerprint size={16} /> {type}</span>)}</div>
    </div>
  );
}

function BreachCheck() {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState(null);
  async function check() {
    try {
      const { data } = await api.post('/tools/breach', { value });
      setStatus(data.type === 'password' ? `Mot de passe trouvé ${data.count} fois.` : data.message);
    } catch (err) {
      setStatus(err.response?.data?.message || 'Vérification indisponible.');
    }
  }
  return (
    <div className="tool-stack">
      <div className="inline-form"><LockKeyhole /><input type="password" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Mot de passe ou email" /><button className="primary-button" onClick={check}>Vérifier</button></div>
      {status && <div className="result-panel">{status}</div>}
    </div>
  );
}

function AdminGuard({ user, children }) {
  return user?.role === 'admin' ? children : <Navigate to="/admin-login" replace />;
}

function AdminLogin({ setUser }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/login', form);
      if (data.user.role !== 'admin') {
        authStore.clear();
        setError('Accès réservé aux administrateurs.');
        return;
      }
      setUser(authStore.saveSession(data));
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Connexion administrateur impossible.');
    }
  }

  return (
    <main className="admin-login-page">
      <section className="admin-login-panel">
        <img src={assets.logo} alt="SECURE OFFICE" />
        <span className="eyebrow">Administration</span>
        <h1>Console sécurisée</h1>
        <p>Connexion séparée réservée aux comptes administrateurs.</p>
        <form className="auth-form" onSubmit={submit}>
          <input type="email" placeholder="Email administrateur" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          <input type="password" placeholder="Mot de passe" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          {error && <p className="alert">{error}</p>}
          <button className="primary-button">Entrer dans l’administration</button>
        </form>
        <Link className="secondary-button" to="/">Retour au site</Link>
      </section>
    </main>
  );
}

function AdminLayout({ setUser }) {
  const navigate = useNavigate();
  const [overview, setOverview] = useState({ users: 0, incidents: 0, audits: 0, tool_usage: {} });
  const [users, setUsers] = useState([]);
  const [hashes, setHashes] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadAdmin() {
      try {
        const [overviewResponse, usersResponse, hashesResponse] = await Promise.all([
          api.get('/admin/overview'),
          api.get('/admin/users'),
          api.get('/admin/hashes'),
        ]);
        setOverview(overviewResponse.data);
        setUsers(usersResponse.data.data.map((item) => ({
          name: item.name,
          role: item.roles?.[0]?.name || 'user',
          active: item.is_active,
        })));
        setHashes(hashesResponse.data.data);
      } catch {
        setError('Impossible de charger les données administrateur.');
      }
    }
    loadAdmin();
  }, []);

  async function logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // Local cleanup is enough when the server is unavailable.
    }
    authStore.clear();
    setUser(null);
    navigate('/');
  }

  return (
    <main className="admin-shell">
      <aside className="admin-side">
        <img src={assets.logo} alt="SECURE OFFICE" />
        <h1>Administration</h1>
        <button onClick={logout}><LogOut size={17} /> Quitter</button>
      </aside>
      <section className="admin-main">
        <div className="admin-grid">
          {[
            `Utilisateurs ${overview.users}`,
            `Incidents ${overview.incidents}`,
            `Audits ${overview.audits}`,
            `Outils ${Object.keys(overview.tool_usage || {}).length}`,
          ].map((item) => <article className="metric-card" key={item}><Activity /><strong>{item}</strong></article>)}
        </div>
        {error && <div className="alert-banner">{error}</div>}
        <section className="admin-section">
          <h2>Journal d'activité récent</h2>
          {overview.logs?.map((log) => (
            <div className="table-row" key={log.id}>
              <span>{log.action}</span>
              <span>{new Date(log.created_at).toLocaleString()}</span>
              <span>{log.user?.name || 'Invité'}</span>
            </div>
          ))}
        </section>
        <section className="admin-section">
          <h2>Gestion des utilisateurs</h2>
          {users.map((item) => <div className="table-row" key={item.name}><strong>{item.name}</strong><span>{item.role}</span><span>{item.active ? 'actif' : 'désactivé'}</span><button className="secondary-button">Modifier</button></div>)}
        </section>
        <section className="admin-section">
          <h2>Hashes malveillants connus</h2>
          {hashes.map((item) => <code className="hash-line" key={item.hash}>{item.hash} · {item.label}</code>)}
        </section>
      </section>
    </main>
  );
}

export default App;
