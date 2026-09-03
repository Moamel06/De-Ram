// De Ram Vercel build update: 2026-09-03 v2
/**
 * announcement.js — Sanity-powered announcement banner
 *
 * SECURITY:
 *   - Uses the public read-only CDN (apicdn.sanity.io) — no tokens exposed.
 *   - All DOM writes use .textContent — never .innerHTML — to prevent XSS.
 *   - Input length is validated client-side as defense-in-depth.
 *
 * CONFIGURATION:
 *   Replace PROJECT_ID and DATASET below with your Sanity project values.
 */
(function () {
  'use strict';

  // ──────────────────────────────────────────────
  //  Configuration — replace with your own values
  // ──────────────────────────────────────────────
  const SANITY_PROJECT_ID = 'd5gmzt19';   // e.g. 'abc123xy'
  const SANITY_DATASET    = 'production';         // or 'staging', etc.
  const SANITY_API_VERSION = '2024-01-01';        // locked API version

  // ──────────────────────────────────────────────
  //  Validation limits (mirror schema rules)
  // ──────────────────────────────────────────────
  const MAX_TITLE_LENGTH = 120;
  const MAX_DESC_LENGTH  = 300;

  // ──────────────────────────────────────────────
  //  GROQ query — fetch the newest active announcement
  // ──────────────────────────────────────────────
  const QUERY = encodeURIComponent(
    '*[_type == "announcement" && isActive == true] | order(_updatedAt desc)[0]{ title, description }'
  );

  // Build the API URL (proxied via /api/announcement on Vercel to avoid CORS issues)
  const API_URL = (typeof window !== 'undefined' && window.location && window.location.protocol.startsWith('http'))
    ? '/api/announcement'
    : `https://${SANITY_PROJECT_ID}.apicdn.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}?query=${QUERY}`;

  // ──────────────────────────────────────────────
  //  DOM references
  // ──────────────────────────────────────────────
  const banner     = document.getElementById('announcementBanner');
  const titleEl    = document.getElementById('announcementTitle');
  const descEl     = document.getElementById('announcementDesc');
  const dismissBtn = document.getElementById('announcementDismiss');

  // Guard: if banner markup is not present on this page, bail out
  if (!banner || !titleEl || !descEl || !dismissBtn) return;

  // ──────────────────────────────────────────────
  //  Session dismissal — uses sessionStorage so
  //  the banner re-appears on new sessions
  // ──────────────────────────────────────────────
  const DISMISSED_KEY = 'announcement_dismissed';

  function isDismissed(announcementId) {
    try {
      return sessionStorage.getItem(DISMISSED_KEY) === announcementId;
    } catch (_) {
      return false; // private browsing / storage unavailable
    }
  }

  function markDismissed(announcementId) {
    try {
      sessionStorage.setItem(DISMISSED_KEY, announcementId);
    } catch (_) {
      // Fail silently
    }
  }

  // ──────────────────────────────────────────────
  //  Sanitise & truncate helper (defense-in-depth)
  // ──────────────────────────────────────────────
  function sanitise(text, maxLength) {
    if (typeof text !== 'string') return '';
    const cleaned = text.trim().slice(0, maxLength);
    return cleaned.replace(/\bsezien\b/gi, 'seizoen').replace(/\bseizien\b/gi, 'seizoen');
  }

  // ──────────────────────────────────────────────
  //  Show banner with animation
  // ──────────────────────────────────────────────
  function showBanner() {
    banner.style.display = 'block';
    document.body.classList.add('has-announcement');
    // Trigger reflow so the CSS transition plays
    void banner.offsetHeight;
    banner.classList.add('visible');
  }

  // ──────────────────────────────────────────────
  //  Hide banner with animation
  // ──────────────────────────────────────────────
  function hideBanner(announcementId) {
    banner.classList.remove('visible');
    document.body.classList.remove('has-announcement');
    banner.addEventListener('transitionend', function handler() {
      banner.style.display = 'none';
      banner.removeEventListener('transitionend', handler);
    });
    if (announcementId) {
      markDismissed(announcementId);
    }
  }

  // ──────────────────────────────────────────────
  //  Fetch & render
  // ──────────────────────────────────────────────
  async function loadAnnouncement() {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) return;

      const json = await response.json();
      const data = json.result;

      // No active announcement found
      if (!data || !data.title) return;

      // Build a stable ID from the title for dismissal tracking
      const announcementId = btoa(unescape(encodeURIComponent(data.title))).slice(0, 32);

      // If the user already dismissed this specific announcement, don't show
      if (isDismissed(announcementId)) return;

      // ── Safely inject content via .textContent (XSS-safe) ──
      titleEl.textContent = sanitise(data.title, MAX_TITLE_LENGTH);

      if (data.description) {
        descEl.textContent = sanitise(data.description, MAX_DESC_LENGTH);
        descEl.style.display = 'inline';
      } else {
        descEl.style.display = 'none';
      }

      // ── Dismiss button ──
      dismissBtn.addEventListener('click', function () {
        hideBanner(announcementId);
      });

      // ── Reveal the banner ──
      showBanner();

    } catch (error) {
      // Network failure or JSON parse error — fail silently
      console.warn('[Announcement] Failed to load:', error.message);
    }
  }

  // ──────────────────────────────────────────────
  //  Initialise when the DOM is ready
  // ──────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAnnouncement);
  } else {
    loadAnnouncement();
  }
})();
