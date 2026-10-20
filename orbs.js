(function () {
  // aurora glow: three soft bands that drift and breathe
  const aurora = document.createElement('div');
  aurora.classList.add('aurora');
  for (let i = 1; i <= 3; i++) {
    const band = document.createElement('div');
    band.classList.add('aurora-band', 'aurora-band-' + i);
    aurora.appendChild(band);
  }
  document.body.appendChild(aurora);

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // floating orbs
  const count = window.innerWidth < 700 ? 12 : 25;

  for (let i = 0; i < count; i++) {
    const orb = document.createElement('div');
    orb.classList.add('orb');

    const size = Math.random() * 12 + 6;
    const duration = Math.random() * 8 + 8;

    orb.style.width = size + 'px';
    orb.style.height = size + 'px';
    orb.style.left = Math.random() * 100 + 'vw';
    orb.style.animationDuration = duration + 's';
    orb.style.animationDelay = -(Math.random() * duration) + 's';
    orb.style.setProperty('--drift', (Math.random() * 120 - 60) + 'px');

    document.body.appendChild(orb);
  }
})();