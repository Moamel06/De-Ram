// De Ram Vercel build update: 2026-09-03
// Cookie / Google Maps consent handling for De Ram website.
// Google Maps embeds are not loaded until the visitor accepts (or interacts
// with an individual map placeholder), per GDPR guidance on non-essential
// third-party cookies. Choice is remembered in localStorage.
(function () {
    var STORAGE_KEY = 'deram_maps_consent'; // 'accepted' | 'declined'

    function getConsent() {
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch (e) {
            return null;
        }
    }

    function setConsent(value) {
        try {
            localStorage.setItem(STORAGE_KEY, value);
        } catch (e) {
            // ignore - a session-only choice is still better than nothing
        }
    }

    function loadMaps() {
        document.querySelectorAll('.map-wrapper iframe[data-src]').forEach(function (iframe) {
            if (!iframe.getAttribute('src')) {
                iframe.setAttribute('src', iframe.getAttribute('data-src'));
            }
        });
        document.querySelectorAll('.map-consent-overlay').forEach(function (overlay) {
            overlay.style.display = 'none';
        });
    }

    function hideBanner() {
        var banner = document.getElementById('cookieBanner');
        if (banner) banner.hidden = true;
    }

    function showBanner() {
        var banner = document.getElementById('cookieBanner');
        if (banner) banner.hidden = false;
    }

    document.addEventListener('DOMContentLoaded', function () {
        var consent = getConsent();

        if (consent === 'accepted') {
            loadMaps();
        } else if (consent === null) {
            showBanner();
        }
        // consent === 'declined': keep banner hidden and maps as click-to-load placeholders

        var acceptBtn = document.getElementById('cookieAcceptBtn');
        if (acceptBtn) {
            acceptBtn.addEventListener('click', function () {
                setConsent('accepted');
                hideBanner();
                loadMaps();
            });
        }

        var declineBtn = document.getElementById('cookieDeclineBtn');
        if (declineBtn) {
            declineBtn.addEventListener('click', function () {
                setConsent('declined');
                hideBanner();
            });
        }

        document.querySelectorAll('.map-consent-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                setConsent('accepted');
                hideBanner();
                loadMaps();
            });
        });
    });
})();
