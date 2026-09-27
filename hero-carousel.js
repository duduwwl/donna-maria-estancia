(() => {
  const frame = document.querySelector('.hero-image-frame');
  if (!frame) return;
  const slides = [...frame.querySelectorAll('.hero-slide')];
  const dots = [...frame.querySelectorAll('.carousel-dot')];
  const counter = document.querySelector('#slideCounter');
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let index = Math.max(0, slides.findIndex(slide => slide.classList.contains('is-active')));
  let timer = null;
  let cleanupTimer = null;
  let hovered = false;
  let focused = false;
  let visible = true;
  let touchStart = null;

  function updateStatus() {
    slides.forEach((slide, i) => slide.setAttribute('aria-hidden', String(i !== index)));
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
      dot.setAttribute('aria-pressed', String(i === index));
    });
    if (counter) counter.textContent = `${String(index + 1).padStart(2, '0')} — ${String(slides.length).padStart(2, '0')}`;
  }

  function show(target, direction = 1) {
    const next = (target + slides.length) % slides.length;
    if (next === index) return;
    clearTimeout(cleanupTimer);
    const outgoing = slides[index];
    const incoming = slides[next];
    slides.forEach(slide => slide.classList.remove('is-exiting-left', 'is-exiting-right', 'is-entering-left', 'is-entering-right'));
    outgoing.classList.remove('is-active');
    outgoing.classList.add(direction > 0 ? 'is-exiting-right' : 'is-exiting-left');
    incoming.classList.add(direction > 0 ? 'is-entering-left' : 'is-entering-right');
    void incoming.offsetWidth;
    requestAnimationFrame(() => {
      incoming.classList.remove('is-entering-right', 'is-entering-left');
      incoming.classList.add('is-active');
    });
    index = next;
    updateStatus();
    cleanupTimer = setTimeout(() => {
      slides.forEach((slide, i) => {
        if (i !== index) slide.classList.remove('is-exiting-left', 'is-exiting-right', 'is-active');
      });
    }, 1150);
  }

  function play() {
    clearInterval(timer);
    if (!motionPreference.matches && !hovered && !focused && !document.hidden && visible) {
      timer = setInterval(() => show(index + 1, 1), 6000);
    }
  }

  frame.querySelectorAll('[data-carousel]').forEach(button => button.addEventListener('click', () => {
    const direction = button.dataset.carousel === 'next' ? 1 : -1;
    show(index + direction, direction);
    play();
  }));
  dots.forEach((dot, i) => dot.addEventListener('click', () => {
    show(i, i >= index ? 1 : -1);
    play();
  }));
  frame.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    show(index + direction, direction);
    play();
  });
  frame.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch') touchStart = { x: event.clientX, y: event.clientY };
  });
  frame.addEventListener('pointerup', event => {
    if (!touchStart) return;
    const x = event.clientX - touchStart.x;
    const y = event.clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(x) < 40 || Math.abs(x) < Math.abs(y) * 1.4) return;
    show(index + (x < 0 ? 1 : -1), x < 0 ? -1 : 1);
    play();
  });
  frame.addEventListener('pointercancel', () => { touchStart = null; });
  frame.addEventListener('mouseenter', () => { hovered = true; play(); });
  frame.addEventListener('mouseleave', () => { hovered = false; play(); });
  frame.addEventListener('focusin', () => { focused = true; play(); });
  frame.addEventListener('focusout', event => { focused = frame.contains(event.relatedTarget); play(); });
  document.addEventListener('visibilitychange', play);
  motionPreference.addEventListener('change', play);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; play(); }, { threshold: 0.2 }).observe(frame);
  }
  updateStatus();
  play();
})();

