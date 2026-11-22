(async () => {
  const CATS = ["brakes","air-filters","oil-filters","spark-plugs","cables","levers","grips","ball-joints","tie-rods","wheel-bearings","steering-bearings","swing-arm-bearings","stators","regulators","starters","cdi-boxes","ignition-coils","batteries","complete-carburetors","carburetor-parts","petcocks","piston-kits","gaskets","sprockets","chains","axles-wide-open","tires","clutch"];
  const P = new DOMParser();
  const seen = new Set(), out = [];
  window.__H = { out, log: [], done: false };
  const links = [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href').split('?')[0]).filter(h => /^https:\/\/jmatv\.com\/[^/]+\/[^/]+\/?/.test(h) || /^\/[a-z0-9-]+\/[a-z0-9-]+\/?$/.test(h));
  const catUrls = [...new Set(links)].filter(h => CATS.some(c => h.includes(c)));
  for (const cu of catUrls) {
    if (out.length >= 520) break;
    for (let page = 1; page <= 4 && out.length < 520; page++) {
      try {
        const html = await (await fetch(cu + (page > 1 ? '?page=' + page : ''))).text();
        const d = P.parseFromString(html, 'text/html');
        const cards = [...d.querySelectorAll('article.card')];
        if (!cards.length) break;
        for (const c of cards) {
          const a = c.querySelector('.card-title a'); if (!a) continue;
          const href = a.getAttribute('href').split('?')[0]; if (seen.has(href)) continue;
          const img = c.querySelector('img'); const src = img ? (img.getAttribute('data-src') || img.getAttribute('src') || '').split('?')[0] : '';
          if (!src || /ProductDefault/.test(src)) continue;
          const price = [...c.querySelectorAll('.price--withoutTax')].map(e => e.textContent.trim()).filter(Boolean)[0] || '';
          if (!price) continue;
          seen.add(href);
          out.push({ n: a.textContent.trim(), u: href, i: src.replace(/\/\d+x\d+\//, '/500x659/'), p: price, b: ((c.querySelector('.card-text--brand,[data-test-info-type=brandName]') || {}).textContent || '').trim(), c: cu.replace(/https:\/\/jmatv\.com/, '') });
        }
        window.__H.log.push(cu + ' p' + page + ' -> ' + out.length);
      } catch (e) { window.__H.log.push(cu + ' ERR'); break; }
    }
  }
  window.__H.done = true;
})();
