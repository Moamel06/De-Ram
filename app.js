document.addEventListener('DOMContentLoaded', () => {
    // Header scroll effect
    const header = document.querySelector('header');
    const handleScroll = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on init

    // Mobile navigation toggle
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            // Change hamburger icon to X or vice versa
            const icon = menuToggle.querySelector('i');
            if (icon) {
                if (navLinks.classList.contains('active')) {
                    icon.className = 'fas fa-times';
                } else {
                    icon.className = 'fas fa-bars';
                }
            }
        });

        // Close mobile nav when clicking a link
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                if (icon) icon.className = 'fas fa-bars';
            });
        });
    }


    // Menu filtering logic (for menu.html)
    const filterButtons = document.querySelectorAll('.filter-btn');
    const menuItems = document.querySelectorAll('.menu-item');

    // Sauzen-vakjes en "inbegrepen"-info horen niet thuis in het "Alles"-overzicht:
    // die worden alleen getoond zodra je op de bijhorende categorie filtert.
    const isInfoOnlyItem = (item) => item.classList.contains('menu-sauzen-box') || item.classList.contains('menu-note-row') || item.classList.contains('menu-category-banner');

    if (filterButtons.length > 0 && menuItems.length > 0) {
        const applyFilter = (filterValue, animate) => {
            menuItems.forEach(item => {
                const itemCategory = item.getAttribute('data-category');
                const infoOnly = isInfoOnlyItem(item);
                const matches = infoOnly
                    ? itemCategory === filterValue
                    : (filterValue === 'all' || itemCategory === filterValue);

                const show = () => {
                    if (matches) {
                        item.style.display = 'flex';
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'translateY(0)';
                        }, 50);
                    } else {
                        item.style.display = 'none';
                    }
                };

                if (animate) {
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(15px)';
                    setTimeout(show, 300);
                } else {
                    if (!matches) {
                        item.style.display = 'none';
                    }
                }
            });

            // Losse "frieten/kroketten/puree/rijst/brood inbegrepen"-badge naast een sectietitel
            // (bv. Omeletten) blijft zichtbaar bij die categorie, maar niet bij "Alles".
            document.querySelectorAll('.menu-note-badge').forEach(badge => {
                badge.style.display = (filterValue === 'all') ? 'none' : '';
            });

            // Het "Sauzen & extra's" infoknopje hoort alleen thuis bij "Alles" —
            // bij een specifieke categorie staat de info al zelf tussen de gerechten.
            const infoRow = document.querySelector('.menu-info-trigger-row');
            if (infoRow) {
                infoRow.style.display = (filterValue === 'all') ? 'flex' : 'none';
            }
        };

        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                applyFilter(btn.getAttribute('data-filter'), true);
            });
        });

        // Initiële staat: standaard staat "Alles" actief, dus de info-only items meteen verbergen.
        applyFilter('all', false);

        // Check URL parameter for pre-filtering
        const urlParams = new URLSearchParams(window.location.search);
        let filterParam = urlParams.get('filter');
        if (filterParam) {
            // Map legacy aliases
            if (filterParam === 'mains') filterParam = 'warm';
            if (filterParam === 'drinks') filterParam = 'dranken';

            const targetBtn = Array.from(filterButtons).find(btn => btn.getAttribute('data-filter') === filterParam);
            if (targetBtn) {
                setTimeout(() => {
                    targetBtn.click();
                }, 50);
            }
        }
    }

    // Sauzen & extra's info pop-up (menu.html)
    const menuInfoBtn = document.getElementById('menuInfoBtn');
    const menuInfoModal = document.getElementById('menuInfoModal');
    const menuInfoBackdrop = document.getElementById('menuInfoBackdrop');
    const menuInfoClose = document.getElementById('menuInfoClose');

    if (menuInfoBtn && menuInfoModal) {
        const openModal = () => {
            menuInfoModal.hidden = false;
        };
        const closeModal = () => {
            menuInfoModal.hidden = true;
        };
        menuInfoBtn.addEventListener('click', openModal);
        if (menuInfoBackdrop) menuInfoBackdrop.addEventListener('click', closeModal);
        if (menuInfoClose) menuInfoClose.addEventListener('click', closeModal);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !menuInfoModal.hidden) closeModal();
        });
    }

    // Scroll Reveal implementation (Intersection Observer)
    const reveals = document.querySelectorAll('.reveal');
    if (reveals.length > 0) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target); // Reveal once
                }
            });
        }, {
            threshold: 0,
            rootMargin: '0px 0px 50px 0px'
        });

        reveals.forEach(el => revealObserver.observe(el));
    }
});
