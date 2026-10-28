// Rend fonctionnelles les maquettes sur mesure dessinées en deux versions (.dk ordinateur, .mb mobile) :
// champs saisissables, boutons reliés, menu mobile, options, demandes avec confirmation. Aucune donnée n'est envoyée.
// Réglages sur <body> : data-accent, data-tel, data-mail, data-name, data-city, data-kind (table, sejour, rdv, devis, degustation, commande, traiteur).
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const B = document.body.dataset;
  // couleur d'accent : celle du premier bouton plein de la maquette, sauf si précisée
  // (fond assez foncé pour du texte blanc ; sinon la couleur de texte foncée d'un bouton clair)
  const lum = c => { const m = c.match(/\d+(\.\d+)?/g); if (!m) return 1; const [r, g, b] = m.map(Number); return (0.299 * r + 0.587 * g + 0.114 * b) / 255; };
  const btnBg = () => {
    const bs = $$('.dk .btn, .mb .btn').map(b => getComputedStyle(b));
    const bg = bs.map(s => s.backgroundColor).find(c => !/rgba\(0, 0, 0, 0\)|transparent/.test(c) && lum(c) < .5);
    return bg || bs.map(s => s.color).find(c => lum(c) < .45) || '#222';
  };
  const ACC = B.accent || btnBg(), TEL = B.tel || '+33000000000', MAIL = B.mail || 'contact@exemple.fr', NAME = B.name || document.title.split(' — ')[0];
  const KIND = B.kind || 'rdv', CITY = B.city || '';
  const FONT = getComputedStyle(document.querySelector('.mb') || document.body).fontFamily;
  const fmtDate = v => v ? new Date(v + 'T12:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '';
  const isMob = () => getComputedStyle($('.mb')).display !== 'none';
  const root = () => isMob() ? $('.mb') : $('.dk');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const tomorrow = () => new Date(Date.now() + 864e5).toISOString().slice(0, 10);

  const css = document.createElement('style');
  css.textContent = `
  .bk-in{all:unset;display:block;width:100%;box-sizing:border-box;font:inherit;color:inherit;cursor:text;min-height:1.3em}
  .bk-in::placeholder{color:inherit;opacity:.5}
  select.bk-in{cursor:pointer;appearance:auto}
  select.bk-in option{color:#1d1d1b}
  textarea.bk-in{height:calc(100% - 22px);resize:none}
  .bk-in:focus{outline:none;box-shadow:0 1px 0 0 currentColor}
  [data-bk-act],.cal .d span:not(.full),.burger,.call,.links span,.opts span,.op,.season span,.drop,.ba{cursor:pointer}
  .cal .d span.sel{outline:2px solid ${ACC};outline-offset:2px}
  .drop.has{outline:2px dashed ${ACC};outline-offset:-6px}
  .bk-ov{position:fixed;inset:0;z-index:200;background:rgba(12,12,12,.55);display:none;align-items:center;justify-content:center;padding:16px;font-family:${FONT}}
  .bk-ov.on{display:flex}
  .bk-dl{background:#fff;color:#1d1d1b;width:min(520px,100%);max-height:calc(100vh - 32px);overflow:auto;border-radius:10px;padding:28px 26px;position:relative;box-shadow:0 30px 80px rgba(0,0,0,.3);font-size:15.5px;line-height:1.55;text-align:left}
  .bk-dl h3{font-size:24px;line-height:1.2;margin:0 34px 6px 0;color:#1d1d1b}
  .bk-dl p{color:#5d5d58;margin:0 0 12px}
  .bk-dl .x{position:absolute;top:14px;right:14px;width:36px;height:36px;border-radius:50%;border:0;background:#f0efeb;font-size:20px;cursor:pointer;color:#1d1d1b}
  .bk-dl dl{display:grid;grid-template-columns:auto 1fr;gap:4px 16px;margin:10px 0 16px;padding:12px 14px;background:#f5f4f0;border-radius:6px;font-size:14.5px}
  .bk-dl dt{color:#6b6b66}.bk-dl dd{margin:0;font-weight:600}
  .bk-dl form{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .bk-dl form>*{grid-column:1/-1}
  .bk-dl form>.half{grid-column:auto}
  .bk-dl label{display:grid;gap:4px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;font-weight:700;color:#444}
  .bk-dl input,.bk-dl select,.bk-dl textarea{font:inherit;font-size:15px;letter-spacing:0;text-transform:none;font-weight:400;color:#1d1d1b;border:1px solid #d8d6cf;border-radius:6px;padding:11px 12px;background:#fff;width:100%;box-sizing:border-box}
  .bk-dl input:focus,.bk-dl select:focus,.bk-dl textarea:focus{outline:2px solid ${ACC};outline-offset:0;border-color:transparent}
  .bk-dl .cs{display:flex;gap:10px;text-transform:none;letter-spacing:0;font-weight:400;font-size:13.5px;color:#5d5d58}
  .bk-dl .cs input{width:auto;margin-top:3px;accent-color:${ACC}}
  .bk-dl button.go{display:flex;justify-content:center;align-items:center;width:100%;border:0;border-radius:6px;background:${ACC};color:#fff;font:inherit;font-weight:700;padding:14px;cursor:pointer;margin-top:6px}
  .bk-dl .ok{border-left:4px solid ${ACC};padding-left:14px}
  .bk-dl .demo{font-size:12.5px;color:#8a8a84;margin-top:12px}
  .bk-mn{position:fixed;inset:0;z-index:150;background:#fff;display:none;flex-direction:column;padding:84px 24px 30px;font-family:${FONT};overflow:auto}
  .bk-mn.on{display:flex}
  .bk-mn a{font-size:26px;padding:12px 0;border-bottom:1px solid #e6e4de;color:#1d1d1b;text-decoration:none}
  .bk-mn a.go{margin-top:22px;border:0;background:${ACC};color:#fff;text-align:center;border-radius:6px;font-size:17px;font-weight:700}
  .bk-mn .x{position:absolute;top:18px;right:18px;width:44px;height:44px;border-radius:50%;border:1px solid #ddd;background:#fff;font-size:22px;cursor:pointer;color:#1d1d1b}
  .bk-toast{font-family:${FONT};position:fixed;left:50%;bottom:96px;transform:translateX(-50%);background:#1d1d1b;color:#fff;padding:11px 18px;border-radius:6px;font-size:14.5px;z-index:220;opacity:0;transition:opacity .25s;pointer-events:none;max-width:calc(100vw - 32px);text-align:center}
  .bk-toast.on{opacity:1}
  @media (max-width:520px){.bk-dl form{grid-template-columns:1fr}.bk-dl form>.half{grid-column:1/-1}}`;
  document.head.append(css);

  const toast = m => { let t = $('.bk-toast'); if (!t) { t = document.createElement('div'); t.className = 'bk-toast'; t.setAttribute('role', 'status'); document.body.append(t); } t.textContent = m; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 2600); };

  // ---- fenêtre de demande
  const ov = document.createElement('div'); ov.className = 'bk-ov'; ov.innerHTML = '<div class="bk-dl" role="dialog" aria-modal="true"><button class="x" type="button" aria-label="Fermer">×</button><div class="ct"></div></div>';
  document.body.append(ov);
  const close = () => ov.classList.remove('on');
  ov.addEventListener('click', e => { if (e.target === ov || e.target.closest('.x')) close(); });
  const HOURS_TABLE = ['12 h', '12 h 30', '13 h', '19 h', '19 h 30', '20 h', '20 h 30', '21 h'];
  const HOURS_DAY = ['9 h', '10 h', '11 h', '14 h', '15 h', '16 h', '17 h'];
  const sel = (n, l, opts, half = true) => `<label class="${half ? 'half' : ''}">${l}<select name="${n}">${opts.map(o => `<option>${esc(o)}</option>`).join('')}</select></label>`;
  const inp = (n, l, t = 'text', req = false, half = true, ph = '') => `<label class="${half ? 'half' : ''}">${l}<input name="${n}" type="${t}"${t === 'date' ? ` min="${tomorrow()}"` : ''}${t === 'number' ? ' min="1"' : ''}${req ? ' required' : ''}${ph ? ` placeholder="${esc(ph)}"` : ''}></label>`;
  const KF = {
    table: () => inp('date', 'Date', 'date', true) + sel('heure', 'Heure', HOURS_TABLE) + sel('couverts', 'Couverts', ['2 personnes', '1 personne', '3 personnes', '4 personnes', '5 personnes', '6 personnes', '7 personnes ou plus']),
    sejour: () => inp('arrivee', 'Arrivée', 'date', true) + inp('depart', 'Départ', 'date', true) + sel('voyageurs', 'Voyageurs', ['2 adultes', '1 adulte', '2 adultes + 1 enfant', '2 adultes + 2 enfants', '3 adultes', '4 adultes']),
    rdv: () => inp('prestation', 'Prestation', 'text', false, false, 'Ce que vous souhaitez') + inp('date', 'Date souhaitée', 'date', true) + sel('heure', 'Heure', HOURS_DAY),
    devis: () => inp('vehicule', 'Véhicule', 'text', true, true, 'Marque, modèle') + inp('immat', 'Immatriculation', 'text', false, true, 'AA-123-AA') + inp('date', 'Date souhaitée', 'date'),
    degustation: () => inp('date', 'Date de la dégustation', 'date', true) + sel('personnes', 'Personnes', ['2', '3', '4']) + inp('mariage', 'Date du mariage', 'date'),
    commande: () => inp('date', 'Date de retrait', 'date', true) + sel('retrait', 'Retrait ou livraison', ['Retrait', 'Livraison']),
    traiteur: () => inp('date', 'Date de l’événement', 'date', true) + inp('invites', 'Invités', 'number', true, true, '60'),
  };
  const KT = {
    table: ['Réserver une table', 'Nous vous confirmons la table par SMS.', 'Réserver'],
    sejour: ['Demande de séjour', 'Nous confirmons la disponibilité et le prix sous 24 h.', 'Envoyer ma demande'],
    rdv: ['Prendre rendez-vous', 'Nous vous confirmons le créneau par SMS.', 'Demander ce rendez-vous'],
    devis: ['Demander un devis', 'Nous vous répondons sous 24 h avec un devis.', 'Envoyer ma demande'],
    degustation: ['Réserver une dégustation', 'Nous vous confirmons le rendez-vous à l’atelier par e-mail.', 'Réserver'],
    commande: ['Passer commande', 'Nous vous confirmons la commande sous 24 h.', 'Envoyer ma commande'],
    traiteur: ['Demander un devis', 'Devis détaillé sous 24 h.', 'Envoyer ma demande'],
  };
  function dialog({ title, intro, summary = [], kind = null, contact = ['nom', 'email', 'tel'], msg = true, cta, okText } = {}) {
    const [t0, ok0, c0] = KT[kind || KIND] || KT.rdv;
    title = title || t0; okText = okText || ok0; cta = cta || c0;
    const rows = summary.filter(([, v]) => v);
    const C = { nom: inp('nom', 'Nom', 'text', true, true), tel: inp('tel', 'Téléphone', 'tel', false, true), email: inp('email', 'E-mail', 'email', true, false) };
    $('.ct', ov).innerHTML = `<h3>${esc(title)}</h3>${intro ? `<p>${esc(intro)}</p>` : ''}${rows.length ? `<dl>${rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>` : ''}<form novalidate>${kind ? KF[kind]() : ''}${contact.map(c => C[c]).join('')}${msg ? '<label>Message<textarea name="msg" rows="3"></textarea></label>' : ''}<label class="cs"><input type="checkbox" required> J’accepte que ces informations servent à répondre à ma demande.</label><button class="go" type="submit">${esc(cta)}</button></form>`;
    const f = $('form', ov);
    f.addEventListener('submit', e => {
      e.preventDefault();
      if (f.depart) f.depart.setCustomValidity(f.arrivee.value && f.depart.value && f.depart.value <= f.arrivee.value ? 'Le départ doit être après l’arrivée' : '');
      if (!f.reportValidity()) return;
      const all = rows.concat([...f.elements].filter(x => x.name && x.value && !['nom', 'email', 'tel', 'msg'].includes(x.name) && x.type !== 'checkbox')
        .map(x => [x.closest('label').firstChild.textContent, x.type === 'date' ? fmtDate(x.value) : x.value]));
      $('.ct', ov).innerHTML = `<div class="ok"><h3>Demande envoyée</h3><p>Merci ${esc(f.nom.value)}. ${esc(okText)}</p></div>${all.length ? `<dl>${all.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>` : ''}<p class="demo">Maquette de démonstration : aucune donnée n’est envoyée.</p><button class="go" type="button">Fermer</button>`;
      $('.ct .go', ov).onclick = close;
    });
    ov.classList.add('on'); setTimeout(() => $('input, select', ov)?.focus(), 50);
  }
  function info(title, html) { $('.ct', ov).innerHTML = `<h3>${esc(title)}</h3>${html}<button class="go" type="button">Fermer</button>`; $('.ct .go', ov).onclick = close; ov.classList.add('on'); }
  const legal = () => info('Mentions légales', `<p>${esc(NAME)}, [forme juridique], SIRET [000 000 000 00000], [adresse]. Hébergeur : [nom et adresse de l’hébergeur].</p><p><b>Données personnelles.</b> Les informations envoyées par les formulaires servent uniquement à répondre à votre demande, et sont conservées trois ans au plus. Pour y accéder ou les supprimer : [e-mail de contact].</p><p class="demo">Maquette : emplacements à compléter. Photos : Unsplash.</p>`);

  // ---- champs dessinés -> vrais champs
  const formulas = sc => [...new Set($$('.tc h3, .tc b, .fc b, .fc h3, .cc h3, .sc h3, .tab .r b', sc).map(e => e.textContent.trim()).filter(t => t && t.length < 50 && !/€|^dès/.test(t)))];
  function makeInput(label, shown, sc) {
    const l = label.toLowerCase().trim();
    let el;
    const listed = shown.includes(' · ') && !/\d/.test(shown) ? shown.split(' · ').map(x => x.trim()) : null;
    if (/^(date|arrivée|départ)|date de|retrait le/.test(l)) { el = document.createElement('input'); el.type = 'date'; el.min = tomorrow(); el.required = true; }
    else if (/^heure/.test(l)) { el = document.createElement('select'); (KIND === 'table' ? HOURS_TABLE : HOURS_DAY).forEach(h => el.add(new Option(h, h, false, h.replace(' h', ':00') === shown || h === shown))); }
    else if (/couverts|voyageurs|personnes|invités|quantité|nombre|parts|année/.test(l)) { el = document.createElement('input'); el.type = 'number'; el.min = /année/.test(l) ? 1900 : 1; el.value = /année/.test(l) ? '' : (shown.match(/\d+/) || [''])[0]; el.placeholder = /année/.test(l) ? '19..' : 'nombre'; }
    else if (listed) { el = document.createElement('select'); listed.forEach(o => el.add(new Option(o))); }
    else if (/retrait ou/.test(l)) { el = document.createElement('select'); ['Retrait', 'Livraison'].forEach(o => el.add(new Option(o, o, false, o === shown))); }
    else if (/^service/.test(l)) { el = document.createElement('select'); ['Avec serveurs', 'Sans service (livraison)'].forEach(o => el.add(new Option(o, o, false, o === shown))); }
    else if (/formule|format|plateau|prestation/.test(l) && formulas(sc).length) { el = document.createElement('select'); formulas(sc).forEach(f => el.add(new Option(f, f, false, f === shown || shown.startsWith(f)))); }
    else if (/mail/.test(l)) { el = document.createElement('input'); el.type = 'email'; el.required = true; el.placeholder = shown; }
    else { el = document.createElement('input'); el.placeholder = shown.replace(/^\[|\]$/g, ''); if (/pr[ée]nom|^nom|véhicule/.test(l)) el.required = true; }
    el.className = 'bk-in'; el.name = l.replace(/[^a-zà-ÿ]+/g, '-'); el.dataset.label = label.trim(); el.setAttribute('aria-label', label.trim());
    return el;
  }
  $$('.field').forEach(f => {
    const lab = f.querySelector('b, .mono, .cap'); if (!lab) return;
    const label = lab.textContent.trim(); const shown = [...f.childNodes].filter(n => n !== lab).map(n => n.textContent).join('').trim();
    [...f.childNodes].forEach(n => { if (n !== lab) n.remove(); });
    let el = makeInput(label, shown, f.closest('.dk, .mb'));
    if ((f.classList.contains('full') && f.offsetHeight > 100) || /projet|journée|message|précisions|idée|demande/i.test(label)) { el = document.createElement('textarea'); el.className = 'bk-in'; el.placeholder = shown; el.name = 'message'; el.dataset.label = label; el.setAttribute('aria-label', label); }
    f.append(el); f.style.cursor = 'text'; f.addEventListener('click', () => el.focus());
  });
  $$('.book div, .check > div, .calc div, .booking div').forEach(d => {
    const kids = [...d.children];
    if (kids.length !== 2 || kids[1].tagName !== 'B' || !/^(SPAN|LABEL)$/.test(kids[0].tagName) || d.querySelector('div') || d.matches('.res, .tot')) return;
    const label = kids[0].textContent.trim(), b = kids[1];
    if (/comptoir/i.test(label)) return;
    const el = makeInput(label, b.textContent.trim(), d.closest('.dk, .mb'));
    const cs = getComputedStyle(b);
    el.style.fontWeight = cs.fontWeight; el.style.fontSize = cs.fontSize; el.style.fontFamily = cs.fontFamily; el.style.color = cs.color;
    b.replaceWith(el); d.style.cursor = 'text'; d.addEventListener('click', e => { if (e.target === d) el.focus(); });
  });

  const valuesOf = box => $$('.bk-in', box).map(i => [i.dataset.label, i.type === 'date' ? fmtDate(i.value) : i.value]).concat(
    $$('.opts', box).map(o => [o.previousElementSibling?.textContent?.trim() || 'Choix', $('.on', o)?.textContent.trim()]));
  const widget = () => {
    const r = root();
    return r.querySelector('.book, .check, .calc, .quote') || $$('.field', r).find(f => !f.closest('.form'))?.parentElement;
  };
  function goWidget() {
    const w = widget(); if (!w) return dialog({ kind: KIND });
    w.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => $('.bk-in, input', w)?.focus({ preventScroll: true }), 500);
  }
  function submitWidget(box) {
    const req = $$('.bk-in[required]', box).find(i => !i.value);
    if (req) { req.focus(); toast('Indiquez : ' + req.dataset.label.toLowerCase()); return; }
    const a = $$('.bk-in[type=date]', box);
    if (a.length === 2 && a[1].value <= a[0].value) { a[1].focus(); toast('Le départ doit être après l’arrivée'); return; }
    const sum = valuesOf(box);
    const tot = $('.tot b, .res b', box); if (tot) sum.push(['Estimation', tot.textContent.trim()]);
    const files = box.querySelector('input[type=file]'); if (files && files.files.length) sum.push(['Photos', files.files.length + ' fichier(s)']);
    dialog({ summary: sum, kind: $$('.bk-in', box).length ? null : KIND, intro: 'Laissez vos coordonnées pour finaliser la demande.' });
  }
  function goSection(words) {
    const secs = $$('section', root());
    const hit = secs.find(s => words.some(w => (s.id || '').includes(w) || (s.className || '').includes(w) || ($('h2', s)?.textContent || '').toLowerCase().includes(w)));
    if (hit) hit.scrollIntoView({ behavior: 'smooth' }); else goWidget();
  }

  // ---- boutons
  const ACTIONS = [
    [/appeler|^\[?0\d/, () => { location.href = 'tel:' + TEL; }],
    [/écrire/, () => { location.href = 'mailto:' + MAIL; }],
    [/itinéraire/, () => window.open('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(NAME + ' ' + CITY), '_blank', 'noopener')],
    [/sinistre/, () => goSection(['sinistre', 'sin'])],
    [/compte entreprise/, () => dialog({ title: 'Ouvrir un compte entreprise', intro: 'Facturation mensuelle et devis prioritaires pour les entreprises.', cta: 'Demander l’ouverture', okText: 'Nous vous envoyons le formulaire d’ouverture de compte.' })],
    [/vins/, () => goSection(['cave', 'vin'])],
    [/menu|la carte/, () => goSection(['menu', 'semaine', 'carte', 'omakase'])],
    [/chambres/, () => goSection(['chambre', 'rooms'])],
    [/restaurations/, () => goSection(['restaur', 'gal'])],
    [/tarifs/, () => goSection(['tarif', 'prestation', 'formule'])],
    [/estimer|estimation/, () => { const w = root().querySelector('.calc, .conf') || $$('.opts', root())[0]?.parentElement; (w || root()).scrollIntoView({ behavior: 'smooth', block: 'center' }); }],
    [/dégustation/, () => dialog({ kind: 'degustation', intro: 'Dégustation de 3 saveurs à l’atelier, déduite de la commande.' })],
  ];
  $$('.btn, .bk, .call').forEach(b => {
    if (b.tagName === 'A' && b.getAttribute('href')) return;
    b.setAttribute('role', 'button'); b.tabIndex = 0; b.dataset.bkAct = '';
    const t = b.textContent.trim().toLowerCase(), box = b.closest('.book, .check, .calc, .quote, .form, .contact, #contact');
    let act;
    if (b.classList.contains('call')) act = () => { location.href = 'tel:' + TEL; };
    else if (b.classList.contains('bk')) act = () => dialog({ kind: KIND, summary: [['Avec', b.textContent.replace(/réserver avec/i, '').trim()]] });
    else if (/envoyer|parler de mon projet/.test(t) && b.closest('.form, .quote')) act = () => {
      const f = b.closest('.form, .quote');
      const miss = $$('.bk-in[required]', f).find(i => !i.value || (i.type === 'email' && !i.checkValidity()));
      if (miss) { miss.focus(); toast('Indiquez : ' + miss.dataset.label.toLowerCase()); return; }
      if (b.closest('.quote')) return submitWidget(f);
      dialog({ summary: valuesOf(f), msg: false, intro: 'Dernière étape : vos coordonnées.' });
    };
    else if (/vérifier|disponibilit|voir|devis|commander|réserver|recevoir/.test(t) && box && ($$('.bk-in', box).length || $$('.opts', box).length) && !/carte|menu|chambres|tarifs|restaurations/.test(t)) act = () => submitWidget(box);
    else {
      const hit = ACTIONS.find(([re]) => re.test(t));
      act = hit ? hit[1] : () => {
        if (/commander/.test(t) && /€/.test(t)) return dialog({ kind: 'commande', summary: [['Commande', (b.closest('.mb') && $('.mb .opts .on')?.textContent.trim()) || t.replace(/commander ·?/, '').trim()]] });
        goWidget();
      };
    }
    b.addEventListener('click', e => { e.preventDefault(); act(); });
    b.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
  });

  // ---- options à choix unique (pastilles, cartes de choix, saisons)
  $$('.opts, .season, .sel .grid').forEach(g => {
    const items = [...g.children].filter(x => /^(SPAN|DIV|BUTTON)$/.test(x.tagName));
    items.forEach(it => {
      it.setAttribute('role', 'button'); it.tabIndex = 0;
      const pick = () => { items.forEach(x => x.classList.toggle('on', x === it)); g.dispatchEvent(new CustomEvent('bk-change', { bubbles: true })); };
      it.addEventListener('click', pick); it.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
    });
  });
  $$('[data-tab]').forEach(t => t.addEventListener('click', () => {
    const scope = t.closest('section') || document;
    $$('[data-tab]', scope).forEach(x => x.classList.toggle('on', x === t));
    $$('[data-panel]', scope).forEach(p => { p.hidden = p.dataset.panel !== t.dataset.tab; });
  }));
  $$('.drop').forEach(d => {
    const f = document.createElement('input'); f.type = 'file'; f.accept = 'image/*'; f.multiple = true; f.hidden = true; d.after(f);
    d.setAttribute('role', 'button'); d.tabIndex = 0;
    const show = n => { d.classList.toggle('has', n > 0); $('span', d).textContent = n ? `${n} photo${n > 1 ? 's' : ''} ajoutée${n > 1 ? 's' : ''} · cliquez pour modifier` : 'Glissez vos photos ici ou parcourez'; };
    d.addEventListener('click', () => f.click()); d.addEventListener('keydown', e => { if (e.key === 'Enter') f.click(); });
    d.addEventListener('dragover', e => { e.preventDefault(); d.classList.add('has'); });
    d.addEventListener('drop', e => { e.preventDefault(); try { f.files = e.dataTransfer.files; } catch (_) {} show(e.dataTransfer.files.length); });
    f.addEventListener('change', () => show(f.files.length));
  });
  $$('.ba').forEach(ba => {
    const l = $('.l', ba), r = $('.r', ba), bar = $('.bar', ba), knob = $('.knob', ba);
    let cur = 50;
    const set = x => {
      cur = x = Math.max(5, Math.min(95, x));
      l.style.width = x + '%'; r.style.width = (100 - x) + '%';
      l.style.backgroundSize = (10000 / x) + '% 100%'; r.style.backgroundSize = (10000 / (100 - x)) + '% 100%';
      [bar, knob].forEach(e => e && (e.style.left = x + '%'));
    };
    const at = e => { const bb = ba.getBoundingClientRect(); set((e.clientX - bb.left) / bb.width * 100); };
    let drag = false;
    ba.addEventListener('pointerdown', e => { drag = true; ba.setPointerCapture(e.pointerId); at(e); });
    ba.addEventListener('pointermove', e => drag && at(e));
    ba.addEventListener('pointerup', () => { drag = false; });
    ba.setAttribute('role', 'slider'); ba.setAttribute('aria-label', 'Avant / après'); ba.setAttribute('aria-valuemin', 5); ba.setAttribute('aria-valuemax', 95); ba.tabIndex = 0;
    ba.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') set(cur - 5); if (e.key === 'ArrowRight') set(cur + 5); });
  });
  $$('.cal .mo').forEach(mo => {
    const month = $('b', mo).textContent;
    $$('.d span', mo).forEach(s => {
      s.dataset.when = s.textContent + ' ' + month.toLowerCase();
      if (s.classList.contains('full')) { s.title = 'Complet'; return; }
      s.setAttribute('role', 'button'); s.tabIndex = 0;
      const pick = () => { $$('.cal .d span').forEach(x => x.classList.toggle('sel', x === s)); toast(s.dataset.when + ' sélectionné'); };
      s.addEventListener('click', pick); s.addEventListener('keydown', e => { if (e.key === 'Enter') pick(); });
    });
  });

  // ---- menu mobile
  const menu = document.createElement('nav'); menu.className = 'bk-mn'; menu.setAttribute('aria-label', 'Menu');
  const mobTargets = $$('.mb section[id]');
  const findMob = label => {
    const L = label.toLowerCase().replace(/^(l’|le |la |les )/, '').split(' ')[0];
    return mobTargets.find(s => (s.querySelector('h2, .cap')?.textContent || '').toLowerCase().includes(L))?.id || (mobTargets.find(s => s.id === 'mb-infos') || mobTargets[mobTargets.length - 1])?.id;
  };
  const navLinks = $$('.dk header nav a').map(a => [a.textContent.trim(), findMob(a.textContent.trim())]);
  const cta = $('.mb .sticky .btn')?.textContent.trim() || 'Contact';
  menu.innerHTML = '<button class="x" type="button" aria-label="Fermer le menu">×</button>' + navLinks.map(([t, id]) => `<a href="#${id}">${esc(t)}</a>`).join('') + `<a class="go" href="#">${esc(cta)}</a>`;
  document.body.append(menu);
  $$('a', menu).forEach(a => a.addEventListener('click', e => { menu.classList.remove('on'); if (a.classList.contains('go')) { e.preventDefault(); setTimeout(goWidget, 50); } }));
  $('.x', menu).onclick = () => menu.classList.remove('on');
  addEventListener('keydown', e => { if (e.key === 'Escape') { close(); menu.classList.remove('on'); } });
  $$('.burger').forEach(b => { b.setAttribute('role', 'button'); b.setAttribute('aria-label', 'Menu'); b.tabIndex = 0; b.addEventListener('click', () => menu.classList.add('on')); b.addEventListener('keydown', e => { if (e.key === 'Enter') menu.classList.add('on'); }); });

  // ---- pied de page
  $$('.mb .links span').forEach(s => {
    s.setAttribute('role', 'link'); s.tabIndex = 0;
    const t = s.textContent.trim();
    const go = () => /mention|cgv|allerg|confidential/i.test(t) ? legal() : document.getElementById(findMob(t))?.scrollIntoView({ behavior: 'smooth' });
    s.addEventListener('click', go); s.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
  });
  $$('footer span, footer p, footer div').forEach(n => {
    if (n.children.length || n.closest('.links')) return;
    n.innerHTML = n.innerHTML.replace(/Mentions légales|Confidentialité|Allergènes|CGV/g, m => `<a href="#" data-legal style="text-decoration:underline;text-underline-offset:3px">${m}</a>`)
      .replace(/\[@compte-instagram\]/, '<a href="#" data-insta style="text-decoration:underline;text-underline-offset:3px">[@compte-instagram]</a>');
  });
  $$('[data-legal]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); legal(); }));
  $$('[data-insta]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); toast('Lien vers le compte Instagram à renseigner'); }));
  window.bespoke = { dialog, toast, info, root };
})();
