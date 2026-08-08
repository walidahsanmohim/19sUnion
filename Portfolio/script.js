(function () {
  var $ = function (sel, el) {
    if (el === void 0) el = document;
    return el.querySelector(sel);
  };
  var $$ = function (sel, el) {
    if (el === void 0) el = document;
    return Array.prototype.slice.call(el.querySelectorAll(sel));
  };

  // Year
  var yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Smooth scroll with sticky offset
  var nav = $(".nav");
  function getOffset() {
    return nav ? nav.getBoundingClientRect().height + 10 : 84;
  }

  function smoothScrollToHash(hash) {
    if (!hash || hash === "#") return;
    var id = hash.replace("#", "");
    var target = document.getElementById(id);
    if (!target) return;
    var y = target.getBoundingClientRect().top + window.scrollY - getOffset();
    window.scrollTo({ top: y, behavior: "smooth" });
  }

  // Intercept in-page links
  var linkSelectors = [
    '.nav__link[href^="#"]',
    '.footer__links a[href^="#"]',
    '.link-card[href^="#"]',
    '.hero__cta a[href^="#"]'
  ].join(",");

  $$(linkSelectors).forEach(function (a) {
    a.addEventListener("click", function (e) {
      var href = a.getAttribute("href") || "";
      if (!href.startsWith("#")) return;
      e.preventDefault();
      smoothScrollToHash(href);

      var mobileMenu = $("#mobileMenu");
      if (mobileMenu && mobileMenu.hidden === false) mobileMenu.hidden = true;

      if (nav) nav.classList.remove("nav--open");
    });
  });

  // Landing hash
  if (window.location.hash) {
    setTimeout(function () {
      smoothScrollToHash(window.location.hash);
    }, 60);
  }

  // Scroll reveal
  var reduceMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var revealEls = $$(".reveal");
  if (revealEls.length) {
    if (reduceMotion) {
      revealEls.forEach(function (el) {
        el.classList.add("is-visible");
      });
    } else {
      var io = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.14, rootMargin: "0px 0px -10% 0px" }
      );

      revealEls.forEach(function (el) {
        io.observe(el);
      });
    }
  }

  // Active navbar highlighting
  var sectionIds = ["home", "projects", "services", "contact"];
  var navLinks = $$(".nav__link[data-section]");
  function setActive(id) {
    navLinks.forEach(function (l) {
      var sec = l.getAttribute("data-section");
      l.classList.toggle("is-active", sec === id);
    });
  }

  if (navLinks.length) {
    var sectionEls = sectionIds
      .map(function (id) {
        return document.getElementById(id);
      })
      .filter(Boolean);

    if (sectionEls.length) {
      if (reduceMotion) {
        // Simple fallback: set active based on scroll position
        var onScrollFallback = function () {
          var y = window.scrollY + getOffset();
          var best = "home";
          sectionEls.forEach(function (el) {
            if (el.offsetTop <= y) best = el.id;
          });
          setActive(best);
        };
        window.addEventListener("scroll", onScrollFallback, { passive: true });
        onScrollFallback();
      } else {
        var ioActive = new IntersectionObserver(
          function (entries) {
            var visible = entries.filter(function (e) { return e.isIntersecting; });
            if (!visible.length) return;
            visible.sort(function (a, b) {
              return (b.intersectionRatio || 0) - (a.intersectionRatio || 0);
            });
            var top = visible[0].target;
            if (top && top.id) setActive(top.id);
          },
          { threshold: [0.15, 0.25, 0.4], rootMargin: "-20% 0px -60% 0px" }
        );

        sectionEls.forEach(function (el) {
          ioActive.observe(el);
        });
      }
    }

    // Initial
    var initialId = window.location.hash ? window.location.hash.replace("#", "") : "home";
    setActive(initialId || "home");
  }

  // Burger toggle
  var burgerBtn = $("#burgerBtn");
  var mobileMenu = $("#mobileMenu");
  if (burgerBtn && mobileMenu) {
    burgerBtn.addEventListener("click", function () {
      var next = !mobileMenu.hidden;
      mobileMenu.hidden = next;

      if (nav) {
        if (next) nav.classList.remove("nav--open");
        else nav.classList.add("nav--open");
      }
    });

    document.addEventListener("click", function (e) {
      if (mobileMenu.hidden) return;
      var withinBurger = burgerBtn.contains(e.target);
      var withinMenu = mobileMenu.contains(e.target);
      if (!withinBurger && !withinMenu) {
        mobileMenu.hidden = true;
        if (nav) nav.classList.remove("nav--open");
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && mobileMenu && mobileMenu.hidden === false) {
        mobileMenu.hidden = true;
        if (nav) nav.classList.remove("nav--open");
      }
    });
  }

  // Theme toggle
  var themeToggle = $("#themeToggle");
  if (themeToggle) {
    var root = document.documentElement;
    var saved = localStorage.getItem("theme") || "dark";
    root.setAttribute("data-theme", saved === "light" ? "light" : "dark");

    var updateIcon = function () {
      var btnIcon = themeToggle.querySelector(".icon-btn__icon");
      if (!btnIcon) btnIcon = themeToggle.querySelector("span");
      if (!btnIcon) return;
      btnIcon.textContent = root.getAttribute("data-theme") === "light" ? "☀" : "◐";
    };

    updateIcon();

    themeToggle.addEventListener("click", function () {
      var cur = root.getAttribute("data-theme") === "light" ? "light" : "dark";
      var next = cur === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
      updateIcon();
    });
  }

  // Parallax vars (lightweight)
  if (!reduceMotion) {
    var raf = 0;
    window.addEventListener("pointermove", function (e) {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () {
        var x = e.clientX - window.innerWidth / 2;
        var y = e.clientY - window.innerHeight / 2;
        document.documentElement.style.setProperty("--cursor-x", x + "px");
        document.documentElement.style.setProperty("--cursor-y", y + "px");
      });
    }, { passive: true });

    window.addEventListener("scroll", function () {
      var y = window.scrollY || 0;
      document.documentElement.style.setProperty("--scroll-y", String(y));
    }, { passive: true });
  }

  // 3D pointer tilt for [data-tilt]
  var tiltEls = $$(".card[data-tilt], [data-tilt]");
  if (tiltEls.length) {
    // If reduced motion, just leave them as-is
    if (!reduceMotion) {
      var activeRaf = 0;
      var target = null;
      var lastRect = null;

      function applyTilt() {
        activeRaf = 0;
        if (!target || !lastRect) return;

        var cx = lastRect.left + lastRect.width / 2;
        var cy = lastRect.top + lastRect.height / 2;

        var dx = (lastPointerX - cx) / (lastRect.width / 2);
        var dy = (lastPointerY - cy) / (lastRect.height / 2);

        // Clamp to avoid extreme rotations
        dx = Math.max(-1, Math.min(1, dx));
        dy = Math.max(-1, Math.min(1, dy));

        var rotY = dx * 10;   // left/right
        var rotX = -dy * 8;   // up/down

        target.style.setProperty("--tilt-rotX", rotX.toFixed(2) + "deg");
        target.style.setProperty("--tilt-rotY", rotY.toFixed(2) + "deg");
        target.style.setProperty("--tilt-translateY", "-2px");
      }

      var lastPointerX = 0;
      var lastPointerY = 0;

      tiltEls.forEach(function (el) {
        // Ensure transform origin is centered
        el.style.transformOrigin = "center center";

        // Keep hover transform smooth: we handle transform on pointer events
        el.addEventListener("pointerenter", function (e) {
          target = el;
          lastRect = el.getBoundingClientRect();
        });

        el.addEventListener("pointermove", function (e) {
          lastPointerX = e.clientX;
          lastPointerY = e.clientY;
          lastRect = el.getBoundingClientRect();

          if (!activeRaf) activeRaf = requestAnimationFrame(applyTilt);
        });

        el.addEventListener("pointerleave", function () {
          target = null;
          lastRect = null;
          if (activeRaf) cancelAnimationFrame(activeRaf);
          activeRaf = 0;
          el.style.setProperty("--tilt-rotX", "0deg");
          el.style.setProperty("--tilt-rotY", "0deg");
          el.style.setProperty("--tilt-translateY", "0px");
        });
      });
    } else {
      tiltEls.forEach(function (el) {
        el.style.setProperty("--tilt-rotX", "0deg");
        el.style.setProperty("--tilt-rotY", "0deg");
        el.style.setProperty("--tilt-translateY", "0px");
      });
    }
  }

  // Custom cursor trailing
  var cursor = $(".cursor");
  var cursorTrail = $(".cursor--trail");
  if (cursor && cursorTrail && !reduceMotion) {
    var targetX = window.innerWidth / 2;
    var targetY = window.innerHeight / 2;
    var curX = targetX;
    var curY = targetY;

    var lerp = function (a, b, t) { return a + (b - a) * t; };

    window.addEventListener("pointermove", function (e) {
      targetX = e.clientX;
      targetY = e.clientY;
    }, { passive: true });

    function tick() {
      curX = lerp(curX, targetX, 0.18);
      curY = lerp(curY, targetY, 0.18);

      cursor.style.opacity = "1";
      cursor.style.left = targetX + "px";
      cursor.style.top = targetY + "px";

      cursorTrail.style.opacity = "1";
      cursorTrail.style.left = curX + "px";
      cursorTrail.style.top = curY + "px";

      requestAnimationFrame(tick);
    }
    tick();
  }

  // Contact form UX
  var form = $("#contactForm");
  if (form) {
    var hint = $("#formHint");
    var inputs = $$("input, textarea", form);

    function setError(fieldName, msg) {
      var input = $('[name="' + fieldName + '"]', form);
      if (!input) return;
      var err = $('[data-error-for="' + fieldName + '"]', form);
      if (!err) return;
      err.textContent = msg || "";
      input.classList.toggle("is-invalid", !!msg);
    }

    function getFieldValue(name) {
      var el = $('[name="' + name + '"]', form);
      return el ? (el.value || "").trim() : "";
    }

    // Tiny helper to support attribute selector inside the tiny $
    function getBySel(sel, rootEl) {
      return rootEl.querySelector(sel);
    }

    function validate() {
      var ok = true;

      var name = getFieldValue("name");
      var email = getFieldValue("email");
      var message = getFieldValue("message");

      var nameOk = name.length >= 2;
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      var msgOk = message.length >= 10;

      setError("name", nameOk ? "" : "Please enter your name.");
      setError("email", emailOk ? "" : "Please enter a valid email.");
      setError("message", msgOk ? "" : "Message must be at least 10 characters.");

      if (!nameOk || !emailOk || !msgOk) ok = false;
      return ok;
    }

    // Override setError to use correct selectors
    function setError2(fieldName, msg) {
      var input = getBySel('[name="' + fieldName + '"]', form);
      var err = getBySel('[data-error-for="' + fieldName + '"]', form);
      if (!input || !err) return;

      err.textContent = msg || "";
      input.classList.toggle("is-invalid", !!msg);
    }

    function validate2() {
      var name = getFieldValue("name");
      var email = getFieldValue("email");
      var message = getFieldValue("message");

      var nameOk = name.length >= 2;
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      var msgOk = message.length >= 10;

      setError2("name", nameOk ? "" : "Please enter your name.");
      setError2("email", emailOk ? "" : "Please enter a valid email.");
      setError2("message", msgOk ? "" : "Message must be at least 10 characters.");

      return nameOk && emailOk && msgOk;
    }

    inputs.forEach(function (el) {
      el.addEventListener("input", function () {
        validate2();
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!validate2()) {
        if (hint) hint.textContent = "Fix the highlighted fields and try again.";
        return;
      }

      var btn = $(".btn--primary", form);
      if (btn) btn.classList.add("is-sending");
      if (hint) hint.textContent = "Sending message...";

      setTimeout(function () {
        if (btn) btn.classList.remove("is-sending");
        if (hint) hint.textContent = "Message sent successfully. We will reach out soon.";

        // Reset UI
        form.reset();
        inputs.forEach(function (el) { el.classList.remove("is-invalid"); });

        ["name", "email", "message"].forEach(function (n) {
          var err = $('[data-error-for="' + n + '"]', form);
          if (err) err.textContent = "";
        });
      }, 1200);
    });
  }
})();
