/**
 * script.js — Efectos interactivos del sitio portfolio
 *
 * Contenido:
 *  1. Navbar (scroll + hamburger)
 *  2. Efecto taza de café (scroll → llenado animado)
 *  3. Reveal on Scroll (Intersection Observer)
 *  4. Tabs de galería de estilos
 *  5. Formulario de contacto (validación + éxito)
 *  6. Helper: scroll suave a sección
 */

/* ============================================================
   ESPERAR QUE EL DOM ESTÉ LISTO
============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initCoffeeEffect();
  initRevealObserver();
  initStyleTabs();
  initContactForm();
});

/* ============================================================
   1. NAVBAR
   - Agrega clase 'scrolled' al hacer scroll (activa fondo translúcido)
   - Hamburger para mobile
============================================================ */
function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  // Cambio de fondo al scrollear
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  // Toggle menú mobile
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen);

    // Animación hamburger → X
    hamburger.querySelectorAll('span').forEach((span, i) => {
      if (isOpen) {
        if (i === 0) span.style.transform = 'translateY(7px) rotate(45deg)';
        if (i === 1) span.style.opacity = '0';
        if (i === 2) span.style.transform = 'translateY(-7px) rotate(-45deg)';
      } else {
        span.style.transform = '';
        span.style.opacity = '';
      }
    });
  });

  // Cerrar menú al hacer click en un link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', false);
      hamburger.querySelectorAll('span').forEach(span => {
        span.style.transform = '';
        span.style.opacity = '';
      });
    });
  });
}

/* ============================================================
   2. EFECTO TAZA DE CAFÉ
   Cómo funciona:
   - Se calcula qué tan lejos está el usuario del inicio de la página
   - El porcentaje va de 0% a 100% durante el primer 80% del scroll total
   - El rect SVG del café crece hacia arriba desde y=158 (base de la taza)
   - La altura máxima es ~100px (desde y=58 hasta y=158 = borde superior de la taza)
   - El vapor aparece cuando progress > 85%
   - El número contador se actualiza en tiempo real

   Parámetros ajustables:
     CUP_BASE_Y    → coordenada Y del fondo de la taza en el SVG (no cambiar sin ajustar el SVG)
     CUP_MAX_H     → altura máxima del relleno en píxeles SVG (del fondo al borde)
     SCROLL_END    → hasta qué fracción del scroll total se llena (0.8 = 80%)
     FOAM_RATIO    → fracción del relleno que ocupa la espuma (ej: 0.12 = 12%)
     STEAM_AT      → progreso (0-1) a partir del cual aparece el vapor
============================================================ */
function initCoffeeEffect() {
  const coffeeFill     = document.getElementById('coffeeFill');
  const coffeeFoam     = document.getElementById('coffeeFoam');
  const foamShine      = document.getElementById('foamShine');
  const cupLabel       = document.getElementById('cupLabel');
  const steam          = document.getElementById('steam');
  const progressNum    = document.getElementById('progressNum');
  const progressLabel  = document.getElementById('coffeeProgress');
  const cupSvg         = document.querySelector('.cup-svg');
  const coffeeCaption  = document.querySelector('.coffee-caption');

  // Parámetros ajustables ↓
  const CUP_BASE_Y   = 158;    // Y del fondo de la taza (coordenada SVG)
  const CUP_MAX_H    = 100;    // Altura máxima del relleno (píxeles SVG)
  const SCROLL_END   = 0.80;   // Qué fracción del scroll total llena la taza
  const FOAM_RATIO   = 0.10;   // Fracción de la altura que ocupa la espuma
  const STEAM_AT     = 0.85;   // Progress mínimo para mostrar vapor

  // Si los elementos no existen (seguridad), salir
  if (!coffeeFill) return;

  let lastProgress = -1; // Evitar renderizados innecesarios

  function updateCoffee() {
    // Progreso de scroll: 0 (inicio) → 1 (SCROLL_END del documento)
    const scrollY    = window.scrollY;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    const rawProgress = scrollY / (docHeight * SCROLL_END);
    const progress   = Math.min(1, Math.max(0, rawProgress));

    // Throttle: solo actualizar si cambió significativamente
    if (Math.abs(progress - lastProgress) < 0.005) return;
    lastProgress = progress;

    const pct = Math.round(progress * 100);

    // Altura del café y espuma
    const coffeeH = progress * CUP_MAX_H;
    const foamH   = coffeeH * FOAM_RATIO;

    // Posición Y del café (crece hacia arriba = Y disminuye)
    const coffeeY = CUP_BASE_Y - coffeeH;
    const foamY   = coffeeY - foamH;

    // Aplicar al SVG
    coffeeFill.setAttribute('y',      coffeeY);
    coffeeFill.setAttribute('height', coffeeH);

    coffeeFoam.setAttribute('y',      foamY);
    coffeeFoam.setAttribute('height', foamH);

    // Brillo de espuma
    foamShine.setAttribute('cy',      foamY + foamH * 0.3);
    foamShine.setAttribute('opacity', progress > 0.1 ? Math.min(progress * 0.5, 0.3) : 0);

    // Label "WEB" aparece cuando está casi lleno
    cupLabel.setAttribute('y',       coffeeY - 10);
    cupLabel.setAttribute('opacity', progress > 0.6 ? (progress - 0.6) * 2.5 : 0);

    // Contador numérico
    progressNum.textContent = pct;

    // Vapor al alcanzar STEAM_AT
    steam.classList.toggle('visible', progress >= STEAM_AT);

    // Glow de la taza al llenarse
    cupSvg.classList.toggle('filled', progress >= STEAM_AT);

    // Cambiar caption
    if (progress >= 1) {
      coffeeCaption.textContent = '☕ ¡Listo! Tu sitio web también puede estar listo.';
    } else if (progress >= 0.5) {
      coffeeCaption.textContent = 'Seguí scrolleando…';
    } else {
      coffeeCaption.textContent = 'Hacé scroll para ver la magia ↓';
    }

    // Mostrar/ocultar el contador
    progressLabel.style.opacity = progress > 0.02 ? '1' : '0';
  }

  // Escuchar scroll con passive: true para mejor performance
  window.addEventListener('scroll', updateCoffee, { passive: true });
  // Correr una vez al cargar por si ya hay scroll
  updateCoffee();
}

