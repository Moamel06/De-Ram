// i18n runtime for De Ram website.
// Applies translations from translations.js to elements marked with [data-i18n].
// Persists the visitor's language choice across pages via localStorage.
(function () {
    var SUPPORTED_LANGS = ['nl', 'fr', 'de', 'en'];
    var DEFAULT_LANG = 'nl';
    var STORAGE_KEY = 'deram_lang';

    function getSavedLang() {
        try {
            var lang = localStorage.getItem(STORAGE_KEY);
            if (lang && SUPPORTED_LANGS.indexOf(lang) !== -1) {
                return lang;
            }
        } catch (e) {
            // localStorage unavailable (private mode, blocked storage, etc.) - fall through to default
        }
        return DEFAULT_LANG;
    }

    function saveLang(lang) {
        try {
            localStorage.setItem(STORAGE_KEY, lang);
        } catch (e) {
            // ignore - persistence is a nice-to-have, not required for the page to work
        }
    }

    function getTranslation(lang, key) {
        try {
            if (window.translations && window.translations[lang] && Object.prototype.hasOwnProperty.call(window.translations[lang], key)) {
                return window.translations[lang][key];
            }
            if (window.translations && window.translations[DEFAULT_LANG] && Object.prototype.hasOwnProperty.call(window.translations[DEFAULT_LANG], key)) {
                console.warn('[i18n] Missing key "' + key + '" for language "' + lang + '" - falling back to nl.');
                return window.translations[DEFAULT_LANG][key];
            }
        } catch (e) {
            console.warn('[i18n] Error looking up key "' + key + '":', e);
        }
        return null;
    }

    function applyTranslations(lang) {
        try {
            var elements = document.querySelectorAll('[data-i18n]');
            elements.forEach(function (el) {
                var key = el.getAttribute('data-i18n');
                if (!key) return;
                var value = getTranslation(lang, key);
                if (value === null) {
                    console.warn('[i18n] No translation found at all for key "' + key + '".');
                    return;
                }
                var tag = el.tagName.toLowerCase();
                if (tag === 'title') {
                    document.title = value;
                } else if (tag === 'meta') {
                    el.setAttribute('content', value);
                } else {
                    el.textContent = value;
                }
            });
        } catch (e) {
            console.warn('[i18n] Failed to apply translations:', e);
        }
    }

    function updateActiveButton(lang) {
        try {
            var buttons = document.querySelectorAll('.lang-btn');
            buttons.forEach(function (btn) {
                if (btn.getAttribute('data-lang') === lang) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        } catch (e) {
            console.warn('[i18n] Failed to update active language button:', e);
        }
    }

    function setLanguage(lang) {
        if (SUPPORTED_LANGS.indexOf(lang) === -1) lang = DEFAULT_LANG;
        applyTranslations(lang);
        updateActiveButton(lang);
        saveLang(lang);
    }

    function initLangSwitcher() {
        try {
            var buttons = document.querySelectorAll('.lang-btn');
            buttons.forEach(function (btn) {
                btn.addEventListener('click', function () {
                    var lang = btn.getAttribute('data-lang');
                    setLanguage(lang);
                });
            });
        } catch (e) {
            console.warn('[i18n] Failed to initialize language switcher:', e);
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        try {
            var lang = getSavedLang();
            applyTranslations(lang);
            updateActiveButton(lang);
            initLangSwitcher();
        } catch (e) {
            console.warn('[i18n] Initialization failed:', e);
        }
    });
})();
