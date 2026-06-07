    document.addEventListener('DOMContentLoaded', () => {
        // Elements
        const menuBtn = document.getElementById('menu-btn');
        const closeBtn = document.getElementById('close-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        const themeToggleBtn = document.getElementById('theme-toggle-btn');
        const themeSidebar = document.getElementById('theme-sidebar');
        const accentPicker = document.getElementById('accent-picker');
        const bgPicker = document.getElementById('bg-picker');

        // --- MOBILE MENU ---
        if (menuBtn && mobileMenu) {
            menuBtn.addEventListener('click', () => {
                mobileMenu.classList.add('active');
            });
        }

        if (closeBtn && mobileMenu) {
            closeBtn.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
            });
        }

        // --- THEME SIDEBAR ---
        if (themeToggleBtn && themeSidebar) {
            themeToggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                themeSidebar.classList.toggle('active');
            });
        }

        // Close when clicking outside
        document.addEventListener('click', (event) => {
            if (themeSidebar && themeSidebar.classList.contains('active')) {
                if (!themeSidebar.contains(event.target) && !themeToggleBtn.contains(event.target)) {
                    themeSidebar.classList.remove('active');
                }
            }
        });

        // --- COLOR PICKERS ---
        if (accentPicker) {
            accentPicker.addEventListener('input', (e) => {
                const color = e.target.value;
                document.documentElement.style.setProperty('--primary', color);
                // Convert Hex to RGB for glass effects
                const r = parseInt(color.slice(1, 3), 16);
                const g = parseInt(color.slice(3, 5), 16);
                const b = parseInt(color.slice(5, 7), 16);
                document.documentElement.style.setProperty('--primary-rgb', `${r}, ${g}, ${b}`);
            });
        }

        if (bgPicker) {
            bgPicker.addEventListener('input', (e) => {
                document.documentElement.style.setProperty('--bg-custom', e.target.value);
            });
        }
    });
    