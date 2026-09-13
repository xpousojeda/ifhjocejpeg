const BOOKING_ENDPOINT = 'PASTE_APPS_SCRIPT_URL_HERE'; // Paste the deployed Google Apps Script web app URL here.

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initNavigation() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  if (!toggle || !nav) return;

  const closeNav = () => {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');
    nav.classList.remove('is-open');
    document.body.classList.remove('nav-open');
  };

  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    toggle.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation');
    nav.classList.toggle('is-open', !open);
    document.body.classList.toggle('nav-open', !open);
  });

  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeNav();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeNav();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) closeNav();
  });
}

function initCarousel() {
  const carousel = document.querySelector('[data-carousel]');
  if (!carousel) return;

  const slides = [...carousel.querySelectorAll('[data-slide]')];
  const prev = carousel.querySelector('[data-carousel-prev]');
  const next = carousel.querySelector('[data-carousel-next]');
  const dotsWrap = carousel.querySelector('[data-carousel-dots]');
  let current = 0;
  let timer = null;
  let touchStartX = 0;
  let touchEndX = 0;

  slides.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'hero-carousel__dot';
    dot.setAttribute('aria-label', `Show featured photo ${index + 1}`);
    dot.addEventListener('click', () => showSlide(index, true));
    dotsWrap.appendChild(dot);
  });

  const dots = [...dotsWrap.children];

  function showSlide(index, restart = false) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === current;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
    });
    dots.forEach((dot, dotIndex) => {
      const active = dotIndex === current;
      dot.classList.toggle('is-active', active);
      dot.setAttribute('aria-current', active ? 'true' : 'false');
    });
    if (restart) restartTimer();
  }

  function stopTimer() {
    if (timer) window.clearInterval(timer);
    timer = null;
  }

  function startTimer() {
    if (prefersReducedMotion || timer) return;
    timer = window.setInterval(() => showSlide(current + 1), 7000);
  }

  function restartTimer() {
    stopTimer();
    startTimer();
  }

  prev?.addEventListener('click', () => showSlide(current - 1, true));
  next?.addEventListener('click', () => showSlide(current + 1, true));

  carousel.addEventListener('mouseenter', stopTimer);
  carousel.addEventListener('mouseleave', startTimer);
  carousel.addEventListener('focusin', stopTimer);
  carousel.addEventListener('focusout', (event) => {
    if (!carousel.contains(event.relatedTarget)) startTimer();
  });

  carousel.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      showSlide(current - 1, true);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      showSlide(current + 1, true);
    }
  });

  carousel.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].clientX;
  }, { passive: true });

  carousel.addEventListener('touchend', (event) => {
    touchEndX = event.changedTouches[0].clientX;
    const delta = touchEndX - touchStartX;
    if (Math.abs(delta) < 45) return;
    showSlide(current + (delta < 0 ? 1 : -1), true);
  }, { passive: true });

  showSlide(0);
  startTimer();
}

function initPortfolioFilters() {
  const gallery = document.querySelector('[data-gallery]');
  const chips = [...document.querySelectorAll('[data-filter]')];
  if (!gallery || !chips.length) return;

  const cards = [...gallery.querySelectorAll('[data-category]')];

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const filter = chip.dataset.filter;
      chips.forEach((item) => {
        const active = item === chip;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });

      cards.forEach((card) => {
        const matches = filter === 'all' || card.dataset.category.split(' ').includes(filter);
        if (matches) {
          card.hidden = false;
          requestAnimationFrame(() => card.classList.remove('is-filtering-out'));
        } else {
          card.classList.add('is-filtering-out');
          window.setTimeout(() => {
            if (card.classList.contains('is-filtering-out')) card.hidden = true;
          }, 320);
        }
      });
    });
  });
}

