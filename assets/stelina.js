/* Stelina : petits comportements, sans bibliothèque. */
(() => {
  // Barre « livraison offerte » : repart de la valeur précédente quand le panier se met à jour.
  let lastRatio = null;

  class StelinaShippingBar extends HTMLElement {
    connectedCallback() {
      const fill = this.querySelector('.stl-ship__fill');
      const ratio = parseFloat(this.dataset.ratio);
      if (!fill || Number.isNaN(ratio)) return;

      if (lastRatio !== null && lastRatio !== ratio) {
        fill.style.transition = 'none';
        fill.style.transform = `scaleX(${lastRatio})`;
        void fill.offsetWidth; // applique la valeur de départ avant d'animer
        fill.style.transition = '';
        fill.style.transform = `scaleX(${ratio})`;
      }
      lastRatio = ratio;
    }
  }

  if (!customElements.get('stelina-shipping-bar')) {
    customElements.define('stelina-shipping-bar', StelinaShippingBar);
  }

  // Bandeau défilant : bouton pause.
  document.addEventListener('click', (event) => {
    const toggle = event.target.closest('[data-stl-marquee-toggle]');
    if (!toggle) return;
    const marquee = toggle.closest('[data-stl-marquee]');
    const paused = marquee.classList.toggle('is-paused');
    toggle.setAttribute('aria-pressed', String(paused));
  });

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const define = (name, ctor) => customElements.get(name) || customElements.define(name, ctor);

  // Campagne au défilement : chaque visuel recouvre le précédent du bas vers le haut.
  define(
    'stelina-cinema',
    class extends HTMLElement {
      connectedCallback() {
        this.slides = [...this.querySelectorAll('[data-cinema-slide]')];
        this.nav = this.querySelector('.stl-cinema__nav');
        this.bar = this.querySelector('[data-cinema-progress]');
        if (this.slides.length < 2 || this.hasAttribute('data-static')) return;
        this.abort = new AbortController();
        const options = { signal: this.abort.signal, passive: true };
        this.schedule = () => {
          if (!this.frame) this.frame = requestAnimationFrame(() => this.draw());
        };
        window.addEventListener('scroll', this.schedule, options);
        window.addEventListener('resize', this.schedule, options);
        reducedMotion.addEventListener('change', this.schedule, options);
        this.nav?.addEventListener(
          'click',
          (event) => {
            const button = event.target.closest('[data-cinema-index]');
            if (!button) return;
            const rect = this.getBoundingClientRect();
            const distance = rect.height - window.innerHeight;
            const step = Number(button.dataset.cinemaIndex) / (this.slides.length - 1);
            window.scrollTo({ top: rect.top + window.scrollY + distance * step, behavior: 'smooth' });
          },
          { signal: this.abort.signal }
        );
        this.initFilm();
        this.draw();
      }

      // Film au défilement : charge la planche d'images après le premier affichage.
      initFilm() {
        const canvas = this.querySelector('[data-cinema-canvas]');
        if (!canvas || reducedMotion.matches) return;
        const frames = Number(canvas.dataset.frames);
        const columns = Number(canvas.dataset.columns);
        if (!frames || !columns) return;
        this.classList.add('has-film');
        const sheet = new Image();
        sheet.decoding = 'async';
        sheet.onload = () => {
          const rows = Math.ceil(frames / columns);
          const width = sheet.naturalWidth / columns;
          const height = sheet.naturalHeight / rows;
          canvas.width = Math.round(width);
          canvas.height = Math.round(height);
          this.film = { canvas, context: canvas.getContext('2d'), sheet, frames, columns, width, height, last: -1 };
          this.classList.add('is-film-ready');
          this.schedule();
        };
        const large = window.innerWidth * (window.devicePixelRatio || 1) > 1400;
        const start = () => (sheet.src = large ? canvas.dataset.srcLarge : canvas.dataset.srcSmall);
        if (document.readyState === 'complete') start();
        else window.addEventListener('load', start, { once: true });
      }

      drawFilm(ratio) {
        const film = this.film;
        if (!film) return;
        const index = Math.min(film.frames - 1, Math.max(0, Math.round(ratio * (film.frames - 1))));
        if (index === film.last) return;
        film.last = index;
        const x = (index % film.columns) * film.width;
        const y = Math.floor(index / film.columns) * film.height;
        film.context.drawImage(film.sheet, x, y, film.width, film.height, 0, 0, film.canvas.width, film.canvas.height);
      }

      disconnectedCallback() {
        this.abort?.abort();
        cancelAnimationFrame(this.frame);
        this.frame = null;
      }

      draw() {
        this.frame = null;
        const active = !reducedMotion.matches;
        this.classList.toggle('is-active', active);
        if (this.nav) this.nav.hidden = !active;
        const last = this.slides.length - 1;
        let progress = 0;
        if (active) {
          const rect = this.getBoundingClientRect();
          const distance = Math.max(1, rect.height - window.innerHeight);
          progress = Math.min(1, Math.max(0, -rect.top / distance)) * last;
        }
        const current = Math.round(progress);
        this.slides.forEach((slide, index) => {
          const picture = slide.querySelector('[data-cinema-picture]');
          const media = picture?.firstElementChild;
          const copy = slide.querySelector('[data-cinema-copy]');
          const reveal = Math.min(1, Math.max(0, progress - (index - 1))); // 0 → 1 : le visuel se découvre
          const leave = Math.min(1, Math.max(0, progress - index)); // 0 → 1 : le suivant le recouvre
          const film = active && this.classList.contains('has-film');
          if (picture) picture.style.clipPath = active && !film && index > 0 ? `inset(${(1 - reveal) * 100}% 0 0 0)` : '';
          if (media) media.style.transform = active && !film ? `scale(${(1.08 - 0.08 * reveal + 0.05 * leave).toFixed(4)})` : '';
          slide.classList.toggle('is-current', !active || index === current);
          if (copy) copy.inert = active && index !== current;
          this.nav?.children[index]?.setAttribute('aria-current', index === current ? 'step' : 'false');
        });
        if (this.bar) this.bar.style.transform = `scaleX(${(progress / last).toFixed(4)})`;
        if (active) this.drawFilm(progress / last);
      }
    }
  );

  // Galerie « seul / porté » : bascule, filtres et « afficher plus ».
  define(
    'stelina-duos',
    class extends HTMLElement {
      connectedCallback() {
        this.cards = [...this.querySelectorAll('.stl-duo')];
        this.limit = Number(this.dataset.initial) || 8;
        this.filter = 'all';
        this.filters = this.querySelector('.stl-duos__filters');
        this.more = this.querySelector('.stl-duos__more');
        this.querySelectorAll('.stl-duo__toggle').forEach((button) => (button.hidden = false));
        if (this.filters) this.filters.hidden = false;
        this.addEventListener('click', this);
        this.render(false);
      }

      handleEvent(event) {
        const toggle = event.target.closest('.stl-duo__toggle');
        if (toggle) {
          const worn = toggle.closest('.stl-duo').classList.toggle('is-worn');
          toggle.setAttribute('aria-pressed', String(worn));
          return;
        }
        const pill = event.target.closest('[data-duo-filter]');
        if (pill) {
          this.filter = pill.dataset.duoFilter;
          this.limit = Number(this.dataset.initial) || 8;
          this.filters.querySelectorAll('[data-duo-filter]').forEach((item) => {
            item.classList.toggle('is-current', item === pill);
            item.setAttribute('aria-pressed', String(item === pill));
          });
          this.render(true);
          return;
        }
        if (event.target.closest('[data-duo-more]')) {
          const firstNew = this.limit;
          this.limit += Number(this.dataset.initial) || 8;
          this.render(true, firstNew);
        }
      }

      render(animate, from = 0) {
        const matching = this.cards.filter((card) => this.filter === 'all' || card.dataset.category === this.filter);
        this.cards.forEach((card) => {
          card.hidden = true;
          card.classList.remove('is-entering');
        });
        matching.slice(0, this.limit).forEach((card, index) => {
          card.hidden = false;
          if (animate && index >= from) {
            card.style.setProperty('--stl-i', Math.min(index - from, 7));
            void card.offsetWidth;
            card.classList.add('is-entering');
          }
        });
        if (this.more) this.more.hidden = matching.length <= this.limit;
        if (from > 0) matching[from]?.querySelector('button, a')?.focus({ preventScroll: true });
      }
    }
  );

  // Carrousel : défilement natif, flèches en complément.
  define(
    'stelina-gallery',
    class extends HTMLElement {
      connectedCallback() {
        const track = this.querySelector('.stl-gallery__track');
        const controls = this.querySelector('.stl-gallery__controls');
        if (!track || !controls) return;
        const [previous, next] = controls.querySelectorAll('button');
        const update = () => {
          const limit = track.scrollWidth - track.clientWidth;
          controls.hidden = limit < 2;
          previous.setAttribute('aria-disabled', String(track.scrollLeft < 2));
          next.setAttribute('aria-disabled', String(track.scrollLeft >= limit - 2));
        };
        controls.addEventListener('click', (event) => {
          const button = event.target.closest('[data-gallery-step]');
          const card = track.firstElementChild;
          if (!button || !card || button.getAttribute('aria-disabled') === 'true') return;
          const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
          const step = card.getBoundingClientRect().width + gap;
          const perView = Math.max(1, Math.floor(track.clientWidth / step));
          track.scrollBy({
            left: Number(button.dataset.galleryStep) * step * perView,
            behavior: reducedMotion.matches ? 'auto' : 'smooth',
          });
        });
        track.addEventListener('scroll', update, { passive: true });
        this.observer = new ResizeObserver(update);
        this.observer.observe(track);
        update();
      }

      disconnectedCallback() {
        this.observer?.disconnect();
      }
    }
  );

  // Cartes produit : bouton « Vue portée ».
  document.addEventListener('click', (event) => {
    const toggle = event.target.closest('[data-stl-card-toggle]');
    if (!toggle) return;
    event.preventDefault();
    const worn = toggle.closest('.card__inner').classList.toggle('is-worn');
    toggle.setAttribute('aria-pressed', String(worn));
  });

  // Accueil : le petit logo de l'en-tête réapparaît quand le grand logo sort de l'écran.
  const initHeroLogo = () => {
    const root = document.documentElement;
    const heroLogo = document.querySelector('[data-stl-hero-logo]');
    if (!heroLogo || !('IntersectionObserver' in window)) {
      root.classList.remove('stl-hero-logo-visible');
      return;
    }
    new IntersectionObserver(
      ([entry]) => root.classList.toggle('stl-hero-logo-visible', entry.isIntersecting),
      { rootMargin: '-80px 0px 0px 0px' }
    ).observe(heroLogo);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroLogo);
  } else {
    initHeroLogo();
  }
  document.addEventListener('shopify:section:load', initHeroLogo);
})();
