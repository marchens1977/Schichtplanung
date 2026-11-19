// Automatische Prüfung der Schichtplanung im echten Browser (Chromium, Handy-Größe).
// Start:  cd test && npm install && npm test
// Firebase und das Tailwind-CDN werden durch lokale Ersatzdateien ersetzt,
// es werden also KEINE echten Daten gelesen oder verändert.
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const postcss = require('postcss'), tailwind = require('tailwindcss');

const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
let fehler = 0;
const ok = (b, t) => { console.log((b ? '  OK   ' : '  FEHLER ') + t); if (!b) fehler++; };

async function css() { // Tailwind-CSS so erzeugen, wie es das CDN im Browser tun würde
  const cfg = Function('const tailwind={};' + html.match(/tailwind\.config=[^\n]*/)[0] + 'return tailwind.config;')();
  const eigen = html.match(/<style type="text\/tailwindcss">([\s\S]*?)<\/style>/)[1];
  const r = await postcss([tailwind({ ...cfg, content: [{ raw: html, extension: 'html' }] })])
    .process('@tailwind base;@tailwind components;@tailwind utilities;' + eigen, { from: undefined });
  return r.css;
}

(async () => {
  const cssText = await css();
  const server = http.createServer((q, s) => {
    const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]).replace(/\/$/, '/index.html'));
    if (!f.startsWith(ROOT) || !fs.existsSync(f)) { s.writeHead(404); return s.end(); }
    const t = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png' }[path.extname(f)] || 'text/plain';
    s.writeHead(200, { 'Content-Type': t }); fs.createReadStream(f).pipe(s);
  }).listen(0);
  const url = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
  page.on('dialog', d => d.accept());
  page.on('pageerror', e => { console.log('  Seitenfehler: ' + e.message); fehler++; });
  await page.route('https://cdn.tailwindcss.com/**', r => r.fulfill({ contentType: 'text/javascript',
    body: `window.tailwind={};document.addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');s.textContent=${JSON.stringify(cssText)};document.head.appendChild(s);});` }));
  await page.route('https://www.gstatic.com/**/firebase-app.js', r => r.fulfill({ contentType: 'text/javascript', body: 'export const initializeApp=()=>({});' }));
  await page.route('https://www.gstatic.com/**/firebase-firestore.js', r => r.fulfill({ contentType: 'text/javascript', body: fs.readFileSync(path.join(__dirname, 'firestore-attrappe.js'), 'utf8') }));

  const bild = n => { fs.mkdirSync(path.join(__dirname, 'bilder'), { recursive: true }); return page.screenshot({ path: path.join(__dirname, 'bilder', n), fullPage: true }); };
  const login = async (u, p) => { await page.fill('#au', u); await page.fill('#ap', p); await page.click('#authForm button'); };
  const farbe = (sel, prop) => page.$eval(sel, (e, p) => getComputedStyle(e)[p], prop);

  console.log('Prüfe Schichtplanung …');
  await page.goto(url);
  await page.waitForSelector('#auth:not(.hidden)');
  ok(true, 'Anmeldeseite erscheint');
  await bild('1-anmelden.png');
  ok(await page.$eval('meta[name=theme-color]', e => e.content) === '#002D72', 'Kopfbalken-Farbe (theme-color) ist Mets-Blau');
  const man = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.json'), 'utf8'));
  ok(man.theme_color === '#002D72' && man.short_name === 'Schichtplanung', 'Manifest: Farbe und Name stimmen');

  await login('admin', 'geheim123');
  await page.waitForSelector('#app:not(.hidden)');
  ok(true, 'Admin-Erststart und Anmeldung');
  ok(await farbe('header', 'backgroundColor') === 'rgb(0, 45, 114)', 'Kopfzeile ist Mets-Blau');
  ok(await farbe('header', 'borderBottomColor') === 'rgb(255, 89, 16)', 'Kopfzeile hat orangen Streifen');
  ok(await farbe('#f-submit', 'backgroundColor') === 'rgb(0, 45, 114)', 'Haupt-Knopf ist Mets-Blau');
  ok(await farbe('#tabs button', 'backgroundColor') === 'rgb(255, 89, 16)', 'Aktiver Reiter ist Mets-Orange');
  ok(await farbe('#tabs button', 'color') === 'rgb(0, 45, 114)', 'Aktiver Reiter hat blaue Schrift (gut lesbar)');

  await page.click('[data-tab=users]');
  await page.fill('#u-name', 'Anna'); await page.fill('#u-pw', 'test'); await page.click('#uform button');
  await page.waitForSelector('[data-deluser=Anna]');
  ok(true, 'Mitarbeiter anlegen');
  await page.click('[data-tab=set]'); await page.check('#desktog');
  await page.waitForFunction(() => window.__store.settings.main?.desks === true);
  ok(true, 'Platzwahl einschalten');
  await page.click('#logout');

  await login('Anna', 'test');
  await page.waitForSelector('#plan-grid [data-desk=P5]');
  ok(!!await page.inputValue('#f-date'), 'Formular zeigt Datum (nächster Werktag)');
  // Zwei Werktage weiter springen (Pfeil ›), damit die 14-Uhr-Vortagsregel nicht greift
  await page.click('[data-day=f-date][data-dir="1"]'); await page.click('[data-day=f-date][data-dir="1"]');
  const datum = await page.inputValue('#f-date');
  const tag = new Date(datum + 'T12:00:00').getDay();
  ok(tag >= 1 && tag <= 5, 'Pfeil › springt auf einen Werktag');
  await page.waitForSelector('#plan-grid [data-desk=P5]');
  await page.selectOption('#f-start', '12:00'); await page.selectOption('#f-break', '30 Minuten');
  await page.click('[data-desk=P5]');
  ok(await farbe('[data-desk=P5]', 'backgroundColor') === 'rgb(255, 89, 16)', 'Gewählter Platz ist Orange');
  const insel = await page.$$eval('#plan-grid > div', l => l.map(e => e.textContent.replace(/\s+/g, ' ').trim()));
  ok(insel[3].startsWith('INSEL 2') && insel[6].startsWith('INSEL 1') && insel[8].includes('Coaching'), 'Raumplan in L-Form mit Hinweisen');
  await bild('2-formular.png');
  const morgen14 = new Date(datum + 'T14:00:00'); morgen14.setDate(morgen14.getDate() - 1);
  if (new Date() <= morgen14) {
    await page.click('#f-submit');
    await page.waitForFunction(() => Object.keys(window.__store.shifts).length === 1);
    ok(true, 'Schicht mit Platz P5 gespeichert');
    ok(Object.keys(await page.evaluate(() => window.__store.desks)).length === 1, 'Platz P5 ist gesperrt');
    await page.click('[data-tab=plan]'); await page.fill('#p-date', datum); await page.dispatchEvent('#p-date', 'change');
    await page.waitForSelector('#p-plan-grid [title="Belegt von: Anna"]');
    ok(await farbe('#p-plan-grid [title="Belegt von: Anna"]', 'backgroundColor') === 'rgb(0, 45, 114)', 'Belegter Platz im Tagesplan ist Blau');
    await bild('3-tagesplan.png');
  } else console.log('  (Speichern übersprungen: nach 14 Uhr am Vortag, Regel greift)');

  // ===== Updates =====
  const appVer = html.match(/const APP_VERSION='([^']+)'/)[1];
  const fileVer = JSON.parse(fs.readFileSync(path.join(ROOT, 'version.json'), 'utf8')).version;
  ok(appVer === fileVer, `Versionsnummer in index.html (${appVer}) und version.json (${fileVer}) gleich`);
  ok(/const CACHE = 'schichtplanung-v\d+'/.test(fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8')), 'sw.js hat eine CACHE-Version');
  ok((await page.textContent('#ver-foot')).includes(appVer), 'Versionsnummer steht unten in der App');
  await page.click('#logout'); await login('admin', 'geheim123');
  await page.click('[data-tab=set]'); await page.click('#upd-check');
  await page.waitForFunction(() => document.getElementById('upd-status').textContent.includes('aktuell'));
  ok(true, 'Einstellungen: "Die App ist aktuell" bei gleicher Version');

  let serverVer = '2099.01.01-1';  // so tun, als gäbe es eine neue Version
  await page.route('**/version.json*', r => r.fulfill({ contentType: 'application/json', body: JSON.stringify({ version: serverVer }) }));
  await page.uncheck('#upd-auto');
  await page.click('#upd-check');
  await page.waitForSelector('#upd-bar:not(.hidden)');
  ok((await page.textContent('#upd-status')).includes('2099.01.01-1'), 'Ohne Automatik: Hinweis-Balken + Status "Update verfügbar"');
  await bild('4-update-hinweis.png');
  await Promise.all([page.waitForEvent('load'), page.click('#upd-now')]);
  ok(true, '"Jetzt aktualisieren" lädt die App neu');

  await page.evaluate(() => { localStorage.setItem('sp_autoupd', '1'); sessionStorage.clear(); });
  serverVer = '2099.01.01-2';
  await page.waitForSelector('#auth:not(.hidden)');
  await page.click('#au');   // Nutzer tippt gerade → nicht automatisch neu laden
  await page.evaluate(() => spUpdateCheck(false));
  ok(await page.isVisible('#upd-bar'), 'Automatik: während einer Eingabe nur Hinweis, kein Neuladen');
  await page.evaluate(() => document.activeElement.blur());
  await Promise.all([page.waitForEvent('load'), page.evaluate(() => spUpdateCheck(false))]);
  ok(true, 'Automatik: App lädt sich bei neuer Version selbst neu');
  await page.waitForSelector('#auth:not(.hidden)');
  await page.evaluate(() => spUpdateCheck(false));
  ok(await page.isVisible('#upd-bar'), 'Schutz gegen Endlos-Neuladen: beim 2. Mal nur Hinweis');

  // ===== Service Worker (Offline-Kopie, Installierbarkeit) =====
  const ctx2 = await browser.newContext();
  const p2 = await ctx2.newPage();
  p2.on('pageerror', e => { console.log('  Seitenfehler (SW): ' + e.message); fehler++; });
  for (const [m, b] of [['https://cdn.tailwindcss.com/**', 'window.tailwind={};'], ['https://www.gstatic.com/**', 'export const initializeApp=()=>({});export const getFirestore=()=>({});export const doc=()=>({});export const collection=()=>({});export const setDoc=async()=>{};export const onSnapshot=()=>{};export const runTransaction=async()=>{};export const writeBatch=()=>({});']])
    await p2.route(m, r => r.fulfill({ contentType: 'text/javascript', body: b }));
  await p2.goto(url);
  await p2.evaluate(() => navigator.serviceWorker.ready);
  await p2.reload();
  ok(await p2.evaluate(() => !!navigator.serviceWorker.controller), 'Service Worker ist aktiv und steuert die Seite');
  ok(await p2.evaluate(() => caches.keys()).then(k => k.some(x => /^schichtplanung-v\d+$/.test(x))), 'Service Worker hat seine Kopie angelegt');
  await ctx2.setOffline(true);
  await p2.reload();
  ok((await p2.title()) === 'Schichtplanung', 'Ohne Internet: App-Seite kommt aus der Kopie');
  await ctx2.close();

  await browser.close(); server.close();
  console.log(fehler ? `\n${fehler} Fehler gefunden.` : '\nAlle Prüfungen bestanden.');
  process.exit(fehler ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
