/* ============================================================
   MERCY HABESHA GOLD — script.js
   Vanilla JavaScript only. No dependencies.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Element references ---------- */
  var header = document.getElementById("header");
  var hamburger = document.getElementById("hamburger");
  var mobileMenu = document.getElementById("mobileMenu");
  var body = document.body;

  /* ============================================================
     1. HEADER SCROLL BEHAVIOUR
     Adds .scrolled once the user moves past the hero top area.
     ============================================================ */
  function handleHeaderScroll() {
    if (window.scrollY > 60) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }
  window.addEventListener("scroll", handleHeaderScroll, { passive: true });
  handleHeaderScroll(); // run once on load

  /* ============================================================
     2. MOBILE MENU — open / close / scroll lock / accessibility
     ============================================================ */
  function openMenu() {
    mobileMenu.classList.add("open");
    mobileMenu.setAttribute("aria-hidden", "false");
    hamburger.classList.add("active");
    hamburger.setAttribute("aria-expanded", "true");
    hamburger.setAttribute("aria-label", "Close menu");
    body.classList.add("no-scroll");            // body scroll lock
  }

  function closeMenu() {
    mobileMenu.classList.remove("open");
    mobileMenu.setAttribute("aria-hidden", "true");
    hamburger.classList.remove("active");
    hamburger.setAttribute("aria-expanded", "false");
    hamburger.setAttribute("aria-label", "Open menu");
    body.classList.remove("no-scroll");
  }

  function toggleMenu() {
    if (mobileMenu.classList.contains("open")) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", toggleMenu);

    // Close menu when any mobile link is selected
    var mobileLinks = mobileMenu.querySelectorAll("a");
    mobileLinks.forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    // Close menu with Escape key
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && mobileMenu.classList.contains("open")) {
        closeMenu();
        hamburger.focus(); // return focus for keyboard users
      }
    });
  }

  /* ============================================================
     3. SMOOTH SCROLL WITH HEADER OFFSET
     Native smooth-scroll can hide headings behind the fixed
     header, so we offset by the header height.
     ============================================================ */
  var navAnchors = document.querySelectorAll('a[href^="#"]');

  navAnchors.forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var targetId = anchor.getAttribute("href");
      if (targetId === "#" || targetId.length < 2) { return; }

      var target = document.querySelector(targetId);
      if (!target) { return; }

      e.preventDefault();

      var headerHeight = header ? header.offsetHeight : 0;
      var targetTop =
        target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 8;

      var reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      window.scrollTo({
        top: targetTop < 0 ? 0 : targetTop,
        behavior: reduceMotion ? "auto" : "smooth"
      });
    });
  });

  /* ============================================================
     4. DYNAMIC FOOTER YEAR
     ============================================================ */
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ============================================================
     5. INTERSECTION OBSERVER — subtle reveal on scroll
     ============================================================ */
  var revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && revealEls.length) {
    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target); // reveal once
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback: show everything if unsupported
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ============================================================
     6. VIDEO ERROR / FALLBACK HANDLING
     If a background video fails to load or play, we add a
     class so CSS reveals the poster/fallback image.
     ============================================================ */
  function attachVideoFallback(videoId, sectionSelector) {
    var video = document.getElementById(videoId);
    if (!video) { return; }

    var section = video.closest(sectionSelector);
    if (!section) { return; }

    function markError() {
      section.classList.add("video-error");
    }

    // Native media error event
    video.addEventListener("error", markError);

    // Error on the <source> element
    var source = video.querySelector("source");
    if (source) {
      source.addEventListener("error", markError);
    }

    // Attempt to (re)play; some mobile browsers pause autoplay
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        /* Autoplay blocked — poster remains visible, no error state needed */
      });
    }

    // If, after load, the video has no valid dimensions, treat as failed
    video.addEventListener("loadeddata", function () {
      if (video.videoWidth === 0) {
        markError();
      }
    });
  }

  attachVideoFallback("heroVideo", ".hero");
  attachVideoFallback("aboutVideo", ".about");

  /* ============================================================
     7. COLLECTIONS — "View All" toggle
     Reveals / hides the last two collection cards on the same
     page (no navigation, no modal). Keeps aria-expanded in sync.
     ============================================================ */
  var collectionToggle = document.getElementById("collectionToggle");
  var extraCards = [
    document.getElementById("card-05"),
    document.getElementById("card-06")
  ].filter(Boolean);

  if (collectionToggle && extraCards.length) {
    collectionToggle.addEventListener("click", function () {
      var expanded = collectionToggle.getAttribute("aria-expanded") === "true";

      if (expanded) {
        // Collapse
        extraCards.forEach(function (card) {
          card.classList.remove("card--revealing");
          card.classList.add("is-collapsed");
        });
        collectionToggle.setAttribute("aria-expanded", "false");
        collectionToggle.textContent = "View All Collections";
      } else {
        // Reveal
        extraCards.forEach(function (card) {
          card.classList.remove("is-collapsed");
          card.classList.remove("card--revealing");
          void card.offsetWidth; // force reflow so the reveal animation replays
          card.classList.add("card--revealing");
        });
        collectionToggle.setAttribute("aria-expanded", "true");
        collectionToggle.textContent = "Show Less";
      }
    });
  }

})();
