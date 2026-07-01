/* ============================================================================
 * RAD BMX Builds — client JS
 * ----------------------------------------------------------------------------
 * Single responsibility at v1: mobile menu toggle.
 *
 * Behavior:
 *   - Click on .nav-toggle flips aria-expanded and toggles a data-menu-open
 *     attribute on #primary-nav (CSS handles the visual reveal).
 *   - ESC while the menu is open closes it and restores focus to the toggle.
 *   - Focus is NOT trapped inside the menu (acceptable at v1).
 *
 * Defensive principles:
 *   - Bail silently if either DOM node is missing (pages without a nav,
 *     pre-DOM snapshot tests, etc.) — never throw.
 *   - No console output, no network requests, no analytics.
 *   - No PII logged.
 * ========================================================================== */

(function () {
  "use strict";

  function init() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("primary-nav");

    // Fail-fast: if the header/nav isn't on this page, do nothing.
    if (!toggle || !nav) {
      return;
    }

    function isOpen() {
      return nav.hasAttribute("data-menu-open");
    }

    function openMenu() {
      nav.setAttribute("data-menu-open", "");
      toggle.setAttribute("aria-expanded", "true");
    }

    function closeMenu() {
      nav.removeAttribute("data-menu-open");
      toggle.setAttribute("aria-expanded", "false");
    }

    toggle.addEventListener("click", function () {
      if (isOpen()) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && isOpen()) {
        closeMenu();
        // Return focus to the toggle so keyboard users don't lose place.
        toggle.focus();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
