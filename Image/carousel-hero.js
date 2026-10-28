document.addEventListener('DOMContentLoaded', function () {
  const image = document.querySelector('.hero-visual img');

  if (!image) return;

  const images = [
    'Image/image_droite_entete.png',
    'Image/image_droite_entete_1.png',
    'Image/image_droite_entete_2.png',
    'Image/image_droite_entete_3.png'
  ];

  let currentIndex = 0;
  let isTransitioning = false;

  // Précharger les images pour éviter les délais d'affichage
  images.forEach(function (src) {
    const preload = new Image();
    preload.src = src;
  });

  function changeImage() {
    if (isTransitioning) return;

    isTransitioning = true;
    image.classList.add('is-transitioning');

    setTimeout(function () {
      currentIndex = (currentIndex + 1) % images.length;

      image.src = images[currentIndex];

      image.onload = function () {
        image.classList.remove('is-transitioning');
        isTransitioning = false;
      };

      // Évite de rester bloqué si une image ne se charge pas
      image.onerror = function () {
        image.classList.remove('is-transitioning');
        isTransitioning = false;
      };
    }, 700);
  }

  // Changer d'image toutes les 5 secondes
  setInterval(changeImage, 5000);
});