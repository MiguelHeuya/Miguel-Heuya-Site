
                document.addEventListener("DOMContentLoaded", function() {
                    const bars = document.querySelectorAll('.animated-bar');

                    const observerOptions = {
                        root: null,
                        threshold: 0.2 // Se déclenche quand 20% de l'élément est visible
                    };

                    const observer = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            const bar = entry.target;
                            
                            if (entry.isIntersecting) {
                                // Remplit la barre quand elle entre dans l'écran
                                const targetWidth = bar.getAttribute('data-progress');
                                bar.style.width = targetWidth;
                            } else {
                                // Vide la barre quand elle sort de l'écran (permet l'effet infini)
                                bar.style.width = '0%';
                            }
                        });
                    }, observerOptions);

                    bars.forEach(bar => {
                        observer.observe(bar);
                    });
                });