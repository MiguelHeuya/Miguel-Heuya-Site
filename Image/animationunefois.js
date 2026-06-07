    const themeBtn = document.getElementById('theme-toggle-btn');

themeBtn.addEventListener('click', function() {
    // Ajoute la classe qui coupe l'animation
    this.classList.add('stop-animation');
    
    // Ton code existant pour changer le thème ici...
    console.log("Animation stoppée et thème activé.");
});