/* ============================================================
   3. REVEAL ON SCROLL (Intersection Observer)
   Cómo funciona:
   - Todos los elementos con clase .reveal arrancan invisibles (CSS)
   - El observer detecta cuándo entran en el viewport
   - Al entrar, agrega clase .visible que activa la transición CSS
   - threshold: 0.15 = el elemento debe ser 15% visible para dispararse

   Para agregar más elementos animados: dale clase .reveal en el HTML
   Para controlar el orden: añadí .reveal--delay-1/2/3
============================================================ */
function initRevealObserver() {
  const revealElements = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Dejar de observar después de animar (mejora performance)
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,          // Cuánta parte del elemento debe ser visible
      rootMargin: '0px 0px -40px 0px'  // Trigger un poco antes del borde inferior
    }
  );

  revealElements.forEach(el => observer.observe(el));
}

/* ============================================================
   4. TABS DE GALERÍA DE ESTILOS
   Cómo funciona:
   - Cada botón tiene data-tab="minimal|corporate|creative"
   - Al click: remueve .tab-btn--active de todos, agrega al clickeado
   - Oculta todos los .style-demo, muestra el correspondiente (#demo-{tab})
   - Actualiza aria-selected para accesibilidad
============================================================ */
function initStyleTabs() {
  const tabBtns  = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.style-demo');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;

      // Actualizar botones
      tabBtns.forEach(b => {
        b.classList.remove('tab-btn--active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('tab-btn--active');
      btn.setAttribute('aria-selected', 'true');

      // Actualizar paneles
      tabPanels.forEach(panel => {
        panel.classList.remove('style-demo--active');
      });
      const targetPanel = document.getElementById(`demo-${targetTab}`);
      if (targetPanel) {
        targetPanel.classList.add('style-demo--active');
      }
    });

    // Soporte de teclado: Enter y Space activan el tab
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });
}

/* ============================================================
   5. FORMULARIO DE CONTACTO
   Cómo funciona:
   - Validación básica de campos requeridos antes de enviar
   - Muestra errores inline si falta nombre o email inválido
   - Al enviar exitosamente: oculta el form, muestra mensaje de éxito
   - Simula envío (timeout de 1.2s) — para conectar a un backend real,
     reemplazá el bloque "simulateSubmit" por un fetch() a tu API

   Para conectar un backend real:
     Reemplazá simulateSubmit() por:
     fetch('/api/contact', { method:'POST', body: formData })
       .then(r => r.json())
       .then(data => showSuccess())
       .catch(err => showError(err))
============================================================ */
function initContactForm() {
  const form       = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');
  const submitBtn  = document.getElementById('submitBtn');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Limpiar errores previos
    clearErrors();

    // Validar
    const name  = document.getElementById('nameInput');
    const email = document.getElementById('emailInput');
    let valid = true;

    if (!name.value.trim() || name.value.trim().length < 2) {
      showFieldError(name, 'Por favor ingresá tu nombre');
      valid = false;
    }

    if (!email.value.trim() || !isValidEmail(email.value)) {
      showFieldError(email, 'Ingresá un email válido');
      valid = false;
    }

    if (!valid) return;

    // Simular envío
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando…';

    simulateSubmit(() => {
      form.style.display = 'none';
      formSuccess.classList.add('visible');
    });
  });

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showFieldError(input, message) {
    const errorEl = document.createElement('p');
    errorEl.className = 'field-error';
    errorEl.textContent = message;
    errorEl.style.cssText = 'color:#ff6b6b; font-size:0.75rem; margin-top:4px;';
    input.parentNode.appendChild(errorEl);
    input.style.borderColor = '#ff6b6b';
  }

  function clearErrors() {
    document.querySelectorAll('.field-error').forEach(el => el.remove());
    document.querySelectorAll('.form-group input, .form-group textarea').forEach(el => {
      el.style.borderColor = '';
    });
  }

  /**
   * simulateSubmit — Reemplazar con fetch() real en producción
   * @param {Function} callback - Se ejecuta cuando el "envío" termina
   */
  function simulateSubmit(callback) {
    setTimeout(callback, 1200);
  }
}

/* ============================================================
   6. HELPER: SCROLL SUAVE A SECCIÓN
   Llamado desde botones en el HTML con onclick="scrollToSection('id')"
   Agrega un offset de 80px para no quedar detrás del navbar fijo.
============================================================ */
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const navHeight = 80;
  const top = el.getBoundingClientRect().top + window.scrollY - navHeight;
  window.scrollTo({ top, behavior: 'smooth' });
}
