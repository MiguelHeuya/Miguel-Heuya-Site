                document.addEventListener("DOMContentLoaded", function() {
                    const skillBars = document.querySelectorAll('.skill-bar');

                    const observerOptions = {
                        root: null,
                        threshold: 0.1 // Déclenche dès que 10% de la barre est visible
                    };

                    const observer = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            const bar = entry.target;
                            
                            if (entry.isIntersecting) {
                                // Quand la barre entre dans l'écran (haut ou bas)
                                const progress = bar.getAttribute('data-progress');
                                bar.style.width = progress;
                            } else {
                                // Quand la barre sort de l'écran, on la remet à zéro
                                bar.style.width = '0%';
                            }
                        });
                    }, observerOptions);

                    skillBars.forEach(bar => {
                        observer.observe(bar);
                    });
                });