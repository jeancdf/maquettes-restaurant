// Pastille « Je veux ce site » sur les maquettes ouvertes seules (pas dans le comparateur, qui a déjà son bouton).
// <script src="kit/cta.js" data-secteur="garage" data-modele="duval" defer></script>
(() => {
  if (window.top !== window) return;
  const me = document.currentScript || document.querySelector('script[src$="kit/cta.js"]');
  const secteur = me?.dataset.secteur || '', modele = me?.dataset.modele || '';
  try { if (sessionStorage.getItem('cta-ferme')) return; } catch (_) {}
  const url = 'https://client-contact.fr/?' + new URLSearchParams({ utm_source: 'maquettes', utm_medium: 'pastille', utm_campaign: secteur, utm_content: modele });
  const css = document.createElement('style');
  css.textContent = `
  .cc-pill{position:fixed;left:16px;bottom:16px;z-index:300;display:flex;align-items:center;gap:4px;background:#fff;color:#0f172a;border-radius:999px;box-shadow:0 10px 30px rgba(15,23,42,.22),0 0 0 1px rgba(15,23,42,.06);padding:5px 5px 5px 14px;font:500 13.5px/1.2 Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;max-width:calc(100vw - 32px)}
  .cc-pill>span{white-space:nowrap;color:#475569}
  .cc-pill a{display:inline-flex;align-items:center;gap:6px;background:#0964F4;color:#fff;text-decoration:none;font-weight:600;border-radius:999px;padding:9px 14px;margin-left:6px;white-space:nowrap}
  .cc-pill a:hover{background:#0752c9}
  .cc-pill a:focus-visible,.cc-pill button:focus-visible{outline:2px solid #0964F4;outline-offset:2px}
  .cc-pill button{border:0;background:none;color:#64748b;width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:18px;line-height:1}
  .cc-pill button:hover{background:#f1f5f9;color:#0f172a}
  @media (max-width:760px){.cc-pill{bottom:92px;left:12px;padding-left:12px}.cc-pill>span{display:none}.cc-pill a{margin-left:0}}`;
  document.head.append(css);
  const pill = document.createElement('div');
  pill.className = 'cc-pill'; pill.setAttribute('role', 'complementary'); pill.setAttribute('aria-label', 'Maquette de démonstration');
  pill.innerHTML = `<span>Maquette de démonstration</span><a href="${url}" target="_blank" rel="noopener">Je veux ce site pour mon commerce <span aria-hidden="true" style="color:inherit">→</span></a><button type="button" aria-label="Masquer">×</button>`;
  pill.querySelector('button').onclick = () => { pill.remove(); try { sessionStorage.setItem('cta-ferme', '1'); } catch (_) {} };
  document.body.append(pill);
})();
