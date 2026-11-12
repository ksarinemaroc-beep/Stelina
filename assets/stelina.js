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