function initLightbox() {
  const lightbox = document.querySelector('[data-lightbox]');
  const gallery = document.querySelector('[data-gallery]');
  if (!lightbox || !gallery) return;

  const image = lightbox.querySelector('[data-lightbox-image]');
  const close = lightbox.querySelector('[data-lightbox-close]');
  const prev = lightbox.querySelector('[data-lightbox-prev]');
  const next = lightbox.querySelector('[data-lightbox-next]');
  const backdrop = lightbox.querySelector('[data-lightbox-backdrop]');
  let activeTrigger = null;
  let currentIndex = 0;
  let touchStartX = 0;

  const getVisibleTriggers = () => [...gallery.querySelectorAll('[data-lightbox-trigger]')]
    .filter((trigger) => !trigger.closest('.gallery-card').hidden);

  function render(index) {
    const triggers = getVisibleTriggers();
    if (!triggers.length) return;
    currentIndex = (index + triggers.length) % triggers.length;
    const source = triggers[currentIndex].querySelector('img');
    image.src = source.currentSrc || source.src;
    image.srcset = source.srcset;
    image.sizes = 'min(90vw, 1500px)';
    image.alt = source.alt;
    image.width = source.width;
    image.height = source.height;
  }

  function openLightbox(trigger) {
    const triggers = getVisibleTriggers();
    activeTrigger = trigger;
    currentIndex = Math.max(0, triggers.indexOf(trigger));
    render(currentIndex);
    lightbox.hidden = false;
    document.body.classList.add('nav-open');
    close.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.classList.remove('nav-open');
    activeTrigger?.focus();
  }

  gallery.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-lightbox-trigger]');
    if (trigger) openLightbox(trigger);
  });

  close.addEventListener('click', closeLightbox);
  backdrop.addEventListener('click', closeLightbox);
  prev.addEventListener('click', () => render(currentIndex - 1));
  next.addEventListener('click', () => render(currentIndex + 1));

  lightbox.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].clientX;
  }, { passive: true });

  lightbox.addEventListener('touchend', (event) => {
    const delta = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) < 45) return;
    render(currentIndex + (delta < 0 ? 1 : -1));
  }, { passive: true });

  document.addEventListener('keydown', (event) => {
    if (lightbox.hidden) return;

    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') render(currentIndex - 1);
    if (event.key === 'ArrowRight') render(currentIndex + 1);

    if (event.key === 'Tab') {
      const focusable = [...lightbox.querySelectorAll('button:not([disabled]), a[href]')];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
}

function initReveal() {
  const elements = [...document.querySelectorAll('.reveal')];
  if (!elements.length) return;
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    elements.forEach((element) => element.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  elements.forEach((element) => observer.observe(element));
}

function initParallax() {
  const elements = [...document.querySelectorAll('.parallax-soft')];
  if (!elements.length || prefersReducedMotion) return;

  let ticking = false;
  function update() {
    const viewportCenter = window.innerHeight / 2;
    elements.forEach((element) => {
      if (window.innerWidth < 768) {
        element.style.removeProperty('--parallax-y');
        return;
      }
      const rect = element.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const shift = Math.max(-14, Math.min(14, (viewportCenter - center) * 0.018));
      element.style.setProperty('--parallax-y', `${shift}px`);
      element.style.translate = `0 var(--parallax-y)`;
    });
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  window.addEventListener('resize', update);
  update();
}

function initCursorFollowers() {
  if (prefersReducedMotion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const orbit = document.querySelector('[data-cursor-orbit]');
  const glow = document.querySelector('[data-cursor-glow]');
  if (!orbit || !glow) return;

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let orbitX = targetX;
  let orbitY = targetY;
  let glowX = targetX;
  let glowY = targetY;

  window.addEventListener('pointermove', (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
  }, { passive: true });

  function animate() {
    orbitX += (targetX - orbitX) * 0.12;
    orbitY += (targetY - orbitY) * 0.12;
    glowX += (targetX - glowX) * 0.055;
    glowY += (targetY - glowY) * 0.055;
    orbit.style.transform = `translate3d(${orbitX - 12}px, ${orbitY - 12}px, 0) rotate(${orbitX * 0.08}deg)`;
    glow.style.transform = `translate3d(${glowX - 36}px, ${glowY - 36}px, 0)`;
    requestAnimationFrame(animate);
  }
  animate();
}

function initBookingForm() {
  const form = document.querySelector('[data-booking-form]');
  if (!form) return;

  const success = document.querySelector('[data-booking-success]');
  const status = form.querySelector('[data-form-status]');
  const submitButton = form.querySelector('[data-submit-button]');
  const submitLabel = form.querySelector('[data-submit-label]');
  const submitLoading = form.querySelector('[data-submit-loading]');
  const dateInput = form.elements.preferredDate;

  const localTomorrow = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  dateInput.min = localTomorrow();

  const messages = {
    name: 'Please add your name.',
    email: 'Please enter a valid email address.',
    shootType: 'Please choose a shoot type.',
    preferredDate: 'Please choose a future date.',
    preferredTime: 'Please choose a preferred time.',
    location: 'Please add a location, venue, or rough area.',
    groupSize: 'Please enter a group size of at least 1.',
    budget: 'Please choose a budget range.',
    message: 'Please tell me a little about what you have in mind.',
    confirmEmail: 'Please confirm that you understand this is an inquiry.'
  };

  function setError(field, message = '') {
    const error = form.querySelector(`[data-error-for="${field.name}"]`);
    field.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (error) error.textContent = message;
  }

  function validateField(field) {
    if (!field || field.name === 'company') return true;
    let valid = true;

    if (field.required) {
      if (field.type === 'checkbox') valid = field.checked;
      else valid = field.value.trim() !== '';
    }

    if (valid && field.name === 'email') {
      valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(field.value.trim());
    }

    if (valid && field.name === 'preferredDate') {
      const chosen = new Date(`${field.value}T12:00:00`);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      valid = Number.isFinite(chosen.getTime()) && chosen > now;
    }

    if (valid && field.name === 'groupSize') {
      valid = Number(field.value) >= 1;
    }

    setError(field, valid ? '' : messages[field.name]);
    return valid;
  }

  [...form.elements].forEach((field) => {
    if (!field.name || field.name === 'company') return;
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.getAttribute('aria-invalid') === 'true') validateField(field);
    });
    field.addEventListener('change', () => {
      if (field.getAttribute('aria-invalid') === 'true') validateField(field);
    });
  });

  function validateForm() {
    const fields = [...form.elements].filter((field) => field.name && field.name !== 'company');
    const results = fields.map((field) => validateField(field));
    const firstInvalid = fields.find((field) => field.getAttribute('aria-invalid') === 'true');
    firstInvalid?.focus();
    return results.every(Boolean);
  }

  function setSending(sending) {
    submitButton.disabled = sending;
    submitLabel.hidden = sending;
    submitLoading.hidden = !sending;
    submitButton.setAttribute('aria-busy', String(sending));
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.textContent = '';
    status.classList.remove('is-error');

    if (form.elements.company.value.trim() !== '') {
      form.reset();
      return;
    }

    if (!validateForm()) return;

    if (BOOKING_ENDPOINT === 'PASTE_APPS_SCRIPT_URL_HERE') {
      status.classList.add('is-error');
      status.innerHTML = 'Booking is not connected yet. Please email <a href="mailto:jocelynnaranjo15@gmail.com">jocelynnaranjo15@gmail.com</a> so your inquiry is not lost.';
      return;
    }

    setSending(true);

    try {
      const formData = new FormData(form);
      await fetch(BOOKING_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        body: formData
      });

      form.hidden = true;
      success.hidden = false;
      success.focus();
    } catch (error) {
      status.classList.add('is-error');
      status.innerHTML = 'Something interrupted the send. Please email <a href="mailto:jocelynnaranjo15@gmail.com">jocelynnaranjo15@gmail.com</a> so your inquiry is not lost.';
      setSending(false);
    }
  });
}

initNavigation();
initCarousel();
initPortfolioFilters();
initLightbox();
initReveal();
initParallax();
initCursorFollowers();
initBookingForm();
