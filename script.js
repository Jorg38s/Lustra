/* ==========================================================
   LUSTRA · Autolavado y Detailing
   Edita CONFIG para cambiar nombre, contacto, WhatsApp y recargos.
   ========================================================== */

const CONFIG = {
  businessName: "Lustra",
  tagline: "Cada detalle, a su brillo.",
  taglineLong:
    "Lavado a mano, detailing y protección de pintura con productos de calidad y atención con hora agendada. Sin apuros, sin atajos.",

  // Datos de contacto de DEMOSTRACIÓN: reemplázalos por los reales.
  phoneDisplay: "+56 9 1234 5678",
  phoneDial: "+56912345678",          // formato para llamar (tel:)
  whatsappNumber: "56912345678",      // solo dígitos, con código de país (56 = Chile)
  address: "Av. Ejemplo 1234, Santiago",
  hoursWeek: "Lunes a viernes · 09:00 – 19:00",
  hoursSat: "Sábado · 09:00 – 15:00",
  hoursSun: "Domingo · cerrado",

  social: {
    instagram: "https://www.instagram.com/tu_usuario",
    facebook: "https://www.facebook.com/tu_usuario",
    tiktok: "https://www.tiktok.com/@tu_usuario",
  },

  // Multiplicador de precio según tipo de vehículo (1 = precio base).
  sizeMultipliers: { auto: 1, suv: 1.2, camioneta: 1.4 },
  sizeLabels: { auto: "auto", suv: "SUV", camioneta: "camioneta" },

};

const state = { size: "auto" };

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

const formatCLP = (value) =>
  new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(value);

const whatsappUrl = (message) =>
  `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;

/* ---------- Datos del negocio en la página ---------- */
function applyBusinessData() {
  const textMap = {
    businessName: CONFIG.businessName,
    tagline: CONFIG.tagline,
    "tagline-long": CONFIG.taglineLong,
    phoneDisplay: CONFIG.phoneDisplay,
    address: CONFIG.address,
    hoursWeek: CONFIG.hoursWeek,
    hoursSat: CONFIG.hoursSat,
    hoursSun: CONFIG.hoursSun,
  };
  $$("[data-bind]").forEach((el) => {
    const value = textMap[el.dataset.bind];
    if (value) el.textContent = value;
  });

  const hrefMap = {
    phone: `tel:${CONFIG.phoneDial}`,
    instagram: CONFIG.social.instagram,
    facebook: CONFIG.social.facebook,
    tiktok: CONFIG.social.tiktok,
  };
  $$("[data-href]").forEach((el) => {
    const value = hrefMap[el.dataset.href];
    if (value) el.setAttribute("href", value);
  });

  document.title = `${CONFIG.businessName} · Autolavado y Detailing automotriz`;
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();
}

/* ---------- WhatsApp ---------- */
function updateWhatsappLinks() {
  $$("[data-wa]").forEach((link) => {
    let message = link.dataset.waMessage || "Hola, quiero reservar una hora.";
    if (link.hasAttribute("data-wa-plan")) {
      const plan = link.closest("[data-plan]");
      const sizeLabel = CONFIG.sizeLabels[state.size];
      message = `Hola, me interesa el paquete ${plan.dataset.plan} para mi ${sizeLabel}. ¿Tienen disponibilidad?`;
    }
    link.href = whatsappUrl(message);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  });
}

/* ---------- Menú móvil ---------- */
function initMenu() {
  const header = $(".site-header");
  const toggle = $(".menu-toggle");
  if (!header || !toggle) return;

  const setOpen = (open) => {
    header.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  };

  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));

  $$(".nav a").forEach((link) => link.addEventListener("click", () => setOpen(false)));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && header.classList.contains("is-open")) {
      setOpen(false);
      toggle.focus();
    }
  });

  window.matchMedia("(min-width: 901px)").addEventListener("change", (event) => {
    if (event.matches) setOpen(false);
  });

  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 12);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* ---------- Enlace activo según sección ---------- */
function initActiveNav() {
  const links = $$(".nav__link");
  const sections = links.map((l) => $(l.getAttribute("href"))).filter(Boolean);
  if (!("IntersectionObserver" in window) || !sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === `#${entry.target.id}`));
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => observer.observe(s));
}

/* ---------- Aparición al hacer scroll ---------- */
function initReveal() {
  const items = $$(".reveal");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  items.forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 70}ms`;
    observer.observe(el);
  });
}

/* ---------- Servicios (acordeón) ---------- */
function initServices() {
  $$(".service__toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.closest(".service");
      const panel = document.getElementById(button.getAttribute("aria-controls"));
      const willOpen = button.getAttribute("aria-expanded") !== "true";

      // Solo un servicio abierto a la vez
      $$(".service.is-open").forEach((open) => {
        if (open === item) return;
        open.classList.remove("is-open");
        $(".service__toggle", open).setAttribute("aria-expanded", "false");
        document.getElementById($(".service__toggle", open).getAttribute("aria-controls")).hidden = true;
      });

      item.classList.toggle("is-open", willOpen);
      button.setAttribute("aria-expanded", String(willOpen));
      panel.hidden = !willOpen;
    });
  });
}

/* ---------- Precios por tipo de vehículo ---------- */
function renderPrices() {
  const multiplier = CONFIG.sizeMultipliers[state.size] ?? 1;
  $$("[data-plan]").forEach((plan) => {
    const base = Number(plan.dataset.price);
    const rounded = Math.round((base * multiplier) / 100) * 100;
    $("[data-price-output]", plan).textContent = formatCLP(rounded);
  });
  updateWhatsappLinks();
}

function initSizePicker() {
  const buttons = $$(".size-picker__btn");
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      state.size = button.dataset.size;
      buttons.forEach((b) => {
        const active = b === button;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-checked", String(active));
      });
      renderPrices();
    });
  });
}

/* ---------- Comparador antes / después ---------- */
function initCompare() {
  const stage = $("#compare");
  const range = $(".compare__range");
  if (!stage || !range) return;
  const update = () => stage.style.setProperty("--pos", `${range.value}%`);
  range.addEventListener("input", update);
  update();
}

/* ---------- Filtros de galería ---------- */
function initGalleryFilters() {
  const filters = $$(".filter");
  const tiles = $$(".tile");
  filters.forEach((button) => {
    button.addEventListener("click", () => {
      const selected = button.dataset.filter;
      filters.forEach((f) => {
        const active = f === button;
        f.classList.toggle("is-active", active);
        f.setAttribute("aria-pressed", String(active));
      });
      tiles.forEach((tile) => {
        tile.hidden = !(selected === "todo" || tile.dataset.category === selected);
        if (!tile.hidden) tile.classList.add("is-visible");
      });
    });
  });
}

/* ---------- Animación del auto (SMIL): se pausa con "movimiento reducido" ---------- */
function initCarAnimation() {
  const sprite = $(".sprite");
  if (sprite && typeof sprite.pauseAnimations === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    sprite.pauseAnimations();
  }
}

/* ---------- Inicio ---------- */
document.documentElement.classList.remove("no-js");
applyBusinessData();
initMenu();
initActiveNav();
initReveal();
initServices();
initSizePicker();
renderPrices();
initCompare();
initGalleryFilters();
initCarAnimation();