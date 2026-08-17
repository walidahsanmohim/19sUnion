/* =========================================================
   NOVA — Futuristic Portfolio
   Interactive behaviors: theme toggle, mobile menu, scroll
   reveal, typewriter, animated counters, form validation.
   ========================================================= */

(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Shorthand helpers ---------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* =========================================================
     1. THEME TOGGLE (dark / light) with persistence
     ========================================================= */
  const themeToggle = $("#themeToggle");
  const savedTheme = localStorage.getItem("nova-theme");

  // Apply saved theme on load (default dark)
  if (savedTheme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
  }

  themeToggle.addEventListener("click", () => {
    const root = document.documentElement;
    const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    localStorage.setItem("nova-theme", next);
  });

  /* =========================================================
     2. STICKY HEADER — add shadow on scroll
     ========================================================= */
  const header = $("#header");
  const onScrollHeader = () => {
    header.classList.toggle("scrolled", window.scrollY > 40);
  };
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  /* =========================================================
     3. MOBILE MENU toggle + close on link click
     ========================================================= */
  const hamburger = $("#hamburger");
  const navMenu = $("#navMenu");

  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("open");
    navMenu.classList.toggle("open");
    hamburger.setAttribute("aria-expanded", navMenu.classList.contains("open") ? "true" : "false");
  });

  navMenu.addEventListener("click", (e) => {
    if (e.target.classList.contains("nav-link")) {
      hamburger.classList.remove("open");
      navMenu.classList.remove("open");
    }
  });

  /* =========================================================
     4. ACTIVE NAV LINK based on scroll position
     ========================================================= */
  const sections = $$("section[id]");
  const navLinks = $$(".nav-link");

  const onScrollActive = () => {
    let current = "home";
    sections.forEach((section) => {
      if (window.scrollY >= section.offsetTop - 120) {
        current = section.id;
      }
    });
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === "#" + current);
    });
  };
  window.addEventListener("scroll", onScrollActive, { passive: true });

  /* =========================================================
     5. SCROLL REVEAL — fade/slide elements into view
     ========================================================= */
  const revealEls = $$(".reveal");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.delay || 0;
          entry.target.style.transitionDelay = delay + "ms";
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => revealObserver.observe(el));

  /* =========================================================
     6. TYPEWRITER hero heading
     ========================================================= */
  const typewriterEl = $("#typewriter");
  const phrases = [
    "Building the Future.",
    "Design Meets Code.",
    "Crafting Digital Worlds.",
  ];
  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function typeTick() {
    const current = phrases[phraseIndex];
    const visible = current.slice(0, charIndex);
    typewriterEl.innerHTML = visible + '<span class="cursor">|</span>';

    if (!deleting) {
      charIndex++;
      if (charIndex > current.length) {
        deleting = true;
        return setTimeout(typeTick, 1600); // hold before deleting
      }
      return setTimeout(typeTick, 70);
    }

    charIndex--;
    if (charIndex === 0) {
      deleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
    }
    return setTimeout(typeTick, 35);
  }

  if (prefersReducedMotion) {
    typewriterEl.textContent = phrases[0] + " |";
  } else {
    typeTick();
  }
  /* =========================================================
     7. ANIMATED COUNTERS in hero stats
     ========================================================= */
  const counters = $$(".stat-num");
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const duration = 1400;
        const start = performance.now();

        function update(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
          el.textContent = Math.round(eased * target);
          if (progress < 1) {
            requestAnimationFrame(update);
          } else {
            el.textContent = target;
          }
        }

        if (prefersReducedMotion) {
          el.textContent = target;
        } else {
          requestAnimationFrame(update);
        }
        counterObserver.unobserve(el);
      });
    },
    { threshold: 0.6 }
  );
  counters.forEach((el) => counterObserver.observe(el));

  /* =========================================================
     8. CONTACT FORM validation + fake async submit
     ========================================================= */
  const form = $("#contactForm");
  const submitBtn = $("#submitBtn");
  const formStatus = $("#formStatus");

  const validators = {
    name: (v) => (v.trim().length >= 2 ? "" : "Please enter your name (min 2 chars)."),
    email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Please enter a valid email address."),
    subject: (v) => (v.trim().length >= 3 ? "" : "Please add a subject (min 3 chars)."),
    message: (v) => (v.trim().length >= 10 ? "" : "Message must be at least 10 characters."),
  };

  function setFieldState(input, message) {
    const group = input.closest(".form-group");
    const errorEl = $('[data-for="' + input.id + '"]', group);
    group.classList.toggle("invalid", Boolean(message));
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.toggle("show", Boolean(message));
    }
  }

  function validateField(input) {
    const fn = validators[input.name];
    if (!fn) return true;
    const msg = fn(input.value);
    setFieldState(input, msg);
    return msg === "";
  }

  // Validate on blur / input for live feedback
  ["name", "email", "subject", "message"].forEach((id) => {
    const input = document.getElementById(id);
    if (!input) return;
    input.addEventListener("input", () => {
      if (input.closest(".form-group").classList.contains("invalid")) {
        validateField(input);
      }
    });
    input.addEventListener("blur", () => validateField(input));
  });

  function showStatus(message, type) {
    formStatus.textContent = message;
    formStatus.className = "form-status show " + type;
    setTimeout(() => formStatus.classList.remove("show"), 5000);
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Validate all fields
    let allValid = true;
    ["name", "email", "subject", "message"].forEach((id) => {
      if (!validateField(document.getElementById(id))) allValid = false;
    });

    if (!allValid) {
      showStatus("Please fix the highlighted fields and try again.", "error");
      return;
    }

    // Simulate submit loading state
    submitBtn.classList.add("loading");
    submitBtn.disabled = true;
    formStatus.classList.remove("show");

    const payload = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
    };

    setTimeout(() => {
      submitBtn.classList.remove("loading");
      submitBtn.disabled = false;
      showStatus(
        "Transmission complete ✔ — " + payload.name + ", I'll reply to " + payload.email + " soon.",
        "success"
      );
      form.reset();
    }, 1500);
  });

  /* =========================================================
     9. FOOTER — dynamic year
     ========================================================= */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();

