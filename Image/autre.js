        // Slider Navigation
        function scrollSlider(id, distance) {
            const slider = document.getElementById(id);
            slider.scrollBy({ left: distance, behavior: 'smooth' });
        }

        // LOGIQUE D'AFFICHAGE TOTAL DE L'IMAGE
        function openLightbox(src) {
            const lightbox = document.getElementById('lightbox');
            const img = document.getElementById('lightbox-img');
            img.src = src;
            lightbox.classList.remove('hidden'); // On affiche la div
            document.body.style.overflow = 'hidden'; // On empêche de scroller derrière
        }

        function closeLightbox() {
            const lightbox = document.getElementById('lightbox');
            lightbox.classList.add('hidden'); // On cache la div
            document.body.style.overflow = 'auto'; // On réactive le scroll
        }

        // Fermer si on clique sur le fond noir
        document.getElementById('lightbox').onclick = function(e) {
            if(e.target === this) closeLightbox();
        };

        // Menu Mobile & Theme
        document.addEventListener('DOMContentLoaded', () => {
            const menuBtn = document.getElementById('menu-btn');
            const closeBtn = document.getElementById('close-btn');
            const mobileMenu = document.getElementById('mobile-menu');
            if(menuBtn) menuBtn.onclick = () => mobileMenu.classList.add('active');
            if(closeBtn) closeBtn.onclick = () => mobileMenu.classList.remove('active');

            const themeToggleBtn = document.getElementById('theme-toggle-btn');
            const themeSidebar = document.getElementById('theme-sidebar');
            const accentPicker = document.getElementById('accent-picker');
            const bgPicker = document.getElementById('bg-picker');

            if(themeToggleBtn) {
                themeToggleBtn.onclick = (e) => { e.stopPropagation(); themeSidebar.classList.toggle('active'); };
            }
// Close personalization menu when clicking anywhere else on the site
document.addEventListener('click', (event) => {
    const themeSidebar = document.getElementById('theme-sidebar');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');

    // Check if the sidebar is currently open
    if (themeSidebar.classList.contains('active')) {
        // If the click is NOT on the sidebar AND not on the button that opens it
        if (!themeSidebar.contains(event.target) && !themeToggleBtn.contains(event.target)) {
            themeSidebar.classList.remove('active');
        }
    }
});
            accentPicker.oninput = (e) => setAccent(e.target.value, hexToRgb(e.target.value));
            bgPicker.oninput = (e) => setBg(e.target.value);
        });

        function setAccent(color, rgb) {
            document.documentElement.style.setProperty('--primary', color);
            document.documentElement.style.setProperty('--primary-rgb', rgb);
        }

        function setBg(color) {
            document.documentElement.style.setProperty('--bg-custom', color);
        }

        function hexToRgb(hex) {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `${r}, ${g}, ${b}`;
        }
        // Function to remove the loading screen
        function removePreloader() {
            const loader = document.getElementById('preloader');
            if (loader) {
                loader.classList.add('preloader-hidden');
                document.body.classList.remove('is-loading');
            }
        }

        // 1. Force remove if the site takes too long (5-second safety net)
        const safetyTimeout = setTimeout(removePreloader, 5000);

        // 2. Remove normally when EVERYTHING is loaded
        window.addEventListener('load', function() {
            clearTimeout(safetyTimeout); // Cancel the 5s timer if it loads faster
            setTimeout(removePreloader, 800); // Small extra delay for a smooth feel
        });

        // Set the initial state
        document.body.classList.add('is-loading');
        // Goodbye Logic
document.addEventListener('mouseleave', (e) => {
    // Check if the mouse actually left the top of the window
    if (e.clientY <= 0) {
        const goodbye = document.getElementById('goodbye-overlay');
        goodbye.classList.remove('hidden');
        
        // Optional: Hide it again after 3 seconds if they don't actually leave
        setTimeout(() => {
            goodbye.classList.add('hidden');
        }, 3000);
    }
}, { once: true }); // 'once: true' ensures it only happens once per session
