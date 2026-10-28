// Interactions communes des formules Essentiel et Complet (maquettes : aucun envoi réel).
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fmtDate = v => v ? new Date(v + 'T12:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '';
  const eur = n => n.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' €';

  function toast(msg) {
    let t = $('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.append(t); }
    t.textContent = msg; t.classList.add('on');
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 2600);
  }

  // menu mobile
  const hd = $('header.hd');
  const setH = () => hd && document.documentElement.style.setProperty('--hd-h', hd.getBoundingClientRect().bottom + 'px');
  $$('.burger').forEach(b => b.addEventListener('click', () => {
    setH();
    const open = document.body.classList.toggle('menu-open');
    b.setAttribute('aria-expanded', open);
  }));
  $$('.mnav a').forEach(a => a.addEventListener('click', () => document.body.classList.remove('menu-open')));
  addEventListener('keydown', e => { if (e.key === 'Escape') document.body.classList.remove('menu-open'); });

  // pré-remplissage depuis l'adresse (?formule=…&date=…&type=…&invites=…)
  const q = new URLSearchParams(location.search);
  q.forEach((v, k) => $$(`form.demo [name="${k}"]`).forEach(el => { el.value = v; }));

  // formulaires de demande : validation puis récapitulatif (démonstration, rien n'est envoyé)
  $$('form.demo').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault();
    if (!f.reportValidity()) return;
    const sent = f.nextElementSibling;
    const dl = $('dl', sent);
    dl.innerHTML = '';
    $$('[name]', f).forEach(el => {
      if (el.type === 'checkbox' || !el.value || el.dataset.skip !== undefined) return;
      const label = el.dataset.label || el.closest('.f')?.querySelector('label,span')?.textContent || el.name;
      let val = el.type === 'date' ? fmtDate(el.value) : el.tagName === 'SELECT' ? el.selectedOptions[0].text : el.value;
      if (val.length > 90) val = val.slice(0, 90) + '…';
      dl.insertAdjacentHTML('beforeend', `<dt></dt><dd></dd>`);
      dl.lastElementChild.previousElementSibling.textContent = label;
      dl.lastElementChild.textContent = val;
    });
    f.hidden = true; sent.classList.add('on');
    sent.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }));
  $$('[data-reset]').forEach(b => b.addEventListener('click', () => {
    const sent = b.closest('.sent'), f = sent.previousElementSibling;
    f.reset(); f.hidden = false; sent.classList.remove('on');
  }));

  // demande rapide (date, créneau, séjour…) : récapitulatif + lien vers le formulaire pré-rempli
  $$('form.datecheck').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault();
    if (!f.reportValidity()) return;
    const res = f.parentElement.querySelector('.res');
    const params = new URLSearchParams(), rows = [];
    $$('[name]', f).forEach(el => {
      if (!el.value) return;
      params.set(el.name, el.value);
      const label = el.closest('.f')?.querySelector('label')?.textContent || el.name;
      rows.push([label, el.type === 'date' ? fmtDate(el.value) : el.tagName === 'SELECT' ? el.selectedOptions[0].text : el.value]);
    });
    const d = f.elements.date || f.elements.arrivee;
    const dd = $('[data-date]', res); if (dd && d) dd.textContent = fmtDate(d.value);
    const dl = $('dl', res);
    if (dl) { dl.innerHTML = ''; rows.forEach(([k, v]) => { const dt = document.createElement('dt'), x = document.createElement('dd'); dt.textContent = k; x.textContent = v; dl.append(dt, x); }); }
    // séjour : nombre de nuits × prix de la chambre
    const est = $('.est', res);
    if (est) {
      est.textContent = '';
      const a = f.elements.arrivee, b = f.elements.depart, pick = $('select option:checked[data-pp]', f);
      if (a && b && a.value && b.value) {
        const n = Math.round((new Date(b.value) - new Date(a.value)) / 864e5);
        if (n < 1) { b.setCustomValidity('Le départ doit être après l’arrivée'); b.reportValidity(); b.setCustomValidity(''); return; }
        est.textContent = n + (n > 1 ? ' nuits' : ' nuit') + (pick ? ' · ' + eur(n * +pick.dataset.pp) + ' (' + pick.dataset.pp + ' € × ' + n + ')' : '');
      }
    }
    const go = $('a[data-go]', res);
    go.href = go.dataset.go + (go.dataset.go.includes('?') ? '&' : '?') + params + '#demande';
    f.hidden = true; res.classList.add('on');
  }));
  $$('[data-again]').forEach(b => b.addEventListener('click', () => {
    const res = b.closest('.res'); res.classList.remove('on'); res.parentElement.querySelector('form').hidden = false;
  }));

  // estimation : prix unitaire de l’option choisie × quantité
  $$('form.estim').forEach(f => {
    const out = $('.estim-out', f.parentElement), detail = $('.estim-detail', f.parentElement);
    const sel = $('select[data-pps]', f) || f.elements.formule, num = $('[data-n]', f) || f.elements.invites;
    const unit = num.dataset.unit || 'invités';
    const calc = () => {
      const opt = sel.selectedOptions[0];
      const n = Math.max(0, +num.value || 0);
      const pp = +opt.dataset.pp, min = +(opt.dataset.min || 0);
      const q = Math.max(n, min);
      out.textContent = n ? 'à partir de ' + eur(pp * q) : '—';
      detail.textContent = n ? `${opt.text} · ${q} ${unit} × ${String(pp).replace('.', ',')} €` + (q > n ? ` (minimum ${min})` : '') : 'Indiquez une quantité';
    };
    f.addEventListener('input', calc); calc();
    f.addEventListener('submit', e => {
      e.preventDefault();
      if (!f.reportValidity()) return;
      const p = new URLSearchParams();
      $$('[name]', f).forEach(el => el.value && p.set(el.name, el.value));
      location.href = f.getAttribute('action') + '?' + p + '#demande';
    });
  });

  // filtres de galerie
  $$('.filters').forEach(bar => bar.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    $$('button', bar).forEach(x => x.setAttribute('aria-pressed', x === b));
    const cat = b.dataset.cat;
    $$('figure[data-cat]', bar.nextElementSibling).forEach(fg => { fg.hidden = cat !== 'all' && fg.dataset.cat !== cat; });
  }));

  // visionneuse
  const figs = () => $$('figure[data-full]').filter(f => !f.hidden);
  let lb, cur = 0;
  function show(i) {
    const list = figs(); cur = (i + list.length) % list.length;
    const f = list[cur];
    $('img', lb).src = f.dataset.full; $('img', lb).alt = f.querySelector('b')?.textContent || '';
    $('.cap', lb).textContent = f.querySelector('figcaption')?.innerText.replace(/\n/g, ' · ') || '';
  }
  function openLb(f) {
    if (!lb) {
      lb = document.createElement('div'); lb.className = 'lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true');
      lb.innerHTML = '<img alt=""><div class="cap"></div><button class="x" aria-label="Fermer">×</button><button class="pv" aria-label="Photo précédente">‹</button><button class="nx" aria-label="Photo suivante">›</button>';
      document.body.append(lb);
      $('.x', lb).onclick = () => lb.classList.remove('on');
      $('.pv', lb).onclick = () => show(cur - 1);
      $('.nx', lb).onclick = () => show(cur + 1);
      lb.addEventListener('click', e => { if (e.target === lb) lb.classList.remove('on'); });
      addEventListener('keydown', e => {
        if (!lb.classList.contains('on')) return;
        if (e.key === 'Escape') lb.classList.remove('on');
        if (e.key === 'ArrowLeft') show(cur - 1);
        if (e.key === 'ArrowRight') show(cur + 1);
      });
    }
    lb.classList.add('on'); show(figs().indexOf(f)); $('.x', lb).focus();
  }
  $$('figure[data-full]').forEach(f => {
    f.tabIndex = 0; f.setAttribute('role', 'button');
    f.addEventListener('click', () => openLb(f));
    f.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLb(f); } });
  });

  // onglets
  $$('.tabs').forEach(t => {
    const tabs = $$('[role=tab]', t);
    tabs.forEach(b => b.addEventListener('click', () => {
      tabs.forEach(x => { x.setAttribute('aria-selected', x === b); $('#' + x.getAttribute('aria-controls')).hidden = x !== b; });
    }));
  });

  // liens de démonstration (réseaux, coordonnées fictives)
  $$('[data-demo]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); toast(a.dataset.demo); }));

  $$('[data-year]').forEach(s => { s.textContent = new Date().getFullYear(); });
})();
